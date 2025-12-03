import { Request, Response } from 'express';
import * as service from '../services/follow-ups.service.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';

export function getAllFollowUps(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const followUps = service.getAllFollowUpsBySchool(schoolId);
    res.json(followUps);
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    res.status(500).json({ error: 'Takipler yüklenemedi' });
  }
}

export function getFollowUpById(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    const followUp = service.getFollowUpByIdAndSchool(id, schoolId);
    
    if (!followUp) {
      return res.status(404).json({ error: 'Takip bulunamadı veya bu okula ait değil' });
    }
    
    res.json(followUp);
  } catch (error) {
    console.error('Error fetching follow-up:', error);
    res.status(500).json({ error: 'Takip yüklenemedi' });
  }
}

export function getFollowUpsBySessionId(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { sessionId } = req.query;
    
    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID gereklidir' });
    }
    
    const followUps = service.getFollowUpsBySessionIdAndSchool(sessionId, schoolId);
    res.json(followUps);
  } catch (error) {
    console.error('Error fetching follow-ups by session:', error);
    res.status(500).json({ error: 'Takipler yüklenemedi' });
  }
}

export function getFollowUpsByStatus(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { status } = req.query;
    
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'Status gereklidir' });
    }
    
    const followUps = service.getFollowUpsByStatusAndSchool(status, schoolId);
    res.json(followUps);
  } catch (error) {
    console.error('Error fetching follow-ups by status:', error);
    res.status(500).json({ error: 'Takipler yüklenemedi' });
  }
}

export function getFollowUpsByAssignee(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { assignedTo } = req.query;
    
    if (!assignedTo || typeof assignedTo !== 'string') {
      return res.status(400).json({ error: 'Atanan kişi gereklidir' });
    }
    
    const followUps = service.getFollowUpsByAssigneeAndSchool(assignedTo, schoolId);
    res.json(followUps);
  } catch (error) {
    console.error('Error fetching follow-ups by assignee:', error);
    res.status(500).json({ error: 'Takipler yüklenemedi' });
  }
}

export function getOverdueFollowUps(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const followUps = service.getOverdueFollowUpsBySchool(schoolId);
    res.json(followUps);
  } catch (error) {
    console.error('Error fetching overdue follow-ups:', error);
    res.status(500).json({ error: 'Gecikmiş takipler yüklenemedi' });
  }
}

export function getFollowUpsByPriority(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { priority } = req.query;
    
    if (!priority || typeof priority !== 'string') {
      return res.status(400).json({ error: 'Öncelik gereklidir' });
    }
    
    const followUps = service.getFollowUpsByPriorityAndSchool(priority, schoolId);
    res.json(followUps);
  } catch (error) {
    console.error('Error fetching follow-ups by priority:', error);
    res.status(500).json({ error: 'Takipler yüklenemedi' });
  }
}

export function createFollowUp(req: Request, res: Response) {
  try {
    const { id, followUpDate, assignedTo, actionItems } = req.body;
    
    if (!id || !followUpDate || !assignedTo || !actionItems) {
      return res.status(400).json({ error: 'Zorunlu alanlar eksik' });
    }
    
    const result = service.createFollowUp(req.body);
    res.json(result);
  } catch (error) {
    console.error('Error creating follow-up:', error);
    res.status(500).json({ error: 'Takip oluşturulamadı' });
  }
}

export function updateFollowUp(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    
    const existing = service.getFollowUpByIdAndSchool(id, schoolId);
    if (!existing) {
      return res.status(404).json({ error: 'Takip bulunamadı veya bu okula ait değil' });
    }
    
    const result = service.updateFollowUp(id, req.body);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Takip bulunamadı' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating follow-up:', error);
    res.status(500).json({ error: 'Takip güncellenemedi' });
  }
}

export function updateFollowUpStatus(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    const { status, completedDate } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status gereklidir' });
    }
    
    const existing = service.getFollowUpByIdAndSchool(id, schoolId);
    if (!existing) {
      return res.status(404).json({ error: 'Takip bulunamadı veya bu okula ait değil' });
    }
    
    const result = service.updateFollowUpStatusBySchool(id, status, schoolId, completedDate);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Takip bulunamadı' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating follow-up status:', error);
    res.status(500).json({ error: 'Takip durumu güncellenemedi' });
  }
}

export function deleteFollowUp(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    
    const result = service.deleteFollowUpBySchool(id, schoolId);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Takip bulunamadı veya bu okula ait değil' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting follow-up:', error);
    res.status(500).json({ error: 'Takip silinemedi' });
  }
}
