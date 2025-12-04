import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
  Image,
} from '@react-pdf/renderer';

export interface PlanEntry {
  date: string;
  start: string;
  end: string;
  subjectId: string;
  topicId: string;
  allocated: number;
  remainingAfter: number;
  targetQuestionCount?: number;
}

interface Subject {
  id: string;
  name: string;
  category?: string;
}

interface Topic {
  id: string;
  name: string;
  avgMinutes?: number;
}

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
    padding: 16,
    fontFamily: 'Roboto',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e3a5f',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  studentName: {
    fontSize: 9,
    fontWeight: 700,
    color: '#1e3a5f',
  },
  dateRange: {
    fontSize: 7,
    color: '#475569',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 6,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#eef5ff',
    borderRadius: 3,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  statCardAccent: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
  },
  statCardSuccess: {
    backgroundColor: '#d1fae5',
    borderColor: '#6ee7b7',
  },
  statCardPurple: {
    backgroundColor: '#f3e8ff',
    borderColor: '#ddd6fe',
  },
  statValue: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1e3a5f',
  },
  statLabel: {
    fontSize: 5,
    color: '#64748b',
    marginTop: 1,
    textTransform: 'uppercase',
  },
  mainContent: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  column: {
    flex: 1,
  },
  daySection: {
    marginBottom: 5,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#4f46e5',
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  dayName: {
    fontSize: 7,
    fontWeight: 700,
    color: '#ffffff',
  },
  dayDate: {
    fontSize: 6,
    color: '#94a3b8',
  },
  dayContent: {
    backgroundColor: '#ffffff',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 2,
    paddingHorizontal: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
  },
  tableHeaderText: {
    fontSize: 4.5,
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f1f5f9',
  },
  topicRowLast: {
    borderBottomWidth: 0,
  },
  colTime: {
    width: '14%',
  },
  colCategorySubject: {
    width: '18%',
  },
  colTopic: {
    width: '32%',
  },
  colSolved: {
    width: '12%',
    alignItems: 'center',
  },
  colCorrect: {
    width: '12%',
    alignItems: 'center',
  },
  colWrong: {
    width: '12%',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 5,
    fontWeight: 700,
    color: '#1e3a5f',
  },
  categoryBadge: {
    paddingHorizontal: 3,
    paddingVertical: 1.5,
    borderRadius: 2,
  },
  categoryBadgeTYT: {
    backgroundColor: '#4f46e5',
  },
  categoryBadgeAYT: {
    backgroundColor: '#d946ef',
  },
  categoryBadgeYDT: {
    backgroundColor: '#f97316',
  },
  categoryBadgeLGS: {
    backgroundColor: '#16a34a',
  },
  categoryBadgeDefault: {
    backgroundColor: '#6b7280',
  },
  categoryText: {
    fontSize: 5,
    fontWeight: 700,
    color: '#ffffff',
  },
  subjectText: {
    fontSize: 5,
    color: '#475569',
    fontWeight: 700,
  },
  topicText: {
    fontSize: 5,
    color: '#334155',
  },
  inputBox: {
    width: 18,
    height: 10,
    borderWidth: 0.5,
    borderColor: '#cbd5e1',
    borderRadius: 2,
    backgroundColor: '#fafafa',
  },
  emptyDay: {
    fontSize: 5,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 6,
    fontStyle: 'italic',
  },
  footer: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  notesArea: {
    marginBottom: 6,
  },
  notesTitle: {
    fontSize: 6,
    fontWeight: 700,
    color: '#1e3a5f',
    marginBottom: 3,
  },
  notesGrid: {
    flexDirection: 'column',
    gap: 4,
  },
  notesBoxRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 2,
  },
  notesLabelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  noteBox: {
    flex: 1,
    height: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 2,
    backgroundColor: '#fafafa',
  },
  noteLabel: {
    flex: 1,
    fontSize: 5,
    fontWeight: 700,
    color: '#475569',
    textAlign: 'center',
  },
  signatureArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  signatureBox: {
    width: '30%',
    alignItems: 'center',
  },
  signatureLine: {
    width: '100%',
    height: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    marginBottom: 2,
  },
  signatureLabel: {
    fontSize: 5,
    color: '#64748b',
  },
  branding: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  brandText: {
    fontSize: 5,
    color: '#94a3b8',
  },
  inputLabel: {
    fontSize: 3.5,
    color: '#94a3b8',
    marginTop: 1,
  },
});

