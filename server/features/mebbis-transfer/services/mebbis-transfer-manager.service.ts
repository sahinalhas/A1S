import { MEBBISAutomationService } from './mebbis-automation.service.js';
import { MEBBISDataMapper } from './mebbis-data-mapper.service.js';
import { getSessionsBySchool } from '../../counseling-sessions/repository/counseling-sessions.repository.js';
import getDatabase from '../../../lib/database.js';
import type {
  MEBBISTransferProgress,
  MEBBISTransferError,
  StartTransferRequest
} from '@shared/types/mebbis-transfer.types';
import { logger } from '../../../utils/logger.js';
import type { Server as SocketIOServer } from 'socket.io';

interface TransferState {
  transferId: string;
  schoolId: string;
  status: 'pending' | 'running' | 'completed' | 'cancelled' | 'error';
  progress: MEBBISTransferProgress;
  errors: MEBBISTransferError[];
  startTime: number;
  cancelled: boolean;
}

export class MEBBISTransferManager {
  private activeTransfers = new Map<string, TransferState>();
  private automation: MEBBISAutomationService;
  private mapper: MEBBISDataMapper;
  private io: SocketIOServer | null = null;

  constructor() {
    this.automation = new MEBBISAutomationService();
    this.mapper = new MEBBISDataMapper();
  }

  setSocketIO(io: SocketIOServer): void {
    this.io = io;
  }

  async startTransfer(transferId: string, request: StartTransferRequest): Promise<void> {
    const sessions = this.getSessionsToTransfer(request);

    if (sessions.length === 0) {
      throw new Error('Aktarılacak görüşme bulunamadı');
    }

    const transferState: TransferState = {
      transferId,
      schoolId: request.schoolId,
      status: 'pending',
      progress: {
        total: sessions.length,
        completed: 0,
        failed: 0,
        current: 0
      },
      errors: [],
      startTime: Date.now(),
      cancelled: false
    };

    this.activeTransfers.set(transferId, transferState);

    this.runTransfer(transferId, sessions).catch((error) => {
      const err = error as Error;
      logger.error(`Transfer ${transferId} failed`, 'MEBBISTransferManager', error);
      transferState.status = 'error';
      this.emitError(transferId, err.message);
    });
  }

