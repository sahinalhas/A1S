import getDatabase from '../../../lib/database.js';
import type { SurveyQuestion } from '../types/surveys.types.js';
import type BetterSqlite3 from 'better-sqlite3';

interface PreparedStatements {
  getQuestionsByTemplate: BetterSqlite3.Statement;
  getSurveyQuestion: BetterSqlite3.Statement;
  insertSurveyQuestion: BetterSqlite3.Statement;
  updateSurveyQuestion: BetterSqlite3.Statement;
  deleteSurveyQuestion: BetterSqlite3.Statement;
  deleteQuestionsByTemplate: BetterSqlite3.Statement;
}

let statements: PreparedStatements | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getQuestionsByTemplate: db.prepare('SELECT * FROM survey_questions WHERE templateId = ? ORDER BY orderIndex'),
    getSurveyQuestion: db.prepare('SELECT * FROM survey_questions WHERE id = ?'),
    insertSurveyQuestion: db.prepare(`
      INSERT INTO survey_questions (id, templateId, questionText, questionType, required, orderIndex, options, validation)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `),
    updateSurveyQuestion: db.prepare(`
      UPDATE survey_questions SET questionText = ?, questionType = ?, required = ?, orderIndex = ?, options = ?, validation = ?
      WHERE id = ?
    `),
    deleteSurveyQuestion: db.prepare('DELETE FROM survey_questions WHERE id = ?'),
    deleteQuestionsByTemplate: db.prepare('DELETE FROM survey_questions WHERE templateId = ?'),
  };
  
  isInitialized = true;
}

interface SurveyQuestionRaw extends Omit<SurveyQuestion, 'options' | 'validation'> {
  options: string | null;
  validation: string | null;
}

export function getQuestionsByTemplate(templateId: string): SurveyQuestion[] {
  try {
    ensureInitialized();
    const questions = statements!.getQuestionsByTemplate.all(templateId) as SurveyQuestionRaw[];
    return questions.map(question => ({
      ...question,
      options: question.options ? JSON.parse(question.options) : null,
      validation: question.validation ? JSON.parse(question.validation) : null
    }));
  } catch (error) {
    console.error('Error getting questions by template:', error);
    return [];
  }
}

export function getSurveyQuestion(id: string): SurveyQuestion | null {
  try {
    ensureInitialized();
    const question = statements!.getSurveyQuestion.get(id) as SurveyQuestionRaw | undefined;
    if (!question) return null;
    
    return {
      ...question,
      options: question.options ? JSON.parse(question.options) : null,
      validation: question.validation ? JSON.parse(question.validation) : null
    };
  } catch (error) {
    console.error('Error getting survey question:', error);
    return null;
  }
}

export function saveSurveyQuestion(question: SurveyQuestion): void {
  try {
    ensureInitialized();
    statements!.insertSurveyQuestion.run(
      question.id,
      question.templateId,
      question.questionText,
      question.questionType,
      (question.required || false) ? 1 : 0,
      question.orderIndex || 0,
      question.options ? JSON.stringify(question.options) : null,
      question.validation ? JSON.stringify(question.validation) : null
    );
  } catch (error) {
    console.error('Error saving survey question:', error);
    throw error;
  }
}

export function updateSurveyQuestion(id: string, question: Partial<SurveyQuestion>): void {
  try {
    ensureInitialized();
    
    const existingQuestion = getSurveyQuestion(id);
    if (!existingQuestion) {
      throw new Error(`Survey question with id ${id} not found`);
    }
    
    const mergedQuestion = {
      ...existingQuestion,
      ...question
    };
    
    statements!.updateSurveyQuestion.run(
      mergedQuestion.questionText,
      mergedQuestion.questionType,
      mergedQuestion.required ? 1 : 0,
      mergedQuestion.orderIndex || 0,
      mergedQuestion.options ? JSON.stringify(mergedQuestion.options) : null,
      mergedQuestion.validation ? JSON.stringify(mergedQuestion.validation) : null,
      id
    );
  } catch (error) {
    console.error('Error updating survey question:', error);
    throw error;
  }
}

export function deleteSurveyQuestion(id: string): void {
  try {
    ensureInitialized();
    statements!.deleteSurveyQuestion.run(id);
  } catch (error) {
    console.error('Error deleting survey question:', error);
    throw error;
  }
}

export function deleteQuestionsByTemplate(templateId: string): void {
  try {
    ensureInitialized();
    statements!.deleteQuestionsByTemplate.run(templateId);
  } catch (error) {
    console.error('Error deleting questions by template:', error);
    throw error;
  }
}
