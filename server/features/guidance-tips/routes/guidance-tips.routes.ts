import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
import { Router, type Request, type Response } from 'express';
import { guidanceTipsService } from '../services/guidance-tips.service.js';
import { triggerManualGeneration } from '../services/guidance-tips-scheduler.service.js';
import { GUIDANCE_TIP_CATEGORIES, CATEGORY_GROUPS } from '../types/guidance-tips.types.js';
import { logger } from '../../../utils/logger.js';
import { sessionTokenService } from '../../../services/session-token.service.js';
import { v4 as uuidv4 } from 'uuid';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

const router = Router();
router.use(validateSchoolAccess);

/**
 * Extract user ID from session token, or generate a unique browser session ID
 * This ensures each user gets their own tip history
 */
function extractUserId(req: Request): string {
  // Try to get from authenticated session token
  const token = req.cookies?.session_token || req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    try {
      const verified = sessionTokenService.verifyToken(token);
      if (verified?.userId) {
        return verified.userId;
      }
    } catch {
      // Token invalid, use fallback
    }
  }
  
  // Fallback: Use browser session cookie for anonymous users
  let sessionId = req.cookies?.guidance_session_id;
  if (!sessionId) {
    sessionId = `session_${uuidv4()}`;
  }
  
  return sessionId;
}

router.get('/next', async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    const forceNew = req.query.forceNew === 'true';
    
    if (!req.cookies?.guidance_session_id && !req.cookies?.session_token) {
      res.cookie('guidance_session_id', userId, {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000,
        sameSite: 'lax'
      });
    }
    
    const tip = await guidanceTipsService.getNextTipForUser(userId, forceNew);
    
    if (!tip) {
      return res.status(404).json({
        success: false,
        error: 'No tips available'
      });
    }

    res.json({
      success: true,
      data: tip
    });
  } catch (error) {
    logger.error('Failed to get next tip', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tip'
    });
  }
});

router.get('/batch', async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    const forceNew = req.query.forceNew === 'true';
    
    if (!req.cookies?.guidance_session_id && !req.cookies?.session_token) {
      res.cookie('guidance_session_id', userId, {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000,
        sameSite: 'lax'
      });
    }
    
    logger.info(`Batch request from user ${userId}, forceNew: ${forceNew}`, 'GuidanceTipsRoutes');
    
    const batchResult = await guidanceTipsService.getOrGenerateBatch(userId, forceNew);
    
    if (batchResult.tips.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No tips available'
      });
    }

    res.json({
      success: true,
      data: batchResult
    });
  } catch (error) {
    logger.error('Failed to get batch tips', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get batch tips'
    });
  }
});

router.post('/batch/mark-viewed', async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    const { tipIds } = req.body;
    
    if (!Array.isArray(tipIds)) {
      return res.status(400).json({
        success: false,
        error: 'tipIds must be an array'
      });
    }

    for (const tipId of tipIds) {
      guidanceTipsService.dismissTip(tipId, userId);
    }
    
    logger.info(`Marked ${tipIds.length} tips as viewed for user ${userId}`, 'GuidanceTipsRoutes');

    res.json({
      success: true,
      message: `${tipIds.length} tips marked as viewed`
    });
  } catch (error) {
    logger.error('Failed to mark tips as viewed', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark tips as viewed'
    });
  }
});

router.get('/latest', async (_req: Request, res: Response) => {
  try {
    const tip = guidanceTipsService.getLatestTip();
    
    if (!tip) {
      return res.status(404).json({
        success: false,
        error: 'No tips available'
      });
    }

    res.json({
      success: true,
      data: tip
    });
  } catch (error) {
    logger.error('Failed to get latest tip', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tip'
    });
  }
});

