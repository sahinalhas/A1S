import { RequestHandler } from 'express';
import * as meetingNotesService from '../services/meeting-notes.service.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';
import * as studentsRepository from '../../students/repository/students.repository.js';

export const getMeetingNotes: RequestHandler = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { studentId } = req.params;
    
    if (!studentId || typeof studentId !== 'string' || studentId.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: "Geçersiz öğrenci ID" 
      });
    }
    
    if (schoolId) {
      const student = studentsRepository.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        return res.status(403).json({
          success: false,
          error: 'Bu öğrenciye erişim izniniz yok veya öğrenci bulunamadı'
        });
      }
    }
    
    const notes = meetingNotesService.getStudentMeetingNotes(studentId);
    res.json(notes);
  } catch (error) {
    console.error('Error fetching meeting notes:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ success: false, error: 'Görüşme notları getirilirken hata oluştu' });
  }
};

export const saveMeetingNoteHandler: RequestHandler = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const note = req.body;
    
    if (schoolId && note.studentId) {
      const student = studentsRepository.getStudentByIdAndSchool(note.studentId, schoolId);
      if (!student) {
        return res.status(403).json({
          success: false,
          error: 'Bu öğrenciye erişim izniniz yok veya öğrenci bulunamadı'
        });
      }
    }
    
    meetingNotesService.createMeetingNote(note);
    
    res.json({ success: true, message: 'Görüşme notu kaydedildi' });
  } catch (error) {
    console.error('Error saving meeting note:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz") || errorMessage.includes("Zorunlu") || errorMessage.includes("eksik")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: `Görüşme notu kaydedilemedi: ${errorMessage}` 
    });
  }
};

export const updateMeetingNoteHandler: RequestHandler = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { id } = req.params;
    const note = req.body;
    
    if (!id || typeof id !== 'string' || id.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: "Geçersiz not ID" 
      });
    }
    
    if (schoolId) {
      const existingNote = meetingNotesService.getMeetingNoteById(id);
      if (!existingNote) {
        return res.status(404).json({
          success: false,
          error: 'Görüşme notu bulunamadı'
        });
      }
      if (existingNote.studentId) {
        const student = studentsRepository.getStudentByIdAndSchool(existingNote.studentId, schoolId);
        if (!student) {
          return res.status(403).json({
            success: false,
            error: 'Bu öğrenciye ait notu güncelleme izniniz yok'
          });
        }
      }
    }
    
    meetingNotesService.modifyMeetingNote(id, note);
    
    res.json({ success: true, message: 'Görüşme notu güncellendi' });
  } catch (error) {
    console.error('Error updating meeting note:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz") || errorMessage.includes("zorunludur")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: `Görüşme notu güncellenemedi: ${errorMessage}` 
    });
  }
};

export const deleteMeetingNoteHandler: RequestHandler = (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { id } = req.params;
    
    if (!id || typeof id !== 'string' || id.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: "Geçersiz not ID" 
      });
    }
    
    if (schoolId) {
      const existingNote = meetingNotesService.getMeetingNoteById(id);
      if (existingNote && existingNote.studentId) {
        const student = studentsRepository.getStudentByIdAndSchool(existingNote.studentId, schoolId);
        if (!student) {
          return res.status(403).json({
            success: false,
            error: 'Bu öğrenciye ait notu silme izniniz yok'
          });
        }
      }
    }
    
    meetingNotesService.removeMeetingNote(id);
    
    res.json({ success: true, message: 'Görüşme notu silindi' });
  } catch (error) {
    console.error('Error deleting meeting note:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("Geçersiz")) {
      return res.status(400).json({ 
        success: false, 
        error: errorMessage 
      });
    }
    
    res.status(500).json({ success: false, error: 'Görüşme notu silinemedi' });
  }
};
