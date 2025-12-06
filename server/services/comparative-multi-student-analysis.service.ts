/**
 * Comparative Multi-Student Analysis Service
 * Çoklu Öğrenci Karşılaştırmalı Analiz Servisi
 * 
 * Sınıf pattern analizi, risk korelasyonları ve grup dinamikleri
 */

import { AIProviderService } from './ai-provider.service.js';
import { StudentContextService } from './student-context.service.js';
import { PatternAnalysisService } from './pattern-analysis.service.js';
import getDatabase from '../lib/database.js';
import { aiErrorHandler } from './ai-error-handler.service.js';

export interface StudentComparison {
  studentId: string;
  studentName: string;
  academicScore: number;
  behaviorScore: number;
  riskLevel: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  keyStrengths: string[];
  keyChallenges: string[];
  interventionPriority: number;
}

export interface ClassPattern {
  patternId: string;
  patternName: string;
  affectedStudents: string[];
  frequency: 'YAYGIN' | 'ORTA' | 'NADİR';
  severity: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  description: string;
  possibleCauses: string[];
  classLevelInterventions: string[];
}

export interface RiskCorrelation {
  factor1: string;
  factor2: string;
  correlationType: 'POZİTİF' | 'NEGATİF' | 'NÖTR';
  strength: number;
  affectedCount: number;
  explanation: string;
  preventionStrategy: string;
}

export interface GroupDynamics {
  positiveGroups: Array<{
    members: string[];
    characteristics: string[];
    leverageOpportunities: string[];
  }>;
  riskGroups: Array<{
    members: string[];
    riskFactors: string[];
    interventionNeeds: string[];
  }>;
  isolatedStudents: Array<{
    studentId: string;
    name: string;
    isolationReasons: string[];
    integrationStrategies: string[];
  }>;
  leadershipOpportunities: Array<{
    studentId: string;
    name: string;
    leadershipType: string;
    developmentPlan: string[];
  }>;
}

export interface ComparativeAnalysisReport {
  analysisDate: string;
  classId?: string;
  class?: string;
  studentCount: number;
  
  studentComparisons: StudentComparison[];
  
  classPatterns: ClassPattern[];
  
  riskCorrelations: RiskCorrelation[];
  
  groupDynamics: GroupDynamics;
  
  classLevelMetrics: {
    averageAcademicScore: number;
    averageBehaviorScore: number;
    averageRiskLevel: string;
    highRiskCount: number;
    lowPerformersCount: number;
    highPerformersCount: number;
  };
  
  comparativeInsights: {
    strengthAreas: string[];
    challengeAreas: string[];
    inequities: string[];
    successFactors: string[];
    systemicIssues: string[];
  };
  
  prioritizedRecommendations: Array<{
    priority: 'ACİL' | 'YÜKSEK' | 'ORTA';
    targetGroup: 'TÜM_SINIF' | 'GRUP' | 'BİREYSEL';
    recommendation: string;
    expectedImpact: string;
    resources: string[];
    timeline: string;
  }>;
  
  successStories: Array<{
    studentId: string;
    achievement: string;
    approach: string;
    replicability: string;
  }>;
}

class ComparativeMultiStudentAnalysisService {
  private aiProvider: AIProviderService;
  private contextService: StudentContextService;
  private patternService: PatternAnalysisService;
  private db: ReturnType<typeof getDatabase>;

  constructor() {
    this.aiProvider = AIProviderService.getInstance();
    this.contextService = new StudentContextService();
    this.patternService = new PatternAnalysisService();
    this.db = getDatabase();
  }

