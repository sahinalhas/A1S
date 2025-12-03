import getDatabase from '../../../lib/database.js';
import type { StudyAssignment, WeeklySlot, PlannedTopic } from '../types/study.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getStudyAssignmentsByStudent: db.prepare('SELECT * FROM study_assignments WHERE studentId = ? ORDER BY dueDate'),
    getStudyAssignmentsByStudentAndSchool: db.prepare(`
      SELECT sa.* FROM study_assignments sa
      INNER JOIN students s ON sa.studentId = s.id
      WHERE sa.studentId = ? AND s.schoolId = ?
      ORDER BY sa.dueDate
    `),
    insertStudyAssignment: db.prepare(`
      INSERT INTO study_assignments (id, studentId, topicId, dueDate, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `),
    updateStudyAssignment: db.prepare(`
      UPDATE study_assignments SET status = ?, notes = ?
      WHERE id = ?
    `),
    updateStudyAssignmentBySchool: db.prepare(`
      UPDATE study_assignments SET status = ?, notes = ?
      WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)
    `),
    deleteStudyAssignment: db.prepare('DELETE FROM study_assignments WHERE id = ?'),
    deleteStudyAssignmentBySchool: db.prepare(`
      DELETE FROM study_assignments 
      WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)
    `),
    getAllWeeklySlots: db.prepare('SELECT * FROM weekly_slots ORDER BY day, startTime'),
    getAllWeeklySlotsBySchool: db.prepare(`
      SELECT ws.* FROM weekly_slots ws
      INNER JOIN students s ON ws.studentId = s.id
      WHERE s.schoolId = ?
      ORDER BY ws.day, ws.startTime
    `),
    getWeeklySlotsByStudent: db.prepare('SELECT * FROM weekly_slots WHERE studentId = ? ORDER BY day, startTime'),
    getWeeklySlotsByStudentAndSchool: db.prepare(`
      SELECT ws.* FROM weekly_slots ws
      INNER JOIN students s ON ws.studentId = s.id
      WHERE ws.studentId = ? AND s.schoolId = ?
      ORDER BY ws.day, ws.startTime
    `),
    insertWeeklySlot: db.prepare(`
      INSERT OR REPLACE INTO weekly_slots (id, studentId, day, startTime, endTime, subjectId)
      VALUES (?, ?, ?, ?, ?, ?)
    `),
    updateWeeklySlot: db.prepare(`
      UPDATE weekly_slots SET day = ?, startTime = ?, endTime = ?, subjectId = ?
      WHERE id = ?
    `),
    updateWeeklySlotBySchool: db.prepare(`
      UPDATE weekly_slots SET day = ?, startTime = ?, endTime = ?, subjectId = ?
      WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)
    `),
    deleteWeeklySlot: db.prepare('DELETE FROM weekly_slots WHERE id = ?'),
    deleteWeeklySlotBySchool: db.prepare(`
      DELETE FROM weekly_slots 
      WHERE id = ? AND studentId IN (SELECT id FROM students WHERE schoolId = ?)
    `),
    getPlannedTopics: db.prepare('SELECT * FROM planned_topics WHERE studentId = ? AND weekStartDate = ? ORDER BY date, start'),
    getPlannedTopicsBySchool: db.prepare(`
      SELECT pt.* FROM planned_topics pt
      INNER JOIN students s ON pt.studentId = s.id
      WHERE pt.studentId = ? AND pt.weekStartDate = ? AND s.schoolId = ?
      ORDER BY pt.date, pt.start
    `),
    insertPlannedTopic: db.prepare(`
      INSERT OR REPLACE INTO planned_topics (id, studentId, weekStartDate, date, start, end, subjectId, topicId, allocated, remainingAfter, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `),
    deletePlannedTopicsByWeek: db.prepare('DELETE FROM planned_topics WHERE studentId = ? AND weekStartDate = ?'),
  };
  
  isInitialized = true;
}

export function getStudyAssignmentsByStudent(studentId: string): StudyAssignment[] {
  console.warn('[DEPRECATED] getStudyAssignmentsByStudent() called without schoolId. Use getStudyAssignmentsByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    return statements.getStudyAssignmentsByStudent.all(studentId) as StudyAssignment[];
  } catch (error) {
    console.error('Database error in getStudyAssignmentsByStudent:', error);
    return [];
  }
}

