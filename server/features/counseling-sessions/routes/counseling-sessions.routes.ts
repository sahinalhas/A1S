import { Request, Response } from 'express';
import * as service from '../services/counseling-sessions.service.js';
import * as studentsService from '../../students/services/students.service.js';
import { autoSyncHooks } from '../../profile-sync/index.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
import { 
  createSuccessResponse, 
  createErrorResponse,
  ApiErrorCode 
} from '../../../../shared/types/api-contracts.js';

export function getAllCounselingSessions(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const filters = req.query;
    
    if (Object.keys(filters).length === 0) {
      const sessions = service.getSessionsBySchoolWithStudents(schoolId);
      return res.json(createSuccessResponse(sessions));
    }
    
    const sessions = service.getFilteredSessionsBySchoolWithStudents(schoolId, filters);
    res.json(createSuccessResponse(sessions));
  } catch (error) {
    console.error('Error fetching counseling sessions:', error);
    res.status(500).json(createErrorResponse('Görüşmeler yüklenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
}

export function getActiveCounselingSessions(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const sessions = service.getActiveSessionsBySchoolWithStudents(schoolId);
    res.json(createSuccessResponse(sessions));
  } catch (error) {
    console.error('Error fetching active counseling sessions:', error);
    res.status(500).json(createErrorResponse('Aktif görüşmeler yüklenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
}

export function getCounselingSessionById(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    const session = service.getSessionByIdAndSchoolWithStudents(id, schoolId);
    
    if (!session) {
      return res.status(404).json(createErrorResponse('Görüşme bulunamadı', ApiErrorCode.NOT_FOUND));
    }
    
    res.json(createSuccessResponse(session));
  } catch (error) {
    console.error('Error fetching counseling session:', error);
    res.status(500).json(createErrorResponse('Görüşme yüklenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
}

export function createCounselingSession(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id, sessionType, counselorId, sessionDate, entryTime, studentIds } = req.body;
    
    if (!id || !sessionType || !counselorId || !sessionDate || !entryTime) {
      return res.status(400).json(createErrorResponse('Zorunlu alanlar eksik', ApiErrorCode.VALIDATION_ERROR));
    }
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json(createErrorResponse('En az bir öğrenci seçilmelidir', ApiErrorCode.VALIDATION_ERROR));
    }
    
    const invalidStudentIds: string[] = [];
    for (const studentId of studentIds) {
      const student = studentsService.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        invalidStudentIds.push(studentId);
      }
    }
    
    if (invalidStudentIds.length > 0) {
      return res.status(403).json(
        createErrorResponse('Seçilen bazı öğrenciler bu okula ait değil', ApiErrorCode.AUTHORIZATION_ERROR)
      );
    }
    
    const result = service.createCounselingSession({ ...req.body, schoolId });
    res.json(createSuccessResponse(result, 'Görüşme başarıyla oluşturuldu'));
  } catch (error) {
    console.error('Error creating counseling session:', error);
    res.status(500).json(createErrorResponse('Görüşme kaydedilemedi', ApiErrorCode.INTERNAL_ERROR));
  }
}

export function completeCounselingSession(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    const completionData = req.body;
    
    if (!completionData.exitTime) {
      return res.status(400).json(createErrorResponse('Çıkış saati gereklidir', ApiErrorCode.VALIDATION_ERROR));
    }
    
    if (!completionData.topic) {
      return res.status(400).json(createErrorResponse('Görüşme konusu seçilmelidir', ApiErrorCode.VALIDATION_ERROR));
    }
    
    const existingSession = service.getSessionByIdAndSchoolWithStudents(id, schoolId);
    if (!existingSession) {
      return res.status(404).json(createErrorResponse('Görüşme bulunamadı veya bu okula ait değil', ApiErrorCode.NOT_FOUND));
    }
    
    const result = service.completeCounselingSessionBySchool(id, schoolId, completionData);
    
    if (result.notFound) {
      return res.status(404).json(createErrorResponse('Görüşme bulunamadı', ApiErrorCode.NOT_FOUND));
    }
    
    const session = service.getSessionByIdAndSchoolWithStudents(id, schoolId);
    if (session) {
      autoSyncHooks.onCounselingSessionCompleted({
        id,
        ...completionData,
        studentId: session.sessionType === 'individual' ? (session as any).student?.id : undefined,
        studentIds: session.sessionType === 'group' ? (session as any).students?.map((s: any) => s.id) : undefined
      }).catch(error => {
        console.error('Profile sync failed after counseling session:', error);
      });
    }
    
    res.json(createSuccessResponse(null, 'Görüşme tamamlandı'));
  } catch (error) {
    console.error('Error completing counseling session:', error);
    res.status(500).json(createErrorResponse('Görüşme tamamlanamadı', ApiErrorCode.INTERNAL_ERROR));
  }
}

export function extendCounselingSession(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    
    const existingSession = service.getSessionByIdAndSchoolWithStudents(id, schoolId);
    if (!existingSession) {
      return res.status(404).json(createErrorResponse('Görüşme bulunamadı veya bu okula ait değil', ApiErrorCode.NOT_FOUND));
    }
    
    const result = service.extendCounselingSessionBySchool(id, schoolId);
    
    if (result.notFound) {
      return res.status(404).json(createErrorResponse('Görüşme bulunamadı', ApiErrorCode.NOT_FOUND));
    }
    
    res.json(createSuccessResponse(null, 'Görüşme süresi uzatıldı'));
  } catch (error) {
    console.error('Error extending counseling session:', error);
    res.status(500).json(createErrorResponse('Görüşme uzatılamadı', ApiErrorCode.INTERNAL_ERROR));
  }
}

export function autoCompleteCounselingSessions(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const result = service.autoCompleteSessionsBySchool(schoolId);
    res.json(createSuccessResponse(result));
  } catch (error) {
    console.error('Error auto-completing counseling sessions:', error);
    res.status(500).json(createErrorResponse('Otomatik tamamlama başarısız', ApiErrorCode.INTERNAL_ERROR));
  }
}

export function deleteCounselingSession(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    const result = service.deleteCounselingSessionBySchool(id, schoolId);
    
    if (result.notFound) {
      return res.status(404).json(createErrorResponse('Görüşme bulunamadı veya bu okula ait değil', ApiErrorCode.NOT_FOUND));
    }
    
    res.json(createSuccessResponse(null, 'Görüşme silindi'));
  } catch (error) {
    console.error('Error deleting counseling session:', error);
    res.status(500).json(createErrorResponse('Görüşme silinemedi', ApiErrorCode.INTERNAL_ERROR));
  }
}

export function getClassHours(req: Request, res: Response) {
  try {
    const classHours = service.getClassHours();
    res.json(createSuccessResponse(classHours));
  } catch (error) {
    console.error('Error fetching class hours:', error);
    res.status(500).json(createErrorResponse('Ders saatleri yüklenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
}

export function getCounselingTopics(req: Request, res: Response) {
  try {
    const topics = service.getCounselingTopics();
    res.json(createSuccessResponse(topics));
  } catch (error) {
    console.error('Error fetching counseling topics:', error);
    res.status(500).json(createErrorResponse('Görüşme konuları yüklenemedi', ApiErrorCode.INTERNAL_ERROR));
  }
}
