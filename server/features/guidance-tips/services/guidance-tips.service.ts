import { guidanceTipsRepository } from '../repository/guidance-tips.repository.js';
import { guidanceTipsAIService } from './guidance-tips-ai.service.js';
import type { GuidanceTip, GuidanceTipCategory, UserCategoryPreferences } from '../types/guidance-tips.types.js';
import { GUIDANCE_TIP_CATEGORIES } from '../types/guidance-tips.types.js';
import { logger } from '../../../utils/logger.js';

export interface TipBatchResponse {
  tips: GuidanceTip[];
  totalCount: number;
  remainingInQueue: number;
  batchId: string;
  generatedAt: string;
}

class GuidanceTipsService {
  private readonly DEFAULT_BATCH_SIZE = 15;
  private readonly MIN_QUEUE_THRESHOLD = 3;

  async generateBatchTips(
    userId: string, 
    count: number = this.DEFAULT_BATCH_SIZE
  ): Promise<TipBatchResponse> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generatedAt = new Date().toISOString();
    
    try {
      const preferences = guidanceTipsRepository.getUserPreferences(userId);
      const enabledCategories = preferences?.enabledCategories;

      const result = await guidanceTipsAIService.generateBatchTips(count, enabledCategories);
      
      const savedTips: GuidanceTip[] = [];
      for (const tipContent of result.tips) {
        const tip = guidanceTipsRepository.createTip(tipContent);
        savedTips.push(tip);
      }

      logger.info(`Batch generated ${savedTips.length} tips for user ${userId} (batchId: ${batchId})`, 'GuidanceTipsService');

      return {
        tips: savedTips,
        totalCount: savedTips.length,
        remainingInQueue: savedTips.length,
        batchId,
        generatedAt
      };
    } catch (error) {
      logger.error('Failed to generate batch tips', 'GuidanceTipsService', error);
      return {
        tips: [],
        totalCount: 0,
        remainingInQueue: 0,
        batchId,
        generatedAt
      };
    }
  }

  async getOrGenerateBatch(
    userId: string, 
    forceNew: boolean = false
  ): Promise<TipBatchResponse> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generatedAt = new Date().toISOString();
    
    try {
      const preferences = guidanceTipsRepository.getUserPreferences(userId);
      const enabledCategories = preferences?.enabledCategories;

      const unseenTips = guidanceTipsRepository.getUnseenTipsForUser(userId, this.DEFAULT_BATCH_SIZE, enabledCategories);
      
      if (!forceNew && unseenTips.length >= this.MIN_QUEUE_THRESHOLD) {
        logger.info(`Returning ${unseenTips.length} unseen tips for user ${userId}`, 'GuidanceTipsService');
        return {
          tips: unseenTips,
          totalCount: unseenTips.length,
          remainingInQueue: unseenTips.length,
          batchId,
          generatedAt
        };
      }

      logger.info(`Not enough unseen tips (${unseenTips.length}), generating new batch for user ${userId}`, 'GuidanceTipsService');
      
      const batchResult = await this.generateBatchTips(userId, this.DEFAULT_BATCH_SIZE);
      
      const allTips = [...unseenTips, ...batchResult.tips];
      
      return {
        tips: allTips,
        totalCount: allTips.length,
        remainingInQueue: allTips.length,
        batchId,
        generatedAt
      };
    } catch (error) {
      logger.error('Failed to get or generate batch', 'GuidanceTipsService', error);
      return {
        tips: [],
        totalCount: 0,
        remainingInQueue: 0,
        batchId,
        generatedAt
      };
    }
  }

  async generateNewTip(preferredCategory?: GuidanceTipCategory): Promise<GuidanceTip | null> {
    try {
      const generatedContent = await guidanceTipsAIService.generateRandomTip(preferredCategory);
      
      if (!generatedContent) {
        logger.warn('AI failed to generate tip content', 'GuidanceTipsService');
        return null;
      }

      const tip = guidanceTipsRepository.createTip(generatedContent);
      logger.info(`New guidance tip created: ${tip.id}`, 'GuidanceTipsService');
      
      return tip;
    } catch (error) {
      logger.error('Failed to generate new tip', 'GuidanceTipsService', error);
      return null;
    }
  }

  getUserPreferences(userId: string): UserCategoryPreferences | null {
    return guidanceTipsRepository.getUserPreferences(userId);
  }

  saveUserPreferences(userId: string, categories: GuidanceTipCategory[]): UserCategoryPreferences {
    return guidanceTipsRepository.saveUserPreferences(userId, categories);
  }

  getDefaultCategories(): GuidanceTipCategory[] {
    return GUIDANCE_TIP_CATEGORIES.map(c => c.value);
  }

  async getNextTipForUser(userId: string, forceNew: boolean = false): Promise<GuidanceTip | null> {
    try {
      const preferences = guidanceTipsRepository.getUserPreferences(userId);
      const enabledCategories = preferences?.enabledCategories;
      
      // If forceNew is true, always generate a fresh AI tip
      if (forceNew) {
        logger.info(`Force generating new tip for user ${userId}`, 'GuidanceTipsService');
        const randomCategory = enabledCategories && enabledCategories.length > 0
          ? enabledCategories[Math.floor(Math.random() * enabledCategories.length)]
          : undefined;
        const newTip = await this.generateNewTip(randomCategory);
        if (newTip) {
          guidanceTipsRepository.markTipAsViewed(newTip.id, userId);
          return newTip;
        }
      }
      
      // Try to get an unseen tip first
      let tip = guidanceTipsRepository.getRandomUnseenTipWithPreferences(userId, enabledCategories);
      
      if (!tip) {
        // No unseen tips - generate a new one
        logger.info(`No unseen tips for user ${userId}, generating new one`, 'GuidanceTipsService');
        const randomCategory = enabledCategories && enabledCategories.length > 0
          ? enabledCategories[Math.floor(Math.random() * enabledCategories.length)]
          : undefined;
        tip = await this.generateNewTip(randomCategory);
      }

      if (tip) {
        guidanceTipsRepository.markTipAsViewed(tip.id, userId);
      }

      return tip;
    } catch (error) {
      logger.error('Failed to get next tip for user', 'GuidanceTipsService', error);
      return null;
    }
  }

  getLatestTip(): GuidanceTip | null {
    return guidanceTipsRepository.getLatestTip();
  }

  getAllTips(limit: number = 50): GuidanceTip[] {
    return guidanceTipsRepository.getAllActiveTips(limit);
  }

  getTipsByCategory(category: string, limit: number = 20): GuidanceTip[] {
    return guidanceTipsRepository.getTipsByCategory(category, limit);
  }

  dismissTip(tipId: string, userId: string): void {
    guidanceTipsRepository.dismissTip(tipId, userId);
    logger.info(`Tip ${tipId} dismissed by user ${userId}`, 'GuidanceTipsService');
  }

  rateTip(tipId: string, userId: string, rating: number): void {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    guidanceTipsRepository.rateTip(tipId, userId, rating);
    logger.info(`Tip ${tipId} rated ${rating} by user ${userId}`, 'GuidanceTipsService');
  }

  getTipCount(): number {
    return guidanceTipsRepository.getTipCount();
  }

  cleanupOldTips(daysOld: number = 90): number {
    try {
      const deleted = guidanceTipsRepository.deleteOldTips(daysOld);
      logger.info(`Cleaned up ${deleted} tips older than ${daysOld} days`, 'GuidanceTipsService');
      return deleted;
    } catch (error) {
      logger.error(`Failed to cleanup old tips`, 'GuidanceTipsService', error);
      return 0;
    }
  }

  resetUserViews(userId: string): void {
    guidanceTipsRepository.resetUserViews(userId);
    logger.info(`View history reset for user ${userId}`, 'GuidanceTipsService');
  }
}

export const guidanceTipsService = new GuidanceTipsService();
