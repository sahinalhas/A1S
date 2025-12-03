/**
 * Psychological Depth Analysis Service
 * Psikolojik Derinlik Analiz Servisi
 * 
 * Öğrencilerin psikolojik, sosyal ve duygusal derinlemesine analizi
 * Motivasyon, aile dinamikleri, akran ilişkileri ve gelişimsel faktörler
 */

import { AIProviderService } from './ai-provider.service.js';
import { StudentContextService } from './student-context.service.js';
import getDatabase from '../lib/database.js';
import { aiErrorHandler } from './ai-error-handler.service.js';

export interface MotivationalProfile {
  intrinsicMotivation: {
    level: 'YÜKSEK' | 'ORTA' | 'DÜŞÜK';
    indicators: string[];
    developmentAreas: string[];
  };
  extrinsicMotivation: {
    level: 'YÜKSEK' | 'ORTA' | 'DÜŞÜK';
    primaryDrivers: string[];
    effectiveRewards: string[];
  };
  learningOrientation: 'ÖĞRENME_ODAKLI' | 'PERFORMANS_ODAKLI' | 'KAÇINMA_ODAKLI' | 'KARMA';
  goalSetting: {
    quality: 'ETKİLİ' | 'GELİŞTİRİLEBİLİR' | 'ZAYIF';
    autonomy: number;
    recommendations: string[];
  };
  resilienceFactors: {
    strengths: string[];
    vulnerabilities: string[];
    copingStrategies: string[];
  };
}

export interface FamilyDynamicsAnalysis {
  parentalInvolvement: {
    level: 'YÜKSEK' | 'ORTA' | 'DÜŞÜK' | 'İNCELENEMEDİ';
    quality: 'DESTEKLEYICI' | 'KARMA' | 'SORUNLU' | 'BELİRSİZ';
    communicationPatterns: string[];
    improvementAreas: string[];
  };
  familyStructure: {
    type: string;
    stabilityLevel: 'STABLE' | 'TRANSITIONING' | 'UNSTABLE' | 'UNKNOWN';
    impactOnStudent: string[];
  };
  socioeconomicFactors: {
    indicators: string[];
    resourceAvailability: 'YETERLİ' | 'KISITLI' | 'YETERSİZ' | 'BELİRSİZ';
    supportNeeds: string[];
  };
  culturalContext: {
    factors: string[];
    considerationsForIntervention: string[];
  };
  familySupport: {
    emotionalSupport: number;
    academicSupport: number;
    practicalSupport: number;
    recommendations: string[];
  };
}

export interface PeerRelationshipAnalysis {
  socialIntegration: {
    level: 'İYİ_ENTEGRE' | 'ORTA_ENTEGRE' | 'İZOLE' | 'KRİTİK_İZOLASYON';
    friendshipQuality: 'SAĞLIKLI' | 'GELIŞEN' | 'SORUNLU' | 'YOK';
    peerAcceptance: number;
    indicators: string[];
  };
  socialSkills: {
    strengths: string[];
    challenges: string[];
    developmentPriorities: string[];
  };
  peerInfluence: {
    positiveInfluences: string[];
    negativeInfluences: string[];
    riskFactors: string[];
    protectiveActions: string[];
  };
  bullying: {
    victimIndicators: string[];
    perpetratorIndicators: string[];
    bystanderBehavior: string[];
    interventionNeeds: string[];
  };
  socialEmotionalCompetencies: {
    selfAwareness: number;
    selfManagement: number;
    socialAwareness: number;
    relationshipSkills: number;
    responsibleDecisionMaking: number;
    focusAreas: string[];
  };
}

export interface DevelopmentalFactorsAnalysis {
  ageAppropriatenesss: {
    academicDevelopment: 'İLERİDE' | 'UYGUN' | 'GECİKMİŞ';
    socialDevelopment: 'İLERİDE' | 'UYGUN' | 'GECİKMİŞ';
    emotionalDevelopment: 'İLERİDE' | 'UYGUN' | 'GECİKMİŞ';
    considerations: string[];
  };
  criticalDevelopmentalNeeds: string[];
  transitions: {
    currentTransitions: string[];
    supportNeeded: string[];
    expectedChallenges: string[];
  };
}