export function getStudyAssignmentsByStudentAndSchool(studentId: string, schoolId: string): StudyAssignment[] {
  if (!schoolId) {
    throw new Error('schoolId is required for getStudyAssignmentsByStudentAndSchool');
  }
  
  try {
    ensureInitialized();
    return statements.getStudyAssignmentsByStudentAndSchool.all(studentId, schoolId) as StudyAssignment[];
  } catch (error) {
    console.error('Database error in getStudyAssignmentsByStudentAndSchool:', error);
    return [];
  }
}

export function insertStudyAssignment(
  id: string,
  studentId: string,
  topicId: string,
  dueDate: string,
  status: string,
  notes: string | null
): void {
  try {
    ensureInitialized();
    statements.insertStudyAssignment.run(id, studentId, topicId, dueDate, status, notes);
  } catch (error) {
    console.error('Error inserting study assignment:', error);
    throw error;
  }
}

export function updateStudyAssignment(id: string, status: string, notes: string | null): void {
  console.warn('[DEPRECATED] updateStudyAssignment() called without schoolId. Use updateStudyAssignmentBySchool() instead.');
  try {
    ensureInitialized();
    statements.updateStudyAssignment.run(status, notes, id);
  } catch (error) {
    console.error('Error updating study assignment:', error);
    throw error;
  }
}

export function updateStudyAssignmentBySchool(id: string, status: string, notes: string | null, schoolId: string): void {
  if (!schoolId) {
    throw new Error('schoolId is required for updateStudyAssignmentBySchool');
  }
  
  try {
    ensureInitialized();
    const result = statements.updateStudyAssignmentBySchool.run(status, notes, id, schoolId);
    if (result.changes === 0) {
      throw new Error('Assignment not found or does not belong to this school');
    }
  } catch (error) {
    console.error('Error updating study assignment by school:', error);
    throw error;
  }
}

export function deleteStudyAssignment(id: string): void {
  console.warn('[DEPRECATED] deleteStudyAssignment() called without schoolId. Use deleteStudyAssignmentBySchool() instead.');
  try {
    ensureInitialized();
    statements.deleteStudyAssignment.run(id);
  } catch (error) {
    console.error('Error deleting study assignment:', error);
    throw error;
  }
}

export function deleteStudyAssignmentBySchool(id: string, schoolId: string): void {
  if (!schoolId) {
    throw new Error('schoolId is required for deleteStudyAssignmentBySchool');
  }
  
  try {
    ensureInitialized();
    const result = statements.deleteStudyAssignmentBySchool.run(id, schoolId);
    if (result.changes === 0) {
      throw new Error('Assignment not found or does not belong to this school');
    }
  } catch (error) {
    console.error('Error deleting study assignment by school:', error);
    throw error;
  }
}

export function getAllWeeklySlots(): WeeklySlot[] {
  console.warn('[DEPRECATED] getAllWeeklySlots() called without schoolId. Use getAllWeeklySlotsBySchool() instead.');
  try {
    ensureInitialized();
    return statements.getAllWeeklySlots.all() as WeeklySlot[];
  } catch (error) {
    console.error('Database error in getAllWeeklySlots:', error);
    return [];
  }
}

export function getAllWeeklySlotsBySchool(schoolId: string): WeeklySlot[] {
  if (!schoolId) {
    throw new Error('schoolId is required for getAllWeeklySlotsBySchool');
  }
  
  try {
    ensureInitialized();
    return statements.getAllWeeklySlotsBySchool.all(schoolId) as WeeklySlot[];
  } catch (error) {
    console.error('Database error in getAllWeeklySlotsBySchool:', error);
    return [];
  }
}

export function getWeeklySlotsByStudent(studentId: string): WeeklySlot[] {
  console.warn('[DEPRECATED] getWeeklySlotsByStudent() called without schoolId. Use getWeeklySlotsByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    return statements.getWeeklySlotsByStudent.all(studentId) as WeeklySlot[];
  } catch (error) {
    console.error('Database error in getWeeklySlotsByStudent:', error);
    return [];
  }
}

export function getWeeklySlotsByStudentAndSchool(studentId: string, schoolId: string): WeeklySlot[] {
  if (!schoolId) {
    throw new Error('schoolId is required for getWeeklySlotsByStudentAndSchool');
  }
  
  try {
    ensureInitialized();
    return statements.getWeeklySlotsByStudentAndSchool.all(studentId, schoolId) as WeeklySlot[];
  } catch (error) {
    console.error('Database error in getWeeklySlotsByStudentAndSchool:', error);
    return [];
  }
}

