import { Router } from 'express';
import { InterventionEffectivenessService } from '../services/intervention-effectiveness.service.js';
import { EscalationService } from '../services/escalation.service.js';
import * as repository from '../repository/intervention-tracking.repository.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

const router = Router();
router.use(validateSchoolAccess);
const effectivenessService = new InterventionEffectivenessService();
const escalationService = new EscalationService();

router.post('/start', async (req, res) => {
  try {
    const { interventionId, studentId, interventionType, interventionTitle, startDate } = req.body;
    
    const id = await effectivenessService.trackInterventionStart(
      interventionId,
      studentId,
      interventionType,
      interventionTitle,
      startDate
    );
    
    res.json({ success: true, id });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/evaluate/:interventionId', async (req, res) => {
  try {
    const { interventionId } = req.params;
    const { endDate, evaluatedBy } = req.body;
    
    const analysis = await effectivenessService.evaluateInterventionEnd(
      interventionId,
      endDate,
      evaluatedBy
    );
    
    res.json({ success: true, data: analysis });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/effectiveness', async (req, res) => {
  try {
    const { studentId, interventionId, effectivenessLevel } = req.query;
    
    let effectiveness: unknown[];
    if (studentId) {
      effectiveness = repository.getEffectivenessByStudent(studentId as string);
    } else if (interventionId) {
      const single = repository.getEffectivenessByIntervention(interventionId as string);
      effectiveness = single ? [single] : [];
    } else {
      effectiveness = repository.getAllEffectiveness();
    }
    
    if (effectivenessLevel && effectiveness.length > 0) {
      effectiveness = effectiveness.filter((e: unknown) => (e as { effectivenessLevel?: string }).effectivenessLevel === effectivenessLevel);
    }
    
    res.json({ success: true, data: effectiveness });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/effectiveness/stats', async (req, res) => {
  try {
    const all = repository.getAllEffectiveness();
    const effective = all.filter((e: unknown) => {
      const eff = e as { effectivenessLevel?: string };
      return eff.effectivenessLevel === 'VERY_EFFECTIVE' || eff.effectivenessLevel === 'EFFECTIVE';
    }).length;
    const needsImprovement = all.filter((e: unknown) => {
      const eff = e as { effectivenessLevel?: string };
      return eff.effectivenessLevel === 'PARTIALLY_EFFECTIVE' || eff.effectivenessLevel === 'NOT_EFFECTIVE';
    }).length;
    const withAiAnalysis = all.filter((e: unknown) => (e as { aiAnalysis?: unknown }).aiAnalysis).length;
    
    res.json({ 
      success: true, 
      data: {
        total: all.length,
        effective,
        needsImprovement,
        withAiAnalysis
      }
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const effectiveness = repository.getEffectivenessByStudent(studentId);
    res.json({ success: true, data: effectiveness });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/successful', async (req, res) => {
  try {
    const { minEffectiveness = 70 } = req.query;
    const interventions = repository.getSuccessfulInterventions(Number(minEffectiveness));
    res.json({ success: true, data: interventions });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/lessons/:interventionType', async (req, res) => {
  try {
    const { interventionType } = req.params;
    const lessons = await effectivenessService.getInterventionLessonsLearned(interventionType);
    res.json({ success: true, data: lessons });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/similar/:interventionType', async (req, res) => {
  try {
    const { interventionType } = req.params;
    const { studentProfile, limit = 5 } = req.query;
    
    const similar = await effectivenessService.findSimilarSuccessfulInterventions(
      interventionType,
      studentProfile ? JSON.parse(studentProfile as string) : {},
      Number(limit)
    );
    
    res.json({ success: true, data: similar });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/feedback', async (req, res) => {
  try {
    const id = repository.createParentFeedback(req.body);
    res.json({ success: true, id });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/feedback/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const feedback = repository.getFeedbackByStudent(studentId);
    res.json({ success: true, data: feedback });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/feedback/pending', async (req, res) => {
  try {
    const feedback = repository.getPendingFeedback();
    res.json({ success: true, data: feedback });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.patch('/feedback/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, respondedBy } = req.body;
    
    repository.updateFeedbackStatus(id, status, respondedBy);
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/escalate', async (req, res) => {
  try {
    const { studentId, escalationType, triggerReason, riskLevel, alertId, interventionId } = req.body;
    
    const escalationId = await escalationService.triggerEscalation(
      studentId,
      escalationType,
      triggerReason,
      riskLevel,
      alertId,
      interventionId
    );
    
    res.json({ success: true, escalationId });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/escalation/:id/respond', async (req, res) => {
  try {
    const { id } = req.params;
    const { respondedBy, actionTaken, resolved } = req.body;
    
    await escalationService.respondToEscalation(id, respondedBy, actionTaken, resolved);
    res.json({ success: true });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/escalation/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const escalations = repository.getEscalationsByStudent(studentId);
    res.json({ success: true, data: escalations });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/escalation/active', async (req, res) => {
  try {
    const escalations = repository.getActiveEscalations();
    res.json({ success: true, data: escalations });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.get('/escalation/metrics', async (req, res) => {
  try {
    const metrics = await escalationService.getEscalationMetrics();
    res.json({ success: true, data: metrics });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/escalation/check-unresponded', async (req, res) => {
  try {
    const result = await escalationService.checkAndEscalateUnresponded();
    res.json({ success: true, data: result });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: error instanceof Error ? error.message : String(error) });
  }
});

export default router;
