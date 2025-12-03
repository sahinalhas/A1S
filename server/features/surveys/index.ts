import { Router } from 'express';
import { simpleRateLimit } from '../../middleware/validation.js';
import { bulkOperationsRateLimiter } from '../../middleware/rate-limit.middleware.js';
import { requireSecureAuth, requireRoleSecure } from '../../middleware/auth-secure.middleware.js';
import { validateSchoolAccess } from '../../middleware/school-access.middleware.js';
import * as templatesRoutes from './routes/modules/templates.routes.js';
import * as questionsRoutes from './routes/modules/questions.routes.js';
import * as distributionsRoutes from './routes/modules/distributions.routes.js';
import * as responsesRoutes from './routes/modules/responses.routes.js';
import * as analyticsRoutes from './routes/modules/analytics.routes.js';
import aiAnalysisRoutes from './routes/ai-analysis.routes.js';

const router = Router();

// Apply school access validation to all authenticated routes
const authenticatedRouter = Router();
authenticatedRouter.use(requireSecureAuth);
authenticatedRouter.use(validateSchoolAccess);

authenticatedRouter.get("/survey-templates", requireSecureAuth, requireRoleSecure(['counselor', 'teacher']), simpleRateLimit(200, 15 * 60 * 1000), templatesRoutes.getSurveyTemplates);
router.get("/survey-templates/public/:id", simpleRateLimit(300, 15 * 60 * 1000), templatesRoutes.getSurveyTemplateById);
router.get("/survey-templates/:id", simpleRateLimit(300, 15 * 60 * 1000), templatesRoutes.getSurveyTemplateById);
authenticatedRouter.post("/survey-templates", requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(30, 15 * 60 * 1000), templatesRoutes.createSurveyTemplate);
authenticatedRouter.put("/survey-templates/:id", requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(30, 15 * 60 * 1000), templatesRoutes.updateSurveyTemplateHandler);
authenticatedRouter.delete("/survey-templates/:id", requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(20, 15 * 60 * 1000), templatesRoutes.deleteSurveyTemplateHandler);
authenticatedRouter.post("/survey-templates/reset", requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(10, 15 * 60 * 1000), templatesRoutes.resetSurveyTemplatesToDefaults);

router.get("/survey-questions/public/:templateId", simpleRateLimit(300, 15 * 60 * 1000), questionsRoutes.getQuestionsByTemplateId);
router.get("/survey-questions/:templateId", simpleRateLimit(300, 15 * 60 * 1000), questionsRoutes.getQuestionsByTemplateId);
authenticatedRouter.post("/survey-questions", requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(50, 15 * 60 * 1000), questionsRoutes.createSurveyQuestion);
authenticatedRouter.put("/survey-questions/:id", requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(50, 15 * 60 * 1000), questionsRoutes.updateSurveyQuestionHandler);
authenticatedRouter.delete("/survey-questions/:id", requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(30, 15 * 60 * 1000), questionsRoutes.deleteSurveyQuestionHandler);
authenticatedRouter.delete("/survey-questions/template/:templateId", requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(20, 15 * 60 * 1000), questionsRoutes.deleteQuestionsByTemplateHandler);

authenticatedRouter.get("/survey-distributions", requireSecureAuth, requireRoleSecure(['counselor', 'teacher']), simpleRateLimit(200, 15 * 60 * 1000), distributionsRoutes.getSurveyDistributions);
authenticatedRouter.get("/survey-distributions/:id", requireSecureAuth, simpleRateLimit(200, 15 * 60 * 1000), distributionsRoutes.getSurveyDistributionById);
authenticatedRouter.get("/survey-distributions/link/:publicLink", simpleRateLimit(300, 15 * 60 * 1000), distributionsRoutes.getSurveyDistributionByPublicLink);
authenticatedRouter.post("/survey-distributions", requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(30, 15 * 60 * 1000), distributionsRoutes.createSurveyDistribution);
authenticatedRouter.put("/survey-distributions/:id", requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(30, 15 * 60 * 1000), distributionsRoutes.updateSurveyDistributionHandler);
authenticatedRouter.delete("/survey-distributions/:id", requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(20, 15 * 60 * 1000), distributionsRoutes.deleteSurveyDistributionHandler);
authenticatedRouter.post("/survey-distributions/:id/generate-codes", requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(10, 15 * 60 * 1000), distributionsRoutes.generateDistributionCodesHandler);
authenticatedRouter.post("/survey-distributions/:id/generate-qr-pdf", requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(5, 15 * 60 * 1000), distributionsRoutes.generateQRPDFHandler);
authenticatedRouter.post("/survey-distributions/verify-code", simpleRateLimit(50, 15 * 60 * 1000), distributionsRoutes.verifyDistributionCodeHandler);

authenticatedRouter.get("/survey-responses", requireSecureAuth, requireRoleSecure(['counselor', 'teacher']), simpleRateLimit(200, 15 * 60 * 1000), responsesRoutes.getSurveyResponses);
authenticatedRouter.post("/survey-responses", simpleRateLimit(100, 15 * 60 * 1000), responsesRoutes.createSurveyResponse);
authenticatedRouter.put("/survey-responses/:id", requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(50, 15 * 60 * 1000), responsesRoutes.updateSurveyResponseHandler);
authenticatedRouter.delete("/survey-responses/:id", requireSecureAuth, requireRoleSecure(['counselor']), simpleRateLimit(30, 15 * 60 * 1000), responsesRoutes.deleteSurveyResponseHandler);
authenticatedRouter.post("/survey-responses/import/:distributionId", requireSecureAuth, requireRoleSecure(['counselor']), bulkOperationsRateLimiter, responsesRoutes.uploadMiddleware, responsesRoutes.importExcelResponsesHandler);

authenticatedRouter.get("/survey-analytics/:distributionId", requireSecureAuth, requireRoleSecure(['counselor', 'teacher']), simpleRateLimit(150, 15 * 60 * 1000), analyticsRoutes.getSurveyAnalytics);
authenticatedRouter.get("/survey-analytics/:distributionId/question/:questionId", requireSecureAuth, requireRoleSecure(['counselor', 'teacher']), simpleRateLimit(150, 15 * 60 * 1000), analyticsRoutes.getSurveyQuestionAnalytics);
authenticatedRouter.get("/survey-statistics/:distributionId", requireSecureAuth, requireRoleSecure(['counselor', 'teacher']), simpleRateLimit(150, 15 * 60 * 1000), analyticsRoutes.getDistributionStatistics);

authenticatedRouter.use("/ai-analysis", requireSecureAuth, requireRoleSecure(['counselor', 'teacher']), simpleRateLimit(50, 15 * 60 * 1000), aiAnalysisRoutes);

router.use("/", authenticatedRouter);

export default router;
