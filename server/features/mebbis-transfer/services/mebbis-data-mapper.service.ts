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
}

export class MEBBISDataMapper {
  private topicToHizmetAlani: Record<string, string> = {
    'Ders Çalışma': 'Eğitsel Rehberlik',
    'Sınav Kaygısı': 'Eğitsel Rehberlik',
    'Ders Başarısı': 'Eğitsel Rehberlik',
    'Okul Uyumu': 'Kişisel/Sosyal Rehberlik',
    'Davranış Sorunları': 'Kişisel/Sosyal Rehberlik',
    'Duygusal Destek': 'Kişisel/Sosyal Rehberlik',
    'Akran İlişkileri': 'Kişisel/Sosyal Rehberlik',
    'Aile İlişkileri': 'Kişisel/Sosyal Rehberlik',
    'Meslek Seçimi': 'Mesleki Rehberlik',
    'Üniversite Tercihi': 'Mesleki Rehberlik',
    'Gelecek Planlaması': 'Mesleki Rehberlik'
  };

  private topicToBirinci: Record<string, string> = {
    'Ders Çalışma': 'Ders Çalışma Becerileri',
    'Sınav Kaygısı': 'Sınav Kaygısı',
    'Ders Başarısı': 'Akademik Başarı',
    'Okul Uyumu': 'Okula Uyum',
    'Davranış Sorunları': 'Davranış Problemleri',
    'Duygusal Destek': 'Duygusal Destek',
    'Akran İlişkileri': 'Akran İlişkileri',
    'Aile İlişkileri': 'Aile İletişimi',
    'Meslek Seçimi': 'Meslek Seçimi',
    'Üniversite Tercihi': 'Üniversite Tercihleri',
    'Gelecek Planlaması': 'Kariyer Planlama'
  };

  mapSessionToMEBBIS(session: CounselingSessionData): MEBBISSessionData {
    try {
      const hizmetAlani = this.getHizmetAlani(session.topic);
      const birinci = this.getBirinci(session.topic);
      const ikinci = this.getIkinci(session.sessionDetails);
      const ucuncu = this.getUcuncu(session.detailedNotes);

      const gorusmeTarihi = this.formatDate(session.sessionDate);
      const gorusmeSaati = this.formatTime(session.entryTime);
      const gorusmeBitisSaati = this.formatTime(session.exitTime || this.calculateEndTime(session.entryTime));

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
          mappedArea: hizmetAlani
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
    return this.topicToHizmetAlani[topic] || 'Kişisel/Sosyal Rehberlik';
  }

  private getBirinci(topic: string): string {
    return this.topicToBirinci[topic] || 'Diğer';
  }

  private getIkinci(sessionDetails: string | null): string {
    if (!sessionDetails) return 'Genel Görüşme';
    
    if (sessionDetails.toLowerCase().includes('verimlilik')) return 'Verimlilik';
    if (sessionDetails.toLowerCase().includes('motivasyon')) return 'Motivasyon';
    if (sessionDetails.toLowerCase().includes('konsantrasyon')) return 'Konsantrasyon';
    if (sessionDetails.toLowerCase().includes('zaman yönetimi')) return 'Zaman Yönetimi';
    
    const firstWords = sessionDetails.split(' ').slice(0, 3).join(' ');
    return firstWords.length > 50 ? firstWords.substring(0, 50) : firstWords;
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
