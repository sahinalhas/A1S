/**
 * Predictive Risk Timeline Service
 * Öngörücü Risk Zaman Çizelgesi Servisi
 * 
 * 24-48-72 saat risk tahminleri ve pattern bazlı öngörüler
 */

import { AIProviderService } from './ai-provider.service.js';
import { PatternAnalysisService, type PatternInsight } from './pattern-analysis.service.js';
import { StudentContextService } from './student-context.service.js';
import getDatabase from '../lib/database.js';

export interface TimeBasedRiskPrediction {
  timeframe: '24_HOURS' | '48_HOURS' | '72_HOURS' | '1_WEEK';
  riskLevel: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  probability: number;
  keyIndicators: string[];
  triggerEvents: string[];
  preventiveActions: string[];
}

export interface BehaviorPattern {
  patternType: 'AKADEMİK' | 'DAVRANIŞSAL' | 'SOSYAL' | 'DUYGUSAL' | 'DEVAMSIZLIK';
  patternName: string;
  frequency: 'GÜNLÜK' | 'HAFTALIK' | 'AYLIK' | 'MEVSİMSEL';
  confidence: number;
  description: string;
  triggers: string[];
  peakTimes: string[];
  interventionWindows: string[];
}

export interface PredictiveAlert {
  alertId: string;
  studentId: string;
  predictionDate: string;
  alertType: 'ERKEN_UYARI' | 'ACİL_MÜDAHALE' | 'İZLEME_GEREKLİ' | 'ÖNLEYICI_DESTEK';
  severity: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  title: string;
  description: string;
  predictedOutcome: string;
  preventionStrategy: string;
  actionDeadline: string;
  responsibleParties: string[];
}

export interface CausalAnalysis {
  observedEvent: string;
  eventDate: string;
  likelyRootCauses: Array<{
    cause: string;
    likelihood: number;
    evidence: string[];
    contributingFactors: string[];
  }>;
  contributingFactors: {
    academic: string[];
    social: string[];
    emotional: string[];
    environmental: string[];
    family: string[];
  };
  cascadeEffects: Array<{
    effect: string;
    probability: number;
    timeframe: string;
    preventionStrategies: string[];
  }>;
}

export interface PredictiveRiskTimeline {
  studentId: string;
  studentName: string;
  generatedAt: string;
  
  currentRiskStatus: {
    overallRisk: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
    activeAlerts: number;
    recentChanges: string[];
    urgentActions: string[];
  };
  
  timeBasedPredictions: {
    next24Hours: TimeBasedRiskPrediction;
    next48Hours: TimeBasedRiskPrediction;
    next72Hours: TimeBasedRiskPrediction;
    nextWeek: TimeBasedRiskPrediction;
  };
  
  identifiedPatterns: BehaviorPattern[];
  
  predictiveAlerts: PredictiveAlert[];
  
  causalAnalyses: CausalAnalysis[];
  
  earlyInterventionOpportunities: Array<{
    window: string;
    opportunity: string;
    expectedImpact: 'YÜKSEK' | 'ORTA' | 'DÜŞÜK';
    actionSteps: string[];
    resources: string[];
    deadline: string;
  }>;
  
  monitoringPlan: {
    checkpoints: Array<{
      time: string;
      whatToMonitor: string[];
      redFlags: string[];
      contactPerson: string;
    }>;
    escalationTriggers: string[];
    successIndicators: string[];
  };
}

class PredictiveRiskTimelineService {
  private aiProvider: AIProviderService;
  private patternService: PatternAnalysisService;
  private contextService: StudentContextService;
  private db: ReturnType<typeof getDatabase>;

  constructor() {
    this.aiProvider = AIProviderService.getInstance();
    this.patternService = new PatternAnalysisService();
    this.contextService = new StudentContextService();
    this.db = getDatabase();
  }

