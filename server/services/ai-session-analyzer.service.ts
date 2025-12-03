import { AIProviderService } from './ai-provider.service.js';
import {
  aiSessionAnalysisRequestSchema,
  aiSessionAnalysisResponseSchema,
  type AISessionAnalysisRequest,
  type AISessionAnalysisResponse
} from '../../shared/schemas/ai-session-analysis.schemas.js';
import type { BasicStudentContext, PreviousSession, RiskAlert } from '../../shared/types/student-context.types.js';
import getDatabase from '../lib/database.js';
import fs from 'fs/promises';
import path from 'path';

// Yeniden isimlendir - artık BasicStudentContext kullanıyoruz
type StudentContext = BasicStudentContext;

interface PromptData {
  rawNotes: string;
  studentData: StudentContext | null;
  previousSessions: PreviousSession[];
  riskData: RiskAlert[];
  sessionInfo: {
    date: Date | string;
    topic?: string;
    type: 'individual' | 'group';
  };
}

export class AISessionAnalyzerService {
  private aiProvider: AIProviderService;
  private db: ReturnType<typeof getDatabase>;

  constructor() {
    this.aiProvider = AIProviderService.getInstance();
    this.db = getDatabase();
  }

  async analyzeSession(
    request: AISessionAnalysisRequest
  ): Promise<AISessionAnalysisResponse> {
    const startTime = Date.now();

    const validatedRequest = aiSessionAnalysisRequestSchema.parse(request);

    try {
      const [studentData, previousSessions, riskData] = await Promise.all([
        this.getStudentContext(validatedRequest.studentId),
        this.getPreviousSessions(validatedRequest.studentId),
        this.getRiskAnalysis(validatedRequest.studentId)
      ]);

      const prompt = this.buildAnalysisPrompt({
        rawNotes: validatedRequest.rawNotes,
        studentData,
        previousSessions,
        riskData,
        sessionInfo: {
          date: validatedRequest.sessionDate,
          topic: validatedRequest.sessionTopic,
          type: validatedRequest.sessionType
        }
      });

      const aiResponse = await this.callAIProviderWithRetry(prompt);

      const validated = this.validateAndNormalizeResponse(aiResponse);

      const withConfidence = this.calculateDeterministicConfidence(
        validated,
        validatedRequest,
        studentData,
        previousSessions
      );

      const processingTime = Date.now() - startTime;

      const finalResponse: AISessionAnalysisResponse = {
        ...withConfidence,
        metadata: {
          processingTime,
          aiProvider: this.aiProvider.getProvider(),
          modelVersion: this.aiProvider.getModel(),
          tokensUsed: aiResponse.tokensUsed
        }
      };

      await this.logAnalysisHybrid(validatedRequest, finalResponse);

      return finalResponse;

    } catch (error) {
      console.error('AI Session Analysis Error:', error);
      
      await this.logAnalysisHybrid(validatedRequest, null, error as Error);
      
      if (error instanceof Error && error.message.includes('validation')) {
        throw error;
      }
      throw new Error('Görüşme analizi sırasında bir hata oluştu');
    }
  }

  private async getStudentContext(studentId: string): Promise<StudentContext | null> {
    try {
      const student = this.db.prepare(`
        SELECT id, name, surname, class, 
               CAST((julianday('now') - julianday(birthDate)) / 365.25 AS INTEGER) as age
        FROM students 
        WHERE id = ?
      `).get(studentId) as any;

      if (!student) return null;

      const riskLevel = this.db.prepare(`
        SELECT riskLevel FROM student_risk_analysis 
        WHERE studentId = ? 
        ORDER BY created_at DESC 
        LIMIT 1
      `).get(studentId) as any;

      return {
        id: student.id,
        name: student.name,
        surname: student.surname,
        class: student.class,
        age: student.age,
        riskLevel: riskLevel?.riskLevel || 'unknown'
      };
    } catch (error) {
      console.error('Error fetching student context:', error);
      return null;
    }
  }

