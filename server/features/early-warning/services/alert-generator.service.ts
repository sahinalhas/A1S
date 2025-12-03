import { randomUUID } from 'crypto';
import type { EarlyWarningAlert, RiskFactorData } from '../../../../shared/types/early-warning.types';

export function generateAcademicAlerts(
  studentId: string,
  data: RiskFactorData['academicPerformance'],
  academicScore: number
): EarlyWarningAlert[] {
  const alerts: EarlyWarningAlert[] = [];
  
  if (!data) return alerts;
  
  if (data.gpa !== undefined && data.gpa < 2.0) {
    alerts.push({
      id: randomUUID(),
      studentId,
      alertType: 'AKADEMİK',
      alertLevel: 'KRİTİK',
      title: 'Kritik Akademik Performans',
      description: `Öğrencinin genel not ortalaması ${data.gpa.toFixed(2)} ile kritik seviyede. Acil müdahale gerekiyor.`,
      triggerCondition: 'GPA < 2.0',
      triggerValue: data.gpa.toString(),
      threshold: '2.0',
      dataSource: 'academic_records',
      status: 'AÇIK'
    });
  }
  
  if (data.failingSubjects && data.failingSubjects >= 3) {
    alerts.push({
      id: randomUUID(),
      studentId,
      alertType: 'AKADEMİK',
      alertLevel: 'YÜKSEK',
      title: 'Çoklu Ders Başarısızlığı',
      description: `Öğrenci ${data.failingSubjects} dersten başarısız durumda. Ders bazlı destek planlanmalı.`,
      triggerCondition: 'Failing Subjects >= 3',
      triggerValue: data.failingSubjects.toString(),
      threshold: '3',
      dataSource: 'academic_records',
      status: 'AÇIK'
    });
  }
  
  if (data.gradeDecline) {
    alerts.push({
      id: randomUUID(),
      studentId,
      alertType: 'AKADEMİK',
      alertLevel: 'ORTA',
      title: 'Akademik Performans Düşüşü',
      description: 'Son dönemde öğrencinin notlarında düşüş gözlemlendi. Nedenleri araştırılmalı.',
      triggerCondition: 'Grade Decline Detected',
      triggerValue: 'true',
      threshold: 'N/A',
      dataSource: 'academic_records',
      status: 'AÇIK'
    });
  }
  
  if (data.recentExamScores && data.recentExamScores.length > 0) {
    const avgScore = data.recentExamScores.reduce((a, b) => a + b, 0) / data.recentExamScores.length;
    if (avgScore < 40) {
      alerts.push({
        id: randomUUID(),
        studentId,
        alertType: 'AKADEMİK',
        alertLevel: 'YÜKSEK',
        title: 'Düşük Sınav Performansı',
        description: `Son sınavlarda ortalama ${avgScore.toFixed(1)} puan ile düşük performans. Ek çalışma desteği önerilir.`,
        triggerCondition: 'Recent Exam Average < 40',
        triggerValue: avgScore.toFixed(1),
        threshold: '40',
        dataSource: 'exam_results',
        status: 'AÇIK'
      });
    }
  }
  
  return alerts;
}

export function generateBehavioralAlerts(
  studentId: string,
  data: RiskFactorData['behaviorData'],
  behavioralScore: number
): EarlyWarningAlert[] {
  const alerts: EarlyWarningAlert[] = [];
  
  if (!data) return alerts;
  
  if (data.seriousIncidents && data.seriousIncidents >= 3) {
    alerts.push({
      id: randomUUID(),
      studentId,
      alertType: 'DAVRANIŞSAL',
      alertLevel: 'KRİTİK',
      title: 'Ciddi Davranış Sorunları',
      description: `${data.seriousIncidents} ciddi davranış olayı kaydedildi. Acil davranış müdahale planı gerekli.`,
      triggerCondition: 'Serious Incidents >= 3',
      triggerValue: data.seriousIncidents.toString(),
      threshold: '3',
      dataSource: 'behavior_incidents',
      status: 'AÇIK'
    });
  }
  
  if (data.recentIncidentCount && data.recentIncidentCount >= 5) {
    alerts.push({
      id: randomUUID(),
      studentId,
      alertType: 'DAVRANIŞSAL',
      alertLevel: 'YÜKSEK',
      title: 'Yoğun Davranış Olayları',
      description: `Son dönemde ${data.recentIncidentCount} davranış olayı yaşandı. Patern analizi yapılmalı.`,
      triggerCondition: 'Recent Incidents >= 5',
      triggerValue: data.recentIncidentCount.toString(),
      threshold: '5',
      dataSource: 'behavior_incidents',
      status: 'AÇIK'
    });
  }
  
  if (data.totalIncidents && data.positiveCount !== undefined) {
    const negativeRatio = (data.totalIncidents - data.positiveCount) / data.totalIncidents;
    if (negativeRatio > 0.7) {
      alerts.push({
        id: randomUUID(),
        studentId,
        alertType: 'DAVRANIŞSAL',
        alertLevel: 'ORTA',
        title: 'Negatif Davranış Eğilimi',
        description: `Davranış kayıtlarının %${(negativeRatio * 100).toFixed(0)}'ı negatif. Pozitif pekiştirme stratejileri uygulanmalı.`,
        triggerCondition: 'Negative Behavior Ratio > 0.7',
        triggerValue: negativeRatio.toFixed(2),
        threshold: '0.7',
        dataSource: 'behavior_incidents',
        status: 'AÇIK'
      });
    }
  }
  
  return alerts;
}

