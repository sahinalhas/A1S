/**
 * Pattern Analysis Service
 * Öğrenci verilerinden örüntüler, trendler ve ilişkiler çıkarır
 * 
 * Bu servis AI'nın "derin çıkarımlar" yapmasını sağlayan
 * analitik altyapıyı sağlar.
 */

import getDatabase from '../lib/database.js';

export interface PatternInsight {
  category: 'TREND' | 'PATTERN' | 'CORRELATION' | 'ANOMALY' | 'PREDICTION';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  description: string;
  evidence: string[];
  recommendation?: string;
}

export class PatternAnalysisService {
  private db: ReturnType<typeof getDatabase>;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Öğrenci için tüm pattern'leri analiz et ve insight'lar üret
   */
  async analyzeStudentPatterns(studentId: string): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];

    // Akademik trend analizi
    insights.push(...await this.analyzeAcademicTrends(studentId));

    // Davranışsal pattern analizi
    insights.push(...await this.analyzeBehavioralPatterns(studentId));

    // Devamsızlık analizi
    insights.push(...await this.analyzeAttendancePatterns(studentId));

    // Korelasyon analizi (çapraz boyut)
    insights.push(...await this.analyzeCrossFactorCorrelations(studentId));

    // Temporal patterns (zamansal örüntüler)
    insights.push(...await this.analyzeTemporalPatterns(studentId));

    return insights.filter(i => i != null);
  }

  /**
   * Akademik trendleri analiz et
   */
  private async analyzeAcademicTrends(studentId: string): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];

    // Son 6 ayın sınav sonuçları
    const exams = this.db.prepare(`
      SELECT totalScore, examDate, examName
      FROM exam_results
      WHERE studentId = ? AND examDate >= date('now', '-6 months') AND totalScore IS NOT NULL
      ORDER BY examDate ASC
    `).all(studentId) as any[];

    if (exams.length < 3) return insights;

    // Not ortalaması trendi
    const grades = exams.map(e => parseFloat(e.totalScore) || 0).filter(g => g > 0);
    if (grades.length >= 3) {
      const recentAvg = grades.slice(-3).reduce((a, b) => a + b, 0) / 3;
      const earlierAvg = grades.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const change = recentAvg - earlierAvg;

      if (change > 10) {
        insights.push({
          category: 'TREND',
          severity: 'INFO',
          title: 'Akademik Performans Yükselişi',
          description: `Son 3 aydaki not ortalaması önceki döneme göre ${change.toFixed(1)} puan arttı.`,
          evidence: [
            `Önceki dönem ortalaması: ${earlierAvg.toFixed(1)}`,
            `Son dönem ortalaması: ${recentAvg.toFixed(1)}`,
            `Trend: Yükseliş (+${change.toFixed(1)} puan)`
          ],
          recommendation: 'Bu pozitif trendi sürdürmek için motivasyonu yüksek tutun ve başarıları takdir edin.'
        });
      } else if (change < -10) {
        insights.push({
          category: 'TREND',
          severity: 'WARNING',
          title: 'Akademik Performans Düşüşü',
          description: `Son 3 aydaki not ortalaması önceki döneme göre ${Math.abs(change).toFixed(1)} puan düştü.`,
          evidence: [
            `Önceki dönem ortalaması: ${earlierAvg.toFixed(1)}`,
            `Son dönem ortalaması: ${recentAvg.toFixed(1)}`,
            `Trend: Düşüş (${change.toFixed(1)} puan)`
          ],
          recommendation: 'Acil müdahale gerekli. Nedenleri araştırın: Motivasyon kaybı? Anlama güçlüğü? Kişisel sorunlar?'
        });
      }
    }

    // Subject-specific analiz (ders bazlı performans takibi)
    const subjectScores = this.db.prepare(`
      SELECT 
        examDate,
        turkishScore, mathScore, scienceScore, socialScore, foreignLanguageScore
      FROM exam_results
      WHERE studentId = ? 
      AND examDate >= date('now', '-6 months')
      AND (turkishScore IS NOT NULL OR mathScore IS NOT NULL OR scienceScore IS NOT NULL 
           OR socialScore IS NOT NULL OR foreignLanguageScore IS NOT NULL)
      ORDER BY examDate ASC
    `).all(studentId) as any[];

    if (subjectScores.length >= 3) {
      const subjects = [
        { name: 'Türkçe', key: 'turkishScore' },
        { name: 'Matematik', key: 'mathScore' },
        { name: 'Fen Bilimleri', key: 'scienceScore' },
        { name: 'Sosyal Bilimler', key: 'socialScore' },
        { name: 'Yabancı Dil', key: 'foreignLanguageScore' }
      ];

      subjects.forEach(subject => {
        const scores = subjectScores
          .map(e => e[subject.key])
          .filter(s => s != null && s > 0);
        
        if (scores.length >= 3) {
          const recentAvg = scores.slice(-2).reduce((a, b) => a + b, 0) / Math.min(2, scores.slice(-2).length);
          const earlierAvg = scores.slice(0, 2).reduce((a, b) => a + b, 0) / Math.min(2, scores.slice(0, 2).length);
          const change = recentAvg - earlierAvg;

          if (change > 15) {
            insights.push({
              category: 'TREND',
              severity: 'INFO',
              title: `${subject.name} Dersi Performans Artışı`,
              description: `${subject.name} dersinde son sınavlarda belirgin başarı artışı (${change.toFixed(1)} puan).`,
              evidence: [
                `Önceki ortalama: ${earlierAvg.toFixed(1)}`,
                `Son ortalama: ${recentAvg.toFixed(1)}`
              ],
              recommendation: `${subject.name} dersindeki bu başarıyı pekiştirin ve diğer derslerde de benzer stratejiler uygulayın.`
            });
          } else if (change < -15) {
            insights.push({
              category: 'TREND',
              severity: 'WARNING',
              title: `${subject.name} Dersi Performans Düşüşü`,
              description: `${subject.name} dersinde son sınavlarda belirgin düşüş (${Math.abs(change).toFixed(1)} puan).`,
              evidence: [
                `Önceki ortalama: ${earlierAvg.toFixed(1)}`,
                `Son ortalama: ${recentAvg.toFixed(1)}`
              ],
              recommendation: `${subject.name} dersi için acil ek destek gerekli. Konuları anlama güçlüğü olabilir.`
            });
          }
        }
      });
    }

    return insights;
  }

  /**
   * Davranışsal pattern'leri analiz et
   */
  private async analyzeBehavioralPatterns(studentId: string): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];

    let incidents: Array<{ behaviorCategory: string; behaviorType: string; incidentDate: string; description: string }> = [];
    try {
      incidents = this.db.prepare(`
        SELECT behaviorCategory, behaviorType, incidentDate, description
        FROM standardized_behavior_incidents
        WHERE studentId = ? AND incidentDate >= date('now', '-3 months')
        ORDER BY incidentDate ASC
      `).all(studentId) as Array<{ behaviorCategory: string; behaviorType: string; incidentDate: string; description: string }>;
    } catch (error) {
      // Table may not exist yet
      incidents = [];
    }

    if (incidents.length === 0) return insights;

    // ✅ OPTIMIZATION: Single pass for month counting instead of 2 separate filters
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sixtyDaysAgo = now - 60 * 24 * 60 * 60 * 1000;
    
    let lastMonthCount = 0;
    let previousMonthCount = 0;
    const categoryCount = new Map<string, number>();

    incidents.forEach(i => {
      const incidentTime = new Date(i.incidentDate).getTime();
      
      // Count by month in single pass
      if (incidentTime >= thirtyDaysAgo) {
        lastMonthCount++;
      } else if (incidentTime >= sixtyDaysAgo && incidentTime < thirtyDaysAgo) {
        previousMonthCount++;
      }
      
      // Count by category
      const count = categoryCount.get(i.behaviorCategory) || 0;
      categoryCount.set(i.behaviorCategory, count + 1);
    });

    if (lastMonthCount > previousMonthCount && lastMonthCount >= 3) {
      insights.push({
        category: 'TREND',
        severity: 'WARNING',
        title: 'Davranış Olaylarında Artış',
        description: `Son ay içinde davranış olayları artış gösterdi (${previousMonthCount} → ${lastMonthCount}).`,
        evidence: [
          `Önceki ay: ${previousMonthCount} olay`,
          `Son ay: ${lastMonthCount} olay`,
          `Artış oranı: %${((lastMonthCount - previousMonthCount) / (previousMonthCount || 1) * 100).toFixed(0)}`
        ],
        recommendation: 'Davranış değişiminin temel nedenini araştırın. Stres faktörleri, aile sorunları veya akran ilişkilerinde problem olabilir.'
      });
    }

    // Tekrarlayan davranış türleri
    categoryCount.forEach((count, category) => {
      if (count >= 3 && category !== 'Olumlu') {
        insights.push({
          category: 'PATTERN',
          severity: count >= 5 ? 'CRITICAL' : 'WARNING',
          title: `Tekrarlayan ${category} Davranışı`,
          description: `Son 3 ay içinde ${count} kez "${category}" kategorisinde davranış kaydı.`,
          evidence: [`Toplam ${count} olay`, `Pattern: Tekrarlayan ${category} davranışı`],
          recommendation: `Bu davranış patternini kırmak için sistematik müdahale gerekli. Olumlu davranış desteği (PBS) stratejileri uygulayın.`
        });
      }
    });

    return insights;
  }

  /**
   * Devamsızlık pattern'lerini analiz et
   */
  private async analyzeAttendancePatterns(studentId: string): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];

    const absences = this.db.prepare(`
      SELECT date, status, reason
      FROM attendance
      WHERE studentId = ? AND date >= date('now', '-3 months')
      AND status IN ('Devamsız', 'Geç')
      ORDER BY date ASC
    `).all(studentId) as any[];

    if (absences.length === 0) return insights;

    // Hafta içi pattern analizi (örn: hep pazartesi)
    const dayPattern = new Map<number, number>();
    absences.forEach(a => {
      const day = new Date(a.date).getDay();
      dayPattern.set(day, (dayPattern.get(day) || 0) + 1);
    });

    const maxDay = Array.from(dayPattern.entries()).reduce((a, b) => a[1] > b[1] ? a : b, [0, 0]);
    if (maxDay[1] >= 3) {
      const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
      insights.push({
        category: 'PATTERN',
        severity: 'WARNING',
        title: `${dayNames[maxDay[0]]} Günü Devamsızlık Paterni`,
        description: `Öğrenci sıklıkla ${dayNames[maxDay[0]]} günleri devamsızlık yapıyor (${maxDay[1]} kez).`,
        evidence: [
          `${dayNames[maxDay[0]]}: ${maxDay[1]} devamsızlık`,
          'Bu belirli bir pattern olabilir'
        ],
        recommendation: `${dayNames[maxDay[0]]} günü özel bir durum var mı araştırın. Aile ile görüşerek neden belirleyin.`
      });
    }

    // Artış trendi
    const lastMonthAbsences = absences.filter(a => 
      new Date(a.date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length;

    if (lastMonthAbsences >= 5) {
      insights.push({
        category: 'TREND',
        severity: lastMonthAbsences >= 10 ? 'CRITICAL' : 'WARNING',
        title: 'Yüksek Devamsızlık Oranı',
        description: `Son ay içinde ${lastMonthAbsences} gün devamsızlık/geç kalma kaydedildi.`,
        evidence: [`Son 30 gün: ${lastMonthAbsences} devamsızlık`],
        recommendation: 'Acil aile görüşmesi yapın. Kronik devamsızlık akademik başarıyı ciddi şekilde etkiler.'
      });
    }

    return insights;
  }

  /**
   * Çapraz faktör korelasyonlarını analiz et
   */
  private async analyzeCrossFactorCorrelations(studentId: string): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];

    // Devamsızlık ile akademik düşüş korelasyonu
    const absenceCount = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM attendance_records
      WHERE studentId = ? AND status = 'Devamsız' 
      AND date >= date('now', '-2 months')
    `).get(studentId) as any;

    const recentGrades = this.db.prepare(`
      SELECT AVG(CAST(totalScore AS REAL)) as avg
      FROM exam_results
      WHERE studentId = ? AND examDate >= date('now', '-2 months') AND totalScore IS NOT NULL
    `).get(studentId) as any;

    if (absenceCount.count >= 5 && recentGrades.avg < 60) {
      insights.push({
        category: 'CORRELATION',
        severity: 'CRITICAL',
        title: 'Devamsızlık-Akademik Düşüş Korelasyonu',
        description: 'Yüksek devamsızlık ile düşük akademik performans arasında belirgin ilişki var.',
        evidence: [
          `Son 2 ay devamsızlık: ${absenceCount.count} gün`,
          `Son 2 ay not ortalaması: ${recentGrades.avg.toFixed(1)}`,
          'Devamsızlık akademik başarıyı doğrudan etkiliyor'
        ],
        recommendation: 'Öncelik devamsızlığı azaltmaya verilmeli. Devam sağlanmadan akademik destek etkili olmaz.'
      });
    }

    // Davranış olayları ile sosyal-duygusal skor korelasyonu
    let recentIncidents: any = { count: 0 };
    try {
      recentIncidents = this.db.prepare(`
        SELECT COUNT(*) as count
        FROM standardized_behavior_incidents
        WHERE studentId = ? AND incidentDate >= date('now', '-2 months')
        AND behaviorType != 'OLUMLU'
      `).get(studentId) as any;
    } catch (error) {
      recentIncidents = { count: 0 };
    }

    const selProfile = this.db.prepare(`
      SELECT emotionRegulationLevel
      FROM social_emotional_profiles
      WHERE studentId = ?
      ORDER BY assessmentDate DESC LIMIT 1
    `).get(studentId) as any;

    if (recentIncidents.count >= 3 && selProfile && selProfile.emotionRegulationLevel < 3) {
      insights.push({
        category: 'CORRELATION',
        severity: 'WARNING',
        title: 'Duygu Düzenleme Güçlüğü - Davranış Bağlantısı',
        description: 'Düşük duygu düzenleme becerisi ile davranış problemleri arasında ilişki görülüyor.',
        evidence: [
          `Duygu düzenleme skoru: ${selProfile.emotionRegulationLevel}/5`,
          `Son 2 ay davranış olayı: ${recentIncidents.count}`,
          'Duygularını yönetmekte zorlanıyor'
        ],
        recommendation: 'Sosyal-duygusal öğrenme (SEL) programına alın. Duygu tanıma ve düzenleme becerileri üzerine çalışın.'
      });
    }

    return insights;
  }

  /**
   * Zamansal örüntüleri analiz et (mevsimsel, dönemsel)
   */
  private async analyzeTemporalPatterns(studentId: string): Promise<PatternInsight[]> {
    const insights: PatternInsight[] = [];

    // Son 6 ayın aylık performans ortalamaları
    const monthlyGrades = this.db.prepare(`
      SELECT 
        strftime('%Y-%m', examDate) as month,
        AVG(CAST(totalScore AS REAL)) as avg
      FROM exam_results
      WHERE studentId = ? AND examDate >= date('now', '-6 months') AND totalScore IS NOT NULL
      GROUP BY month
      ORDER BY month ASC
    `).all(studentId) as any[];

    if (monthlyGrades.length >= 3) {
      // Dönemsel düşüş var mı?
      const grades = monthlyGrades.map(m => m.avg);
      const firstHalf = grades.slice(0, Math.floor(grades.length / 2));
      const secondHalf = grades.slice(Math.floor(grades.length / 2));
      
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      if (secondAvg < firstAvg - 10) {
        insights.push({
          category: 'TREND',
          severity: 'WARNING',
          title: 'Dönem İlerledikçe Performans Düşüşü',
          description: 'Akademik yılın ilerleyen dönemlerinde performansta belirgin düşüş var.',
          evidence: [
            `Dönem başı ortalaması: ${firstAvg.toFixed(1)}`,
            `Güncel ortalama: ${secondAvg.toFixed(1)}`,
            'Yorgunluk veya motivasyon kaybı göstergesi olabilir'
          ],
          recommendation: 'Öğrenci yorulma ve tükenmişlik gösterisi gösteriyor olabilir. Dinlenme, motivasyon desteği ve çalışma planı düzenlenmesi gerekli.'
        });
      }
    }

    return insights;
  }

  /**
   * Insight'ları formatla (AI için)
   */
  formatInsightsForAI(insights: PatternInsight[]): string {
    if (insights.length === 0) {
      return 'Önemli pattern veya trend tespit edilmedi.';
    }

    const critical = insights.filter(i => i.severity === 'CRITICAL');
    const warning = insights.filter(i => i.severity === 'WARNING');
    const info = insights.filter(i => i.severity === 'INFO');

    let text = '';

    if (critical.length > 0) {
      text += `\n**KRİTİK BULGULAR (${critical.length}):**\n`;
      critical.forEach((insight, i) => {
        text += `\n${i + 1}. ${insight.title}\n`;
        text += `   - ${insight.description}\n`;
        text += `   - Kanıtlar: ${insight.evidence.join(', ')}\n`;
        if (insight.recommendation) {
          text += `   - Öneri: ${insight.recommendation}\n`;
        }
      });
    }

    if (warning.length > 0) {
      text += `\n**DİKKAT GEREKTİREN BULGULAR (${warning.length}):**\n`;
      warning.forEach((insight, i) => {
        text += `\n${i + 1}. ${insight.title}\n`;
        text += `   - ${insight.description}\n`;
        text += `   - Kanıtlar: ${insight.evidence.join(', ')}\n`;
        if (insight.recommendation) {
          text += `   - Öneri: ${insight.recommendation}\n`;
        }
      });
    }

    if (info.length > 0) {
      text += `\n**POZİTİF BULGULAR (${info.length}):**\n`;
      info.forEach((insight, i) => {
        text += `\n${i + 1}. ${insight.title}\n`;
        text += `   - ${insight.description}\n`;
      });
    }

    return text;
  }
}

export default PatternAnalysisService;
