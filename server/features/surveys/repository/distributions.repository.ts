import getDatabase from '../../../lib/database.js';
import type { SurveyDistribution } from '../types/surveys.types.js';
import type BetterSqlite3 from 'better-sqlite3';

interface PreparedStatements {
  getSurveyDistributions: BetterSqlite3.Statement;
  getSurveyDistribution: BetterSqlite3.Statement;
  getSurveyDistributionByLink: BetterSqlite3.Statement;
  insertSurveyDistribution: BetterSqlite3.Statement;
  updateSurveyDistribution: BetterSqlite3.Statement;
  deleteSurveyDistribution: BetterSqlite3.Statement;
}

let statements: PreparedStatements | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getSurveyDistributions: db.prepare('SELECT * FROM survey_distributions ORDER BY created_at DESC'),
    getSurveyDistribution: db.prepare('SELECT * FROM survey_distributions WHERE id = ?'),
    getSurveyDistributionByLink: db.prepare('SELECT * FROM survey_distributions WHERE publicLink = ?'),
    insertSurveyDistribution: db.prepare(`
      INSERT INTO survey_distributions (id, templateId, title, description, targetClasses, targetStudents, 
                                       participationType, excelTemplate, publicLink, startDate, endDate, 
                                       maxResponses, status, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    updateSurveyDistribution: db.prepare(`
      UPDATE survey_distributions SET title = ?, description = ?, targetClasses = ?, targetStudents = ?,
                                     participationType = ?, startDate = ?, endDate = ?,
                                     maxResponses = ?, status = ?
      WHERE id = ?
    `),
    deleteSurveyDistribution: db.prepare('DELETE FROM survey_distributions WHERE id = ?'),
  };
  
  isInitialized = true;
}

interface SurveyDistributionRaw extends Omit<SurveyDistribution, 'targetClasses' | 'targetStudents'> {
  targetClasses: string | null;
  targetStudents: string | null;
}

export function loadSurveyDistributions(): SurveyDistribution[] {
  try {
    ensureInitialized();
    const distributions = statements!.getSurveyDistributions.all() as SurveyDistributionRaw[];
    return distributions.map(distribution => ({
      ...distribution,
      targetClasses: distribution.targetClasses ? JSON.parse(distribution.targetClasses) : [],
      targetStudents: distribution.targetStudents ? JSON.parse(distribution.targetStudents) : []
    }));
  } catch (error) {
    console.error('Error loading survey distributions:', error);
    return [];
  }
}

export function getSurveyDistribution(id: string): SurveyDistribution | null {
  try {
    ensureInitialized();
    const distribution = statements!.getSurveyDistribution.get(id) as SurveyDistributionRaw | undefined;
    if (!distribution) return null;
    
    return {
      ...distribution,
      targetClasses: distribution.targetClasses ? JSON.parse(distribution.targetClasses) : [],
      targetStudents: distribution.targetStudents ? JSON.parse(distribution.targetStudents) : []
    };
  } catch (error) {
    console.error('Error getting survey distribution:', error);
    return null;
  }
}

export function getSurveyDistributionByLink(publicLink: string): SurveyDistribution | null {
  try {
    ensureInitialized();
    const distribution = statements!.getSurveyDistributionByLink.get(publicLink) as SurveyDistributionRaw | undefined;
    if (!distribution) return null;
    
    return {
      ...distribution,
      targetClasses: distribution.targetClasses ? JSON.parse(distribution.targetClasses) : [],
      targetStudents: distribution.targetStudents ? JSON.parse(distribution.targetStudents) : []
    };
  } catch (error) {
    console.error('Error getting survey distribution by link:', error);
    return null;
  }
}

export function saveSurveyDistribution(distribution: Partial<SurveyDistribution>): void {
  try {
    ensureInitialized();
    statements!.insertSurveyDistribution.run(
      distribution.id,
      distribution.templateId,
      distribution.title,
      distribution.description || null,
      distribution.targetClasses ? JSON.stringify(distribution.targetClasses) : null,
      distribution.targetStudents ? JSON.stringify(distribution.targetStudents) : null,
      distribution.participationType || 'PUBLIC',
      distribution.excelTemplate || null,
      distribution.publicLink || null,
      distribution.startDate || null,
      distribution.endDate || null,
      distribution.maxResponses || null,
      distribution.status || 'DRAFT',
      distribution.createdBy || null
    );
  } catch (error) {
    console.error('Error saving survey distribution:', error);
    throw error;
  }
}

export function updateSurveyDistribution(id: string, distribution: Partial<SurveyDistribution>): void {
  try {
    ensureInitialized();
    
    const existingDistribution = getSurveyDistribution(id);
    if (!existingDistribution) {
      throw new Error(`Survey distribution with id ${id} not found`);
    }
    
    const mergedDistribution = {
      ...existingDistribution,
      ...distribution
    };
    
    statements!.updateSurveyDistribution.run(
      mergedDistribution.title,
      mergedDistribution.description || null,
      mergedDistribution.targetClasses ? JSON.stringify(mergedDistribution.targetClasses) : null,
      mergedDistribution.targetStudents ? JSON.stringify(mergedDistribution.targetStudents) : null,
      mergedDistribution.participationType || 'PUBLIC',
      mergedDistribution.startDate || null,
      mergedDistribution.endDate || null,
      mergedDistribution.maxResponses || null,
      mergedDistribution.status || 'DRAFT',
      id
    );
  } catch (error) {
    console.error('Error updating survey distribution:', error);
    throw error;
  }
}

export function deleteSurveyDistribution(id: string): void {
  try {
    ensureInitialized();
    statements!.deleteSurveyDistribution.run(id);
  } catch (error) {
    console.error('Error deleting survey distribution:', error);
    throw error;
  }
}
