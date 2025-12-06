import * as repository from '../repository/students.repository.js';
import type { Student, AcademicRecord, Progress } from '../types/students.types.js';

type StudentInput = Record<string, unknown>;

function normalizeGender(value: unknown): 'K' | 'E' | undefined {
  if (!value) return undefined;
  const str = String(value).toUpperCase();
  if (str === 'K' || str === 'E' || str === 'KADIN' || str === 'ERKEK') {
    return str === 'ERKEK' ? 'E' : str === 'KADIN' ? 'K' : str as 'K' | 'E';
  }
  return undefined;
}

function normalizeRisk(value: unknown): 'Düşük' | 'Orta' | 'Yüksek' | undefined {
  if (!value) return undefined;
  const str = String(value).toLowerCase();
  const riskMap: Record<string, 'Düşük' | 'Orta' | 'Yüksek'> = {
    'düşük': 'Düşük',
    'dusuk': 'Düşük',
    'low': 'Düşük',
    'orta': 'Orta',
    'medium': 'Orta',
    'yüksek': 'Yüksek',
    'yuksek': 'Yüksek',
    'high': 'Yüksek'
  };
  return riskMap[str];
}

function normalizeStatus(value: unknown): 'active' | 'inactive' | 'graduated' {
  if (!value) return 'active';
  const str = String(value).toLowerCase();
  const statusMap: Record<string, 'active' | 'inactive' | 'graduated'> = {
    'active': 'active',
    'aktif': 'active',
    'inactive': 'inactive',
    'pasif': 'inactive',
    'graduated': 'graduated',
    'mezun': 'graduated'
  };
  return statusMap[str] || 'active';
}

