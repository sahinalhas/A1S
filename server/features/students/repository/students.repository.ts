import getDatabase from '../../../lib/database.js';
import type { Student, AcademicRecord, Progress } from '../types/students.types.js';
import type BetterSqlite3 from 'better-sqlite3';
import { logger } from '../../../utils/logger.js';

interface PreparedStatements {
  getStudentsBySchool: BetterSqlite3.Statement;
  getStudent: BetterSqlite3.Statement;
  getStudentByIdAndSchool: BetterSqlite3.Statement;
  insertStudent: BetterSqlite3.Statement;
  upsertStudent: BetterSqlite3.Statement;
  updateStudent: BetterSqlite3.Statement;
  deleteStudent: BetterSqlite3.Statement;
  deleteStudentBySchool: BetterSqlite3.Statement;
  getAcademicsByStudent: BetterSqlite3.Statement;
  insertAcademic: BetterSqlite3.Statement;
  getProgressByStudent: BetterSqlite3.Statement;
  upsertProgress: BetterSqlite3.Statement;
}

let statements: PreparedStatements | null = null;
let isInitialized = false;

function ensureInitialized(): void {
  if (isInitialized && statements) return;

  const db = getDatabase();

  // Extended fields for student profile
  const extendedFields = [
    'id', 'name', 'surname', 'email', 'phone', 'birthDate', 'birthPlace', 'tcIdentityNo',
    'address', 'province', 'district', 'grade', 'section', 'isSpecialEducation', 'class', 'studentNumber', 'enrollmentDate', 'status',
    'avatar', 'parentContact', 'notes', 'gender', 'risk', 'schoolId',
    // Mother info
    'motherName', 'motherEducation', 'motherOccupation', 'motherEmail', 'motherPhone',
    'motherVitalStatus', 'motherLivingStatus',
    // Father info
    'fatherName', 'fatherEducation', 'fatherOccupation', 'fatherEmail', 'fatherPhone',
    'fatherVitalStatus', 'fatherLivingStatus',
    // Guardian info
    'guardianName', 'guardianRelation', 'guardianPhone', 'guardianEmail',
    // Family & living
    'numberOfSiblings', 'livingWith', 'homeRentalStatus', 'homeHeatingType',
    'transportationToSchool', 'studentWorkStatus',
    // Assessment
    'counselor', 'tags', 'interests',
    // Health & additional
    'healthNote', 'bloodType', 'languageSkills', 'hobbiesDetailed',
    'extracurricularActivities', 'studentExpectations', 'familyExpectations',
    // Health extended
    'chronicDiseases', 'allergies', 'medications', 'medicalHistory', 'specialNeeds',
    'physicalLimitations', 'emergencyContact1Name', 'emergencyContact1Phone', 'emergencyContact1Relation',
    'emergencyContact2Name', 'emergencyContact2Phone', 'emergencyContact2Relation', 'healthAdditionalNotes',
    // Talents & Interests
    'creativeTalents', 'physicalTalents', 'primaryInterests', 'exploratoryInterests',
    'clubMemberships', 'competitionsParticipated', 'talentsAdditionalNotes',
    // Legacy
    'primaryLearningStyle', 'englishScore'
  ];

  const fieldPlaceholders = extendedFields.map(() => '?').join(', ');
  const updateClause = extendedFields
    .filter(f => f !== 'id')
    .map(f => `${f} = excluded.${f}`)
    .join(', ');

  statements = {
    getStudentsBySchool: db.prepare('SELECT * FROM students WHERE schoolId = ? ORDER BY name, surname'),
    getStudent: db.prepare('SELECT * FROM students WHERE id = ?'),
    getStudentByIdAndSchool: db.prepare('SELECT * FROM students WHERE id = ? AND schoolId = ?'),
    insertStudent: db.prepare(`
      INSERT INTO students (${extendedFields.join(', ')})
      VALUES (${fieldPlaceholders})
    `),
    upsertStudent: db.prepare(`
      INSERT INTO students (${extendedFields.join(', ')})
      VALUES (${fieldPlaceholders})
      ON CONFLICT(id) DO UPDATE SET
        ${updateClause},
        updated_at = CURRENT_TIMESTAMP
    `),
    updateStudent: db.prepare(`
      UPDATE students SET name = ?, surname = ?, email = ?, phone = ?, birthDate = ?, address = ?, class = ?, studentNumber = ?,
                         status = ?, avatar = ?, parentContact = ?, notes = ?, gender = ?, risk = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND schoolId = ?
    `),
    deleteStudent: db.prepare('DELETE FROM students WHERE id = ?'),
    deleteStudentBySchool: db.prepare('DELETE FROM students WHERE id = ? AND schoolId = ?'),
    getAcademicsByStudent: db.prepare('SELECT * FROM academic_records WHERE studentId = ? ORDER BY year DESC, semester DESC'),
    insertAcademic: db.prepare(`
      INSERT INTO academic_records (studentId, semester, gpa, year, exams, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `),
    getProgressByStudent: db.prepare('SELECT * FROM progress WHERE studentId = ? ORDER BY lastStudied DESC'),
    upsertProgress: db.prepare(`
      INSERT INTO progress (id, studentId, topicId, completed, remaining, lastStudied, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(studentId, topicId) DO UPDATE SET
        completed = excluded.completed,
        remaining = excluded.remaining,
        lastStudied = excluded.lastStudied,
        notes = excluded.notes,
        updated_at = CURRENT_TIMESTAMP
    `),
  };

  isInitialized = true;
}

