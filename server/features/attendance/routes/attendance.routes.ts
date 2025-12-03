import { RequestHandler, Request } from 'express';
import * as attendanceService from '../services/attendance.service.js';
import { randomUUID } from 'crypto';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';

function getSchoolId(req: Request): string | null {
  return (req as SchoolScopedRequest).schoolId || null;
}

export const getAttendanceByStudent: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        error: "School ID required" 
      });
    }
    
    const { studentId } = req.params;
    
    if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: "Geçersiz öğrenci ID" 
      });
    }
    
    if (!attendanceService.studentBelongsToSchool(studentId, schoolId)) {
      return res.status(403).json({ 
        success: false, 
        error: "Bu öğrenci seçili okula ait değil" 
      });
    }
    
    const attendance = attendanceService.getStudentAttendanceBySchool(studentId, schoolId);
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ success: false, error: 'Devam kayıtları getirilirken hata oluştu' });
  }
};

export const getAllAttendance: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        error: "School ID required" 
      });
    }
    
    res.json([]);
  } catch (error) {
    console.error('Error fetching all attendance:', error);
    res.status(500).json({ success: false, error: 'Devam kayıtları getirilirken hata oluştu' });
  }
};

export const saveAttendance: RequestHandler = (req, res) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ 
        success: false, 
        error: "School ID required" 
      });
    }
    
    const attendance = req.body;
    
    if (!attendance.id) {
      attendance.id = randomUUID();
    }
    
    if (!attendanceService.studentBelongsToSchool(attendance.studentId, schoolId)) {
      return res.status(403).json({ 
        success: false, 
        error: "Bu öğrenci seçili okula ait değil" 
      });
    }
    
    const result = attendanceService.createAttendanceWithSchoolCheck(attendance, attendance.id, schoolId);
    
    if (!result.success) {
      return res.status(403).json({ 
        success: false, 
        error: result.error || 'Devam kaydı eklenemedi' 
      });
    }
    
    res.json({ success: true, message: 'Devam kaydı başarıyla eklendi' });
  } catch (error) {
    console.error('Error saving attendance:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz") || errorMessage.includes("gereklidir")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: `Devam kaydı eklenemedi: ${errorMessage}` 
    });
  }
};