export function normalizeStudentData(student: StudentInput): Student {
  const normalized: Student = {
    // Required fields
    id: student.id ? String(student.id).trim() : '',
    name: student.name ? String(student.name).trim() : '',
    surname: student.surname ? String(student.surname).trim() : '',
    enrollmentDate: (student.enrollmentDate as string | undefined) || new Date().toISOString().split('T')[0],
    
    // Education Information
    class: student.class ? String(student.class).trim() : undefined,
    studentNumber: student.studentNumber ? String(student.studentNumber).trim() : undefined,
    gender: normalizeGender(student.gender),
    birthDate: (student.birthDate as string | undefined) || undefined,
    birthPlace: student.birthPlace ? String(student.birthPlace).trim() : undefined,
    tcIdentityNo: student.tcIdentityNo ? String(student.tcIdentityNo).trim() : undefined,
    
    // Contact Information
    phone: student.phone ? String(student.phone).trim() : undefined,
    email: student.email ? String(student.email).trim() : undefined,
    address: student.address ? String(student.address).trim() : undefined,
    province: student.province ? String(student.province).trim() : undefined,
    district: student.district ? String(student.district).trim() : undefined,
    
    // Mother Information
    motherName: student.motherName ? String(student.motherName).trim() : undefined,
    motherEducation: student.motherEducation ? String(student.motherEducation).trim() : undefined,
    motherOccupation: student.motherOccupation ? String(student.motherOccupation).trim() : undefined,
    motherEmail: student.motherEmail ? String(student.motherEmail).trim() : undefined,
    motherPhone: student.motherPhone ? String(student.motherPhone).trim() : undefined,
    motherVitalStatus: (student.motherVitalStatus as 'Sağ' | 'Vefat Etmiş' | undefined) || undefined,
    motherLivingStatus: (student.motherLivingStatus as 'Birlikte' | 'Ayrı' | undefined) || undefined,
    
    // Father Information
    fatherName: student.fatherName ? String(student.fatherName).trim() : undefined,
    fatherEducation: student.fatherEducation ? String(student.fatherEducation).trim() : undefined,
    fatherOccupation: student.fatherOccupation ? String(student.fatherOccupation).trim() : undefined,
    fatherEmail: student.fatherEmail ? String(student.fatherEmail).trim() : undefined,
    fatherPhone: student.fatherPhone ? String(student.fatherPhone).trim() : undefined,
    fatherVitalStatus: (student.fatherVitalStatus as 'Sağ' | 'Vefat Etmiş' | undefined) || undefined,
    fatherLivingStatus: (student.fatherLivingStatus as 'Birlikte' | 'Ayrı' | undefined) || undefined,
    
    // Guardian Information
    guardianName: student.guardianName ? String(student.guardianName).trim() : undefined,
    guardianRelation: student.guardianRelation ? String(student.guardianRelation).trim() : undefined,
    guardianPhone: student.guardianPhone ? String(student.guardianPhone).trim() : undefined,
    guardianEmail: student.guardianEmail ? String(student.guardianEmail).trim() : undefined,
    
    // Family Structure
    numberOfSiblings: typeof student.numberOfSiblings === 'number' ? student.numberOfSiblings : undefined,
    
    // Living Situation
    livingWith: student.livingWith ? String(student.livingWith).trim() : undefined,
    homeRentalStatus: student.homeRentalStatus ? String(student.homeRentalStatus).trim() : undefined,
    homeHeatingType: student.homeHeatingType ? String(student.homeHeatingType).trim() : undefined,
    transportationToSchool: student.transportationToSchool ? String(student.transportationToSchool).trim() : undefined,
    studentWorkStatus: student.studentWorkStatus ? String(student.studentWorkStatus).trim() : undefined,
    
    // System Information
    status: normalizeStatus(student.status),
    avatar: (student.avatar as string | undefined) || undefined,
    parentContact: student.parentContact ? String(student.parentContact).trim() : undefined,
    notes: student.notes ? String(student.notes).trim() : undefined,
    schoolId: (student.schoolId as string | undefined) || undefined,
    
    // Assessment Information
    risk: normalizeRisk(student.risk),
    counselor: student.counselor ? String(student.counselor).trim() : undefined,
    tags: Array.isArray(student.tags) ? student.tags : undefined,
    
    // General Information
    interests: Array.isArray(student.interests) ? student.interests : undefined,
    healthNote: student.healthNote ? String(student.healthNote).trim() : undefined,
    bloodType: student.bloodType ? String(student.bloodType).trim() : undefined,
    
    // Additional Profile Information
    languageSkills: student.languageSkills ? String(student.languageSkills).trim() : undefined,
    hobbiesDetailed: student.hobbiesDetailed ? String(student.hobbiesDetailed).trim() : undefined,
    extracurricularActivities: student.extracurricularActivities ? String(student.extracurricularActivities).trim() : undefined,
    studentExpectations: student.studentExpectations ? String(student.studentExpectations).trim() : undefined,
    familyExpectations: student.familyExpectations ? String(student.familyExpectations).trim() : undefined,
    
    // Legacy fields
    primaryLearningStyle: student.primaryLearningStyle ? String(student.primaryLearningStyle).trim() : undefined,
    englishScore: typeof student.englishScore === 'number' ? student.englishScore : undefined,
  };
  
  return normalized;
}

export function validateStudent(student: unknown): { valid: boolean; error?: string } {
  if (!student || typeof student !== 'object') {
    return { valid: false, error: "Geçersiz öğrenci verisi" };
  }
  
  const studentObj = student as Record<string, unknown>;
  
  if (!studentObj.id || typeof studentObj.id !== 'string' || studentObj.id.trim().length === 0) {
    return { valid: false, error: "Öğrenci ID zorunludur" };
  }
  
  if (!studentObj.name || typeof studentObj.name !== 'string' || studentObj.name.trim().length === 0) {
    return { valid: false, error: "Öğrenci adı zorunludur" };
  }
  
  if (!studentObj.surname || typeof studentObj.surname !== 'string' || studentObj.surname.trim().length === 0) {
    return { valid: false, error: "Öğrenci soyadı zorunludur" };
  }
  
  return { valid: true };
}

