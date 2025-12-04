import { Request, Response } from 'express';
import * as service from '../services/outcomes.service.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';

export function getAllOutcomes(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const outcomes = service.getAllOutcomesBySchool(schoolId);
    res.json(outcomes);
  } catch (error) {
    console.error('Error fetching outcomes:', error);
    res.status(500).json({ success: false, error: 'Sonuçlar yüklenemedi' });
  }
}

export function getOutcomesRequiringFollowUp(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const outcomes = service.getOutcomesRequiringFollowUpBySchool(schoolId);
    res.json(outcomes);
  } catch (error) {
    console.error('Error fetching outcomes requiring follow-up:', error);
    res.status(500).json({ success: false, error: 'Takip gerektiren sonuçlar yüklenemedi' });
  }
}

export function getOutcomeById(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    const outcome = service.getOutcomeByIdAndSchool(id, schoolId);
    
    if (!outcome) {
      return res.status(404).json({ success: false, error: 'Sonuç bulunamadı veya bu okula ait değil' });
    }
    
    res.json(outcome);
  } catch (error) {
    console.error('Error fetching outcome:', error);
    res.status(500).json({ success: false, error: 'Sonuç yüklenemedi' });
  }
}

export function getOutcomeBySessionId(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { sessionId } = req.params;
    const outcome = service.getOutcomeBySessionIdAndSchool(sessionId, schoolId);
    
    if (!outcome) {
      return res.status(404).json({ success: false, error: 'Bu görüşme için sonuç bulunamadı veya bu okula ait değil' });
    }
    
    res.json(outcome);
  } catch (error) {
    console.error('Error fetching outcome by session:', error);
    res.status(500).json({ success: false, error: 'Görüşme sonucu yüklenemedi' });
  }
}

export function createOutcome(req: Request, res: Response) {
  try {
    const { id, sessionId } = req.body;
    
    if (!id || !sessionId) {
      return res.status(400).json({ success: false, error: 'ID ve görüşme ID zorunludur' });
    }
    
    const result = service.createOutcome(req.body);
    res.json(result);
  } catch (error: unknown) {
    console.error('Error creating outcome:', error);
    if (error instanceof Error ? error.message : String(error)?.includes('Etkinlik puanı')) {
      return res.status(400).json({ success: false, error: error instanceof Error ? error.message : String(error) });
    }
    res.status(500).json({ success: false, error: 'Sonuç kaydedilemedi' });
  }
}

export function updateOutcome(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    
    const existing = service.getOutcomeByIdAndSchool(id, schoolId);
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Sonuç bulunamadı veya bu okula ait değil' });
    }
    
    const result = service.updateOutcome(id, req.body);
    
    if (result.notFound) {
      return res.status(404).json({ success: false, error: 'Sonuç bulunamadı' });
    }
    
    res.json({ success: true });
  } catch (error: unknown) {
    console.error('Error updating outcome:', error);
    if (error instanceof Error ? error.message : String(error)?.includes('Etkinlik puanı')) {
      return res.status(400).json({ success: false, error: error instanceof Error ? error.message : String(error) });
    }
    res.status(500).json({ success: false, error: 'Sonuç güncellenemedi' });
  }
}

export function deleteOutcome(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { id } = req.params;
    
    const result = service.deleteOutcomeBySchool(id, schoolId);
    
    if (result.notFound) {
      return res.status(404).json({ success: false, error: 'Sonuç bulunamadı veya bu okula ait değil' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting outcome:', error);
    res.status(500).json({ success: false, error: 'Sonuç silinemedi' });
  }
}
