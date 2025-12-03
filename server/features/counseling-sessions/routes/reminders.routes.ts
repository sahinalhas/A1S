import { Request, Response } from 'express';
import * as service from '../services/reminders.service.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';

export function getAllReminders(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const reminders = service.getAllRemindersBySchool(schoolId);
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Hatırlatıcılar yüklenemedi' });
  }
}

export function getReminderById(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    const reminder = service.getReminderByIdAndSchool(id, schoolId);
    
    if (!reminder) {
      return res.status(404).json({ error: 'Hatırlatıcı bulunamadı veya bu okula ait değil' });
    }
    
    res.json(reminder);
  } catch (error) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({ error: 'Hatırlatıcı yüklenemedi' });
  }
}

export function getRemindersBySessionId(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { sessionId } = req.query;
    
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID gereklidir' });
    }
    
    const reminders = service.getRemindersBySessionIdAndSchool(sessionId, schoolId);
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders by session:', error);
    res.status(500).json({ error: 'Hatırlatıcılar yüklenemedi' });
  }
}

export function getRemindersByStatus(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { status } = req.query;
    
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Status gereklidir' });
    }
    
    const reminders = service.getRemindersByStatusAndSchool(status, schoolId);
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders by status:', error);
    res.status(500).json({ error: 'Hatırlatıcılar yüklenemedi' });
  }
}

export function getPendingReminders(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const reminders = service.getPendingRemindersBySchool(schoolId);
    res.json(reminders);
  } catch (error) {
    console.error('Error fetching pending reminders:', error);
    res.status(500).json({ error: 'Bekleyen hatırlatıcılar yüklenemedi' });
  }
}

export function createReminder(req: Request, res: Response) {
  try {
    const { id, reminderType, reminderDate, reminderTime, title } = req.body;
    
    if (!id || !reminderType || !reminderDate || !reminderTime || !title) {
      return res.status(400).json({ error: 'Zorunlu alanlar eksik' });
    }
    
    const result = service.createReminder(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Hatırlatıcı oluşturulamadı' });
  }
}

export function updateReminder(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    
    const existing = service.getReminderByIdAndSchool(id, schoolId);
    if (!existing) {
      return res.status(404).json({ error: 'Hatırlatıcı bulunamadı veya bu okula ait değil' });
    }
    
    const result = service.updateReminder(id, req.body);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Hatırlatıcı bulunamadı' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: 'Hatırlatıcı güncellenemedi' });
  }
}

export function updateReminderStatus(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status gereklidir' });
    }
    
    const existing = service.getReminderByIdAndSchool(id, schoolId);
    if (!existing) {
      return res.status(404).json({ error: 'Hatırlatıcı bulunamadı veya bu okula ait değil' });
    }
    
    const result = service.updateReminderStatusBySchool(id, status, schoolId);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Hatırlatıcı bulunamadı' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating reminder status:', error);
    res.status(500).json({ error: 'Hatırlatıcı durumu güncellenemedi' });
  }
}

export function deleteReminder(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    
    const result = service.deleteReminderBySchool(id, schoolId);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Hatırlatıcı bulunamadı veya bu okula ait değil' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Hatırlatıcı silinemedi' });
  }
}
