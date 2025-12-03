/**
 * AI Utilities Routes
 * Status checking, text polishing, profile analysis consolidation
 */

import { Router } from 'express';
import { z } from 'zod';
import { AIProviderService } from '../../../services/ai-provider.service.js';
import { UnifiedScoringEngine } from '../../../services/unified-scoring-engine.service.js';
import { AIProfileAnalyzerService } from '../../../services/ai-profile-analyzer.service.js';
import { CounselorPrompts } from '../../../prompts/counselor-prompts.js';
import { logger } from '../../../utils/logger.js';

const router = Router();

/**
 * GET /api/ai/status
 * AI provider status bilgisi
 */
router.get('/status', async (_req, res) => {
  try {
    const aiService = AIProviderService.getInstance();
    const provider = aiService.getProvider();
    const model = aiService.getModel();
    const isAvailable = await aiService.isAvailable();
    
    res.json({
      isActive: isAvailable,
      provider: provider,
      model: model,
      providerName: provider === 'gemini' ? 'Gemini' : 
                    provider === 'openai' ? 'OpenAI' : 
                    provider === 'ollama' ? 'Ollama' : provider,
      status: isAvailable ? 'healthy' : 'unavailable'
    });
  } catch (error) {
    res.json({
      isActive: false,
      provider: null,
      model: null,
      providerName: 'Devre Dışı',
      status: 'error'
    });
  }
});

/**
 * POST /api/ai/polish-text
 * Metin temizleme ve düzenleme
 */
const polishTextSchema = z.object({
  text: z.string().min(1, 'Metin boş olamaz').max(10000, 'Metin çok uzun'),
  context: z.enum(['academic', 'counseling', 'notes', 'general']).optional(),
});

router.post('/polish-text', async (req, res) => {
  try {
    const { text, context = 'general' } = polishTextSchema.parse(req.body);
    const systemPrompt = `${CounselorPrompts.systemPrompt()}\n\n${CounselorPrompts.textPolish(context)}`;

    const response = await AIProviderService.getInstance().chat({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    });

    res.json({
      success: true,
      originalText: text,
      polishedText: response.trim(),
    });
  } catch (error) {
    logger.error('Text polish error', 'AIUtilitiesRoutes', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz veri formatı',
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: 'Metin temizlenirken bir hata oluştu',
    });
  }
});

/**
 * GET /api/ai/student-profile/:studentId/scores
 * Öğrenci profil skorları
 */
router.get('/student-profile/:studentId/scores', async (req, res) => {
  try {
    const { studentId } = req.params;
    const scoringEngine = new UnifiedScoringEngine();

    const [scores, completeness] = await Promise.all([
      scoringEngine.calculateUnifiedScores(studentId),
      scoringEngine.calculateProfileCompleteness(studentId)
    ]);

    res.json({
      success: true,
      data: {
        scores,
        completeness
      }
    });
  } catch (error) {
    logger.error('Error fetching student scores', 'AIUtilitiesRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate student scores'
    });
  }
});

/**
 * GET /api/ai/student-profile/:studentId/ai-analysis
 * AI destekli profil analizi
 */
router.get('/student-profile/:studentId/ai-analysis', async (req, res) => {
  try {
    const { studentId } = req.params;
    const scoringEngine = new UnifiedScoringEngine();
    const aiAnalyzer = new AIProfileAnalyzerService();

    const [scores, completeness] = await Promise.all([
      scoringEngine.calculateUnifiedScores(studentId),
      scoringEngine.calculateProfileCompleteness(studentId)
    ]);

    const analysis = await aiAnalyzer.analyzeProfile(scores, completeness);

    res.json({
      success: true,
      data: {
        analysis,
        scores,
        completeness
      }
    });
  } catch (error) {
    logger.error('Error generating AI analysis', 'AIUtilitiesRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate AI analysis'
    });
  }
});

/**
 * POST /api/ai/student-profile/:studentId/recalculate-scores
 * Skorları yeniden hesapla
 */
router.post('/student-profile/:studentId/recalculate-scores', async (req, res) => {
  try {
    const { studentId } = req.params;
    const scoringEngine = new UnifiedScoringEngine();

    const scores = await scoringEngine.calculateUnifiedScores(studentId);
    await scoringEngine.saveAggregateScores(studentId, scores);

    res.json({
      success: true,
      message: 'Scores recalculated successfully',
      data: { scores }
    });
  } catch (error) {
    logger.error('Error recalculating scores', 'AIUtilitiesRoutes', error);
    res.status(500).json({
      success: false,
      error: 'Failed to recalculate scores'
    });
  }
});

export default router;
