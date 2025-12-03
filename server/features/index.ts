import { Router } from 'express';
import studentsRouter from './students/index.js';
import surveysRouter from './surveys/index.js';
import progressRouter from './progress/index.js';
import subjectsRouter from './subjects/index.js';
import settingsRouter from './settings/index.js';
import attendanceRouter from './attendance/index.js';
import studyRouter from './study/index.js';
import meetingNotesRouter from './meeting-notes/index.js';
import documentsRouter from './documents/index.js';
import coachingRouter from './coaching/index.js';
import examsRouter from './exams/index.js';
import sessionsRouter from './sessions/index.js';
import specialEducationRouter from './special-education/index.js';
import behaviorRouter from './behavior/index.js';
import counselingSessionsRouter from './counseling-sessions/index.js';
import usersRouter from './users/index.js';
import analyticsRouter from './analytics/index.js';
import earlyWarningRouter from './early-warning/index.js';
import holisticProfileRouter from './holistic-profile/index.js';
import standardizedProfileRouter from './standardized-profile/routes/standardized-profile.routes.js';
import aiAssistantRouter from './ai-assistant/index.js';
import dailyInsightsRouter from './daily-insights/index.js';
import deepAnalysisRouter from './deep-analysis/index.js';
import parentCommunicationRouter from './parent-communication/index.js';
import reportsRouter from './reports/index.js';
import notificationsRouter from './notifications/index.js';
import interventionTrackingRouter from './intervention-tracking/index.js';
import advancedReportsRouter from './advanced-reports/index.js';
import backupRouter from './backup/routes/backup.routes.js';
import enhancedRiskRouter from './enhanced-risk/index.js';
import personalizedLearningRouter from './personalized-learning/index.js';
import advancedAnalyticsRouter from './advanced-analytics/index.js';
import socialNetworkRouter from './social-network/index.js';
import searchRouter from './search/index.js';
import careerGuidanceRouter from './career-guidance/index.js';
import profileSyncRouter from './profile-sync/index.js';
import aiSuggestionsRouter from './ai-suggestions/index.js';
import examManagementRouter from './exam-management/index.js';
import guidanceStandardsRouter from './guidance-standards/index.js';
import mebbisTransferRouter from './mebbis-transfer/index.js';
import guidanceTipsRouter from './guidance-tips/index.js';
import schoolsRouter from './schools/index.js';

/**
 * Feature Registry
 * 
 * This is the central registry for all feature modules in the backend.
 * Each feature should export an Express Router from its index.ts file.
 * 
 * Migration Status: STAGE 3 COMPLETE! ✅
 * 
 * Standard Feature Structure:
 * server/features/<feature-name>/
 *   ├── routes/      - Express route handlers and endpoint definitions
 *   ├── services/    - Business logic and orchestration
 *   ├── repository/  - Data access layer (database operations)
 *   ├── types/       - TypeScript type definitions and interfaces
 *   └── index.ts     - Feature router export (aggregates routes)
 * 
 * Migration Strategy (5 Stages):
 * - Stage 0: ✅ Scaffolding complete
 * - Stage 1: ✅ Core domains - students ✅ → surveys ✅ → progress ✅
 * - Stage 2: ✅ Adjacent domains - subjects ✅ → settings ✅ → attendance ✅ → study ✅ → meeting-notes ✅ → documents ✅
 * - Stage 3 Wave 1: ✅ Academic Data Cluster - coaching ✅ → exams ✅ → sessions ✅
 * - Stage 3 Wave 2: ✅ Student Support Cluster - health ✅ → special-education ✅ → risk-assessment ✅ → behavior ✅
 * - Stage 3 Wave 3: ✅ Cross-cutting/Stateful Features - counseling-sessions ✅ → auth ✅ (STAGE 3 COMPLETE!)
 * - Stage 4: Cleanup - remove legacy imports, delete old route files
 * 
 * STAGE 1 CANONICAL ORDER (COMPLETED):
 * 1. students (foundation for all student features) ✅
 * 2. surveys (independent survey system) ✅
 * 3. progress (student progress tracking) ✅
 * 
 * STAGE 2 CANONICAL ORDER (COMPLETE):
 * 1. subjects (first adjacent domain - subjects and topics CRUD) ✅
 * 2. settings (second adjacent domain - app settings management) ✅
 * 3. attendance (third adjacent domain - attendance tracking) ✅
 * 4. study (fourth adjacent domain - study assignments and weekly slots) ✅
 * 5. meeting-notes (fifth adjacent domain - meeting notes CRUD) ✅
 * 6. documents (sixth adjacent domain - student documents CRUD) ✅
 * 
 * Subsequent stages follow dependency minimization and risk reduction principles.
 */

export const featureRegistry = Router();

