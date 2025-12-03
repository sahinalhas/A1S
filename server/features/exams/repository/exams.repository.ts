import getDatabase from '../../../lib/database.js';
import type { ExamResult, ExamProgressData } from '../types/exams.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getExamResultsByStudent: db.prepare('SELECT * FROM exam_results WHERE studentId = ? ORDER BY examDate DESC'),
    getExamResultsByStudentAndSchool: db.prepare(`
      SELECT er.* FROM exam_results er
      INNER JOIN students s ON er.studentId = s.id
      WHERE er.studentId = ? AND s.schoolId = ?
      ORDER BY er.examDate DESC
    `),
    getExamResultsByType: db.prepare('SELECT * FROM exam_results WHERE studentId = ? AND examType = ? ORDER BY examDate DESC'),
    getExamResultsByTypeAndSchool: db.prepare(`
      SELECT er.* FROM exam_results er
      INNER JOIN students s ON er.studentId = s.id
      WHERE er.studentId = ? AND er.examType = ? AND s.schoolId = ?
      ORDER BY er.examDate DESC
    `),
    getLatestExamResult: db.prepare('SELECT * FROM exam_results WHERE studentId = ? ORDER BY examDate DESC LIMIT 1'),
    getLatestExamResultBySchool: db.prepare(`
      SELECT er.* FROM exam_results er
      INNER JOIN students s ON er.studentId = s.id
      WHERE er.studentId = ? AND s.schoolId = ?
      ORDER BY er.examDate DESC LIMIT 1
    `),
    getLatestExamResultByType: db.prepare('SELECT * FROM exam_results WHERE studentId = ? AND examType = ? ORDER BY examDate DESC LIMIT 1'),
    getLatestExamResultByTypeAndSchool: db.prepare(`
      SELECT er.* FROM exam_results er
      INNER JOIN students s ON er.studentId = s.id
      WHERE er.studentId = ? AND er.examType = ? AND s.schoolId = ?
      ORDER BY er.examDate DESC LIMIT 1
    `),
    getExamProgressAnalysis: db.prepare(`
      SELECT examDate, examName, totalScore, totalNet, percentileRank
      FROM exam_results 
      WHERE studentId = ? AND examType = ?
      ORDER BY examDate ASC
    `),
    getExamProgressAnalysisBySchool: db.prepare(`
      SELECT er.examDate, er.examName, er.totalScore, er.totalNet, er.percentileRank
      FROM exam_results er
      INNER JOIN students s ON er.studentId = s.id
      WHERE er.studentId = ? AND er.examType = ? AND s.schoolId = ?
      ORDER BY er.examDate ASC
    `),
    insertExamResult: db.prepare(`
      INSERT INTO exam_results (id, studentId, examType, examName, examDate, examProvider, totalScore,
                               percentileRank, turkishScore, mathScore, scienceScore, socialScore,
                               foreignLanguageScore, turkishNet, mathNet, scienceNet, socialNet,
                               foreignLanguageNet, totalNet, correctAnswers, wrongAnswers, emptyAnswers,
                               totalQuestions, subjectBreakdown, topicAnalysis, strengthAreas, weaknessAreas,
                               improvementSuggestions, comparedToGoal, comparedToPrevious, comparedToClassAverage,
                               schoolRank, classRank, isOfficial, certificateUrl, answerKeyUrl, detailedReportUrl,
                               goalsMet, parentNotified, counselorNotes, actionPlan, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    deleteExamResult: db.prepare('DELETE FROM exam_results WHERE id = ?')
  };
  
  isInitialized = true;
}

function parseExamResult(result: any): any {
  return {
    ...result,
    subjectBreakdown: result.subjectBreakdown ? JSON.parse(result.subjectBreakdown) : null,
    topicAnalysis: result.topicAnalysis ? JSON.parse(result.topicAnalysis) : null,
    strengthAreas: result.strengthAreas ? JSON.parse(result.strengthAreas) : [],
    weaknessAreas: result.weaknessAreas ? JSON.parse(result.weaknessAreas) : []
  };
}

export function getExamResultsByStudent(studentId: string): unknown[] {
  console.warn('[DEPRECATED] getExamResultsByStudent() called without schoolId. Use getExamResultsByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    const results = statements.getExamResultsByStudent.all(studentId);
    return results.map(parseExamResult);
  } catch (error) {
    console.error('Database error in getExamResultsByStudent:', error);
    throw error;
  }
}

export function getExamResultsByStudentAndSchool(studentId: string, schoolId: string): unknown[] {
  if (!schoolId) {
    throw new Error('schoolId is required for getExamResultsByStudentAndSchool');
  }
  
  try {
    ensureInitialized();
    const results = statements.getExamResultsByStudentAndSchool.all(studentId, schoolId);
    return results.map(parseExamResult);
  } catch (error) {
    console.error('Database error in getExamResultsByStudentAndSchool:', error);
    throw error;
  }
}

export function getExamResultsByType(studentId: string, examType: string): unknown[] {
  console.warn('[DEPRECATED] getExamResultsByType() called without schoolId. Use getExamResultsByTypeAndSchool() instead.');
  try {
    ensureInitialized();
    const results = statements.getExamResultsByType.all(studentId, examType);
    return results.map(parseExamResult);
  } catch (error) {
    console.error('Database error in getExamResultsByType:', error);
    throw error;
  }
}

export function getExamResultsByTypeAndSchool(studentId: string, examType: string, schoolId: string): unknown[] {
  if (!schoolId) {
    throw new Error('schoolId is required for getExamResultsByTypeAndSchool');
  }
  
  try {
    ensureInitialized();
    const results = statements.getExamResultsByTypeAndSchool.all(studentId, examType, schoolId);
    return results.map(parseExamResult);
  } catch (error) {
    console.error('Database error in getExamResultsByTypeAndSchool:', error);
    throw error;
  }
}

export function getLatestExamResult(studentId: string, examType?: string): any | null {
  console.warn('[DEPRECATED] getLatestExamResult() called without schoolId. Use getLatestExamResultBySchool() instead.');
  try {
    ensureInitialized();
    
    let result;
    if (examType) {
      result = statements.getLatestExamResultByType.get(studentId, examType);
    } else {
      result = statements.getLatestExamResult.get(studentId);
    }
    
    if (result) {
      return parseExamResult(result);
    }
    return null;
  } catch (error) {
    console.error('Database error in getLatestExamResult:', error);
    throw error;
  }
}

export function getLatestExamResultBySchool(studentId: string, schoolId: string, examType?: string): any | null {
  if (!schoolId) {
    throw new Error('schoolId is required for getLatestExamResultBySchool');
  }
  
  try {
    ensureInitialized();
    
    let result;
    if (examType) {
      result = statements.getLatestExamResultByTypeAndSchool.get(studentId, examType, schoolId);
    } else {
      result = statements.getLatestExamResultBySchool.get(studentId, schoolId);
    }
    
    if (result) {
      return parseExamResult(result);
    }
    return null;
  } catch (error) {
    console.error('Database error in getLatestExamResultBySchool:', error);
    throw error;
  }
}

export function getExamProgressAnalysis(studentId: string, examType: string): ExamProgressData[] {
  console.warn('[DEPRECATED] getExamProgressAnalysis() called without schoolId. Use getExamProgressAnalysisBySchool() instead.');
  try {
    ensureInitialized();
    return statements.getExamProgressAnalysis.all(studentId, examType) as ExamProgressData[];
  } catch (error) {
    console.error('Database error in getExamProgressAnalysis:', error);
    throw error;
  }
}

export function getExamProgressAnalysisBySchool(studentId: string, examType: string, schoolId: string): ExamProgressData[] {
  if (!schoolId) {
    throw new Error('schoolId is required for getExamProgressAnalysisBySchool');
  }
  
  try {
    ensureInitialized();
    return statements.getExamProgressAnalysisBySchool.all(studentId, examType, schoolId) as ExamProgressData[];
  } catch (error) {
    console.error('Database error in getExamProgressAnalysisBySchool:', error);
    throw error;
  }
}

export function insertExamResult(result: ExamResult): void {
  try {
    ensureInitialized();
    
    const subjectBreakdownJson = JSON.stringify(result.subjectBreakdown || null);
    const topicAnalysisJson = JSON.stringify(result.topicAnalysis || null);
    const strengthAreasJson = JSON.stringify(result.strengthAreas || []);
    const weaknessAreasJson = JSON.stringify(result.weaknessAreas || []);
    
    statements.insertExamResult.run(
      result.id,
      result.studentId,
      result.examType,
      result.examName,
      result.examDate,
      result.examProvider,
      result.totalScore,
      result.percentileRank,
      result.turkishScore,
      result.mathScore,
      result.scienceScore,
      result.socialScore,
      result.foreignLanguageScore,
      result.turkishNet,
      result.mathNet,
      result.scienceNet,
      result.socialNet,
      result.foreignLanguageNet,
      result.totalNet,
      result.correctAnswers,
      result.wrongAnswers,
      result.emptyAnswers,
      result.totalQuestions,
      subjectBreakdownJson,
      topicAnalysisJson,
      strengthAreasJson,
      weaknessAreasJson,
      result.improvementSuggestions,
      result.comparedToGoal,
      result.comparedToPrevious,
      result.comparedToClassAverage,
      result.schoolRank,
      result.classRank,
      result.isOfficial ? 1 : 0,
      result.certificateUrl,
      result.answerKeyUrl,
      result.detailedReportUrl,
      result.goalsMet ? 1 : 0,
      result.parentNotified ? 1 : 0,
      result.counselorNotes,
      result.actionPlan,
      result.notes
    );
  } catch (error) {
    console.error('Error inserting exam result:', error);
    throw error;
  }
}

export function updateExamResult(id: string, updates: any): void {
  console.warn('[DEPRECATED] updateExamResult() called without schoolId. Use updateExamResultBySchool() instead.');
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const updatesWithStringifiedArrays = { ...updates };
    if (updates.subjectBreakdown) {
      updatesWithStringifiedArrays.subjectBreakdown = JSON.stringify(updates.subjectBreakdown);
    }
    if (updates.topicAnalysis) {
      updatesWithStringifiedArrays.topicAnalysis = JSON.stringify(updates.topicAnalysis);
    }
    if (updates.strengthAreas) {
      updatesWithStringifiedArrays.strengthAreas = JSON.stringify(updates.strengthAreas);
    }
    if (updates.weaknessAreas) {
      updatesWithStringifiedArrays.weaknessAreas = JSON.stringify(updates.weaknessAreas);
    }
    if (updates.isOfficial !== undefined) {
      updatesWithStringifiedArrays.isOfficial = updates.isOfficial ? 1 : 0;
    }
    if (updates.goalsMet !== undefined) {
      updatesWithStringifiedArrays.goalsMet = updates.goalsMet ? 1 : 0;
    }
    if (updates.parentNotified !== undefined) {
      updatesWithStringifiedArrays.parentNotified = updates.parentNotified ? 1 : 0;
    }
    
    const allowedFields = ['examType', 'examName', 'examDate', 'examProvider', 'totalScore', 'percentileRank',
                          'turkishScore', 'mathScore', 'scienceScore', 'socialScore', 'foreignLanguageScore',
                          'turkishNet', 'mathNet', 'scienceNet', 'socialNet', 'foreignLanguageNet', 'totalNet',
                          'correctAnswers', 'wrongAnswers', 'emptyAnswers', 'totalQuestions', 'subjectBreakdown',
                          'topicAnalysis', 'strengthAreas', 'weaknessAreas', 'improvementSuggestions',
                          'comparedToGoal', 'comparedToPrevious', 'comparedToClassAverage', 'schoolRank',
                          'classRank', 'isOfficial', 'certificateUrl', 'answerKeyUrl', 'detailedReportUrl',
                          'goalsMet', 'parentNotified', 'counselorNotes', 'actionPlan', 'notes'];
    const fields = Object.keys(updatesWithStringifiedArrays).filter(key => allowedFields.includes(key));
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updatesWithStringifiedArrays[field]);
    values.push(id);
    
    db.prepare(`UPDATE exam_results SET ${setClause} WHERE id = ?`).run(...values);
  } catch (error) {
    console.error('Error updating exam result:', error);
    throw error;
  }
}

export function updateExamResultBySchool(id: string, updates: any, schoolId: string): void {
  if (!schoolId) {
    throw new Error('schoolId is required for updateExamResultBySchool');
  }
  
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const checkResult = db.prepare(`
      SELECT er.id 
      FROM exam_results er 
      INNER JOIN students s ON er.studentId = s.id 
      WHERE er.id = ? AND s.schoolId = ?
    `).get(id, schoolId);
    
    if (!checkResult) {
      throw new Error('Exam result not found or does not belong to this school');
    }
    
    const updatesWithStringifiedArrays = { ...updates };
    if (updates.subjectBreakdown) {
      updatesWithStringifiedArrays.subjectBreakdown = JSON.stringify(updates.subjectBreakdown);
    }
    if (updates.topicAnalysis) {
      updatesWithStringifiedArrays.topicAnalysis = JSON.stringify(updates.topicAnalysis);
    }
    if (updates.strengthAreas) {
      updatesWithStringifiedArrays.strengthAreas = JSON.stringify(updates.strengthAreas);
    }
    if (updates.weaknessAreas) {
      updatesWithStringifiedArrays.weaknessAreas = JSON.stringify(updates.weaknessAreas);
    }
    if (updates.isOfficial !== undefined) {
      updatesWithStringifiedArrays.isOfficial = updates.isOfficial ? 1 : 0;
    }
    if (updates.goalsMet !== undefined) {
      updatesWithStringifiedArrays.goalsMet = updates.goalsMet ? 1 : 0;
    }
    if (updates.parentNotified !== undefined) {
      updatesWithStringifiedArrays.parentNotified = updates.parentNotified ? 1 : 0;
    }
    
    const allowedFields = ['examType', 'examName', 'examDate', 'examProvider', 'totalScore', 'percentileRank',
                          'turkishScore', 'mathScore', 'scienceScore', 'socialScore', 'foreignLanguageScore',
                          'turkishNet', 'mathNet', 'scienceNet', 'socialNet', 'foreignLanguageNet', 'totalNet',
                          'correctAnswers', 'wrongAnswers', 'emptyAnswers', 'totalQuestions', 'subjectBreakdown',
                          'topicAnalysis', 'strengthAreas', 'weaknessAreas', 'improvementSuggestions',
                          'comparedToGoal', 'comparedToPrevious', 'comparedToClassAverage', 'schoolRank',
                          'classRank', 'isOfficial', 'certificateUrl', 'answerKeyUrl', 'detailedReportUrl',
                          'goalsMet', 'parentNotified', 'counselorNotes', 'actionPlan', 'notes'];
    const fields = Object.keys(updatesWithStringifiedArrays).filter(key => allowedFields.includes(key));
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = fields.map(field => updatesWithStringifiedArrays[field]);
    values.push(id);
    
    db.prepare(`UPDATE exam_results SET ${setClause} WHERE id = ?`).run(...values);
  } catch (error) {
    console.error('Error updating exam result by school:', error);
    throw error;
  }
}

export function deleteExamResult(id: string): void {
  console.warn('[DEPRECATED] deleteExamResult() called without schoolId. Use deleteExamResultBySchool() instead.');
  try {
    ensureInitialized();
    statements.deleteExamResult.run(id);
  } catch (error) {
    console.error('Error deleting exam result:', error);
    throw error;
  }
}

export function deleteExamResultBySchool(id: string, schoolId: string): void {
  if (!schoolId) {
    throw new Error('schoolId is required for deleteExamResultBySchool');
  }
  
  try {
    ensureInitialized();
    const db = getDatabase();
    
    const result = db.prepare(`
      DELETE FROM exam_results 
      WHERE id = ? 
      AND studentId IN (SELECT id FROM students WHERE schoolId = ?)
    `).run(id, schoolId);
    
    if (result.changes === 0) {
      throw new Error('Exam result not found or does not belong to this school');
    }
  } catch (error) {
    console.error('Error deleting exam result by school:', error);
    throw error;
  }
}