router.get('/all', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const category = req.query.category as string;
    
    let tips;
    if (category) {
      tips = guidanceTipsService.getTipsByCategory(category, limit);
    } else {
      tips = guidanceTipsService.getAllTips(limit);
    }

    res.json({
      success: true,
      data: tips,
      count: tips.length
    });
  } catch (error) {
    logger.error('Failed to get all tips', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get tips'
    });
  }
});

router.get('/categories', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: GUIDANCE_TIP_CATEGORIES,
    groups: CATEGORY_GROUPS
  });
});

router.get('/stats', (_req: Request, res: Response) => {
  try {
    const count = guidanceTipsService.getTipCount();
    
    res.json({
      success: true,
      data: {
        totalTips: count,
        categories: GUIDANCE_TIP_CATEGORIES.length,
        groups: CATEGORY_GROUPS.length
      }
    });
  } catch (error) {
    logger.error('Failed to get tip stats', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get stats'
    });
  }
});

router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    const preferences = guidanceTipsService.getUserPreferences(userId);
    
    if (!preferences) {
      const defaultCategories = guidanceTipsService.getDefaultCategories();
      return res.json({
        success: true,
        data: {
          userId,
          enabledCategories: defaultCategories,
          isDefault: true
        }
      });
    }

    res.json({
      success: true,
      data: {
        ...preferences,
        isDefault: false
      }
    });
  } catch (error) {
    logger.error('Failed to get user preferences', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get preferences'
    });
  }
});

router.post('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    const { enabledCategories } = req.body;
    
    if (!Array.isArray(enabledCategories)) {
      return res.status(400).json({
        success: false,
        error: 'enabledCategories must be an array'
      });
    }

    if (enabledCategories.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one category must be enabled'
      });
    }

    const validCategories = GUIDANCE_TIP_CATEGORIES.map(c => c.value);
    const invalidCategories = enabledCategories.filter(c => !validCategories.includes(c));
    
    if (invalidCategories.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Invalid categories: ${invalidCategories.join(', ')}`
      });
    }

    const preferences = guidanceTipsService.saveUserPreferences(userId, enabledCategories);
    
    logger.info(`User ${userId} updated tip preferences: ${enabledCategories.length} categories enabled`, 'GuidanceTipsRoutes');

    res.json({
      success: true,
      data: preferences,
      message: 'Preferences saved successfully'
    });
  } catch (error) {
    logger.error('Failed to save user preferences', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save preferences'
    });
  }
});

router.post('/dismiss/:tipId', async (req: Request, res: Response) => {
  try {
    const { tipId } = req.params;
    const userId = extractUserId(req);
    
    guidanceTipsService.dismissTip(tipId, userId);
    
    res.json({
      success: true,
      message: 'Tip dismissed'
    });
  } catch (error) {
    logger.error('Failed to dismiss tip', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to dismiss tip'
    });
  }
});

router.post('/rate/:tipId', async (req: Request, res: Response) => {
  try {
    const { tipId } = req.params;
    const { rating } = req.body;
    const userId = extractUserId(req);
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        error: 'Rating must be between 1 and 5'
      });
    }
    
    guidanceTipsService.rateTip(tipId, userId, rating);
    
    res.json({
      success: true,
      message: 'Tip rated'
    });
  } catch (error) {
    logger.error('Failed to rate tip', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to rate tip'
    });
  }
});

router.post('/generate', async (_req: Request, res: Response) => {
  try {
    await triggerManualGeneration();
    
    res.json({
      success: true,
      message: 'Tip generation triggered'
    });
  } catch (error) {
    logger.error('Failed to trigger generation', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to trigger generation'
    });
  }
});

// Clear viewed tips for a user (for testing/reset)
router.post('/reset-views', async (req: Request, res: Response) => {
  try {
    const userId = extractUserId(req);
    guidanceTipsService.resetUserViews(userId);
    
    res.json({
      success: true,
      message: 'View history reset'
    });
  } catch (error) {
    logger.error('Failed to reset views', 'GuidanceTipsRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset views'
    });
  }
});

export default router;
