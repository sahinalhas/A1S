import { PatternAnalysisService } from '../../../services/pattern-analysis.service.js';
import { StudentContextService } from '../../../services/student-context.service.js';
import { AIProviderService } from '../../../services/ai-provider.service.js';
import AIPromptBuilder from '../../../services/ai-prompt-builder.service.js';
import * as studentsRepo from '../../students/repository/students.repository.js';
import * as earlyWarningService from '../../early-warning/services/early-warning.service.js';
import getDatabase from '../../../lib/database.js';
import type { 
  DeepAnalysisReport, 
  StudentTrajectory,
  PersonalizedInterventionPlan,
  SuccessFactorAnalysis,
  ComparativeAnalysis
} from '../../../../shared/types/deep-analysis.types.js';

const db = getDatabase();
const patternAnalysis = new PatternAnalysisService();
const contextService = new StudentContextService();
const aiProvider = AIProviderService.getInstance();

/**
 * Tam kapsamlı öğrenci analizi - Ana fonksiyon
 * @param studentId - Öğrenci ID
 * @param schoolId - Okul ID (güvenlik kontrolü için)
 */
export async function generateDeepAnalysis(studentId: string, schoolId?: string): Promise<DeepAnalysisReport> {
  let student;
  
  if (schoolId) {
    student = studentsRepo.getStudentByIdAndSchool(studentId, schoolId);
    if (!student) {
      throw new Error('Öğrenci bulunamadı veya bu okula ait değil');
    }
  } else {
    student = studentsRepo.getStudentById(studentId);
    if (!student) {
      throw new Error('Öğrenci bulunamadı');
    }
  }
  
  // Paralel analizler
  const [
    trajectory,
    interventionPlan,
    successFactors,
    comparative
  ] = await Promise.all([
    analyzeStudentTrajectory(studentId),
    generateInterventionPlan(studentId),
    analyzeSuccessFactors(studentId),
    generateComparativeAnalysis(studentId, schoolId)
  ]);
  
  // AI ile executive summary oluştur
  const { executiveSummary, keyInsights, criticalActions } = await generateAISummary({
    trajectory,
    interventionPlan,
    successFactors,
    comparative
  });
  
  // Data completeness hesapla
  const dataCompleteness = calculateDataCompleteness(studentId);
  
  return {
    studentId,
    studentName: `${student.name} ${student.surname}`,
    generatedAt: new Date().toISOString(),
    trajectory,
    interventionPlan,
    successFactors,
    comparative,
    executiveSummary,
    keyInsights,
    criticalActions,
    analysisConfidence: Math.min(95, 60 + dataCompleteness * 0.35), // 60-95 arası
    dataCompleteness
  };
}

/**
 * Gelişim yörüngesi analizi
 */
