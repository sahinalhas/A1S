/**
 * Automatic Report Generator Service
 * Dönemsel gelişim raporları, RAM/BEP raporları otomatik oluşturma
 */

import { AIProviderService } from '../../../services/ai-provider.service.js';
import { StudentContextService } from '../../../services/student-context.service.js';
import getDatabase from '../../../lib/database.js';

export interface ProgressReport {
  studentId: string;
  studentName: string;
  reportPeriod: string;
  reportType: 'quarterly' | 'semester' | 'annual';
  
  executiveSummary: string;
  
  academicProgress: {
    overview: string;
    subjectPerformance: {
      subject: string;
      grade: number;
      trend: 'improving' | 'stable' | 'declining';
      comments: string;
    }[];
    strengths: string[];
    areasForImprovement: string[];
  };
  
  socialEmotionalDevelopment: {
    overview: string;
    competencies: {
      area: string;
      level: 'strong' | 'developing' | 'needs_support';
      comments: string;
    }[];
    peerRelations: string;
    teacherObservations: string;
  };
  
  behavioralObservations: {
    overview: string;
    positivePatterns: string[];
    concerningPatterns: string[];
    interventions: string[];
  };
  
  attendanceAndParticipation: {
    attendanceRate: number;
    absences: { excused: number; unexcused: number };
    participationLevel: string;
    comments: string;
  };
  
  recommendations: {
    forStudent: string[];
    forParents: string[];
    forTeachers: string[];
  };
  
  nextSteps: string[];
}

export interface RAMReport {
  studentId: string;
  studentName: string;
  referralReason: string;
  
  backgroundInformation: {
    familyContext: string;
    medicalHistory: string;
    educationalHistory: string;
  };
  
  currentConcerns: {
    academic: string[];
    behavioral: string[];
    socialEmotional: string[];
    physical: string[];
  };
  
  observationsAndAssessments: {
    classroomObservations: string;
    teacherReports: string;
    counselorAssessment: string;
    parentInput: string;
  };
  
  interventionsAttempted: {
    intervention: string;
    duration: string;
    effectiveness: 'effective' | 'partially_effective' | 'not_effective';
    notes: string;
  }[];
  
  recommendedServices: string[];
  urgencyLevel: 'immediate' | 'priority' | 'routine';
  additionalNotes: string;
}

export interface BEPReport {
  studentId: string;
  studentName: string;
  
  studentProfile: {
    diagnosis: string;
    strengths: string[];
    needs: string[];
    learningStyle: string;
  };
  
  currentPerformanceLevels: {
    area: string;
    currentLevel: string;
    benchmarks: string;
  }[];
  
  annualGoals: {
    goal: string;
    measurableCriteria: string;
    timeline: string;
    responsibleParty: string;
  }[];
  
  accommodations: {
    category: string;
    accommodations: string[];
  }[];
  
  specializedInstruction: {
    service: string;
    frequency: string;
    duration: string;
    provider: string;
  }[];
  
  progressMonitoring: {
    method: string;
    frequency: string;
    criteria: string;
  };
  
  transitionPlanning?: {
    shortTerm: string[];
    longTerm: string[];
  };
}

export class AutoReportGeneratorService {
  private aiProvider: AIProviderService;
  private contextService: StudentContextService;

  constructor() {
    this.aiProvider = AIProviderService.getInstance();
    this.contextService = new StudentContextService();
  }

