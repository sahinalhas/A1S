/**
 * Survey AI Analysis Service
 * Anket sonuçlarını AI ile derinlemesine analiz eder
 */

import { AIProviderService } from '../../../../services/ai-provider.service.js';

export interface SurveyAnalysisResult {
  summary: string;
  keyFindings: string[];
  trends: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  recommendations: string[];
  insights: {
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  visualizationSuggestions: {
    chartType: string;
    data: string;
    purpose: string;
  }[];
}

export interface ClassAnalysis {
  className: string;
  averageScore: number;
  participationRate: number;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

export class SurveyAIAnalysisService {
  private aiProvider: AIProviderService;

  constructor() {
    this.aiProvider = AIProviderService.getInstance();
  }

  /**
   * Anket sonuçlarını AI ile analiz et
   */
  async analyzeSurveyResults(
    surveyData: {
      title: string;
      description?: string;
      responses: unknown[];
      questions: unknown[];
    }
  ): Promise<SurveyAnalysisResult> {
    const prompt = this.buildAnalysisPrompt(surveyData);

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: `Sen bir eğitim danışmanı ve veri analisti olarak çalışan uzman bir AI asistansın. 
            Anket sonuçlarını derinlemesine analiz edip, eğitimcilere değerli içgörüler sunuyorsun.
            Yanıtlarını her zaman Türkçe ver ve JSON formatında döndür.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        format: 'json'
      });

      const analysis = JSON.parse(response);
      return this.formatAnalysisResult(analysis);
    } catch (error) {
      console.error('Survey AI analysis error:', error);
      return this.getFallbackAnalysis(surveyData);
    }
  }

  /**
   * Sınıf bazlı karşılaştırmalı analiz
   */
  async compareClassResults(classesData: Array<{
    className: string;
    responses: unknown[];
    studentCount: number;
  }>): Promise<ClassAnalysis[]> {
    const prompt = this.buildClassComparisonPrompt(classesData);

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: `Sen bir eğitim analisti olarak sınıflar arası karşılaştırma yapan uzman bir AI'sın.
            Verileri analiz edip, her sınıf için güçlü yönler, endişe alanları ve öneriler sun.
            Yanıtlarını Türkçe ve JSON formatında döndür.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        format: 'json'
      });