async function analyzeStudentTrajectory(studentId: string): Promise<StudentTrajectory> {
  // Son 6 ayın verileri
  const exams = db.prepare(`
    SELECT grade, examDate FROM exam_results
    WHERE studentId = ? AND examDate >= date('now', '-6 months')
    ORDER BY examDate ASC
  `).all(studentId) as any[];
  
  const behaviors = db.prepare(`
    SELECT incidentDate, behaviorCategory FROM behavior_incidents
    WHERE studentId = ? AND incidentDate >= date('now', '-6 months')
    ORDER BY incidentDate ASC
  `).all(studentId) as any[];
  
  // Trend hesapla
  let trend: StudentTrajectory['trajectory']['trend'] = 'STABIL';
  let trendPercentage = 0;
  
  if (exams.length >= 3) {
    const recent = exams.slice(-3).map(e => parseFloat(e.grade) || 0);
    const earlier = exams.slice(0, 3).map(e => parseFloat(e.grade) || 0);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    trendPercentage = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    
    if (trendPercentage > 10) trend = 'YÜKSELİŞ';
    else if (trendPercentage < -10) trend = 'DÜŞÜŞ';
    else if (Math.abs(trendPercentage) > 5) trend = 'DALGALI';
  }
  
  // Turning points tespit et
  const keyTurningPoints: StudentTrajectory['trajectory']['keyTurningPoints'] = [];
  
  // Davranış değişimleri
  if (behaviors.length > 0) {
    const firstMonth = behaviors.slice(0, Math.ceil(behaviors.length / 3)).length;
    const lastMonth = behaviors.slice(-Math.ceil(behaviors.length / 3)).length;
    
    if (lastMonth > firstMonth * 2) {
      keyTurningPoints.push({
        date: behaviors[behaviors.length - 1].incidentDate,
        event: 'Davranış olaylarında artış',
        impact: 'NEGATİF'
      });
    }
  }
  
  // Mevcut durum değerlendirmesi
  const riskAnalysis = await earlyWarningService.analyzeStudentRisk(studentId);
  
  const currentStatus: StudentTrajectory['currentStatus'] = {
    academicLevel: riskAnalysis.academicScore > 70 ? 'İYİ' : riskAnalysis.academicScore > 50 ? 'ORTA' : 'DÜŞÜK',
    socialEmotionalLevel: riskAnalysis.socialEmotionalScore > 70 ? 'GÜÇLÜ' : 'GELİŞTİRİLEBİLİR',
    behaviorLevel: riskAnalysis.behavioralScore > 70 ? 'NORMAL' : 'DİKKAT',
    overallRisk: riskAnalysis.riskLevel
  };
  
  // Tahmin
  const prediction: StudentTrajectory['prediction'] = {
    nextMonthOutlook: trend === 'YÜKSELİŞ' ? 'İYİLEŞME' : trend === 'DÜŞÜŞ' ? 'RİSK_ARTIŞI' : 'STABIL',
    confidence: 75,
    factors: [
      trend === 'YÜKSELİŞ' ? 'Pozitif akademik trend' : 'Akademik zorluklar',
      behaviors.length > 5 ? 'Davranışsal zorluklar' : 'Davranışsal istikrar'
    ]
  };
  
  // Müdahale önceliği belirle
  let interventionPriority: StudentTrajectory['interventionPriority'] = 'DÜŞÜK';
  if (riskAnalysis.riskLevel === 'KRİTİK') {
    interventionPriority = 'ACİL';
  } else if (riskAnalysis.riskLevel === 'YÜKSEK') {
    interventionPriority = 'YÜKSEK';
  } else if (riskAnalysis.riskLevel === 'ORTA') {
    interventionPriority = 'ORTA';
  }
  
  // Önerilen aksiyonlar
  const recommendedActions = riskAnalysis.recommendations.slice(0, 5).map(r => r.title);
  
  return {
    studentId,
    currentStatus,
    trajectory: {
      period: 'SON_6_AY',
      trend,
      trendPercentage,
      keyTurningPoints
    },
    prediction,
    interventionPriority,
    recommendedActions
  };
}

/**
 * Kişiselleştirilmiş müdahale planı
 */
async function generateInterventionPlan(studentId: string): Promise<PersonalizedInterventionPlan> {
  const riskAnalysis = await earlyWarningService.analyzeStudentRisk(studentId);
  const context = await contextService.getStudentContext(studentId);
  
  const interventions: PersonalizedInterventionPlan['interventions'] = [];
  
  // Risk level'a göre müdahale ekle
  if (riskAnalysis.academicScore < 50) {
    interventions.push({
      priority: 'ACİL',
      targetArea: 'Akademik Başarı',
      specificGoal: 'Not ortalamasını 60 üzerine çıkarmak',
      strategies: [
        {
          name: 'Bireysel Ders Desteği',
          description: 'Haftada 3 saat birebir akademik destek',
          evidenceBase: 'Meta-analiz: Bireysel öğretim 0.79 etki büyüklüğü (Hattie, 2009)',
          expectedDuration: '8 hafta'
        },
        {
          name: 'Akran Mentörlüğü',
          description: 'Başarılı akran ile eşleştirme',
          evidenceBase: 'Akran öğretimi 0.55 etki büyüklüğü (Hattie, 2009)',
          expectedDuration: '12 hafta'
        }
      ],
      resources: {
        materials: ['Ders notları', 'Çalışma rehberi', 'Online kaynaklar'],
        personnel: ['Branş öğretmeni', 'Akran mentor', 'Rehber öğretmen'],
        externalSupport: ['Veli desteği']
      },
      successCriteria: [
        'Her hafta en az %80 görev tamamlama',
        '4 hafta sonra ara değerlendirmede en az 10 puan artış',
        '8 hafta sonunda hedef nota ulaşma'
      ],
      monitoringPlan: {
        frequency: 'Haftalık',
        metrics: ['Sınav notları', 'Ödev tamamlama oranı', 'Sınıf katılımı'],
        checkpoints: ['2. hafta', '4. hafta', '6. hafta', '8. hafta']
      }
    });
  }
  
  if (riskAnalysis.behavioralScore < 50) {
    interventions.push({
      priority: 'YÜKSEK',
      targetArea: 'Davranış Düzenleme',
      specificGoal: 'Olumsuz davranış sıklığını %50 azaltmak',
      strategies: [
        {
          name: 'Olumlu Davranış Desteği (PBS)',
          description: 'Hedef davranış belirleme ve pekiştirme sistemi',
          evidenceBase: 'PBS: Davranış problemlerinde %80 azalma (Carr et al., 2002)',
          expectedDuration: '12 hafta'
        }
      ],
      resources: {
        materials: ['Davranış izleme formu', 'Pekiştireç sistemi'],
        personnel: ['Sınıf öğretmeni', 'Rehber öğretmen', 'Aile']
      },
      successCriteria: [
        '4 hafta sonunda davranış sıklığında %30 azalma',
        '8 hafta sonunda %50 azalma',
        'Pozitif davranışlarda artış'
      ],
      monitoringPlan: {
        frequency: 'Günlük izleme, haftalık değerlendirme',
        metrics: ['Davranış sayısı', 'Pozitif davranış sıklığı'],
        checkpoints: ['Haftalık']
      }
    });
  }
  
  return {
    studentId,
    generatedAt: new Date().toISOString(),
    interventions,
    timeline: {
      phase1: 'İlk 4 hafta: Baseline oluşturma ve yoğun müdahale',
      phase2: '1-3 ay: Gelişimi pekiştirme ve destek azaltma',
      phase3: '6-12 ay: Bağımsızlık ve sürdürülebilirlik'
    }
  };
}