  async analyzeClass(classId: string): Promise<ComparativeAnalysisReport> {
    const students = this.db.prepare(`
      SELECT id, name, class
      FROM students
      WHERE class = ?
      ORDER BY name
    `).all(classId) as any[];

    if (students.length === 0) {
      throw new Error('Sınıfta öğrenci bulunamadı');
    }

    const studentContexts = await Promise.all(
      students.map(s => this.contextService.getStudentContext(s.id))
    );

    const isAvailable = await this.aiProvider.isAvailable();
    if (!isAvailable) {
      return this.generateFallbackAnalysis(classId, students, studentContexts);
    }

    const prompt = this.buildComparativePrompt(classId, students, studentContexts);

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen sınıf dinamikleri, grup analizi ve karşılaştırmalı öğrenci değerlendirmesi konusunda uzman bir eğitim danışmanısın. Çoklu öğrenci verilerini analiz ederek pattern\'ler, korelasyonlar ve grup dinamiklerini tespit ediyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      });

      return this.parseAnalysisResponse(classId, students, response);
    } catch (error) {
      await aiErrorHandler.handleAIError(
        error as Error,
        {
          serviceType: 'comparative-analysis',
          provider: this.aiProvider.getProvider(),
          model: this.aiProvider.getModel(),
          operation: 'analyze-class',
          additionalData: { classId, studentCount: students.length }
        },
        true
      );
      
      console.error('Comparative analysis error:', error);
      return this.generateFallbackAnalysis(classId, students, studentContexts);
    }
  }

  async analyzeMultipleStudents(studentIds: string[]): Promise<ComparativeAnalysisReport> {
    const students = studentIds.map(id => {
      const student = this.db.prepare('SELECT * FROM students WHERE id = ?').get(id);
      return student;
    }).filter(s => s) as any[];

    if (students.length === 0) {
      throw new Error('Öğrenci bulunamadı');
    }

    const studentContexts = await Promise.all(
      students.map(s => this.contextService.getStudentContext(s.id))
    );

    const isAvailable = await this.aiProvider.isAvailable();
    if (!isAvailable) {
      return this.generateFallbackAnalysis('custom', students, studentContexts);
    }

    const prompt = this.buildComparativePrompt('custom', students, studentContexts);

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen karşılaştırmalı öğrenci analizi konusunda uzman bir eğitim danışmanısın. Öğrenci gruplarını analiz ederek ortak pattern\'ler, farklılıklar ve müdahale fırsatlarını tespit ediyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      });

      return this.parseAnalysisResponse('custom', students, response);
    } catch (error) {
      await aiErrorHandler.handleAIError(
        error as Error,
        {
          serviceType: 'comparative-analysis',
          provider: this.aiProvider.getProvider(),
          model: this.aiProvider.getModel(),
          operation: 'analyze-multiple-students',
          additionalData: { studentIds: students.map(s => s.id), studentCount: students.length }
        },
        true
      );
      
      console.error('Multi-student analysis error:', error);
      return this.generateFallbackAnalysis('custom', students, studentContexts);
    }
  }

  private buildComparativePrompt(classId: string, students: unknown[], contexts: unknown[]): string {
    return `${students.length} öğrenci için KARŞILAŞTIRMALI SINIF ANALİZİ yap:

📚 SINIF: ${classId}
👥 ÖĞRENCİ SAYISI: ${students.length}

📊 ÖĞRENCİ BAĞLAMLARI:
${contexts.map((ctx, i) => `
ÖĞRENCİ ${i + 1}: ${(ctx as any).student?.name || 'Öğrenci'}
${JSON.stringify(ctx, null, 2)}
`).join('\n---\n')}

🎯 ANALİZ GEREKSİNİMLERİ:

1. ÖĞRENCİ KARŞILAŞTIRMALARI:
   Her öğrenci için:
   - Akademik skor (0-100)
   - Davranış skoru (0-100)
   - Risk seviyesi
   - Ana güçlü yönler (3-5)
   - Ana zorluklar (3-5)
   - Müdahale önceliği (0-100)

2. SINIF PATTERN'LERİ:
   - Yaygın pattern'ler (yay gin/orta/nadir)
   - Etkilenen öğrenciler
   - Açıklama ve olası nedenler
   - Sınıf seviyesi müdahaleler

3. RİSK KORELASYONLARI:
   - Faktörler arası ilişkiler
   - Korelasyon tipi (pozitif/negatif/nötr)
   - Güç (0-100)
   - Etkilenen öğrenci sayısı
   - Önleme stratejisi

4. GRUP DİNAMİKLERİ:
   - Pozitif gruplar (üyeler, özellikler, fırsatlar)
   - Risk grupları (üyeler, risk faktörleri, müdahale ihtiyaçları)
   - İzole öğrenciler (nedenler, entegrasyon stratejileri)
   - Liderlik fırsatları (tip, gelişim planı)

5. SINIF SEVİYESİ METRİKLER:
   - Ortalama skorlar
   - Risk dağılımı
   - Performans dağılımı

6. KARŞILAŞTIRMALI İÇGÖRÜLER:
   - Güçlü alanlar
   - Zorluk alanları
   - Eşitsizlikler
   - Başarı faktörleri
   - Sistemik sorunlar

7. ÖNCELİKLİ ÖNERİLER:
   - Öncelik seviyesi
   - Hedef grup (tüm sınıf/grup/bireysel)
   - Öneri
   - Beklenen etki
   - Kaynaklar
   - Zaman çizelgesi

8. BAŞARI HİKAYELERİ:
   - Öğrenci başarıları
   - Kullanılan yaklaşım
   - Tekrarlanabilirlik

⚠️ ÖNEMLİ:
- Öğrenciler arası karşılaştırmalarda hassas ol
- Güçlü yönleri vurgula
- Sistematik pattern'lere odaklan
- Eşitlik ve kapsayıcılığı göz önünde bulundur
- Uygulanabilir, sınıf seviyesi çözümler öner

Yanıtını JSON formatında ver (TypeScript ComparativeAnalysisReport tipine uygun).`;
  }

  private parseAnalysisResponse(classId: string, students: unknown[], response: string): ComparativeAnalysisReport {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        const fallback = this.generateBasicAnalysisFromText(classId, students, '');
        
        const validatedReport = {
          analysisDate: new Date().toISOString(),
          classId: classId !== 'custom' ? classId : undefined,
          class: (students[0] as any)?.class,
          studentCount: students.length,
          studentComparisons: Array.isArray(parsed.studentComparisons) ? parsed.studentComparisons : fallback.studentComparisons,
          classPatterns: Array.isArray(parsed.classPatterns) ? parsed.classPatterns : fallback.classPatterns,
          riskCorrelations: Array.isArray(parsed.riskCorrelations) ? parsed.riskCorrelations : fallback.riskCorrelations,
          groupDynamics: parsed.groupDynamics || fallback.groupDynamics,
          classLevelMetrics: parsed.classLevelMetrics || fallback.classLevelMetrics,
          comparativeInsights: parsed.comparativeInsights || fallback.comparativeInsights,
          prioritizedRecommendations: Array.isArray(parsed.prioritizedRecommendations) ? parsed.prioritizedRecommendations : fallback.prioritizedRecommendations,
          successStories: Array.isArray(parsed.successStories) ? parsed.successStories : fallback.successStories
        };
        
        return validatedReport;
      }
    } catch (error) {
      console.error('Comparative analysis parse error:', error);
      console.log('Falling back to context-based analysis...');
    }

    return this.generateBasicAnalysisFromText(classId, students, response);
  }

  private generateBasicAnalysisFromText(classId: string, students: unknown[], text: string): ComparativeAnalysisReport {
    const studentComparisons: StudentComparison[] = students.map(s => ({
      studentId: (s as any).id,
      studentName: (s as any).name,
      academicScore: 50,
      behaviorScore: 50,
      riskLevel: 'ORTA' as const,
      keyStrengths: ['AI analizinden çıkarılacak'],
      keyChallenges: ['AI analizinden çıkarılacak'],
      interventionPriority: 50
    }));

    return {
      analysisDate: new Date().toISOString(),
      classId: classId !== 'custom' ? classId : undefined,
      class: (students[0] as any)?.class,
      studentCount: students.length,
      studentComparisons,
      classPatterns: [
        {
          patternId: 'pattern-1',
          patternName: 'Genel Sınıf Dinamiği',
          affectedStudents: students.slice(0, 3).map(s => (s as any).name),
          frequency: 'ORTA',
          severity: 'ORTA',
          description: 'AI analizi gerekli',
          possibleCauses: ['Detaylı inceleme gerekli'],
          classLevelInterventions: ['Kapsamlı değerlendirme']
        }
      ],
      riskCorrelations: [],
      groupDynamics: {
        positiveGroups: [],
        riskGroups: [],
        isolatedStudents: [],
        leadershipOpportunities: []
      },
      classLevelMetrics: {
        averageAcademicScore: 50,
        averageBehaviorScore: 50,
        averageRiskLevel: 'ORTA',
        highRiskCount: 0,
        lowPerformersCount: 0,
        highPerformersCount: 0
      },
      comparativeInsights: {
        strengthAreas: ['AI analizi ile belirlenecek'],
        challengeAreas: ['AI analizi ile belirlenecek'],
        inequities: ['Değerlendirme gerekli'],
        successFactors: ['İnceleme gerekli'],
        systemicIssues: ['Analiz gerekli']
      },
      prioritizedRecommendations: [
        {
          priority: 'YÜKSEK',
          targetGroup: 'TÜM_SINIF',
          recommendation: 'Kapsamlı sınıf değerlendirmesi yap',
          expectedImpact: 'Detaylı durum tespiti',
          resources: ['AI analiz servisi'],
          timeline: '1-2 hafta'
        }
      ],
      successStories: []
    };
  }

  private generateFallbackAnalysis(classId: string, students: unknown[], contexts: unknown[]): ComparativeAnalysisReport {
    const studentComparisons: StudentComparison[] = students.map((s, i) => {
      const ctx = contexts[i] as any;
      const academicScore = ctx?.scores?.akademikSkor || 50;
      const behaviorScore = 100 - (ctx?.scores?.davranissalRisk || 50);
      const riskLevel = ctx?.risk?.level || 'ORTA';

      return {
        studentId: (s as any).id,
        studentName: (s as any).name,
        academicScore,
        behaviorScore,
        riskLevel,
        keyStrengths: ['Değerlendirme gerekli'],
        keyChallenges: ctx?.risk?.factors?.slice(0, 3) || ['Değerlendirme gerekli'],
        interventionPriority: riskLevel === 'ÇOK_YÜKSEK' ? 90 : riskLevel === 'YÜKSEK' ? 70 : riskLevel === 'ORTA' ? 50 : 30
      };
    });

    const highRisk = studentComparisons.filter(s => s.riskLevel === 'YÜKSEK' || s.riskLevel === 'KRİTİK');
    const lowPerformers = studentComparisons.filter(s => s.academicScore < 40);
    const highPerformers = studentComparisons.filter(s => s.academicScore > 80);

    const avgAcademic = studentComparisons.reduce((sum, s) => sum + s.academicScore, 0) / students.length;
    const avgBehavior = studentComparisons.reduce((sum, s) => sum + s.behaviorScore, 0) / students.length;

    const classPatterns: ClassPattern[] = [];

    if (highRisk.length > students.length * 0.3) {
      classPatterns.push({
        patternId: 'pattern-high-risk',
        patternName: 'Yaygın Risk Durumu',
        affectedStudents: highRisk.map(s => s.studentName),
        frequency: 'YAYGIN',
        severity: 'YÜKSEK',
        description: `Sınıfın %${Math.round((highRisk.length / students.length) * 100)}'i yüksek risk grubunda`,
        possibleCauses: ['Sınıf dinamikleri', 'Sistemik sorunlar', 'Çevresel faktörler'],
        classLevelInterventions: [
          'Sınıf çapında destek programı',
          'Öğretmen eğitimi',
          'Aile katılımı etkinlikleri',
          'Sosyal-duygusal öğrenme programı'
        ]
      });
    }

    if (lowPerformers.length > students.length * 0.25) {
      classPatterns.push({
        patternId: 'pattern-academic',
        patternName: 'Akademik Performans Sorunu',
        affectedStudents: lowPerformers.map(s => s.studentName),
        frequency: 'YAYGIN',
        severity: 'YÜKSEK',
        description: 'Çok sayıda öğrenci akademik zorluk yaşıyor',
        possibleCauses: ['Öğretim yöntemi', 'Müfredat uyumu', 'Ön öğrenme eksiklikleri'],
        classLevelInterventions: [
          'Diferansiye öğretim stratejileri',
          'Akran öğretimi programı',
          'Ek destek saatleri',
          'Bireyselleştirilmiş öğrenme planları'
        ]
      });
    }

    const recommendations: ComparativeAnalysisReport['prioritizedRecommendations'] = [];

    if (highRisk.length > 0) {
      recommendations.push({
        priority: 'ACİL',
        targetGroup: 'BİREYSEL',
        recommendation: `${highRisk.length} yüksek riskli öğrenci için acil müdahale planı`,
        expectedImpact: 'Risk azaltma ve stabilizasyon',
        resources: ['Rehberlik servisi', 'Özel eğitim desteği', 'Aile danışmanlığı'],
        timeline: 'Hemen başla, 4-6 hafta'
      });
    }

    if (avgAcademic < 50) {
      recommendations.push({
        priority: 'YÜKSEK',
        targetGroup: 'TÜM_SINIF',
        recommendation: 'Sınıf çapında akademik destek programı',
        expectedImpact: 'Genel akademik performans artışı',
        resources: ['Ek ders saatleri', 'Öğretim materyalleri', 'Teknoloji desteği'],
        timeline: '8-12 hafta'
      });
    }

    recommendations.push({
      priority: 'ORTA',
      targetGroup: 'TÜM_SINIF',
      recommendation: 'Pozitif sınıf iklimi oluşturma programı',
      expectedImpact: 'Gelişmiş sosyal dinamikler ve öğrenme ortamı',
      resources: ['SEL programı', 'Takım oluşturma etkinlikleri', 'Çatışma çözme eğitimi'],
      timeline: '12 hafta'
    });

    return {
      analysisDate: new Date().toISOString(),
      classId: classId !== 'custom' ? classId : undefined,
      class: students[0]?.class,
      studentCount: students.length,
      studentComparisons,
      classPatterns,
      riskCorrelations: [
        {
          factor1: 'Akademik Performans',
          factor2: 'Davranış Sorunları',
          correlationType: 'NEGATİF',
          strength: 65,
          affectedCount: Math.floor(students.length * 0.4),
          explanation: 'Düşük akademik performans davranış sorunlarıyla ilişkili görünüyor',
          preventionStrategy: 'Erken akademik destek ve pozitif davranış desteği'
        }
      ],
      groupDynamics: {
        positiveGroups: highPerformers.length >= 3 ? [
          {
            members: highPerformers.slice(0, 5).map(s => s.studentName),
            characteristics: ['Yüksek akademik performans', 'Olumlu davranış'],
            leverageOpportunities: ['Akran öğretimi', 'Liderlik rolleri', 'Mentorluk']
          }
        ] : [],
        riskGroups: highRisk.length >= 3 ? [
          {
            members: highRisk.slice(0, 5).map(s => s.studentName),
            riskFactors: ['Yüksek risk seviyesi', 'Müdahale gereksinimi'],
            interventionNeeds: ['Yoğun destek', 'Bireysel planlama', 'Aile katılımı']
          }
        ] : [],
        isolatedStudents: [],
        leadershipOpportunities: highPerformers.slice(0, 3).map(s => ({
          studentId: s.studentId,
          name: s.studentName,
          leadershipType: 'Akademik Liderlik',
          developmentPlan: ['Akran mentorluk eğitimi', 'Proje liderliği', 'Sınıf temsilciliği']
        }))
      },
      classLevelMetrics: {
        averageAcademicScore: Math.round(avgAcademic),
        averageBehaviorScore: Math.round(avgBehavior),
        averageRiskLevel: avgAcademic < 40 ? 'YÜKSEK' : avgAcademic < 60 ? 'ORTA' : 'DÜŞÜK',
        highRiskCount: highRisk.length,
        lowPerformersCount: lowPerformers.length,
        highPerformersCount: highPerformers.length
      },
      comparativeInsights: {
        strengthAreas: highPerformers.length > 0 ? ['Başarılı öğrenci grubu mevcut'] : [],
        challengeAreas: [
          ...(highRisk.length > 0 ? ['Yüksek risk öğrenci sayısı'] : []),
          ...(lowPerformers.length > 0 ? ['Akademik performans sorunları'] : [])
        ],
        inequities: avgAcademic < 50 && highPerformers.length > 0 ? ['Performans dağılımında eşitsizlik'] : [],
        successFactors: highPerformers.length > 0 ? ['Bazı öğrenciler için etkili destek'] : [],
        systemicIssues: classPatterns.length > 0 ? ['Sınıf çapında pattern\'ler tespit edildi'] : []
      },
      prioritizedRecommendations: recommendations,
      successStories: highPerformers.slice(0, 2).map(s => ({
        studentId: s.studentId,
        achievement: `Yüksek akademik performans: ${s.academicScore}`,
        approach: 'Mevcut destek yapılarının etkili kullanımı',
        replicability: 'Diğer öğrenciler için model oluşturulabilir'
      }))
    };
  }
}

export default ComparativeMultiStudentAnalysisService;
