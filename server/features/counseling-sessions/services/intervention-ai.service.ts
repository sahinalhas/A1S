/**
 * Intervention AI Service
 * Müdahale öneri sistemi - Öğrenci profiline özel müdahale stratejileri
 */

import { AIProviderService } from '../../../services/ai-provider.service.js';
import { StudentContextService } from '../../../services/student-context.service.js';

export interface InterventionRecommendation {
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'academic' | 'behavioral' | 'social-emotional' | 'family' | 'health';
  evidenceBased: boolean;
  strategies: {
    shortTerm: string[];
    longTerm: string[];
  };
  expectedOutcomes: string[];
  successMetrics: string[];
  timeframe: string;
  resources: string[];
  stakeholders: string[];
}

export interface InterventionPlan {
  studentId: string;
  studentName: string;
  overallAssessment: string;
  urgencyLevel: 'immediate' | 'soon' | 'moderate' | 'low';
  recommendations: InterventionRecommendation[];
  actionPlan: {
    week1: string[];
    week2_4: string[];
    month2_3: string[];
  };
  monitoringPlan: {
    metrics: string[];
    checkpoints: string[];
    adjustmentTriggers: string[];
  };
}

export class InterventionAIService {
  private aiProvider: AIProviderService;
  private contextService: StudentContextService;

  constructor() {
    this.aiProvider = AIProviderService.getInstance();
    this.contextService = new StudentContextService();
  }