export interface PsychologicalDepthAnalysis {
  studentId: string;
  studentName: string;
  analysisDate: string;
  
  motivationalProfile: MotivationalProfile;
  familyDynamics: FamilyDynamicsAnalysis;
  peerRelationships: PeerRelationshipAnalysis;
  developmentalFactors: DevelopmentalFactorsAnalysis;
  
  synthesisAndRecommendations: {
    keyPsychologicalThemes: string[];
    primaryConcerns: string[];
    strengthsToLeverage: string[];
    criticalInterventions: Array<{
      area: string;
      priority: 'ACİL' | 'YÜKSEK' | 'ORTA';
      intervention: string;
      rationale: string;
      expectedOutcome: string;
      timeline: string;
    }>;
    counselingApproach: {
      recommendedModality: string;
      therapeuticTechniques: string[];
      sessionFrequency: string;
      involvementNeeded: string[];
    };
    holisticWellbeingPlan: string;
  };
}

class PsychologicalDepthAnalysisService {
  private aiProvider: AIProviderService;
  private contextService: StudentContextService;
  private db: ReturnType<typeof getDatabase>;

  constructor() {
    this.aiProvider = AIProviderService.getInstance();
    this.contextService = new StudentContextService();
    this.db = getDatabase();
  }

  async generatePsychologicalAnalysis(studentId: string): Promise<PsychologicalDepthAnalysis> {
    const context = await this.contextService.getStudentContext(studentId);
    
    const isAvailable = await this.aiProvider.isAvailable();
    if (!isAvailable) {
      return this.generateFallbackAnalysis(studentId, context);
    }

    const prompt = this.buildPsychologicalAnalysisPrompt(context);
    
    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen deneyimli bir okul psikoloğu ve rehber öğretmensin. 15+ yıllık deneyiminle öğrencilerin psikolojik, sosyal ve duygusal durumlarını derinlemesine analiz ediyorsun. Gelişim psikolojisi, aile sistemleri teorisi, sosyal öğrenme teorisi ve travma-bilinçli yaklaşımlar konusunda uzmansın.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      });

      return this.parseAIResponse(studentId, context.student.name, response);
    } catch (error) {
      await aiErrorHandler.handleAIError(
        error as Error,
        {
          serviceType: 'psychological-analysis',
          provider: this.aiProvider.getProvider(),
          model: this.aiProvider.getModel(),
          operation: 'generate-psychological-analysis',
          studentId,
          additionalData: { contextAvailable: !!context }
        },
        true
      );
      
      console.error('AI analysis error:', error);
      return this.generateFallbackAnalysis(studentId, context);
    }
  }

  private buildPsychologicalAnalysisPrompt(context: any): string {
    return `Aşağıdaki öğrenci için DERİNLEMESİNE PSİKOLOJİK ANALİZ yap:

📊 ÖĞRENCİ BAĞLAMI:
${JSON.stringify(context, null, 2)}

🎯 ANALİZ GEREKSİNİMLERİ:

1. MOTİVASYONEL PROFİL:
   - İçsel ve dışsal motivasyon seviyeleri
   - Öğrenme yönelimi (öğrenme odaklı / performans odaklı / kaçınma odaklı)
   - Hedef belirleme kalitesi ve özerklik
   - Dayanıklılık faktörleri ve başa çıkma stratejileri

2. AİLE DİNAMİKLERİ:
   - Ebeveyn katılımı seviyesi ve kalitesi
   - Aile yapısı ve istikrar
   - Sosyoekonomik faktörler ve kaynak erişimi
   - Kültürel bağlam ve aile desteği
   - Öğrenci üzerindeki etki

3. AKRAN İLİŞKİLERİ:
   - Sosyal entegrasyon ve arkadaşlık kalitesi
   - Sosyal beceriler (güçlü ve zayıf yönler)
   - Akran etkisi (pozitif/negatif)
   - Zorbalık göstergeleri (mağdur/fail/seyirci)
   - Sosyal-duygusal yetkinlikler (5 boyut)

4. GELİŞİMSEL FAKTÖRLER:
   - Yaşa uygunluk (akademik, sosyal, duygusal)
   - Kritik gelişimsel ihtiyaçlar
   - Geçiş dönemleri ve destek gereksinimleri

5. SENTEZ VE ÖNERİLER:
   - Ana psikolojik temalar
   - Temel endişe alanları
   - Kullanılabilir güçlü yönler
   - Kritik müdahaleler (öncelik, gerekçe, beklenen sonuç, zaman çizelgesi)
   - Önerilen danışmanlık yaklaşımı
   - Bütüncül iyilik hali planı

⚠️ ÖNEMLİ:
- Kanıta dayalı değerlendirmeler yap
- Kültürel hassasiyet göster
- Travma-bilinçli yaklaşım kullan
- Güçlü yönleri vurgula
- Pratik, uygulanabilir öneriler sun
- Aile ve okul işbirliğini destekle

Yanıtını JSON formatında ver (TypeScript PsychologicalDepthAnalysis tipine uygun).`;
  }

  private parseAIResponse(studentId: string, studentName: string, response: string): PsychologicalDepthAnalysis {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          studentId,
          studentName,
          analysisDate: new Date().toISOString(),
          ...parsed
        };
      }
    } catch (error) {
      console.error('Parse error:', error);
    }

    return this.generateBasicAnalysisFromText(studentId, studentName, response);
  }

  private generateBasicAnalysisFromText(studentId: string, studentName: string, text: string): PsychologicalDepthAnalysis {
    return {
      studentId,
      studentName,
      analysisDate: new Date().toISOString(),
      motivationalProfile: {
        intrinsicMotivation: {
          level: 'ORTA',
          indicators: ['AI yanıtından çıkarılan göstergeler'],
          developmentAreas: ['Metin analizine dayalı gelişim alanları']
        },
        extrinsicMotivation: {
          level: 'ORTA',
          primaryDrivers: ['Analiz edilen temel motivatörler'],
          effectiveRewards: ['Önerilen ödüller']
        },
        learningOrientation: 'KARMA',
        goalSetting: {
          quality: 'GELİŞTİRİLEBİLİR',
          autonomy: 50,
          recommendations: ['Hedef belirleme becerileri geliştirme']
        },
        resilienceFactors: {
          strengths: ['Tespit edilen güçlü yönler'],
          vulnerabilities: ['Dikkat edilmesi gereken alanlar'],
          copingStrategies: ['Mevcut başa çıkma stratejileri']
        }
      },
      familyDynamics: {
        parentalInvolvement: {
          level: 'ORTA',
          quality: 'KARMA',
          communicationPatterns: ['Gözlemlenen iletişim örüntüleri'],
          improvementAreas: ['İyileştirme önerileri']
        },
        familyStructure: {
          type: 'Standart',
          stabilityLevel: 'STABLE',
          impactOnStudent: ['Aile yapısının öğrenci üzerindeki etkileri']
        },
        socioeconomicFactors: {
          indicators: ['Tespit edilen göstergeler'],
          resourceAvailability: 'BELİRSİZ',
          supportNeeds: ['Destek ihtiyaçları']
        },
        culturalContext: {
          factors: ['Kültürel faktörler'],
          considerationsForIntervention: ['Müdahalede dikkat edilecek noktalar']
        },
        familySupport: {
          emotionalSupport: 50,
          academicSupport: 50,
          practicalSupport: 50,
          recommendations: ['Aile desteği önerileri']
        }
      },
      peerRelationships: {
        socialIntegration: {
          level: 'ORTA_ENTEGRE',
          friendshipQuality: 'GELIŞEN',
          peerAcceptance: 50,
          indicators: ['Sosyal entegrasyon göstergeleri']
        },
        socialSkills: {
          strengths: ['Sosyal beceri güçlü yönleri'],
          challenges: ['Geliştirilecek alanlar'],
          developmentPriorities: ['Öncelikli gelişim alanları']
        },
        peerInfluence: {
          positiveInfluences: ['Olumlu akran etkileri'],
          negativeInfluences: ['Olumsuz etki riskleri'],
          riskFactors: ['Risk faktörleri'],
          protectiveActions: ['Koruyucu önlemler']
        },
        bullying: {
          victimIndicators: [],
          perpetratorIndicators: [],
          bystanderBehavior: [],
          interventionNeeds: []
        },
        socialEmotionalCompetencies: {
          selfAwareness: 50,
          selfManagement: 50,
          socialAwareness: 50,
          relationshipSkills: 50,
          responsibleDecisionMaking: 50,
          focusAreas: ['Odaklanılacak yetkinlik alanları']
        }
      },
      developmentalFactors: {
        ageAppropriatenesss: {
          academicDevelopment: 'UYGUN',
          socialDevelopment: 'UYGUN',
          emotionalDevelopment: 'UYGUN',
          considerations: ['Gelişimsel değerlendirmeler']
        },
        criticalDevelopmentalNeeds: ['Kritik gelişimsel ihtiyaçlar'],
        transitions: {
          currentTransitions: ['Mevcut geçiş dönemleri'],
          supportNeeded: ['Gerekli destekler'],
          expectedChallenges: ['Beklenen zorluklar']
        }
      },
      synthesisAndRecommendations: {
        keyPsychologicalThemes: ['Ana psikolojik temalar (AI yanıtından)'],
        primaryConcerns: ['Temel endişe alanları'],
        strengthsToLeverage: ['Kullanılabilecek güçlü yönler'],
        criticalInterventions: [
          {
            area: 'Genel Destek',
            priority: 'ORTA',
            intervention: 'AI önerileri doğrultusunda müdahale',
            rationale: 'Analiz bulgularına dayalı',
            expectedOutcome: 'Pozitif gelişim ve iyileşme',
            timeline: '3-6 ay'
          }
        ],
        counselingApproach: {
          recommendedModality: 'Bireysel ve grup danışmanlığı',
          therapeuticTechniques: ['Önerilen teknikler'],
          sessionFrequency: 'Haftada 1-2 seans',
          involvementNeeded: ['Gerekli katılımcılar']
        },
        holisticWellbeingPlan: text.substring(0, 500) + '...'
      }
    };
  }

  private generateFallbackAnalysis(studentId: string, context: any): PsychologicalDepthAnalysis {
    const academic = context.academic || {};
    const behavioral = context.behavioral || {};
    const socialEmotional = context.socialEmotional || {};
    const attendance = context.attendance || {};
    const risk = context.risk || {};
    const interventions = context.interventions || {};
    const talentsInterests = context.talentsInterests || {};
    const patterns = context.patternInsights || [];

    const academicPerf = academic.gpa || 0;
    const performanceTrend = academic.performanceTrend || 'stable';
    const hasPositiveBehavior = (behavioral.positiveCount || 0) > (behavioral.negativeCount || 0);
    const attendanceRate = attendance.rate || 0;
    const riskLevel = risk.level || 'DÜŞÜK';
    const hasActiveInterventions = (interventions.activeInterventions || []).length > 0;

    const motivationLevel = academicPerf >= 70 && performanceTrend === 'improving' ? 'YÜKSEK' : 
                           academicPerf < 50 && performanceTrend === 'declining' ? 'DÜŞÜK' : 'ORTA';
    
    const learningOrientation = performanceTrend === 'improving' ? 'ÖĞRENME_ODAKLI' : 
                               performanceTrend === 'declining' ? 'KAÇINMA_ODAKLI' : 'KARMA';

    const selCompetencies = socialEmotional.competencies || {};
    const avgSEL = Object.values(selCompetencies).length > 0 ?
      (Object.values(selCompetencies).reduce((a: any, b: any) => Number(a) + Number(b), 0) as number) / Object.values(selCompetencies).length : 5;

    const socialIntegrationLevel = avgSEL >= 7 ? 'İYİ_ENTEGRE' : avgSEL < 4 ? 'İZOLE' : 'ORTA_ENTEGRE';
    const friendshipQuality = avgSEL >= 7 ? 'SAĞLIKLI' : avgSEL < 4 ? 'SORUNLU' : 'GELIŞEN';

    const hasAttendanceIssues = attendanceRate < 80 || (attendance.recentAbsences || 0) >= 5;
    const hasBehaviorIssues = (behavioral.negativeCount || 0) >= 3;
    const isHighRisk = riskLevel === 'YÜKSEK' || riskLevel === 'ÇOK_YÜKSEK';

    const criticalPatterns = patterns.filter((p: any) => p.severity === 'CRITICAL');
    const warningPatterns = patterns.filter((p: any) => p.severity === 'WARNING');

    return {
      studentId,
      studentName: context.student.name,
      analysisDate: new Date().toISOString(),
      motivationalProfile: {
        intrinsicMotivation: {
          level: motivationLevel,
          indicators: [
            academicPerf >= 70 ? 'Akademik başarı motivasyon göstergesi' : 'Akademik performans düşük',
            performanceTrend === 'improving' ? 'Gelişen performans trendi' : performanceTrend === 'declining' ? 'Düşen performans trendi' : 'Stabil performans',
            ...(talentsInterests.interests || []).length > 0 ? ['İlgi alanları belirlenmiş'] : []
          ],
          developmentAreas: [
            academicPerf < 60 ? 'Akademik motivasyon artırma' : 'Motivasyonu sürdürme',
            ...(talentsInterests.interests || []).length === 0 ? ['İlgi alanları keşfi'] : []
          ]
        },
        extrinsicMotivation: {
          level: hasPositiveBehavior ? 'ORTA' : 'DÜŞÜK',
          primaryDrivers: [
            hasPositiveBehavior ? 'Olumlu pekiştirme etkili' : 'Dışsal motivatörler zayıf',
            ...(interventions.activeInterventions || []).length > 0 ? ['Müdahale programlarına yanıt'] : []
          ],
          effectiveRewards: [
            'Akademik başarı takdiri',
            'Sosyal kabul ve onay',
            ...(talentsInterests.talents || []).length > 0 ? ['Yetenek alanlarında fırsatlar'] : []
          ]
        },
        learningOrientation: learningOrientation,
        goalSetting: {
          quality: hasActiveInterventions ? 'GELİŞTİRİLEBİLİR' : academicPerf >= 70 ? 'ETKİLİ' : 'ZAYIF',
          autonomy: Math.min(100, Math.max(0, academicPerf)),
          recommendations: [
            academicPerf < 60 ? 'SMART hedef belirleme desteği' : 'Hedef takibi ve değerlendirme',
            'Özerklik ve sorumluluk artırma'
          ]
        },
        resilienceFactors: {
          strengths: [
            ...(talentsInterests.talents || []),
            attendanceRate >= 90 ? 'Yüksek devam düzenli' : attendanceRate >= 80 ? 'İyi devam' : '',
            hasPositiveBehavior ? 'Olumlu davranış kapasitesi' : '',
            ...risk.protectiveFactors || []
          ].filter(Boolean),
          vulnerabilities: [
            isHighRisk ? `${riskLevel} risk seviyesi` : '',
            hasAttendanceIssues ? 'Devamsızlık sorunu' : '',
            hasBehaviorIssues ? 'Davranışsal zorluklar' : '',
            academicPerf < 50 ? 'Akademik güçlük' : ''
          ].filter(Boolean),
          copingStrategies: [
            ...(interventions.recentSessions || []).map((s: any) => `${s.type} görüşmeleri`),
            hasActiveInterventions ? 'Aktif müdahale programları' : 'Temel destek mekanizmaları'
          ]
        }
      },
      familyDynamics: {
        parentalInvolvement: {
          level: (interventions.recentSessions || []).some((s: any) => s.type === 'Veli') ? 'ORTA' : 'İNCELENEMEDİ',
          quality: hasAttendanceIssues || hasBehaviorIssues ? 'KARMA' : 'BELİRSİZ',
          communicationPatterns: [
            (interventions.recentSessions || []).some((s: any) => s.type === 'Veli') ? 
              'Okul ile iletişim mevcut' : 'Aile iletişimi sınırlı'
          ],
          improvementAreas: ['Düzenli aile görüşmeleri', 'Ev-okul işbirliği güçlendirme']
        },
        familyStructure: {
          type: 'Mevcut verilerden belirlenemedi',
          stabilityLevel: isHighRisk ? 'UNSTABLE' : 'UNKNOWN',
          impactOnStudent: [
            isHighRisk ? 'Aile faktörleri risk seviyesini etkileyebilir' : 'Aile desteği değerlendirilmeli'
          ]
        },
        socioeconomicFactors: {
          indicators: ['Detaylı sosyoekonomik veri yok'],
          resourceAvailability: 'BELİRSİZ',
          supportNeeds: [
            isHighRisk ? 'Kapsamlı aile desteği' : 'Standart kaynak desteği',
            'Sosyoekonomik durum değerlendirmesi'
          ]
        },
        culturalContext: {
          factors: ['Kültürel faktörler değerlendirilmeli'],
          considerationsForIntervention: [
            'Kültürel hassasiyet',
            'Aile değerleri ve beklentileri göz önünde bulundurma'
          ]
        },
        familySupport: {
          emotionalSupport: attendanceRate >= 90 ? 70 : attendanceRate >= 80 ? 50 : 30,
          academicSupport: academicPerf >= 70 ? 70 : academicPerf >= 50 ? 50 : 30,
          practicalSupport: hasAttendanceIssues ? 30 : 50,
          recommendations: [
            'Aile katılım programları',
            hasAttendanceIssues || hasBehaviorIssues ? 'Yoğunlaştırılmış aile danışmanlığı' : 'Düzenli aile iletişimi'
          ]
        }
      },
      peerRelationships: {
        socialIntegration: {
          level: socialIntegrationLevel,
          friendshipQuality: friendshipQuality,
          peerAcceptance: Math.min(100, Math.max(0, avgSEL * 10)),
          indicators: [
            ...(socialEmotional.strengths || []),
            avgSEL >= 7 ? 'Güçlü sosyal yetkinlikler' : 'Sosyal beceri gelişimi gerekli'
          ]
        },
        socialSkills: {
          strengths: socialEmotional.strengths || ['Değerlendirilmeli'],
          challenges: socialEmotional.challenges || ['Değerlendirilmeli'],
          developmentPriorities: [
            avgSEL < 5 ? 'Temel sosyal beceriler' : 'İleri sosyal yetkinlikler',
            ...(socialEmotional.challenges || []).slice(0, 2)
          ]
        },
        peerInfluence: {
          positiveInfluences: hasPositiveBehavior ? ['Olumlu akran etkileşimleri mevcut'] : [],
          negativeInfluences: hasBehaviorIssues ? ['Olumsuz akran etkisi olasılığı'] : [],
          riskFactors: [
            ...(risk.factors || []).filter((f: string) => f.includes('akran') || f.includes('sosyal')),
            socialIntegrationLevel === 'İZOLE' ? 'Sosyal izolasyon riski' : ''
          ].filter(Boolean),
          protectiveActions: [
            'Olumlu akran gruplarına yönlendirme',
            socialIntegrationLevel === 'İZOLE' ? 'Sosyal entegrasyon programı' : 'Akran desteği sürdürme'
          ]
        },
        bullying: {
          victimIndicators: socialIntegrationLevel === 'İZOLE' ? ['Sosyal izolasyon', 'Gözlem gerekli'] : [],
          perpetratorIndicators: hasBehaviorIssues ? ['Davranış sorunları', 'Gözlem gerekli'] : [],
          bystanderBehavior: [],
          interventionNeeds: [
            ...(socialIntegrationLevel === 'İZOLE' || hasBehaviorIssues ? ['Zorbalık tarama'] : []),
            'Güvenli okul ortamı protokolleri'
          ]
        },
        socialEmotionalCompetencies: {
          selfAwareness: Math.min(100, (selCompetencies['Öz-farkındalık'] || 5) * 10),
          selfManagement: Math.min(100, (selCompetencies['Duygu Düzenleme'] || 5) * 10),
          socialAwareness: Math.min(100, (selCompetencies['Empati'] || 5) * 10),
          relationshipSkills: Math.min(100, (selCompetencies['İlişki Becerileri'] || 5) * 10),
          responsibleDecisionMaking: Math.min(100, (selCompetencies['Sorumlu Karar Verme'] || 5) * 10),
          focusAreas: [
            ...Object.entries(selCompetencies)
              .filter(([_, v]: any) => v < 5)
              .map(([k, _]: any) => k),
            ...(Object.keys(selCompetencies).length === 0 ? ['Kapsamlı SEL değerlendirmesi'] : [])
          ]
        }
      },
      developmentalFactors: {
        ageAppropriatenesss: {
          academicDevelopment: academicPerf >= 70 ? 'İLERİDE' : academicPerf < 50 ? 'GECİKMİŞ' : 'UYGUN',
          socialDevelopment: avgSEL >= 7 ? 'İLERİDE' : avgSEL < 4 ? 'GECİKMİŞ' : 'UYGUN',
          emotionalDevelopment: avgSEL >= 7 && !hasBehaviorIssues ? 'UYGUN' : hasBehaviorIssues ? 'GECİKMİŞ' : 'UYGUN',
          considerations: [
            context.student.age ? `${context.student.age} yaş gelişim özellikleri` : 'Yaş bilgisi değerlendirilmeli',
            'Sınıf seviyesi beklentileri',
            ...(academicPerf < 50 || hasBehaviorIssues ? ['Gelişimsel değerlendirme gerekli'] : [])
          ]
        },
        criticalDevelopmentalNeeds: [
          ...(academicPerf < 50 ? ['Akademik gelişim desteği'] : []),
          ...(avgSEL < 4 ? ['Sosyal-duygusal gelişim'] : []),
          ...(hasBehaviorIssues ? ['Davranışsal düzenleme becerileri'] : []),
          ...(criticalPatterns.length === 0 && warningPatterns.length === 0 ? ['Gelişimsel izleme'] : [])
        ],
        transitions: {
          currentTransitions: [
            `${context.student.grade} sınıf geçişi`,
            ...(isHighRisk ? ['Risk durumu yönetimi'] : [])
          ],
          supportNeeded: [
            'Geçiş dönemleri desteği',
            ...(isHighRisk ? ['Yoğunlaştırılmış rehberlik'] : ['Standart rehberlik desteği'])
          ],
          expectedChallenges: [
            ...(performanceTrend === 'declining' ? ['Akademik zorluklar artabilir'] : []),
            ...(hasBehaviorIssues ? ['Davranış yönetimi zorluğu'] : []),
            'Sosyal uyum'
          ]
        }
      },
      synthesisAndRecommendations: {
        keyPsychologicalThemes: [
          motivationLevel === 'DÜŞÜK' ? 'Motivasyon kaybı' : motivationLevel === 'YÜKSEK' ? 'Güçlü motivasyon' : 'Karma motivasyon profili',
          socialIntegrationLevel === 'İZOLE' ? 'Sosyal izolasyon' : 'Sosyal gelişim süreci',
          ...(criticalPatterns.map((p: any) => p.title)),
          ...(isHighRisk ? [`${riskLevel} risk durumu`] : [])
        ],
        primaryConcerns: [
          ...(academicPerf < 50 ? ['Akademik başarısızlık riski'] : []),
          ...(hasAttendanceIssues ? ['Kronik devamsızlık'] : []),
          ...(hasBehaviorIssues ? ['Davranışsal problemler'] : []),
          ...(socialIntegrationLevel === 'İZOLE' ? ['Sosyal izolasyon'] : []),
          ...(criticalPatterns.length === 0 && warningPatterns.length === 0 && !isHighRisk ? ['Genel gelişim takibi'] : [])
        ],
        strengthsToLeverage: [
          ...(talentsInterests.talents || []),
          ...(talentsInterests.interests || []),
          ...(risk.protectiveFactors || []),
          attendanceRate >= 90 ? 'Yüksek devam motivasyonu' : '',
          hasPositiveBehavior ? 'Olumlu davranış potansiyeli' : ''
        ].filter(Boolean),
        criticalInterventions: [
          ...(isHighRisk ? [{
            area: 'Risk Yönetimi',
            priority: 'ACİL' as const,
            intervention: `${riskLevel} risk seviyesi için acil müdahale`,
            rationale: 'Öğrenci güvenliği ve refahı kritik',
            expectedOutcome: 'Risk seviyesi azaltma ve stabilizasyon',
            timeline: '1-2 hafta'
          }] : []),
          ...(academicPerf < 50 ? [{
            area: 'Akademik Destek',
            priority: 'YÜKSEK' as const,
            intervention: 'Yoğunlaştırılmış akademik destek programı',
            rationale: `Düşük akademik performans (${academicPerf.toFixed(1)})`,
            expectedOutcome: 'Akademik performans artışı',
            timeline: '6-8 hafta'
          }] : []),
          ...(hasBehaviorIssues ? [{
            area: 'Davranış Desteği',
            priority: 'YÜKSEK' as const,
            intervention: 'Olumlu davranış desteği (PBS) programı',
            rationale: `${behavioral.negativeCount} davranış olayı`,
            expectedOutcome: 'Davranış iyileşmesi',
            timeline: '4-6 hafta'
          }] : []),
          ...(hasAttendanceIssues ? [{
            area: 'Devam Artırma',
            priority: 'YÜKSEK' as const,
            intervention: 'Devamsızlık müdahale programı ve aile desteği',
            rationale: `%${attendanceRate.toFixed(0)} devam oranı`,
            expectedOutcome: 'Düzenli okul devamı',
            timeline: '3-4 hafta'
          }] : []),
          ...(socialIntegrationLevel === 'İZOLE' ? [{
            area: 'Sosyal Entegrasyon',
            priority: 'ORTA' as const,
            intervention: 'Sosyal beceri geliştirme ve akran desteği',
            rationale: 'Sosyal izolasyon tespit edildi',
            expectedOutcome: 'Gelişmiş sosyal ilişkiler',
            timeline: '8-10 hafta'
          }] : [])
        ],
        counselingApproach: {
          recommendedModality: isHighRisk ? 'Yoğun bireysel danışmanlık' : 
                              hasBehaviorIssues || hasAttendanceIssues ? 'Bireysel ve aile danışmanlığı' : 
                              'Bireysel ve grup danışmanlığı',
          therapeuticTechniques: [
            motivationLevel === 'DÜŞÜK' ? 'Motivasyonel görüşme' : 'Güçlendirme yaklaşımı',
            hasBehaviorIssues ? 'Bilişsel-davranışçı teknikler' : 'Çözüm odaklı terapi',
            avgSEL < 5 ? 'Sosyal-duygusal öğrenme' : 'Pozitif psikoloji',
            ...(criticalPatterns.length > 0 ? ['Travma-bilinçli yaklaşım'] : [])
          ],
          sessionFrequency: isHighRisk ? 'Haftada 2-3 kez' : 
                           hasBehaviorIssues || hasAttendanceIssues ? 'Haftada 1-2 kez' : 
                           'İki haftada 1',
          involvementNeeded: [
            'Öğrenci (bireysel)',
            ...(hasBehaviorIssues || hasAttendanceIssues || isHighRisk ? ['Aile (zorunlu)'] : ['Aile (önerilen)']),
            ...(academicPerf < 50 ? ['Öğretmenler (akademik destek)'] : []),
            ...(socialIntegrationLevel === 'İZOLE' ? ['Akran mentorları'] : [])
          ]
        },
        holisticWellbeingPlan: `${context.student.name} için bütüncül iyilik hali planı: ${
          isHighRisk ? 'ACİL risk müdahalesi ile başla. ' : ''
        }${
          academicPerf < 50 ? 'Akademik destek programına al. ' : academicPerf >= 70 ? 'Akademik başarıyı sürdür. ' : ''
        }${
          hasBehaviorIssues ? 'Davranış desteği uygula. ' : 'Olumlu davranışları pekiştir. '
        }${
          hasAttendanceIssues ? 'Devam sorunu için aile ile çalış. ' : ''
        }${
          socialIntegrationLevel === 'İZOLE' ? 'Sosyal entegrasyon programına dahil et. ' : ''
        }${
          avgSEL < 5 ? 'SEL yetkinliklerini geliştir. ' : ''
        }${
          (talentsInterests.talents || []).length > 0 ? `Yeteneklerini kullan: ${(talentsInterests.talents || []).join(', ')}. ` : ''
        }Düzenli izleme ve değerlendirme yap. ${
          patterns.length > 0 ? `Tespit edilen pattern'lere özel müdahale et: ${patterns.slice(0, 3).map((p: any) => p.title).join(', ')}.` : ''
        }`
      }
    };
  }
}

export default PsychologicalDepthAnalysisService;
