import XLSX from 'xlsx';
import * as distributionsRepo from '../../repository/distributions.repository.js';
import * as questionsRepo from '../../repository/questions.repository.js';
import * as responsesRepo from '../../repository/responses.repository.js';
import { SurveyResponse, SurveyQuestion } from '../../types/surveys.types.js';
import { sanitizeExcelData } from '../../../../utils/validators/sanitization.js';

export interface ExcelImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ExcelImportError[];
  importedResponses: Partial<SurveyResponse>[];
}

export interface ExcelImportError {
  row: number;
  studentId?: string;
  studentName?: string;
  error: string;
}

export async function importSurveyResponsesFromExcel(
  distributionId: string,
  fileBuffer: Buffer
): Promise<ExcelImportResult> {
  const errors: ExcelImportError[] = [];
  const validResponses: Partial<SurveyResponse>[] = [];
  let data: unknown[] = [];

  try {
    // Validate distribution ID exists and is not empty
    const sanitizedDistributionId = (distributionId || '').trim();
    if (!sanitizedDistributionId) {
      throw new Error('Dağıtım ID gereklidir');
    }

    // Validate distribution exists - with logging for debugging
    let distribution = null;
    try {
      distribution = distributionsRepo.getSurveyDistribution(sanitizedDistributionId);
    } catch (dbError: any) {
      console.error(`Database error looking up distribution ${sanitizedDistributionId}:`, dbError);
      throw new Error(`Dağıtım sorgulanırken hata oluştu: ${dbError.message}`);
    }

    if (!distribution) {
      // Try to get all distributions to provide better debugging info
      const allDistributions = distributionsRepo.loadSurveyDistributions();
      console.error(`Distribution not found. ID: ${sanitizedDistributionId}. Available IDs:`, allDistributions.map(d => d.id));
      throw new Error(`Anket dağıtımı bulunamadı. İçe aktarılacak dağıtım tanımlı değil. (ID: ${sanitizedDistributionId})`);
    }

    // Get questions for this distribution
    let questions = null;
    try {
      questions = questionsRepo.getQuestionsByTemplate(distribution.templateId);
    } catch (qError: any) {
      console.error(`Error getting questions for template ${distribution.templateId}:`, qError);
      throw new Error(`Anket soruları yüklenirken hata oluştu: ${qError.message}`);
    }

    if (!questions || questions.length === 0) {
      throw new Error(`Anket şablonunda soru bulunamadı. Şablon ID: ${distribution.templateId}`);
    }

    // Validate Excel file buffer
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new Error('Excel dosyası boş veya geçersiz');
    }

    // Parse Excel file
    let workbook;
    try {
      workbook = XLSX.read(fileBuffer, { type: 'buffer', codepage: 65001 });
    } catch (parseError: any) {
      throw new Error(`Excel dosyası okunurken hata oluştu: ${parseError.message}`);
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Excel dosyasında veri sayfası bulunamadı');
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });

    // Validate we have data rows
    if (!rawData || rawData.length === 0) {
      throw new Error('Excel dosyası boş veya veri içermiyor');
    }

    // Find header row (skip instructions if present)
    let headerRowIndex = -1;
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i] as any[];
      if (row && row.length > 0) {
        // Check if this row contains the student info header
        const firstCell = String(row[0] || '').trim().toLowerCase();
        if (firstCell === 'öğrenci no' || firstCell.includes('öğrenci no') || 
            firstCell === 'student no' || firstCell.includes('student no')) {
          headerRowIndex = i;
          break;
        }
      }
    }

    if (headerRowIndex === -1) {
      // Provide helpful error message with what we found
      const firstCells = rawData.slice(0, 5).map((r: any) => String(r?.[0] || 'boş')).join(', ');
      throw new Error(`Excel dosyasında başlık satırı bulunamadı. "Öğrenci No" içeren bir satır olmalıdır. (Bulduğumuz ilk satırlar: ${firstCells})`);
    }

    if (headerRowIndex >= rawData.length - 1) {
      throw new Error('Excel dosyasında başlık satırından sonra veri satırı bulunamadı');
    }

    const headers = rawData[headerRowIndex] as string[];
    const dataRows = rawData.slice(headerRowIndex + 1);

    // Filter out completely empty rows before processing
    const nonEmptyRows = dataRows.filter((row: any) => {
      if (!row || row.length === 0) return false;
      // Check if any cell has data
      return row.some((cell: any) => cell !== null && cell !== undefined && String(cell).trim() !== '');
    });

    // Build question map from headers
    const questionMap = buildQuestionMap(headers, questions);

    // First pass: validate all rows and collect valid responses
    for (let rowIndex = 0; rowIndex < nonEmptyRows.length; rowIndex++) {
      const row = nonEmptyRows[rowIndex] as any[];
      // Calculate actual Excel row number (accounting for header and filtered rows)
      const actualRowIndexInDataRows = dataRows.indexOf(row);
      const excelRow = headerRowIndex + actualRowIndexInDataRows + 2;

      try {
        const responseData = parseResponseRow(row, headers, questionMap, questions);
        
        if (!responseData.studentInfo || !responseData.studentInfo.number) {
          errors.push({
            row: excelRow,
            error: 'Öğrenci numarası bulunamadı'
          });
          continue;
        }

        // Validate required questions
        const missingRequired = validateRequiredQuestions(responseData.responseData, questions);
        if (missingRequired.length > 0) {
          errors.push({
            row: excelRow,
            studentId: responseData.studentInfo.number,
            studentName: responseData.studentInfo.name,
            error: `Zorunlu sorular eksik: ${missingRequired.join(', ')}`
          });
          continue;
        }

        // Sanitize all data before saving
        const sanitizedStudentInfo = sanitizeExcelData(responseData.studentInfo);
        const sanitizedResponseData = sanitizeExcelData(responseData.responseData);

        // Prepare response for bulk save using sanitized distribution ID
        const response: Partial<SurveyResponse> = {
          id: `response_${sanitizedDistributionId}_${responseData.studentInfo.number}_${Date.now()}_${rowIndex}`,
          distributionId: sanitizedDistributionId,
          studentId: responseData.studentInfo.number,
          studentInfo: sanitizedStudentInfo as any,
          responseData: sanitizedResponseData as any,
          submittedAt: new Date().toISOString(),
          submissionType: 'EXCEL_IMPORT',
          isComplete: true,
        };

        validResponses.push(response);

      } catch (rowError: any) {
        errors.push({
          row: excelRow,
          error: rowError.message || 'Satır işlenirken hata oluştu'
        });
      }
    }

    // Second pass: save all valid responses in a single transaction
    if (validResponses.length > 0) {
      try {
        responsesRepo.bulkSaveSurveyResponses(validResponses);
        console.log(`Successfully imported ${validResponses.length} survey responses for distribution ${sanitizedDistributionId}`);
      } catch (saveError: any) {
        console.error(`Error saving responses for distribution ${sanitizedDistributionId}:`, saveError);
        throw new Error(`Yanıtlar kaydedilirken hata oluştu: ${saveError.message}`);
      }
    } else if (nonEmptyRows.length > 0) {
      // All rows had errors, provide summary
      console.warn(`Import completed with 0 successful responses from ${nonEmptyRows.length} data rows`);
    }

    return {
      success: errors.length === 0,
      totalRows: nonEmptyRows.length,
      successCount: validResponses.length,
      errorCount: errors.length,
      errors,
      importedResponses: validResponses
    };

  } catch (error: any) {
    console.error('Error importing survey responses from Excel:', error);
    throw error;
  }
}

