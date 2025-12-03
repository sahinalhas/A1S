import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { StudentDetailedReport } from '../../../../shared/types/exam-management.types.js';

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
    borderTopWidth: 3,
    borderTopColor: '#1a237e',
    paddingTop: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1a237e',
    textAlign: 'center',
    marginBottom: 20,
  },
  studentInfo: {
    fontSize: 12,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginTop: 15,
    marginBottom: 10,
    color: '#1a237e',
  },
  text: {
    fontSize: 10,
    marginBottom: 5,
  },
  subjectItem: {
    fontSize: 10,
    marginBottom: 5,
    marginLeft: 10,
  },
  goalItem: {
    fontSize: 10,
    marginBottom: 5,
    marginLeft: 10,
  },
  recommendation: {
    fontSize: 10,
    marginBottom: 5,
    marginLeft: 10,
  },
  footer: {
    fontSize: 8,
    marginTop: 20,
    color: '#666',
  },
});

interface StudentReportDocumentProps {
  report: StudentDetailedReport;
}

export const StudentReportDocument: React.FC<StudentReportDocumentProps> = ({ report }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Öğrenci Sınav Raporu</Text>
      </View>
      
      <Text style={styles.studentInfo}>Öğrenci: {report.student_info.name}</Text>
      <Text style={styles.studentInfo}>Sınıf: {report.student_info.class}</Text>
      
      <Text style={styles.sectionTitle}>Özet</Text>
      <Text style={styles.text}>Toplam Sınav: {report.summary.total_exams}</Text>
      <Text style={styles.text}>Ortalama Performans: {report.summary.avg_performance.toFixed(2)}</Text>
      <Text style={styles.text}>En İyi Performans: {report.summary.best_performance.toFixed(2)}</Text>
      
      <Text style={styles.sectionTitle}>Ders Bazlı Performans</Text>
      {report.performance_by_subject.map((subject, index) => (
        <Text key={index} style={styles.subjectItem}>
          {subject.subject_name}: {subject.avg_net.toFixed(2)} ({subject.strength_level})
        </Text>
      ))}
      
      {report.goal_progress.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Hedefler</Text>
          {report.goal_progress.map((goal, index) => (
            <Text key={index} style={styles.goalItem}>
              {goal.subject_name || 'Genel'}: {goal.current_net}/{goal.target_net} (%{goal.progress_percentage.toFixed(0)})
            </Text>
          ))}
        </>
      )}
      
      <Text style={styles.sectionTitle}>Öneriler</Text>
      {report.recommendations.map((rec, index) => (
        <Text key={index} style={styles.recommendation}>- {rec}</Text>
      ))}
      
      <Text style={styles.footer}>
        Oluşturulma Tarihi: {new Date(report.generated_at).toLocaleDateString('tr-TR')}
      </Text>
    </Page>
  </Document>
);
