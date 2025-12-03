/**
 * AI Assistant Routes
 * AI Rehber Öğretmen Asistan API Endpoint'leri
 */

import express from 'express';
import { AIProviderService } from '../../../services/ai-provider.service.js';
import { StudentContextService } from '../../../services/student-context.service.js';
import { OllamaAPIService } from '../../../services/ollama-api.service.js';
import { CounselorPrompts } from '../../../prompts/counselor-prompts.js';
import { sanitizeAIRequest } from '../../../middleware/validation.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
import { requireAIEnabled } from '../../../middleware/ai-guard.middleware.js';

const router = express.Router();
router.use(validateSchoolAccess);
const contextService = new StudentContextService();
const ollamaService = new OllamaAPIService();

// Her istekte güncel provider instance'ını al
const getAIProvider = () => AIProviderService.getInstance();

/**
 * GET /api/ai-assistant/models
 * List available AI models
 */
router.get('/models', async (req, res) => {
  try {
    const aiProvider = getAIProvider();
    const provider = aiProvider.getProvider();
    const currentModel = aiProvider.getModel();
    
    let models: string[] = [];
    let isAvailable = false;
    
    try {
      models = await aiProvider.listModels();
      isAvailable = true;
    } catch (modelError) {
      console.error('Error listing models:', modelError);
      // Hata olsa bile varsayılan modelleri döndür
      if (provider === 'gemini') {
        models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-exp'];
      } else if (provider === 'openai') {
        models = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'];
      } else if (provider === 'ollama') {
        models = ['llama3.2:3b', 'llama3.2:1b', 'llama3.2', 'mistral', 'codellama'];
      }
    }

    res.json({
      success: true,
      data: {
        provider,
        currentModel,
        availableModels: models,
        isAvailable
      }
    });
  } catch (error) {
    console.error('Error in models endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Model listesi alınamadı'
    });
  }
});

/**
 * POST /api/ai-assistant/set-provider
 * Set AI provider and model
 */
router.post('/set-provider', async (req, res) => {
  try {
    const aiProvider = getAIProvider();
    const { provider, model, ollamaBaseUrl } = req.body;

    if (!provider || !['openai', 'ollama', 'gemini'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz provider'
      });
    }

    aiProvider.setProvider(provider, model, ollamaBaseUrl);

    res.json({
      success: true,
      message: `AI provider ${provider} olarak ayarlandı ve database'e kaydedildi`,
      data: {
        provider,
        model: aiProvider.getModel()
      }
    });
  } catch (error) {
    console.error('Error setting provider:', error);
    res.status(500).json({
      success: false,
      error: 'Provider ayarlanamadı'
    });
  }
});

/**
 * GET /api/ai-assistant/health
 * Check AI service health
 */
router.get('/health', async (req, res) => {
  try {
    const aiProvider = getAIProvider();
    const isAvailable = await aiProvider.isAvailable();
    const provider = aiProvider.getProvider();

    res.json({
      success: true,
      data: {
        provider,
        available: isAvailable,
        model: aiProvider.getModel()
      }
    });
  } catch (error) {
    console.error('Error checking health:', error);
    res.status(500).json({
      success: false,
      error: 'Sağlık kontrolü yapılamadı'
    });
  }
});

/**
 * POST /api/ai-assistant/validate-provider
 * Validate if a specific provider is configured and working
 */
router.post('/validate-provider', async (req, res) => {
  try {
    const { provider, model } = req.body;
    
    if (!provider || !['openai', 'ollama', 'gemini'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz provider'
      });
    }

    // Geçici olarak bu provider'ı test et
    // Singleton reset ederek yeni provider ile test et
    AIProviderService.resetInstance();
    const testService = AIProviderService.getInstance({ provider, model });
    const isAvailable = await testService.isAvailable();
    // Reset ettikten sonra, asıl provider'ı geri yükle
    AIProviderService.resetInstance();
    getAIProvider();
    
    if (!isAvailable) {
      return res.json({
        success: false,
        available: false,
        error: `${provider} API key tanımlı değil veya erişilemiyor. Lütfen ayarlarınızı kontrol edin.`,
        hint: provider === 'gemini' 
          ? 'Gemini API key için: https://aistudio.google.com/apikey'
          : provider === 'openai'
          ? 'OpenAI API key için: https://platform.openai.com/api-keys'
          : 'Ollama sunucunuzun çalıştığından emin olun'
      });
    }

    res.json({
      success: true,
      available: true,
      message: `${provider} bağlantısı başarılı!`
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.json({
      success: false,
      available: false,
      error: `${req.body.provider} bağlantı hatası: ${errorMessage}`,
      hint: req.body.provider === 'gemini' 
        ? 'Gemini API key tanımlı mı? Ayarlarınızda GEMINI_API_KEY ortam değişkenini kontrol edin.'
        : req.body.provider === 'openai'
        ? 'OpenAI API key tanımlı mı? Ayarlarınızda OPENAI_API_KEY ortam değişkenini kontrol edin.'
        : 'Ollama sunucusu çalışıyor mu?'
    });
  }
});

/**
 * POST /api/ai-assistant/chat
 * Chat with AI assistant (non-streaming)
 */
router.post('/chat', requireAIEnabled, sanitizeAIRequest, async (req, res) => {
  try {
    const { message, studentId, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mesaj gerekli'
      });
    }

    // Professional counselor system prompt with optional student context
    let systemPrompt: string;
    
    if (studentId) {
      const context = await contextService.getStudentContext(studentId);
      const contextText = contextService.formatContextForAI(context);
      systemPrompt = CounselorPrompts.systemPrompt(contextText);
    } else {
      systemPrompt = CounselorPrompts.systemPrompt();
    }

    interface ChatMessage {
      role: 'system' | 'user' | 'assistant';
      content: string;
    }
    
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt }
    ];

    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }

    messages.push({ role: 'user', content: message });

    const aiProvider = getAIProvider();
    const response = await aiProvider.chat({
      messages,
      temperature: 0.7
    });

    res.json({
      success: true,
      data: {
        message: response,
        provider: aiProvider.getProvider(),
        model: aiProvider.getModel()
      }
    });
  } catch (error: unknown) {
    console.error('Error in chat:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Chat hatası'
    });
  }
});