  async generatePredictiveTimeline(studentId: string): Promise<PredictiveRiskTimeline> {
    const [context, patterns] = await Promise.all([
      this.contextService.getStudentContext(studentId),
      this.patternService.analyzeStudentPatterns(studentId)
    ]);

    const isAvailable = await this.aiProvider.isAvailable();
    if (!isAvailable) {
      return this.generateFallbackTimeline(studentId, context, patterns);
    }

    const prompt = this.buildPredictivePrompt(context, patterns);

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen öğrenci risk değerlendirmesi konusunda uzman bir veri bilimcisi ve eğitim danışmanısın. Geçmiş verileri ve pattern\'leri analiz ederek gelecekteki riskleri öngörüyorsun. Zamansal tahminler, sebep-sonuç analizleri ve erken müdahale fırsatlarını belirleme konusunda uzmansın.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2
      });

      return this.parseTimelineResponse(studentId, context.student.name, response, patterns);
    } catch (error) {
      console.error('Predictive timeline error:', error);
      return this.generateFallbackTimeline(studentId, context, patterns);
    }
  }

  private buildPredictivePrompt(context: any, patterns: PatternInsight[]): string {
    return `Öğrenci için ÖNGÖRÜCÜ RİSK ZAMAN ÇİZELGESİ oluştur:

📊 ÖĞRENCİ BAĞLAMI:
${JSON.stringify(context, null, 2)}

📈 TESPİT EDİLEN PATTERN'LER:
${JSON.stringify(patterns, null, 2)}

🎯 ZAMAN BAZLI TAHMİNLER:

1. SONRAKİ 24 SAAT:
   - Risk seviyesi tahmini
   - Olası tetikleyici olaylar
   - Acil önleyici aksiyonlar
   - İzleme gereklilikleri

2. SONRAKİ 48 SAAT:
   - Risk gelişimi
   - Kritik müdahale pencereleri
   - Kaynak ihtiyaçları

3. SONRAKİ 72 SAAT:
   - Orta vadeli risk eğilimleri
   - Kümülatif etkiler
   - Stratejik önlemler

4. GELECEK HAFTA:
   - Haftalık risk projeksiyonu
   - Önemli olaylar/tarihler
   - Uzun vadeli önleme stratejileri

🔍 DAVRANIŞSAL PATTERN ANALİZİ:
- Pattern tipleri (akademik, davranışsal, sosyal, duygusal)
- Frekans ve döngüler
- Tetikleyiciler ve zirve zamanları
- Müdahale pencereleri

⚠️ ÖNGÖRÜCÜ UYARILAR:
- Erken uyarı sinyalleri
- Acil müdahale gerektiren durumlar
- Önleyici destek fırsatları
- Aksiyon son tarihleri

🔗 SEBEP-SONUÇ ANALİZİ:
- Gözlemlenen olayların kök nedenleri
- Katkıda bulunan faktörler (akademik, sosyal, duygusal, çevresel, aile)
- Zincirleme etkiler ve önleme stratejileri

💡 ERKEN MÜDAHALE FIRSATLARI:
- Müdahale pencereleri
- Beklenen etki seviyeleri
- Aksiyon adımları ve kaynaklar

📋 İZLEME PLANI:
- Kontrol noktaları ve zamanları
- İzlenecek göstergeler
- Kırmızı bayraklar
- Yükselme tetikleyicileri
- Başarı göstergeleri

⚠️ ÖNEMLİ:
- Veri-driven tahminler yap
- Spesifik zaman dilimleri belirt
- Uygulanabilir aksiyonlar öner
- Risk seviyelerini net belirt
- Önleyici yaklaşıma odaklan

Yanıtını JSON formatında ver (TypeScript PredictiveRiskTimeline tipine uygun).`;
  }

  private parseTimelineResponse(
    studentId: string,
    studentName: string,
    response: string,
    patterns: PatternInsight[]
  ): PredictiveRiskTimeline {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          studentId,
          studentName,
          generatedAt: new Date().toISOString(),
          ...parsed
        };
      }
    } catch (error) {
      console.error('Parse error:', error);
    }

    return this.generateFallbackTimeline(studentId, { student: { name: studentName } }, patterns);
  }

  private generateFallbackTimeline(studentId: string, context: any, patterns: PatternInsight[]): PredictiveRiskTimeline {
    const urgentPatterns = patterns.filter(p => p.severity === 'CRITICAL' || p.severity === 'WARNING');
    const criticalPatterns = patterns.filter(p => p.severity === 'CRITICAL');
    
    const academic = context.academic || {};
    const behavioral = context.behavioral || {};
    const attendance = context.attendance || {};
    const risk = context.risk || {};
    const riskLevel = risk.level || 'DÜŞÜK';
    
    const academicPerf = academic.gpa || 0;
    const attendanceRate = attendance.rate || 0;
    const recentAbsences = attendance.recentAbsences || 0;
    const behaviorIssues = behavioral.negativeCount || 0;
    const performanceTrend = academic.performanceTrend || 'stable';
    
    const calculateOverallRisk = (): 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK' => {
      let riskScore = 0;
      if (criticalPatterns.length > 0) riskScore += 40;
      if (urgentPatterns.length > 2) riskScore += 30;
      if (riskLevel === 'YÜKSEK' || riskLevel === 'ÇOK_YÜKSEK') riskScore += 20;
      if (attendanceRate < 70) riskScore += 20;
      if (behaviorIssues >= 5) riskScore += 20;
      if (academicPerf < 40) riskScore += 15;
      if (performanceTrend === 'declining') riskScore += 15;
      
      if (riskScore >= 80) return 'KRİTİK';
      if (riskScore >= 50) return 'YÜKSEK';
      if (riskScore >= 25) return 'ORTA';
      return 'DÜŞÜK';
    };
    
    const overallRisk = calculateOverallRisk();
    
    return {
      studentId,
      studentName: context.student.name,
      generatedAt: new Date().toISOString(),
      currentRiskStatus: {
        overallRisk,
        activeAlerts: urgentPatterns.length + (risk.alerts || []).length,
        recentChanges: [
          ...patterns.slice(0, 2).map(p => p.description),
          performanceTrend === 'declining' ? 'Akademik performans düşüşü' : '',
          recentAbsences >= 5 ? `Son dönemde ${recentAbsences} gün devamsızlık` : '',
          behaviorIssues >= 3 ? `${behaviorIssues} davranış olayı` : ''
        ].filter(Boolean),
        urgentActions: [
          ...urgentPatterns.map(p => p.recommendation || 'İzleme gerekli'),
          ...(overallRisk === 'KRİTİK' ? ['ACİL müdahale protokolü başlat'] : []),
          ...(recentAbsences >= 10 ? ['Devamsızlık için acil aile görüşmesi'] : []),
          ...(behaviorIssues >= 5 ? ['Davranış destek planı uygula'] : [])
        ]
      },
      timeBasedPredictions: {
        next24Hours: {
          timeframe: '24_HOURS',
          riskLevel: overallRisk === 'KRİTİK' ? 'KRİTİK' : criticalPatterns.length > 0 ? 'YÜKSEK' : urgentPatterns.length > 0 ? 'ORTA' : 'DÜŞÜK',
          probability: overallRisk === 'KRİTİK' ? 85 : criticalPatterns.length > 0 ? 75 : urgentPatterns.length > 0 ? 60 : 25,
          keyIndicators: [
            ...urgentPatterns.slice(0, 2).map(p => p.title),
            recentAbsences >= 3 ? 'Devamsızlık trendi' : '',
            behaviorIssues >= 3 ? 'Davranış sorunları devam ediyor' : '',
            performanceTrend === 'declining' ? 'Akademik düşüş sürüyor' : ''
          ].filter(Boolean),
          triggerEvents: [
            ...criticalPatterns.map(p => `${p.title} tetikleyicisi`),
            recentAbsences >= 5 ? 'Devamsızlık paterni' : '',
            behaviorIssues >= 5 ? 'Davranış krizi olasılığı' : 'Stresli durumlar'
          ].filter(Boolean),
          preventiveActions: [
            overallRisk === 'KRİTİK' ? 'ACİL müdahale başlat' : 'Yakın izleme',
            recentAbsences >= 5 ? 'Aile ile acil görüşme' : 'Destekleyici iletişim',
            criticalPatterns.length > 0 ? 'Kriz müdahale planı aktive et' : 'Erken müdahale hazırlığı'
          ]
        },
        next48Hours: {
          timeframe: '48_HOURS',
          riskLevel: overallRisk === 'KRİTİK' ? 'YÜKSEK' : overallRisk === 'YÜKSEK' ? 'YÜKSEK' : urgentPatterns.length > 0 ? 'ORTA' : 'DÜŞÜK',
          probability: overallRisk === 'KRİTİK' ? 80 : overallRisk === 'YÜKSEK' ? 70 : urgentPatterns.length > 0 ? 55 : 20,
          keyIndicators: [
            ...patterns.slice(0, 3).map(p => p.title),
            academicPerf < 50 ? 'Düşük akademik performans' : '',
            attendanceRate < 80 ? 'Devam sorunu' : ''
          ].filter(Boolean),
          triggerEvents: [
            'Kümülatif stres faktörleri',
            behaviorIssues >= 3 ? 'Davranış pattern\'i devam edebilir' : '',
            performanceTrend === 'declining' ? 'Akademik motivasyon kaybı' : 'Sosyal zorluklar'
          ].filter(Boolean),
          preventiveActions: [
            overallRisk === 'KRİTİK' || overallRisk === 'YÜKSEK' ? 'Aile ile yoğun işbirliği' : 'Aile ile iletişim',
            academicPerf < 50 ? 'Akademik destek planı hazırla' : 'Destek planı hazırlama',
            behaviorIssues >= 3 ? 'Davranış desteği aktive et' : 'İzleme sürdür'
          ]
        },
        next72Hours: {
          timeframe: '72_HOURS',
          riskLevel: overallRisk === 'KRİTİK' ? 'YÜKSEK' : overallRisk === 'YÜKSEK' ? 'ORTA' : 'ORTA',
          probability: overallRisk === 'KRİTİK' ? 70 : overallRisk === 'YÜKSEK' ? 60 : 45,
          keyIndicators: [
            'Mevcut trend devamı',
            ...patterns.filter(p => p.category === 'TREND').map(p => p.title),
            'Çevresel faktörler'
          ],
          triggerEvents: [
            'Hafta sonu etkisi',
            academicPerf < 50 ? 'Ödev/sınav stresi artabilir' : 'Normal akademik baskı',
            recentAbsences >= 5 ? 'Devamsızlık pattern\'i sürebilir' : ''
          ].filter(Boolean),
          preventiveActions: [
            'Hafta sonu destek planı',
            academicPerf < 50 ? 'Ödev desteği sağla' : '',
            recentAbsences >= 5 ? 'Hafta sonu aile görüşmesi' : 'Kaynak temini'
          ].filter(Boolean)
        },
        nextWeek: {
          timeframe: '1_WEEK',
          riskLevel: overallRisk === 'KRİTİK' ? 'YÜKSEK' : overallRisk === 'YÜKSEK' ? 'ORTA' : urgentPatterns.length > 0 ? 'ORTA' : 'DÜŞÜK',
          probability: overallRisk === 'KRİTİK' ? 65 : overallRisk === 'YÜKSEK' ? 55 : urgentPatterns.length > 0 ? 45 : 30,
          keyIndicators: [
            'Uzun vadeli pattern\'ler',
            performanceTrend === 'declining' ? 'Akademik düşüş trendi' : '',
            ...patterns.filter(p => p.category === 'PATTERN').map(p => p.title)
          ].filter(Boolean),
          triggerEvents: [
            'Dönemsel değişiklikler',
            academicPerf < 50 ? 'Sınav dönemi yaklaşıyor' : 'Önemli tarihler',
            behaviorIssues >= 3 ? 'Davranış pattern\'lerinin pekişmesi' : ''
          ].filter(Boolean),
          preventiveActions: [
            overallRisk === 'KRİTİK' || overallRisk === 'YÜKSEK' ? 'Yoğunlaştırılmış destek programı' : 'Kapsamlı destek planı',
            academicPerf < 50 ? 'Akademik müdahale başlat' : '',
            behaviorIssues >= 3 ? 'Davranış desteği sistematikleştir' : 'Müdahale hazırlığı'
          ].filter(Boolean)
        }
      },
      identifiedPatterns: patterns.map(p => ({
        patternType: this.categorizPattern(p.category),
        patternName: p.title,
        frequency: 'HAFTALIK',
        confidence: p.severity === 'CRITICAL' ? 90 : p.severity === 'WARNING' ? 70 : 50,
        description: p.description,
        triggers: p.evidence,
        peakTimes: ['Belirleniyor'],
        interventionWindows: ['Sabah saatleri', 'Ders arası']
      })),
      predictiveAlerts: urgentPatterns.map((p, i) => ({
        alertId: `pred-${Date.now()}-${i}`,
        studentId,
        predictionDate: new Date().toISOString(),
        alertType: p.severity === 'CRITICAL' ? 'ACİL_MÜDAHALE' : 'ERKEN_UYARI',
        severity: p.severity === 'CRITICAL' ? 'YÜKSEK' : 'ORTA',
        title: p.title,
        description: p.description,
        predictedOutcome: 'Risk artışı olasılığı',
        preventionStrategy: p.recommendation || 'Yakın izleme ve destek',
        actionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        responsibleParties: ['Rehber Öğretmen', 'Sınıf Öğretmeni']
      })),
      causalAnalyses: [
        ...(patterns.slice(0, 2).map(p => ({
          observedEvent: p.title,
          eventDate: new Date().toISOString(),
          likelyRootCauses: [
            {
              cause: p.category === 'TREND' ? 'Süregelen akademik veya davranışsal pattern' :
                     p.category === 'CORRELATION' ? 'Çoklu faktör etkileşimi' :
                     p.category === 'PATTERN' ? 'Tekrarlayan davranış döngüsü' : 'Altta yatan faktörler',
              likelihood: p.severity === 'CRITICAL' ? 85 : p.severity === 'WARNING' ? 70 : 50,
              evidence: p.evidence,
              contributingFactors: [
                ...(academicPerf < 50 ? ['Düşük akademik performans'] : []),
                ...(behaviorIssues >= 3 ? ['Davranış sorunları'] : []),
                ...(recentAbsences >= 5 ? ['Devamsızlık pattern\'i'] : []),
                ...(performanceTrend === 'declining' ? ['Akademik düşüş trendi'] : [])
              ]
            }
          ],
          contributingFactors: {
            academic: [
              ...(p.category === 'TREND' ? [p.description] : []),
              ...(academicPerf < 50 ? [`Düşük GPA: ${academicPerf.toFixed(1)}`] : []),
              ...(performanceTrend === 'declining' ? ['Performans düşüşü'] : [])
            ],
            social: [
              ...(p.category === 'PATTERN' && p.title.includes('sosyal') ? [p.description] : []),
              ...(context.socialEmotional?.challenges || []).slice(0, 2)
            ],
            emotional: [
              ...(p.category === 'CORRELATION' ? [p.description] : []),
              ...(behaviorIssues >= 3 ? ['Duygusal düzenleme zorluğu göstergeleri'] : [])
            ],
            environmental: [
              ...(recentAbsences >= 5 ? ['Okul ortamı uyum sorunları olasılığı'] : []),
              ...(riskLevel === 'YÜKSEK' || riskLevel === 'ÇOK_YÜKSEK' ? ['Çevresel risk faktörleri'] : [])
            ],
            family: [
              ...(recentAbsences >= 5 || behaviorIssues >= 3 ? ['Aile desteği değerlendirilmeli'] : []),
              ...((context.interventions?.recentSessions || []).some((s: any) => s.type === 'Veli') ? 
                ['Aile iletişimi mevcut'] : ['Aile katılımı sınırlı'])
            ]
          },
          cascadeEffects: [
            {
              effect: p.severity === 'CRITICAL' ? 'Kriz durumu gelişebilir' : 
                     p.severity === 'WARNING' ? 'Durum kötüleşebilir' : 'Hafif olumsuz etki',
              probability: p.severity === 'CRITICAL' ? 75 : p.severity === 'WARNING' ? 60 : 40,
              timeframe: p.severity === 'CRITICAL' ? '1-3 gün' : p.severity === 'WARNING' ? '3-7 gün' : '1-2 hafta',
              preventionStrategies: [
                p.recommendation || 'Müdahale planı',
                ...(p.severity === 'CRITICAL' ? ['ACİL müdahale protokolü'] : []),
                ...(academicPerf < 50 ? ['Akademik destek yoğunlaştır'] : []),
                ...(behaviorIssues >= 3 ? ['Davranış desteği başlat'] : [])
              ]
            },
            ...(p.severity === 'CRITICAL' && academicPerf < 50 ? [{
              effect: 'Akademik başarısızlık riski artıyor',
              probability: 70,
              timeframe: '1-2 hafta',
              preventionStrategies: ['Yoğun akademik destek', 'Bireyselleştirilmiş öğrenme planı']
            }] : []),
            ...(behaviorIssues >= 5 ? [{
              effect: 'Davranış krizi riski',
              probability: 65,
              timeframe: '3-5 gün',
              preventionStrategies: ['Davranış krizi planı hazırla', 'Aile ve uzman desteği']
            }] : [])
          ]
        }))),
        ...(performanceTrend === 'declining' && academicPerf < 60 ? [{
          observedEvent: 'Akademik Performans Düşüşü',
          eventDate: new Date().toISOString(),
          likelyRootCauses: [
            {
              cause: 'Motivasyon kaybı ve/veya öğrenme güçlüğü',
              likelihood: 75,
              evidence: [
                `Performans trendi: ${performanceTrend}`,
                `Mevcut GPA: ${academicPerf.toFixed(1)}`,
                ...(recentAbsences >= 3 ? [`${recentAbsences} gün devamsızlık`] : [])
              ],
              contributingFactors: [
                ...(recentAbsences >= 3 ? ['Devamsızlık etkisi'] : []),
                ...(behaviorIssues >= 2 ? ['Davranış sorunları dikkat dağılımı'] : []),
                'Müfredat zorluk seviyesi',
                'Destek sistemi yetersizliği'
              ]
            }
          ],
          contributingFactors: {
            academic: [`Düşüşen performans: ${performanceTrend}`, `GPA: ${academicPerf.toFixed(1)}`],
            social: context.socialEmotional?.challenges || [],
            emotional: behaviorIssues >= 2 ? ['Davranışsal göstergeler'] : [],
            environmental: recentAbsences >= 3 ? ['Okula devam sorunları'] : [],
            family: ['Aile desteği değerlendirmesi gerekli']
          },
          cascadeEffects: [
            {
              effect: 'Akademik başarısızlık ve risk artışı',
              probability: 70,
              timeframe: '2-4 hafta',
              preventionStrategies: [
                'Acil akademik müdahale',
                'Öğrenme güçlüğü taraması',
                'Motivasyon programı',
                'Birebir ders desteği'
              ]
            }
          ]
        }] : [])
      ],
      earlyInterventionOpportunities: [
        ...(overallRisk === 'KRİTİK' ? [{
          window: 'HEMEN - 24 saat',
          opportunity: 'ACİL kriz müdahalesi',
          expectedImpact: 'YÜKSEK' as const,
          actionSteps: [
            'Acil risk değerlendirmesi',
            'Kriz müdahale protokolü başlat',
            'Aile ile acil görüşme',
            'Öğrenci güvenliği sağla',
            'Uzman konsültasyonu'
          ],
          resources: ['Kriz ekibi', 'Okul psikoloğu', 'Aile', 'İlgili uzmanlar'],
          deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        }] : []),
        ...(criticalPatterns.length > 0 || overallRisk === 'YÜKSEK' ? [{
          window: 'Bugün - 48 saat',
          opportunity: 'Yüksek riskli durumlar için erken müdahale',
          expectedImpact: 'YÜKSEK' as const,
          actionSteps: [
            'Öğrenci ile bireysel görüşme',
            'Risk faktörlerini değerlendir',
            'Aile bilgilendirme ve katılım',
            'Acil destek planı hazırla',
            'Günlük izleme başlat'
          ],
          resources: ['Rehberlik servisi', 'Okul psikoloğu', 'Sınıf öğretmeni', 'Aile'],
          deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
        }] : []),
        ...(academicPerf < 50 ? [{
          window: '2-5 gün',
          opportunity: 'Akademik destek fırsatı',
          expectedImpact: overallRisk === 'YÜKSEK' || overallRisk === 'KRİTİK' ? 'YÜKSEK' as const : 'ORTA' as const,
          actionSteps: [
            'Akademik zayıf alanları belirle',
            performanceTrend === 'declining' ? 'Motivasyon kaybı nedenlerini araştır' : 'Öğrenme güçlükleri tara',
            'Bireyselleştirilmiş destek planı',
            'Ek ders/etüt programı',
            'Haftalık ilerleme takibi'
          ],
          resources: ['Ders öğretmenleri', 'Etüt merkezi', 'Akran mentorluk', 'Öğretim materyalleri'],
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
        }] : []),
        ...(behaviorIssues >= 3 ? [{
          window: '1-3 gün',
          opportunity: 'Davranış desteği müdahale penceresi',
          expectedImpact: behaviorIssues >= 5 ? 'YÜKSEK' as const : 'ORTA' as const,
          actionSteps: [
            'Davranış pattern analizi',
            'Tetikleyicileri belirle',
            'Olumlu davranış desteği (PBS) planı',
            'Sosyal-duygusal beceri eğitimi',
            'Aile işbirliği'
          ],
          resources: ['Rehber öğretmen', 'Davranış uzmanı', 'SEL programı', 'Aile katılımı'],
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        }] : []),
        ...(recentAbsences >= 5 ? [{
          window: '1-4 gün',
          opportunity: 'Devamsızlık müdahale fırsatı',
          expectedImpact: recentAbsences >= 10 ? 'YÜKSEK' as const : 'ORTA' as const,
          actionSteps: [
            'Devamsızlık nedenlerini araştır',
            'Aile görüşmesi planla',
            'Okula bağlanma stratejileri',
            'Telafi programı hazırla',
            'Günlük devam takibi'
          ],
          resources: ['Rehberlik servisi', 'Aile', 'Sınıf öğretmeni', 'Okul yönetimi'],
          deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
        }] : []),
        ...(urgentPatterns.length > 0 && overallRisk === 'ORTA' ? [{
          window: '3-7 gün',
          opportunity: 'Önleyici destek fırsatı',
          expectedImpact: 'ORTA' as const,
          actionSteps: [
            'Öğrenci güçlü yönlerini belirle',
            'Koruyucu faktörleri pekiştir',
            'Destek ağı oluştur',
            'İzleme ve değerlendirme planı'
          ],
          resources: ['Rehberlik servisi', 'Sınıf öğretmeni', 'Akran desteği', 'Aile'],
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }] : []),
        ...(urgentPatterns.length === 0 && overallRisk === 'DÜŞÜK' ? [{
          window: '1-2 hafta',
          opportunity: 'Rutin destek ve izleme',
          expectedImpact: 'DÜŞÜK' as const,
          actionSteps: [
            'Genel refah kontrolü',
            'Başarıları pekiştir',
            'Gelişim alanlarını destekle',
            'Düzenli izleme sürdür'
          ],
          resources: ['Sınıf öğretmeni', 'Rehberlik servisi (periyodik)'],
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
        }] : [])
      ],
      monitoringPlan: {
        checkpoints: [
          {
            time: 'Her gün saat 09:00',
            whatToMonitor: ['Devamsızlık', 'Genel durum', 'Davranış'],
            redFlags: urgentPatterns.map(p => p.title),
            contactPerson: 'Rehber Öğretmen'
          },
          {
            time: 'Her gün saat 14:00',
            whatToMonitor: ['Ders katılımı', 'Sosyal etkileşim'],
            redFlags: ['Geri çekilme', 'İzolasyon'],
            contactPerson: 'Sınıf Öğretmeni'
          }
        ],
        escalationTriggers: [
          'Devamsızlık artışı',
          'Akademik performans düşüşü',
          'Davranış değişiklikleri',
          'Sosyal izolasyon'
        ],
        successIndicators: [
          'Düzenli devam',
          'Ders katılımı artışı',
          'Pozitif sosyal etkileşim',
          'İyileşen akademik performans'
        ]
      }
    };
  }

  private categorizPattern(category: string): BehaviorPattern['patternType'] {
    switch (category) {
      case 'TREND':
        return 'AKADEMİK';
      case 'PATTERN':
        return 'DAVRANIŞSAL';
      case 'CORRELATION':
        return 'SOSYAL';
      case 'ANOMALY':
        return 'DUYGUSAL';
      default:
        return 'DAVRANIŞSAL';
    }
  }
}

export default PredictiveRiskTimelineService;
