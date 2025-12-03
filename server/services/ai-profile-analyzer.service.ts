/**
 * AI Profile Analyzer Service
 * Deterministik ve ölçülebilir öğrenci profil analizi
 * 
 * Bu servis her zaman aynı veriler için aynı sonucu verir (deterministik)
 * OpenAI veya Ollama ile çalışır
 */

import type { UnifiedStudentScores, ProfileCompleteness } from '../../shared/types/student.types.js';
import { AIProviderService } from './ai-provider.service.js';

export interface AIProfileAnalysis {
  studentId: string;
  generatedAt: string;
  
  // Ana Değerlendirme
  genelDegerlendirme: string;
  
  // Her boyut için analiz
  akademikAnaliz: {
    gucluYonler: string[];
    gelismesiGerekenler: string[];
    oneriler: string[];
    skor: number;
  };
  
  sosyalDuygusalAnaliz: {
    gucluYonler: string[];
    gelismesiGerekenler: string[];
    oneriler: string[];
    skor: number;
  };
  
  davranissalAnaliz: {
    gucluYonler: string[];
    gelismesiGerekenler: string[];
    oneriler: string[];
    skor: number;
  };
  
  // Risk Analizi
  riskAnalizi: {
    seviye: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'ÇOK_YÜKSEK';
    riskFaktorleri: string[];
    koruyucuFaktorler: string[];
    onerilenIslemler: string[];
  };
  
  // Öncelikli Müdahaleler
  oncelikliMudahaleler: Array<{
    alan: string;
    oncelik: 'YÜKSEK' | 'ORTA' | 'DÜŞÜK';
    mudahale: string;
    beklenenSonuc: string;
  }>;
  
  // Hedef Önerileri
  hedefOnerileri: Array<{
    boyut: string;
    kısaVadeli: string;
    uzunVadeli: string;
  }>;
}

export class AIProfileAnalyzerService {
  private aiProvider: AIProviderService;

  constructor() {
    this.aiProvider = AIProviderService.getInstance();
  }

  /**
   * Deterministik profil analizi oluştur
   * Aynı skorlar = Aynı analiz (temperature=0 ile)
   */
  async analyzeProfile(
    scores: UnifiedStudentScores,
    completeness: ProfileCompleteness,
    additionalContext?: string
  ): Promise<AIProfileAnalysis> {
    // Check if AI is available
    const isAvailable = await this.aiProvider.isAvailable();
    if (!isAvailable) {
      return this.generateFallbackAnalysis(scores, completeness);
    }

    try {
      const prompt = this.buildDeterministicPrompt(scores, completeness, additionalContext);
      
      const systemPrompt = `Sen bir eğitim psikoloğu ve rehberlik uzmanısın. Öğrenci profillerini nesnel, ölçülebilir ve standart kriterlere göre analiz edersin. Her zaman yapıcı, çözüm odaklı ve bilimsel temelli öneriler sunarsın. Yanıtlarını Türkçe ver ve JSON formatında döndür.`;

      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0,
        format: 'json'
      });

      const analysis = JSON.parse(response);
      