/**
 * POST /api/ai-assistant/chat-stream
 * Streaming chat with AI assistant
 */
router.post('/chat-stream', requireAIEnabled, sanitizeAIRequest, async (req, res) => {
  try {
    const { message, studentId, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Mesaj gerekli'
      });
    }

    // Professional counselor system prompt with optional student context
    let systemPrompt: string;
    
    if (studentId) {
      const context = await contextService.getStudentContext(studentId);
      const contextText = contextService.formatContextForAI(context);
      systemPrompt = CounselorPrompts.systemPrompt(contextText);
    } else {
      systemPrompt = CounselorPrompts.systemPrompt();
    }

    interface ChatMessage {
      role: 'system' | 'user' | 'assistant';
      content: string;
    }
    
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt }
    ];

    // Konuşma geçmişini ekle
    if (conversationHistory && Array.isArray(conversationHistory)) {
      messages.push(...conversationHistory);
    }

    // Kullanıcı mesajını ekle
    messages.push({ role: 'user', content: message });

    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream response
    const aiProvider = getAIProvider();
    for await (const chunk of aiProvider.chatStream({
      messages,
      temperature: 0.7
    })) {
      res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: unknown) {
    console.error('Error in chat stream:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : String(error) || 'Streaming chat hatası'
      });
    } else {
      res.write(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : String(error) })}\n\n`);
      res.end();
    }
  }
});

/**
 * POST /api/ai-assistant/generate-meeting-summary
 * Generate meeting summary from notes
 */
router.post('/generate-meeting-summary', requireAIEnabled, async (req, res) => {
  try {
    const { notes, studentId, meetingType } = req.body;

    if (!notes) {
      return res.status(400).json({
        success: false,
        error: 'Görüşme notları gerekli'
      });
    }

    let contextText: string | undefined;
    if (studentId) {
      const context = await contextService.getStudentContext(studentId);
      contextText = contextService.formatContextForAI(context);
    }

    const systemPrompt = CounselorPrompts.systemPrompt(contextText);
    const summaryPrompt = CounselorPrompts.meetingSummary(meetingType || 'görüşme');

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: `${summaryPrompt}\n\n---\n\nGÖRÜŞME NOTLARI:\n${notes}` }
    ];

    const aiProvider = getAIProvider();
    const summary = await aiProvider.chat({
      messages,
      temperature: 0.3
    });

    res.json({
      success: true,
      data: { summary }
    });
  } catch (error: unknown) {
    console.error('Error generating summary:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Özet oluşturulamadı'
    });
  }
});

/**
 * POST /api/ai-assistant/analyze-risk
 * Analyze student risk and provide recommendations
 */
router.post('/analyze-risk', requireAIEnabled, async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Öğrenci ID gerekli'
      });
    }

    const context = await contextService.getStudentContext(studentId);
    const contextText = contextService.formatContextForAI(context);

    const systemPrompt = CounselorPrompts.systemPrompt(contextText);
    const riskPrompt = CounselorPrompts.riskAnalysis();

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: riskPrompt }
    ];

    const aiProvider = getAIProvider();
    const response = await aiProvider.chat({
      messages,
      temperature: 0.2,
      format: 'json'
    });

    let analysis;
    try {
      analysis = JSON.parse(response);
    } catch {
      analysis = { raw: response };
    }

    res.json({
      success: true,
      data: { analysis }
    });
  } catch (error: unknown) {
    console.error('Error analyzing risk:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Risk analizi yapılamadı'
    });
  }
});

/**
 * GET /api/ai-assistant/student-context/:studentId
 * Get student context for AI
 */
router.get('/student-context/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const context = await contextService.getStudentContext(studentId);

    res.json({
      success: true,
      data: { context }
    });
  } catch (error: unknown) {
    console.error('Error getting student context:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Öğrenci bağlamı alınamadı'
    });
  }
});

export default router;