const DAYS = [
  { value: 1, label: 'Pazartesi', short: 'Pzt' },
  { value: 2, label: 'Salı', short: 'Sal' },
  { value: 3, label: 'Çarşamba', short: 'Çar' },
  { value: 4, label: 'Perşembe', short: 'Per' },
  { value: 5, label: 'Cuma', short: 'Cum' },
  { value: 6, label: 'Cumartesi', short: 'Cmt' },
  { value: 7, label: 'Pazar', short: 'Paz' },
];

const TURKISH_MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

function dateFromWeekStartLocal(weekStartISO: string, day: number): string {
  const d = new Date(weekStartISO + 'T00:00:00');
  const result = new Date(d.getTime() + (day - 1) * 24 * 60 * 60 * 1000);
  return result.toISOString().slice(0, 10);
}

function formatDateTurkish(date: Date): string {
  const day = date.getDate();
  const month = TURKISH_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function formatDateCompact(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}`;
}

interface WeeklyPlanDocumentProps {
  plan: PlanEntry[];
  planByDate: Map<string, PlanEntry[]>;
  weekStart: string;
  subjects: Subject[];
  topics: Topic[];
  studentId: string;
  studentName?: string;
}

const WeeklyPlanDocument: React.FC<WeeklyPlanDocumentProps> = ({
  plan,
  planByDate,
  weekStart,
  subjects,
  topics,
  studentName,
  studentId,
}) => {
  const startDate = new Date(weekStart + 'T00:00:00');
  const endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
  const dateRangeShort = `${formatDateCompact(startDate)} - ${formatDateCompact(endDate)}`;

  const totalMinutes = plan.reduce((sum, p) => sum + p.allocated, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  
  const uniqueSubjects = new Set(plan.map(p => p.subjectId)).size;
  const uniqueTopics = new Set(plan.map(p => p.topicId)).size;

  const getCategoryBadgeStyle = (category?: string) => {
    switch (category) {
      case 'TYT': return styles.categoryBadgeTYT;
      case 'AYT': return styles.categoryBadgeAYT;
      case 'YDT': return styles.categoryBadgeYDT;
      case 'LGS': return styles.categoryBadgeLGS;
      default: return styles.categoryBadgeDefault;
    }
  };

  // Maksimum satır sayısını hesapla
  const maxEntriesPerDay = Math.max(
    ...DAYS.map(day => (planByDate.get(dateFromWeekStartLocal(weekStart, day.value)) || []).length),
    1 // En az 1 satır
  );

  const renderDaySection = (day: { value: number; label: string; short: string }) => {
    const dateISO = dateFromWeekStartLocal(weekStart, day.value);
    const date = new Date(dateISO + 'T00:00:00');
    const entries = (planByDate.get(dateISO) || [])
      .slice()
      .sort((a, b) => a.start.localeCompare(b.start));

    return (
      <View key={day.value} style={styles.daySection}>
        <View style={styles.dayHeader}>
          <Text style={styles.dayName}>{day.label}</Text>
          <Text style={styles.dayDate}>{formatDateCompact(date)}</Text>
        </View>
        <View style={styles.dayContent}>
          {entries.length === 0 ? (
            <>
              <View style={styles.tableHeader}>
                <View style={styles.colTime}>
                  <Text style={styles.tableHeaderText}>Saat</Text>
                </View>
                <View style={styles.colCategorySubject}>
                  <Text style={styles.tableHeaderText}>Tur / Ders</Text>
                </View>
                <View style={styles.colTopic}>
                  <Text style={styles.tableHeaderText}>Konu</Text>
                </View>
                <View style={styles.colSolved}>
                  <Text style={styles.tableHeaderText}>Cozulen</Text>
                </View>
                <View style={styles.colCorrect}>
                  <Text style={styles.tableHeaderText}>Dogru</Text>
                </View>
                <View style={styles.colWrong}>
                  <Text style={styles.tableHeaderText}>Yanlis</Text>
                </View>
              </View>
              {Array.from({ length: maxEntriesPerDay }).map((_, idx) => (
                <View
                  key={`empty-${idx}`}
                  style={idx === maxEntriesPerDay - 1 ? [styles.topicRow, styles.topicRowLast] : styles.topicRow}
                >
                  <View style={styles.colTime} />
                  <View style={styles.colCategorySubject} />
                  <View style={styles.colTopic} />
                  <View style={styles.colSolved} />
                  <View style={styles.colCorrect} />
                  <View style={styles.colWrong} />
                </View>
              ))}
            </>
          ) : (
            <>
              <View style={styles.tableHeader}>
                <View style={styles.colTime}>
                  <Text style={styles.tableHeaderText}>Saat</Text>
                </View>
                <View style={styles.colCategorySubject}>
                  <Text style={styles.tableHeaderText}>Tur / Ders</Text>
                </View>
                <View style={styles.colTopic}>
                  <Text style={styles.tableHeaderText}>Konu</Text>
                </View>
                <View style={styles.colSolved}>
                  <Text style={styles.tableHeaderText}>Cozulen</Text>
                </View>
                <View style={styles.colCorrect}>
                  <Text style={styles.tableHeaderText}>Dogru</Text>
                </View>
                <View style={styles.colWrong}>
                  <Text style={styles.tableHeaderText}>Yanlis</Text>
                </View>
              </View>
              {entries.map((entry, idx) => {
                const subject = subjects.find((s) => s.id === entry.subjectId);
                const topic = topics.find((t) => t.id === entry.topicId);
                const category = subject?.category || '-';

                return (
                  <View
                    key={`${entry.topicId}-${idx}`}
                    style={styles.topicRow}
                  >
                    <View style={styles.colTime}>
                      <Text style={styles.timeText}>{entry.start}-{entry.end}</Text>
                    </View>
                    <View style={styles.colCategorySubject}>
                      <Text style={styles.subjectText}>
                        {category && category !== 'Okul' && category !== '-' ? `${category} - ` : ''}{subject?.name?.substring(0, 10) || '...'}
                      </Text>
                    </View>
                    <View style={styles.colTopic}>
                      <Text style={styles.topicText}>
                        {topic?.name || ''}
                      </Text>
                    </View>
                    <View style={styles.colSolved}>
                      <View style={styles.inputBox} />
                    </View>
                    <View style={styles.colCorrect}>
                      <View style={styles.inputBox} />
                    </View>
                    <View style={styles.colWrong}>
                      <View style={styles.inputBox} />
                    </View>
                  </View>
                );
              })}
              {/* Boş satırları ekle */}
              {Array.from({ length: maxEntriesPerDay - entries.length }).map((_, idx) => (
                <View
                  key={`empty-${idx}`}
                  style={idx === maxEntriesPerDay - entries.length - 1 ? [styles.topicRow, styles.topicRowLast] : styles.topicRow}
                >
                  <View style={styles.colTime} />
                  <View style={styles.colCategorySubject} />
                  <View style={styles.colTopic} />
                  <View style={styles.colSolved} />
                  <View style={styles.colCorrect} />
                  <View style={styles.colWrong} />
                </View>
              ))}
            </>
          )}
        </View>
      </View>
    );
  };

  // Günleri çift halinde organize et (hizada gösterim için)
  const dayPairs = [
    [DAYS[0], DAYS[4]], // Pazartesi - Cuma
    [DAYS[1], DAYS[5]], // Salı - Cumartesi
    [DAYS[2], DAYS[6]], // Çarşamba - Pazar
    [DAYS[3], null],     // Perşembe - (boş)
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>HAFTALIK CALISMA PLANI</Text>
            <Text style={styles.subtitle}>Kisisellestirilmis Ogrenme Programi</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.studentName}>{studentName || studentId}</Text>
            <Text style={styles.dateRange}>{dateRangeShort}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalHours}s {totalMins}dk</Text>
            <Text style={styles.statLabel}>Toplam Sure</Text>
          </View>
          <View style={[styles.statCard, styles.statCardAccent]}>
            <Text style={styles.statValue}>{plan.length}</Text>
            <Text style={styles.statLabel}>Etut Sayisi</Text>
          </View>
          <View style={[styles.statCard, styles.statCardSuccess]}>
            <Text style={styles.statValue}>{uniqueTopics}</Text>
            <Text style={styles.statLabel}>Farkli Konu</Text>
          </View>
          <View style={[styles.statCard, styles.statCardPurple]}>
            <Text style={styles.statValue}>{uniqueSubjects}</Text>
            <Text style={styles.statLabel}>Ders Sayisi</Text>
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.column}>
            {dayPairs.map((pair) => renderDaySection(pair[0]))}
          </View>
          <View style={styles.column}>
            {dayPairs.map((pair) => pair[1] ? renderDaySection(pair[1]) : <View key="empty" />)}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.notesArea}>
            <Text style={styles.notesTitle}>Haftalik Degerlendirme / Notlar</Text>
            <View style={styles.notesGrid}>
              <View style={styles.notesBoxRow}>
                <View style={styles.noteBox} />
                <View style={styles.noteBox} />
                <View style={styles.noteBox} />
              </View>
              <View style={styles.notesLabelRow}>
                <Text style={styles.noteLabel}>Ogrenci</Text>
                <Text style={styles.noteLabel}>Veli</Text>
                <Text style={styles.noteLabel}>Rehber Ogretmen</Text>
              </View>
            </View>
          </View>

          <View style={styles.signatureArea}>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Ogrenci</Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Veli</Text>
            </View>
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Rehber Ogretmen</Text>
            </View>
          </View>

          <View style={styles.branding}>
            <Text style={styles.brandText}>Rehber360 - Akilli Calisma Sistemi - {formatDateTurkish(startDate)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export async function generateTopicPlanPDF(
  plan: PlanEntry[],
  planByDate: Map<string, PlanEntry[]>,
  weekStart: string,
  subjects: Subject[],
  topics: Topic[],
  studentId: string,
  studentName?: string,
  options: { download?: boolean; print?: boolean } = { download: true, print: false }
) {
  const blob = await pdf(
    <WeeklyPlanDocument
      plan={plan}
      planByDate={planByDate}
      weekStart={weekStart}
      subjects={subjects}
      topics={topics}
      studentId={studentId}
      studentName={studentName}
    />
  ).toBlob();

  const fileName = `Haftalik_Calisma_Plani_${weekStart}_${studentName || studentId}.pdf`;

  if (options.print) {
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
    } else {
      URL.revokeObjectURL(url);
    }
  } else if (options.download) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  return blob;
}

interface WeeklySlot {
  id: string;
  studentId: string;
  day: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  start: string;
  end: string;
  subjectId: string;
}

interface WeeklySchedulePDFStyles {
  weeklyPage: any;
  weeklyHeader: any;
  weeklyTitle: any;
  weeklySubtitle: any;
  weeklyHeaderRight: any;
  weeklyStudentName: any;
  weeklyDateRange: any;
  weeklyStatsRow: any;
  weeklyStatCard: any;
  weeklyStatValue: any;
  weeklyStatLabel: any;
  weeklyTable: any;
  weeklyTableHeader: any;
  weeklyTableHeaderCell: any;
  weeklyTableRow: any;
  weeklyTableCell: any;
  weeklyDayHeader: any;
  weeklyEmptyRow: any;
  weeklyFooter: any;
  weeklyBrandText: any;
}

const weeklyScheduleStyles = StyleSheet.create({
  weeklyPage: {
    padding: 16,
    fontFamily: 'Roboto',
    backgroundColor: '#ffffff',
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#4f46e5',
  },
  weeklyTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e3a5f',
    letterSpacing: 0.5,
  },
  weeklySubtitle: {
    fontSize: 7,
    color: '#64748b',
    marginTop: 2,
  },
  weeklyHeaderRight: {
    alignItems: 'flex-end',
  },
  weeklyStudentName: {
    fontSize: 9,
    fontWeight: 700,
    color: '#1e3a5f',
  },
  weeklyDateRange: {
    fontSize: 7,
    color: '#475569',
    marginTop: 2,
  },
  weeklyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 6,
  },
  weeklyStatCard: {
    flex: 1,
    backgroundColor: '#eef5ff',
    borderRadius: 3,
    padding: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  weeklyStatValue: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1e3a5f',
  },
  weeklyStatLabel: {
    fontSize: 5,
    color: '#64748b',
    marginTop: 1,
    textTransform: 'uppercase',
  },
  weeklyTable: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 3,
  },
  weeklyTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#3730a3',
  },
  weeklyTableHeaderCell: {
    fontSize: 8.5,
    fontWeight: 700,
    color: '#ffffff',
    flex: 1,
  },
  weeklyTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    minHeight: 22,
  },
  weeklyTableCell: {
    fontSize: 8.5,
    color: '#334155',
    flex: 1,
  },
  weeklyTableRowLast: {
    borderBottomWidth: 0,
  },
  weeklyEmptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f9fafb',
    minHeight: 22,
  },
  weeklyFooter: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  weeklyBrandText: {
    fontSize: 5,
    color: '#94a3b8',
    textAlign: 'center',
  },
  weeklyColDay: {
    width: '12%',
  },
  weeklyColTime: {
    width: '20%',
  },
  weeklyColSubject: {
    width: '50%',
  },
  weeklyColStars: {
    width: '30%',
    alignItems: 'center',
  },
  weeklyDayHeaderBg: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingVertical: 4,
    paddingHorizontal: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#4f46e5',
  },
  weeklyDayName: {
    fontSize: 9.5,
    fontWeight: 700,
    color: '#1e3a5f',
  },
  weeklyText: {
    fontSize: 7.5,
    color: '#334155',
  },
  weeklyTextBold: {
    fontSize: 7.5,
    fontWeight: 700,
    color: '#1e3a5f',
  },
  weeklyStarsText: {
    fontSize: 9,
    fontWeight: 700,
    color: '#1e3a5f',
    textAlign: 'center',
  },
  weeklyCategoryBadge: {
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weeklyCategoryBadgeTYT: {
    backgroundColor: '#4f46e5',
  },
  weeklyCategoryBadgeAYT: {
    backgroundColor: '#d946ef',
  },
  weeklyCategoryBadgeYDT: {
    backgroundColor: '#f97316',
  },
  weeklyCategoryBadgeLGS: {
    backgroundColor: '#16a34a',
  },
  weeklyCategoryBadgeDefault: {
    backgroundColor: '#9ca3af',
  },
  weeklyCategoryText: {
    fontSize: 6.5,
    fontWeight: 700,
    color: '#ffffff',
  },
  mainContent: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  column: {
    flex: 1,
  },
});

const WEEKLY_DAYS = [
  { value: 1, label: 'Pazartesi', short: 'Pzt' },
  { value: 2, label: 'Salı', short: 'Sal' },
  { value: 3, label: 'Çarşamba', short: 'Çar' },
  { value: 4, label: 'Perşembe', short: 'Per' },
  { value: 5, label: 'Cuma', short: 'Cum' },
  { value: 6, label: 'Cumartesi', short: 'Cmt' },
  { value: 7, label: 'Pazar', short: 'Paz' },
];

// SVG Yıldız Base64
const STAR_SVG = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTAgMkwxMi41OCA4LjMzSDE5LjMxTDE0LjM2IDEyLjY3TDE2LjkzIDE5TDEwIDI1LjMzTDMuMDcgMTlMNS42NCA1LjMzTDAuNjkgMTIuNjdMNy40MiA4LjMzTDEwIDJaIiBmaWxsPSJub25lIiBzdHJva2U9IiMxZTNhNWYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz48L3N2Zz4=';

interface WeeklyScheduleDocumentProps {
  slots: WeeklySlot[];
  subjects: Subject[];
  studentId: string;
  studentName?: string;
  totalMinutes: number;
  studentFullName?: string;
}

const getCategoryBadgeStyle = (category?: string) => {
  switch (category) {
    case 'TYT': return weeklyScheduleStyles.weeklyCategoryBadgeTYT;
    case 'AYT': return weeklyScheduleStyles.weeklyCategoryBadgeAYT;
    case 'YDT': return weeklyScheduleStyles.weeklyCategoryBadgeYDT;
    case 'LGS': return weeklyScheduleStyles.weeklyCategoryBadgeLGS;
    default: return weeklyScheduleStyles.weeklyCategoryBadgeDefault;
  }
};

const WeeklyScheduleDocument: React.FC<WeeklyScheduleDocumentProps> = ({
  slots,
  subjects,
  studentName,
  studentId,
  totalMinutes,
  studentFullName,
}) => {
  const now = new Date();
  const dateRangeShort = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()}`;
  
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;
  const slotCount = slots.length;
  const uniqueSubjects = new Set(slots.map(s => s.subjectId)).size;

  const slotsByDay = new Map<number, WeeklySlot[]>();
  WEEKLY_DAYS.forEach(d => {
    slotsByDay.set(d.value, slots.filter(s => s.day === d.value).sort((a, b) => a.start.localeCompare(b.start)));
  });

  // Maksimum ders sayısını bul - hizalama için
  const maxSlots = Math.max(...WEEKLY_DAYS.map(d => (slotsByDay.get(d.value) || []).length));

  const renderDaySection = (day: { value: number; label: string; short: string }) => {
    const daySlots = slotsByDay.get(day.value) || [];
    const emptyRowsNeeded = Math.max(0, maxSlots - daySlots.length);
    
    return (
      <View key={day.value} style={weeklyScheduleStyles.weeklyTable}>
        <View style={weeklyScheduleStyles.weeklyDayHeaderBg}>
          <Text style={weeklyScheduleStyles.weeklyDayName}>{day.label}</Text>
        </View>
        {daySlots.length === 0 ? (
          <>
            <View style={weeklyScheduleStyles.weeklyEmptyRow}>
              <View style={weeklyScheduleStyles.weeklyColTime} />
              <View style={weeklyScheduleStyles.weeklyColSubject}>
                <Text style={weeklyScheduleStyles.weeklyText}>Planlanmış çalışma yok</Text>
              </View>
              <View style={weeklyScheduleStyles.weeklyColStars} />
            </View>
            {[...Array(emptyRowsNeeded - 1)].map((_, i) => (
              <View key={`empty-${i}`} style={weeklyScheduleStyles.weeklyEmptyRow}>
                <View style={weeklyScheduleStyles.weeklyColTime} />
                <View style={weeklyScheduleStyles.weeklyColSubject} />
                <View style={weeklyScheduleStyles.weeklyColStars} />
              </View>
            ))}
          </>
        ) : (
          <>
            {daySlots.map((slot, idx) => {
              const subject = subjects.find(s => s.id === slot.subjectId);
              const duration = toMinutes(slot.end) - toMinutes(slot.start);
              const isLast = idx === daySlots.length - 1 && emptyRowsNeeded === 0;
              const subjectLabel = subject?.category && subject.category !== 'Okul'
                ? `${subject.category} - ${subject?.name || '-'}`
                : subject?.name || '-';
              return (
                <View key={`${day.value}-${idx}`} style={isLast ? [weeklyScheduleStyles.weeklyTableRow, weeklyScheduleStyles.weeklyTableRowLast] : weeklyScheduleStyles.weeklyTableRow}>
                  <View style={weeklyScheduleStyles.weeklyColTime}>
                    <Text style={weeklyScheduleStyles.weeklyTextBold}>{slot.start} - {slot.end}</Text>
                  </View>
                  <View style={weeklyScheduleStyles.weeklyColSubject}>
                    <Text style={weeklyScheduleStyles.weeklyText}>{subjectLabel}</Text>
                  </View>
                  <View style={weeklyScheduleStyles.weeklyColStars}>
                    <View style={{ flexDirection: 'row', gap: 3, justifyContent: 'center' }}>
                      <Image src={STAR_SVG} style={{ width: 12, height: 12 }} />
                      <Image src={STAR_SVG} style={{ width: 12, height: 12 }} />
                      <Image src={STAR_SVG} style={{ width: 12, height: 12 }} />
                      <Image src={STAR_SVG} style={{ width: 12, height: 12 }} />
                    </View>
                  </View>
                </View>
              );
            })}
            {[...Array(emptyRowsNeeded)].map((_, i) => (
              <View key={`empty-${i}`} style={i === emptyRowsNeeded - 1 ? [weeklyScheduleStyles.weeklyEmptyRow, weeklyScheduleStyles.weeklyTableRowLast] : weeklyScheduleStyles.weeklyEmptyRow}>
                <View style={weeklyScheduleStyles.weeklyColTime} />
                <View style={weeklyScheduleStyles.weeklyColSubject} />
                <View style={weeklyScheduleStyles.weeklyColStars} />
              </View>
            ))}
          </>
        )}
      </View>
    );
  };

  const leftDays = WEEKLY_DAYS.slice(0, 4);
  const rightDays = WEEKLY_DAYS.slice(4);

  return (
    <Document>
      <Page size="A4" style={weeklyScheduleStyles.weeklyPage}>
        {/* Header */}
        <View style={weeklyScheduleStyles.weeklyHeader}>
          <View>
            <Text style={weeklyScheduleStyles.weeklyTitle}>HAFTALIK DERS ÇİZELGESİ</Text>
            <Text style={weeklyScheduleStyles.weeklySubtitle}>Kişiselleştirilmiş Öğrenme Programı</Text>
          </View>
          <View style={weeklyScheduleStyles.weeklyHeaderRight}>
            <Text style={weeklyScheduleStyles.weeklyStudentName}>{studentFullName || studentName || studentId}</Text>
            <Text style={weeklyScheduleStyles.weeklyDateRange}>{dateRangeShort}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={weeklyScheduleStyles.weeklyStatsRow}>
          <View style={weeklyScheduleStyles.weeklyStatCard}>
            <Text style={weeklyScheduleStyles.weeklyStatValue}>{slotCount}</Text>
            <Text style={weeklyScheduleStyles.weeklyStatLabel}>Ders Sayısı</Text>
          </View>
          <View style={weeklyScheduleStyles.weeklyStatCard}>
            <Text style={weeklyScheduleStyles.weeklyStatValue}>{uniqueSubjects}</Text>
            <Text style={weeklyScheduleStyles.weeklyStatLabel}>Farklı Ders</Text>
          </View>
          <View style={weeklyScheduleStyles.weeklyStatCard}>
            <Text style={weeklyScheduleStyles.weeklyStatValue}>{totalHours}s {totalMins}dk</Text>
            <Text style={weeklyScheduleStyles.weeklyStatLabel}>Toplam Süre</Text>
          </View>
        </View>

        {/* Two Column Layout */}
        <View style={weeklyScheduleStyles.mainContent}>
          <View style={weeklyScheduleStyles.column}>
            {leftDays.map(renderDaySection)}
          </View>
          <View style={weeklyScheduleStyles.column}>
            {rightDays.map(renderDaySection)}
          </View>
        </View>

        {/* Footer */}
        <View style={weeklyScheduleStyles.weeklyFooter}>
          <Text style={weeklyScheduleStyles.weeklyBrandText}>
            Rehber360 - Akilli Calisma Sistemi - {dateRangeShort}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

function toMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export async function generateWeeklySchedulePDF(
  slots: WeeklySlot[],
  subjects: Subject[],
  totalMinutes: number,
  studentId: string,
  studentName?: string,
  studentFullName?: string,
  options: { download?: boolean; print?: boolean } = { download: true, print: false }
) {
  const blob = await pdf(
    <WeeklyScheduleDocument
      slots={slots}
      subjects={subjects}
      studentId={studentId}
      studentName={studentName}
      studentFullName={studentFullName}
      totalMinutes={totalMinutes}
    />
  ).toBlob();

  const fileName = `Haftalik_Ders_Cizelgesi_${studentName || studentId}.pdf`;

  if (options.print) {
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
    } else {
      URL.revokeObjectURL(url);
    }
  } else if (options.download) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  }

  return blob;
}