  /**
   * Dönemsel gelişim raporu oluştur
   */
  async generateProgressReport(
    studentId: string,
    reportType: 'quarterly' | 'semester' | 'annual',
    reportPeriod: string
  ): Promise<ProgressReport> {
    const context = await this.contextService.getStudentContext(studentId);
    const contextText = this.contextService.formatContextForAI(context);

    const prompt = `
Öğrenci: ${context.student.name}
Rapor Tipi: ${reportType}
Dönem: ${reportPeriod}

Öğrenci Bağlamı:
${contextText}

Kapsamlı bir ${reportType} gelişim raporu oluştur. Rapor şunları içermeli:

1. Yönetici Özeti (2-3 paragraf)
2. Akademik İlerleme (ders bazında performans, güçlü yönler, gelişim alanları)
3. Sosyal-Duygusal Gelişim (yetkinlikler, akran ilişkileri, öğretmen gözlemleri)
4. Davranışsal Gözlemler (pozitif ve endişe verici paternler, müdahaleler)
5. Devam ve Katılım (devamsızlık, katılım seviyesi)
6. Öneriler (öğrenci, veli, öğretmen için)
7. Sonraki Adımlar

JSON formatında döndür (ProgressReport tipine uygun)
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen profesyonel eğitim raporları hazırlayan deneyimli bir rehber öğretmensin. MEB standartlarına uygun, yapıcı ve detaylı raporlar yazıyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        format: 'json'
      });

      const report = JSON.parse(response);

      return {
        studentId,
        studentName: context.student.name,
        reportPeriod,
        reportType,
        ...report
      };
    } catch (error) {
      console.error('Progress report generation error:', error);
      return this.getFallbackProgressReport(studentId, context, reportType, reportPeriod);
    }
  }

  /**
   * RAM (Rehberlik ve Araştırma Merkezi) sevk raporu oluştur
   */
  async generateRAMReport(studentId: string, referralReason: string): Promise<RAMReport> {
    const context = await this.contextService.getStudentContext(studentId);
    const contextText = this.contextService.formatContextForAI(context);

    const prompt = `
Öğrenci: ${context.student.name}
Sevk Nedeni: ${referralReason}

Öğrenci Bağlamı:
${contextText}

RAM'a sevk için resmi bir rapor hazırla. Rapor şunları içermeli:

1. Geçmiş Bilgileri (aile bağlamı, sağlık geçmişi, eğitim geçmişi)
2. Mevcut Endişeler (akademik, davranışsal, sosyal-duygusal, fiziksel)
3. Gözlemler ve Değerlendirmeler (sınıf, öğretmen, rehber, veli)
4. Denenen Müdahaleler (müdahale, süre, etkinlik, notlar)
5. Önerilen Hizmetler
6. Aciliyet Seviyesi
7. Ek Notlar

JSON formatında döndür (RAMReport tipine uygun)
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen RAM sevk raporları hazırlayan uzman bir rehber öğretmensin. MEB formatlarına uygun, detaylı ve objektif raporlar yazıyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        format: 'json'
      });

      const report = JSON.parse(response);

      return {
        studentId,
        studentName: context.student.name,
        referralReason,
        ...report
      };
    } catch (error) {
      console.error('RAM report generation error:', error);
      return this.getFallbackRAMReport(studentId, context, referralReason);
    }
  }

  /**
   * BEP (Bireyselleştirilmiş Eğitim Programı) raporu oluştur
   */
  async generateBEPReport(studentId: string, diagnosis?: string): Promise<BEPReport> {
    const context = await this.contextService.getStudentContext(studentId);
    const contextText = this.contextService.formatContextForAI(context);

    const prompt = `
Öğrenci: ${context.student.name}
${diagnosis ? `Tanı: ${diagnosis}` : ''}

Öğrenci Bağlamı:
${contextText}

Bireyselleştirilmiş Eğitim Programı (BEP) raporu hazırla. Rapor şunları içermeli:

1. Öğrenci Profili (tanı, güçlü yönler, ihtiyaçlar, öğrenme stili)
2. Mevcut Performans Seviyeleri (alan, mevcut seviye, ölçütler)
3. Yıllık Hedefler (hedef, ölçülebilir kriterler, zaman çizelgesi, sorumlu)
4. Uyarlamalar (kategori bazında)
5. Özel Eğitim (hizmet, sıklık, süre, sağlayıcı)
6. İlerleme İzleme (yöntem, sıklık, kriterler)
7. Geçiş Planlaması (kısa ve uzun vadeli)

JSON formatında döndür (BEPReport tipine uygun)
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen BEP hazırlama konusunda uzman bir özel eğitim öğretmeni ve rehber öğretmensin. MEB BEP formatlarına uygun, öğrenci merkezli planlar oluşturuyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        format: 'json'
      });

      const report = JSON.parse(response);

      return {
        studentId,
        studentName: context.student.name,
        ...report
      };
    } catch (error) {
      console.error('BEP report generation error:', error);
      return this.getFallbackBEPReport(studentId, context, diagnosis);
    }
  }

  /**
   * Toplu rapor oluştur (bir sınıf veya grup için)
   */
  async generateBulkReports(
    studentIds: string[],
    reportType: 'progress' | 'summary'
  ): Promise<any[]> {
    const reports: unknown[] = [];

    for (const studentId of studentIds) {
      try {
        if (reportType === 'progress') {
          const report = await this.generateProgressReport(
            studentId,
            'quarterly',
            'Dönem 1'
          );
          reports.push(report);
        } else {
          const context = await this.contextService.getStudentContext(studentId);
          reports.push({
            studentId,
            studentName: context.student.name,
            summary: `${context.student.name} için özet rapor`
          });
        }
      } catch (error) {
        console.error(`Bulk report error for student ${studentId}:`, error);
      }
    }

    return reports;
  }

  private getFallbackProgressReport(
    studentId: string,
    context: any,
    reportType: string,
    reportPeriod: string
  ): ProgressReport {
    return {
      studentId,
      studentName: context.student.name,
      reportPeriod,
      reportType: reportType as any,
      executiveSummary: 'AI servisi aktif olduğunda detaylı rapor oluşturulacak.',
      academicProgress: {
        overview: 'Veri analizi bekleniyor',
        subjectPerformance: [],
        strengths: ['Analiz bekleniyor'],
        areasForImprovement: ['Analiz bekleniyor']
      },
      socialEmotionalDevelopment: {
        overview: 'Veri analizi bekleniyor',
        competencies: [],
        peerRelations: 'Veri yok',
        teacherObservations: 'Veri yok'
      },
      behavioralObservations: {
        overview: 'Veri analizi bekleniyor',
        positivePatterns: [],
        concerningPatterns: [],
        interventions: []
      },
      attendanceAndParticipation: {
        attendanceRate: 0,
        absences: { excused: 0, unexcused: 0 },
        participationLevel: 'Bilinmiyor',
        comments: 'Veri yok'
      },
      recommendations: {
        forStudent: ['AI servisi aktif hale getirin'],
        forParents: ['AI servisi aktif hale getirin'],
        forTeachers: ['AI servisi aktif hale getirin']
      },
      nextSteps: ['Ollama veya OpenAI aktif hale getirin']
    };
  }

  private getFallbackRAMReport(studentId: string, context: any, referralReason: string): RAMReport {
    return {
      studentId,
      studentName: context.student.name,
      referralReason,
      backgroundInformation: {
        familyContext: 'Veri girilmedi',
        medicalHistory: 'Veri girilmedi',
        educationalHistory: 'Veri girilmedi'
      },
      currentConcerns: {
        academic: ['Manuel değerlendirme gerekli'],
        behavioral: [],
        socialEmotional: [],
        physical: []
      },
      observationsAndAssessments: {
        classroomObservations: 'AI servisi gerekli',
        teacherReports: 'Manuel giriş yapın',
        counselorAssessment: 'Manuel giriş yapın',
        parentInput: 'Manuel giriş yapın'
      },
      interventionsAttempted: [],
      recommendedServices: ['Değerlendirme bekleniyor'],
      urgencyLevel: 'routine',
      additionalNotes: 'AI servisi aktif olduğunda detaylı rapor oluşturulacak'
    };
  }

  private getFallbackBEPReport(studentId: string, context: any, diagnosis?: string): BEPReport {
    return {
      studentId,
      studentName: context.student.name,
      studentProfile: {
        diagnosis: diagnosis || 'Belirtilmedi',
        strengths: ['Manuel değerlendirme gerekli'],
        needs: ['Manuel değerlendirme gerekli'],
        learningStyle: 'Belirlenemedi'
      },
      currentPerformanceLevels: [],
      annualGoals: [],
      accommodations: [],
      specializedInstruction: [],
      progressMonitoring: {
        method: 'Belirlenemedi',
        frequency: 'Belirlenemedi',
        criteria: 'Belirlenemedi'
      }
    };
  }
}
