/**
 * Documents Repository
 * Öğrenci Belgeleri Veri Erişim Katmanı
 * 
 * [SECURITY] Tüm sorgular schoolId ile filtrelenerek okul veri izolasyonu sağlanır
 */

import getDatabase from '../../../lib/database.js';
import type { Document } from '../types/documents.types.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getDocumentsByStudent: db.prepare('SELECT * FROM student_documents WHERE studentId = ? ORDER BY created_at DESC'),
    getDocumentsByStudentAndSchool: db.prepare(`
      SELECT d.* FROM student_documents d
      INNER JOIN students s ON d.studentId = s.id
      WHERE d.studentId = ? AND s.schoolId = ?
      ORDER BY d.created_at DESC
    `),
    getDocument: db.prepare('SELECT * FROM student_documents WHERE id = ?'),
    getDocumentByIdAndSchool: db.prepare(`
      SELECT d.* FROM student_documents d
      INNER JOIN students s ON d.studentId = s.id
      WHERE d.id = ? AND s.schoolId = ?
    `),
    insertDocument: db.prepare(`
      INSERT INTO student_documents (id, studentId, name, type, dataUrl)
      VALUES (?, ?, ?, ?, ?)
    `),
    deleteDocument: db.prepare('DELETE FROM student_documents WHERE id = ?'),
    deleteDocumentBySchool: db.prepare(`
      DELETE FROM student_documents 
      WHERE id = ? AND studentId IN (
        SELECT id FROM students WHERE schoolId = ?
      )
    `),
    studentBelongsToSchool: db.prepare('SELECT 1 FROM students WHERE id = ? AND schoolId = ?'),
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
  return !!statements.studentBelongsToSchool.get(studentId, schoolId);
}

/**
 * Get documents by student with school isolation
 * @param studentId - Student ID
 * @param schoolId - School ID for isolation (REQUIRED)
 */
export function getDocumentsByStudentAndSchool(studentId: string, schoolId: string): Document[] {
  if (!schoolId) {
    throw new Error('[SECURITY] getDocumentsByStudentAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    return statements.getDocumentsByStudentAndSchool.all(studentId, schoolId) as Document[];
  } catch (error) {
    console.error('Database error in getDocumentsByStudentAndSchool:', error);
    return [];
  }
}

/**
 * Get a specific document with school isolation
 * @param id - Document ID
 * @param schoolId - School ID for isolation (REQUIRED)
 */
export function getDocumentByIdAndSchool(id: string, schoolId: string): Document | null {
  if (!schoolId) {
    throw new Error('[SECURITY] getDocumentByIdAndSchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    return statements.getDocumentByIdAndSchool.get(id, schoolId) as Document | null;
  } catch (error) {
    console.error('Database error in getDocumentByIdAndSchool:', error);
    return null;
  }
}

/**
 * Save document with school isolation check
 * @param document - Document data
 * @param schoolId - School ID for isolation check (REQUIRED)
 */
export function saveDocumentWithSchoolCheck(document: Document, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] saveDocumentWithSchoolCheck requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    
    if (!studentBelongsToSchool(document.studentId, schoolId)) {
      console.warn(`[SECURITY] Attempted to save document for student ${document.studentId} not belonging to school ${schoolId}`);
      return false;
    }
    
    statements.insertDocument.run(
      document.id,
      document.studentId,
      document.name,
      document.type,
      document.dataUrl
    );
    return true;
  } catch (error) {
    console.error('Database error in saveDocumentWithSchoolCheck:', error);
    return false;
  }
}

/**
 * Delete document with school isolation
 * @param id - Document ID
 * @param schoolId - School ID for isolation (REQUIRED)
 */
export function deleteDocumentBySchool(id: string, schoolId: string): boolean {
  if (!schoolId) {
    throw new Error('[SECURITY] deleteDocumentBySchool requires schoolId for school isolation');
  }
  
  try {
    ensureInitialized();
    const result = statements.deleteDocumentBySchool.run(id, schoolId);
    return result.changes > 0;
  } catch (error) {
    console.error('Database error in deleteDocumentBySchool:', error);
    return false;
  }
}

// ================= DEPRECATED FUNCTIONS =================
// These functions do not check school isolation and should be avoided

/**
 * @deprecated Use getDocumentsByStudentAndSchool instead for proper school isolation
 */
export function getDocumentsByStudent(studentId: string): Document[] {
  console.warn('[DEPRECATED] getDocumentsByStudent() called without schoolId. Use getDocumentsByStudentAndSchool() instead.');
  try {
    ensureInitialized();
    return statements.getDocumentsByStudent.all(studentId) as Document[];
  } catch (error) {
    console.error('Database error in getDocumentsByStudent:', error);
    return [];
  }
}

/**
 * @deprecated Use saveDocumentWithSchoolCheck instead for proper school isolation
 */
export function saveDocument(document: Document): void {
  console.warn('[DEPRECATED] saveDocument() called without schoolId check. Use saveDocumentWithSchoolCheck() instead.');
  try {
    ensureInitialized();
    statements.insertDocument.run(
      document.id,
      document.studentId,
      document.name,
      document.type,
      document.dataUrl
    );
  } catch (error) {
    console.error('Database error in saveDocument:', error);
    throw error;
  }
}

/**
 * @deprecated Use deleteDocumentBySchool instead for proper school isolation
 */
export function deleteDocument(id: string, schoolId?: string): void {
  if (schoolId) {
    const success = deleteDocumentBySchool(id, schoolId);
    if (!success) {
      throw new Error('Document not found or not accessible');
    }
    return;
  }
  
  console.warn('[DEPRECATED] deleteDocument() called without schoolId. Use deleteDocumentBySchool() instead.');
  try {
    ensureInitialized();
    statements.deleteDocument.run(id);
  } catch (error) {
    console.error('Database error in deleteDocument:', error);
    throw error;
  }
}
