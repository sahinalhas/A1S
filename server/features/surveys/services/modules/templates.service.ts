import * as repository from '../../repository/index.js';
import { sanitizeString } from '../../../../middleware/validation.js';
import type { SurveyTemplate } from '../../types/surveys.types.js';
import { seedSurveysDefaultTemplates } from '../../../../lib/database/schema/surveys.schema.js';
import getDatabase from '../../../../lib/database.js';

export function getAllTemplates() {
  return repository.loadSurveyTemplates();
}

export function getTemplateById(id: string) {
  return repository.getSurveyTemplate(id);
}

export function createTemplate(template: SurveyTemplate) {
  const sanitizedTemplate = {
    ...template,
    title: sanitizeString(template.title),
    description: template.description ? sanitizeString(template.description) : undefined
  };
  
  repository.saveSurveyTemplate(sanitizedTemplate as SurveyTemplate);
}

export function updateTemplate(id: string, template: Partial<SurveyTemplate>) {
  const sanitizedTemplate = {
    ...template,
    title: template.title ? sanitizeString(template.title) : undefined,
    description: template.description ? sanitizeString(template.description) : undefined
  };
  
  repository.updateSurveyTemplate(id, sanitizedTemplate);
}

export function deleteTemplate(id: string) {
  repository.deleteSurveyTemplate(id);
}

export function resetToDefaults(): void {
  const db = getDatabase();
  repository.deleteAllTemplates();
  seedSurveysDefaultTemplates(db);
}
