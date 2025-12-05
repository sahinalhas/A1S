/**
 * Career Guidance Routes
 * Kariyer Rehberliği API Routes
 */

import express from 'express';
import type { Request, Response } from 'express';
import getDatabase from '../../lib/database';
import { CareerGuidanceService } from './services/career-guidance.service';
import type { CareerCategory } from '../../../shared/types/career-guidance.types';
import { validateSchoolAccess, SchoolScopedRequest } from '../../middleware/school-access.middleware.js';
import * as studentsRepository from '../students/repository/students.repository.js';

const router = express.Router();
router.use(validateSchoolAccess);

/**
 * GET /api/career-guidance/careers
 * Tüm Kariyer Profillerini Listele
 */
router.get('/careers', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const service = new CareerGuidanceService(db);

    const { category, search } = req.query;

    let careers;

    if (search && typeof search === 'string') {
      careers = service.searchCareerProfiles(search);
    } else if (category && typeof category === 'string') {
      const repo = service['careerProfilesRepo'];
      careers = repo.getCareerProfilesByCategory(category as CareerCategory);
    } else {
      careers = service.getAllCareerProfiles();
    }

    res.json({
      success: true,
      data: careers,
      count: careers.length
    });
  } catch (error) {
    console.error('Error fetching careers:', error);
    res.status(500).json({
      success: false,
      message: 'Kariyer profilleri alınamadı',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/career-guidance/careers/:id
 * Belirli Bir Kariyer Profilini Getir
 */
router.get('/careers/:id', async (req: Request, res: Response) => {
  try {
    const db = getDatabase();
    const service = new CareerGuidanceService(db);

    const career = service.getCareerProfileById(req.params.id);

    if (!career) {
      return res.status(404).json({
        success: false,
        message: 'Kariyer profili bulunamadı'
      });
    }

    res.json({
      success: true,
      data: career
    });
  } catch (error) {
    console.error('Error fetching career:', error);
    res.status(500).json({
      success: false,
      message: 'Kariyer profili alınamadı',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/career-guidance/analyze
 * Öğrenci Kariyer Analizi Yap
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { studentId, careerId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Öğrenci ID gereklidir'
      });
    }

    if (schoolId) {
      const student = studentsRepository.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        return res.status(403).json({
          success: false,
          message: 'Bu öğrenciye erişim izniniz yok veya öğrenci bulunamadı'
        });
      }
    }

    const db = getDatabase();
    const service = new CareerGuidanceService(db);

    const analysisResult = await service.analyzeStudentCareerMatch(studentId, careerId);

    res.json({
      success: true,
      data: analysisResult
    });
  } catch (error) {
    console.error('Error analyzing career match:', error);
    res.status(500).json({
      success: false,
      message: 'Kariyer analizi yapılamadı',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/career-guidance/roadmap
 * Kariyer Yol Haritası Oluştur
 */
router.post('/roadmap', async (req: Request, res: Response) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { studentId, careerId, customGoals } = req.body;

    if (!studentId || !careerId) {
      return res.status(400).json({
        success: false,
        message: 'Öğrenci ID ve Kariyer ID gereklidir'
      });
    }

    if (schoolId) {
      const student = studentsRepository.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        return res.status(403).json({
          success: false,
          message: 'Bu öğrenciye erişim izniniz yok veya öğrenci bulunamadı'
        });
      }
    }

    const db = getDatabase();
    const service = new CareerGuidanceService(db);

    const roadmap = await service.generateCareerRoadmap(studentId, careerId, customGoals);

    res.json({
      success: true,
      data: roadmap
    });
  } catch (error) {
    console.error('Error generating roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Kariyer yol haritası oluşturulamadı',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/career-guidance/students/:studentId/roadmap
 * Öğrencinin Aktif Yol Haritasını Getir
 */
router.get('/students/:studentId/roadmap', async (req: Request, res: Response) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { studentId } = req.params;

    if (schoolId) {
      const student = studentsRepository.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        return res.status(403).json({
          success: false,
          message: 'Bu öğrenciye erişim izniniz yok veya öğrenci bulunamadı'
        });
      }
    }

    const db = getDatabase();
    const service = new CareerGuidanceService(db);

    const roadmap = service.getStudentActiveRoadmap(studentId);

    // Return null data instead of 404 - not having a roadmap is not an error
    res.json({
      success: true,
      data: roadmap || null
    });
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Yol haritası alınamadı',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/career-guidance/students/:studentId/roadmaps
 * Öğrencinin Tüm Yol Haritalarını Getir
 */
router.get('/students/:studentId/roadmaps', async (req: Request, res: Response) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { studentId } = req.params;

    if (schoolId) {
      const student = studentsRepository.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        return res.status(403).json({
          success: false,
          message: 'Bu öğrenciye erişim izniniz yok veya öğrenci bulunamadı'
        });
      }
    }

    const db = getDatabase();
    const service = new CareerGuidanceService(db);

    const roadmaps = service.getStudentAllRoadmaps(studentId);

    res.json({
      success: true,
      data: roadmaps,
      count: roadmaps.length
    });
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    res.status(500).json({
      success: false,
      message: 'Yol haritaları alınamadı',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * PUT /api/career-guidance/roadmap/:roadmapId
 * Yol Haritasını Güncelle
 */
router.put('/roadmap/:roadmapId', async (req: Request, res: Response) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { roadmapId } = req.params;
    const updates = req.body;

    const db = getDatabase();
    const service = new CareerGuidanceService(db);

    if (schoolId) {
      const roadmap = service.getRoadmapById(roadmapId);
      if (roadmap && roadmap.studentId) {
        const student = studentsRepository.getStudentByIdAndSchool(roadmap.studentId, schoolId);
        if (!student) {
          return res.status(403).json({
            success: false,
            message: 'Bu yol haritasına erişim izniniz yok'
          });
        }
      }
    }

    service.updateRoadmapProgress(roadmapId, updates);

    res.json({
      success: true,
      message: 'Yol haritası güncellendi'
    });
  } catch (error) {
    console.error('Error updating roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Yol haritası güncellenemedi',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/career-guidance/students/:studentId/competencies
 * Öğrenci Yetkinliklerini Getir
 */
router.get('/students/:studentId/competencies', async (req: Request, res: Response) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { studentId } = req.params;

    if (schoolId) {
      const student = studentsRepository.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        return res.status(403).json({
          success: false,
          message: 'Bu öğrenciye erişim izniniz yok veya öğrenci bulunamadı'
        });
      }
    }

    const db = getDatabase();
    const service = new CareerGuidanceService(db);

    const competencies = await service.getStudentCompetencies(studentId);

    res.json({
      success: true,
      data: competencies,
      count: competencies.length
    });
  } catch (error) {
    console.error('Error fetching competencies:', error);
    res.status(500).json({
      success: false,
      message: 'Yetkinlikler alınamadı',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/career-guidance/students/:studentId/competencies/refresh
 * Öğrenci Yetkinliklerini Yenile
 */
router.post('/students/:studentId/competencies/refresh', async (req: Request, res: Response) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { studentId } = req.params;

    if (schoolId) {
      const student = studentsRepository.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        return res.status(403).json({
          success: false,
          message: 'Bu öğrenciye erişim izniniz yok veya öğrenci bulunamadı'
        });
      }
    }

    const db = getDatabase();
    const service = new CareerGuidanceService(db);

    const competencies = await service.refreshStudentCompetencies(studentId);

    res.json({
      success: true,
      data: competencies,
      count: competencies.length,
      message: 'Yetkinlikler yenilendi'
    });
  } catch (error) {
    console.error('Error refreshing competencies:', error);
    res.status(500).json({
      success: false,
      message: 'Yetkinlikler yenilenemedi',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/career-guidance/students/:studentId/competencies/stats
 * Öğrenci Yetkinlik İstatistikleri
 */
router.get('/students/:studentId/competencies/stats', async (req: Request, res: Response) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { studentId } = req.params;

    if (schoolId) {
      const student = studentsRepository.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        return res.status(403).json({
          success: false,
          message: 'Bu öğrenciye erişim izniniz yok veya öğrenci bulunamadı'
        });
      }
    }

    const db = getDatabase();
    const service = new CareerGuidanceService(db);

    const stats = service.getStudentCompetencyStats(studentId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching competency stats:', error);
    res.status(500).json({
      success: false,
      message: 'Yetkinlik istatistikleri alınamadı',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/career-guidance/students/:studentId/analysis-history
 * Kariyer Analiz Geçmişi
 */
router.get('/students/:studentId/analysis-history', async (req: Request, res: Response) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { studentId } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

    if (schoolId) {
      const student = studentsRepository.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        return res.status(403).json({
          success: false,
          message: 'Bu öğrenciye erişim izniniz yok veya öğrenci bulunamadı'
        });
      }
    }

    const db = getDatabase();
    const service = new CareerGuidanceService(db);

    const history = service.getCareerAnalysisHistory(studentId, limit);

    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Error fetching analysis history:', error);
    res.status(500).json({
      success: false,
      message: 'Analiz geçmişi alınamadı',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/career-guidance/compare
 * Birden Fazla Mesleği Karşılaştır
 */
router.post('/compare', async (req: Request, res: Response) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { studentId, careerIds } = req.body;

    if (!studentId || !careerIds || !Array.isArray(careerIds)) {
      return res.status(400).json({
        success: false,
        message: 'Öğrenci ID ve kariyer ID listesi gereklidir'
      });
    }

    if (schoolId) {
      const student = studentsRepository.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        return res.status(403).json({
          success: false,
          message: 'Bu öğrenciye erişim izniniz yok veya öğrenci bulunamadı'
        });
      }
    }

    const db = getDatabase();
    const service = new CareerGuidanceService(db);

    const comparison = await service.compareMultipleCareers(studentId, careerIds);

    res.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Error comparing careers:', error);
    res.status(500).json({
      success: false,
      message: 'Meslekler karşılaştırılamadı',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * DELETE /api/career-guidance/roadmap/:roadmapId
 * Kariyer Yol Haritasını Sil
 */
router.delete('/roadmap/:roadmapId', async (req: Request, res: Response) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { roadmapId } = req.params;

    const db = getDatabase();
    const service = new CareerGuidanceService(db);

    if (schoolId) {
      const roadmap = service.getRoadmapById(roadmapId);
      if (!roadmap) {
        return res.status(404).json({
          success: false,
          message: 'Yol haritası bulunamadı'
        });
      }
      if (roadmap.studentId) {
        const student = studentsRepository.getStudentByIdAndSchool(roadmap.studentId, schoolId);
        if (!student) {
          return res.status(403).json({
            success: false,
            message: 'Bu yol haritasını silme izniniz yok'
          });
        }
      }
    }

    service.deleteRoadmap(roadmapId, schoolId);

    res.json({
      success: true,
      message: 'Yol haritası silindi'
    });
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    res.status(500).json({
      success: false,
      message: 'Yol haritası silinemedi',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export { router as careerGuidanceRoutes };