function buildQuestionMap(headers: string[], questions: SurveyQuestion[]): Map<number, SurveyQuestion> {
  const questionMap = new Map<number, SurveyQuestion>();

  headers.forEach((header, colIndex) => {
    if (typeof header === 'string' && header.match(/^\d+\./)) {
      const questionMatch = header.match(/^(\d+)\./);
      if (questionMatch) {
        const questionNumber = parseInt(questionMatch[1]);
        const question = questions[questionNumber - 1];
        if (question) {
          questionMap.set(colIndex, question);
        }
      }
    }
  });

  return questionMap;
}

function parseResponseRow(
  row: unknown[],
  headers: string[],
  questionMap: Map<number, SurveyQuestion>,
  questions: SurveyQuestion[]
): { studentInfo: any; responseData: Record<string, any> } {
  const studentInfo: any = {};
  const responseData: Record<string, any> = {};

  headers.forEach((header, colIndex) => {
    const value = row[colIndex];
    if (!value && value !== 0) return;

    const headerStr = String(header);

    // Parse student info
    if (headerStr === 'Öğrenci No') {
      studentInfo.number = String(value).trim();
    } else if (headerStr === 'Ad') {
      studentInfo.firstName = String(value).trim();
    } else if (headerStr === 'Soyad') {
      studentInfo.lastName = String(value).trim();
    } else if (headerStr === 'Sınıf') {
      studentInfo.class = String(value).trim();
    } else if (headerStr === 'Cinsiyet') {
      studentInfo.gender = String(value).trim();
    }

    // Parse question responses
    const question = questionMap.get(colIndex);
    if (question) {
      responseData[question.id] = parseQuestionResponse(value, question);
    }
  });

  // Combine first and last name
  if (studentInfo.firstName && studentInfo.lastName) {
    studentInfo.name = `${studentInfo.firstName} ${studentInfo.lastName}`;
  } else if (studentInfo.firstName) {
    studentInfo.name = studentInfo.firstName;
  }

  return { studentInfo, responseData };
}

