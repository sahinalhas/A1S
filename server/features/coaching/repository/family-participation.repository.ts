import getDatabase from '../../../lib/database.js';
import { buildDynamicUpdate } from '../../../utils/helpers/repository.js';
import type { FamilyParticipation } from '../types/coaching.types.js';
import type { Statement } from 'better-sqlite3';

let statements: { getFamilyParticipationByStudent: Statement; insertFamilyParticipation: Statement } | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getFamilyParticipationByStudent: db.prepare('SELECT * FROM family_participation WHERE studentId = ? ORDER BY eventDate DESC'),
    insertFamilyParticipation: db.prepare(`
      INSERT INTO family_participation (id, studentId, eventType, eventName, eventDate, participationStatus, 
                                       participants, engagementLevel, communicationFrequency, preferredContactMethod, 
                                       parentAvailability, notes, recordedBy, recordedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
  };
  
  isInitialized = true;
}

export function getFamilyParticipationByStudent(studentId: string): FamilyParticipation[] {
  try {
    ensureInitialized();
    const records = statements!.getFamilyParticipationByStudent.all(studentId) as FamilyParticipation[];
    
    return records.map((r) => ({
      ...r,
      participants: r.participants ? JSON.parse(r.participants as unknown as string) : []
    }));
  } catch (error) {
    console.error('Database error in getFamilyParticipationByStudent:', error);
    throw error;
  }
}

export function insertFamilyParticipation(record: FamilyParticipation): void {
  try {
    ensureInitialized();
    
    const participantsJson = JSON.stringify(record.participants || []);
    
    statements!.insertFamilyParticipation.run(
      record.id,
      record.studentId,
      record.eventType,
      record.eventName,
      record.eventDate,
      record.participationStatus,
      participantsJson,
      record.engagementLevel,
      record.communicationFrequency,
      record.preferredContactMethod,
      record.parentAvailability,
      record.notes,
      record.recordedBy,
      record.recordedAt
    );
  } catch (error) {
    console.error('Error inserting family participation:', error);
    throw error;
  }
}

export function updateFamilyParticipation(id: string, updates: Partial<FamilyParticipation>): void {
  try {
    ensureInitialized();
    const db = getDatabase();
    
    buildDynamicUpdate(db, {
      tableName: 'family_participation',
      id,
      updates,
      allowedFields: ['eventType', 'eventName', 'eventDate', 'participationStatus', 
                     'participants', 'engagementLevel', 'communicationFrequency', 
                     'preferredContactMethod', 'parentAvailability', 'notes'],
      jsonFields: ['participants']
    });
  } catch (error) {
    console.error('Error updating family participation:', error);
    throw error;
  }
}
