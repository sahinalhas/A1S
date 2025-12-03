import { Request, Response, NextFunction } from 'express';
import * as searchService from '../services/search.service.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

export async function globalSearch(req: Request, res: Response, next: NextFunction) {
  try {
    const query = req.query.q as string;
    const schoolId = (req as SchoolScopedRequest).schoolId;
    
    if (!query || query.trim().length < 2) {
      return res.json({
        students: [],
        counselingSessions: [],
        surveys: [],
        pages: []
      });
    }

    const results = schoolId 
      ? await searchService.performGlobalSearchBySchool(query.trim(), schoolId)
      : await searchService.performGlobalSearch(query.trim());
    res.json(results);
  } catch (error) {
    next(error);
  }
}
