import { RequestHandler, Request } from 'express';
import * as attendanceService from '../services/attendance.service.js';
import { randomUUID } from 'crypto';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';
import { 
  createSuccessResponse, 
  createErrorResponse,
  ApiErrorCode 
} from '../../../../shared/types/api-contracts.js';

function getSchoolId(req: Request): string | null {
  return (req as SchoolScopedRequest).schoolId || null;
}

export const getAttendanceByStudent: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json(
        createErrorResponse("School ID required", ApiErrorCode.VALIDATION_ERROR)
      );
    }
    
    const { studentId } = req.params;
    
    if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
      return res.status(400).json(
        createErrorResponse("Geçersiz öğrenci ID", ApiErrorCode.VALIDATION_ERROR)
      );
    }
    
    if (!attendanceService.studentBelongsToSchool(studentId, schoolId)) {
      return res.status(403).json(
        createErrorResponse("Bu öğrenci seçili okula ait değil", ApiErrorCode.AUTHORIZATION_ERROR)
      );
    }
    
    const attendance = attendanceService.getStudentAttendanceBySchool(studentId, schoolId);
    res.json(createSuccessResponse(attendance));
  } catch (error) {
    console.error('Error fetching attendance:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz")) {
      return res.status(400).json(
        createErrorResponse(errorMessage, ApiErrorCode.VALIDATION_ERROR)
      );
    }
    
    res.status(500).json(createErrorResponse('Devam kayıtları getirilirken hata oluştu', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const getAllAttendance: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json(
        createErrorResponse("School ID required", ApiErrorCode.VALIDATION_ERROR)
      );
    }
    
    res.json(createSuccessResponse([]));
  } catch (error) {
    console.error('Error fetching all attendance:', error);
    res.status(500).json(createErrorResponse('Devam kayıtları getirilirken hata oluştu', ApiErrorCode.INTERNAL_ERROR));
  }
};

export const saveAttendance: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json(
        createErrorResponse("School ID required", ApiErrorCode.VALIDATION_ERROR)
      );
    }
    
    const attendance = req.body;
    
    if (!attendance.id) {
      attendance.id = randomUUID();
    }
    
    if (!attendanceService.studentBelongsToSchool(attendance.studentId, schoolId)) {
      return res.status(403).json(
        createErrorResponse("Bu öğrenci seçili okula ait değil", ApiErrorCode.AUTHORIZATION_ERROR)
      );
    }
    
    const result = attendanceService.createAttendanceWithSchoolCheck(attendance, attendance.id, schoolId);
    
    if (!result.success) {
      return res.status(403).json(
        createErrorResponse(result.error || 'Devam kaydı eklenemedi', ApiErrorCode.AUTHORIZATION_ERROR)
      );
    }
    
    res.json(createSuccessResponse({ id: attendance.id }, 'Devam kaydı başarıyla eklendi'));
  } catch (error) {
    console.error('Error saving attendance:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz") || errorMessage.includes("gereklidir")) {
      return res.status(400).json(
        createErrorResponse(errorMessage, ApiErrorCode.VALIDATION_ERROR)
      );
    }
    
    res.status(500).json(
      createErrorResponse(`Devam kaydı eklenemedi: ${errorMessage}`, ApiErrorCode.INTERNAL_ERROR)
    );
  }
};
