import * as repository from '../../repository/index.js';
import { sanitizeQuestionData } from '../../../../utils/validators/survey-sanitization.js';
import type { SurveyQuestion } from '../../types/surveys.types.js';

export function getTemplateQuestions(templateId: string) {
  return repository.getQuestionsByTemplate(templateId);
}

export function createQuestion(question: unknown) {
  const sanitizedQuestion = sanitizeQuestionData(question);
  repository.saveSurveyQuestion(sanitizedQuestion);
}

export function updateQuestion(id: string, question: unknown) {
  const sanitizedQuestion = sanitizeQuestionData(question);
  repository.updateSurveyQuestion(id, sanitizedQuestion);
}

export function deleteQuestion(id: string) {
  repository.deleteSurveyQuestion(id);
}

export function deleteTemplateQuestions(templateId: string) {
  repository.deleteQuestionsByTemplate(templateId);
}
