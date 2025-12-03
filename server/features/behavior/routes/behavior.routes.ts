import { Router, Request, Response } from 'express';
import * as service from '../services/behavior.service.js';
import { autoSyncHooks } from '../../profile-sync/services/auto-sync-hooks.service.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';

const router = Router();
router.use(validateSchoolAccess);

function getSchoolId(req: Request): string | null {
  return (req as SchoolScopedRequest).schoolId || null;
}

router.get('/:studentId', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ error: 'School ID required' });
    }
    
    const { studentId } = req.params;
    
    if (!service.studentBelongsToSchool(studentId, schoolId)) {
      return res.status(403).json({ 
        error: 'Bu öğrenci seçili okula ait değil' 
      });
    }
    
    const incidents = service.getBehaviorIncidentsByStudentAndSchool(studentId, schoolId);
    res.json(incidents);
  } catch (error) {
    console.error('Error fetching behavior incidents:', error);
    res.status(500).json({ error: 'Davranış kayıtları yüklenirken hata oluştu' });
  }
});

router.get('/:studentId/stats', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ error: 'School ID required' });
    }
    
    const { studentId } = req.params;
    
    if (!service.studentBelongsToSchool(studentId, schoolId)) {
      return res.status(403).json({ 
        error: 'Bu öğrenci seçili okula ait değil' 
      });
    }
    
    const stats = service.getBehaviorStatsByStudentAndSchool(studentId, schoolId);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching behavior stats:', error);
    res.status(500).json({ error: 'Davranış istatistikleri yüklenirken hata oluştu' });
  }
});

router.post('/', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ error: 'School ID required' });
    }
    
    const incident = req.body;
    
    if (!service.studentBelongsToSchool(incident.studentId, schoolId)) {
      return res.status(403).json({ 
        error: 'Bu öğrenci seçili okula ait değil' 
      });
    }
    
    const result = service.addBehaviorIncidentWithSchoolCheck(incident, schoolId);
    
    if (!result.success) {
      return res.status(403).json({ 
        error: 'Davranış kaydı eklenemedi - öğrenci bu okula ait değil' 
      });
    }
    
    if (incident.studentId && incident.id) {
      autoSyncHooks.onBehaviorIncidentRecorded({
        id: incident.id,
        studentId: incident.studentId,
        behaviorType: incident.behaviorType,
        description: incident.behaviorDescription || incident.description,
        severity: incident.severity,
        date: incident.date,
        ...incident
      }).catch(error => {
        console.error('Profile sync failed after behavior incident:', error);
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error adding behavior incident:', error);
    res.status(500).json({ error: 'Davranış kaydı eklenirken hata oluştu' });
  }
});

router.put('/:id', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ error: 'School ID required' });
    }
    
    const { id } = req.params;
    const updates = req.body;
    
    const result = service.updateBehaviorIncidentBySchool(id, updates, schoolId);
    
    if (!result.success) {
      return res.status(404).json({ 
        error: 'Davranış kaydı bulunamadı veya bu okula ait değil' 
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating behavior incident:', error);
    res.status(500).json({ error: 'Davranış kaydı güncellenirken hata oluştu' });
  }
});

router.delete('/:id', (req: Request, res: Response) => {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ error: 'School ID required' });
    }
    
    const { id } = req.params;
    
    const result = service.deleteBehaviorIncidentBySchool(id, schoolId);
    
    if (!result.success) {
      return res.status(404).json({ 
        error: 'Davranış kaydı bulunamadı veya bu okula ait değil' 
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error deleting behavior incident:', error);
    res.status(500).json({ error: 'Davranış kaydı silinirken hata oluştu' });
  }
});

export default router;