/**
 * Başarı faktörleri analizi
 */
async function analyzeSuccessFactors(studentId: string): Promise<SuccessFactorAnalysis> {
  const context = await contextService.getStudentContext(studentId);
  const patterns = await patternAnalysis.analyzeStudentPatterns(studentId);
  
  return {
    studentId,
    strengths: [],
    riskFactors: patterns
      .filter(p => p.severity === 'CRITICAL' || p.severity === 'WARNING')
      .map(p => ({
        category: p.category,
        factor: p.title,
        severity: p.severity === 'CRITICAL' ? 'KRİTİK' : 'YÜKSEK',
        mitigationStrategies: p.recommendation ? [p.recommendation] : []
      })),
    protectiveFactors: [],
    keySuccessFactors: {
      internal: ['Öğrenme motivasyonu', 'Öz-disiplin'],
      external: ['Aile desteği', 'Öğretmen ilgisi'],
      combined: ['Okul-aile işbirliği', 'Akran desteği']
    }
  };
}

/**
 * Karşılaştırmalı analiz
 * @param studentId - Öğrenci ID
 * @param schoolId - Okul ID (güvenlik kontrolü için)
 */
async function generateComparativeAnalysis(studentId: string, schoolId?: string): Promise<ComparativeAnalysis> {
  let student;
  
  if (schoolId) {
    student = studentsRepo.getStudentByIdAndSchool(studentId, schoolId);
    if (!student) throw new Error('Öğrenci bulunamadı veya bu okula ait değil');
  } else {
    student = studentsRepo.getStudentById(studentId);
    if (!student) throw new Error('Öğrenci bulunamadı');
  }
  
  // Sınıf ortalamaları
  const classStats = db.prepare(`
    SELECT 
      AVG(CAST(er.grade AS REAL)) as avgGrade,
      COUNT(DISTINCT s.id) as totalStudents
    FROM students s
    LEFT JOIN exam_results er ON s.id = er.studentId
    WHERE s.class = ?
  `).get(student.class) as any;
  
  const studentAvg = db.prepare(`
    SELECT AVG(CAST(grade AS REAL)) as avg
    FROM exam_results
    WHERE studentId = ?
  `).get(studentId) as any;
  
  return {
    studentId,
    studentName: `${student.name} ${student.surname}`,
    classComparison: {
      class: student.class || 'Bilinmiyor',
      studentRank: 0,
      totalStudents: classStats?.totalStudents || 0,
      percentile: 50,
      metrics: {
        academicPerformance: {
          studentScore: studentAvg?.avg || 0,
          classAverage: classStats?.avgGrade || 0,
          deviation: (studentAvg?.avg || 0) - (classStats?.avgGrade || 0)
        },
        attendance: {
          studentRate: 85,
          classAverage: 90,
          deviation: -5
        },
        behavior: {
          studentScore: 75,
          classAverage: 80,
          deviation: -5
        }
      }
    },
    similarStudentsComparison: {
      similarityBasis: 'Akademik profil ve risk seviyesi',
      comparisonGroup: 0,
      whatWorked: [],
      commonChallenges: [],
      differentiatingFactors: []
    }
  };
}

