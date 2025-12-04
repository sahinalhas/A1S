import { Router } from 'express';
import { randomUUID } from 'crypto';
import { StandardizedProfileRepository } from '../repository/standardized-profile.repository';
import { AggregateScoreCalculator } from '../services/aggregate-score-calculator.service';
import getDatabase from '../../../lib/database';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
import { logger } from '../../../utils/logger.js';

const router = Router();
router.use(validateSchoolAccess);

router.get('/intervention-stats', (req, res) => {
  try {
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    const studentsStmt = db.prepare('SELECT id FROM students');
    const students = studentsStmt.all() as Array<{ id: string }>;
    
    let totalOpen = 0;
    let completedThisMonth = 0;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    for (const student of students) {
      const interventions = repo.getStandardizedInterventions(student.id);
      totalOpen += interventions.filter(i => 
        i.status !== "TAMAMLANDI" && i.status !== "İPTAL"
      ).length;
      
      const completed = interventions.filter(i => {
        if (i.status !== "TAMAMLANDI") return false;
        const intDate = new Date(i.startDate);
        return intDate.getMonth() === currentMonth && intDate.getFullYear() === currentYear;
      });
      completedThisMonth += completed.length;
    }
    
    res.json({
      openInterventions: totalOpen,
      completedThisMonth: completedThisMonth,
      totalStudents: students.length
    });
  } catch (error) {
    logger.error('Error fetching intervention stats', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to fetch intervention stats' });
  }
});

router.get('/:studentId/academic', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const profile = repo.getAcademicProfile(studentId);
    
    res.json(profile || {});
  } catch (error) {
    logger.error('Error fetching academic profile', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to fetch academic profile' });
  }
});

router.post('/:studentId/academic', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    const profile = {
      ...req.body,
      studentId,
      id: req.body.id || randomUUID(),
    };
    
    repo.upsertAcademicProfile(profile);
    res.json({ success: true, profile });
  } catch (error) {
    logger.error('Error saving academic profile', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to save academic profile' });
  }
});

router.get('/:studentId/social-emotional', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const profile = repo.getSocialEmotionalProfile(studentId);
    
    res.json(profile || {});
  } catch (error) {
    logger.error('Error fetching social-emotional profile', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to fetch social-emotional profile' });
  }
});

router.post('/:studentId/social-emotional', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    const profile = {
      ...req.body,
      studentId,
      id: req.body.id || randomUUID(),
    };
    
    repo.upsertSocialEmotionalProfile(profile);
    res.json({ success: true, profile });
  } catch (error) {
    logger.error('Error saving social-emotional profile', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to save social-emotional profile' });
  }
});

router.get('/:studentId/talents-interests', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const profile = repo.getTalentsInterestsProfile(studentId);
    
    res.json(profile || {});
  } catch (error) {
    logger.error('Error fetching talents-interests profile', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to fetch talents-interests profile' });
  }
});

router.post('/:studentId/talents-interests', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    const profile = {
      ...req.body,
      studentId,
      id: req.body.id || randomUUID(),
    };
    
    repo.upsertTalentsInterestsProfile(profile);
    res.json({ success: true, profile });
  } catch (error) {
    logger.error('Error saving talents-interests profile', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to save talents-interests profile' });
  }
});

router.get('/:studentId/health', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const profile = repo.getStandardizedHealthProfile(studentId);
    
    res.json(profile || {});
  } catch (error) {
    logger.error('Error fetching health profile', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to fetch health profile' });
  }
});

router.post('/:studentId/health', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    const profile = {
      ...req.body,
      studentId,
      id: req.body.id || randomUUID(),
    };
    
    repo.upsertStandardizedHealthProfile(profile);
    res.json({ success: true, profile });
  } catch (error) {
    logger.error('Error saving health profile', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to save health profile' });
  }
});

router.get('/:studentId/interventions', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const interventions = repo.getStandardizedInterventions(studentId);
    
    res.json(interventions);
  } catch (error) {
    logger.error('Error fetching interventions', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to fetch interventions' });
  }
});

router.post('/:studentId/interventions', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    const intervention = {
      ...req.body,
      studentId,
      id: req.body.id || randomUUID(),
    };
    
    repo.insertStandardizedIntervention(intervention);
    res.json({ success: true, intervention });
  } catch (error) {
    logger.error('Error saving intervention', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to save intervention' });
  }
});

router.get('/:studentId/behavior-incidents', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const incidents = repo.getStandardizedBehaviorIncidents(studentId);
    
    res.json(incidents);
  } catch (error) {
    logger.error('Error fetching behavior incidents', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to fetch behavior incidents' });
  }
});

router.post('/:studentId/behavior-incident', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    const incident = {
      ...req.body,
      studentId,
      id: req.body.id || randomUUID(),
    };
    
    repo.insertStandardizedBehaviorIncident(incident);
    res.json({ success: true, incident });
  } catch (error) {
    logger.error('Error saving behavior incident', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to save behavior incident' });
  }
});

