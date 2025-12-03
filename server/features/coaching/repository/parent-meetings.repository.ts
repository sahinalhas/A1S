import getDatabase from '../../../lib/database.js';
import { buildDynamicUpdate } from '../../../utils/helpers/repository.js';
import type { ParentMeeting } from '../types/coaching.types.js';
import type { Statement } from 'better-sqlite3';

let statements: { getParentMeetingsByStudent: Statement; insertParentMeeting: Statement } | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getParentMeetingsByStudent: db.prepare('SELECT * FROM parent_meetings WHERE studentId = ? ORDER BY meetingDate DESC'),
    insertParentMeeting: db.prepare(`
      INSERT INTO parent_meetings (id, studentId, meetingDate, time, type, participants, mainTopics, 
                                   concerns, decisions, actionPlan, nextMeetingDate, parentSatisfaction, 
                                   followUpRequired, notes, createdBy, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
  };
  
  isInitialized = true;
}

export function getParentMeetingsByStudent(studentId: string): ParentMeeting[] {
  try {
    ensureInitialized();
    const meetings = statements!.getParentMeetingsByStudent.all(studentId) as ParentMeeting[];
    
    return meetings.map((m) => ({
      ...m,
      participants: m.participants ? JSON.parse(m.participants as unknown as string) : [],
      mainTopics: m.mainTopics ? JSON.parse(m.mainTopics as unknown as string) : []
    }));
  } catch (error) {
    console.error('Database error in getParentMeetingsByStudent:', error);
    throw error;
  }
}

export function insertParentMeeting(meeting: ParentMeeting): void {
  try {
    ensureInitialized();
    
    const participantsJson = JSON.stringify(meeting.participants || []);
    const topicsJson = JSON.stringify(meeting.mainTopics || []);
    
    statements!.insertParentMeeting.run(
      meeting.id,
      meeting.studentId,
      meeting.meetingDate,
      meeting.time,
      meeting.type,
      participantsJson,
      topicsJson,
      meeting.concerns,
      meeting.decisions,
      meeting.actionPlan,
      meeting.nextMeetingDate,
      meeting.parentSatisfaction,
      meeting.followUpRequired ? 1 : 0,
      meeting.notes,
      meeting.createdBy,
      meeting.createdAt
    );
  } catch (error) {
    console.error('Error inserting parent meeting:', error);
    throw error;
  }
}

export function updateParentMeeting(id: string, updates: Partial<ParentMeeting>): void {
  try {
    ensureInitialized();
    const db = getDatabase();
    
    buildDynamicUpdate(db, {
      tableName: 'parent_meetings',
      id,
      updates,
      allowedFields: ['meetingDate', 'time', 'type', 'participants', 'mainTopics', 'concerns', 
                     'decisions', 'actionPlan', 'nextMeetingDate', 'parentSatisfaction', 
                     'followUpRequired', 'notes'],
      jsonFields: ['participants', 'mainTopics'],
      booleanFields: ['followUpRequired']
    });
  } catch (error) {
    console.error('Error updating parent meeting:', error);
    throw error;
  }
}
