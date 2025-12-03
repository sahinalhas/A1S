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

      // Set schoolId on automation service for school selection during QR login
      this.automation.setSchoolId(transferState.schoolId);

      logger.info('Initializing browser...', 'MEBBISTransferManager');
      await this.automation.initialize();
      
      this.emitStatus(transferId, 'waiting_qr', 'QR kod girişi bekleniyor...');
      logger.info('Waiting for QR code login...', 'MEBBISTransferManager');
      await this.automation.waitForLogin();
      
      this.emitStatus(transferId, 'running', 'Veri giriş sayfasına yönlendiriliyor...');
      logger.info('Navigating to data entry page...', 'MEBBISTransferManager');
      await this.automation.navigateToDataEntry();

      logger.info(`Starting to process ${sessions.length} sessions...`, 'MEBBISTransferManager');
      
      for (let i = 0; i < sessions.length; i++) {
        if (transferState.cancelled) {
          logger.info(
            `Transfer ${transferId} cancelled by user at session ${i + 1}/${sessions.length}`,
            'MEBBISTransferManager'
          );
          break;
        }

        const session = sessions[i];
        transferState.progress.current = i + 1;
        const sessionStartTime = Date.now();

        try {
          logger.info(
            `[${i + 1}/${sessions.length}] Processing session ${session.id} for student ${session.studentNo}`,
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
              `[${i + 1}/${sessions.length}] Session ${session.id} completed successfully in ${sessionDuration}ms`,
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
            
            logger.warn(
              `[${i + 1}/${sessions.length}] Session ${session.id} failed: ${result.error}`,
              'MEBBISTransferManager'
            );
            
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
          const sessionDuration = Date.now() - sessionStartTime;
          
          logger.error(
            `[${i + 1}/${sessions.length}] Session ${session.id} transfer failed after ${sessionDuration}ms`,
            'MEBBISTransferManager',
            error
          );
          
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

  private getSessionsToTransfer(request: StartTransferRequest): any[] {
    if (!request.schoolId) {
      throw new Error('schoolId is required for MEBBIS transfer - security violation');
    }
    
    const db = getDatabase();
    
    let query = `
      SELECT 
        cs.id,
        cs.sessionDate,
        cs.entryTime,
        cs.exitTime,
        cs.topic,
        cs.sessionDetails,
        cs.detailedNotes,
        cs.mebbis_transferred,
        s.id as studentNo,
        (s.name || ' ' || s.surname) as studentName
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
