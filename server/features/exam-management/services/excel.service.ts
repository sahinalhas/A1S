import * as XLSX from 'xlsx';
import * as examTypesRepo from '../repository/exam-types.repository.js';
import * as examResultsRepo from '../repository/exam-results.repository.js';
import * as examSessionsRepo from '../repository/exam-sessions.repository.js';
import { loadStudentsBySchool } from '../../students/repository/students.repository.js';
import type {
  ExcelImportResult,
  ExcelImportError,
  CreateExamResultInput,
  ExcelTemplateConfig
} from '../../../../shared/types/exam-management.types.js';

interface ExcelRow {
  [key: string]: any;
}

export function generateExcelTemplate(config: ExcelTemplateConfig): Buffer {
  try {
    const subjects = examTypesRepo.getSubjectsByExamType(config.exam_type_id);
    
    let students: { id: string; name: string; surname?: string }[] = [];
    if (config.include_student_info && config.schoolId) {
      students = loadStudentsBySchool(config.schoolId);
    }

    const headers: string[] = ['Öğrenci No', 'Öğrenci Adı'];
    
    subjects.forEach(subject => {
      headers.push(`${subject.subject_name} - Doğru`);
      headers.push(`${subject.subject_name} - Yanlış`);
      headers.push(`${subject.subject_name} - Boş`);
    });

    const rows: unknown[][] = [headers];

    if (config.include_student_info && students.length > 0) {
      students.forEach(student => {
        const studentName = student.surname ? `${student.name} ${student.surname}` : student.name;
        const row: unknown[] = [student.id, studentName];
        subjects.forEach(() => {
          row.push('', '', '');
        });
        rows.push(row);
      });
    } else {
      const exampleRow: unknown[] = ['12345', 'Örnek Öğrenci'];
      subjects.forEach(() => {
        exampleRow.push('', '', '');
      });
      rows.push(exampleRow);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    
    const colWidths = headers.map((header) => ({ wch: Math.max(header.length + 2, 15) }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sınav Sonuçları');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  } catch (error) {
    console.error('Error in generateExcelTemplate:', error);
    throw new Error('Excel şablonu oluşturulamadı');
  }
}

export async function importExcelResults(
  sessionId: string,
  fileBuffer: Buffer,
  schoolId: string
): Promise<ExcelImportResult> {
  if (!schoolId) {
    throw new Error('schoolId is required for importExcelResults');
  }
  
  const errors: ExcelImportError[] = [];
  const importedResults: CreateExamResultInput[] = [];
  let data: ExcelRow[] = [];

  try {
    const session = examSessionsRepo.getExamSessionById(sessionId);
    if (!session) {
      throw new Error('Deneme sınavı bulunamadı');
    }

    const subjects = examTypesRepo.getSubjectsByExamType(session.exam_type_id);
    const subjectMap = new Map(subjects.map(s => [s.subject_name, s]));

    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    data = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

    const students = loadStudentsBySchool(schoolId);
    const studentMap = new Map(students.map(s => [s.id, s]));
    const studentNameMap = new Map(students.map(s => {
      const fullName = s.surname ? `${s.name} ${s.surname}`.toLowerCase() : s.name.toLowerCase();
      return [fullName, s];
    }));

    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      const excelRow = rowIndex + 2;

      let studentId = row['Öğrenci No'] || row['Ogrenci No'] || row['Student ID'] || '';
      const studentName = row['Öğrenci Adı'] || row['Ogrenci Adi'] || row['Student Name'] || '';

      if (!studentId && !studentName) {
        errors.push({
          row: excelRow,
          error: 'Öğrenci no veya adı bulunamadı'
        });
        continue;
      }

      if (!studentId && studentName) {
        const foundStudent = studentNameMap.get(studentName.toString().toLowerCase());
        if (foundStudent) {
          studentId = foundStudent.id;
        }
      }

      const student = studentMap.get(studentId?.toString());
      if (!student) {
        errors.push({
          row: excelRow,
          student_id: studentId?.toString(),
          student_name: studentName?.toString(),
          error: 'Öğrenci sistemde bulunamadı (bu okula ait olmayabilir)'
        });
        continue;
      }

      for (const [subjectName, subject] of subjectMap) {
        const correctKey = `${subjectName} - Doğru`;
        const wrongKey = `${subjectName} - Yanlış`;
        const emptyKey = `${subjectName} - Boş`;

        const correctValue = row[correctKey];
        const wrongValue = row[wrongKey];
        const emptyValue = row[emptyKey];

        if (correctValue === '' && wrongValue === '' && emptyValue === '') {
          continue;
        }

        const correct = parseInt(correctValue) || 0;
        const wrong = parseInt(wrongValue) || 0;
        const empty = parseInt(emptyValue) || 0;

        const total = correct + wrong + empty;
        if (total > subject.question_count) {
          errors.push({
            row: excelRow,
            student_id: student.id,
            student_name: student.name,
            error: `${subjectName}: Toplam soru sayısı (${total}) ders soru sayısını (${subject.question_count}) aşıyor`
          });
          continue;
        }

        importedResults.push({
          session_id: sessionId,
          student_id: student.id,
          subject_id: subject.id,
          correct_count: correct,
          wrong_count: wrong,
          empty_count: empty
        });
      }
    }

    const savedResults = examResultsRepo.batchUpsertExamResults(importedResults);

    return {
      success: true,
      imported_count: savedResults.length,
      failed_count: errors.length,
      errors,
      results: savedResults
    };
  } catch (error: unknown) {
    console.error('Error in importExcelResults:', error);
    return {
      success: false,
      imported_count: 0,
      failed_count: data?.length || 0,
      errors: [{
        row: 0,
        error: error instanceof Error ? error.message : String(error) || 'Excel dosyası işlenirken hata oluştu'
      }],
      results: []
    };
  }
}

export function exportExamResultsToExcel(sessionId: string): Buffer {
  try {
    const session = examSessionsRepo.getExamSessionById(sessionId);
    if (!session) {
      throw new Error('Deneme sınavı bulunamadı');
    }

    const results = examResultsRepo.getExamResultsBySession(sessionId);
    const subjects = examTypesRepo.getSubjectsByExamType(session.exam_type_id);

    const headers: string[] = ['Öğrenci No', 'Öğrenci Adı'];
    subjects.forEach(subject => {
      headers.push(`${subject.subject_name} - D`);
      headers.push(`${subject.subject_name} - Y`);
      headers.push(`${subject.subject_name} - B`);
      headers.push(`${subject.subject_name} - Net`);
    });
    headers.push('Toplam Net');

    const studentResultsMap = new Map<string, Map<string, any>>();
    
    results.forEach(result => {
      if (!studentResultsMap.has(result.student_id)) {
        studentResultsMap.set(result.student_id, new Map());
      }
      studentResultsMap.get(result.student_id)!.set(result.subject_id, result);
    });

    const rows: unknown[][] = [headers];

    studentResultsMap.forEach((subjectResults, studentId) => {
      const firstResult = Array.from(subjectResults.values())[0];
      const row: unknown[] = [studentId, firstResult.student_name || studentId];
      
      let totalNet = 0;
      subjects.forEach(subject => {
        const result = subjectResults.get(subject.id);
        if (result) {
          row.push(result.correct_count, result.wrong_count, result.empty_count, result.net_score);
          totalNet += result.net_score;
        } else {
          row.push(0, 0, 0, 0);
        }
      });
      
      row.push(Math.round(totalNet * 100) / 100);
      rows.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const colWidths = headers.map(() => ({ wch: 15 }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, session.name);

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return buffer;
  } catch (error) {
    console.error('Error in exportExamResultsToExcel:', error);
    throw new Error('Excel raporu oluşturulamadı');
  }
}
