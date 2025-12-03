/**
 * Attendance Repository
 * Devamsızlık Takibi Veri Erişim Katmanı
 * 
 * [SECURITY] Tüm sorgular schoolId ile filtrelenerek okul veri izolasyonu sağlanır
 */

import type Database from 'better-sqlite3';
import getDatabase from '../../../lib/database.js';
import type { AttendanceRecord } from '../types/attendance.types.js';

interface AttendanceStatements {
  getAttendanceByStudent: Database.Statement;
  getAttendanceByStudentAndSchool: Database.Statement;
  insertAttendance: Database.Statement;
  studentBelongsToSchool: Database.Statement;
  deleteAttendanceBySchool: Database.Statement;
  getAttendanceByDateRangeAndSchool: Database.Statement;
}

let statements: AttendanceStatements | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getAttendanceByStudent: db.prepare('SELECT * FROM attendance WHERE studentId = ? ORDER BY date DESC'),
    getAttendanceByStudentAndSchool: db.prepare(`
      SELECT a.* FROM attendance a
      INNER JOIN students s ON a.studentId = s.id
      WHERE a.studentId = ? AND s.schoolId = ?
      ORDER BY a.date DESC
    `),
    insertAttendance: db.prepare('INSERT INTO attendance (id, studentId, date, status, notes) VALUES (?, ?, ?, ?, ?)'),
    studentBelongsToSchool: db.prepare('SELECT 1 FROM students WHERE id = ? AND schoolId = ?'),
    deleteAttendanceBySchool: db.prepare(`
      DELETE FROM attendance 
      WHERE id = ? AND studentId IN (
        SELECT id FROM students WHERE schoolId = ?
      )
    `),
    getAttendanceByDateRangeAndSchool: db.prepare(`
      SELECT a.* FROM attendance a
      INNER JOIN students s ON a.studentId = s.id
      WHERE s.schoolId = ? AND a.date BETWEEN ? AND ?
      ORDER BY a.date DESC
    `),
  };
  
  isInitialized = true;
}

// ================= SCHOOL-SCOPED FUNCTIONS (RECOMMENDED) =================

/**
 * Checks if a student belongs to a specific school
 * @param studentId - Student ID
 * @param schoolId - School ID
 */
export function studentBelongsToSchool(studentId: string, schoolId: string): boolean {
  if (!studentId || !schoolId) return false;
  ensureInitialized();
  return !!statements!.studentBelongsToSchool.get(studentId, schoolId);
}

/**
 * Get attendance records by student with school isolation
 * @param studentId - Student ID
 * @param schoolId - School ID for isolation (REQUIRED)
 */
export function getAttendanceByStudentAndSchool(studentId: string, schoolId: string): AttendanceRecord[] {
  if (!schoolId) {
    throw new Error('[SECURITY] getAttendanceByStudentAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    return statements!.getAttendanceByStudentAndSchool.all(studentId, schoolId) as AttendanceRecord[];
  } catch (error) {
    console.error('Database error in getAttendanceByStudentAndSchool:', error);
    return [];
  }
}

/**
 * Get attendance records by date range with school isolation
 * @param schoolId - School ID for isolation (REQUIRED)
 * @param startDate - Start date
 * @param endDate - End date
 */
export function getAttendanceByDateRangeAndSchool(schoolId: string, startDate: string, endDate: string): AttendanceRecord[] {
  if (!schoolId) {
    throw new Error('[SECURITY] getAttendanceByDateRangeAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    return statements!.getAttendanceByDateRangeAndSchool.all(schoolId, startDate, endDate) as AttendanceRecord[];
  } catch (error) {
    console.error('Database error in getAttendanceByDateRangeAndSchool:', error);
    return [];
  }
}

/**
 * Insert attendance record with school isolation check
 * @param id - Record ID
 * @param studentId - Student ID
 * @param date - Attendance date
 * @param status - Attendance status
 * @param notes - Optional notes
 * @param schoolId - School ID for isolation check (REQUIRED)
 */
export function insertAttendanceWithSchoolCheck(
  id: string, 
  studentId: string, 
  date: string, 
  status: string, 
  notes: string | null, 
  schoolId: string
): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] insertAttendanceWithSchoolCheck requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    
    if (!studentBelongsToSchool(studentId, schoolId)) {
      console.warn(`[SECURITY] Attempted to insert attendance for student ${studentId} not belonging to school ${schoolId}`);
      return false;
    }
    
    statements!.insertAttendance.run(id, studentId, date, status, notes);
    return true;
  } catch (error) {
    console.error('Error inserting attendance with school check:', error);
    return false;
  }
}

/**
 * Delete attendance record with school isolation
 * @param id - Record ID
 * @param schoolId - School ID for isolation (REQUIRED)
 */
export function deleteAttendanceBySchool(id: string, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] deleteAttendanceBySchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements!.deleteAttendanceBySchool.run(id, schoolId);
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in deleteAttendanceBySchool:', error);
    return false;
  }
}

// ================= DEPRECATED FUNCTIONS =================
// These functions do not check school isolation and should be avoided

/**
 * @deprecated Use getAttendanceByStudentAndSchool instead for proper school isolation
 */
export function getAttendanceByStudent(studentId: string): AttendanceRecord[] {
  console.warn('[DEPRECATED] getAttendanceByStudent() called without schoolId. Use getAttendanceByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    if (!statements) throw new Error('Statements not initialized');
    return statements.getAttendanceByStudent.all(studentId) as AttendanceRecord[];
  } catch (error) {
    console.error('Database error in getAttendanceByStudent:', error);
    return [];
  }
}

/**
 * @deprecated Use insertAttendanceWithSchoolCheck instead for proper school isolation
 */
export function insertAttendance(id: string, studentId: string, date: string, status: string, notes: string | null): void {
  console.warn('[DEPRECATED] insertAttendance() called without schoolId check. Use insertAttendanceWithSchoolCheck() instead.');
  try {
    ensureInitialized();
    if (!statements) throw new Error('Statements not initialized');
    statements.insertAttendance.run(id, studentId, date, status, notes);
  } catch (error) {
    console.error('Error inserting attendance:', error);
    throw error;
  }
}