  private async runTransfer(transferId: string, sessions: any[]): Promise<void> {
    const transferState = this.activeTransfers.get(transferId);
    if (!transferState) return;

    const startTime = Date.now();
    try {
      transferState.status = 'running';
      this.emitProgress(transferId);

      logger.info(
        `Starting transfer ${transferId} for ${sessions.length} sessions`,
        'MEBBISTransferManager',
        { transferId, sessionCount: sessions.length }
      );

      // Database'den okulun kurum kodunu ve adını al
      const db = getDatabase();
      const school = db.prepare('SELECT code, name FROM schools WHERE id = ?').get(transferState.schoolId) as { code: string | null; name: string } | undefined;
      const schoolCode = school?.code || null;
      const schoolName = school?.name || null;

      if (!schoolCode) {
        logger.warn(`School ${transferState.schoolId} has no kurum kodu set, will try to match by school name: ${schoolName}`, 'MEBBISTransferManager');
      } else {
        logger.info(`Using kurum kodu ${schoolCode} for MEBBIS school selection`, 'MEBBISTransferManager');
      }

      // Set school code and name on automation service for school selection during QR login
      this.automation.setSchoolCode(schoolCode, schoolName);

      logger.info('Initializing browser...', 'MEBBISTransferManager');
      await this.automation.initialize();

      this.emitStatus(transferId, 'waiting_qr', 'QR kod girişi bekleniyor...');
      logger.info('Waiting for QR code login...', 'MEBBISTransferManager');
      await this.automation.waitForLogin();

      this.emitStatus(transferId, 'running', 'Veri giriş sayfasına yönlendiriliyor...');
      logger.info('Navigating to data entry page...', 'MEBBISTransferManager');
      await this.automation.navigateToDataEntry();

      // Separate individual and group sessions
      const individualSessions = sessions.filter(s => s.sessionType === 'individual');
      const groupSessionsRaw = sessions.filter(s => s.sessionType === 'group');

      // Group the group sessions by session ID (multiple students per group session)
      const groupSessionsMap = new Map<string, any[]>();
      for (const session of groupSessionsRaw) {
        if (!groupSessionsMap.has(session.id)) {
          groupSessionsMap.set(session.id, []);
        }
        groupSessionsMap.get(session.id)!.push(session);
      }

      const totalOperations = individualSessions.length + groupSessionsMap.size;
      logger.info(`Processing ${individualSessions.length} individual sessions and ${groupSessionsMap.size} group sessions...`, 'MEBBISTransferManager');

      let operationIndex = 0;

      // Process individual sessions first
      for (const session of individualSessions) {
        if (transferState.cancelled) {
          logger.info(`Transfer ${transferId} cancelled by user`, 'MEBBISTransferManager');
          break;
        }

        operationIndex++;
        transferState.progress.current = operationIndex;
        this.emitProgress(transferId);

        await this.processIndividualSession(transferId, session, operationIndex, totalOperations, transferState);
      }

      // Process group sessions
      for (const [sessionId, studentsInGroup] of groupSessionsMap) {
        if (transferState.cancelled) {
          logger.info(`Transfer ${transferId} cancelled by user`, 'MEBBISTransferManager');
          break;
        }

        operationIndex++;
        transferState.progress.current = operationIndex;
        this.emitProgress(transferId);

        await this.processGroupSession(transferId, sessionId, studentsInGroup, operationIndex, totalOperations, transferState);
      }

      // Old loop removed - individual and group sessions are now processed above

      transferState.status = transferState.cancelled ? 'cancelled' : 'completed';
      const totalDuration = Date.now() - startTime;
      const avgTimePerSession = sessions.length > 0 ? totalDuration / sessions.length : 0;

      const summary = {
        total: transferState.progress.total,
        successful: transferState.progress.completed,
        failed: transferState.progress.failed,
        errors: transferState.errors,
        duration: totalDuration
      };

      this.emitTransferCompleted(transferId, summary);

      await this.automation.close();

      logger.info(
        `Transfer ${transferId} completed: ${transferState.progress.completed} successful, ${transferState.progress.failed} failed, ` +
        `total duration: ${(totalDuration / 1000).toFixed(2)}s, avg per session: ${(avgTimePerSession / 1000).toFixed(2)}s`,
        'MEBBISTransferManager',
        summary
      );
    } catch (error) {
      const err = error as Error;
      logger.error(`Transfer ${transferId} failed`, 'MEBBISTransferManager', error);
      transferState.status = 'error';
      this.emitError(transferId, err.message);
      await this.automation.close();
    }
  }

  /**
   * Processes a single individual session transfer.
   */
  private async processIndividualSession(
    transferId: string,
    session: any,
    index: number,
    total: number,
    transferState: TransferState
  ): Promise<void> {
    const sessionStartTime = Date.now();

    try {
      logger.info(
        `[${index}/${total}] Processing individual session ${session.id} for student ${session.studentNo}`,
        'MEBBISTransferManager'
      );

      const mebbisData = this.mapper.mapSessionToMEBBIS(session);

      this.emitSessionStart(transferId, {
        sessionId: session.id,
        studentNo: session.studentNo,
        studentName: session.studentName
      });

      const result = await this.automation.fillSessionData(mebbisData);
      const sessionDuration = Date.now() - sessionStartTime;

      if (result.success) {
        await this.markAsTransferred(session.id, transferState.schoolId);
        transferState.progress.completed++;

        logger.info(
          `[${index}/${total}] Individual session ${session.id} completed in ${sessionDuration}ms`,
          'MEBBISTransferManager'
        );

        this.emitSessionCompleted(transferId, {
          sessionId: session.id,
          studentNo: session.studentNo,
          success: true
        });
      } else {
        transferState.progress.failed++;
        await this.logError(session.id, result.error || 'Bilinmeyen hata', transferState.schoolId);

        const error: MEBBISTransferError = {
          sessionId: session.id,
          studentNo: session.studentNo,
          error: result.error || 'Bilinmeyen hata',
          timestamp: new Date().toISOString()
        };
        transferState.errors.push(error);
        this.emitSessionFailed(transferId, error);
      }
    } catch (error) {
      const err = error as Error;
      transferState.progress.failed++;
      await this.logError(session.id, err.message, transferState.schoolId);

      const errorObj: MEBBISTransferError = {
        sessionId: session.id,
        studentNo: session.studentNo,
        error: err.message,
        timestamp: new Date().toISOString()
      };
      transferState.errors.push(errorObj);
      this.emitSessionFailed(transferId, errorObj);
    }

    this.emitProgress(transferId);
  }