/**
 * =================== DOMAIN-BASED FEATURE ORGANIZATION ===================
 * 
 * Features are organized into logical domains for better maintainability:
 * 
 * 1. CORE DOMAIN - Foundation entities
 *    - students: Student management, CRUD operations
 * 
 * 2. ACADEMIC DOMAIN - Educational tracking and performance
 *    - subjects: Subjects and topics CRUD
 *    - progress: Progress tracking and academic goals
 *    - attendance: Attendance tracking
 *    - exams: Exam results and analysis
 *    - coaching: Academic goals, SMART goals, 360 evaluations
 *    - sessions: Study sessions CRUD
 *    - study: Study assignments and weekly slots
 * 
 * 3. STUDENT SUPPORT DOMAIN - Wellbeing and specialized services
 *    - health: Health information, emergency contacts, medical history
 *    - special-education: IEP/BEP records, RAM reports, support services
 *    - risk-assessment: Risk factors, high-risk student queries
 *    - behavior: Behavior incidents, statistics
 *    - counseling-sessions: Individual/group counseling sessions
 * 
 * 4. COMMUNICATION DOMAIN - Engagement and feedback
 *    - surveys: Templates, questions, distributions, responses, analytics
 *    - meeting-notes: Meeting notes CRUD
 *    - documents: Student documents CRUD
 * 
 * 5. SYSTEM DOMAIN - Configuration and authentication
 *    - settings: App settings management
 *    - auth: User session management
 */

// =================== CORE DOMAIN ===================
featureRegistry.use('/students', studentsRouter);

// =================== ACADEMIC DOMAIN ===================
featureRegistry.use('/subjects', subjectsRouter);
featureRegistry.use('/progress', progressRouter);
featureRegistry.use('/attendance', attendanceRouter);
featureRegistry.use('/exams', examsRouter);
featureRegistry.use('/exam-management', examManagementRouter);
featureRegistry.use('/coaching', coachingRouter);
featureRegistry.use('/study-sessions', sessionsRouter);
featureRegistry.use('/study', studyRouter);

// =================== STUDENT SUPPORT DOMAIN ===================
featureRegistry.use('/special-education', specialEducationRouter);
featureRegistry.use('/behavior', behaviorRouter);
featureRegistry.use('/counseling-sessions', counselingSessionsRouter);
featureRegistry.use('/early-warning', earlyWarningRouter);
featureRegistry.use('/holistic-profile', holisticProfileRouter);
featureRegistry.use('/standardized-profile', standardizedProfileRouter);

// =================== COMMUNICATION DOMAIN ===================
featureRegistry.use('/surveys', surveysRouter);
featureRegistry.use('/meeting-notes', meetingNotesRouter);
featureRegistry.use('/documents', documentsRouter);

// =================== SYSTEM DOMAIN ===================
featureRegistry.use('/settings', settingsRouter);
featureRegistry.use('/users', usersRouter);
featureRegistry.use('/search', searchRouter);
featureRegistry.use('/guidance-standards', guidanceStandardsRouter);
featureRegistry.use('/schools', schoolsRouter);

// =================== ANALYTICS DOMAIN ===================
featureRegistry.use('/analytics', analyticsRouter);
featureRegistry.use('/advanced-reports', advancedReportsRouter);

// =================== AI FEATURES ===================
featureRegistry.use('/ai-assistant', aiAssistantRouter);
featureRegistry.use('/ai-suggestions', aiSuggestionsRouter);
// AI utilities (status, text polish, student profile analysis)
import aiUtilitiesRouter from './ai-assistant/routes/ai-utilities.routes.js';
featureRegistry.use('/ai', aiUtilitiesRouter);

// =================== DAILY INSIGHTS & PROACTIVE ALERTS ===================
featureRegistry.use('/daily-insights', dailyInsightsRouter);

// =================== DEEP ANALYSIS ENGINE (Consolidated AI Analysis) ===================
// All AI analysis endpoints unified under /deep-analysis
// Includes: psychological, predictive-timeline, daily-action-plan, student-timeline, comparative, streaming
featureRegistry.use('/deep-analysis', deepAnalysisRouter);

// Legacy route redirect for backward compatibility
featureRegistry.use('/advanced-ai-analysis', deepAnalysisRouter);

// =================== AI-POWERED FEATURES (NEW) ===================
featureRegistry.use('/parent-communication', parentCommunicationRouter);
featureRegistry.use('/reports', reportsRouter);

// =================== NOTIFICATION & AUTOMATION ===================
featureRegistry.use('/notifications', notificationsRouter);
featureRegistry.use('/intervention-tracking', interventionTrackingRouter);

// =================== DATA SECURITY & BACKUP ===================
featureRegistry.use('/backup', backupRouter);

// =================== ENHANCED RISK PREDICTION ===================
featureRegistry.use('/enhanced-risk', enhancedRiskRouter);

// =================== PERSONALIZED LEARNING ===================
featureRegistry.use('/personalized-learning', personalizedLearningRouter);

// =================== ADVANCED ANALYTICS DASHBOARD ===================
featureRegistry.use('/advanced-analytics', advancedAnalyticsRouter);

// =================== SOCIAL NETWORK ANALYSIS ===================
featureRegistry.use('/social-network', socialNetworkRouter);

// =================== CAREER DEVELOPMENT & GUIDANCE ===================
featureRegistry.use('/career-guidance', careerGuidanceRouter);

// =================== LIVE PROFILE SYNC ===================
featureRegistry.use('/profile-sync', profileSyncRouter);

// =================== MEBBIS INTEGRATION ===================
featureRegistry.use('/mebbis', mebbisTransferRouter);

// =================== GUIDANCE TIPS (AI-Powered) ===================
featureRegistry.use('/guidance-tips', guidanceTipsRouter);

export default featureRegistry;
