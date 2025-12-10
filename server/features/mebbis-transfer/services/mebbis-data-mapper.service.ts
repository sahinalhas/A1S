import type { MEBBISSessionData } from '@shared/types/mebbis-transfer.types';
import { logger } from '../../../utils/logger.js';

interface CounselingSessionData {
  id: string;
  sessionDate: string;
  entryTime: string;
  exitTime: string | null;
  topic: string;
  sessionDetails: string | null;
  detailedNotes: string | null;
  studentNo: string;
  studentName: string;
  drpHizmetAlaniId: number | null;
  drpBirId: number | null;
  drpIkiId: number | null;
  drpUcId: number | null;
}

export class MEBBISDataMapper {
  mapSessionToMEBBIS(session: CounselingSessionData): MEBBISSessionData {
    try {
      // If we have DRP IDs, use them to get the actual MEBBİS values
      let hizmetAlani = '';
      let birinci = '';
      let ikinci = '';
      let ucuncu: string | undefined = undefined;

      if (session.drpHizmetAlaniId || session.drpBirId || session.drpIkiId) {
        // We have DRP IDs, query the database to get MEBBİS values
        const db = require('../../../lib/database.js').default();

        // Get Hizmet Alanı value (from drp_hizmet_alani table)
        if (session.drpHizmetAlaniId) {
          const haRow = db.prepare('SELECT ad FROM drp_hizmet_alani WHERE id = ?').get(session.drpHizmetAlaniId) as { ad: string } | undefined;
          hizmetAlani = haRow?.ad || '';

          logger.debug(
            `Mapped drpHizmetAlaniId ${session.drpHizmetAlaniId} to MEBBİS value: "${hizmetAlani}"`,
            'MEBBISDataMapper'
          );
        }

        // Get Birinci (drp_bir) value
        if (session.drpBirId) {
          const birRow = db.prepare('SELECT ad FROM drp_bir WHERE id = ?').get(session.drpBirId) as { ad: string } | undefined;
          birinci = birRow?.ad || '';

          logger.debug(
            `Mapped drpBirId ${session.drpBirId} to MEBBİS value: "${birinci}"`,
            'MEBBISDataMapper'
          );
        }

        // Get İkinci (drp_iki) value
        if (session.drpIkiId) {
          const ikiRow = db.prepare('SELECT ad FROM drp_iki WHERE id = ?').get(session.drpIkiId) as { ad: string } | undefined;
          ikinci = ikiRow?.ad || '';

          logger.debug(
            `Mapped drpIkiId ${session.drpIkiId} to MEBBİS value: "${ikinci}"`,
            'MEBBISDataMapper'
          );
        }

        // Get Üçüncü (drp_uc) value - this is kod + aciklama combined
        if (session.drpUcId) {
          const ucRow = db.prepare('SELECT kod, aciklama FROM drp_uc WHERE id = ?').get(session.drpUcId) as { kod: string; aciklama: string } | undefined;
          if (ucRow) {
            // Combine kod and aciklama for MEBBİS: "KOD - AÇIKLAMA"
            if (ucRow.kod && ucRow.aciklama) {
              ucuncu = `${ucRow.kod} - ${ucRow.aciklama}`;
            } else {
              ucuncu = ucRow.aciklama || ucRow.kod || undefined;
            }
          }

          logger.debug(
            `Mapped drpUcId ${session.drpUcId} to MEBBİS value: "${ucuncu}"`,
            'MEBBISDataMapper'
          );
        }
      } else {
        // Fallback: Use topic for old sessions without DRP IDs
        logger.warn(
          `Session ${session.id} has no DRP IDs, falling back to topic-based mapping`,
          'MEBBISDataMapper'
        );
        hizmetAlani = this.getHizmetAlani(session.topic);
        birinci = this.getHizmetAlani(session.topic);
        ikinci = this.getIkinci(session.sessionDetails);
        ucuncu = this.getUcuncu(session.detailedNotes);
      }

      const gorusmeTarihi = this.formatDate(session.sessionDate);
      const gorusmeSaati = this.formatTime(session.entryTime);
      let gorusmeBitisSaati = this.formatTime(session.exitTime || this.calculateEndTime(session.entryTime));

      // Validate times: Start time must be before End time
      if (gorusmeBitisSaati <= gorusmeSaati) {
        logger.warn(
          `Invalid session duration for session ${session.id}: Start (${gorusmeSaati}) >= End (${gorusmeBitisSaati}). Defaulting to +40 mins.`,
          'MEBBISDataMapper'
        );
        // Calculate new end time: start + 40 mins
        const [hours, minutes] = gorusmeSaati.split(':').map(Number);
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes + 40);
        gorusmeBitisSaati = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      }

      const mappedData = {
        studentNo: session.studentNo,
        hizmetAlani,
        birinci,
        ikinci,
        ucuncu,
        gorusmeTarihi,
        gorusmeSaati,
        gorusmeBitisSaati,
        oturumSayisi: 1,
        calismaYeri: 'Rehberlik Servisi'
      };

      logger.debug(
        `Mapped session ${session.id} for student ${session.studentNo}`,
        'MEBBISDataMapper',
        {
          sessionId: session.id,
          studentNo: session.studentNo,
          topic: session.topic,
          drpHizmetAlaniId: session.drpHizmetAlaniId,
          drpBirId: session.drpBirId,
          drpIkiId: session.drpIkiId,
          mappedHizmetAlani: hizmetAlani,
          mappedBirinci: birinci,
          mappedIkinci: ikinci
        }
      );

      return mappedData;
    } catch (error) {
      const err = error as Error;
      logger.error(
        `Error mapping session ${session.id} to MEBBIS format`,
        'MEBBISDataMapper',
        { sessionId: session.id, studentNo: session.studentNo, error: err.message }
      );
      throw new Error(`Veri dönüşümü başarısız: ${err.message}`);
    }
  }

  private getHizmetAlani(topic: string): string {
    return topic;
  }

  private getBirinci(topic: string): string {
    return topic;
  }

  private getIkinci(sessionDetails: string | null): string {
    return sessionDetails || '';
  }

  private getUcuncu(detailedNotes: string | null): string | undefined {
    if (!detailedNotes || detailedNotes.length < 10) return undefined;

    const summary = detailedNotes.split('\n')[0] || detailedNotes.substring(0, 100);
    return summary.length > 100 ? summary.substring(0, 100) : summary;
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      logger.warn(`Invalid date format: ${dateString}`, 'MEBBISDataMapper');
      return '01/01/2025';
    }
  }

  private formatTime(timeString: string): string {
    try {
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
      }

      const date = new Date(timeString);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      logger.warn(`Invalid time format: ${timeString}`, 'MEBBISDataMapper');
      return '09:00';
    }
  }

  private calculateEndTime(startTime: string): string {
    try {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHours = hours + 1;
      return `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } catch (error) {
      return '10:00';
    }
  }
}
