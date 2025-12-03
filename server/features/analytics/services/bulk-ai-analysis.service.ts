/**
 * Bulk AI Analysis Service
 * Toplu analiz - Sınıf ve okul geneli AI destekli analiz
 */

import { AIProviderService } from '../../../services/ai-provider.service.js';
import getDatabase from '../../../lib/database.js';

interface StudentData {
  id: string;
  name: string;
  surname: string;
  gpa?: number;
  attendanceCount?: number;
  behaviorScore?: number;
  specialStatus?: string;
  alertType?: string;
}

export interface ClassComparison {
  className: string;
  totalStudents: number;
  averageGPA: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  strengths: string[];
  concerns: string[];
  recommendations: string[];
  topPerformers: string[];
  needsSupport: string[];
}

export interface SchoolWideAnalysis {
  overallSummary: string;
  totalStudents: number;
  keyFindings: string[];
  trends: {
    academic: string;
    behavioral: string;
    attendance: string;
    socialEmotional: string;
  };
  classComparisons: ClassComparison[];
  priorityActions: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  resourceAllocation: {
    area: string;
    priority: 'high' | 'medium' | 'low';
    rationale: string;
  }[];
}

export interface EarlyWarningSystemReport {
  timestamp: string;
  criticalAlerts: {
    studentId: string;
    studentName: string;
    alertType: string;
    severity: 'critical' | 'high' | 'medium';
    description: string;
    recommendedAction: string;
  }[];
  trendAlerts: {
    pattern: string;
    affectedStudents: number;
    description: string;
    recommendation: string;
  }[];
  preventiveRecommendations: string[];
}

// Risk threshold constants
// TODO: Bu değerler app_settings tablosunda saklanmalı ve kullanıcı tarafından özelleştirilebilir olmalı
const RISK_THRESHOLDS = {
  CRITICAL: {
    DEVAMSIZLIK: 15,
    NOT_ORT: 45,
    DAVRANUS_NOTU: 3
  },
  HIGH: {
    DEVAMSIZLIK: 10,
    NOT_ORT: 55,
    DAVRANUS_NOTU: 4
  },
  MEDIUM: {
    DEVAMSIZLIK: 5,
    NOT_ORT: 70,
    DAVRANUS_NOTU: 4.5
  }
} as const;

export class BulkAIAnalysisService {
  private aiProvider: AIProviderService;

  constructor() {
    this.aiProvider = AIProviderService.getInstance();
  }

  /**
   * Sınıflar arası karşılaştırmalı analiz
   */
  async compareClasses(): Promise<ClassComparison[]> {
    const db = getDatabase();

    // Get all classes with student data
    const classes = db.prepare(`
      SELECT DISTINCT class FROM students ORDER BY class
    `).all() as { class: string }[];

    const classAnalyses: ClassComparison[] = [];

    for (const classInfo of classes) {
      const students = db.prepare(`
        SELECT * FROM students WHERE class = ?
      `).all(classInfo.class) as StudentData[];

      const analysis = await this.analyzeClass(classInfo.class, students);
      classAnalyses.push(analysis);
    }

    return classAnalyses;
  }

