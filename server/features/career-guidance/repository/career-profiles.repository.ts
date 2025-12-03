/**
 * Career Profiles Repository
 * Meslek Profilleri Repository
 */

import type { Database } from 'better-sqlite3';
import type { CareerProfile, CareerProfileEntity, CareerCategory } from '../../../../shared/types/career-guidance.types';

export class CareerProfilesRepository {
  constructor(private db: Database) {}

  getAllCareerProfiles(): CareerProfile[] {
    const stmt = this.db.prepare(`
      SELECT * FROM career_profiles ORDER BY name ASC
    `);
    
    const rows = stmt.all() as CareerProfileEntity[];
    return rows.map(this.entityToModel);
  }

  getCareerProfileById(id: string): CareerProfile | null {
    const stmt = this.db.prepare(`
      SELECT * FROM career_profiles WHERE id = ?
    `);
    
    const row = stmt.get(id) as CareerProfileEntity | undefined;
    return row ? this.entityToModel(row) : null;
  }

  getCareerProfilesByCategory(category: CareerCategory): CareerProfile[] {
    const stmt = this.db.prepare(`
      SELECT * FROM career_profiles WHERE category = ? ORDER BY name ASC
    `);
    
    const rows = stmt.all(category) as CareerProfileEntity[];
    return rows.map(this.entityToModel);
  }

  searchCareerProfiles(searchTerm: string): CareerProfile[] {
    const stmt = this.db.prepare(`
      SELECT * FROM career_profiles 
      WHERE name LIKE ? OR description LIKE ?
      ORDER BY name ASC
    `);
    
    const term = `%${searchTerm}%`;
    const rows = stmt.all(term, term) as CareerProfileEntity[];
    return rows.map(this.entityToModel);
  }

  getCareerProfilesByIds(ids: string[]): CareerProfile[] {
    if (ids.length === 0) return [];
    
    const placeholders = ids.map(() => '?').join(',');
    const stmt = this.db.prepare(`
      SELECT * FROM career_profiles 
      WHERE id IN (${placeholders})
      ORDER BY name ASC
    `);
    
    const rows = stmt.all(...ids) as CareerProfileEntity[];
    return rows.map(this.entityToModel);
  }

  createCareerProfile(profile: CareerProfile): void {
    const stmt = this.db.prepare(`
      INSERT INTO career_profiles (
        id, name, category, description, requiredEducationLevel,
        averageSalary, jobOutlook, workEnvironment, requiredCompetencies
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      profile.id,
      profile.name,
      profile.category,
      profile.description,
      profile.requiredEducationLevel,
      profile.averageSalary || null,
      profile.jobOutlook || null,
      profile.workEnvironment || null,
      JSON.stringify(profile.requiredCompetencies)
    );
  }

  updateCareerProfile(id: string, updates: Partial<CareerProfile>): void {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.name) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.category) {
      fields.push('category = ?');
      values.push(updates.category);
    }
    if (updates.description) {
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.requiredEducationLevel) {
      fields.push('requiredEducationLevel = ?');
      values.push(updates.requiredEducationLevel);
    }
    if (updates.averageSalary !== undefined) {
      fields.push('averageSalary = ?');
      values.push(updates.averageSalary);
    }
    if (updates.jobOutlook !== undefined) {
      fields.push('jobOutlook = ?');
      values.push(updates.jobOutlook);
    }
    if (updates.workEnvironment !== undefined) {
      fields.push('workEnvironment = ?');
      values.push(updates.workEnvironment);
    }
    if (updates.requiredCompetencies) {
      fields.push('requiredCompetencies = ?');
      values.push(JSON.stringify(updates.requiredCompetencies));
    }

    if (fields.length === 0) return;

    fields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = this.db.prepare(`
      UPDATE career_profiles 
      SET ${fields.join(', ')} 
      WHERE id = ?
    `);

    stmt.run(...values);
  }

  deleteCareerProfile(id: string, schoolId?: string): void {
    if (schoolId) {
      const stmt = this.db.prepare(`
        DELETE FROM career_profiles 
        WHERE id = ? AND school_id = ?
      `);
      stmt.run(id, schoolId);
    } else {
      const stmt = this.db.prepare('DELETE FROM career_profiles WHERE id = ?');
      stmt.run(id);
    }
  }

  private entityToModel(entity: CareerProfileEntity): CareerProfile {
    return {
      id: entity.id,
      name: entity.name,
      category: entity.category,
      description: entity.description,
      requiredEducationLevel: entity.requiredEducationLevel,
      averageSalary: entity.averageSalary,
      jobOutlook: entity.jobOutlook,
      workEnvironment: entity.workEnvironment,
      requiredCompetencies: JSON.parse(entity.requiredCompetencies),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }
}