export function validateAcademic(academic: unknown): { valid: boolean; error?: string } {
  if (!academic || typeof academic !== 'object') {
    return { valid: false, error: "Geçersiz akademik kayıt verisi" };
  }
  
  const academicObj = academic as Record<string, unknown>;
  
  if (!academicObj.studentId || !academicObj.semester || academicObj.year === undefined) {
    return { valid: false, error: "studentId, semester ve year alanları zorunludur" };
  }
  
  return { valid: true };
}

/**
 * @deprecated Bu fonksiyon schoolId filtresi kullanmıyor.
 * Bunun yerine getStudentsBySchool(schoolId) kullanın.
 */
export function getAllStudents(): Student[] {
  console.warn('[DEPRECATED] getAllStudents() called. Use getStudentsBySchool(schoolId) instead.');
  return repository.loadStudents();
}

/**
 * Belirli bir okula ait öğrencileri getirir.
 * @param schoolId - Okul ID'si (zorunlu)
 */
export function getStudentsBySchool(schoolId: string): Student[] {
  if (!schoolId) {
    throw new Error('schoolId is required for getStudentsBySchool');
  }
  return repository.loadStudentsBySchool(schoolId);
}

/**
 * Öğrenciyi ID ve schoolId ile getirir (güvenli erişim kontrolü)
 */
export function getStudentByIdAndSchool(studentId: string, schoolId: string): Student | null {
  if (!studentId || !schoolId) {
    throw new Error('studentId and schoolId are required');
  }
  return repository.getStudentByIdAndSchool(studentId, schoolId);
}

/**
 * Öğrenciyi sadece ID ile getirir (dikkatli kullanılmalı)
 */
export function getStudentById(studentId: string): Student | null {
  if (!studentId) {
    throw new Error('studentId is required');
  }
  return repository.getStudentById(studentId);
}

/**
 * Öğrenci oluşturur veya günceller.
 * schoolId zorunludur.
 */
export function createOrUpdateStudent(student: unknown): void {
  const validation = validateStudent(student);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const studentInput = student as StudentInput;
  console.log('[DEBUG] Incoming student parent data:', {
    motherName: studentInput.motherName,
    motherPhone: studentInput.motherPhone,
    fatherName: studentInput.fatherName,
    fatherPhone: studentInput.fatherPhone,
  });
  
  const normalizedStudent = normalizeStudentData(studentInput);
  
  console.log('[DEBUG] Normalized student parent data:', {
    motherName: normalizedStudent.motherName,
    motherPhone: normalizedStudent.motherPhone,
    fatherName: normalizedStudent.fatherName,
    fatherPhone: normalizedStudent.fatherPhone,
  });
  
  if (!normalizedStudent.schoolId) {
    throw new Error('schoolId is required for creating/updating students');
  }
  
  repository.saveStudent(normalizedStudent);
}

/**
 * Toplu öğrenci kaydetme.
 * Tüm öğrenciler belirtilen okula kaydedilir.
 */
export function bulkSaveStudents(students: unknown[], schoolId?: string): void {
  if (!Array.isArray(students)) {
    throw new Error('Expected array of students');
  }
  
  const invalidIndices: number[] = [];
  for (let i = 0; i < students.length; i++) {
    const validation = validateStudent(students[i]);
    if (!validation.valid) {
      invalidIndices.push(i);
    }
  }
  
  if (invalidIndices.length > 0) {
    throw new Error(`Geçersiz öğrenci verileri (indeksler: ${invalidIndices.join(', ')})`);
  }
  
  const normalizedStudents = students.map(student => {
    const normalized = normalizeStudentData(student as StudentInput);
    // schoolId parametresi verilmişse, tüm öğrencilere uygula
    if (schoolId) {
      normalized.schoolId = schoolId;
    }
    return normalized;
  });
  
  // Eğer schoolId verilmişse, güvenli şekilde kaydet
  if (schoolId) {
    repository.saveStudentsForSchool(normalizedStudents, schoolId);
  } else {
    // Eski davranış (deprecate edilmeli)
    console.warn('[DEPRECATED] bulkSaveStudents called without schoolId. This may cause data issues.');
    repository.saveStudents(normalizedStudents);
  }
}