  /**
   * Tek bir sınıfı analiz et
   */
  private async analyzeClass(className: string, students: StudentData[]): Promise<ClassComparison> {
    const prompt = `
Sınıf: ${className}
Öğrenci Sayısı: ${students.length}

Öğrenci Verileri:
${JSON.stringify(students.map(s => ({
  id: s.id,
  name: s.name,
  surname: s.surname,
  gpa: s.gpa,
  attendanceCount: s.attendanceCount,
  behaviorScore: s.behaviorScore,
  specialStatus: s.specialStatus
})), null, 2)}

Bu sınıfı analiz et ve şunları belirle:
1. Güçlü yönler
2. Endişe alanları  
3. Öneriler
4. En başarılı öğrenciler (top 3)
5. Desteğe ihtiyacı olanlar (top 3)

JSON formatında döndür:
{
  "strengths": ["...", "..."],
  "concerns": ["...", "..."],
  "recommendations": ["...", "..."],
  "topPerformers": ["öğrenci adı", ...],
  "needsSupport": ["öğrenci adı", ...]
}
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen sınıf analizi yapan deneyimli bir rehber öğretmensin.'
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
      
      // Calculate stats
      const avgGPA = students.reduce((sum, s) => sum + (s.notOrtalamasi || 0), 0) / students.length;
      const riskDistribution = this.calculateRiskDistribution(students);

      return {
        className,
        totalStudents: students.length,
        averageGPA: Math.round(avgGPA * 10) / 10,
        riskDistribution,
        ...analysis
      };
    } catch (error) {
      console.error(`Class analysis error for ${className}:`, error);
      return this.getFallbackClassAnalysis(className, students);
    }
  }

  /**
   * Okul geneli analiz
   */
  async analyzeSchoolWide(): Promise<SchoolWideAnalysis> {
    const db = getDatabase();
    
    const totalStudents = db.prepare('SELECT COUNT(*) as count FROM students').get() as { count: number };
    const classComparisons = await this.compareClasses();

    const prompt = `
Okul Geneli Veriler:
Toplam Öğrenci: ${totalStudents.count}
Sınıf Sayısı: ${classComparisons.length}

Sınıf Analizleri:
${JSON.stringify(classComparisons, null, 2)}

Okul geneli kapsamlı bir analiz yap:
1. Genel özet
2. Ana bulgular (en az 5)
3. Trendler (akademik, davranışsal, devam, sosyal-duygusal)
4. Öncelikli eylemler (acil, kısa vadeli, uzun vadeli)
5. Kaynak tahsisi önerileri

JSON formatında döndür:
{
  "overallSummary": "2-3 paragraf özet",
  "keyFindings": ["...", "..."],
  "trends": {
    "academic": "...",
    "behavioral": "...",
    "attendance": "...",
    "socialEmotional": "..."
  },
  "priorityActions": {
    "immediate": ["...", "..."],
    "shortTerm": ["...", "..."],
    "longTerm": ["...", "..."]
  },
  "resourceAllocation": [
    {
      "area": "...",
      "priority": "high|medium|low",
      "rationale": "..."
    }
  ]
}
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen okul geneli stratejik planlama yapan eğitim yöneticisi ve rehberlik uzmanısın.'
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

      return {
        ...analysis,
        totalStudents: totalStudents.count,
        classComparisons
      };
    } catch (error) {
      console.error('School-wide analysis error:', error);
      return this.getFallbackSchoolAnalysis(totalStudents.count, classComparisons);
    }
  }

  /**
   * Erken uyarı sistemi raporu
   */
  async generateEarlyWarningReport(): Promise<EarlyWarningSystemReport> {
    const db = getDatabase();

    // Get high-risk students
    const highRiskStudents = db.prepare(`
      SELECT s.*, 
        (CASE 
          WHEN s.attendanceCount > 10 THEN 'high_absence'
          WHEN s.gpa < 50 THEN 'academic_failure'
          WHEN s.behaviorScore < 3 THEN 'behavioral_concern'
          ELSE 'general_risk'
        END) as alertType
      FROM students s
      WHERE s.attendanceCount > 5 OR s.gpa < 60 OR s.behaviorScore < 4
      ORDER BY s.attendanceCount DESC, s.gpa ASC
      LIMIT 20
    `).all() as StudentData[];

    const prompt = `
Yüksek Riskli Öğrenciler:
${JSON.stringify(highRiskStudents, null, 2)}

Erken uyarı sistemi raporu oluştur:
1. Her öğrenci için kritik uyarılar
2. Trend uyarıları (benzer problemler yaşayan öğrenci grupları)
3. Önleyici öneriler

JSON formatında döndür:
{
  "criticalAlerts": [
    {
      "studentId": "...",
      "studentName": "...",
      "alertType": "...",
      "severity": "critical|high|medium",
      "description": "...",
      "recommendedAction": "..."
    }
  ],
  "trendAlerts": [
    {
      "pattern": "...",
      "affectedStudents": 0,
      "description": "...",
      "recommendation": "..."
    }
  ],
  "preventiveRecommendations": ["...", "..."]
}
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen erken uyarı sistemleri uzmanı bir rehber öğretmensin. Risk tespiti ve önleyici müdahaleler konusunda uzmansın.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        format: 'json'
      });

      const report = JSON.parse(response);

      return {
        timestamp: new Date().toISOString(),
        ...report
      };
    } catch (error) {
      console.error('Early warning report error:', error);
      return this.getFallbackEarlyWarningReport(highRiskStudents);
    }
  }

  /**
   * Trend analizi - Zaman içinde değişimler
   */
  async analyzeTrends(timeRange: 'week' | 'month' | 'semester'): Promise<{
    period: string;
    trends: {
      improving: { students: string[]; description: string };
      declining: { students: string[]; description: string };
      stable: { students: string[]; description: string };
    };
    insights: string[];
    recommendations: string[];
  }> {
    // Bu kısım geçmiş veri takibi gerektiriyor
    // Şimdilik basit bir yapı döndürüyoruz
    return {
      period: timeRange,
      trends: {
        improving: { students: [], description: 'Veri toplama aşamasında' },
        declining: { students: [], description: 'Veri toplama aşamasında' },
        stable: { students: [], description: 'Veri toplama aşamasında' }
      },
      insights: ['Trend analizi için daha fazla geçmiş veri gerekiyor'],
      recommendations: ['Düzenli veri girişi yapın', 'Haftalık takip edin']
    };
  }

  private calculateRiskDistribution(students: StudentData[]): ClassComparison['riskDistribution'] {
    const dist = { low: 0, medium: 0, high: 0, critical: 0 };

    students.forEach(s => {
      const attendance = s.attendanceCount || 0;
      const gpa = s.gpa || 0;
      const behavior = s.behaviorScore || 5;

      if (attendance > RISK_THRESHOLDS.CRITICAL.DEVAMSIZLIK || 
          gpa < RISK_THRESHOLDS.CRITICAL.NOT_ORT || 
          behavior < RISK_THRESHOLDS.CRITICAL.DAVRANUS_NOTU) {
        dist.critical++;
      } else if (attendance > RISK_THRESHOLDS.HIGH.DEVAMSIZLIK || 
                 gpa < RISK_THRESHOLDS.HIGH.NOT_ORT || 
                 behavior < RISK_THRESHOLDS.HIGH.DAVRANUS_NOTU) {
        dist.high++;
      } else if (attendance > RISK_THRESHOLDS.MEDIUM.DEVAMSIZLIK || 
                 gpa < RISK_THRESHOLDS.MEDIUM.NOT_ORT || 
                 behavior < RISK_THRESHOLDS.MEDIUM.DAVRANUS_NOTU) {
        dist.medium++;
      } else {
        dist.low++;
      }
    });

    return dist;
  }

  private getFallbackClassAnalysis(className: string, students: StudentData[]): ClassComparison {
    const avgGPA = students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length;

    return {
      className,
      totalStudents: students.length,
      averageGPA: Math.round(avgGPA * 10) / 10,
      riskDistribution: this.calculateRiskDistribution(students),
      strengths: ['AI analizi bekleniyor'],
      concerns: ['AI servisi gerekli'],
      recommendations: ['Ollama veya OpenAI aktif hale getirin'],
      topPerformers: [],
      needsSupport: []
    };
  }

  private getFallbackSchoolAnalysis(totalStudents: number, classComparisons: ClassComparison[]): SchoolWideAnalysis {
    return {
      overallSummary: 'AI servisi aktif olduğunda detaylı analiz yapılacak.',
      totalStudents,
      keyFindings: ['Veri analizi bekleniyor'],
      trends: {
        academic: 'Analiz bekleniyor',
        behavioral: 'Analiz bekleniyor',
        attendance: 'Analiz bekleniyor',
        socialEmotional: 'Analiz bekleniyor'
      },
      classComparisons,
      priorityActions: {
        immediate: ['AI servisi aktif hale getirin'],
        shortTerm: ['Veri toplama sürecini iyileştirin'],
        longTerm: ['Sistematik izleme yapın']
      },
      resourceAllocation: [
        {
          area: 'AI Servisi',
          priority: 'high',
          rationale: 'Detaylı analiz için gerekli'
        }
      ]
    };
  }

  private getFallbackEarlyWarningReport(students: StudentData[]): EarlyWarningSystemReport {
    return {
      timestamp: new Date().toISOString(),
      criticalAlerts: students.slice(0, 5).map(s => ({
        studentId: s.id,
        studentName: `${s.name} ${s.surname}`,
        alertType: s.alertType || 'general_risk',
        severity: 'high' as const,
        description: 'Manuel değerlendirme gerekli',
        recommendedAction: 'Rehber öğretmen görüşmesi'
      })),
      trendAlerts: [
        {
          pattern: 'Veri analizi bekleniyor',
          affectedStudents: students.length,
          description: 'AI servisi aktif olduğunda trend analizi yapılacak',
          recommendation: 'Ollama veya OpenAI aktif hale getirin'
        }
      ],
      preventiveRecommendations: [
        'Düzenli veri girişi yapın',
        'AI servisi aktif hale getirin'
      ]
    };
  }
}
