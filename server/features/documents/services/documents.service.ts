import * as repository from '../repository/documents.repository.js';
import type { Document } from '../types/documents.types.js';

export function validateDocument(document: any): { valid: boolean; error?: string } {
  if (!document || typeof document !== 'object') {
    return { valid: false, error: "Geçersiz doküman verisi" };
  }
  
  if (!document.id || typeof document.id !== 'string') {
    return { valid: false, error: "Doküman ID zorunludur" };
  }
  
  if (!document.studentId || typeof document.studentId !== 'string') {
    return { valid: false, error: "Öğrenci ID zorunludur" };
  }
  
  if (!document.name || typeof document.name !== 'string') {
    return { valid: false, error: "Doküman adı zorunludur" };
  }
  
  if (!document.type || typeof document.type !== 'string') {
    return { valid: false, error: "Doküman tipi zorunludur" };
  }
  
  if (!document.dataUrl || typeof document.dataUrl !== 'string') {
    return { valid: false, error: "Doküman verisi zorunludur" };
  }
  
  return { valid: true };
}

export function getStudentDocuments(studentId: string): Document[] {
  if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
    throw new Error("Geçersiz öğrenci ID");
  }
  
  return repository.getDocumentsByStudent(studentId);
}

export function createDocument(document: any): void {
  const validation = validateDocument(document);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  repository.saveDocument(document);
}

export function removeDocument(id: string): void {
  if (!id || typeof id !== 'string' || id.length > 50) {
    throw new Error("Geçersiz doküman ID");
  }
  
  repository.deleteDocument(id);
}
