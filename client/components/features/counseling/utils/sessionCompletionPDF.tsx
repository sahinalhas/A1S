import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from '@react-pdf/renderer';
import type { CounselingSession, CompleteSessionFormValues } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale/tr';

Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlvAx05IsDqlA.ttf',
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Roboto',
    fontSize: 10,
  },
  header: {
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
    paddingBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#4f46e5',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 8,
    color: '#666',
  },
  section: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 8,
    color: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
    paddingRight: 10,
  },
  twoColumnRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  halfColumn: {
    width: '50%',
    paddingRight: 5,
  },
  label: {
    fontSize: 8,
    fontWeight: 700,
    width: 110,
    color: '#374151',
  },
  value: {
    fontSize: 8,
    flex: 1,
    color: '#1f2937',
  },
  notesBox: {
    backgroundColor: '#f9fafb',
    padding: 8,
    marginTop: 6,
    borderRadius: 2,
    minHeight: 50,
  },
  notesText: {
    fontSize: 8,
    lineHeight: 1.4,
    color: '#374151',
  },
  ratingBox: {
    backgroundColor: '#eff6ff',
    padding: 6,
    borderLeftWidth: 2,
    borderLeftColor: '#3b82f6',
  },
  badge: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 7,
    marginRight: 3,
  },
});

interface SessionCompletionPDFProps {
  session: CounselingSession;
  formData: CompleteSessionFormValues;
  topicFullPath?: string;
  schoolName?: string;
  topicTitle?: string;
  counselorName?: string;
  studentData?: {
    gender?: string;
    idNumber?: string;
    studentNumber?: string;
    yearEndSuccess?: number;
    absenceDays?: number;
    familyInfo?: string;
    term?: string;
    healthInfo?: string;
    specialEducationInfo?: string;
  };
}

const toTitleCase = (str: string): string => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

const formatGuidanceArea = (fullPath?: string, topicTitle?: string): string => {
  if (!fullPath && !topicTitle) return '-';
  
  let result = '';
  
  if (fullPath) {
    result = fullPath
      .toLowerCase()
      .split('>')
      .map((part, idx) => {
        const trimmed = part.trim();
        return toTitleCase(trimmed);
      })
      .join(' > ');
  }
  
  if (topicTitle) {
    const titleCased = toTitleCase(topicTitle);
    result = result ? `${result} > ${titleCased}` : titleCased;
  }
  
  return result;
};