  /**
   * Processes a group session transfer (multiple students in one session).
   */
  private async processGroupSession(
    transferId: string,
    sessionId: string,
    studentsInGroup: any[],
    index: number,
    total: number,
    transferState: TransferState
  ): Promise<void> {
    const sessionStartTime = Date.now();
    const firstStudent = studentsInGroup[0]; // Use first student's data for session info

    try {
      logger.info(
        `[${index}/${total}] Processing group session ${sessionId} with ${studentsInGroup.length} students`,
        'MEBBISTransferManager'
      );

      // Emit session start with group info
      this.emitSessionStart(transferId, {
        sessionId: sessionId,
        studentNo: `Grup (${studentsInGroup.length} öğrenci)`,
        studentName: studentsInGroup.map(s => s.studentName).join(', ')
      });

      // Switch to group mode
      await this.automation.selectGroupMode();

      // Prepare students with class info
      const studentsWithClass = studentsInGroup.map(s => ({
        studentNo: s.studentNo,
        className: s.studentClass || ''
      }));

      // Add all students to the group
      const { added, failed } = await this.automation.addStudentsToGroupSession(studentsWithClass);

      if (added.length === 0) {
        throw new Error(`Hiçbir öğrenci gruba eklenemedi. Başarısız: ${failed.join(', ')}`);
      }

      if (failed.length > 0) {
        logger.warn(`Some students could not be added to group: ${failed.join(', ')}`, 'MEBBISTransferManager');
      }

      // Click continue to go to form
      await this.automation.clickContinueButton();

      // Map session data and fill the form
      const mebbisData = this.mapper.mapSessionToMEBBIS(firstStudent);
      const result = await this.automation.fillGroupSessionForm(mebbisData);
      const sessionDuration = Date.now() - sessionStartTime;

      if (result.success) {
        await this.markAsTransferred(sessionId, transferState.schoolId);
        transferState.progress.completed++;

        logger.info(
          `[${index}/${total}] Group session ${sessionId} completed in ${sessionDuration}ms (${added.length} students)`,
          'MEBBISTransferManager'
        );

        this.emitSessionCompleted(transferId, {
          sessionId: sessionId,
          studentNo: `Grup (${added.length} öğrenci)`,
          success: true
        });
      } else {
        transferState.progress.failed++;
        await this.logError(sessionId, result.error || 'Grup kaydı başarısız', transferState.schoolId);

        const error: MEBBISTransferError = {
          sessionId: sessionId,
          studentNo: `Grup (${studentsInGroup.length} öğrenci)`,
          error: result.error || 'Grup kaydı başarısız',
          timestamp: new Date().toISOString()
        };
        transferState.errors.push(error);
        this.emitSessionFailed(transferId, error);
      }
    } catch (error) {
      const err = error as Error;
      const sessionDuration = Date.now() - sessionStartTime;

      logger.error(
        `[${index}/${total}] Group session ${sessionId} failed after ${sessionDuration}ms: ${err.message}`,
        'MEBBISTransferManager',
        error
      );

      transferState.progress.failed++;
      await this.logError(sessionId, err.message, transferState.schoolId);

      const errorObj: MEBBISTransferError = {
        sessionId: sessionId,
        studentNo: `Grup (${studentsInGroup.length} öğrenci)`,
        error: err.message,
        timestamp: new Date().toISOString()
      };
      transferState.errors.push(errorObj);
      this.emitSessionFailed(transferId, errorObj);
    }

    this.emitProgress(transferId);
  }

