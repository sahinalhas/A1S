import * as examResultsRepo from '../repository/exam-results.repository.js';
import * as examTypesRepo from '../repository/exam-types.repository.js';
import * as examSessionsRepo from '../repository/exam-sessions.repository.js';
import { getDatabase } from '../../../lib/database/connection.js';
import type {
  AIAnalysisResult,
  AIInsight,
  AIRecommendation,
  WeakSubjectAnalysis,
  WeakSubjectDetail
} from '../../../../shared/types/exam-management.types.js';
import { randomUUID } from 'crypto';

export function analyzeStudentRisk(studentId: string): AIAnalysisResult | null {
  try {
    const db = getDatabase();
    
    const studentQuery = db.prepare('SELECT name FROM students WHERE id = ?').get(studentId) as { name: string } | undefined;
    if (!studentQuery) {
      return null;
    }

    const results = examResultsRepo.getExamResultsByStudent(studentId);
    if (results.length < 2) {
      return {
        student_id: studentId,
        analysis_type: 'risk',
        insights: [{
          id: randomUUID(),
          category: 'Veri Yetersizliği',
          severity: 'low',
          title: 'Yetersiz Veri',
          description: 'Risk analizi için en az 2 deneme sonucu gereklidir.',
          data_points: [],
          confidence: 0.5
        }],
        recommendations: [],
        generated_at: new Date().toISOString()
      };
    }

    const insights: AIInsight[] = [];
    const recommendations: AIRecommendation[] = [];

    const recentResults = results.slice(0, 5);
    const avgRecentNet = recentResults.reduce((sum, r) => sum + r.net_score, 0) / recentResults.length;
    const olderResults = results.slice(5, 10);
    const avgOlderNet = olderResults.length > 0
      ? olderResults.reduce((sum, r) => sum + r.net_score, 0) / olderResults.length
      : avgRecentNet;

    if (avgRecentNet < avgOlderNet * 0.85) {
      insights.push({
        id: randomUUID(),
        category: 'Performans Düşüşü',
        severity: 'high',
        title: 'Belirgin Performans Düşüşü Tespit Edildi',
        description: `Son denemelerde %${Math.round((1 - avgRecentNet / avgOlderNet) * 100)} performans düşüşü görülmektedir.`,
        data_points: [
          { label: 'Son Ortalama', value: avgRecentNet.toFixed(2) },
          { label: 'Önceki Ortalama', value: avgOlderNet.toFixed(2) }
        ],
        confidence: 0.85
      });

      recommendations.push({
        id: randomUUID(),
        type: 'intervention',
        priority: 'high',
        title: 'Acil Müdahale Önerisi',
        description: 'Öğrencinin motivasyon ve çalışma düzeninin gözden geçirilmesi önerilir.',
        actionable_steps: [
          'Birebir görüşme yapılması',
          'Çalışma alışkanlıklarının incelenmesi',
          'Aile ile iletişime geçilmesi',
          'Ders programının yeniden düzenlenmesi'
        ],
        expected_impact: 'Öğrencinin performansında 2-3 hafta içinde iyileşme beklenir.'
      });
    }

    if (avgRecentNet < 20) {
      insights.push({
        id: randomUUID(),
        category: 'Düşük Performans',
        severity: 'high',
        title: 'Kritik Seviyede Düşük Başarı',
        description: 'Öğrencinin genel başarı seviyesi kritik eşiğin altında.',
        data_points: [{ label: 'Ortalama Net', value: avgRecentNet.toFixed(2) }],
        confidence: 0.9
      });

      recommendations.push({
        id: randomUUID(),
        type: 'support',
        priority: 'high',
        title: 'Yoğun Destek Programı',
        description: 'Öğrenci için kapsamlı bir destek programı oluşturulmalıdır.',
        actionable_steps: [
          'Ek ders desteği sağlanması',
          'Bireysel çalışma planı hazırlanması',
          'Haftalık takip görüşmeleri',
          'Konu eksikliklerinin tespit edilmesi'
        ],
        expected_impact: 'Sistematik destek ile 1-2 ay içinde temel seviyeye ulaşılabilir.'
      });
    }

    const subjectPerformance = db.prepare(`
      SELECT 
        esub.subject_name,
        AVG(esr.net_score) as avg_net,
        COUNT(*) as exam_count
      FROM exam_session_results esr
      INNER JOIN exam_subjects esub ON esr.subject_id = esub.id
      WHERE esr.student_id = ?
      GROUP BY esub.subject_name
      ORDER BY avg_net ASC
      LIMIT 3
    `).all(studentId) as Array<{ subject_name: string; avg_net: number; exam_count: number }>;

    if (subjectPerformance.length > 0) {
      const weakSubjects = subjectPerformance.filter(s => s.avg_net < avgRecentNet * 0.7);
      
      if (weakSubjects.length > 0) {
        insights.push({
          id: randomUUID(),
          category: 'Zayıf Konular',
          severity: 'medium',
          title: `${weakSubjects.length} Derste Belirgin Zayıflık`,
          description: 'Bazı derslerde genel ortalamanın altında performans gösteriliyor.',
          data_points: weakSubjects.map(s => ({
            label: s.subject_name,
            value: s.avg_net.toFixed(2)
          })),
          confidence: 0.8
        });

        recommendations.push({
          id: randomUUID(),
          type: 'support',
          priority: 'medium',
          title: 'Hedefli Ders Desteği',
          description: 'Zayıf olunan derslere odaklanılmalıdır.',
          actionable_steps: weakSubjects.map(s => `${s.subject_name} dersi için özel çalışma planı`),
          expected_impact: 'Hedefli çalışma ile bu derslerde 3-4 hafta içinde iyileşme beklenir.'
        });
      }
    }

    return {
      student_id: studentId,
      analysis_type: 'risk',
      insights,
      recommendations,
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in analyzeStudentRisk:', error);
    return null;
  }
}

export function identifyWeakSubjects(studentId: string): WeakSubjectAnalysis | null {
  try {
    const db = getDatabase();
    
    const studentQuery = db.prepare('SELECT name FROM students WHERE id = ?').get(studentId) as { name: string } | undefined;
    if (!studentQuery) {
      return null;
    }

    const results = examResultsRepo.getExamResultsByStudent(studentId);
    if (results.length === 0) {
      return null;
    }

    const subjectGroups = new Map<string, Array<{ net_score: number; exam_date: string }>>();
    
    results.forEach(result => {
      const key = result.subject_id || 'unknown';
      if (!subjectGroups.has(key)) {
        subjectGroups.set(key, []);
      }
      subjectGroups.get(key)!.push({
        net_score: result.net_score,
        exam_date: result.exam_date || new Date().toISOString()
      });
    });

    const weakSubjects: WeakSubjectDetail[] = [];
    const overallAvg = results.reduce((sum, r) => sum + r.net_score, 0) / results.length;

    for (const [subjectId, subjectResults] of subjectGroups.entries()) {
      const avgNet = subjectResults.reduce((sum, r) => sum + r.net_score, 0) / subjectResults.length;
      
      if (avgNet < overallAvg * 0.7 || avgNet < 15) {
        const subject = db.prepare('SELECT subject_name, question_count FROM exam_subjects WHERE id = ?')
          .get(subjectId) as { subject_name: string; question_count: number } | undefined;

        if (!subject) continue;

        const avg_success_rate = (avgNet / subject.question_count) * 100;

        let trend: 'improving' | 'declining' | 'stable' = 'stable';
        if (subjectResults.length >= 3) {
          const recent = subjectResults.slice(0, 2).reduce((sum, r) => sum + r.net_score, 0) / 2;
          const older = subjectResults.slice(2, 4).reduce((sum, r) => sum + r.net_score, 0) / Math.min(2, subjectResults.length - 2);
          
          if (recent > older * 1.1) {
            trend = 'improving';
          } else if (recent < older * 0.9) {
            trend = 'declining';
          }
        }

        const common_mistakes: string[] = [];
        const improvement_suggestions: string[] = [];

        if (avg_success_rate < 30) {
          common_mistakes.push('Temel kavramların eksik olması');
          common_mistakes.push('Konu anlatımlarının takip edilmemesi');
          improvement_suggestions.push('Konuyu baştan tekrar etmek');
          improvement_suggestions.push('Temel kavramlara odaklanmak');
          improvement_suggestions.push('Video ders desteği almak');
        } else if (avg_success_rate < 50) {
          common_mistakes.push('Soru çözme hızının düşük olması');
          common_mistakes.push('Detay hatalarının yapılması');
          improvement_suggestions.push('Zamanlı soru çözme pratiği yapmak');
          improvement_suggestions.push('Konu testleri çözmek');
        } else {
          common_mistakes.push('Zorlu sorularda zorlanma');
          improvement_suggestions.push('İleri seviye soru bankası çözmek');
          improvement_suggestions.push('Deneme sınavlarına düzenli girmek');
        }

        weakSubjects.push({
          subject_id: subjectId,
          subject_name: subject.subject_name,
          avg_net: Math.round(avgNet * 100) / 100,
          avg_success_rate: Math.round(avg_success_rate * 100) / 100,
          trend,
          common_mistakes,
          improvement_suggestions
        });
      }
    }

    weakSubjects.sort((a, b) => a.avg_net - b.avg_net);

    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    
    return {
      student_id: studentId,
      student_name: studentQuery.name,
      weak_subjects: weakSubjects,
      analysis_period: `${threeMonthsAgo.toLocaleDateString('tr-TR')} - ${now.toLocaleDateString('tr-TR')}`
    };
  } catch (error) {
    console.error('Error in identifyWeakSubjects:', error);
    return null;
  }
}

export function generateSessionRecommendations(sessionId: string): AIAnalysisResult | null {
  try {
    const session = examSessionsRepo.getExamSessionById(sessionId);
    if (!session) {
      return null;
    }

    const results = examResultsRepo.getExamResultsBySession(sessionId);
    if (results.length === 0) {
      return null;
    }

    const insights: AIInsight[] = [];
    const recommendations: AIRecommendation[] = [];

    const students = new Set(results.map(r => r.student_id));
    const participationRate = students.size;

    const studentNets = Array.from(students).map(studentId => {
      const studentResults = results.filter(r => r.student_id === studentId);
      return studentResults.reduce((sum, r) => sum + r.net_score, 0);
    });

    const avgNet = studentNets.reduce((a, b) => a + b, 0) / studentNets.length;
    const lowPerformers = studentNets.filter(n => n < avgNet * 0.6).length;

    if (lowPerformers > students.size * 0.3) {
      insights.push({
        id: randomUUID(),
        category: 'Sınıf Performansı',
        severity: 'high',
        title: 'Yüksek Oranda Düşük Performans',
        description: `Sınıfın %${Math.round((lowPerformers / students.size) * 100)}'inde belirgin düşük performans tespit edildi.`,
        data_points: [
          { label: 'Düşük Performans Gösteren', value: lowPerformers },
          { label: 'Toplam Öğrenci', value: students.size }
        ],
        confidence: 0.85
      });

      recommendations.push({
        id: randomUUID(),
        type: 'intervention',
        priority: 'high',
        title: 'Sınıf Geneli Müdahale',
        description: 'Sınıf genelinde konu eksikliği olabilir.',
        actionable_steps: [
          'Sınavın zorlu konularının tekrar edilmesi',
          'Toplu soru çözüm seansı düzenlenmesi',
          'Öğrencilerle birebir görüşmeler yapılması'
        ],
        expected_impact: 'Sınıf geneli performansta 2-3 hafta içinde iyileşme beklenir.'
      });
    }

    return {
      session_id: sessionId,
      analysis_type: 'recommendation',
      insights,
      recommendations,
      generated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error in generateSessionRecommendations:', error);
    return null;
  }
}