  /**
   * Öğrenci için kapsamlı müdahale planı oluştur
   */
  async generateInterventionPlan(studentId: string): Promise<InterventionPlan> {
    const context = await this.contextService.getStudentContext(studentId);
    const contextText = this.contextService.formatContextForAI(context);

    const prompt = `
Öğrenci Profili:
${contextText}

Bu öğrenci için kanıta dayalı, kapsamlı bir müdahale planı oluştur. Plan şunları içermeli:

1. Genel Değerlendirme (risk seviyesi, aciliyet)
2. Müdahale Önerileri (en az 3-5 adet, öncelik sırasına göre)
3. Zaman Çizelgeli Eylem Planı (1. hafta, 2-4. hafta, 2-3. ay)
4. İzleme ve Değerlendirme Planı

Her müdahale önerisi şunları içermeli:
- Başlık ve detaylı açıklama
- Öncelik seviyesi (critical/high/medium/low)
- Kategori (academic/behavioral/social-emotional/family/health)
- Kısa ve uzun vadeli stratejiler
- Beklenen sonuçlar
- Başarı metrikleri
- Zaman çerçevesi
- Gerekli kaynaklar
- Paydaşlar (öğrenci, öğretmen, aile, rehber, vb.)

JSON formatında şu yapıda döndür:
{
  "overallAssessment": "Genel değerlendirme (2-3 paragraf)",
  "urgencyLevel": "immediate|soon|moderate|low",
  "recommendations": [
    {
      "title": "...",
      "description": "...",
      "priority": "critical|high|medium|low",
      "category": "academic|behavioral|social-emotional|family|health",
      "evidenceBased": true,
      "strategies": {
        "shortTerm": ["...", "..."],
        "longTerm": ["...", "..."]
      },
      "expectedOutcomes": ["...", "..."],
      "successMetrics": ["...", "..."],
      "timeframe": "...",
      "resources": ["...", "..."],
      "stakeholders": ["...", "..."]
    }
  ],
  "actionPlan": {
    "week1": ["...", "..."],
    "week2_4": ["...", "..."],
    "month2_3": ["...", "..."]
  },
  "monitoringPlan": {
    "metrics": ["...", "..."],
    "checkpoints": ["...", "..."],
    "adjustmentTriggers": ["...", "..."]
  }
}
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: `Sen deneyimli bir rehber öğretmen ve müdahale uzmanısın. 
            Kanıta dayalı, bilimsel temelli müdahale planları oluşturuyorsun.
            MEB yönergeleri ve uluslararası best practices'e uygun çalışıyorsun.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        format: 'json'
      });

      const plan = JSON.parse(response);
      return {
        studentId,
        studentName: context.student.name,
        ...plan
      };
    } catch (error) {
      console.error('Intervention plan generation error:', error);
      return this.getFallbackInterventionPlan(studentId, context);
    }
  }

  /**
   * Belirli bir alana yönelik müdahale önerileri
   */
  async getTargetedRecommendations(
    studentId: string,
    targetArea: 'academic' | 'behavioral' | 'social-emotional' | 'attendance' | 'family'
  ): Promise<InterventionRecommendation[]> {
    const context = await this.contextService.getStudentContext(studentId);
    const contextText = this.contextService.formatContextForAI(context);

    const areaDescriptions = {
      academic: 'akademik başarı ve öğrenme',
      behavioral: 'davranış ve disiplin',
      'social-emotional': 'sosyal-duygusal gelişim',
      attendance: 'devam ve devamsızlık',
      family: 'aile katılımı ve destek'
    };

    const prompt = `
Öğrenci: ${context.student.name}
Hedef Alan: ${areaDescriptions[targetArea]}

Öğrenci Bağlamı:
${contextText}

Bu öğrenci için ${areaDescriptions[targetArea]} alanında spesifik müdahale önerileri oluştur.
En az 3 öneri sun ve her birini detaylandır.

JSON formatında dizge döndür: [{ InterventionRecommendation }, ...]
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen spesifik müdahale stratejileri geliştiren uzman bir rehber öğretmensin.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        format: 'json'
      });

      return JSON.parse(response);
    } catch (error) {
      console.error('Targeted recommendations error:', error);
      return this.getFallbackRecommendations(targetArea);
    }
  }

  /**
   * Müdahale başarısını değerlendirme
   */
  async evaluateInterventionProgress(
    studentId: string,
    interventionId: string,
    progressNotes: string
  ): Promise<{
    status: 'on_track' | 'needs_adjustment' | 'not_effective' | 'completed';
    analysis: string;
    recommendations: string[];
    nextSteps: string[];
  }> {
    const context = await this.contextService.getStudentContext(studentId);

    const prompt = `
Öğrenci: ${context.student.name}
Müdahale ID: ${interventionId}

İlerleme Notları:
${progressNotes}

Öğrenci Güncel Durumu:
- Risk Seviyesi: ${context.risk.level}
- Akademik Trend: ${context.academic.performanceTrend || 'Bilgi yok'}

Müdahalenin etkinliğini değerlendir ve şunları belirle:
1. Durum (on_track/needs_adjustment/not_effective/completed)
2. Detaylı analiz
3. Öneriler
4. Sonraki adımlar

JSON formatında döndür:
{
  "status": "on_track|needs_adjustment|not_effective|completed",
  "analysis": "Detaylı değerlendirme",
  "recommendations": ["...", "..."],
  "nextSteps": ["...", "..."]
}
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen müdahale etkinliğini değerlendiren deneyimli bir rehber öğretmensin.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        format: 'json'
      });

      return JSON.parse(response);
    } catch (error) {
      console.error('Intervention evaluation error:', error);
      return {
        status: 'needs_adjustment',
        analysis: 'AI değerlendirmesi şu anda yapılamıyor.',
        recommendations: ['Manuel değerlendirme yapın'],
        nextSteps: ['Ollama veya OpenAI aktif hale getirin']
      };
    }
  }

  private getFallbackInterventionPlan(studentId: string, context: any): InterventionPlan {
    return {
      studentId,
      studentName: context.student.name,
      overallAssessment: 'AI servisi şu anda kullanılamıyor. Manuel müdahale planı oluşturunuz.',
      urgencyLevel: context.risk.level === 'YÜKSEK' || context.risk.level === 'ÇOK_YÜKSEK' ? 'soon' : 'moderate',
      recommendations: [
        {
          title: 'Genel Destek Planı',
          description: 'Öğrenci için bireysel destek planı oluşturulması önerilir.',
          priority: 'high',
          category: 'academic',
          evidenceBased: true,
          strategies: {
            shortTerm: ['Birebir görüşme', 'Durum değerlendirmesi'],
            longTerm: ['Sürekli izleme', 'Aile katılımı']
          },
          expectedOutcomes: ['Akademik gelişim', 'Sosyal-duygusal destek'],
          successMetrics: ['Devam oranı', 'Akademik notlar'],
          timeframe: '3 ay',
          resources: ['Rehberlik servisi', 'Sınıf öğretmeni'],
          stakeholders: ['Öğrenci', 'Aile', 'Öğretmenler']
        }
      ],
      actionPlan: {
        week1: ['İlk görüşme', 'Durum tespit'],
        week2_4: ['Düzenli takip', 'Aile görüşmesi'],
        month2_3: ['Değerlendirme', 'Plan güncelleme']
      },
      monitoringPlan: {
        metrics: ['Devam', 'Notlar', 'Davranış'],
        checkpoints: ['Haftalık', 'Aylık'],
        adjustmentTriggers: ['Kötüleşme', 'İlerleme yok']
      }
    };
  }

  private getFallbackRecommendations(targetArea: string): InterventionRecommendation[] {
    return [
      {
        title: `${targetArea} alanında destek`,
        description: 'AI servisi aktif olduğunda detaylı öneriler oluşturulacak.',
        priority: 'medium',
        category: targetArea as any,
        evidenceBased: false,
        strategies: {
          shortTerm: ['Manuel değerlendirme yapın'],
          longTerm: ['AI servisi aktif hale getirin']
        },
        expectedOutcomes: ['Beklemede'],
        successMetrics: ['Belirlenemedi'],
        timeframe: 'Belirsiz',
        resources: ['Rehberlik servisi'],
        stakeholders: ['Rehber öğretmen']
      }
    ];
  }
}