  private async getPreviousSessions(studentId: string, limit = 5): Promise<PreviousSession[]> {
    try {
      const sessions = this.db.prepare(`
        SELECT cs.id, cs.sessionDate, cs.topic, cs.detailedNotes, 
               cs.emotionalState, cs.sessionFlow
        FROM counseling_sessions cs
        INNER JOIN counseling_session_students css ON cs.id = css.sessionId
        WHERE css.studentId = ? AND cs.completed = 1
        ORDER BY cs.sessionDate DESC, cs.entryTime DESC
        LIMIT ?
      `).all(studentId, limit) as any[];

      return sessions.map(s => ({
        id: s.id,
        sessionDate: s.sessionDate,
        topic: s.topic,
        detailedNotes: s.detailedNotes,
        emotionalState: s.emotionalState,
        sessionFlow: s.sessionFlow
      }));
    } catch (error) {
      console.error('Error fetching previous sessions:', error);
      return [];
    }
  }

  private async getRiskAnalysis(studentId: string): Promise<RiskAlert[]> {
    try {
      const alerts = this.db.prepare(`
        SELECT id, alertType as type, alertLevel AS severity, description, created_at as createdAt
        FROM early_warning_alerts
        WHERE studentId = ? AND status = 'AÇIK'
        ORDER BY alertLevel DESC, created_at DESC
        LIMIT 5
      `).all(studentId) as any[];

      return alerts.map(a => ({
        id: a.id,
        type: a.type,
        severity: a.severity,
        description: a.description,
        createdAt: a.createdAt
      }));
    } catch (error) {
      console.error('Error fetching risk analysis:', error);
      return [];
    }
  }

  private buildAnalysisPrompt(data: PromptData): string {
    const { rawNotes, studentData, previousSessions, riskData, sessionInfo } = data;

    const contextSection = this.buildContextSection(studentData, previousSessions, riskData);
    const instructionsSection = this.buildInstructionsSection();
    const outputFormatSection = this.buildOutputFormatSection();

    return `${contextSection}

MEVCUT GÖRÜŞME BİLGİLERİ:
- Tarih: ${sessionInfo.date}
- Konu: ${sessionInfo.topic || 'Belirtilmemiş'}
- Görüşme Tipi: ${sessionInfo.type === 'individual' ? 'Bireysel' : 'Grup'}

HAM GÖRÜŞME NOTLARI:
"""
${rawNotes}
"""

${instructionsSection}

${outputFormatSection}`;
  }

  private buildContextSection(
    studentData: StudentContext | null,
    previousSessions: PreviousSession[],
    riskData: RiskAlert[]
  ): string {
    let context = `Sen deneyimli bir okul psikolojik danışmanısın ve Türkiye'de bir okul rehberlik servisinde çalışıyorsun.\n\n`;

    if (studentData) {
      context += `ÖĞRENCİ PROFİLİ:\n`;
      context += `- Ad Soyad: ${studentData.name} ${studentData.surname}\n`;
      context += `- Sınıf: ${studentData.class}\n`;
      if (studentData.age) context += `- Yaş: ${studentData.age}\n`;
      if (studentData.riskLevel && studentData.riskLevel !== 'unknown') {
        context += `- Risk Durumu: ${studentData.riskLevel}\n`;
      }
      context += `\n`;
    }

    if (previousSessions.length > 0) {
      context += `GEÇMİŞ GÖRÜŞMELER (Son ${previousSessions.length}):\n`;
      previousSessions.forEach((session, index) => {
        context += `${index + 1}. ${session.sessionDate} - ${session.topic}\n`;
        if (session.emotionalState) context += `   Duygu Durumu: ${session.emotionalState}\n`;
        if (session.sessionFlow) context += `   Görüşme Seyri: ${session.sessionFlow}\n`;
        if (session.detailedNotes) {
          const shortNote = session.detailedNotes.substring(0, 100);
          context += `   Özet: ${shortNote}${session.detailedNotes.length > 100 ? '...' : ''}\n`;
        }
      });
      context += `\n`;
    }

    if (riskData.length > 0) {
      context += `AKTİF RİSK UYARILARI:\n`;
      riskData.forEach((alert, index) => {
        context += `${index + 1}. [${alert.severity}] ${alert.type}: ${alert.description}\n`;
      });
      context += `\n`;
    }

    return context;
  }

