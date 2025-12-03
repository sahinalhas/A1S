import express from 'express';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
import { getReportsOverview, getReportsOverviewBySchool, getStudentAnalytics, forceRefreshAnalytics, invalidateAnalyticsCache } from '../services/analytics.service.js';
import { getCacheStats } from '../repository/cache.repository.js';

const router = express.Router();
router.use(validateSchoolAccess);

router.get('/reports-overview', async (req, res) => {
  try {
    const schoolId = (req as any).schoolId;
    if (!schoolId) {
      return res.status(400).json({ error: 'School ID required' });
    }
    const data = await getReportsOverviewBySchool(schoolId);
    res.json(data);
  } catch (error) {
    console.error('Error fetching reports overview:', error);
    res.status(500).json({ error: 'Rapor verileri alınamadı' });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const schoolId = (req as any).schoolId;
    const { studentId } = req.params;
    
    // Verify student belongs to this school
    if (schoolId) {
      const studentsRepo = require('../../students/repository/students.repository.js');
      const student = studentsRepo.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        return res.status(403).json({ error: 'Bu öğrenciye erişim izniniz yok' });
      }
    }
    
    const data = await getStudentAnalytics(studentId);
    
    if (!data) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    res.status(500).json({ error: 'Öğrenci analitik verileri alınamadı' });
  }
});

router.post('/invalidate-cache', (req, res) => {
  try {
    const schoolId = (req as any).schoolId;
    if (!schoolId) {
      return res.status(400).json({ error: 'School ID required' });
    }
    invalidateAnalyticsCache();
    forceRefreshAnalytics();
    res.json({ message: 'Okul analitik cache\'i temizlendi ve yenilendi' });
  } catch (error) {
    console.error('Error invalidating cache:', error);
    res.status(500).json({ error: 'Cache temizlenemedi' });
  }
});

router.get('/cache-stats', (req, res) => {
  try {
    const schoolId = (req as any).schoolId;
    if (!schoolId) {
      return res.status(400).json({ error: 'School ID required' });
    }
    const stats = getCacheStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching cache stats:', error);
    res.status(500).json({ error: 'Cache istatistikleri alınamadı' });
  }
});

export default router;
