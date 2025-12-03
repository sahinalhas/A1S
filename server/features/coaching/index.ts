import { Router } from 'express';
import { requireSecureAuth } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import { simpleRateLimit } from '../../middleware/validation.js';
import * as goalsRoutes from './routes/modules/goals.routes.js';
import * as assessmentsRoutes from './routes/modules/assessments.routes.js';
import * as familyRoutes from './routes/modules/family.routes.js';
import * as achievementsRoutes from './routes/modules/achievements.routes.js';

const router = Router();

router.use(requireSecureAuth);
router.use(validateSchoolAccess);

const readLimit = simpleRateLimit(200, 15 * 60 * 1000);
const writeLimit = simpleRateLimit(50, 15 * 60 * 1000);
const deleteLimit = simpleRateLimit(20, 15 * 60 * 1000);

// ============= GOALS ROUTES =============
router.get('/academic-goals', readLimit, goalsRoutes.getAcademicGoals);
router.get('/academic-goals/student/:studentId', readLimit, goalsRoutes.getAcademicGoalsByStudent);
router.post('/academic-goals', writeLimit, goalsRoutes.createAcademicGoal);
router.put('/academic-goals/:id', writeLimit, goalsRoutes.updateAcademicGoal);
router.delete('/academic-goals/:id', deleteLimit, goalsRoutes.deleteAcademicGoal);

router.get('/smart-goals/student/:studentId', readLimit, goalsRoutes.getSmartGoalsByStudent);
router.post('/smart-goals', writeLimit, goalsRoutes.createSmartGoal);
router.put('/smart-goals/:id', writeLimit, goalsRoutes.updateSmartGoal);

// ============= ASSESSMENTS ROUTES =============
router.get('/multiple-intelligence/student/:studentId', readLimit, assessmentsRoutes.getMultipleIntelligenceByStudent);
router.post('/multiple-intelligence', writeLimit, assessmentsRoutes.createMultipleIntelligence);

router.get('/learning-styles/student/:studentId', readLimit, assessmentsRoutes.getLearningStylesByStudent);
router.post('/learning-styles', writeLimit, assessmentsRoutes.createLearningStyle);

router.get('/evaluations-360/student/:studentId', readLimit, assessmentsRoutes.getEvaluations360ByStudent);
router.post('/evaluations-360', writeLimit, assessmentsRoutes.createEvaluation360);

router.get('/self-assessments/student/:studentId', readLimit, assessmentsRoutes.getSelfAssessmentsByStudent);
router.post('/self-assessments', writeLimit, assessmentsRoutes.createSelfAssessment);

// ============= FAMILY ROUTES =============
router.get('/parent-meetings/student/:studentId', readLimit, familyRoutes.getParentMeetingsByStudent);
router.post('/parent-meetings', writeLimit, familyRoutes.createParentMeeting);
router.put('/parent-meetings/:id', writeLimit, familyRoutes.updateParentMeeting);

router.get('/home-visits/student/:studentId', readLimit, familyRoutes.getHomeVisitsByStudent);
router.post('/home-visits', writeLimit, familyRoutes.createHomeVisit);
router.put('/home-visits/:id', writeLimit, familyRoutes.updateHomeVisit);

router.get('/family-participations/student/:studentId', readLimit, familyRoutes.getFamilyParticipationByStudent);
router.post('/family-participations', writeLimit, familyRoutes.createFamilyParticipation);
router.put('/family-participations/:id', writeLimit, familyRoutes.updateFamilyParticipation);

// ============= ACHIEVEMENTS & RECOMMENDATIONS ROUTES =============
router.get('/coaching-recommendations/student/:studentId', readLimit, achievementsRoutes.getCoachingRecommendationsByStudent);
router.post('/coaching-recommendations', writeLimit, achievementsRoutes.createCoachingRecommendation);
router.put('/coaching-recommendations/:id', writeLimit, achievementsRoutes.updateCoachingRecommendation);

router.get('/achievements/student/:studentId', readLimit, achievementsRoutes.getAchievementsByStudent);
router.post('/achievements', writeLimit, achievementsRoutes.createAchievement);

export default router;
