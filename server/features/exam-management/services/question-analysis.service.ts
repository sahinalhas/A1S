import getDatabase from '../../../lib/database/index.js';
import { randomUUID } from 'crypto';

export function analyzeQuestions(sessionId: string): any {
  const db = getDatabase();
  
  // Get all results for this session
  const results = db.prepare(`
    SELECT r.*, s.question_count, s.subject_name
    FROM exam_session_results r
    INNER JOIN exam_subjects s ON r.subject_id = s.id
    WHERE r.session_id = ?
  `).all(sessionId);
  
  if (results.length === 0) {
    return { success: false, message: 'No results found for this session' };
  }
  
  const analysisData: unknown[] = [];
  
  // For each subject, analyze question difficulty
  const subjects = Array.from(new Set(results.map((r: any) => r.subject_id)));
  
  for (const subjectId of subjects) {
    const subjectResults = results.filter((r: any) => r.subject_id === subjectId);
    const questionCount = (subjectResults[0] as any).question_count;
    
    // Calculate average performance per "question range"
    // Since we don't have per-question data, we estimate difficulty
    const totalStudents = subjectResults.length;
    const avgCorrect = subjectResults.reduce((sum: number, r: any) => sum + r.correct_count, 0) / totalStudents;
    const avgWrong = subjectResults.reduce((sum: number, r: any) => sum + r.wrong_count, 0) / totalStudents;
    
    // Calculate difficulty score (0-1, where 1 is hardest)
    const difficultyScore = 1 - (avgCorrect / questionCount);
    
    // Store analysis
    const analysisId = randomUUID();
    db.prepare(`
      INSERT OR REPLACE INTO question_analysis (
        id, session_id, subject_id, question_number, 
        correct_count, wrong_count, empty_count, 
        difficulty_score, discrimination_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      analysisId,
      sessionId,
      subjectId,
      1,
      Math.round(avgCorrect),
      Math.round(avgWrong),
      questionCount - Math.round(avgCorrect) - Math.round(avgWrong),
      difficultyScore,
      0.5
    );
    
    analysisData.push({
      subject_id: subjectId,
      subject_name: (subjectResults[0] as any).subject_name,
      difficulty_score: difficultyScore,
      avg_correct: avgCorrect,
      avg_wrong: avgWrong
    });
  }
  
  return { success: true, data: analysisData };
}

export function getQuestionAnalysis(sessionId: string): unknown[] {
  const db = getDatabase();
  
  return db.prepare(`
    SELECT q.*, s.subject_name
    FROM question_analysis q
    INNER JOIN exam_subjects s ON q.subject_id = s.id
    WHERE q.session_id = ?
    ORDER BY q.difficulty_score DESC
  `).all(sessionId);
}