  private getSessionsToTransfer(request: StartTransferRequest): any[] {
    if (!request.schoolId) {
      throw new Error('schoolId is required for MEBBIS transfer - security violation');
    }

    const db = getDatabase();

    let query = `
      SELECT 
        cs.id,
        cs.sessionType,
        cs.sessionDate,
        cs.entryTime,
        cs.exitTime,
        cs.topic,
        cs.sessionDetails,
        cs.detailedNotes,
        cs.mebbis_transferred,
        cs.drpHizmetAlaniId,
        cs.drpBirId,
        cs.drpIkiId,
        cs.drpUcId,
        s.id as studentNo,
        (s.name || ' ' || s.surname) as studentName,
        s.class as studentClass
      FROM counseling_sessions cs
      INNER JOIN counseling_session_students css ON cs.id = css.sessionId
      INNER JOIN students s ON css.studentId = s.id
      WHERE cs.completed = 1 AND cs.schoolId = ?
    `;

    const params: any[] = [request.schoolId];

    if (request.sessionIds && request.sessionIds.length > 0) {
      const placeholders = request.sessionIds.map(() => '?').join(',');
      query += ` AND cs.id IN (${placeholders})`;
      params.push(...request.sessionIds);
    }

    if (request.filters?.onlyNotTransferred) {
      query += ` AND (cs.mebbis_transferred IS NULL OR cs.mebbis_transferred = 0)`;
    }

    if (request.filters?.startDate) {
      query += ` AND cs.sessionDate >= ?`;
      params.push(request.filters.startDate);
    }

    if (request.filters?.endDate) {
      query += ` AND cs.sessionDate <= ?`;
      params.push(request.filters.endDate);
    }

    query += ` ORDER BY cs.sessionDate ASC, cs.entryTime ASC`;

    const stmt = db.prepare(query);
    return stmt.all(...params) as any[];
  }

  private async markAsTransferred(sessionId: string, schoolId: string): Promise<void> {
    if (!schoolId) {
      throw new Error('schoolId is required for markAsTransferred - security violation');
    }
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE counseling_sessions 
      SET mebbis_transferred = 1, 
          mebbis_transfer_date = ?,
          mebbis_transfer_error = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND schoolId = ?
    `);
    stmt.run(new Date().toISOString(), sessionId, schoolId);
  }

  private async logError(sessionId: string, error: string, schoolId: string): Promise<void> {
    if (!schoolId) {
      throw new Error('schoolId is required for logError - security violation');
    }
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE counseling_sessions 
      SET mebbis_transfer_error = ?,
          mebbis_retry_count = COALESCE(mebbis_retry_count, 0) + 1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND schoolId = ?
    `);
    stmt.run(error, sessionId, schoolId);
  }

  async cancelTransfer(transferId: string): Promise<void> {
    const transferState = this.activeTransfers.get(transferId);
    if (transferState) {
      transferState.cancelled = true;
      transferState.status = 'cancelled';
      logger.info(`Transfer ${transferId} marked for cancellation`, 'MEBBISTransferManager');
    }
  }

  getStatus(transferId: string): TransferState | null {
    return this.activeTransfers.get(transferId) || null;
  }

  private emitProgress(transferId: string): void {
    const state = this.activeTransfers.get(transferId);
    if (this.io && state) {
      this.io.to(`transfer-${transferId}`).emit('mebbis:progress', state.progress);
    }
  }

  private emitStatus(transferId: string, status: string, message: string): void {
    if (this.io) {
      this.io.to(`transfer-${transferId}`).emit('mebbis:status', { status, message });
    }
  }

  private emitSessionStart(transferId: string, data: any): void {
    if (this.io) {
      this.io.to(`transfer-${transferId}`).emit('mebbis:session-start', data);
    }
  }

  private emitSessionCompleted(transferId: string, data: any): void {
    if (this.io) {
      this.io.to(`transfer-${transferId}`).emit('mebbis:session-completed', data);
    }
  }

  private emitSessionFailed(transferId: string, error: MEBBISTransferError): void {
    if (this.io) {
      this.io.to(`transfer-${transferId}`).emit('mebbis:session-failed', error);
    }
  }

  private emitTransferCompleted(transferId: string, summary: any): void {
    if (this.io) {
      this.io.to(`transfer-${transferId}`).emit('mebbis:transfer-completed', summary);
    }
  }

  private emitError(transferId: string, error: string): void {
    if (this.io) {
      this.io.to(`transfer-${transferId}`).emit('mebbis:transfer-error', { error });
    }
  }
}

export const mebbisTransferManager = new MEBBISTransferManager();
