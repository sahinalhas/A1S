import getDatabase from '../../../lib/database.js';
import { buildDynamicUpdate } from '../../../utils/helpers/repository.js';
import type { HomeVisit } from '../types/coaching.types.js';
import type { Statement } from 'better-sqlite3';

let statements: { getHomeVisitsByStudent: Statement; insertHomeVisit: Statement } | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getHomeVisitsByStudent: db.prepare('SELECT * FROM home_visits WHERE studentId = ? ORDER BY date DESC'),
    insertHomeVisit: db.prepare(`
      INSERT INTO home_visits (id, studentId, date, time, visitDuration, visitors, familyPresent, 
                              homeEnvironment, familyInteraction, observations, recommendations, 
                              concerns, resources, followUpActions, nextVisitPlanned, notes, 
                              createdBy, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
  };
  
  isInitialized = true;
}

export function getHomeVisitsByStudent(studentId: string): HomeVisit[] {
  try {
    ensureInitialized();
    const visits = statements!.getHomeVisitsByStudent.all(studentId) as HomeVisit[];
    
    return visits.map((v) => ({
      ...v,
      visitors: v.visitors ? JSON.parse(v.visitors as unknown as string) : [],
      familyPresent: v.familyPresent ? JSON.parse(v.familyPresent as unknown as string) : []
    }));
  } catch (error) {
    console.error('Database error in getHomeVisitsByStudent:', error);
    throw error;
  }
}

export function insertHomeVisit(visit: HomeVisit): void {
  try {
    ensureInitialized();
    
    const visitorsJson = JSON.stringify(visit.visitors || []);
    const familyPresentJson = JSON.stringify(visit.familyPresent || []);
    
    statements!.insertHomeVisit.run(
      visit.id,
      visit.studentId,
      visit.date,
      visit.time,
      visit.visitDuration,
      visitorsJson,
      familyPresentJson,
      visit.homeEnvironment,
      visit.familyInteraction,
      visit.observations,
      visit.recommendations,
      visit.concerns,
      visit.resources,
      visit.followUpActions,
      visit.nextVisitPlanned,
      visit.notes,
      visit.createdBy,
      visit.createdAt
    );
  } catch (error) {
    console.error('Error inserting home visit:', error);
    throw error;
  }
}

export function updateHomeVisit(id: string, updates: Partial<HomeVisit>): void {
  try {
    ensureInitialized();
    const db = getDatabase();
    
    buildDynamicUpdate(db, {
      tableName: 'home_visits',
      id,
      updates,
      allowedFields: ['date', 'time', 'visitDuration', 'visitors', 'familyPresent', 
                     'homeEnvironment', 'familyInteraction', 'observations', 'recommendations', 
                     'concerns', 'resources', 'followUpActions', 'nextVisitPlanned', 'notes'],
      jsonFields: ['visitors', 'familyPresent']
    });
  } catch (error) {
    console.error('Error updating home visit:', error);
    throw error;
  }
}