function parseQuestionResponse(value: any, question: SurveyQuestion): any {
  if (!value && value !== 0) return null;

  const strValue = String(value).trim();

  switch (question.questionType) {
    case 'MULTIPLE_CHOICE':
    case 'DROPDOWN':
      // Validate option exists
      if (question.options && !question.options.includes(strValue)) {
        throw new Error(`Geçersiz seçenek: "${strValue}" - İzin verilen: ${question.options.join(', ')}`);
      }
      return strValue;

    case 'YES_NO':
      const normalized = strValue.toLowerCase();
      if (normalized === 'evet' || normalized === 'yes' || normalized === 'e') {
        return 'evet';
      } else if (normalized === 'hayır' || normalized === 'hayir' || normalized === 'no' || normalized === 'h') {
        return 'hayir';
      }
      throw new Error(`Geçersiz evet/hayır cevabı: "${strValue}"`);

    case 'LIKERT':
      const likertValue = parseInt(strValue);
      if (isNaN(likertValue) || likertValue < 1 || likertValue > 5) {
        throw new Error(`Likert değeri 1-5 arasında olmalı: "${strValue}"`);
      }
      return `${likertValue} - ${getLikertLabel(likertValue)}`;

    case 'RATING':
      const ratingValue = parseInt(strValue);
      if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 10) {
        throw new Error(`Puanlama değeri 1-10 arasında olmalı: "${strValue}"`);
      }
      return String(ratingValue);

    case 'OPEN_ENDED':
    default:
      return strValue;
  }
}

function getLikertLabel(value: number): string {
  const labels: Record<number, string> = {
    1: 'Kesinlikle Katılmıyorum',
    2: 'Katılmıyorum',
    3: 'Kararsızım',
    4: 'Katılıyorum',
    5: 'Kesinlikle Katılıyorum'
  };
  return labels[value] || '';
}

function validateRequiredQuestions(
  responseData: Record<string, any>,
  questions: SurveyQuestion[]
): string[] {
  const missing: string[] = [];

  questions.forEach((question, index) => {
    if (question.required) {
      const answer = responseData[question.id];
      if (!answer && answer !== 0) {
        missing.push(`Soru ${index + 1}`);
      }
    }
  });

  return missing;
}