router.get('/:studentId/aggregate', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const calculator = new AggregateScoreCalculator();
    
    const academic = repo.getAcademicProfile(studentId);
    const socialEmotional = repo.getSocialEmotionalProfile(studentId);
    const talentsInterests = repo.getTalentsInterestsProfile(studentId);
    const health = repo.getStandardizedHealthProfile(studentId);
    const behaviorIncidents = repo.getStandardizedBehaviorIncidents(studentId);
    const motivation = repo.getMotivationProfile(studentId);
    const riskProtective = repo.getRiskProtectiveProfile(studentId);
    const interventions = repo.getStandardizedInterventions(studentId);
    
    const aggregateScores = calculator.calculateAggregateScores({
      academic: academic as any,
      socialEmotional: socialEmotional as any,
      talentsInterests: talentsInterests as any,
      health: health as any,
      behaviorIncidents: behaviorIncidents as any[],
      motivation: motivation as any,
      riskProtective: riskProtective as any
    });
    
    const aiReadyProfile = {
      studentId,
      profiles: {
        academic,
        socialEmotional,
        talentsInterests,
        health,
        behaviorIncidents,
        motivation,
        riskProtective,
        interventions
      },
      aggregateScores,
      metadata: {
        generatedAt: new Date().toISOString(),
        profileCompleteness: {
          academic: !!academic,
          socialEmotional: !!socialEmotional,
          talentsInterests: !!talentsInterests,
          health: !!health,
          behavior: behaviorIncidents.length > 0,
          motivation: !!motivation,
          riskProtective: !!riskProtective,
          interventions: interventions.length > 0
        }
      }
    };
    
    res.json(aiReadyProfile);
  } catch (error) {
    logger.error('Error generating aggregate profile', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to generate aggregate profile' });
  }
});

router.get('/:studentId/motivation', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const profile = repo.getMotivationProfile(studentId);
    
    res.json(profile || {});
  } catch (error) {
    logger.error('Error fetching motivation profile', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to fetch motivation profile' });
  }
});

router.post('/:studentId/motivation', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    // Transform frontend field names to database field names
    const profile = {
      id: req.body.id || randomUUID(),
      studentId,
      assessmentDate: req.body.assessmentDate,
      primaryMotivationSources: req.body.primaryMotivators || [],
      careerAspirations: req.body.careerAspirations || [],
      universityPreferences: req.body.universityPreferences || [],
      academicGoals: req.body.academicGoals || [],
      goalClarityLevel: req.body.goalClarityLevel,
      intrinsicMotivation: req.body.intrinsicMotivationLevel,
      extrinsicMotivation: req.body.extrinsicMotivationLevel,
      persistenceLevel: req.body.persistenceLevel,
      futureOrientationLevel: req.body.futureOrientationLevel,
      shortTermGoals: req.body.shortTermGoals,
      longTermGoals: req.body.longTermGoals,
      obstacles: req.body.obstacles,
      supportNeeds: req.body.supportNeeds,
      studentExpectations: req.body.studentExpectations,
      familyExpectations: req.body.familyExpectations,
      additionalNotes: req.body.additionalNotes,
    };
    
    repo.upsertMotivationProfile(profile);
    res.json({ success: true, profile: req.body });
  } catch (error) {
    logger.error('Error saving motivation profile', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to save motivation profile' });
  }
});

router.get('/:studentId/risk-protective', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    const profile = repo.getRiskProtectiveProfile(studentId);
    
    res.json(profile || {});
  } catch (error) {
    logger.error('Error fetching risk/protective profile', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to fetch risk/protective profile' });
  }
});

router.post('/:studentId/risk-protective', (req, res) => {
  try {
    const { studentId } = req.params;
    const db = getDatabase();
    const repo = new StandardizedProfileRepository(db);
    
    // Transform frontend field names to backend field names
    const profile = {
      id: req.body.id || randomUUID(),
      studentId,
      assessmentDate: req.body.assessmentDate,
      // Risk levels (TEXT enum - kept for backward compatibility, derived from numeric)
      academicRiskLevel: undefined,
      behavioralRiskLevel: undefined,
      socialEmotionalRiskLevel: undefined,
      attendanceRiskLevel: req.body.attendanceRiskLevel || undefined,
      dropoutRisk: req.body.dropoutRisk || undefined,
      // Numeric risk levels (1-10 scale from UI sliders)
      overallRiskLevel: req.body.overallRiskLevel || null,
      academicRiskLevelInt: req.body.academicRiskLevel || null,
      behavioralRiskLevelInt: req.body.behavioralRiskLevel || null,
      emotionalRiskLevel: req.body.emotionalRiskLevel || null,
      socialRiskLevel: req.body.socialRiskLevel || null,
      // Protective factor levels (1-10 scale from UI sliders)
      familySupport: req.body.familySupport || null,
      peerSupport: req.body.peerSupport || null,
      schoolEngagement: req.body.schoolEngagement || null,
      resilienceLevel: req.body.resilienceLevel || null,
      copingSkills: req.body.copingSkills || null,
      // Protective and risk factors (arrays)
      activeProtectiveFactors: req.body.protectiveFactors || [],
      identifiedRiskFactors: req.body.identifiedRiskFactors || [],
      // Risk factors (text fields - legacy)
      academicRiskFactors: req.body.academicRiskFactors || null,
      behavioralRiskFactors: req.body.behavioralRiskFactors || null,
      socialRiskFactors: req.body.socialRiskFactors || null,
      familyRiskFactors: req.body.familyRiskFactors || null,
      // Overall assessment
      overallRiskScore: req.body.overallRiskLevel || null,
      // Assessment and planning
      riskAssessmentNotes: req.body.riskAssessmentNotes || null,
      interventionPlan: req.body.interventionPlan || null,
      monitoringFrequency: req.body.monitoringFrequency || null,
      // Interventions and follow-up
      recommendedInterventions: req.body.recommendedInterventions || [],
      assignedCounselor: req.body.assignedCounselor || null,
      parentNotified: req.body.parentNotified || false,
      nextAssessmentDate: req.body.nextAssessmentDate || null,
      additionalNotes: req.body.additionalNotes || null,
      assessedBy: req.body.assessedBy || null,
    };
    
    repo.upsertRiskProtectiveProfile(profile);
    res.json({ success: true, profile: req.body });
  } catch (error) {
    logger.error('Error saving risk protective profile', 'StandardizedProfile', error);
    res.status(500).json({ success: false, error: 'Failed to save risk protective profile' });
  }
});

export default router;