export function insertWeeklySlot(
  id: string,
  studentId: string,
  day: number,
  startTime: string,
  endTime: string,
  subjectId: string
): void {
  try {
    ensureInitialized();
    statements.insertWeeklySlot.run(id, studentId, day, startTime, endTime, subjectId);
  } catch (error) {
    console.error('Error inserting weekly slot:', error);
    throw error;
  }
}

export function updateWeeklySlot(
  id: string,
  day: number,
  startTime: string,
  endTime: string,
  subjectId: string
): void {
  console.warn('[DEPRECATED] updateWeeklySlot() called without schoolId. Use updateWeeklySlotBySchool() instead.');
  try {
    ensureInitialized();
    statements.updateWeeklySlot.run(day, startTime, endTime, subjectId, id);
  } catch (error) {
    console.error('Error updating weekly slot:', error);
    throw error;
  }
}

export function updateWeeklySlotBySchool(
  id: string,
  day: number,
  startTime: string,
  endTime: string,
  subjectId: string,
  schoolId: string
): void {
  if (!schoolId) {
    throw new Error('schoolId is required for updateWeeklySlotBySchool');
  }
  
  try {
    ensureInitialized();
    const result = statements.updateWeeklySlotBySchool.run(day, startTime, endTime, subjectId, id, schoolId);
    if (result.changes === 0) {
      throw new Error('Weekly slot not found or does not belong to this school');
    }
  } catch (error) {
    console.error('Error updating weekly slot by school:', error);
    throw error;
  }
}

export function deleteWeeklySlot(id: string): void {
  console.warn('[DEPRECATED] deleteWeeklySlot() called without schoolId. Use deleteWeeklySlotBySchool() instead.');
  try {
    ensureInitialized();
    statements.deleteWeeklySlot.run(id);
  } catch (error) {
    console.error('Error deleting weekly slot:', error);
    throw error;
  }
}

export function deleteWeeklySlotBySchool(id: string, schoolId: string): void {
  if (!schoolId) {
    throw new Error('schoolId is required for deleteWeeklySlotBySchool');
  }
  
  try {
    ensureInitialized();
    const result = statements.deleteWeeklySlotBySchool.run(id, schoolId);
    if (result.changes === 0) {
      throw new Error('Weekly slot not found or does not belong to this school');
    }
  } catch (error) {
    console.error('Error deleting weekly slot by school:', error);
    throw error;
  }
}

export function getPlannedTopics(studentId: string, weekStartDate: string): PlannedTopic[] {
  console.warn('[DEPRECATED] getPlannedTopics() called without schoolId. Use getPlannedTopicsBySchool() instead.');
  try {
    ensureInitialized();
    return statements.getPlannedTopics.all(studentId, weekStartDate) as PlannedTopic[];
  } catch (error) {
    console.error('Error getting planned topics:', error);
    return [];
  }
}

export function getPlannedTopicsBySchool(studentId: string, weekStartDate: string, schoolId: string): PlannedTopic[] {
  if (!schoolId) {
    throw new Error('schoolId is required for getPlannedTopicsBySchool');
  }
  
  try {
    ensureInitialized();
    return statements.getPlannedTopicsBySchool.all(studentId, weekStartDate, schoolId) as PlannedTopic[];
  } catch (error) {
    console.error('Error getting planned topics by school:', error);
    return [];
  }
}

export function insertPlannedTopics(topics: PlannedTopic[]): void {
  try {
    ensureInitialized();
    const insert = statements.insertPlannedTopic;
    for (const t of topics) {
      insert.run(t.id, t.studentId, t.weekStartDate, t.date, t.start, t.end, t.subjectId, t.topicId, t.allocated, t.remainingAfter);
    }
  } catch (error) {
    console.error('Error inserting planned topics:', error);
    throw error;
  }
}

export function deletePlannedTopicsByWeek(studentId: string, weekStartDate: string): void {
  try {
    ensureInitialized();
    statements.deletePlannedTopicsByWeek.run(studentId, weekStartDate);
  } catch (error) {
    console.error('Error deleting planned topics:', error);
    throw error;
  }
}