  private buildInstructionsSection(): string {
    return `GÖREV:
Yukarıdaki ham görüşme notlarını profesyonel bir şekilde analiz et ve yapılandırılmış bir rapor hazırla.

ANALİZ KURALLARI:
1. KVKK'ya uygun ol - Hassas kişisel bilgileri koru
2. Türkçe ve profesyonel dil kullan
3. Gerçek veriye sadık kal, varsayımda bulunma veya abartma yapma
4. Öğrenci merkezli ve empatik yaklaş
5. Kanıt temelli değerlendirmeler yap - notlarda belirtilenlere dayanarak analiz et
6. Eğer notlarda yeterli bilgi yoksa, güven skorunu düşük tut
7. Aksiyon maddeleri somut, uygulanabilir ve ölçülebilir olsun`;
  }

  private buildOutputFormatSection(): string {
    return `ÇIKTI FORMATI:
Aşağıdaki JSON formatında yanıt ver. Hiçbir ek açıklama ekleme, sadece JSON döndür:

{
  "summary": {
    "professional": "Profesyonel görüşme özeti (200-500 kelime). Görüşmenin akışını, öğrencinin durumunu, konuşulanları ve varılan sonuçları içeren detaylı özet.",
    "keyTopics": ["Ana konu 1", "Ana konu 2", "Ana konu 3"],
    "studentQuotes": ["Öğrencinin önemli ifadesi 1", "Öğrencinin önemli ifadesi 2"],
    "outcomes": ["Varılan sonuç 1", "Varılan sonuç 2"],
    "importantNotes": ["Önemli gözlem 1", "Önemli gözlem 2"]
  },
  "formSuggestions": {
    "emotionalState": "sakin|kaygılı|üzgün|sinirli|mutlu|karışık|diğer",
    "physicalState": "normal|yorgun|enerjik|huzursuz|hasta",
    "cooperationLevel": 1-5 arası sayı,
    "communicationQuality": "açık|çekingen|dirençli|sınırlı",
    "sessionFlow": "çok_olumlu|olumlu|nötr|sorunlu|kriz",
    "studentParticipationLevel": "çok_aktif|aktif|pasif|dirençli|kapalı",
    "confidence": 0-100 arası sayı (bu önerilere ne kadar güvendiğini belirt),
    "reasoning": "Kısa açıklama - neden bu değerlendirmeleri yaptın"
  },
  "actionItems": [
    {
      "description": "Somut aksiyon açıklaması",
      "priority": "low|medium|high",
      "assignedTo": "student|counselor|teacher|parent",
      "category": "academic|social|emotional|behavioral|family"
    }
  ],
  "followUpRecommendation": {
    "needed": true|false,
    "suggestedDays": 7|14|30 (kaç gün sonra takip gerekli),
    "reason": "Takip gerekçesi",
    "priority": "low|medium|high"
  }
}`;
  }

