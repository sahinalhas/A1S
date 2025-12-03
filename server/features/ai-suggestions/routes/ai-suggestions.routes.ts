import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
/**
 * AI Suggestions API Routes
 * AI öneri sistemi için API endpoint'leri
 */

import { Router, type Request, type Response } from 'express';
import { SuggestionQueueService } from '../services/suggestion-queue.service.js';
import type { CreateSuggestionRequest, ReviewSuggestionRequest, SuggestionFilters } from '../../../../shared/types/ai-suggestion.types.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

const router = Router();
router.use(validateSchoolAccess);
const suggestionService = SuggestionQueueService.getInstance();

/**
 * GET /api/ai-suggestions/pending
 * Bekleyen tüm önerileri getir
 */
router.get('/pending', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
    const suggestions = suggestionService.getAllPendingSuggestions(limit);
    
    res.json({
      success: true,
      data: suggestions,
      count: suggestions.length
    });
  } catch (error: unknown) {
    console.error('Error fetching pending suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Öneriler alınamadı',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/ai-suggestions/student/:studentId
 * Belirli bir öğrenci için bekleyen önerileri getir
 */
router.get('/student/:studentId', async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const suggestions = suggestionService.getPendingSuggestionsForStudent(studentId);
    
    res.json({
      success: true,
      data: suggestions,
      count: suggestions.length
    });
  } catch (error: unknown) {
    console.error('Error fetching student suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Öğrenci önerileri alınamadı',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/ai-suggestions/stats
 * Öneri istatistikleri
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = suggestionService.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error: unknown) {
    console.error('Error fetching suggestion stats:', error);
    res.status(500).json({
      success: false,
      error: 'İstatistikler alınamadı',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * GET /api/ai-suggestions/:id
 * Belirli bir öneriyi getir
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const suggestion = suggestionService.getSuggestionById(id);
    
    if (!suggestion) {
      return res.status(404).json({
        success: false,
        error: 'Öneri bulunamadı'
      });
    }
    
    res.json({
      success: true,
      data: suggestion
    });
  } catch (error: unknown) {
    console.error('Error fetching suggestion:', error);
    res.status(500).json({
      success: false,
      error: 'Öneri alınamadı',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/ai-suggestions/search
 * Filtrelerle öneri ara
 */
router.post('/search', async (req: Request, res: Response) => {
  try {
    const filters: SuggestionFilters = req.body;
    const suggestions = suggestionService.searchSuggestions(filters);
    
    res.json({
      success: true,
      data: suggestions,
      count: suggestions.length
    });
  } catch (error: unknown) {
    console.error('Error searching suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Öneri araması yapılamadı',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/ai-suggestions/create
 * Yeni öneri oluştur (genelde sistem tarafından kullanılır)
 */
router.post('/create', async (req: Request, res: Response) => {
  try {
    const request: CreateSuggestionRequest = req.body;
    const suggestionId = await suggestionService.createSuggestion(request);
    
    res.json({
      success: true,
      data: {
        id: suggestionId
      },
      message: 'Öneri oluşturuldu'
    });
  } catch (error: unknown) {
    console.error('Error creating suggestion:', error);
    res.status(500).json({
      success: false,
      error: 'Öneri oluşturulamadı',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/ai-suggestions/:id/approve
 * Öneriyi onayla
 */
router.post('/:id/approve', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewedBy, reviewNotes, feedbackRating, feedbackNotes } = req.body;
    
    if (!reviewedBy) {
      return res.status(400).json({
        success: false,
        error: 'reviewedBy alanı gerekli'
      });
    }
    
    await suggestionService.approveSuggestion(
      id,
      reviewedBy,
      reviewNotes,
      feedbackRating,
      feedbackNotes
    );
    
    res.json({
      success: true,
      message: 'Öneri onaylandı ve uygulandı'
    });
  } catch (error: unknown) {
    console.error('Error approving suggestion:', error);
    res.status(500).json({
      success: false,
      error: 'Öneri onaylanamadı',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/ai-suggestions/:id/reject
 * Öneriyi reddet
 */
router.post('/:id/reject', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewedBy, reviewNotes, feedbackRating, feedbackNotes } = req.body;
    
    if (!reviewedBy) {
      return res.status(400).json({
        success: false,
        error: 'reviewedBy alanı gerekli'
      });
    }
    
    await suggestionService.rejectSuggestion(
      id,
      reviewedBy,
      reviewNotes,
      feedbackRating,
      feedbackNotes
    );
    
    res.json({
      success: true,
      message: 'Öneri reddedildi'
    });
  } catch (error: unknown) {
    console.error('Error rejecting suggestion:', error);
    res.status(500).json({
      success: false,
      error: 'Öneri reddedilemedi',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/ai-suggestions/:id/modify
 * Öneriyi düzenle ve uygula
 */
router.post('/:id/modify', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewedBy, modifiedChanges, reviewNotes, feedbackRating, feedbackNotes } = req.body;
    
    if (!reviewedBy || !modifiedChanges) {
      return res.status(400).json({
        success: false,
        error: 'reviewedBy ve modifiedChanges alanları gerekli'
      });
    }
    
    await suggestionService.modifySuggestion(
      id,
      reviewedBy,
      modifiedChanges,
      reviewNotes,
      feedbackRating,
      feedbackNotes
    );
    
    res.json({
      success: true,
      message: 'Öneri düzenlendi ve uygulandı'
    });
  } catch (error: unknown) {
    console.error('Error modifying suggestion:', error);
    res.status(500).json({
      success: false,
      error: 'Öneri düzenlenemedi',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/ai-suggestions/:id/review
 * Öneriyi incele (onayla/reddet/düzenle)
 */
router.post('/:id/review', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const reviewRequest: ReviewSuggestionRequest = {
      suggestionId: id,
      ...req.body
    };
    
    await suggestionService.reviewSuggestion(reviewRequest);
    
    res.json({
      success: true,
      message: 'Öneri incelendi'
    });
  } catch (error: unknown) {
    console.error('Error reviewing suggestion:', error);
    res.status(500).json({
      success: false,
      error: 'Öneri incelenemedi',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/ai-suggestions/cleanup
 * Süresi dolmuş önerileri temizle
 */
router.post('/cleanup', async (req: Request, res: Response) => {
  try {
    const cleanedCount = suggestionService.cleanupExpiredSuggestions();
    
    res.json({
      success: true,
      message: `${cleanedCount} süresi dolmuş öneri temizlendi`,
      data: { cleanedCount }
    });
  } catch (error: unknown) {
    console.error('Error cleaning up suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Temizlik yapılamadı',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * POST /api/ai-suggestions/bulk-create
 * Toplu öneri oluştur
 */
router.post('/bulk-create', async (req: Request, res: Response) => {
  try {
    const requests: CreateSuggestionRequest[] = req.body.suggestions;
    
    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'suggestions dizisi gerekli'
      });
    }
    
    const suggestionIds = await suggestionService.createBulkSuggestions(requests);
    
    res.json({
      success: true,
      data: { ids: suggestionIds },
      message: `${suggestionIds.length} öneri oluşturuldu`
    });
  } catch (error: unknown) {
    console.error('Error creating bulk suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Toplu öneri oluşturulamadı',
      message: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
