/**
 * AI Data Validation Service
 * Gemini ile gelen verilerin anlamlılığını ve geçerliliğini kontrol eder
 */

import { AIProviderService } from '../../../services/ai-provider.service.js';
import type { 
  DataValidationResult, 
  DataSource, 
  ProfileDomain,
  DataConflict 
} from '../types/profile-sync.types.js';

export class DataValidationService {
  private aiProvider: AIProviderService;

  constructor() {
    this.aiProvider = AIProviderService.getInstance();
  }

  /**
   * Gelen veriyi AI ile doğrular ve analiz eder
   */
  async validateData(
    source: DataSource,
    rawData: any,
    existingProfile?: any
  ): Promise<DataValidationResult> {
    try {
      const prompt = this.buildValidationPrompt(source, rawData, existingProfile);
      
      const response = await this.aiProvider.chat({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        format: 'json'
      });

      const result = this.parseAIResponse(response);
      
      return result;
    } catch (error) {
      console.error('AI validation error:', error);
      
      // AI başarısız olursa temel validasyon yap
      return this.fallbackValidation(source, rawData);
    }
  }

  /**
   * AI için validation prompt'u oluşturur
   */
  private buildValidationPrompt(
    source: DataSource,
    rawData: any,
    existingProfile?: any
  ): string {
    const sourceDescriptions = {
      counseling_session: 'psikolojik danışma görüşme notu',
      survey_response: 'anket cevabı',
      exam_result: 'sınav sonucu',
      behavior_incident: 'davranış kaydı',
      meeting_note: 'görüşme notu',
      attendance: 'devamsızlık kaydı',
      parent_meeting: 'veli görüşmesi',
      self_assessment: 'öz değerlendirme',
      manual_input: 'manuel veri girişi'
    };

    return `Sen bir eğitim danışmanı ve veri analisti AI'sısın. Görevin öğrenci hakkında gelen verilerin anlamlı ve gerçekçi olup olmadığını değerlendirmek.

VERİ KAYNAĞI: ${sourceDescriptions[source]}

GELİN VERİ:
${JSON.stringify(rawData, null, 2)}

${existingProfile ? `MEVCUT PROFİL BİLGİLERİ:
${JSON.stringify(existingProfile, null, 2)}` : ''}

Lütfen şu soruları değerlendir:

1. Bu veri anlamlı ve gerçekçi mi? (0-100 güven skoru)
2. Bu veri hangi öğrenci profil alanlarını etkiler? (academic, social_emotional, behavioral, motivation, risk_factors, talents_interests, health, family)
3. Bu veriden çıkarılabilecek önemli içgörüler nelerdir?
4. Mevcut profil bilgileriyle çelişki var mı?
5. Bu öğrenci için hangi öneriler yapılabilir?

ZORUNLU JSON FORMATI:
{
  "isValid": true/false,
  "confidence": 0-100,
  "reasoning": "neden geçerli/geçersiz olduğunun açıklaması",
  "suggestedDomain": ["domain1", "domain2"],
  "extractedInsights": {
    "key1": "insight1",
    "key2": "insight2"
  },
  "conflicts": [
    {
      "domain": "domain_name",
      "existingValue": "eski değer",
      "newValue": "yeni değer",
      "severity": "low/medium/high",
      "resolutionSuggestion": "nasıl çözülmeli"
    }
  ],
  "recommendations": ["öneri1", "öneri2"]
}

SADECE JSON döndür, başka açıklama ekleme.`;
  }

  /**
   * AI yanıtını parse eder
   */
  private parseAIResponse(response: string): DataValidationResult {
    try {
      // JSON formatını temizle
      let cleanJson = response.trim();
      
      // Markdown code block varsa temizle
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      const parsed = JSON.parse(cleanJson);
      
      return {
        isValid: parsed.isValid ?? true,
        confidence: parsed.confidence ?? 50,
        reasoning: parsed.reasoning ?? 'Analiz tamamlandı',
        suggestedDomain: parsed.suggestedDomain ?? [],
        extractedInsights: parsed.extractedInsights ?? {},
        conflicts: parsed.conflicts ?? [],
        recommendations: parsed.recommendations ?? []
      };
    } catch (error) {
      console.error('AI response parse error:', error);
      console.error('Response:', response);
      
      return {
        isValid: true,
        confidence: 50,
        reasoning: 'AI analizi parse edilemedi, varsayılan değerler kullanıldı',
        suggestedDomain: [],
        extractedInsights: {},
        conflicts: [],
        recommendations: []
      };
    }
  }

  /**
   * AI başarısız olursa kullanılacak temel validasyon
   */
  private fallbackValidation(source: DataSource, rawData: any): DataValidationResult {
    const domainMapping: Record<DataSource, ProfileDomain[]> = {
      counseling_session: ['social_emotional', 'behavioral', 'motivation'],
      survey_response: ['social_emotional', 'risk_factors'],
      exam_result: ['academic'],
      behavior_incident: ['behavioral', 'risk_factors'],
      meeting_note: ['social_emotional', 'family'],
      attendance: ['behavioral', 'risk_factors'],
      parent_meeting: ['family', 'social_emotional'],
      self_assessment: ['motivation', 'social_emotional'],
      manual_input: ['academic', 'social_emotional']
    };

    return {
      isValid: true,
      confidence: 60,
      reasoning: 'Temel validasyon kullanıldı (AI kullanılamadı)',
      suggestedDomain: domainMapping[source] || [],
      extractedInsights: { rawData },
      conflicts: [],
      recommendations: ['Veriyi manuel olarak gözden geçirin']
    };
  }

  /**
   * Çelişkileri tespit eder
   */
  async detectConflicts(
    studentId: string,
    domain: ProfileDomain,
    newData: any,
    existingData: any
  ): Promise<DataConflict[]> {
    const prompt = `Sen bir veri tutarlılığı analisti AI'sısın. Aynı öğrenci için iki farklı veri seti arasındaki çelişkileri tespit et.

ALAN: ${domain}

YENİ VERİ:
${JSON.stringify(newData, null, 2)}

MEVCUT VERİ:
${JSON.stringify(existingData, null, 2)}

Çelişkileri tespit et ve şu formatta döndür:

{
  "conflicts": [
    {
      "domain": "alan_adı",
      "existingValue": "eski değer",
      "newValue": "yeni değer",
      "severity": "low/medium/high",
      "resolutionSuggestion": "nasıl çözülmeli"
    }
  ]
}

SADECE JSON döndür.`;

    try {
      const response = await this.aiProvider.chat({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        format: 'json'
      });

      const parsed = JSON.parse(response.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
      return parsed.conflicts || [];
    } catch (error) {
      console.error('Conflict detection error:', error);
      return [];
    }
  }
}
