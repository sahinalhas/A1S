import getDatabase from '../../../lib/database.js';
import type { SurveyTemplate } from '../types/surveys.types.js';
import type BetterSqlite3 from 'better-sqlite3';

interface PreparedStatements {
  getSurveyTemplates: BetterSqlite3.Statement;
  getSurveyTemplate: BetterSqlite3.Statement;
  insertSurveyTemplate: BetterSqlite3.Statement;
  updateSurveyTemplate: BetterSqlite3.Statement;
  deleteSurveyTemplate: BetterSqlite3.Statement;
}

let statements: PreparedStatements | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getSurveyTemplates: db.prepare('SELECT * FROM survey_templates ORDER BY created_at DESC'),
    getSurveyTemplate: db.prepare('SELECT * FROM survey_templates WHERE id = ?'),
    insertSurveyTemplate: db.prepare(`
      INSERT INTO survey_templates (id, title, description, createdBy, tags, targetAudience)
      VALUES (?, ?, ?, ?, ?, ?)
    `),
    updateSurveyTemplate: db.prepare(`
      UPDATE survey_templates SET title = ?, description = ?, tags = ?, targetAudience = ?
      WHERE id = ?
    `),
    deleteSurveyTemplate: db.prepare('DELETE FROM survey_templates WHERE id = ?'),
  };
  
  isInitialized = true;
}

export function loadSurveyTemplates(): SurveyTemplate[] {
  try {
    ensureInitialized();
    const templates = statements!.getSurveyTemplates.all() as (SurveyTemplate & { tags: string | null })[];
    return templates.map(template => ({
      ...template,
      tags: template.tags ? JSON.parse(template.tags) : []
    }));
  } catch (error) {
    console.error('Error loading survey templates:', error);
    return [];
  }
}

export function getSurveyTemplate(id: string): SurveyTemplate | null {
  try {
    ensureInitialized();
    const template = statements!.getSurveyTemplate.get(id) as (SurveyTemplate & { tags: string | null }) | undefined;
    if (!template) return null;
    
    return {
      ...template,
      tags: template.tags ? JSON.parse(template.tags) : []
    };
  } catch (error) {
    console.error('Error getting survey template:', error);
    return null;
  }
}

export function saveSurveyTemplate(template: SurveyTemplate): void {
  try {
    ensureInitialized();
    statements!.insertSurveyTemplate.run(
      template.id,
      template.title,
      template.description || null,
      template.createdBy || null,
      template.tags ? JSON.stringify(template.tags) : null,
      template.targetAudience || 'STUDENT'
    );
  } catch (error) {
    console.error('Error saving survey template:', error);
    throw error;
  }
}

export function updateSurveyTemplate(id: string, template: Partial<SurveyTemplate>): void {
  try {
    ensureInitialized();
    
    const existingTemplate = getSurveyTemplate(id);
    if (!existingTemplate) {
      throw new Error(`Survey template with id ${id} not found`);
    }
    
    const mergedTemplate = {
      ...existingTemplate,
      ...template,
      id: existingTemplate.id,
      createdBy: existingTemplate.createdBy,
      created_at: existingTemplate.created_at
    };
    
    statements!.updateSurveyTemplate.run(
      mergedTemplate.title,
      mergedTemplate.description || null,
      mergedTemplate.tags && mergedTemplate.tags.length > 0 ? JSON.stringify(mergedTemplate.tags) : null,
      mergedTemplate.targetAudience || 'STUDENT',
      id
    );
  } catch (error) {
    console.error('Error updating survey template:', error);
    throw error;
  }
}

export function deleteSurveyTemplate(id: string): void {
  try {
    ensureInitialized();
    statements!.deleteSurveyTemplate.run(id);
  } catch (error) {
    console.error('Error deleting survey template:', error);
    throw error;
  }
}

export function deleteAllTemplates(): void {
  try {
    const db = getDatabase();
    db.prepare('DELETE FROM survey_questions').run();
    db.prepare('DELETE FROM survey_templates').run();
  } catch (error) {
    console.error('Error deleting all survey templates:', error);
    throw error;
  }
}
