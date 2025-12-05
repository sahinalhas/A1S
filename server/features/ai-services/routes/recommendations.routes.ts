import { RequestHandler } from 'express';
import * as dailyInsightsRepo from '../../daily-insights/repository/daily-insights.repository.js';
import * as earlyWarningService from '../../risk-management/services/early-warning.service.js';
import * as studentsRepo from '../../students/repository/students.repository.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

/**
 * GET /api/ai-assistant/recommendations/priority-students
 * Öncelikli öğrencileri belirle
 */
export const getPriorityStudents: RequestHandler = async (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const limit = parseInt(req.query.limit as string) || 10;
    const today = new Date().toISOString().split('T')[0];
    
    // Bu okula ait öğrenci verilerini al
    const allStudents = studentsRepo.loadStudentsBySchool(schoolId);
    const studentIds = allStudents.map(s => s.id);
    const studentMap = new Map(allStudents.map(s => [s.id, s]));
    
    // Bugün dikkat gerektiren öğrenciler (school-scoped)
    const needsAttention = dailyInsightsRepo.getStudentsNeedingAttention(today, studentIds);
    
    // Kritik uyarıları olan öğrenciler (school-scoped)
    const criticalAlerts = dailyInsightsRepo.getProactiveAlerts({
      severity: 'KRİTİK',
      status: 'YENİ',
      studentIds: studentIds,
      limit: 20
    });
    
    // Öncelik skoru hesapla
    const priorities = needsAttention.map(status => {
      const student = studentMap.get(status.studentId);
      const alerts = criticalAlerts.filter(a => a.studentId === status.studentId);
      
      let priorityScore = 0;
      
      // Durum bazlı skor
      if (status.overallStatus === 'ACİL') priorityScore += 100;
      else if (status.overallStatus === 'DİKKAT') priorityScore += 50;
      
      // Kritik uyarı sayısı
      priorityScore += alerts.length * 30;
      
      // Kritik uyarı var mı
      if (status.hasCriticalAlert) priorityScore += 40;
      
      return {
        studentId: status.studentId,
        studentName: student?.name || 'Bilinmiyor',
        class: student?.class || '',
        priorityScore,
        status: status.overallStatus,
        criticalAlerts: alerts.length,
        reason: generatePriorityReason(status, alerts.length)
      };
    });
    
    // Skora göre sırala ve limit uygula
    const topPriorities = priorities
      .sort((a, b) => b.priorityScore - a.priorityScore)
      .slice(0, limit);
    
    res.json({
      success: true,
      data: {
        total: priorities.length,
        priorities: topPriorities,
        recommendations: generateRecommendations(topPriorities)
      }
    });
  } catch (error: unknown) {
    console.error('Error getting priority students:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Öncelikli öğrenciler alınamadı'
    });
  }
};

/**
 * GET /api/ai-assistant/recommendations/interventions
 * Müdahale etkinlik önerileri
 */
export const getInterventionRecommendations: RequestHandler = async (req, res) => {
  try {
    const { studentId } = req.query;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Öğrenci ID gerekli'
      });
    }
    
    // Öğrenci risk analizi
    const riskAnalysis = await earlyWarningService.analyzeStudentRisk(studentId as string);
    
    // Önerileri önceliklendir
    const prioritizedRecommendations = riskAnalysis.recommendations
      .map(rec => ({
        ...rec,
        effectivenessScore: calculateEffectivenessScore(rec, riskAnalysis),
        resources: suggestResources(rec.recommendationType)
      }))
      .sort((a, b) => b.effectivenessScore - a.effectivenessScore);
    
    res.json({
      success: true,
      data: {
        studentId,
        riskLevel: riskAnalysis.riskLevel,
        totalRecommendations: prioritizedRecommendations.length,
        recommendations: prioritizedRecommendations,
        implementationGuide: generateImplementationGuide(prioritizedRecommendations.slice(0, 3))
      }
    });
  } catch (error: unknown) {
    console.error('Error getting intervention recommendations:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Müdahale önerileri alınamadı'
    });
  }
};

/**
 * GET /api/ai-assistant/recommendations/resources
 * Kaynak önerileri
 */