  private async callAIProvider(prompt: string): Promise<any> {
    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen profesyonel bir okul psikolojik danışmanısın. Görüşme notlarını analiz edip yapılandırılmış raporlar hazırlıyorsun. Her zaman JSON formatında yanıt veriyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        format: 'json'
      });

      return response;
    } catch (error) {
      console.error('AI Provider Call Error:', error);
      throw error;
    }
  }

  private validateAndNormalizeResponse(aiResponse: any): Omit<AISessionAnalysisResponse, 'metadata'> {
    try {
      let parsed = aiResponse;
      if (typeof aiResponse === 'string') {
        parsed = JSON.parse(aiResponse);
      } else if (aiResponse.content) {
        parsed = JSON.parse(aiResponse.content);
      }

      const normalized: Omit<AISessionAnalysisResponse, 'metadata'> = {
        summary: {
          professional: parsed.summary?.professional || '',
          keyTopics: Array.isArray(parsed.summary?.keyTopics) ? parsed.summary.keyTopics : [],
          studentQuotes: Array.isArray(parsed.summary?.studentQuotes) ? parsed.summary.studentQuotes : [],
          outcomes: Array.isArray(parsed.summary?.outcomes) ? parsed.summary.outcomes : [],
          importantNotes: Array.isArray(parsed.summary?.importantNotes) ? parsed.summary.importantNotes : []
        },
        formSuggestions: {
          emotionalState: parsed.formSuggestions?.emotionalState || 'sakin',
          physicalState: parsed.formSuggestions?.physicalState || 'normal',
          cooperationLevel: Math.max(1, Math.min(5, parsed.formSuggestions?.cooperationLevel || 3)),
          communicationQuality: parsed.formSuggestions?.communicationQuality || 'açık',
          sessionFlow: parsed.formSuggestions?.sessionFlow || 'nötr',
          studentParticipationLevel: parsed.formSuggestions?.studentParticipationLevel || 'aktif',
          confidence: Math.max(0, Math.min(100, parsed.formSuggestions?.confidence || 50)),
          reasoning: parsed.formSuggestions?.reasoning || ''
        },
        actionItems: Array.isArray(parsed.actionItems) 
          ? parsed.actionItems.map((item: any) => ({
              description: item.description || '',
              priority: item.priority || 'medium',
              assignedTo: item.assignedTo || 'counselor',
              category: item.category || 'emotional',
              dueDate: item.dueDate
            }))
          : [],
        followUpRecommendation: {
          needed: parsed.followUpRecommendation?.needed || false,
          suggestedDays: parsed.followUpRecommendation?.suggestedDays,
          reason: parsed.followUpRecommendation?.reason || '',
          priority: parsed.followUpRecommendation?.priority || 'medium',
          suggestedDate: parsed.followUpRecommendation?.suggestedDate
        }
      };

      return normalized;
    } catch (error) {
      console.error('Response validation error:', error);
      throw new Error('AI yanıtı işlenemedi');
    }
  }

  private async callAIProviderWithRetry(prompt: string, maxRetries = 3): Promise<any> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI request timeout')), 30000)
        );

        const aiPromise = this.aiProvider.chat({
          messages: [
            {
              role: 'system',
              content: 'Sen profesyonel bir okul psikolojik danışmanısın. Görüşme notlarını analiz edip yapılandırılmış raporlar hazırlıyorsun. Her zaman JSON formatında yanıt veriyorsun.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          format: 'json'
        });

        const response = await Promise.race([aiPromise, timeoutPromise]);
        return response;

      } catch (error) {
        lastError = error as Error;
        console.error(`AI Provider Call Error (Attempt ${attempt}/${maxRetries}):`, error);

        if (attempt < maxRetries) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
        }
      }
    }

    throw lastError || new Error('AI provider failed after retries');
  }

  private calculateDeterministicConfidence(
    analysis: Omit<AISessionAnalysisResponse, 'metadata'>,
    request: AISessionAnalysisRequest,
    studentData: StudentContext | null,
    previousSessions: PreviousSession[]
  ): Omit<AISessionAnalysisResponse, 'metadata'> {
    let confidence = 80;

    const notesLength = request.rawNotes.length;
    if (notesLength < 50) {
      confidence = Math.min(confidence, 30);
    } else if (notesLength < 100) {
      confidence = Math.min(confidence, 50);
    } else if (notesLength > 500) {
      confidence += 5;
    }

    if (previousSessions.length === 0) {
      confidence -= 10;
    } else if (previousSessions.length >= 3) {
      confidence += 5;
    }

    if (!studentData) {
      confidence -= 15;
    }

    if (analysis.summary.professional.length < 100) {
      confidence -= 15;
    } else if (analysis.summary.professional.length > 300) {
      confidence += 5;
    }

    if (analysis.summary.keyTopics.length < 2) {
      confidence -= 10;
    }

    if (analysis.actionItems.length === 0 && notesLength > 100) {
      confidence -= 5;
    }

    const provider = this.aiProvider.getProvider();
    if (provider === 'ollama') {
      confidence = Math.min(confidence, 70);
    }

    confidence = Math.round(Math.max(20, Math.min(95, confidence)));

    return {
      ...analysis,
      formSuggestions: {
        ...analysis.formSuggestions,
        confidence
      }
    };
  }

  private async logAnalysisHybrid(
    request: AISessionAnalysisRequest,
    response: AISessionAnalysisResponse | null,
    error?: Error
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      action: 'analyze_session',
      studentId: request.studentId,
      sessionId: request.sessionId,
      inputLength: request.rawNotes.length,
      success: !!response,
      error: error?.message,
      processingTime: response?.metadata.processingTime,
      confidence: response?.formSuggestions.confidence,
      aiProvider: response?.metadata.aiProvider || this.aiProvider.getProvider(),
      modelVersion: response?.metadata.modelVersion || this.aiProvider.getModel()
    };

    try {
      const logsDir = path.join(process.cwd(), 'logs', 'ai-analysis');
      await fs.mkdir(logsDir, { recursive: true });

      const dateStr = new Date().toISOString().split('T')[0];
      const logFileName = `ai-analysis-${dateStr}.jsonl`;
      const logFilePath = path.join(logsDir, logFileName);

      const logLine = JSON.stringify(logEntry) + '\n';
      await fs.appendFile(logFilePath, logLine);

      await this.cleanupOldLogs(logsDir, 90);

    } catch (error) {
      console.error('Failed to write hybrid log:', error);
    }

    try {
      this.db.prepare(`
        INSERT OR REPLACE INTO ai_analysis_summary (
          date, total_analyses, successful_analyses, avg_confidence,
          avg_processing_time, last_updated
        )
        VALUES (
          date('now'),
          COALESCE((SELECT total_analyses FROM ai_analysis_summary WHERE date = date('now')), 0) + 1,
          COALESCE((SELECT successful_analyses FROM ai_analysis_summary WHERE date = date('now')), 0) + ?,
          COALESCE(
            (SELECT (avg_confidence * total_analyses + ?) / (total_analyses + 1)
             FROM ai_analysis_summary WHERE date = date('now')),
            ?
          ),
          COALESCE(
            (SELECT (avg_processing_time * total_analyses + ?) / (total_analyses + 1)
             FROM ai_analysis_summary WHERE date = date('now')),
            ?
          ),
          datetime('now')
        )
      `).run(
        response ? 1 : 0,
        response?.formSuggestions.confidence || 0,
        response?.formSuggestions.confidence || 0,
        response?.metadata.processingTime || 0,
        response?.metadata.processingTime || 0
      );
    } catch (error) {
      console.error('Failed to update SQLite summary:', error);
    }
  }

  private async cleanupOldLogs(logsDir: string, retentionDays: number): Promise<void> {
    try {
      const files = await fs.readdir(logsDir);
      const now = Date.now();
      const maxAge = retentionDays * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (!file.endsWith('.jsonl')) continue;

        const filePath = path.join(logsDir, file);
        const stats = await fs.stat(filePath);
        const fileAge = now - stats.mtimeMs;

        if (fileAge > maxAge) {
          await fs.unlink(filePath);
          console.log(`Deleted old AI log file: ${file}`);
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

}
