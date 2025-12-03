/**
 * Student Data Processor Service
 * Merkezi Öğrenci Veri İşleme Servisi
 * 
 * Tüm öğrenci verilerinin normalizasyonu, validasyonu ve dönüştürülmesi
 * için merkezi servis
 */

import type { Student, ProfileCompleteness } from '../../shared/types/student.types.js';

/**
 * Normalize student data
 * Öğrenci verisini normalize et
 */
export function normalizeStudentData(student: any): Student {
  const normalized: any = { ...student };
  
  // ID normalizasyonu
  if (normalized.id && typeof normalized.id === 'string') {
    normalized.id = normalized.id.trim();
  }
  
  // Name-Surname normalizasyonu
  if (normalized.name && typeof normalized.name === 'string') {
    normalized.name = normalized.name.trim();
  }
  if (normalized.surname && typeof normalized.surname === 'string') {
    normalized.surname = normalized.surname.trim();
  }
  
  // Alan eşlemeleri
  if (normalized.className && !normalized.class) {
    normalized.class = normalized.className;
  }
  
  // Kayıt tarihi varsayılan
  if (!normalized.enrollmentDate) {
    normalized.enrollmentDate = new Date().toISOString().split('T')[0];
  }
  
  // Etiketler array'e çevir
  if (normalized.tags && typeof normalized.tags === 'string') {
    normalized.tags = normalized.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  }
  
  // İlgi alanları array'e çevir
  if (normalized.interests && typeof normalized.interests === 'string') {
    normalized.interests = normalized.interests.split(',').map((t: string) => t.trim()).filter(Boolean);
  }
  
  return normalized as Student;
}

/**
 * Validate student data
 * Öğrenci verisini doğrula
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateStudentData(student: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Zorunlu alanlar
  if (!student || typeof student !== 'object') {
    errors.push('Geçersiz öğrenci verisi');
    return { valid: false, errors, warnings };
  }
  
  if (!student.id || typeof student.id !== 'string' || student.id.trim().length === 0) {
    errors.push('Öğrenci ID zorunludur');
  }
  
  const hasName = student.name && typeof student.name === 'string' && student.name.trim().length > 0;
  const hasSurname = student.surname && typeof student.surname === 'string' && student.surname.trim().length > 0;
  
  if (!hasName || !hasSurname) {
    errors.push('Öğrenci adı ve soyadı zorunludur');
  }
  
  // E-posta validasyonu
  if (student.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(student.email)) {
      errors.push('Geçerli bir e-posta adresi giriniz');
    }
  }
  
  // Telefon validasyonu
  if (student.phone) {
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(student.phone.replace(/\s/g, ''))) {
      warnings.push('Telefon numarası 10-11 haneli olmalıdır');
    }
  }
  
  // Cinsiyet validasyonu
  if (student.gender) {
    if (student.gender !== 'K' && student.gender !== 'E') {
      errors.push('Cinsiyet K veya E olmalıdır');
    }
  }
  
  // Doğum tarihi validasyonu
  if (student.birthDate) {
    const date = new Date(student.birthDate);
    if (isNaN(date.getTime())) {
      errors.push('Geçerli bir doğum tarihi giriniz');
    } else {
      const age = new Date().getFullYear() - date.getFullYear();
      if (age < 5 || age > 25) {
        warnings.push('Öğrenci yaşı 5-25 aralığında olmalıdır');
      }
    }
  }
  
  // Risk seviyesi validasyonu
  if (student.risk) {
    if (!['Düşük', 'Orta', 'Yüksek'].includes(student.risk)) {
      errors.push('Risk seviyesi Düşük, Orta veya Yüksek olmalıdır');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Calculate profile completeness
 * Profil tamlık oranını hesapla
 */
