import * as XLSX from 'xlsx';
import type { CounselingSession } from '../types';
import { calculateSessionDuration } from './sessionHelpers';

export function exportSessionsToExcel(sessions: CounselingSession[]) {
 const exportData = sessions.map(session => {
 const duration = calculateSessionDuration(session.entryTime, session.exitTime || '');
 
 const studentNames = session.sessionType === 'individual' 
 ? `${session.student?.name || ''} ${session.student?.surname || ''}`.trim()
 : session.students?.map(s => `${s.name} ${s.surname}`).join(', ') || session.groupName;
 
 let participantInfo = '';
 if (session.participantType ==="veli" && session.parentName) {
 participantInfo = `${session.parentName} (${session.parentRelationship || 'Veli'})`;
 } else if (session.participantType ==="öğretmen" && session.teacherName) {
 participantInfo = `${session.teacherName}${session.teacherBranch ? ` - ${session.teacherBranch}` : ''}`;
 } else if (session.participantType ==="diğer" && session.otherParticipantDescription) {
 participantInfo = session.otherParticipantDescription;
 }
 
 return {
 'Tarih': new Date(session.sessionDate).toLocaleDateString('tr-TR'),
 'Başlangıç Saati': session.entryTime,
 'Bitiş Saati': session.exitTime || '-',
 'Öğrenci(ler)': studentNames,
 'Sınıf': session.sessionType === 'individual' ? session.student?.className : '-',
 'Görüşme Tipi': session.sessionType === 'individual' ? 'Bireysel' : 'Grup',
 'Katılımcı Tipi': session.participantType || 'öğrenci',
 'Katılımcı Bilgisi': participantInfo || '-',
 'Konu': session.topic,
 'Görüşme Şekli': session.sessionMode,
 'Konum': session.sessionLocation,
 'Süre (Dakika)': duration || '-',
 'Durum': session.completed ? 'Tamamlandı' : 'Devam Ediyor',
 'Otomatik Tamamlandı': session.autoCompleted ? 'Evet' : 'Hayır',
 'Uzatıldı': session.extensionGranted ? 'Evet' : 'Hayır',
 'Notlar': session.detailedNotes || session.sessionDetails || '-',
 };
 });

 const ws = XLSX.utils.json_to_sheet(exportData);
 const wb = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(wb, ws, 'Görüşme Defteri');
 
 const colWidths = [
 { wch: 12 },
 { wch: 10 },
 { wch: 10 },
 { wch: 25 },
 { wch: 10 },
 { wch: 12 },
 { wch: 30 },
 { wch: 12 },
 { wch: 15 },
 { wch: 10 },
 { wch: 12 },
 { wch: 12 },
 { wch: 10 },
 { wch: 50 },
 ];
 ws['!cols'] = colWidths;
 
 const today = new Date().toISOString().split('T')[0];
 XLSX.writeFile(wb, `Gorusme_Defteri_${today}.xlsx`, { 
 bookType: 'xlsx',
 bookSST: true,
 codepage: 65001
 });
 
 return sessions.length;
}
