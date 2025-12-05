import { Request, Response } from 'express';
import * as service from '../services/early-warning.service.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';

function getSchoolId(req: Request): string | null {
  return (req as SchoolScopedRequest).schoolId || null;
}

export async function analyzeStudentRisk(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const { studentId } = req.params;
    
    if (!service.studentBelongsToSchool(studentId, schoolId)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Bu öğrenci seçili okula ait değil' 
      });
    }
    
    const result = await service.analyzeStudentRisk(studentId);
    res.json(result);
  } catch (error) {
    console.error('Error analyzing student risk:', error);
    res.status(500).json({ 
      success: false,
      error: 'Risk analizi yapılırken bir hata oluştu' 
    });
  }
}

export function getRiskScoreHistory(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const { studentId } = req.params;
    
    if (!service.studentBelongsToSchool(studentId, schoolId)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Bu öğrenci seçili okula ait değil' 
      });
    }
    
    const history = service.getRiskScoreHistoryBySchool(studentId, schoolId);
    res.json(history);
  } catch (error) {
    console.error('Error getting risk score history:', error);
    res.status(500).json({ 
      success: false,
      error: 'Risk geçmişi alınırken bir hata oluştu' 
    });
  }
}

export function getLatestRiskScore(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const { studentId } = req.params;
    
    if (!service.studentBelongsToSchool(studentId, schoolId)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Bu öğrenci seçili okula ait değil' 
      });
    }
    
    const score = service.getLatestRiskScoreBySchool(studentId, schoolId);
    res.json(score);
  } catch (error) {
    console.error('Error getting latest risk score:', error);
    res.status(500).json({ 
      success: false,
      error: 'Son risk skoru alınırken bir hata oluştu' 
    });
  }
}

export function getAllAlerts(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    const alerts = service.getAllAlertsBySchool(schoolId);
    res.json(alerts);
  } catch (error) {
    console.error('Error getting all alerts:', error);
    res.status(500).json({ 
      success: false,
      error: 'Uyarılar alınırken bir hata oluştu' 
    });
  }
}

export function getAlertsByStudent(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const { studentId } = req.params;
    
    if (!service.studentBelongsToSchool(studentId, schoolId)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Bu öğrenci seçili okula ait değil' 
      });
    }
    
    const alerts = service.getAlertsByStudentAndSchool(studentId, schoolId);
    res.json(alerts);
  } catch (error) {
    console.error('Error getting alerts by student:', error);
    res.status(500).json({ 
      success: false,
      error: 'Öğrenci uyarıları alınırken bir hata oluştu' 
    });
  }
}

export function getActiveAlerts(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    const alerts = service.getActiveAlertsBySchool(schoolId);
    res.json(alerts);
  } catch (error) {
    console.error('Error getting active alerts:', error);
    res.status(500).json({ 
      success: false,
      error: 'Aktif uyarılar alınırken bir hata oluştu' 
    });
  }
}

export function getAlertById(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const { id } = req.params;
    const alert = service.getAlertByIdAndSchool(id, schoolId);
    
    if (!alert) {
      return res.status(404).json({ 
        success: false, 
        error: 'Uyarı bulunamadı veya bu okula ait değil' 
      });
    }
    
    res.json(alert);
  } catch (error) {
    console.error('Error getting alert by id:', error);
    res.status(500).json({ 
      success: false,
      error: 'Uyarı alınırken bir hata oluştu' 
    });
  }
}

export function updateAlertStatus(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    const result = service.updateAlertStatusBySchool(id, status, schoolId);
    
    if (!result.success) {
      return res.status(404).json({ 
        success: false, 
        error: 'Uyarı bulunamadı veya bu okula ait değil' 
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating alert status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Uyarı durumu güncellenirken bir hata oluştu' 
    });
  }
}

export function updateAlert(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const { id } = req.params;
    const updates = req.body;
    
    const result = service.updateAlertBySchool(id, updates, schoolId);
    
    if (!result.success) {
      return res.status(404).json({ 
        success: false, 
        error: 'Uyarı bulunamadı veya bu okula ait değil' 
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating alert:', error);
    res.status(500).json({ 
      success: false,
      error: 'Uyarı güncellenirken bir hata oluştu' 
    });
  }
}

export function deleteAlert(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const { id } = req.params;
    
    const result = service.deleteAlertBySchool(id, schoolId);
    
    if (!result.success) {
      return res.status(404).json({ 
        success: false, 
        error: 'Uyarı bulunamadı veya bu okula ait değil' 
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ 
      success: false,
      error: 'Uyarı silinirken bir hata oluştu' 
    });
  }
}

export function getRecommendationsByStudent(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const { studentId } = req.params;
    
    if (!service.studentBelongsToSchool(studentId, schoolId)) {
      return res.status(403).json({ 
        success: false, 
        error: 'Bu öğrenci seçili okula ait değil' 
      });
    }
    
    const recommendations = service.getRecommendationsByStudentAndSchool(studentId, schoolId);
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations by student:', error);
    res.status(500).json({ 
      success: false,
      error: 'Öğrenci önerileri alınırken bir hata oluştu' 
    });
  }
}

export function getRecommendationsByAlert(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const { alertId } = req.params;
    
    const recommendations = service.getRecommendationsByAlertAndSchool(alertId, schoolId);
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations by alert:', error);
    res.status(500).json({ 
      success: false,
      error: 'Uyarı önerileri alınırken bir hata oluştu' 
    });
  }
}

export function getActiveRecommendations(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const recommendations = service.getActiveRecommendationsBySchool(schoolId);
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting active recommendations:', error);
    res.status(500).json({ 
      success: false,
      error: 'Aktif öneriler alınırken bir hata oluştu' 
    });
  }
}

export function updateRecommendationStatus(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    const result = service.updateRecommendationStatusBySchool(id, status, schoolId);
    
    if (!result.success) {
      return res.status(404).json({ 
        success: false, 
        error: 'Öneri bulunamadı veya bu okula ait değil' 
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating recommendation status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Öneri durumu güncellenirken bir hata oluştu' 
    });
  }
}

export function updateRecommendation(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const { id } = req.params;
    const updates = req.body;
    
    const result = service.updateRecommendationBySchool(id, updates, schoolId);
    
    if (!result.success) {
      return res.status(404).json({ 
        success: false, 
        error: 'Öneri bulunamadı veya bu okula ait değil' 
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error updating recommendation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Öneri güncellenirken bir hata oluştu' 
    });
  }
}

export function deleteRecommendation(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const { id } = req.params;
    
    const result = service.deleteRecommendationBySchool(id, schoolId);
    
    if (!result.success) {
      return res.status(404).json({ 
        success: false, 
        error: 'Öneri bulunamadı veya bu okula ait değil' 
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error deleting recommendation:', error);
    res.status(500).json({ 
      success: false,
      error: 'Öneri silinirken bir hata oluştu' 
    });
  }
}

export function getHighRiskStudents(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const students = service.getHighRiskStudentsBySchool(schoolId);
    res.json(students);
  } catch (error) {
    console.error('Error getting high risk students:', error);
    res.status(500).json({ 
      success: false,
      error: 'Yüksek riskli öğrenciler alınırken bir hata oluştu' 
    });
  }
}

export function getDashboardSummary(req: Request, res: Response) {
  try {
    const schoolId = getSchoolId(req);
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'School ID required' });
    }
    
    const summary = service.getDashboardSummaryBySchool(schoolId);
    res.json(summary);
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({ 
      success: false,
      error: 'Özet bilgiler alınırken bir hata oluştu' 
    });
  }
}