const JSON_ARRAY_FIELDS = [
  'tags', 'interests', 'chronicDiseases', 'allergies', 'medications',
  'creativeTalents', 'physicalTalents', 'primaryInterests', 'exploratoryInterests',
  'clubMemberships', 'competitionsParticipated'
] as const;

function safeJsonParse(value: unknown): unknown[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : undefined;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

function parseStudentRow(row: Record<string, unknown>): Student {
  const student = { ...row } as unknown as Student;

  for (const field of JSON_ARRAY_FIELDS) {
    const value = row[field];
    if (value !== undefined && value !== null) {
      (student as unknown as Record<string, unknown>)[field] = safeJsonParse(value);
    }
  }

  // Compute class from grade + section if not set
  if (!student.class && (student.grade || student.section)) {
    student.class = `${student.grade || ''}${student.section || ''}`;
  }

  return student;
}

function validateStudent(student: Student): boolean {
  if (!student || !student.id) {
    console.warn('Skipping invalid student: missing id', student);
    return false;
  }
  if (!student.name || student.name.trim() === '') {
    console.warn(`Skipping student ${student.id}: missing or empty name`);
    return false;
  }
  if (!student.surname || student.surname.trim() === '') {
    console.warn(`Skipping student ${student.id}: missing or empty surname`);
    return false;
  }
  return true;
}

/**
 * @deprecated Bu fonksiyon schoolId filtresi kullanmıyor ve veri karışıklığına yol açabilir.
 * Bunun yerine loadStudentsBySchool(schoolId) kullanın.
 * Bu fonksiyon sadece migration ve admin işlemleri için kalmalıdır.
 */
export function loadStudents(): Student[] {
  logger.warn('loadStudents() called without schoolId - this may cause data leakage between schools', 'StudentsRepository');
  console.warn('[DEPRECATED] loadStudents() called without schoolId. Use loadStudentsBySchool(schoolId) instead.');

  try {
    ensureInitialized();
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM students ORDER BY name, surname');
    const rows = stmt.all() as Record<string, unknown>[];
    const students = rows.map(parseStudentRow);
    return students.filter(validateStudent);
  } catch (error) {
    console.error('Database error in loadStudents:', error);
    return [];
  }
}

/**
 * Belirli bir okula ait öğrencileri yükler.
 * @param schoolId - Okul ID'si (zorunlu)
 */
export function loadStudentsBySchool(schoolId: string): Student[] {
  if (!schoolId) {
    throw new Error('schoolId is required for loadStudentsBySchool');
  }

  try {
    ensureInitialized();
    const rows = statements!.getStudentsBySchool.all(schoolId) as Record<string, unknown>[];
    const students = rows.map(parseStudentRow);
    return students.filter(validateStudent);
  } catch (error) {
    console.error('Database error in loadStudentsBySchool:', error);
    return [];
  }
}

/**
 * Öğrenciyi ID ve schoolId ile getirir (güvenli erişim kontrolü için)
 */
export function getStudentByIdAndSchool(studentId: string, schoolId: string): Student | null {
  if (!studentId || !schoolId) {
    throw new Error('studentId and schoolId are required');
  }

  try {
    ensureInitialized();
    const row = statements!.getStudentByIdAndSchool.get(studentId, schoolId) as Record<string, unknown> | undefined;
    return row ? parseStudentRow(row) : null;
  } catch (error) {
    console.error('Error in getStudentByIdAndSchool:', error);
    return null;
  }
}

/**
 * Öğrenciyi sadece ID ile getirir (dikkatli kullanılmalı)
 */
export function getStudentById(studentId: string): Student | null {
  if (!studentId) {
    throw new Error('studentId is required');
  }

  try {
    ensureInitialized();
    const row = statements!.getStudent.get(studentId) as Record<string, unknown> | undefined;
    return row ? parseStudentRow(row) : null;
  } catch (error) {
    console.error('Error in getStudentById:', error);
    return null;
  }
}

/**
 * @deprecated Bu fonksiyon tehlikelidir - bir okulun öğrencileri kaydedilirken diğer okulların öğrencilerini silebilir.
 * Bunun yerine saveStudentsForSchool(students, schoolId) kullanın.
 */
export function saveStudents(students: Student[]): void {
  logger.warn('saveStudents() called without schoolId scope - this is dangerous!', 'StudentsRepository');
  console.warn('[DEPRECATED] saveStudents() is dangerous. Use saveStudentsForSchool(students, schoolId) instead.');

  if (!Array.isArray(students)) {
    throw new Error('Students parameter must be an array');
  }

  // Sadece öğrencileri kaydet, silme işlemi yapma
  try {
    ensureInitialized();
    const transaction = getDatabase().transaction(() => {
      for (const student of students) {
        if (!student.id || !student.name || !student.surname) {
          throw new Error(`Invalid student data: missing required fields (id: ${student.id}, name: ${student.name}, surname: ${student.surname})`);
        }

        const values = getStudentFieldValues(student);
        statements!.upsertStudent.run(...values);
      }
    });

    transaction();
  } catch (error) {
    console.error('Database error in saveStudents:', error);
    throw error;
  }
}

/**
 * Belirli bir okula ait öğrencileri güvenli şekilde kaydeder.
 * Sadece bu okula ait öğrencileri işler, diğer okulların verilerine dokunmaz.
 * @param students - Kaydedilecek öğrenci listesi
 * @param schoolId - Okul ID'si (zorunlu)
 */
export function saveStudentsForSchool(students: Student[], schoolId: string): void {
  if (!schoolId) {
    throw new Error('schoolId is required for saveStudentsForSchool');
  }

  if (!Array.isArray(students)) {
    throw new Error('Students parameter must be an array');
  }

  // Tüm öğrencilerin bu okula ait olduğunu doğrula
  for (const student of students) {
    if (student.schoolId && student.schoolId !== schoolId) {
      throw new Error(`Student ${student.id} belongs to school ${student.schoolId}, not ${schoolId}`);
    }
  }

  try {
    ensureInitialized();
    const transaction = getDatabase().transaction(() => {
      // Sadece bu okula ait mevcut öğrencileri al
      const existingStudents = statements!.getStudentsBySchool.all(schoolId) as Student[];
      const incomingIds = new Set(students.map(s => s.id));

      // Bu okulda olmayan öğrencileri sil (sadece bu okula ait olanları)
      for (const existing of existingStudents) {
        if (!incomingIds.has(existing.id)) {
          statements!.deleteStudentBySchool.run(existing.id, schoolId);
        }
      }

      // Yeni/güncellenen öğrencileri kaydet
      for (const student of students) {
        if (!student.id || !student.name || !student.surname) {
          throw new Error(`Invalid student data: missing required fields (id: ${student.id}, name: ${student.name}, surname: ${student.surname})`);
        }

        // schoolId'yi zorunlu olarak ayarla
        const studentWithSchool = { ...student, schoolId };

        const values = getStudentFieldValues(studentWithSchool);
        statements!.upsertStudent.run(...values);
      }
    });

    transaction();
  } catch (error) {
    console.error('Database error in saveStudentsForSchool:', error);
    throw error;
  }
}

/**
 * Get student field values in the correct order for prepared statements.
 */
function getStudentFieldValues(student: Student): unknown[] {
  // Compute class from grade + section if not already set
  const computedClass = student.class || `${student.grade || ''}${student.section || ''}`;

  return [
    student.id, student.name, student.surname, student.email, student.phone,
    student.birthDate, student.birthPlace, student.tcIdentityNo,
    student.address, student.province, student.district, student.grade, student.section,
    student.isSpecialEducation ? 1 : 0, computedClass, student.studentNumber,
    student.enrollmentDate, student.status, student.avatar, student.parentContact, student.notes,
    student.gender, student.risk, student.schoolId,
    // Mother info
    student.motherName, student.motherEducation, student.motherOccupation, student.motherEmail,
    student.motherPhone, student.motherVitalStatus, student.motherLivingStatus,
    // Father info
    student.fatherName, student.fatherEducation, student.fatherOccupation, student.fatherEmail,
    student.fatherPhone, student.fatherVitalStatus, student.fatherLivingStatus,
    // Guardian info
    student.guardianName, student.guardianRelation, student.guardianPhone, student.guardianEmail,
    // Family & living
    student.numberOfSiblings, student.livingWith, student.homeRentalStatus, student.homeHeatingType,
    student.transportationToSchool, student.studentWorkStatus,
    // Assessment
    student.counselor,
    student.tags ? JSON.stringify(student.tags) : null,
    student.interests ? JSON.stringify(student.interests) : null,
    // Health & additional
    student.healthNote, student.bloodType, student.languageSkills, student.hobbiesDetailed,
    student.extracurricularActivities, student.studentExpectations, student.familyExpectations,
    // Health extended
    student.chronicDiseases ? JSON.stringify(student.chronicDiseases) : null,
    student.allergies ? JSON.stringify(student.allergies) : null,
    student.medications ? JSON.stringify(student.medications) : null,
    student.medicalHistory, student.specialNeeds, student.physicalLimitations,
    student.emergencyContact1Name, student.emergencyContact1Phone, student.emergencyContact1Relation,
    student.emergencyContact2Name, student.emergencyContact2Phone, student.emergencyContact2Relation,
    student.healthAdditionalNotes,
    // Talents & Interests
    student.creativeTalents ? JSON.stringify(student.creativeTalents) : null,
    student.physicalTalents ? JSON.stringify(student.physicalTalents) : null,
    student.primaryInterests ? JSON.stringify(student.primaryInterests) : null,
    student.exploratoryInterests ? JSON.stringify(student.exploratoryInterests) : null,
    student.clubMemberships ? JSON.stringify(student.clubMemberships) : null,
    student.competitionsParticipated ? JSON.stringify(student.competitionsParticipated) : null,
    student.talentsAdditionalNotes,
    // Legacy
    student.primaryLearningStyle, student.englishScore
  ];
}

/**
 * Tek bir öğrenciyi kaydeder veya günceller.
 * schoolId zorunludur.
 */
export function saveStudent(student: Student): void {
  if (!student || typeof student !== 'object') {
    throw new Error('Student parameter is required and must be an object');
  }
  if (!student.id || !student.name || !student.surname) {
    throw new Error(`Invalid student data: missing required fields (id: ${student.id}, name: ${student.name}, surname: ${student.surname})`);
  }
  if (!student.schoolId) {
    throw new Error('schoolId is required for saveStudent');
  }

  try {
    ensureInitialized();
    const values = getStudentFieldValues(student);
    statements!.upsertStudent.run(...values);
  } catch (error) {
    console.error('Error saving student:', error);
    throw error;
  }
}

/**
 * @deprecated Bu fonksiyon schoolId kontrolü yapmıyor.
 * Bunun yerine deleteStudentBySchool(id, schoolId) kullanın.
 */
export function deleteStudent(id: string): void {
  logger.warn('deleteStudent() called without schoolId - this may affect other schools', 'StudentsRepository');
  console.warn('[DEPRECATED] deleteStudent() called without schoolId. Use deleteStudentBySchool(id, schoolId) instead.');

  try {
    ensureInitialized();
    statements!.deleteStudent.run(id);
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
}

/**
 * Belirli bir okula ait öğrenciyi güvenli şekilde siler.
 * Öğrenci bu okula ait değilse silme işlemi başarısız olur.
 */
export function deleteStudentBySchool(id: string, schoolId: string): boolean {
  if (!id || !schoolId) {
    throw new Error('id and schoolId are required for deleteStudentBySchool');
  }

  try {
    ensureInitialized();
    const result = statements!.deleteStudentBySchool.run(id, schoolId);
    return result.changes > 0;
  } catch (error) {
    console.error('Error in deleteStudentBySchool:', error);
    throw error;
  }
}

interface AcademicRecordRaw {
  id?: number;
  studentId: string;
  semester: string;
  gpa?: number;
  year: number;
  exams?: string;
  notes?: string;
}

export function getAcademicsByStudent(studentId: string): AcademicRecord[] {
  try {
    ensureInitialized();
    const records = statements!.getAcademicsByStudent.all(studentId) as AcademicRecordRaw[];
    return records.map(record => ({
      ...record,
      exams: record.exams ? JSON.parse(record.exams) : []
    }));
  } catch (error) {
    console.error('Error loading academic records:', error);
    return [];
  }
}

export function addAcademic(record: AcademicRecord): void {
  try {
    ensureInitialized();
    const examsJson = record.exams ? JSON.stringify(record.exams) : null;
    statements!.insertAcademic.run(
      record.studentId,
      record.semester,
      record.gpa !== undefined && record.gpa !== null ? record.gpa : null,
      record.year,
      examsJson,
      record.notes || null
    );
  } catch (error) {
    console.error('Error adding academic record:', error);
    throw error;
  }
}

export function getProgressByStudent(studentId: string): Progress[] {
  try {
    ensureInitialized();
    return statements!.getProgressByStudent.all(studentId) as Progress[];
  } catch (error) {
    console.error('Error loading progress:', error);
    return [];
  }
}

function saveProgress(progress: Progress[]): void {
  ensureInitialized();
  const transaction = getDatabase().transaction(() => {
    for (const p of progress) {
      statements!.upsertProgress.run(
        p.id, p.studentId, p.topicId, p.completed,
        p.remaining, p.lastStudied, p.notes
      );
    }
  });

  transaction();
}

interface Topic {
  id: string;
  name: string;
  estimatedHours: number;
}

export function ensureProgressForStudent(studentId: string): void {
  const db = getDatabase();
  const getTopics = db.prepare('SELECT * FROM topics ORDER BY name');
  const topics = getTopics.all() as Topic[];

  const existingProgress = getProgressByStudent(studentId);
  const existingTopicIds = new Set(existingProgress.map(p => p.topicId));

  const newProgress: Progress[] = [];
  for (const topic of topics) {
    if (!existingTopicIds.has(topic.id)) {
      newProgress.push({
        id: `progress_${studentId}_${topic.id}`,
        studentId,
        topicId: topic.id,
        completed: 0,
        remaining: topic.estimatedHours * 60,
        lastStudied: undefined,
        notes: undefined
      });
    }
  }

  if (newProgress.length > 0) {
    saveProgress(newProgress);
  }
}
