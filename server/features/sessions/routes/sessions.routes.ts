import { RequestHandler } from 'express';
import * as sessionsService from '../services/sessions.service.js';
import { logger } from '../../../utils/logger.js';
import type { StudentIdParam, SessionInput } from '../../../../shared/validation/sessions.validation.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';

export const getStudySessions: RequestHandler = (req, res) => {
  try {
    const { studentId } = req.params as StudentIdParam;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    const sessions = sessionsService.getStudentSessions(studentId, schoolId);
    res.json(sessions);
  } catch (error) {
    logger.error('Error getting study sessions', 'SessionsRoutes', error);
    res.status(500).json({ success: false, error: 'Failed to get study sessions' });
  }
};

export const saveStudySession: RequestHandler = (req, res) => {
  try {
    const sessionInput = req.body as SessionInput;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!schoolId) {
      res.status(400).json({ success: false, error: 'School ID is required' });
      return;
    }
    
    const result = sessionsService.createStudySession(sessionInput, schoolId);
    res.json(result);
  } catch (error) {
    logger.error('Error saving study session', 'SessionsRoutes', error);
    res.status(500).json({ success: false, error: 'Failed to save study session' });
  }
};