export const getResourceRecommendations: RequestHandler = (req, res) => {
  try {
    const { category } = req.query;
    
    const resources = {
      akademik: [
        { name: 'Khan Academy Türkçe', type: 'Online Platform', url: 'https://tr.khanacademy.org' },
        { name: 'EBA (Eğitim Bilişim Ağı)', type: 'MEB Kaynağı', url: 'https://eba.gov.tr' },
        { name: 'Akran Öğretimi Programı', type: 'Müdahale', description: 'Sınıf içi akran desteği' }
      ],
      sosyalDuygusal: [
        { name: 'SEL Programı', type: 'Eğitim Programı', description: 'Sosyal-Duygusal Öğrenme' },
        { name: 'Mindfulness Egzersizleri', type: 'Aktivite', description: 'Farkındalık çalışmaları' },
        { name: 'Duygu Termometresi', type: 'Araç', description: 'Duygu tanıma ve düzenleme aracı' }
      ],
      davranişsal: [
        { name: 'PBS (Olumlu Davranış Desteği)', type: 'Müdahale', description: 'Kanıta dayalı davranış müdahalesi' },
        { name: 'Davranış Sözleşmesi Şablonu', type: 'Araç', description: 'Öğrenci-öğretmen anlaşması' },
        { name: 'Token Ekonomisi', type: 'Pekiştirme Sistemi', description: 'Davranış pekiştirme' }
      ],
      aile: [
        { name: 'Veli Eğitimi Modülleri', type: 'Eğitim', description: 'Ebeveyn beceri geliştirme' },
        { name: 'Ev-Okul İşbirliği Kılavuzu', type: 'Rehber', description: 'Koordinasyon stratejileri' },
        { name: 'RAM Yönlendirme Süreci', type: 'Prosedür', description: 'MEB rehberlik süreci' }
      ]
    };
    
    const selectedResources = category ? resources[category as keyof typeof resources] : resources;
    
    res.json({
      success: true,
      data: {
        category: category || 'all',
        resources: selectedResources
      }
    });
  } catch (error: unknown) {
    console.error('Error getting resource recommendations:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Kaynak önerileri alınamadı'
    });
  }
};

// Helper functions
function generatePriorityReason(status: Record<string, any>, criticalAlerts: number): string {
  const reasons: string[] = [];
  
  if (status.overallStatus === 'ACİL') {
    reasons.push('Acil müdahale gerekli');
  }
  
  if (criticalAlerts > 0) {
    reasons.push(`${criticalAlerts} kritik uyarı`);
  }
  
  if (status.hasCriticalAlert) {
    reasons.push('Kritik durum tespiti');
  }
  
  return reasons.join(', ') || 'Dikkat gerektirir';
}

interface PriorityStudent {
  studentId: string;
  studentName: string;
  class: string;
  priorityScore: number;
  status: string;
  criticalAlerts: number;
  reason: string;
}

function generateRecommendations(priorities: PriorityStudent[]): string[] {
  const recommendations: string[] = [];
  
  const urgent = priorities.filter(p => p.status === 'ACİL');
  if (urgent.length > 0) {
    recommendations.push(`${urgent.length} öğrenci için acil müdahale planı hazırla`);
  }
  
  const highAlerts = priorities.filter(p => p.criticalAlerts > 0);
  if (highAlerts.length > 0) {
    recommendations.push(`${highAlerts.length} öğrencinin kritik uyarılarını incele`);
  }
  
  if (priorities.length > 5) {
    recommendations.push('Ekip toplantısı planla - çok sayıda öncelikli öğrenci var');
  }
  
  return recommendations;
}

function calculateEffectivenessScore(rec: Record<string, any>, riskAnalysis: Record<string, any>): number {
  let score = 50; // Base score
  
  // Öncelik bazlı skor
  if (rec.priority === 'ACİL') score += 40;
  else if (rec.priority === 'YÜKSEK') score += 30;
  else if (rec.priority === 'ORTA') score += 20;
  
  // Risk seviyesi uyumu
  if (riskAnalysis.riskLevel === 'KRİTİK' && rec.priority === 'ACİL') score += 20;
  
  return Math.min(100, score);
}

function suggestResources(type: string): string[] {
  const resourceMap: Record<string, string[]> = {
    'AKADEMİK_DESTEK': ['Ders öğretmeni', 'Akran mentor', 'Online kaynaklar'],
    'DAVRANIŞSAL_MÜDAHALE': ['PBS programı', 'Davranış uzmanı', 'Aile desteği'],
    'SOSYAL_DUYGUSAL_DESTEK': ['SEL programı', 'Okul psikoloğu', 'Grup çalışması'],
    'AİLE_MÜDAHALESİ': ['Veli eğitimi', 'Ev ziyareti', 'Aile danışmanlığı']
  };
  
  return resourceMap[type] || ['Rehber öğretmen desteği'];
}

function generateImplementationGuide(recommendations: unknown[]): string[] {
  return [
    '1. Hafta: Başlangıç değerlendirmesi ve baseline oluşturma',
    '2-4. Hafta: Yoğun müdahale uygulama',
    '5-8. Hafta: Gelişimi izleme ve ayarlama',
    '9-12. Hafta: Pekiştirme ve bağımsızlık',
    'Değerlendirme: Her 2 haftada progress review'
  ];
}
