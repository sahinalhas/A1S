import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
/**
 * Intervention AI Routes
 */

import { Router } from 'express';
import { InterventionAIService } from '../services/intervention-ai.service.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

const router = Router();
router.use(validateSchoolAccess);
const interventionService = new InterventionAIService();

/**
 * POST /api/interventions/generate-plan/:studentId
 * Öğrenci için müdahale planı oluştur
 */
router.post('/generate-plan/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const plan = await interventionService.generateInterventionPlan(studentId);

    res.json({
      success: true,
      data: plan
    });
  } catch (error: unknown) {
    console.error('Intervention plan error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Müdahale planı oluşturulamadı'
    });
  }
});

/**
 * POST /api/interventions/targeted/:studentId
 * Belirli alana yönelik öneriler
 */
router.post('/targeted/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const { targetArea } = req.body;

    const recommendations = await interventionService.getTargetedRecommendations(
      studentId,
      targetArea
    );

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error: unknown) {
    console.error('Targeted recommendations error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Öneriler oluşturulamadı'
    });
  }
});

/**
 * POST /api/interventions/evaluate
 * Müdahale ilerlemesini değerlendir
 */
router.post('/evaluate', async (req, res) => {
  try {
    const { studentId, interventionId, progressNotes } = req.body;

    const evaluation = await interventionService.evaluateInterventionProgress(
      studentId,
      interventionId,
      progressNotes
    );

    res.json({
      success: true,
      data: evaluation
    });
  } catch (error: unknown) {
    console.error('Intervention evaluation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Değerlendirme yapılamadı'
    });
  }
});

export default router;