const SessionCompletionDocument: React.FC<SessionCompletionPDFProps> = ({
  session,
  formData,
  topicFullPath,
  schoolName,
  topicTitle,
  counselorName,
  studentData,
}) => {
  const sessionDate = format(new Date(session.sessionDate), 'dd MMMM yyyy', { locale: tr });
  const generatedDate = format(new Date(), 'dd.MM.yyyy HH:mm', { locale: tr });
  const sessionDateTime = format(new Date(session.sessionDate), 'dd/MM/yyyy', { locale: tr });

  const studentName = session.sessionType === 'individual'
    ? `${session.student?.name || ''} ${session.student?.surname || ''}`.trim()
    : session.groupName || 'Grup Görüşmesi';

  const emotionalStateLabels: { [key: string]: string } = {
    'sakin': 'Sakin',
    'kaygılı': 'Kaygılı',
    'üzgün': 'Üzgün',
    'sinirli': 'Sinirli',
    'mutlu': 'Mutlu',
    'karışık': 'Karışık',
    'diğer': 'Diğer',
  };

  const physicalStateLabels: { [key: string]: string } = {
    'normal': 'Normal',
    'yorgun': 'Yorgun',
    'enerjik': 'Enerjik',
    'huzursuz': 'Huzursuz',
    'hasta': 'Hasta',
  };

  const communicationLabels: { [key: string]: string } = {
    'açık': 'Açık',
    'çekingen': 'Çekingen',
    'dirençli': 'Dirençli',
    'sınırlı': 'Sınırlı',
  };

  const sessionModeLabels: { [key: string]: string } = {
    'individual': 'Bireysel',
    'group': 'Grup',
    'class': 'Sınıf',
    'one_on_one': 'Birebir',
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Görüşme Bilgileri Formu</Text>
          <Text style={styles.subtitle}>
            Oluşturma Tarihi: {generatedDate}
          </Text>
        </View>

        {/* Öğrenci Bilgileri */}
        {session.sessionType === 'individual' && session.student && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Öğrenci Bilgileri</Text>
            
            <View style={styles.twoColumnRow}>
              <View style={styles.halfColumn}>
                <View style={styles.row}>
                  <Text style={styles.label}>Adı Soyadı:</Text>
                  <Text style={styles.value}>{studentName || '-'}</Text>
                </View>
              </View>
              <View style={styles.halfColumn}>
                <View style={styles.row}>
                  <Text style={styles.label}>Cinsiyeti:</Text>
                  <Text style={styles.value}>{studentData?.gender || '-'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.halfColumn}>
                <View style={styles.row}>
                  <Text style={styles.label}>T.C. Kimlik No:</Text>
                  <Text style={styles.value}>{studentData?.idNumber || '-'}</Text>
                </View>
              </View>
              <View style={styles.halfColumn}>
                <View style={styles.row}>
                  <Text style={styles.label}>Uyruğu:</Text>
                  <Text style={styles.value}>T.C.</Text>
                </View>
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.halfColumn}>
                <View style={styles.row}>
                  <Text style={styles.label}>Kademe:</Text>
                  <Text style={styles.value}>{session.student?.class || '-'}</Text>
                </View>
              </View>
              <View style={styles.halfColumn}>
                <View style={styles.row}>
                  <Text style={styles.label}>Öğrenci No:</Text>
                  <Text style={styles.value}>{studentData?.studentNumber ? String(studentData.studentNumber).substring(0, 20) : '-'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.halfColumn}>
                <View style={styles.row}>
                  <Text style={styles.label}>Okulu:</Text>
                  <Text style={styles.value}>{schoolName || '-'}</Text>
                </View>
              </View>
              <View style={styles.halfColumn}>
                <View style={styles.row}>
                  <Text style={styles.label}>Yıl Sonu Başarı:</Text>
                  <Text style={styles.value}>{studentData?.yearEndSuccess || '-'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.halfColumn}>
                <View style={styles.row}>
                  <Text style={styles.label}>Sınıfı:</Text>
                  <Text style={styles.value}>{session.student?.className || session.student?.class || '-'}</Text>
                </View>
              </View>
              <View style={styles.halfColumn}>
                <View style={styles.row}>
                  <Text style={styles.label}>Devamsızlık Gün:</Text>
                  <Text style={styles.value}>{studentData?.absenceDays || '-'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.halfColumn}>
                <View style={styles.row}>
                  <Text style={styles.label}>Aile Bilgisi:</Text>
                  <Text style={styles.value}>{studentData?.familyInfo || '-'}</Text>
                </View>
              </View>
              <View style={styles.halfColumn}>
                <View style={styles.row}>
                  <Text style={styles.label}>Dönem:</Text>
                  <Text style={styles.value}>{studentData?.term || '-'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.halfColumn}>
                <View style={styles.row}>
                  <Text style={styles.label}>Sağlık Bilgisi:</Text>
                  <Text style={styles.value}>{studentData?.healthInfo || 'Sürekli hastalığı yok'}</Text>
                </View>
              </View>
              <View style={styles.halfColumn}>
                <View style={styles.row}>
                  <Text style={styles.label}>Özel Eğitim:</Text>
                  <Text style={styles.value}>{studentData?.specialEducationInfo || 'Yok'}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Görüşme Bilgileri */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Görüşme Bilgileri</Text>
          
          <View style={styles.twoColumnRow}>
            <View style={styles.halfColumn}>
              <View style={styles.row}>
                <Text style={styles.label}>Tarih ve Saati:</Text>
                <Text style={styles.value}>{sessionDateTime} - {session.entryTime || '-'}</Text>
              </View>
            </View>
            <View style={styles.halfColumn}>
              <View style={styles.row}>
                <Text style={styles.label}>Görüşme Yeri:</Text>
                <Text style={styles.value}>{session.sessionLocation || '-'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Rehberlik Alanı:</Text>
            <Text style={styles.value}>{formatGuidanceArea(topicFullPath, topicTitle)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Çalışma Yöntemi:</Text>
            <Text style={styles.value}>{sessionModeLabels[session.sessionMode as string] || session.sessionMode || '-'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Görüşme Türü:</Text>
            <Text style={styles.value}>{session.sessionType === 'individual' ? 'Bireysel' : 'Grup'}</Text>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.halfColumn}>
              <View style={styles.row}>
                <Text style={styles.label}>Öğretmen Adı:</Text>
                <Text style={styles.value}>{counselorName || session.teacherName || '-'}</Text>
              </View>
            </View>
            <View style={styles.halfColumn}>
              <View style={styles.row}>
                <Text style={styles.label}>Veli Adı:</Text>
                <Text style={styles.value}>{session.parentName || '-'}</Text>
              </View>
            </View>
          </View>

          {session.disciplineStatus && (
            <View style={styles.row}>
              <Text style={styles.label}>Disiplin/Davranış:</Text>
              <Text style={styles.value}>{session.disciplineStatus}</Text>
            </View>
          )}
        </View>

        {/* Görüşme Detayları - sadece varsa göster */}
        {session.sessionDetails && session.sessionDetails.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Görüşme Detayları</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Detaylar:</Text>
              <Text style={styles.value}>{session.sessionDetails}</Text>
            </View>
          </View>
        )}

        {/* Detaylı Notlar */}
        {formData.detailedNotes && formData.detailedNotes.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Görüşme Notları</Text>
            <View style={styles.notesBox}>
              <Text style={styles.notesText}>{formData.detailedNotes}</Text>
            </View>
          </View>
        )}

        {/* Yapılacaklar */}
        {formData.actionItems && formData.actionItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yapılacaklar ({formData.actionItems.length})</Text>
            {formData.actionItems.map((item, idx) => (
              <View key={idx} style={{ marginBottom: 6 }}>
                <View style={styles.row}>
                  <Text style={styles.label}>Madde {idx + 1}:</Text>
                  <Text style={styles.value}>{(item.description || '').trim() || '-'}</Text>
                </View>
                {item.assignedTo && (item.assignedTo.trim()) && (
                  <View style={{ marginLeft: 110, marginTop: 2 }}>
                    <Text style={{ fontSize: 7, color: '#666' }}>
                      {'Atanan: ' + item.assignedTo}
                      {item.dueDate && item.dueDate.trim() && (` • Tarih: ${item.dueDate}`) || ''}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Takip Planı */}
        {formData.followUpNeeded && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Takip Planı</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Takip Tarihi:</Text>
              <Text style={styles.value}>
                {formData.followUpDate ? format(new Date(formData.followUpDate), 'dd MMMM yyyy', { locale: tr }) : '-'}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Takip Saati:</Text>
              <Text style={styles.value}>{formData.followUpTime || '-'}</Text>
            </View>
            {formData.followUpPlan && formData.followUpPlan.trim() && (
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{formData.followUpPlan}</Text>
              </View>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
};

export async function generateSessionCompletionPDF(
  session: CounselingSession,
  formData: CompleteSessionFormValues,
  topicFullPath?: string,
  schoolName?: string,
  topicTitle?: string,
  studentData?: SessionCompletionPDFProps['studentData'],
  counselorName?: string
) {
  const blob = await pdf(
    <SessionCompletionDocument 
      session={session} 
      formData={formData} 
      topicFullPath={topicFullPath} 
      schoolName={schoolName}
      topicTitle={topicTitle}
      counselorName={counselorName}
      studentData={studentData}
    />
  ).toBlob();

  const studentName = session.student
    ? `${session.student.name || ''}_${session.student.surname || ''}`.trim().replace(/\s+/g, '_')
    : 'Ogrenci';

  const dateStr = format(new Date(session.sessionDate || new Date()), 'yyyyMMdd_HHmm');
  const fileName = `Gorusme_Bilgileri_${studentName}_${dateStr}.pdf`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);

  return {
    success: true,
    fileName,
  };
}
