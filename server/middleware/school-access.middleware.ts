import { Request, Response, NextFunction } from 'express';
import { getUserSchoolIds } from '../features/schools/repository/schools.repository.js';
import { logger } from '../utils/logger.js';
import type { AuthenticatedRequest } from './auth-secure.middleware.js';

export interface SchoolScopedRequest extends AuthenticatedRequest {
  schoolId?: string;
  userSchoolIds?: string[];
}

export function validateSchoolAccess(req: Request, res: Response, next: NextFunction): void {
  const authReq = req as SchoolScopedRequest;
  
  if (!authReq.user) {
    res.status(401).json({ 
      error: 'Authentication required',
      code: 'AUTHENTICATION_ERROR'
    });
    return;
  }

  const schoolId = req.headers['x-school-id'] as string;
  
  if (!schoolId) {
    res.status(400).json({ 
      error: 'School selection required',
      code: 'SCHOOL_NOT_SELECTED'
    });
    return;
  }

  try {
    const userSchoolIds = getUserSchoolIds(authReq.user.id);
    
    if (!userSchoolIds.includes(schoolId)) {
      logger.warn('Unauthorized school access attempt', 'SchoolAccessMiddleware', {
        userId: authReq.user.id,
        requestedSchoolId: schoolId,
        allowedSchools: userSchoolIds
      });
      
      res.status(403).json({ 
        error: 'You do not have access to this school',
        code: 'SCHOOL_ACCESS_DENIED'
      });
      return;
    }

    authReq.schoolId = schoolId;
    authReq.userSchoolIds = userSchoolIds;
    
    next();
  } catch (error) {
    logger.error('Error validating school access', 'SchoolAccessMiddleware', error);
    res.status(500).json({ 
      error: 'Failed to validate school access',
      code: 'INTERNAL_ERROR'
    });
  }
}

export function optionalSchoolAccess(req: Request, res: Response, next: NextFunction): void {
  const authReq = req as SchoolScopedRequest;
  
  if (!authReq.user) {
    next();
    return;
  }

  const schoolId = req.headers['x-school-id'] as string;
  
  if (schoolId) {
    try {
      const userSchoolIds = getUserSchoolIds(authReq.user.id);
      
      if (userSchoolIds.includes(schoolId)) {
        authReq.schoolId = schoolId;
        authReq.userSchoolIds = userSchoolIds;
      }
    } catch (error) {
      logger.error('Error in optional school access', 'SchoolAccessMiddleware', error);
    }
  }
  
  next();
}
