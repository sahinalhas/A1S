import getDatabase from '../../../lib/database/index.js';
import type { StudentExamGoal, CreateStudentExamGoalInput } from '../../../../shared/types/exam-management.types.js';
import { randomUUID } from 'crypto';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getByStudent: db.prepare(`
      SELECT g.*, 
             e.name as exam_type_name, 
             s.subject_name,
             st.fullName as student_name
      FROM student_exam_goals g
      LEFT JOIN exam_types e ON g.exam_type_id = e.id
      LEFT JOIN exam_subjects s ON g.subject_id = s.id
      LEFT JOIN students st ON g.student_id = st.id
      WHERE g.student_id = ?
      ORDER BY g.priority DESC, g.deadline ASC
    `),
    getById: db.prepare('SELECT * FROM student_exam_goals WHERE id = ?'),
    getActiveGoals: db.prepare(`
      SELECT g.*, 
             e.name as exam_type_name, 
             s.subject_name,
             st.fullName as student_name
      FROM student_exam_goals g
      LEFT JOIN exam_types e ON g.exam_type_id = e.id
      LEFT JOIN exam_subjects s ON g.subject_id = s.id
      LEFT JOIN students st ON g.student_id = st.id
      WHERE g.status = 'active'
      ORDER BY g.priority DESC, g.deadline ASC
    `),
    create: db.prepare(`
      INSERT INTO student_exam_goals (
        id, student_id, exam_type_id, subject_id, target_net, 
        current_net, deadline, priority, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    update: db.prepare(`
      UPDATE student_exam_goals 
      SET current_net = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    delete: db.prepare('DELETE FROM student_exam_goals WHERE id = ?'),
  };
  
  isInitialized = true;
}

export function getGoalsByStudent(studentId: string): unknown[] {
  try {
    ensureInitialized();
    return statements.getByStudent.all(studentId);
  } catch (error) {
    console.error('Database error in getGoalsByStudent:', error);
    return [];
  }
}

export function getGoalById(id: string): StudentExamGoal | null {
  try {
    ensureInitialized();
    const result = statements.getById.get(id);
    return result ? (result as StudentExamGoal) : null;
  } catch (error) {
    console.error('Database error in getGoalById:', error);
    return null;
  }
}

export function getAllActiveGoals(): unknown[] {
  try {
    ensureInitialized();
    return statements.getActiveGoals.all();
  } catch (error) {
    console.error('Database error in getAllActiveGoals:', error);
    return [];
  }
}

export function createGoal(input: CreateStudentExamGoalInput): StudentExamGoal | null {
  try {
    ensureInitialized();
    const id = randomUUID();
    statements.create.run(
      id,
      input.student_id,
      input.exam_type_id,
      input.subject_id || null,
      input.target_net,
      0,
      input.deadline || null,
      input.priority || 'medium',
      input.notes || null
    );
    return getGoalById(id);
  } catch (error) {
    console.error('Database error in createGoal:', error);
    return null;
  }
}

export function updateGoalProgress(id: string, currentNet: number, status?: string): boolean {
  try {
    ensureInitialized();
    const goal = getGoalById(id);
    if (!goal) return false;
    
    const newStatus = status || (currentNet >= goal.target_net ? 'achieved' : 'active');
    statements.update.run(currentNet, newStatus, id);
    return true;
  } catch (error) {
    console.error('Database error in updateGoalProgress:', error);
    return false;
  }
}

export function deleteGoal(id: string): boolean {
  try {
    ensureInitialized();
    const result = statements.delete.run(id);
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in deleteGoal:', error);
    return false;
  }
}
