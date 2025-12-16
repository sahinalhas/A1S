import {
  loadStudentsBySchool,
  saveStudentsForSchool,
  getStudentById
} from '../features/students/repository/students.repository.js';
import type { Student } from '../features/students/types/students.types.js';

import {
  loadSubjects,
  saveSubjects,
  loadTopics,
  saveTopics
} from '../features/subjects/repository/subjects.repository.js';
import type { Subject, Topic } from '../features/subjects/types/subjects.types.js';

import { saveProgress } from '../features/progress/repository/progress.repository.js';
import type { Progress } from '../features/progress/types/progress.types.js';

import { upsertAcademicGoal } from '../features/coaching/repository/coaching.repository.js';
import type { AcademicGoal } from '../features/coaching/types/coaching.types.js';

import getDatabase from './database.js';

/**
 * Migration işlemi artık schoolId gerektirir.
 * LocalStorage'dan gelen veriler belirtilen schoolId'ye atanır.
 */
export function migrateFromLocalStorage(localStorageData: any, schoolId: string) {
  if (!schoolId) {
    throw new Error('schoolId is required for migration');
  }

  console.log(`Starting migration from localStorage to SQLite for school: ${schoolId}...`);

  try {
    // Students migration - assign to school
    if (localStorageData.students && Array.isArray(localStorageData.students)) {
      console.log(`Migrating ${localStorageData.students.length} students to school ${schoolId}...`);
      const studentsWithSchool = localStorageData.students.map((s: Student) => ({
        ...s,
        schoolId
      }));
      saveStudentsForSchool(studentsWithSchool, schoolId);
    }

    // Subjects migration
    if (localStorageData.subjects && Array.isArray(localStorageData.subjects)) {
      console.log(`Migrating ${localStorageData.subjects.length} subjects...`);
      saveSubjects(localStorageData.subjects);
    }

    // Topics migration
    if (localStorageData.topics && Array.isArray(localStorageData.topics)) {
      console.log(`Migrating ${localStorageData.topics.length} topics...`);
      saveTopics(localStorageData.topics);
    }

    // Progress migration
    if (localStorageData.progress && Array.isArray(localStorageData.progress)) {
      console.log(`Migrating ${localStorageData.progress.length} progress records...`);
      saveProgress(localStorageData.progress);
    }

    // Academic goals migration
    if (localStorageData.academicGoals && Array.isArray(localStorageData.academicGoals)) {
      console.log(`Migrating ${localStorageData.academicGoals.length} academic goals...`);
      for (const goal of localStorageData.academicGoals) {
        upsertAcademicGoal(goal);
      }
    }

    console.log('Migration completed successfully!');
    return { success: true, message: 'Migration completed successfully' };
  } catch (error) {
    console.error('Migration failed:', error);
    return { success: false, message: 'Migration failed: ' + (error instanceof Error ? error.message : String(error)) };
  }
}

/**
 * Migration durumunu kontrol eder.
 * @param schoolId - Kontrol edilecek okul ID'si (opsiyonel, verilmezse ilk okul kullanılır)
 */
export function getMigrationStatus(schoolId?: string) {
  // Eğer schoolId verilmemişse, ilk okulu bul
  if (!schoolId) {
    const db = getDatabase();
    const firstSchool = db.prepare('SELECT id FROM schools LIMIT 1').get() as { id: string } | undefined;
    if (!firstSchool) {
      return {
        hasData: false,
        counts: {
          students: 0,
          subjects: 0,
          topics: 0
        }
      };
    }
    schoolId = firstSchool.id;
  }

  // Check if database has any data
  const students = loadStudentsBySchool(schoolId);
  const subjects = loadSubjects();
  const topics = loadTopics();

  return {
    hasData: students.length > 0 || subjects.length > 0 || topics.length > 0,
    counts: {
      students: students.length,
      subjects: subjects.length,
      topics: topics.length
    }
  };
}