export function generateAttendanceAlerts(
  studentId: string,
  data: RiskFactorData['attendanceData'],
  attendanceScore: number
): EarlyWarningAlert[] {
  const alerts: EarlyWarningAlert[] = [];
  
  if (!data) return alerts;
  
  if (data.attendanceRate !== undefined && data.attendanceRate < 70) {
    alerts.push({
      id: randomUUID(),
      studentId,
      alertType: 'DEVAMSIZLIK',
      alertLevel: data.attendanceRate < 50 ? 'KRİTİK' : 'YÜKSEK',
      title: 'Düşük Devam Oranı',
      description: `Devam oranı %${data.attendanceRate.toFixed(1)} ile kritik seviyede. Aile görüşmesi planlanmalı.`,
      triggerCondition: 'Attendance Rate < 70%',
      triggerValue: data.attendanceRate.toFixed(1),
      threshold: '70',
      dataSource: 'attendance',
      status: 'AÇIK'
    });
  }
  
  if (data.absentDays && data.excusedAbsences !== undefined) {
    const unexcusedAbsences = data.absentDays - data.excusedAbsences;
    if (unexcusedAbsences > 5) {
      alerts.push({
        id: randomUUID(),
        studentId,
        alertType: 'DEVAMSIZLIK',
        alertLevel: 'YÜKSEK',
        title: 'Mazeretsiz Devamsızlık',
        description: `${unexcusedAbsences} gün mazeretsiz devamsızlık. Nedenleri araştırılmalı.`,
        triggerCondition: 'Unexcused Absences > 5',
        triggerValue: unexcusedAbsences.toString(),
        threshold: '5',
        dataSource: 'attendance',
        status: 'AÇIK'
      });
    }
  }
  
  if (data.tardyDays && data.tardyDays > 10) {
    alerts.push({
      id: randomUUID(),
      studentId,
      alertType: 'DEVAMSIZLIK',
      alertLevel: 'ORTA',
      title: 'Sık Geç Kalma',
      description: `${data.tardyDays} gün gecikmeli geldi. Sabah rutini kontrol edilmeli.`,
      triggerCondition: 'Tardy Days > 10',
      triggerValue: data.tardyDays.toString(),
      threshold: '10',
      dataSource: 'attendance',
      status: 'AÇIK'
    });
  }
  
  return alerts;
}

export function generateSocialEmotionalAlerts(
  studentId: string,
  data: RiskFactorData['socialEmotionalData'],
  socialEmotionalScore: number
): EarlyWarningAlert[] {
  const alerts: EarlyWarningAlert[] = [];
  
  if (!data) return alerts;
  
  if (data.counselingSessionCount && data.counselingSessionCount > 8) {
    alerts.push({
      id: randomUUID(),
      studentId,
      alertType: 'SOSYAL-DUYGUSAL',
      alertLevel: 'YÜKSEK',
      title: 'Yoğun Rehberlik İhtiyacı',
      description: `${data.counselingSessionCount} rehberlik görüşmesi yapıldı. Uzman destek değerlendirilmeli.`,
      triggerCondition: 'Counseling Sessions > 8',
      triggerValue: data.counselingSessionCount.toString(),
      threshold: '8',
      dataSource: 'counseling_sessions',
      status: 'AÇIK'
    });
  }
  
  if (data.supportLevel === 'YÜKSEK' || data.supportLevel === 'KRİTİK') {
    alerts.push({
      id: randomUUID(),
      studentId,
      alertType: 'SOSYAL-DUYGUSAL',
      alertLevel: 'KRİTİK',
      title: 'Kritik Destek İhtiyacı',
      description: 'Öğrencinin sosyal-duygusal destek ihtiyacı kritik seviyede. Uzman yönlendirmesi yapılmalı.',
      triggerCondition: 'Support Level = CRITICAL',
      triggerValue: data.supportLevel,
      threshold: 'YÜKSEK',
      dataSource: 'counseling_records',
      status: 'AÇIK'
    });
  }
  
  if (data.recentConcerns && data.recentConcerns.length >= 3) {
    alerts.push({
      id: randomUUID(),
      studentId,
      alertType: 'SOSYAL-DUYGUSAL',
      alertLevel: 'ORTA',
      title: 'Çoklu Endişe İşaretleri',
      description: `${data.recentConcerns.length} farklı endişe alanı tespit edildi: ${data.recentConcerns.join(', ')}`,
      triggerCondition: 'Recent Concerns >= 3',
      triggerValue: data.recentConcerns.length.toString(),
      threshold: '3',
      dataSource: 'counseling_records',
      status: 'AÇIK'
    });
  }
  
  return alerts;
}

export function generateAllAlerts(
  studentId: string,
  data: RiskFactorData,
  scores: { academic: number; behavioral: number; attendance: number; socialEmotional: number }
): EarlyWarningAlert[] {
  const alerts: EarlyWarningAlert[] = [
    ...generateAcademicAlerts(studentId, data.academicPerformance, scores.academic),
    ...generateBehavioralAlerts(studentId, data.behaviorData, scores.behavioral),
    ...generateAttendanceAlerts(studentId, data.attendanceData, scores.attendance),
    ...generateSocialEmotionalAlerts(studentId, data.socialEmotionalData, scores.socialEmotional)
  ];
  
  return alerts;
}
