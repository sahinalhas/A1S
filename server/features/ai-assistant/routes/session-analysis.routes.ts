import { Router } from 'express';
import { aiSessionAnalysisRequestSchema } from '../../../../shared/schemas/ai-session-analysis.schemas.js';
import { AISessionAnalyzerService } from '../../../services/ai-session-analyzer.service.js';
import { requireAIEnabled } from '../../../middleware/ai-guard.middleware.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

const router = Router();
router.use(validateSchoolAccess);

router.post('/analyze-session', requireAIEnabled, async (req, res) => {
  try {
    const validatedData = aiSessionAnalysisRequestSchema.parse(req.body);

    const analyzer = new AISessionAnalyzerService();
    const analysis = await analyzer.analyzeSession(validatedData);

    res.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Session analysis API error:', error);

    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz istek verisi',
        details: error.errors
      });
    }

    if (error.message?.includes('timeout') || error.message?.includes('AI request timeout')) {
      return res.status(504).json({
        success: false,
        error: 'AI isteği zaman aşımına uğradı. Lütfen tekrar deneyin.'
      });
    }

    if (error.message?.includes('overloaded') || error.status === 503 || error.message?.includes('503')) {
      return res.status(503).json({
        success: false,
        error: 'AI servisi şu anda yoğun. Lütfen birkaç saniye sonra tekrar deneyin.'
      });
    }

    if (error.message?.includes('API key') || error.message?.includes('GEMINI_API_KEY')) {
      return res.status(500).json({
        success: false,
        error: 'AI servisi yapılandırma hatası. Lütfen sistem yöneticisine başvurun.'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Analiz sırasında bir hata oluştu'
    });
  }
});

export default router;
