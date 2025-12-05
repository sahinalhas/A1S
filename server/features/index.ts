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
import sessionsRouter from './sessions/index.js';
import specialEducationRouter from './special-education/index.js';
import behaviorRouter from './behavior/index.js';
import counselingSessionsRouter from './counseling-sessions/index.js';
import usersRouter from './users/index.js';
import dailyInsightsRouter from './daily-insights/index.js';
import parentCommunicationRouter from './parent-communication/index.js';
import notificationsRouter from './notifications/index.js';
import interventionTrackingRouter from './intervention-tracking/index.js';
import backupRouter from './backup/routes/backup.routes.js';
import personalizedLearningRouter from './personalized-learning/index.js';
import socialNetworkRouter from './social-network/index.js';
import searchRouter from './search/index.js';
import careerGuidanceRouter from './career-guidance/index.js';
import profileSyncRouter from './profile-sync/index.js';
import guidanceStandardsRouter from './guidance-standards/index.js';
import mebbisTransferRouter from './mebbis-transfer/index.js';
import guidanceTipsRouter from './guidance-tips/index.js';
import schoolsRouter from './schools/index.js';

import examsRouter from './exam-management/index.js';

import studentProfileRouter from './student-profile/index.js';

import aiServicesRouter from './ai-services/index.js';

import riskManagementRouter from './risk-management/index.js';

import analyticsRouter from './analytics/index.js';

import reportsRouter from './reports/index.js';

/**
 * Feature Registry - Consolidated Module Organization
 * 
 * MODULE CONSOLIDATION COMPLETE:
 * - exams + exam-management -> exam-management (unified exams module)
 * - standardized-profile + holistic-profile -> student-profile
 * - ai-assistant + ai-suggestions + deep-analysis -> ai-services
 * - enhanced-risk + early-warning -> risk-management
 * - analytics + advanced-analytics -> analytics (with /advanced subroutes)
 * - reports + advanced-reports -> reports (with /advanced subroutes)
 * 
 * Standard Feature Structure:
 * server/features/<feature-name>/
 *   ├── routes/      - Express route handlers and endpoint definitions
 *   ├── services/    - Business logic and orchestration
 *   ├── repository/  - Data access layer (database operations)
 *   ├── types/       - TypeScript type definitions and interfaces
 *   └── index.ts     - Feature router export (aggregates routes)
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
 *    - exams: Exam management, results, statistics, AI analysis
 *    - coaching: Academic goals, SMART goals, 360 evaluations
 *    - sessions: Study sessions CRUD
 *    - study: Study assignments and weekly slots
 * 
 * 3. STUDENT SUPPORT DOMAIN - Wellbeing and specialized services
 *    - special-education: IEP/BEP records, RAM reports, support services
 *    - behavior: Behavior incidents, statistics
 *    - counseling-sessions: Individual/group counseling sessions
 *    - student-profile: Consolidated student profiles (standardized + holistic)
 *    - risk-management: Risk assessment, early warning, alerts
 * 
 * 4. COMMUNICATION DOMAIN - Engagement and feedback
 *    - surveys: Templates, questions, distributions, responses, analytics
 *    - meeting-notes: Meeting notes CRUD
 *    - documents: Student documents CRUD
 *    - parent-communication: Parent engagement features
 * 
 * 5. SYSTEM DOMAIN - Configuration and authentication
 *    - settings: App settings management
 *    - users: User management
 *    - schools: School management
 *    - search: Global search
 * 
 * 6. AI SERVICES DOMAIN - Unified AI capabilities
 *    - ai-services: Chat, suggestions, deep analysis, recommendations
 * 
 * 7. ANALYTICS & REPORTING DOMAIN - Data insights
 *    - analytics: Basic + advanced analytics
 *    - reports: Auto reports + advanced reports
 */

// =================== CORE DOMAIN ===================
featureRegistry.use('/students', studentsRouter);

// =================== ACADEMIC DOMAIN ===================
featureRegistry.use('/subjects', subjectsRouter);
featureRegistry.use('/progress', progressRouter);
featureRegistry.use('/attendance', attendanceRouter);
featureRegistry.use('/exams', examsRouter);
featureRegistry.use('/exam-management', examsRouter);
featureRegistry.use('/coaching', coachingRouter);
featureRegistry.use('/study-sessions', sessionsRouter);
featureRegistry.use('/study', studyRouter);

// =================== STUDENT SUPPORT DOMAIN ===================
featureRegistry.use('/special-education', specialEducationRouter);
featureRegistry.use('/behavior', behaviorRouter);
featureRegistry.use('/counseling-sessions', counselingSessionsRouter);
featureRegistry.use('/student-profile', studentProfileRouter);
featureRegistry.use('/holistic-profile', studentProfileRouter);
featureRegistry.use('/standardized-profile', studentProfileRouter);
featureRegistry.use('/risk-management', riskManagementRouter);
featureRegistry.use('/early-warning', riskManagementRouter);
featureRegistry.use('/enhanced-risk', riskManagementRouter);

// =================== COMMUNICATION DOMAIN ===================
featureRegistry.use('/surveys', surveysRouter);
featureRegistry.use('/meeting-notes', meetingNotesRouter);
featureRegistry.use('/documents', documentsRouter);
featureRegistry.use('/parent-communication', parentCommunicationRouter);

// =================== SYSTEM DOMAIN ===================
featureRegistry.use('/settings', settingsRouter);
featureRegistry.use('/users', usersRouter);
featureRegistry.use('/search', searchRouter);
featureRegistry.use('/guidance-standards', guidanceStandardsRouter);
featureRegistry.use('/schools', schoolsRouter);
featureRegistry.use('/backup', backupRouter);

// =================== AI SERVICES DOMAIN (CONSOLIDATED) ===================
featureRegistry.use('/ai-services', aiServicesRouter);
featureRegistry.use('/ai-assistant', aiServicesRouter);
featureRegistry.use('/ai-suggestions', aiServicesRouter);
featureRegistry.use('/deep-analysis', aiServicesRouter);
featureRegistry.use('/advanced-ai-analysis', aiServicesRouter);
import aiUtilitiesRouter from './ai-assistant/routes/ai-utilities.routes.js';
featureRegistry.use('/ai', aiUtilitiesRouter);

// =================== ANALYTICS & REPORTING DOMAIN (CONSOLIDATED) ===================
featureRegistry.use('/analytics', analyticsRouter);
featureRegistry.use('/advanced-analytics', analyticsRouter);
featureRegistry.use('/reports', reportsRouter);
featureRegistry.use('/advanced-reports', reportsRouter);

// =================== DAILY INSIGHTS ===================
featureRegistry.use('/daily-insights', dailyInsightsRouter);

// =================== NOTIFICATIONS ===================
featureRegistry.use('/notifications', notificationsRouter);
featureRegistry.use('/intervention-tracking', interventionTrackingRouter);

// =================== OTHER FEATURES ===================
featureRegistry.use('/personalized-learning', personalizedLearningRouter);
featureRegistry.use('/social-network', socialNetworkRouter);
featureRegistry.use('/career-guidance', careerGuidanceRouter);
featureRegistry.use('/profile-sync', profileSyncRouter);
featureRegistry.use('/mebbis', mebbisTransferRouter);
featureRegistry.use('/guidance-tips', guidanceTipsRouter);

export default featureRegistry;
