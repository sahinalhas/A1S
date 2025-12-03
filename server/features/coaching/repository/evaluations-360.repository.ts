import getDatabase from '../../../lib/database.js';
import type { Evaluation360 } from '../types/coaching.types.js';
import type { Statement } from 'better-sqlite3';

let statements: { getEvaluations360ByStudent: Statement; insertEvaluation360: Statement } | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getEvaluations360ByStudent: db.prepare('SELECT * FROM evaluations_360 WHERE studentId = ? ORDER BY evaluationDate DESC'),
    insertEvaluation360: db.prepare(`
      INSERT INTO evaluations_360 (id, studentId, evaluationDate, selfEvaluation, teacherEvaluation, 
                                   peerEvaluation, parentEvaluation, strengths, areasForImprovement, 
                                   actionPlan, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
  };
  
  isInitialized = true;
}

export function getEvaluations360ByStudent(studentId: string): Evaluation360[] {
  try {
    ensureInitialized();
    const evals = statements!.getEvaluations360ByStudent.all(studentId) as Evaluation360[];
    
    return evals.map((ev) => ({
      ...ev,
      selfEvaluation: ev.selfEvaluation ? JSON.parse(ev.selfEvaluation as unknown as string) : {},
      teacherEvaluation: ev.teacherEvaluation ? JSON.parse(ev.teacherEvaluation as unknown as string) : {},
      peerEvaluation: ev.peerEvaluation ? JSON.parse(ev.peerEvaluation as unknown as string) : {},
      parentEvaluation: ev.parentEvaluation ? JSON.parse(ev.parentEvaluation as unknown as string) : {},
      strengths: ev.strengths ? JSON.parse(ev.strengths as unknown as string) : [],
      areasForImprovement: ev.areasForImprovement ? JSON.parse(ev.areasForImprovement as unknown as string) : [],
      actionPlan: ev.actionPlan ? JSON.parse(ev.actionPlan as unknown as string) : []
    }));
  } catch (error) {
    console.error('Database error in getEvaluations360ByStudent:', error);
    throw error;
  }
}

export function insertEvaluation360(evaluation: Evaluation360): void {
  try {
    ensureInitialized();
    
    const selfEvalJson = JSON.stringify(evaluation.selfEvaluation || {});
    const teacherEvalJson = JSON.stringify(evaluation.teacherEvaluation || {});
    const peerEvalJson = JSON.stringify(evaluation.peerEvaluation || {});
    const parentEvalJson = JSON.stringify(evaluation.parentEvaluation || {});
    const strengthsJson = JSON.stringify(evaluation.strengths || []);
    const areasJson = JSON.stringify(evaluation.areasForImprovement || []);
    const actionPlanJson = JSON.stringify(evaluation.actionPlan || []);
    
    statements!.insertEvaluation360.run(
      evaluation.id,
      evaluation.studentId,
      evaluation.evaluationDate,
      selfEvalJson,
      teacherEvalJson,
      peerEvalJson,
      parentEvalJson,
      strengthsJson,
      areasJson,
      actionPlanJson,
      evaluation.notes
    );
  } catch (error) {
    console.error('Error inserting 360 evaluation:', error);
    throw error;
  }
}
