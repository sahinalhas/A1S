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
import type { CounselingSession, CounselingOutcome } from '../types';
import { calculateSessionDuration } from './sessionHelpers';
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
    padding: 30,
    fontFamily: 'Roboto',
    fontSize: 10,
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
    marginBottom: 4,
  },
  summaryBox: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginBottom: 15,
    borderRadius: 4,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
  },
  summaryItem: {
    fontSize: 9,
    marginBottom: 4,
  },
  sessionCard: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 10,
  },
  sessionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },
  field: {
    flexDirection: 'row',
    marginBottom: 4,
    fontSize: 9,
  },
  fieldLabel: {
    fontWeight: 700,
    width: 100,
  },
  fieldValue: {
    flex: 1,
  },
  notesSection: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',
  },
  notesLabel: {
    fontWeight: 700,
    fontSize: 9,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#333',
    lineHeight: 1.4,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
});

interface ReportOptions {
  includeSessions?: boolean;
  includeOutcomes?: boolean;
  title?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface ExtendedOutcome extends CounselingOutcome {
  session?: CounselingSession;
}

interface SessionsReportDocumentProps {
  sessions: CounselingSession[];
  outcomes: ExtendedOutcome[];
  title: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

const SessionsReportDocument: React.FC<SessionsReportDocumentProps> = ({
  sessions,
  outcomes,
  title,
  dateRange,
}) => {
  const completedCount = sessions.filter((s) => s.completed).length;
  const activeCount = sessions.length - completedCount;
  const individualCount = sessions.filter((s) => s.sessionType === 'individual').length;
  const groupCount = sessions.filter((s) => s.sessionType === 'group').length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Rapor Tarihi: {format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: tr })}
          </Text>
          {dateRange && (
            <Text style={styles.subtitle}>
              Dönem: {format(dateRange.start, 'dd MMM yyyy', { locale: tr })} -{' '}
              {format(dateRange.end, 'dd MMM yyyy', { locale: tr })}
            </Text>
          )}
        </View>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Özet Bilgiler</Text>
          <Text style={styles.summaryItem}>• Toplam Görüşme: {sessions.length}</Text>
          <Text style={styles.summaryItem}>• Tamamlanan: {completedCount}</Text>
          <Text style={styles.summaryItem}>• Devam Eden: {activeCount}</Text>
          <Text style={styles.summaryItem}>• Bireysel: {individualCount}</Text>
          <Text style={styles.summaryItem}>• Grup: {groupCount}</Text>
        </View>

        {sessions.map((session, index) => {
          const sessionDate = format(new Date(session.sessionDate), 'dd MMMM yyyy', { locale: tr });
          const duration = calculateSessionDuration(session.entryTime, session.exitTime || '');
          const studentNames =
            session.sessionType === 'individual'
              ? `${session.student?.name || ''} ${session.student?.surname || ''}`.trim() || '-'
              : session.students?.map((s) => `${s.name} ${s.surname}`).join(', ') ||
                session.groupName ||
                '-';

          const sessionOutcome = outcomes.find((o) => o.sessionId === session.id);

          return (
            <View key={session.id} wrap={false}>
              {index > 0 && <View style={styles.separator} />}
              <View style={styles.sessionCard}>
                <Text style={styles.sessionTitle}>{session.topic}</Text>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Tarih:</Text>
                  <Text style={styles.fieldValue}>{sessionDate}</Text>
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Saat:</Text>
                  <Text style={styles.fieldValue}>
                    {session.entryTime}
                    {session.exitTime && ` - ${session.exitTime}`}
                  </Text>
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Öğrenci(ler):</Text>
                  <Text style={styles.fieldValue}>{studentNames}</Text>
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Görüşme Tipi:</Text>
                  <Text style={styles.fieldValue}>
                    {session.sessionType === 'individual' ? 'Bireysel' : 'Grup'}
                  </Text>
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Görüşme Şekli:</Text>
                  <Text style={styles.fieldValue}>{session.sessionMode}</Text>
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Süre:</Text>
                  <Text style={styles.fieldValue}>{duration ? `${duration} dakika` : '-'}</Text>
                </View>

                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Durum:</Text>
                  <Text style={styles.fieldValue}>
                    {session.completed ? 'Tamamlandı' : 'Devam Ediyor'}
                  </Text>
                </View>

                {(session.detailedNotes || session.sessionDetails) && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>Notlar:</Text>
                    <Text style={styles.notesText}>
                      {session.detailedNotes || session.sessionDetails}
                    </Text>
                  </View>
                )}

                {sessionOutcome && (
                  <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>Görüşme Sonucu:</Text>
                    {sessionOutcome.effectivenessRating && (
                      <Text style={styles.notesText}>
                        Etkinlik: {sessionOutcome.effectivenessRating}/5
                      </Text>
                    )}
                    {sessionOutcome.progressNotes && (
                      <Text style={styles.notesText}>İlerleme: {sessionOutcome.progressNotes}</Text>
                    )}
                    {sessionOutcome.nextSteps && (
                      <Text style={styles.notesText}>Sonraki Adımlar: {sessionOutcome.nextSteps}</Text>
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </Page>
    </Document>
  );
};

export async function generateSessionsPDF(
  sessions: CounselingSession[],
  outcomes: ExtendedOutcome[] = [],
  options: ReportOptions = {}
) {
  const { title = 'Görüşme Raporu', dateRange } = options;

  const blob = await pdf(
    <SessionsReportDocument
      sessions={sessions}
      outcomes={outcomes}
      title={title}
      dateRange={dateRange}
    />
  ).toBlob();

  const fileName = `Gorusme_Raporu_${format(new Date(), 'yyyy-MM-dd_HHmm')}.pdf`;
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);

  return {
    success: true,
    fileName,
    sessionCount: sessions.length,
    outcomeCount: outcomes.length,
  };
}

export async function generateOutcomesPDF(outcomes: ExtendedOutcome[], options: ReportOptions = {}) {
  const sessions = outcomes
    .filter((o) => o.session)
    .map((o) => o.session) as CounselingSession[];

  return generateSessionsPDF(sessions, outcomes, {
    ...options,
    title: options.title || 'Görüşme Sonuçları Raporu',
  });
}

export function generateComprehensiveReport(
  sessions: CounselingSession[],
  outcomes: ExtendedOutcome[]
) {
  return generateSessionsPDF(sessions, outcomes, {
    includeSessions: true,
    includeOutcomes: true,
    title: 'Kapsamlı Görüşme ve Sonuç Raporu',
  });
}
