import { RequestHandler } from "express";
import * as studentsService from '../services/students.service.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../../constants/errors.js";
import { logger } from '../../../utils/logger.js';
import { 
  createSuccessResponse, 
  createErrorResponse,
  ApiErrorCode,
  type ApiSuccessResponse,
  type ApiErrorResponse,
} from "../../../../shared/types/api-contracts.js";
import type { 
  StudentResponse,
  GetStudentsResponse,
} from "../../../../shared/types/student-api-contracts.js";
import type { 
  StudentInput,
  BulkStudentSaveInput,
  AcademicRecordInput,
  StudentIdParam,
  StudentDeletionBody
} from "../../../../shared/validation/students.validation.js";
import type { SchoolScopedRequest } from "../../../middleware/school-access.middleware.js";

export const getStudents: RequestHandler<
  Record<string, never>,
  GetStudentsResponse
> = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const students = studentsService.getStudentsBySchool(schoolId);
    res.json(createSuccessResponse(students));
  } catch (error) {
    logger.error('Error fetching students', 'StudentsRoutes', error);
    res.status(500).json(
      createErrorResponse(
        ERROR_MESSAGES.FAILED_TO_FETCH_STUDENTS,
        ApiErrorCode.INTERNAL_ERROR
      )
    );
  }
};

export const saveStudentHandler: RequestHandler<
  Record<string, never>,
  ApiSuccessResponse<StudentResponse> | ApiErrorResponse
> = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const student = req.body as StudentInput;
    const studentWithSchool = { ...student, schoolId };
    
    studentsService.createOrUpdateStudent(studentWithSchool);
    res.json(
      createSuccessResponse(
        student as unknown as StudentResponse,
        SUCCESS_MESSAGES.STUDENT_SAVED
      )
    );
  } catch (error) {
    logger.error('Error saving student', 'StudentsRoutes', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    res.status(500).json(
      createErrorResponse(
        `${ERROR_MESSAGES.FAILED_TO_SAVE_STUDENT}: ${errorMessage}`,
        ApiErrorCode.INTERNAL_ERROR
      )
    );
  }
};

export const saveStudentsHandler: RequestHandler = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const students = req.body as BulkStudentSaveInput;
    
    studentsService.bulkSaveStudentsForSchool(students, schoolId);
    res.json({ success: true, message: `${students.length} ${SUCCESS_MESSAGES.STUDENTS_SAVED}` });
  } catch (error) {
    logger.error('Error saving students', 'StudentsRoutes', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_SAVE_STUDENTS });
  }
};

export const getStudentAcademics: RequestHandler = (req, res) => {
  try {
    const { id } = req.params as StudentIdParam;
    
    const academics = studentsService.getStudentAcademics(id);
    // ✅ UYUMSUZLUK FIX: Transform response to match frontend expectations
    const transformedAcademics = academics.map(record => ({
      id: record.id?.toString() || `${record.studentId}_${record.year}_${record.semester}`,
      studentId: record.studentId,
      term: `${record.year}/${record.semester}`, // Frontend expects combined format
      gpa: record.gpa,
      notes: record.notes
      // Remove 'exams' field - frontend doesn't use it
    }));
    res.json(transformedAcademics);
  } catch (error) {
    logger.error('Error fetching student academics', 'StudentsRoutes', error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_FETCH_ACADEMICS });
  }
};

export const addStudentAcademic: RequestHandler = (req, res) => {
  try {
    const academic = req.body as AcademicRecordInput;
    
    studentsService.createAcademic(academic);
    // ✅ UYUMSUZLUK FIX: Standardize error response format
    res.status(201).json(
      createSuccessResponse(
        { success: true },
        "Akademik kayıt eklendi"
      )
    );
  } catch (error) {
    logger.error('Error adding academic record', 'StudentsRoutes', error);
    // ✅ UYUMSUZLUK FIX: Standardize error response format
    res.status(500).json(
      createErrorResponse(
        "Akademik kayıt eklenirken hata oluştu",
        ApiErrorCode.INTERNAL_ERROR
      )
    );
  }
};

export const getStudentProgress: RequestHandler = (req, res) => {
  try {
    const { id } = req.params as StudentIdParam;
    
    const progress = studentsService.getStudentProgress(id);
    res.json(progress);
  } catch (error) {
    logger.error('Error fetching student progress', 'StudentsRoutes', error);
    res.status(500).json({ success: false, error: ERROR_MESSAGES.FAILED_TO_FETCH_STUDENT_PROGRESS });
  }
};

export const deleteStudentHandler: RequestHandler = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params as StudentIdParam;
    const { confirmationName } = req.body as StudentDeletionBody;
    
    const result = studentsService.removeStudent(id, schoolId, confirmationName);
    
    res.json({ 
      success: true, 
      message: `${result.studentName} başarıyla silindi` 
    });
  } catch (error) {
    logger.error('Error deleting student', 'StudentsRoutes', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("bulunamadı") || errorMessage.includes("ait değil")) {
      return res.status(404).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    if (errorMessage.includes("onaylamak")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Öğrenci silinirken hata oluştu" 
    });
  }
};
