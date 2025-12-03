/**
 * Career Roadmap Repository
 * Kariyer Yol Haritası Repository
 */

import type { Database } from 'better-sqlite3';
import type { CareerRoadmap, CareerRoadmapEntity } from '../../../../shared/types/career-guidance.types';

export class CareerRoadmapRepository {
  constructor(private db: Database) {}

  createCareerRoadmap(roadmap: CareerRoadmap): void {
    const stmt = this.db.prepare(`
      INSERT INTO career_roadmaps (
        id, studentId, targetCareerId, targetCareerName,
        currentMatchScore, projectedMatchScore, estimatedCompletionTime,
        developmentSteps, aiRecommendations, motivationalInsights, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      roadmap.id,
      roadmap.studentId,
      roadmap.targetCareerId,
      roadmap.targetCareerName,
      roadmap.currentMatchScore,
      roadmap.projectedMatchScore,
      roadmap.estimatedCompletionTime,
      JSON.stringify(roadmap.developmentSteps),
      JSON.stringify(roadmap.aiRecommendations),
      JSON.stringify(roadmap.motivationalInsights),
      'ACTIVE'
    );
  }

  getActiveRoadmap(studentId: string): CareerRoadmap | null {
    const stmt = this.db.prepare(`
      SELECT * FROM career_roadmaps 
      WHERE studentId = ? AND status = 'ACTIVE'
      ORDER BY createdAt DESC 
      LIMIT 1
    `);
    
    const row = stmt.get(studentId) as CareerRoadmapEntity | undefined;
    return row ? this.entityToModel(row) : null;
  }

  getRoadmapById(id: string): CareerRoadmap | null {
    const stmt = this.db.prepare(`
      SELECT * FROM career_roadmaps WHERE id = ?
    `);
    
    const row = stmt.get(id) as CareerRoadmapEntity | undefined;
    return row ? this.entityToModel(row) : null;
  }

  getAllRoadmapsForStudent(studentId: string): CareerRoadmap[] {
    const stmt = this.db.prepare(`
      SELECT * FROM career_roadmaps 
      WHERE studentId = ? 
      ORDER BY createdAt DESC
    `);
    
    const rows = stmt.all(studentId) as CareerRoadmapEntity[];
    return rows.map(this.entityToModel);
  }

  updateRoadmap(id: string, updates: Partial<CareerRoadmap>): void {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.currentMatchScore !== undefined) {
      fields.push('currentMatchScore = ?');
      values.push(updates.currentMatchScore);
    }
    if (updates.projectedMatchScore !== undefined) {
      fields.push('projectedMatchScore = ?');
      values.push(updates.projectedMatchScore);
    }
    if (updates.estimatedCompletionTime) {
      fields.push('estimatedCompletionTime = ?');
      values.push(updates.estimatedCompletionTime);
    }
    if (updates.developmentSteps) {
      fields.push('developmentSteps = ?');
      values.push(JSON.stringify(updates.developmentSteps));
    }
    if (updates.aiRecommendations) {
      fields.push('aiRecommendations = ?');
      values.push(JSON.stringify(updates.aiRecommendations));
    }
    if (updates.motivationalInsights) {
      fields.push('motivationalInsights = ?');
      values.push(JSON.stringify(updates.motivationalInsights));
    }

    if (fields.length === 0) return;

    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE career_roadmaps 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `);

    stmt.run(...values);
  }

  updateRoadmapStatus(id: string, status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'): void {
    const stmt = this.db.prepare(`
      UPDATE career_roadmaps 
      SET status = ?, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    stmt.run(status, id);
  }

  archiveActiveRoadmaps(studentId: string): void {
    const stmt = this.db.prepare(`
      UPDATE career_roadmaps 
      SET status = 'ARCHIVED', updatedAt = CURRENT_TIMESTAMP 
      WHERE studentId = ? AND status = 'ACTIVE'
    `);
    
    stmt.run(studentId);
  }

  deleteRoadmap(id: string, schoolId?: string): void {
    if (schoolId) {
      const stmt = this.db.prepare(`
        DELETE FROM career_roadmaps 
        WHERE id = ? AND studentId IN (
          SELECT id FROM students WHERE schoolId = ?
        )
      `);
      stmt.run(id, schoolId);
    } else {
      const stmt = this.db.prepare('DELETE FROM career_roadmaps WHERE id = ?');
      stmt.run(id);
    }
  }

  getRoadmapsByCareer(careerId: string): CareerRoadmap[] {
    const stmt = this.db.prepare(`
      SELECT * FROM career_roadmaps 
      WHERE targetCareerId = ? 
      ORDER BY createdAt DESC
    `);
    
    const rows = stmt.all(careerId) as CareerRoadmapEntity[];
    return rows.map(this.entityToModel);
  }

  private entityToModel(entity: CareerRoadmapEntity): CareerRoadmap {
    return {
      id: entity.id,
      studentId: entity.studentId,
      targetCareerId: entity.targetCareerId,
      targetCareerName: entity.targetCareerName,
      currentMatchScore: entity.currentMatchScore,
      projectedMatchScore: entity.projectedMatchScore,
      estimatedCompletionTime: entity.estimatedCompletionTime,
      developmentSteps: JSON.parse(entity.developmentSteps),
      aiRecommendations: JSON.parse(entity.aiRecommendations),
      motivationalInsights: JSON.parse(entity.motivationalInsights),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }
}