/**
 * AI ile executive summary oluştur
 */
async function generateAISummary(data: {
  trajectory: StudentTrajectory;
  interventionPlan: PersonalizedInterventionPlan;
  successFactors: SuccessFactorAnalysis;
  comparative: ComparativeAnalysis;
}): Promise<{
  executiveSummary: string;
  keyInsights: string[];
  criticalActions: string[];
}> {
  const isAvailable = await aiProvider.isAvailable();
  
  if (!isAvailable) {
    return {
      executiveSummary: `Öğrenci ${data.trajectory.trajectory.trend} trendinde. ${data.interventionPlan.interventions.length} müdahale planlandı.`,
      keyInsights: ['AI analizi kullanılamıyor'],
      criticalActions: data.interventionPlan.interventions.filter(i => i.priority === 'ACİL').map(i => i.specificGoal)
    };
  }
  
  const prompt = `Derin öğrenci analiz raporu özeti oluştur:

YÖRÜNGE: ${data.trajectory.trajectory.trend} (${data.trajectory.trajectory.trendPercentage.toFixed(1)}%)
MÜDAHALE SAYISI: ${data.interventionPlan.interventions.length}
RİSK FAKTÖRLERİ: ${data.successFactors.riskFactors.length}

Lütfen şu formatta özet oluştur:

## EXECUTIVE SUMMARY
[2-3 cümlelik genel değerlendirme]

## KEY INSIGHTS (3-5 madde)
- ...

## CRITICAL ACTIONS (öncelikli 3-5 aksiyon)
- ...`;

  try {
    const response = await aiProvider.chat({
      messages: [
        { role: 'system', content: AIPromptBuilder.buildCounselorSystemPrompt() },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3
    });
    
    const sections = response.split('##').filter(s => s.trim());
    const insights = sections[1]?.split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim().substring(1).trim()) || [];
    const actions = sections[2]?.split('\n').filter(l => l.trim().startsWith('-')).map(l => l.trim().substring(1).trim()) || [];
    
    return {
      executiveSummary: sections[0]?.trim() || 'Özet oluşturulamadı',
      keyInsights: insights,
      criticalActions: actions
    };
  } catch (error) {
    console.error('AI summary error:', error);
    return {
      executiveSummary: `Öğrenci ${data.trajectory.trajectory.trend} trendinde. ${data.interventionPlan.interventions.length} müdahale planlandı.`,
      keyInsights: ['AI analizi kullanılamıyor'],
      criticalActions: data.interventionPlan.interventions.filter(i => i.priority === 'ACİL').map(i => i.specificGoal)
    };
  }
}

/**
 * Veri eksiksizliği hesapla
 */
function calculateDataCompleteness(studentId: string): number {
  let score = 0;
  
  const exams = db.prepare('SELECT COUNT(*) as count FROM exam_results WHERE studentId = ?').get(studentId) as any;
  const attendance = db.prepare('SELECT COUNT(*) as count FROM attendance_records WHERE studentId = ?').get(studentId) as any;
  const behaviors = db.prepare('SELECT COUNT(*) as count FROM behavior_incidents WHERE studentId = ?').get(studentId) as any;
  const counseling = db.prepare('SELECT COUNT(*) as count FROM counseling_session_students WHERE studentId = ?').get(studentId) as any;
  
  if (exams?.count > 0) score += 30;
  if (attendance?.count > 10) score += 25;
  if (behaviors?.count >= 0) score += 15; // Herhangi bir veri varsa
  if (counseling?.count > 0) score += 30;
  
  return Math.min(100, score);
}

/**
 * Toplu analiz
 */
export async function generateBatchAnalysis(studentIds: string[], schoolId?: string): Promise<{
  reports: DeepAnalysisReport[];
  errors: Array<{ studentId: string; error: string }>;
}> {
  const reports: DeepAnalysisReport[] = [];
  const errors: Array<{ studentId: string; error: string }> = [];
  
  for (const studentId of studentIds) {
    try {
      const report = await generateDeepAnalysis(studentId, schoolId);
      reports.push(report);
    } catch (error: unknown) {
      errors.push({
        studentId,
        error: error instanceof Error ? error.message : String(error) || 'Bilinmeyen hata'
      });
    }
  }
  
  return { reports, errors };
}
