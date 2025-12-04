import { Request, Response } from 'express';
import * as service from '../services/counseling-sessions.service.js';
import * as studentsService from '../../students/services/students.service.js';
import { autoSyncHooks } from '../../profile-sync/index.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

export function getAllCounselingSessions(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const filters = req.query;
    
    if (Object.keys(filters).length === 0) {
      const sessions = service.getSessionsBySchoolWithStudents(schoolId);
      return res.json(sessions);
    }
    
    const sessions = service.getFilteredSessionsBySchoolWithStudents(schoolId, filters);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching counseling sessions:', error);
    res.status(500).json({ success: false, error: 'Görüşmeler yüklenemedi' });
  }
}

export function getActiveCounselingSessions(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const sessions = service.getActiveSessionsBySchoolWithStudents(schoolId);
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching active counseling sessions:', error);
    res.status(500).json({ success: false, error: 'Aktif görüşmeler yüklenemedi' });
  }
}

export function getCounselingSessionById(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    const session = service.getSessionByIdAndSchoolWithStudents(id, schoolId);
    
    if (!session) {
      return res.status(404).json({ success: false, error: 'Görüşme bulunamadı' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Error fetching counseling session:', error);
    res.status(500).json({ success: false, error: 'Görüşme yüklenemedi' });
  }
}

export function createCounselingSession(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id, sessionType, counselorId, sessionDate, entryTime, studentIds } = req.body;
    
    if (!id || !sessionType || !counselorId || !sessionDate || !entryTime) {
      return res.status(400).json({ success: false, error: 'Zorunlu alanlar eksik' });
    }
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, error: 'En az bir öğrenci seçilmelidir' });
    }
    
    const invalidStudentIds: string[] = [];
    for (const studentId of studentIds) {
      const student = studentsService.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        invalidStudentIds.push(studentId);
      }
    }
    
    if (invalidStudentIds.length > 0) {
      return res.status(403).json({ 
        error: 'Seçilen bazı öğrenciler bu okula ait değil',
        invalidStudentIds 
      });
    }
    
    const result = service.createCounselingSession({ ...req.body, schoolId });
    res.json(result);
  } catch (error) {
    console.error('Error creating counseling session:', error);
    res.status(500).json({ success: false, error: 'Görüşme kaydedilemedi' });
  }
}

export function completeCounselingSession(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    const completionData = req.body;
    
    if (!completionData.exitTime) {
      return res.status(400).json({ success: false, error: 'Çıkış saati gereklidir' });
    }
    
    if (!completionData.topic) {
      return res.status(400).json({ success: false, error: 'Görüşme konusu seçilmelidir' });
    }
    
    const existingSession = service.getSessionByIdAndSchoolWithStudents(id, schoolId);
    if (!existingSession) {
      return res.status(404).json({ success: false, error: 'Görüşme bulunamadı veya bu okula ait değil' });
    }
    
    const result = service.completeCounselingSessionBySchool(id, schoolId, completionData);
    
    if (result.notFound) {
      return res.status(404).json({ success: false, error: 'Görüşme bulunamadı' });
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
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error completing counseling session:', error);
    res.status(500).json({ success: false, error: 'Görüşme tamamlanamadı' });
  }
}

export function extendCounselingSession(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    
    const existingSession = service.getSessionByIdAndSchoolWithStudents(id, schoolId);
    if (!existingSession) {
      return res.status(404).json({ success: false, error: 'Görüşme bulunamadı veya bu okula ait değil' });
    }
    
    const result = service.extendCounselingSessionBySchool(id, schoolId);
    
    if (result.notFound) {
      return res.status(404).json({ success: false, error: 'Görüşme bulunamadı' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error extending counseling session:', error);
    res.status(500).json({ success: false, error: 'Görüşme uzatılamadı' });
  }
}

export function autoCompleteCounselingSessions(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const result = service.autoCompleteSessionsBySchool(schoolId);
    res.json(result);
  } catch (error) {
    console.error('Error auto-completing counseling sessions:', error);
    res.status(500).json({ success: false, error: 'Otomatik tamamlama başarısız' });
  }
}

export function deleteCounselingSession(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    const result = service.deleteCounselingSessionBySchool(id, schoolId);
    
    if (result.notFound) {
      return res.status(404).json({ success: false, error: 'Görüşme bulunamadı veya bu okula ait değil' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting counseling session:', error);
    res.status(500).json({ success: false, error: 'Görüşme silinemedi' });
  }
}

export function getClassHours(req: Request, res: Response) {
  try {
    const classHours = service.getClassHours();
    res.json(classHours);
  } catch (error) {
    console.error('Error fetching class hours:', error);
    res.status(500).json({ success: false, error: 'Ders saatleri yüklenemedi' });
  }
}

export function getCounselingTopics(req: Request, res: Response) {
  try {
    const topics = service.getCounselingTopics();
    res.json(topics);
  } catch (error) {
    console.error('Error fetching counseling topics:', error);
    res.status(500).json({ success: false, error: 'Görüşme konuları yüklenemedi' });
  }
}
