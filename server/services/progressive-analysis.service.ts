/**
 * Progressive Analysis Service
 * Aşamalı Analiz Servisi - Veriyi parça parça yükler
 */

import type {
  BasicStudentInfo,
  AcademicSummary,
  BehaviorSummary,
  StreamChunk,
} from '../../shared/types/progressive-loading.types.js';
import Database from 'better-sqlite3';
import getDatabase from '../lib/database.js';

export class ProgressiveAnalysisService {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * 1. Temel öğrenci bilgileri (en hızlı - 10-50ms)
   * İlk ekranda hemen gösterilecek temel bilgiler
   */
  async getBasicInfo(studentId: string): Promise<BasicStudentInfo> {
    const student = this.db.prepare(`
      SELECT 
        id,
        student_number as studentNumber,
        first_name || ' ' || last_name as name,
        grade,
        class_name as className,
        profile_photo_url as profilePhoto,
        updated_at as lastUpdated
      FROM students
      WHERE id = ?
    `).get(studentId) as any;

    if (!student) {
      throw new Error(`Öğrenci bulunamadı: ${studentId}`);
    }

    return {
      id: student.id,
      name: student.name,
      studentNumber: student.studentNumber,
      grade: student.grade,
      className: student.className || undefined,
      profilePhoto: student.profilePhoto || undefined,
      lastUpdated: new Date(student.lastUpdated || Date.now()).toISOString(),
    };
  }

  /**
   * 2. Akademik özet (hızlı - 50-200ms)
   * Notlar, devamsızlık, akademik performans
   */
  async getAcademicSummary(studentId: string): Promise<AcademicSummary> {
    // Ortalama hesapla
    const gradeStats = this.db.prepare(`
      SELECT 
        AVG(CAST(grade_value AS REAL)) as avgGrade,
        COUNT(*) as gradeCount
      FROM exam_grades
      WHERE student_id = ?
    `).get(studentId) as any;

    // Devamsızlık hesapla
    const attendanceStats = this.db.prepare(`
      SELECT 
        COUNT(*) as totalDays,
        SUM(CASE WHEN status = 'PRESENT' THEN 1 ELSE 0 END) as presentDays
      FROM attendance_records
      WHERE student_id = ?
    `).get(studentId) as any;

    // Güçlü ve zayıf dersler
    const subjectPerformance = this.db.prepare(`
      SELECT 
        s.name as subjectName,
        AVG(CAST(eg.grade_value AS REAL)) as avgGrade
      FROM exam_grades eg
      JOIN exams e ON eg.exam_id = e.id
      JOIN subjects s ON e.subject_id = s.id
      WHERE eg.student_id = ?
      GROUP BY s.id, s.name
      ORDER BY avgGrade DESC
    `).all(studentId) as any[];

    const strongSubjects = subjectPerformance
      .filter(s => s.avgGrade >= 80)
      .map(s => s.subjectName)
      .slice(0, 3);

    const weakSubjects = subjectPerformance
      .filter(s => s.avgGrade < 60)
      .map(s => s.subjectName)
      .slice(0, 3);

    // Trend analizi (son 3 sınav vs önceki 3 sınav)
    const recentGrades = this.db.prepare(`
      SELECT grade_value
      FROM exam_grades
      WHERE student_id = ?
      ORDER BY created_at DESC
      LIMIT 6
    `).all(studentId) as any[];

    let trend: 'IMPROVING' | 'STABLE' | 'DECLINING' = 'STABLE';
    if (recentGrades.length >= 6) {
      const recent = recentGrades.slice(0, 3).reduce((sum, g) => sum + parseFloat(g.grade_value), 0) / 3;
      const older = recentGrades.slice(3, 6).reduce((sum, g) => sum + parseFloat(g.grade_value), 0) / 3;
      
      if (recent > older + 5) trend = 'IMPROVING';
      else if (recent < older - 5) trend = 'DECLINING';
    }

    return {
      gpa: gradeStats?.avgGrade || 0,
      gradeCount: gradeStats?.gradeCount || 0,
      averageAttendance: attendanceStats?.totalDays > 0 
        ? (attendanceStats.presentDays / attendanceStats.totalDays) * 100 
        : 100,
      strongSubjects,
      weakSubjects,
      recentTrend: trend,
    };
  }

  /**
   * 3. Davranış özeti (orta hızlı - 100-300ms)
   * Davranış notları, görüşmeler, olaylar
   */
  async getBehaviorSummary(studentId: string): Promise<BehaviorSummary> {
    // Davranış puanı hesapla
    const behaviorScore = this.db.prepare(`
      SELECT behavior_score
      FROM student_behavior_scores
      WHERE student_id = ?
      ORDER BY calculated_at DESC
      LIMIT 1
    `).get(studentId) as any;

    // Olaylar
    const incidents = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN severity = 'POSITIVE' THEN 1 ELSE 0 END) as positive,
        SUM(CASE WHEN severity IN ('MINOR', 'MAJOR', 'SEVERE') THEN 1 ELSE 0 END) as negative,
        MAX(incident_date) as lastIncidentDate
      FROM behavior_incidents
      WHERE student_id = ?
    `).get(studentId) as any;

    // Görüşme sayısı
    const sessionCount = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM counseling_sessions
      WHERE student_id = ?
    `).get(studentId) as any;

    // Trend analizi
    const recentIncidents = this.db.prepare(`
      SELECT severity
      FROM behavior_incidents
      WHERE student_id = ?
      ORDER BY incident_date DESC
      LIMIT 10
    `).all(studentId) as any[];

    let trend: 'IMPROVING' | 'STABLE' | 'CONCERNING' = 'STABLE';
    const negativeCount = recentIncidents.filter(i => 
      ['MINOR', 'MAJOR', 'SEVERE'].includes(i.severity)
    ).length;
    
    if (negativeCount === 0) trend = 'IMPROVING';
    else if (negativeCount >= 5) trend = 'CONCERNING';

    return {
      behaviorScore: behaviorScore?.behavior_score || 75,
      positiveIncidents: incidents?.positive || 0,
      negativeIncidents: incidents?.negative || 0,
      counselingSessionCount: sessionCount?.count || 0,
      lastIncidentDate: incidents?.lastIncidentDate || undefined,
      overallTrend: trend,
    };
  }

  /**
   * 4. Psikolojik analiz (yavaş - AI kullanır, 2-5 saniye)
   * Opsiyonel: AI analizi gerektiğinde çağrılır
   */
  async getPsychologicalAnalysis(studentId: string): Promise<any> {
    // Bu kısım mevcut psychological service'i kullanır
    // Burada sadece placeholder dönüyoruz
    // Gerçek implementasyonda PsychologicalDepthAnalysisService çağrılır
    
    return {
      note: 'AI analizi için ilgili service çağrılmalı',
      studentId,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Stream chunk oluşturur
   */
  createChunk<T>(type: StreamChunk['type'], data: T, progress: number): StreamChunk<T> {
    return {
      type,
      data,
      timestamp: new Date().toISOString(),
      progress,
    };
  }
}
