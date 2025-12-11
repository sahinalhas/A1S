import type { Student } from '@/lib/storage';
import type { SortColumn, SortDirection } from '@/components/features/students/EnhancedStudentTable';

export function parseImportedRows(rows: unknown[][]): Student[] {
  const students: Student[] = [];

  const headerRow = rows[0] || [];
  const normalize = (str: unknown): string => {
    if (typeof str !== 'string') return '';
    return str.trim().toLowerCase();
  };

  const iId = headerRow.findIndex(h => ['no', 'numara', 'öğrenci no', 'id'].includes(normalize(h)));
  const iName = headerRow.findIndex(h => ['ad', 'isim', 'name', 'adi'].includes(normalize(h)));
  const iSurname = headerRow.findIndex(h => ['soyad', 'soyadı', 'surname'].includes(normalize(h)));
  const iClass = headerRow.findIndex(h => ['sınıf', 'sinif', 'class'].includes(normalize(h)));
  const iGrade = headerRow.findIndex(h => ['sınıf no', 'grade', 'düzey'].includes(normalize(h)));
  const iSection = headerRow.findIndex(h => ['şube', 'sube', 'section'].includes(normalize(h)));
  const iGender = headerRow.findIndex(h => ['cinsiyet', 'gender'].includes(normalize(h)));

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;

    const id = iId >= 0 ? String(r[iId] || '').trim() : '';
    if (!id || !/^\d+$/.test(id)) continue;

    const name = iName >= 0 ? String(r[iName] || '').trim() : '';
    const surname = iSurname >= 0 ? String(r[iSurname] || '').trim() : '';
    if (!name || !surname) continue;

    // Handle grade/section - either from separate columns or parse from combined class
    let grade = '';
    let section = '';

    if (iGrade >= 0 && iSection >= 0) {
      // Separate columns exist
      grade = String(r[iGrade] || '').trim();
      section = String(r[iSection] || '').trim().toUpperCase();
    } else if (iClass >= 0) {
      // Parse from combined class column (e.g., "7A", "9/B", "10-C")
      const classVal = String(r[iClass] || '').trim();
      const parsed = parseClassToGradeSection(classVal);
      grade = parsed.grade;
      section = parsed.section;
    }

    // Default values if not found
    if (!grade) grade = '9';
    if (!section) section = 'A';

    const genderVal = iGender >= 0 ? normalize(r[iGender]) : 'k';
    const gender: 'K' | 'E' = genderVal.startsWith('e') || genderVal === 'erkek' ? 'E' : 'K';

    students.push({
      id,
      name,
      surname,
      grade,
      section,
      class: `${grade}${section}`, // Computed for backward compatibility
      gender,
      enrollmentDate: new Date().toISOString(),
    });
  }

  return students;
}

/**
 * Parse combined class string to separate grade and section
 * Handles formats: "7A", "7-A", "7/A", "7. Sınıf A", "10B", etc.
 */
function parseClassToGradeSection(classStr: string): { grade: string; section: string } {
  if (!classStr) return { grade: '', section: '' };

  const trimmed = classStr.trim();

  // Handle special cases like "Hazırlık"
  if (trimmed.toLowerCase().includes('hazırlık')) {
    return { grade: 'Hazırlık', section: '' };
  }

  // Try to match patterns like "7A", "7-A", "7/A", "7 A", "10B"
  const match = trimmed.match(/^(\d{1,2})[\s\-\/\.]?\s*(?:sınıf)?\s*[\s\-\/\.]?\s*([A-Za-zÇŞĞÜÖİçşğüöı])?$/i);

  if (match) {
    return {
      grade: match[1],
      section: match[2]?.toUpperCase() || ''
    };
  }

  // Try pattern "X. Sınıf Y Şubesi" or "X. Sınıf / Y Şubesi"
  const longMatch = trimmed.match(/(\d{1,2})\.\s*sınıf\s*[\/\-]?\s*([A-Za-zÇŞĞÜÖİçşğüöı])\s*(?:şube)?/i);
  if (longMatch) {
    return {
      grade: longMatch[1],
      section: longMatch[2].toUpperCase()
    };
  }

  // Fallback: try to extract any number as grade
  const numMatch = trimmed.match(/(\d{1,2})/);
  const letterMatch = trimmed.match(/([A-Za-zÇŞĞÜÖİçşğüöı])$/);

  return {
    grade: numMatch ? numMatch[1] : '',
    section: letterMatch ? letterMatch[1].toUpperCase() : ''
  };
}

export function mergeStudents(existing: Student[], imported: Student[]): Student[] {
  const existingMap = new Map(existing.map(s => [s.id, s]));

  imported.forEach(student => {
    existingMap.set(student.id, student);
  });

  return Array.from(existingMap.values());
}

export function sortStudents(
  students: Student[],
  sortColumn: SortColumn | null,
  sortDirection: SortDirection
): Student[] {
  if (!sortColumn || !sortDirection) return students;

  return [...students].sort((a, b) => {
    let aVal: string | number = '';
    let bVal: string | number = '';

    switch (sortColumn) {
      case 'id':
        aVal = parseInt(a.id || '0', 10);
        bVal = parseInt(b.id || '0', 10);
        break;
      case 'fullName':
        aVal = `${a.name} ${a.surname}`.toLowerCase();
        bVal = `${b.name} ${b.surname}`.toLowerCase();
        break;
      case 'class':
        aVal = a.class || '';
        bVal = b.class || '';
        break;
      case 'gender':
        aVal = a.gender || '';
        bVal = b.gender || '';
        break;
      default:
        return 0;
    }

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal, 'tr')
        : bVal.localeCompare(aVal, 'tr');
    }

    return 0;
  });
}