      return {
        studentId: scores.studentId,
        generatedAt: new Date().toISOString(),
        ...analysis
      };
    } catch (error) {
      console.error('AI Profile Analysis error:', error);
      return this.generateFallbackAnalysis(scores, completeness);
    }
  }

  /**
   * Deterministik prompt oluştur
   * Standart format sayesinde aynı skorlar = aynı prompt
   */
  private buildDeterministicPrompt(
    scores: UnifiedStudentScores,
    completeness: ProfileCompleteness,
    additionalContext?: string
  ): string {
    return `
# Öğrenci Profil Analizi Talebi

## Standardize Edilmiş Skorlar (0-100 arası):
- Akademik Yeterlilik: ${Math.round(scores.akademikSkor)}/100
- Sosyal-Duygusal Gelişim: ${Math.round(scores.sosyalDuygusalSkor)}/100
- Davranışsal Uyum: ${Math.round(scores.davranissalSkor)}/100
- Motivasyon Seviyesi: ${Math.round(scores.motivasyonSkor)}/100
- Risk Skoru: ${Math.round(scores.riskSkoru)}/100

## Detaylı Değerlendirme:
### Akademik Detay:
- Not Ortalaması Göstergesi: ${scores.akademikDetay?.notOrtalamasi || 0}
- Devam Durumu: ${scores.akademikDetay?.devamDurumu || 0}%
- Odaklanma Seviyesi: ${scores.akademikDetay?.odeklikSeviyesi || 0}

### Sosyal-Duygusal Detay:
- Empati: ${scores.sosyalDuygusalDetay?.empati || 0}/10
- Öz-farkındalık: ${scores.sosyalDuygusalDetay?.ozFarkinalik || 0}/10
- Duygu Düzenleme: ${scores.sosyalDuygusalDetay?.duyguDuzenlemesi || 0}/10
- İlişki Becerileri: ${scores.sosyalDuygusalDetay?.iliski || 0}/10

### Davranışsal Detay:
- Olumlu Davranış Oranı: ${scores.davranissalDetay?.olumluDavranis || 0}%
- Olumsuz Davranış Sayısı: ${scores.davranissalDetay?.olumsuzDavranis || 0}
- Müdahale Etkinliği: ${scores.davranissalDetay?.mudahaleEtkinligi || 0}%

## Profil Tamamlanma Oranı: ${completeness.overall}%

${additionalContext ? `\n## Ek Bilgiler:\n${additionalContext}` : ''}

## Göreviniz:
Aşağıdaki JSON formatında detaylı bir profil analizi oluştur:

\`\`\`json
{
  "genelDegerlendirme": "Öğrencinin genel durumunu özetle (2-3 cümle)",
  "akademikAnaliz": {
    "gucluYonler": ["Güçlü yön 1", "Güçlü yön 2"],
    "gelismesiGerekenler": ["Gelişmesi gereken alan 1", "Alan 2"],
    "oneriler": ["Öneri 1", "Öneri 2", "Öneri 3"],
    "skor": ${Math.round(scores.akademikSkor)}
  },
  "sosyalDuygusalAnaliz": {
    "gucluYonler": ["Güçlü yön 1", "Güçlü yön 2"],
    "gelismesiGerekenler": ["Gelişmesi gereken alan 1", "Alan 2"],
    "oneriler": ["Öneri 1", "Öneri 2"],
    "skor": ${Math.round(scores.sosyalDuygusalSkor)}
  },
  "davranissalAnaliz": {
    "gucluYonler": ["Güçlü yön 1"],
    "gelismesiGerekenler": ["Gelişmesi gereken alan 1"],
    "oneriler": ["Öneri 1", "Öneri 2"],
    "skor": ${Math.round(scores.davranissalSkor)}
  },
  "riskAnalizi": {
    "seviye": "DÜŞÜK|ORTA|YÜKSEK|ÇOK_YÜKSEK",
    "riskFaktorleri": ["Risk faktörü 1", "Risk faktörü 2"],
    "koruyucuFaktorler": ["Koruyucu faktör 1", "Koruyucu faktör 2"],
    "onerilenIslemler": ["İşlem 1", "İşlem 2"]
  },
  "oncelikliMudahaleler": [
    {
      "alan": "Akademik/Sosyal/Davranışsal",
      "oncelik": "YÜKSEK|ORTA|DÜŞÜK",
      "mudahale": "Önerilen müdahale",
      "beklenenSonuc": "Beklenen sonuç"
    }
  ],
  "hedefOnerileri": [
    {
      "boyut": "Akademik/Sosyal/Kişisel",
      "kisaVadeli": "1-3 ay içinde ulaşılabilir hedef",
      "uzunVadeli": "6-12 ay içinde ulaşılabilir hedef"
    }
  ]
}
\`\`\`

**Önemli:** 
- Skorlara göre objektif değerlendirme yap
- Her zaman yapıcı ve çözüm odaklı ol
- Spesifik, uygulanabilir öneriler ver
- Bilimsel temelli yaklaşımlar kullan
`;
  }

  /**
   * Fallback analizi - AI çalışmazsa kural tabanlı analiz
   */
  private generateFallbackAnalysis(
    scores: UnifiedStudentScores,
    completeness: ProfileCompleteness
  ): AIProfileAnalysis {
    const riskLevel = this.determineRiskLevel(scores.riskSkoru);
    
    return {
      studentId: scores.studentId,
      generatedAt: new Date().toISOString(),
      genelDegerlendirme: this.generateOverallAssessment(scores),
      
      akademikAnaliz: {
        gucluYonler: this.getAcademicStrengths(scores.akademikSkor),
        gelismesiGerekenler: this.getAcademicWeaknesses(scores.akademikSkor),
        oneriler: this.getAcademicRecommendations(scores.akademikSkor),
        skor: Math.round(scores.akademikSkor)
      },
      
      sosyalDuygusalAnaliz: {
        gucluYonler: this.getSocialEmotionalStrengths(scores.sosyalDuygusalSkor),
        gelismesiGerekenler: this.getSocialEmotionalWeaknesses(scores.sosyalDuygusalSkor),
        oneriler: this.getSocialEmotionalRecommendations(scores.sosyalDuygusalSkor),
        skor: Math.round(scores.sosyalDuygusalSkor)
      },
      
      davranissalAnaliz: {
        gucluYonler: this.getBehavioralStrengths(scores.davranissalSkor),
        gelismesiGerekenler: this.getBehavioralWeaknesses(scores.davranissalSkor),
        oneriler: this.getBehavioralRecommendations(scores.davranissalSkor),
        skor: Math.round(scores.davranissalSkor)
      },
      
      riskAnalizi: {
        seviye: riskLevel,
        riskFaktorleri: this.getRiskFactors(scores),
        koruyucuFaktorler: this.getProtectiveFactors(scores),
        onerilenIslemler: this.getRecommendedActions(riskLevel)
      },
      
      oncelikliMudahaleler: this.getPriorityInterventions(scores),
      hedefOnerileri: this.getGoalRecommendations(scores)
    };
  }

  private determineRiskLevel(riskScore: number): 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'ÇOK_YÜKSEK' {
    if (riskScore >= 75) return 'ÇOK_YÜKSEK';
    if (riskScore >= 50) return 'YÜKSEK';
    if (riskScore >= 25) return 'ORTA';
    return 'DÜŞÜK';
  }

  private generateOverallAssessment(scores: UnifiedStudentScores): string {
    const avg = (scores.akademikSkor + scores.sosyalDuygusalSkor + scores.davranissalSkor) / 3;
    
    if (avg >= 75) {
      return "Öğrenci genel olarak iyi bir profil sergiliyor. Güçlü akademik ve sosyal becerilere sahip. Mevcut başarılarını sürdürmek için destek sağlanmalı.";
    } else if (avg >= 50) {
      return "Öğrenci orta düzeyde bir profil gösteriyor. Bazı alanlarda güçlü olsa da, geliştirilmesi gereken yönler mevcut. Hedefli müdahaleler faydalı olabilir.";
    } else {
      return "Öğrenci çeşitli alanlarda desteğe ihtiyaç duyuyor. Kapsamlı bir rehberlik planı ve düzenli takip önerilir. Güçlü yönleri üzerine inşa edilmeli.";
    }
  }

  private getAcademicStrengths(score: number): string[] {
    if (score >= 75) return ["Güçlü akademik performans", "İyi öğrenme becerileri", "Yüksek motivasyon"];
    if (score >= 50) return ["Kabul edilebilir akademik seviye", "Gelişim potansiyeli"];
    return ["Belirli derslerde başarı gösterme potansiyeli"];
  }

  private getAcademicWeaknesses(score: number): string[] {
    if (score < 50) return ["Akademik desteğe ihtiyaç", "Öğrenme stratejilerinin güçlendirilmesi gerekli", "Motivasyon eksikliği"];
    if (score < 75) return ["Bazı derslerde zorluk", "Çalışma alışkanlıklarının geliştirilmesi"];
    return ["Süreklilik sağlanması gereken alanlar"];
  }

  private getAcademicRecommendations(score: number): string[] {
    if (score < 50) {
      return [
        "Birebir ders desteği sağlanmalı",
        "Öğrenme stiline uygun yöntemler kullanılmalı",
        "Düzenli geri bildirim ve takip önemli"
      ];
    }
    return [
      "Güçlü yönler üzerine inşa edilmeli",
      "Zayıf derslerde ek çalışma planı oluşturulmalı",
      "Hedef belirleme ve izleme yapılmalı"
    ];
  }

  private getSocialEmotionalStrengths(score: number): string[] {
    if (score >= 75) return ["Güçlü sosyal beceriler", "İyi empati kapasitesi", "Sağlıklı akran ilişkileri"];
    if (score >= 50) return ["Kabul edilebilir sosyal uyum", "Gelişmekte olan duygusal zeka"];
    return ["Bireysel çalışmada güçlü yanlar"];
  }

  private getSocialEmotionalWeaknesses(score: number): string[] {
    if (score < 50) return ["Sosyal beceri gelişimi gerekli", "Duygu düzenleme desteği önemli", "Akran ilişkilerinde zorluk"];
    if (score < 75) return ["İletişim becerilerinin güçlendirilmesi", "Grup çalışmalarında aktif rol alması"];
    return ["Liderlik becerilerinin geliştirilmesi"];
  }

  private getSocialEmotionalRecommendations(score: number): string[] {
    if (score < 50) {
      return [
        "Sosyal beceri eğitim programına katılım",
        "Duygu tanıma ve ifade etme çalışmaları",
        "Küçük grup aktiviteleri ile başlanmalı"
      ];
    }
    return [
      "Akran etkileşimlerini artırmak için fırsatlar yaratılmalı",
      "Liderlik rollerine teşvik edilmeli",
      "Empati geliştirme aktiviteleri yapılmalı"
    ];
  }

  private getBehavioralStrengths(score: number): string[] {
    if (score >= 75) return ["Olumlu davranış sergiliyor", "Kurallara uyum sağlıyor", "Olumlu rol model"];
    if (score >= 50) return ["Genel olarak uyumlu davranış", "Belirli durumlarda olumlu tepkiler"];
    return ["Bazı ortamlarda uyum sağlama"];
  }

  private getBehavioralWeaknesses(score: number): string[] {
    if (score < 50) return ["Davranış müdahalesine ihtiyaç", "Öz-kontrol geliştirilmeli", "Tutarlı sınırlar belirlenmeli"];
    if (score < 75) return ["Bazı durumlarda davranış zorluğu", "Duygu kontrolü desteği"];
    return ["Davranış tutarlılığının artırılması"];
  }

  private getBehavioralRecommendations(score: number): string[] {
    if (score < 50) {
      return [
        "Davranış yönetim planı oluşturulmalı",
        "Pozitif pekiştirme sistemi uygulanmalı",
        "Tetikleyici faktörler belirlenmeli"
      ];
    }
    return [
      "Olumlu davranışlar pekiştirilmeli",
      "Sorumluluk alma fırsatları verilmeli",
      "Öz-izleme becerileri geliştirilmeli"
    ];
  }

  private getRiskFactors(scores: UnifiedStudentScores): string[] {
    const factors: string[] = [];
    if (scores.akademikSkor < 40) factors.push("Düşük akademik başarı");
    if (scores.sosyalDuygusalSkor < 40) factors.push("Sosyal izolasyon riski");
    if (scores.davranissalSkor < 40) factors.push("Davranış problemleri");
    if (scores.akademikDetay?.devamDurumu && scores.akademikDetay.devamDurumu < 70) {
      factors.push("Düşük devam oranı");
    }
    return factors.length > 0 ? factors : ["Ciddi risk faktörü tespit edilmedi"];
  }

  private getProtectiveFactors(scores: UnifiedStudentScores): string[] {
    const factors: string[] = [];
    if (scores.akademikSkor >= 60) factors.push("İyi akademik performans");
    if (scores.sosyalDuygusalSkor >= 60) factors.push("Güçlü sosyal destek");
    if (scores.motivasyonSkor >= 60) factors.push("Yüksek motivasyon");
    if (scores.davranissalSkor >= 60) factors.push("Olumlu davranış örüntüsü");
    return factors.length > 0 ? factors : ["Temel koruyucu faktörler mevcut"];
  }

  private getRecommendedActions(riskLevel: string): string[] {
    if (riskLevel === 'ÇOK_YÜKSEK') {
      return [
        "Acil müdahale planı oluşturulmalı",
        "Haftalık takip görüşmeleri yapılmalı",
        "Uzman desteği (psikolog) sağlanmalı",
        "Veli işbirliği güçlendirilmeli"
      ];
    } else if (riskLevel === 'YÜKSEK') {
      return [
        "Kapsamlı değerlendirme yapılmalı",
        "Düzenli takip ve izleme sağlanmalı",
        "Hedefli müdahale programı başlatılmalı"
      ];
    } else if (riskLevel === 'ORTA') {
      return [
        "Aylık takip görüşmeleri planlanmalı",
        "Erken uyarı sisteminde izlenmeli",
        "Önleyici müdahaleler uygulanmalı"
      ];
    }
    return [
      "Düzenli gözlem devam etmeli",
      "Güçlü yönler desteklenmeli",
      "Genel rehberlik hizmetleri sürdürülmeli"
    ];
  }

  private getPriorityInterventions(scores: UnifiedStudentScores): Array<unknown> {
    const interventions: Array<unknown> = [];
    
    if (scores.akademikSkor < 50) {
      interventions.push({
        alan: "Akademik",
        oncelik: "YÜKSEK",
        mudahale: "Birebir ders desteği ve çalışma beceriler eğitimi",
        beklenenSonuc: "3 ay içinde akademik skorun %20 artması"
      });
    }
    
    if (scores.sosyalDuygusalSkor < 50) {
      interventions.push({
        alan: "Sosyal-Duygusal",
        oncelik: "YÜKSEK",
        mudahale: "Sosyal beceri eğitimi ve grup etkinlikleri",
        beklenenSonuc: "Akran ilişkilerinde iyileşme"
      });
    }
    
    if (scores.davranissalSkor < 50) {
      interventions.push({
        alan: "Davranışsal",
        oncelik: "YÜKSEK",
        mudahale: "Davranış yönetimi ve öz-kontrol eğitimi",
        beklenenSonuc: "Davranış olaylarında %50 azalma"
      });
    }
    
    return interventions.length > 0 ? interventions : [{
      alan: "Genel",
      oncelik: "DÜŞÜK",
      mudahale: "Destekleyici rehberlik hizmetlerine devam",
      beklenenSonuc: "Mevcut başarının sürdürülmesi"
    }];
  }

  private getGoalRecommendations(scores: UnifiedStudentScores): Array<unknown> {
    return [
      {
        boyut: "Akademik",
        kisaVadeli: scores.akademikSkor < 50 
          ? "Zayıf olduğu 2 derste not ortalamasını artırmak" 
          : "Başarılı olduğu derslerde performansı sürdürmek",
        uzunVadeli: "Genel akademik ortalamanın hedef seviyeye ulaşması"
      },
      {
        boyut: "Sosyal",
        kisaVadeli: "Grup etkinliklerine aktif katılım sağlamak",
        uzunVadeli: "Güçlü ve sağlıklı akran ilişkileri kurmak"
      },
      {
        boyut: "Kişisel",
        kisaVadeli: "Öz-yönetim becerilerini geliştirmek",
        uzunVadeli: "Bağımsız öğrenme ve problem çözme becerisi kazanmak"
      }
    ];
  }
}
