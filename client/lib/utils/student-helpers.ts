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
  const iGender = headerRow.findIndex(h => ['cinsiyet', 'gender'].includes(normalize(h)));

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;

    const id = iId >= 0 ? String(r[iId] || '').trim() : '';
    if (!id || !/^\d+$/.test(id)) continue;

    const name = iName >= 0 ? String(r[iName] || '').trim() : '';
    const surname = iSurname >= 0 ? String(r[iSurname] || '').trim() : '';
    if (!name || !surname) continue;

    const classVal = iClass >= 0 ? String(r[iClass] || '').trim() : '9/A';
    const genderVal = iGender >= 0 ? normalize(r[iGender]) : 'k';
    const gender: 'K' | 'E' = genderVal.startsWith('e') || genderVal === 'erkek' ? 'E' : 'K';

    students.push({
      id,
      name,
      surname,
      class: classVal,
      gender,
      enrollmentDate: new Date().toISOString(),
    });
  }

  return students;
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
