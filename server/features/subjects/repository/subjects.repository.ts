import getDatabase from '../../../lib/database.js';
import type { Subject, Topic } from '../types/subjects.types.js';
import { seedSubjectsAndTopics } from '../../../lib/database/schema/academic.schema.js';

let statements: any = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;
  
  const db = getDatabase();
  
  statements = {
    getSubjects: db.prepare('SELECT * FROM subjects ORDER BY name'),
    getSubject: db.prepare('SELECT * FROM subjects WHERE id = ?'),
    insertSubject: db.prepare('INSERT INTO subjects (id, name, code, description, color, category) VALUES (?, ?, ?, ?, ?, ?)'),
    updateSubject: db.prepare('UPDATE subjects SET name = ?, code = ?, description = ?, color = ?, category = ? WHERE id = ?'),
    deleteSubject: db.prepare('DELETE FROM subjects WHERE id = ?'),
    upsertSubject: db.prepare(`
      INSERT INTO subjects (id, name, code, description, color, category)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        code = excluded.code,
        description = excluded.description,
        color = excluded.color,
        category = excluded.category
    `),
    getTopics: db.prepare('SELECT * FROM topics ORDER BY name'),
    getTopicsBySubject: db.prepare('SELECT * FROM topics WHERE subjectId = ? ORDER BY name'),
    getTopic: db.prepare('SELECT * FROM topics WHERE id = ?'),
    insertTopic: db.prepare('INSERT INTO topics (id, subjectId, name, description, difficulty, estimatedHours, avgMinutes, "order", energyLevel, difficultyScore, priority, deadline) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'),
    updateTopic: db.prepare('UPDATE topics SET name = ?, description = ?, difficulty = ?, estimatedHours = ?, avgMinutes = ?, "order" = ?, energyLevel = ?, difficultyScore = ?, priority = ?, deadline = ? WHERE id = ?'),
    deleteTopic: db.prepare('DELETE FROM topics WHERE id = ?'),
    upsertTopic: db.prepare(`
      INSERT INTO topics (id, subjectId, name, description, difficulty, estimatedHours, avgMinutes, "order", energyLevel, difficultyScore, priority, deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        subjectId = excluded.subjectId,
        name = excluded.name,
        description = excluded.description,
        difficulty = excluded.difficulty,
        estimatedHours = excluded.estimatedHours,
        avgMinutes = excluded.avgMinutes,
        "order" = excluded."order",
        energyLevel = excluded.energyLevel,
        difficultyScore = excluded.difficultyScore,
        priority = excluded.priority,
        deadline = excluded.deadline
    `),
  };
  
  isInitialized = true;
}

export function loadSubjects(): Subject[] {
  try {
    ensureInitialized();
    return statements.getSubjects.all() as Subject[];
  } catch (error) {
    console.error('Error loading subjects:', error);
    return [];
  }
}

export function saveSubjects(subjects: Subject[]): void {
  ensureInitialized();
  const transaction = getDatabase().transaction(() => {
    const existingSubjects = statements.getSubjects.all() as Subject[];
    const incomingIds = new Set(subjects.map(s => s.id));
    
    for (const existing of existingSubjects) {
      if (!incomingIds.has(existing.id)) {
        statements.deleteSubject.run(existing.id);
      }
    }
    
    for (const subject of subjects) {
      statements.upsertSubject.run(
        subject.id, subject.name, subject.code,
        subject.description, subject.color, subject.category
      );
    }
  });
  
  transaction();
}

export function loadTopics(): Topic[] {
  try {
    ensureInitialized();
    return statements.getTopics.all() as Topic[];
  } catch (error) {
    console.error('Error loading topics:', error);
    return [];
  }
}

export function saveTopics(topics: Topic[]): void {
  ensureInitialized();
  const transaction = getDatabase().transaction(() => {
    const existingTopics = statements.getTopics.all() as Topic[];
    const incomingIds = new Set(topics.map(t => t.id));
    
    for (const existing of existingTopics) {
      if (!incomingIds.has(existing.id)) {
        statements.deleteTopic.run(existing.id);
      }
    }
    
    for (const topic of topics) {
      statements.upsertTopic.run(
        topic.id, topic.subjectId, topic.name, topic.description,
        topic.difficulty, topic.estimatedHours, topic.avgMinutes, topic.order,
        topic.energyLevel, topic.difficultyScore, topic.priority, topic.deadline
      );
    }
  });
  
  transaction();
}

export function resetToDefaultData(): void {
  ensureInitialized();
  const db = getDatabase();
  
  const transaction = db.transaction(() => {
    db.prepare('DELETE FROM topics').run();
    db.prepare('DELETE FROM subjects').run();
    
    seedSubjectsAndTopics(db);
  });
  
  transaction();
}