      const analyses = JSON.parse(response);
      return analyses.classAnalyses || [];
    } catch (error) {
      console.error('Class comparison error:', error);
      return this.getFallbackClassAnalysis(classesData);
    }
  }

  /**
   * Trend analizi - zaman içinde değişimleri incele
   */
  async analyzeTrends(historicalData: Array<{
    date: string;
    surveyTitle: string;
    averageScore: number;
    responseCount: number;
  }>): Promise<{
    overallTrend: 'improving' | 'declining' | 'stable';
    trendDescription: string;
    predictions: string[];
    recommendations: string[];
  }> {
    const prompt = `
Aşağıdaki anket geçmişi verilerini analiz et ve trendleri belirle:

${JSON.stringify(historicalData, null, 2)}

Şunları analiz et:
1. Genel trend nedir? (improving/declining/stable)
2. Trend açıklaması
3. Gelecek tahminleri
4. Öneriler

JSON formatında şu yapıda döndür:
{
  "overallTrend": "improving|declining|stable",
  "trendDescription": "...",
  "predictions": ["...", "..."],
  "recommendations": ["...", "..."]
}
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen trend analizi uzmanı bir AI asistansın. Eğitim verilerini analiz edip gelecek tahminleri yapıyorsun.'
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
      console.error('Trend analysis error:', error);
      return {
        overallTrend: 'stable',
        trendDescription: 'Veri analizi yapılamadı',
        predictions: [],
        recommendations: ['Daha fazla veri toplanması önerilir']
      };
    }
  }

  /**
   * Açık uçlu cevapları analiz et (sentiment analysis)
   */
  async analyzeOpenEndedResponses(responses: string[]): Promise<{
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
    commonThemes: string[];
    keyQuotes: string[];
    summary: string;
  }> {
    if (responses.length === 0) {
      return {
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        commonThemes: [],
        keyQuotes: [],
        summary: 'Açık uçlu cevap bulunmamaktadır.'
      };
    }

    const prompt = `
Aşağıdaki açık uçlu anket cevaplarını analiz et:

${responses.map((r, i) => `${i + 1}. ${r}`).join('\n')}

Şunları belirle:
1. Duygu analizi (pozitif/nötr/negatif yüzdeleri)
2. Ortak temalar
3. Öne çıkan alıntılar
4. Genel özet

JSON formatında döndür:
{
  "sentiment": { "positive": 0-100, "neutral": 0-100, "negative": 0-100 },
  "commonThemes": ["tema1", "tema2", ...],
  "keyQuotes": ["alıntı1", "alıntı2", ...],
  "summary": "Genel özet..."
}
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen duygu analizi ve metin madenciliği uzmanı bir AI asistansın. Türkçe metinleri analiz ediyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        format: 'json'
      });

      return JSON.parse(response);
    } catch (error) {
      console.error('Open-ended analysis error:', error);
      return {
        sentiment: { positive: 33, neutral: 34, negative: 33 },
        commonThemes: ['Analiz yapılamadı'],
        keyQuotes: [],
        summary: 'Açık uçlu cevaplar analiz edilemedi.'
      };
    }
  }

  private buildAnalysisPrompt(surveyData: any): string {
    return `
Anket Analizi İsteği:

Anket Başlığı: ${surveyData.title}
Açıklama: ${surveyData.description || 'Yok'}
Toplam Yanıt: ${surveyData.responses.length}
Soru Sayısı: ${surveyData.questions.length}

Sorular ve Yanıtlar:
${this.formatSurveyDataForPrompt(surveyData)}

Lütfen şu formatta detaylı bir analiz yap:
{
  "summary": "Genel özet (2-3 paragraf)",
  "keyFindings": ["Ana bulgu 1", "Ana bulgu 2", ...],
  "trends": {
    "positive": ["Pozitif trend 1", ...],
    "negative": ["Negatif trend 1", ...],
    "neutral": ["Nötr gözlem 1", ...]
  },
  "recommendations": ["Öneri 1", "Öneri 2", ...],
  "insights": [
    {
      "title": "İçgörü başlığı",
      "description": "Detaylı açıklama",
      "priority": "high|medium|low"
    }
  ],
  "visualizationSuggestions": [
    {
      "chartType": "bar|line|pie|radar",
      "data": "Neyin görselleştirileceği",
      "purpose": "Görselleştirmenin amacı"
    }
  ]
}
`;
  }

  private buildClassComparisonPrompt(classesData: unknown[]): string {
    return `
Sınıf Karşılaştırma Analizi:

${classesData.map(c => `
Sınıf: ${c.className}
Öğrenci Sayısı: ${c.studentCount}
Yanıt Sayısı: ${c.responses.length}
Katılım Oranı: ${((c.responses.length / c.studentCount) * 100).toFixed(1)}%
`).join('\n')}

Her sınıf için şu formatta analiz yap:
{
  "classAnalyses": [
    {
      "className": "...",
      "averageScore": 0-100,
      "participationRate": 0-100,
      "strengths": ["Güçlü yön 1", ...],
      "concerns": ["Endişe 1", ...],
      "recommendations": ["Öneri 1", ...]
    }
  ]
}
`;
  }

  private formatSurveyDataForPrompt(surveyData: any): string {
    // Simplify survey data for AI prompt
    return surveyData.questions.map((q: any, index: number) => {
      const questionResponses = surveyData.responses
        .map((r: any) => r.answers?.[index])
        .filter(Boolean);
      
      return `
Soru ${index + 1}: ${q.text}
Tip: ${q.type}
Yanıt Sayısı: ${questionResponses.length}
`;
    }).join('\n');
  }

  private formatAnalysisResult(raw: any): SurveyAnalysisResult {
    return {
      summary: raw.summary || 'Analiz tamamlanamadı',
      keyFindings: raw.keyFindings || [],
      trends: raw.trends || { positive: [], negative: [], neutral: [] },
      recommendations: raw.recommendations || [],
      insights: raw.insights || [],
      visualizationSuggestions: raw.visualizationSuggestions || []
    };
  }

  private getFallbackAnalysis(surveyData: any): SurveyAnalysisResult {
    return {
      summary: `${surveyData.title} anketi ${surveyData.responses.length} yanıt aldı. AI analizi şu anda kullanılamıyor.`,
      keyFindings: [
        `Toplam ${surveyData.responses.length} yanıt alındı`,
        `${surveyData.questions.length} soru soruldu`
      ],
      trends: {
        positive: [],
        negative: [],
        neutral: ['Veri analiz için yetersiz']
      },
      recommendations: [
        'AI servisi aktif olduğunda detaylı analiz yapılabilir'
      ],
      insights: [],
      visualizationSuggestions: []
    };
  }

  private getFallbackClassAnalysis(classesData: unknown[]): ClassAnalysis[] {
    return classesData.map(c => ({
      className: c.className,
      averageScore: 0,
      participationRate: (c.responses.length / c.studentCount) * 100,
      strengths: ['Analiz beklemede'],
      concerns: ['AI servisi gerekli'],
      recommendations: ['Ollama veya OpenAI aktif hale getirin']
    }));
  }
}
