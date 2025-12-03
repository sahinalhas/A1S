/**
 * Student Competencies Repository
 * Öğrenci Yetkinlikleri Repository
 */

import type { Database } from 'better-sqlite3';
import type { StudentCompetencyProfile, CompetencyCategory } from '../../../../shared/types/career-guidance.types';

export class StudentCompetenciesRepository {
  constructor(private db: Database) {}

  getStudentCompetencies(studentId: string): StudentCompetencyProfile[] {
    const stmt = this.db.prepare(`
      SELECT * FROM student_competencies 
      WHERE studentId = ? 
      ORDER BY category, competencyName
    `);
    
    return stmt.all(studentId) as StudentCompetencyProfile[];
  }

  getStudentCompetenciesByCategory(
    studentId: string, 
    category: CompetencyCategory
  ): StudentCompetencyProfile[] {
    const stmt = this.db.prepare(`
      SELECT * FROM student_competencies 
      WHERE studentId = ? AND category = ?
      ORDER BY competencyName
    `);
    
    return stmt.all(studentId, category) as StudentCompetencyProfile[];
  }

  getStudentCompetency(
    studentId: string, 
    competencyId: string
  ): StudentCompetencyProfile | null {
    const stmt = this.db.prepare(`
      SELECT * FROM student_competencies 
      WHERE studentId = ? AND competencyId = ?
    `);
    
    return stmt.get(studentId, competencyId) as StudentCompetencyProfile | null;
  }

  upsertStudentCompetency(competency: StudentCompetencyProfile): void {
    const id = `sc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const stmt = this.db.prepare(`
      INSERT INTO student_competencies (
        id, studentId, competencyId, competencyName, category,
        currentLevel, assessmentDate, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(studentId, competencyId) DO UPDATE SET
        competencyName = excluded.competencyName,
        category = excluded.category,
        currentLevel = excluded.currentLevel,
        assessmentDate = excluded.assessmentDate,
        source = excluded.source,
        updatedAt = CURRENT_TIMESTAMP
    `);

    stmt.run(
      id,
      competency.studentId,
      competency.competencyId,
      competency.competencyName,
      competency.category,
      competency.currentLevel,
      competency.assessmentDate,
      competency.source
    );
  }

  batchUpsertCompetencies(competencies: StudentCompetencyProfile[]): void {
    const upsertMany = this.db.transaction((comps: StudentCompetencyProfile[]) => {
      for (const comp of comps) {
        this.upsertStudentCompetency(comp);
      }
    });

    upsertMany(competencies);
  }

  updateCompetencyLevel(
    studentId: string, 
    competencyId: string, 
    newLevel: number
  ): void {
    const stmt = this.db.prepare(`
      UPDATE student_competencies 
      SET currentLevel = ?, 
          assessmentDate = ?, 
          updatedAt = CURRENT_TIMESTAMP
      WHERE studentId = ? AND competencyId = ?
    `);
    
    stmt.run(newLevel, new Date().toISOString(), studentId, competencyId);
  }

  deleteStudentCompetency(studentId: string, competencyId: string): void {
    const stmt = this.db.prepare(`
      DELETE FROM student_competencies 
      WHERE studentId = ? AND competencyId = ?
    `);
    
    stmt.run(studentId, competencyId);
  }

  deleteAllStudentCompetencies(studentId: string): void {
    const stmt = this.db.prepare(`
      DELETE FROM student_competencies WHERE studentId = ?
    `);
    
    stmt.run(studentId);
  }

  getCompetenciesBySource(
    studentId: string, 
    source: StudentCompetencyProfile['source']
  ): StudentCompetencyProfile[] {
    const stmt = this.db.prepare(`
      SELECT * FROM student_competencies 
      WHERE studentId = ? AND source = ?
      ORDER BY category, competencyName
    `);
    
    return stmt.all(studentId, source) as StudentCompetencyProfile[];
  }

  getAverageCompetencyLevel(studentId: string): number {
    const stmt = this.db.prepare(`
      SELECT AVG(currentLevel) as avgLevel 
      FROM student_competencies 
      WHERE studentId = ?
    `);
    
    const result = stmt.get(studentId) as { avgLevel: number | null };
    return result.avgLevel || 0;
  }

  getCompetencyStats(studentId: string): {
    total: number;
    byCategory: Record<string, number>;
    averageLevel: number;
  } {
    const competencies = this.getStudentCompetencies(studentId);
    
    const byCategory: Record<string, number> = {};
    let totalLevel = 0;

    for (const comp of competencies) {
      byCategory[comp.category] = (byCategory[comp.category] || 0) + 1;
      totalLevel += comp.currentLevel;
    }

    return {
      total: competencies.length,
      byCategory,
      averageLevel: competencies.length > 0 ? totalLevel / competencies.length : 0
    };
  }
}