/**
 * Toplu öğrenci kaydetme (güvenli versiyon).
 * @param students - Kaydedilecek öğrenci listesi
 * @param schoolId - Okul ID'si (zorunlu)
 */
export function bulkSaveStudentsForSchool(students: unknown[], schoolId: string): void {
  if (!schoolId) {
    throw new Error('schoolId is required for bulkSaveStudentsForSchool');
  }
  
  if (!Array.isArray(students)) {
    throw new Error('Expected array of students');
  }
  
  const invalidIndices: number[] = [];
  for (let i = 0; i < students.length; i++) {
    const validation = validateStudent(students[i]);
    if (!validation.valid) {
      invalidIndices.push(i);
    }
  }
  
  if (invalidIndices.length > 0) {
    throw new Error(`Geçersiz öğrenci verileri (indeksler: ${invalidIndices.join(', ')})`);
  }
  
  const normalizedStudents = students.map(student => {
    const normalized = normalizeStudentData(student as StudentInput);
    normalized.schoolId = schoolId;
    return normalized;
  });
  
  repository.saveStudentsForSchool(normalizedStudents, schoolId);
}

/**
 * Öğrenciyi güvenli şekilde siler.
 * Sadece belirtilen okula ait öğrenci silinebilir.
 * @param id - Öğrenci ID'si
 * @param schoolId - Okul ID'si (zorunlu)
 * @param confirmationName - Silme onayı için öğrenci adı (opsiyonel)
 */
export function removeStudent(id: string, schoolId: string, confirmationName?: string): { studentName: string } {
  if (!schoolId) {
    throw new Error('schoolId is required for removeStudent');
  }
  
  // Bu okula ait öğrenciyi bul
  const student = repository.getStudentByIdAndSchool(id, schoolId);
  
  if (!student) {
    throw new Error("Öğrenci bulunamadı veya bu okula ait değil");
  }
  
  if (confirmationName) {
    const expectedName = `${student.name} ${student.surname}`.trim();
    const sanitizedConfirmationName = (confirmationName || '').trim();
    
    if (sanitizedConfirmationName !== expectedName) {
      throw new Error("Silme işlemini onaylamak için öğrencinin tam adını doğru yazmalısınız");
    }
  }
  
  const deleted = repository.deleteStudentBySchool(id, schoolId);
  
  if (!deleted) {
    throw new Error("Öğrenci silinemedi");
  }
  
  return { studentName: `${student.name} ${student.surname}` };
}

/**
 * @deprecated Bu fonksiyon GÜVENLİK AÇIĞI oluşturuyordu ve KALDIRILDI.
 * Bunun yerine removeStudent(id, schoolId, confirmationName) kullanın.
 */
export function removeStudentLegacy(_id: string, _confirmationName?: string): never {
  throw new Error('[SECURITY] removeStudentLegacy() is disabled for security. Use removeStudent(id, schoolId, confirmationName) instead.');
}

export function getStudentAcademics(studentId: string): AcademicRecord[] {
  if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
    throw new Error("Geçersiz öğrenci ID");
  }
  
  return repository.getAcademicsByStudent(studentId);
}

export function createAcademic(academic: unknown): void {
  const validation = validateAcademic(academic);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  const academicObj = academic as Record<string, unknown>;
  
  const sanitizedAcademic: AcademicRecord = {
    studentId: academicObj.studentId as string,
    semester: academicObj.semester as string,
    gpa: academicObj.gpa !== undefined && academicObj.gpa !== null ? Number(academicObj.gpa) : undefined,
    year: Number(academicObj.year),
    exams: (academicObj.exams as AcademicRecord['exams']) || [],
    notes: (academicObj.notes as string | undefined) || undefined
  };
  
  repository.addAcademic(sanitizedAcademic);
}

export function getStudentProgress(studentId: string): Progress[] {
  if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
    throw new Error("Geçersiz öğrenci ID");
  }
  
  repository.ensureProgressForStudent(studentId);
  return repository.getProgressByStudent(studentId);
}