export function calculateProfileCompleteness(student: Student): ProfileCompleteness {
  const scores = {
    temelBilgiler: 0,
    iletisimBilgileri: 0,
    veliBilgileri: 0
  };
  
  const eksikAlanlar: { kategori: string; alanlar: string[] }[] = [];
  
  // Temel Bilgiler (7 alan)
  const temelFields = [
    { key: 'name', label: 'Ad' },
    { key: 'surname', label: 'Soyad' },
    { key: 'class', label: 'Sınıf' },
    { key: 'studentNumber', label: 'Okul No' },
    { key: 'gender', label: 'Cinsiyet' },
    { key: 'birthDate', label: 'Doğum Tarihi' },
    { key: 'enrollmentDate', label: 'Kayıt Tarihi' }
  ];
  
  const temelEksik: string[] = [];
  let temelDolu = 0;
  
  temelFields.forEach(field => {
    if (student[field.key as keyof Student]) {
      temelDolu++;
    } else {
      temelEksik.push(field.label);
    }
  });
  
  scores.temelBilgiler = Math.round((temelDolu / temelFields.length) * 100);
  if (temelEksik.length > 0) {
    eksikAlanlar.push({ kategori: 'Temel Bilgiler', alanlar: temelEksik });
  }
  
  // İletişim Bilgileri (5 alan)
  const iletisimFields = [
    { key: 'phone', label: 'Telefon' },
    { key: 'email', label: 'E-posta' },
    { key: 'address', label: 'Adres' },
    { key: 'province', label: 'İl' },
    { key: 'district', label: 'İlçe' }
  ];
  
  const iletisimEksik: string[] = [];
  let iletisimDolu = 0;
  
  iletisimFields.forEach(field => {
    if (student[field.key as keyof Student]) {
      iletisimDolu++;
    } else {
      iletisimEksik.push(field.label);
    }
  });
  
  scores.iletisimBilgileri = Math.round((iletisimDolu / iletisimFields.length) * 100);
  if (iletisimEksik.length > 0) {
    eksikAlanlar.push({ kategori: 'İletişim Bilgileri', alanlar: iletisimEksik });
  }
  
  // Veli Bilgileri (4 alan)
  const veliFields = [
    { key: 'parentName', label: 'Veli Adı' },
    { key: 'parentContact', label: 'Veli Telefon' },
    { key: 'emergencyContact', label: 'Acil Durum Kişisi' },
    { key: 'emergencyPhone', label: 'Acil Durum Telefon' }
  ];
  
  const veliEksik: string[] = [];
  let veliDolu = 0;
  
  veliFields.forEach(field => {
    if (student[field.key as keyof Student]) {
      veliDolu++;
    } else {
      veliEksik.push(field.label);
    }
  });
  
  scores.veliBilgileri = Math.round((veliDolu / veliFields.length) * 100);
  if (veliEksik.length > 0) {
    eksikAlanlar.push({ kategori: 'Veli Bilgileri', alanlar: veliEksik });
  }
  
  // Genel doluluk oranı
  const overall = Math.round(
    (scores.temelBilgiler + scores.iletisimBilgileri + scores.veliBilgileri) / 3
  );
  
  return {
    overall,
    temelBilgiler: scores.temelBilgiler,
    iletisimBilgileri: scores.iletisimBilgileri,
    veliBilgileri: scores.veliBilgileri,
    akademikProfil: 0, // Will be calculated from academic_profiles table
    sosyalDuygusalProfil: 0, // Will be calculated from social_emotional_profiles table
    yetenekIlgiProfil: 0, // Will be calculated from talents_interests_profiles table
    saglikProfil: 0, // Will be calculated from standardized_health_profiles table
    davranisalProfil: 0, // Will be calculated from behavior_incidents table
    eksikAlanlar
  };
}

/**
 * Sanitize student data for safe storage
 * Öğrenci verisini güvenli saklama için temizle
 */
export function sanitizeStudentData(student: any): any {
  const sanitized = { ...student };
  
  // XSS koruması - HTML etiketlerini temizle
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };
  
  // String alanları temizle
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]);
    }
  });
  
  return sanitized;
}

/**
 * Compare two student objects for changes
 * İki öğrenci nesnesini karşılaştır
 */
export function detectStudentChanges(
  original: Student,
  updated: Student
): { changed: boolean; changes: string[] } {
  const changes: string[] = [];
  
  // ✅ FIXED: Only check fields that exist in Student type
  const fieldsToCheck: (keyof Student)[] = [
    'name', 'surname', 'class', 'gender', 'phone', 'email',
    'address', 'risk'
  ];
  
  fieldsToCheck.forEach(field => {
    if (original[field] !== updated[field]) {
      changes.push(field as string);
    }
  });
  
  return {
    changed: changes.length > 0,
    changes
  };
}

export default {
  normalizeStudentData,
  validateStudentData,
  calculateProfileCompleteness,
  sanitizeStudentData,
  detectStudentChanges
};
