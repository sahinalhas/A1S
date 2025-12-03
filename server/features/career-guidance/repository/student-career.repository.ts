/**
 * Student Career Repository
 * Öğrenci Kariyer Repository
 */

import type { Database } from 'better-sqlite3';
import type { 
  StudentCareerTargetEntity, 
  CareerAnalysisHistoryEntity,
  CareerAnalysisResult 
} from '../../../../shared/types/career-guidance.types';

export class StudentCareerRepository {
  constructor(private db: Database) {}

  getStudentCareerTarget(studentId: string): StudentCareerTargetEntity | null {
    const stmt = this.db.prepare(`
      SELECT * FROM student_career_targets 
      WHERE studentId = ? 
      ORDER BY createdAt DESC 
      LIMIT 1
    `);
    
    return stmt.get(studentId) as StudentCareerTargetEntity | null;
  }

  setStudentCareerTarget(studentId: string, careerId: string, notes?: string): void {
    const id = `sct_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = this.db.prepare(`
      INSERT INTO student_career_targets (
        id, studentId, careerId, setDate, notes
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(studentId, careerId) DO UPDATE SET
        setDate = excluded.setDate,
        notes = excluded.notes,
        updatedAt = CURRENT_TIMESTAMP
    `);

    stmt.run(id, studentId, careerId, new Date().toISOString(), notes || null);
  }

  removeStudentCareerTarget(studentId: string, careerId: string): void {
    const stmt = this.db.prepare(`
      DELETE FROM student_career_targets 
      WHERE studentId = ? AND careerId = ?
    `);
    
    stmt.run(studentId, careerId);
  }

  saveCareerAnalysis(studentId: string, analysisResult: CareerAnalysisResult): void {
    const id = `cah_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = this.db.prepare(`
      INSERT INTO career_analysis_history (
        id, studentId, analysisDate, analysisResult
      ) VALUES (?, ?, ?, ?)
    `);

    stmt.run(
      id,
      studentId,
      new Date().toISOString(),
      JSON.stringify(analysisResult)
    );
  }

  getCareerAnalysisHistory(studentId: string, limit: number = 10): CareerAnalysisResult[] {
    const stmt = this.db.prepare(`
      SELECT analysisResult FROM career_analysis_history 
      WHERE studentId = ? 
      ORDER BY analysisDate DESC 
      LIMIT ?
    `);
    
    const rows = stmt.all(studentId, limit) as { analysisResult: string }[];
    return rows.map(row => JSON.parse(row.analysisResult));
  }

  getLatestCareerAnalysis(studentId: string): CareerAnalysisResult | null {
    const stmt = this.db.prepare(`
      SELECT analysisResult FROM career_analysis_history 
      WHERE studentId = ? 
      ORDER BY analysisDate DESC 
      LIMIT 1
    `);
    
    const row = stmt.get(studentId) as { analysisResult: string } | undefined;
    return row ? JSON.parse(row.analysisResult) : null;
  }

  deleteCareerAnalysisHistory(studentId: string): void {
    const stmt = this.db.prepare(`
      DELETE FROM career_analysis_history WHERE studentId = ?
    `);
    
    stmt.run(studentId);
  }

  getStudentsByCareerTarget(careerId: string): string[] {
    const stmt = this.db.prepare(`
      SELECT DISTINCT studentId FROM student_career_targets 
      WHERE careerId = ?
    `);
    
    const rows = stmt.all(careerId) as { studentId: string }[];
    return rows.map(row => row.studentId);
  }
}
