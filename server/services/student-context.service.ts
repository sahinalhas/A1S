/**
 * Student Context Service
 * Öğrenci Bağlam Servisi
 * 
 * Tüm öğrenci verilerini toplar ve AI için anlamlı bağlam oluşturur
 * Pattern recognition ve deep insights ile zenginleştirilmiş
 */

import getDatabase from '../lib/database.js';
import type { StudentContext } from '../../shared/types/student-context.types.js';
import type { UnifiedStudentScores, ProfileCompleteness } from '../../shared/types/student.types.js';
import { PatternAnalysisService, type PatternInsight } from './pattern-analysis.service.js';
import { getLatestSocioeconomicByStudent } from '../features/holistic-profile/repository/socioeconomic.repository.js';
import { getLatestInterestByStudent } from '../features/holistic-profile/repository/interests.repository.js';
import { getLatestFutureVisionByStudent } from '../features/holistic-profile/repository/future-vision.repository.js';
import { getLatestStrengthByStudent } from '../features/holistic-profile/repository/strengths.repository.js';
import { safeJsonParseArray } from '../utils/parsers/json.js';

// StudentContext artık shared/types/student-context.types.ts'den import ediliyor
export type { StudentContext } from '../../shared/types/student-context.types.js';

export class StudentContextService {
  private db: ReturnType<typeof getDatabase>;
  private patternAnalyzer: PatternAnalysisService;

  constructor() {
    this.db = getDatabase();
    this.patternAnalyzer = new PatternAnalysisService();
  }

  /**
   * Get complete student context for AI
   * Now includes deep pattern analysis and insights!
   */
  async getStudentContext(studentId: string): Promise<StudentContext> {
    const context: StudentContext = {
      student: await this.getBasicInfo(studentId),
      academic: await this.getAcademicContext(studentId),
      socialEmotional: await this.getSocialEmotionalContext(studentId),
      behavioral: await this.getBehavioralContext(studentId),
      attendance: await this.getAttendanceContext(studentId),
      risk: await this.getRiskContext(studentId),
      interventions: await this.getInterventionContext(studentId),
      talentsInterests: await this.getTalentsInterestsContext(studentId),
      health: await this.getHealthContext(studentId),
      // DERİN PATTERN ANALİZİ - YENİ!
      patternInsights: await this.patternAnalyzer.analyzeStudentPatterns(studentId),
      // HOLİSTİK PROFİL VERİLERİ - YENİ!
      holisticProfile: await this.getHolisticProfileContext(studentId)
    };

    return context;
  }

  /**
   * Get basic student information
   */
  private async getBasicInfo(studentId: string): Promise<StudentContext['student']> {
    const student = this.db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as any;
    
    if (!student) {
      throw new Error(`Student not found: ${studentId}`);
    }

    const age = student.birthDate ? 
      new Date().getFullYear() - new Date(student.birthDate).getFullYear() : 
      undefined;

    return {
      id: student.id,
      name: student.name,
      class: student.className || 'Bilinmiyor',
      age,
      gender: student.gender
    };
  }

  /**
   * Get academic context
   */
  private async getAcademicContext(studentId: string): Promise<StudentContext['academic']> {
    const academic = this.db.prepare(
      'SELECT * FROM academic_profiles WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'
    ).get(studentId) as any;

    let exams: Array<{ subject?: string; examName?: string; totalScore?: number; score?: number; grade?: number; examDate: string }> = [];
    try {
      exams = this.db.prepare(
        'SELECT * FROM exam_results WHERE studentId = ? ORDER BY examDate DESC LIMIT 5'
      ).all(studentId) as Array<{ subject?: string; examName?: string; totalScore?: number; score?: number; grade?: number; examDate: string }>;
    } catch (error) {
      // Table may not exist yet
      exams = [];
    }

    return {
      gpa: undefined,
      recentExams: exams.map((exam: any) => ({
        subject: exam.subject || exam.examName,
        score: exam.totalScore || exam.score || exam.grade,
        date: exam.examDate
      })),
      strengths: safeJsonParseArray(academic?.strongSubjects, [], 'academic strengths'),
      weaknesses: safeJsonParseArray(academic?.weakSubjects, [], 'academic weaknesses'),
      performanceTrend: this.calculatePerformanceTrend(exams)
    };
  }

  /**
   * Get social-emotional context
   */
  private async getSocialEmotionalContext(studentId: string): Promise<StudentContext['socialEmotional']> {
    const sel = this.db.prepare(
      'SELECT * FROM social_emotional_profiles WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'
    ).get(studentId) as any;

    if (!sel) {
      return {};
    }

    return {
      competencies: {
        'Empati': sel.empathyLevel || 0,
        'Öz-farkındalık': sel.selfAwarenessLevel || 0,
        'Duygu Düzenleme': sel.emotionRegulationLevel || 0,
        'Çatışma Çözme': sel.conflictResolutionLevel || 0,
        'Liderlik': sel.leadershipLevel || 0,
        'Takım Çalışması': sel.teamworkLevel || 0,
        'İletişim': sel.communicationLevel || 0
      },
      strengths: safeJsonParseArray(sel.strongSocialSkills, [], 'social skills strengths'),
      challenges: safeJsonParseArray(sel.developingSocialSkills, [], 'social skills challenges'),
      relationships: sel.socialRole
    };
  }

  /**
   * Get behavioral context
   */
  private async getBehavioralContext(studentId: string): Promise<StudentContext['behavioral']> {
    const incidents = this.db.prepare(`
      SELECT * FROM standardized_behavior_incidents 
      WHERE studentId = ? 
      ORDER BY incidentDate DESC, incidentTime DESC 
      LIMIT 10
    `).all(studentId) as any[];

    const stats = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN behaviorType = 'OLUMLU' THEN 1 ELSE 0 END) as positive,
        SUM(CASE WHEN behaviorType != 'OLUMLU' THEN 1 ELSE 0 END) as negative
      FROM standardized_behavior_incidents 
      WHERE studentId = ?
    `).get(studentId) as any;

    return {
      recentIncidents: incidents.map(inc => ({
        date: inc.incidentDate,
        type: inc.behaviorCategory,
        severity: inc.behaviorType,
        description: inc.description
      })),
      positiveCount: stats?.positive || 0,
      negativeCount: stats?.negative || 0,
      trends: this.analyzeBehaviorTrends(incidents)
    };
  }

  /**
   * Get attendance context
   */
  private async getAttendanceContext(studentId: string): Promise<StudentContext['attendance']> {
    const attendance = this.db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'Var' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'Yok' AND (notes LIKE '%mazeret%' OR notes LIKE '%izinli%') THEN 1 ELSE 0 END) as excused,
        SUM(CASE WHEN status = 'Yok' AND (notes NOT LIKE '%mazeret%' AND notes NOT LIKE '%izinli%') THEN 1 ELSE 0 END) as unexcused
      FROM attendance 
      WHERE studentId = ?
    `).get(studentId) as any;

    const recentAbsences = this.db.prepare(`
      SELECT COUNT(*) as count 
      FROM attendance 
      WHERE studentId = ? AND status = 'Yok' AND date >= date('now', '-30 days')
    `).get(studentId) as any;

    const rate = attendance?.total > 0 ? 
      Math.round((attendance.present / attendance.total) * 100) : 
      undefined;

    return {
      rate,
      recentAbsences: recentAbsences?.count || 0,
      excusedVsUnexcused: {
        excused: attendance?.excused || 0,
        unexcused: attendance?.unexcused || 0
      }
    };
  }

  /**
   * Get risk context
   */
  private async getRiskContext(studentId: string): Promise<StudentContext['risk']> {
    const riskProfile = this.db.prepare(
      'SELECT * FROM risk_protective_profiles WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'
    ).get(studentId) as any;

    const alerts = this.db.prepare(`
      SELECT * FROM early_warning_alerts 
      WHERE studentId = ? AND status IN ('AÇIK', 'İNCELENİYOR')
      ORDER BY created_at DESC
    `).all(studentId) as any[];

    const riskFactors: string[] = [];
    if (riskProfile) {
      if (riskProfile.academicRiskFactors) riskFactors.push(riskProfile.academicRiskFactors);
      if (riskProfile.behavioralRiskFactors) riskFactors.push(riskProfile.behavioralRiskFactors);
      if (riskProfile.socialRiskFactors) riskFactors.push(riskProfile.socialRiskFactors);
      if (riskProfile.familyRiskFactors) riskFactors.push(riskProfile.familyRiskFactors);
    }

    return {
      level: riskProfile?.dropoutRisk || 'DÜŞÜK',
      factors: riskFactors,
      protectiveFactors: safeJsonParseArray(riskProfile?.activeProtectiveFactors, [], 'protective factors'),
      alerts: alerts.map(alert => ({
        type: alert.alertType,
        level: alert.alertLevel,
        description: alert.description,
        date: alert.created_at
      }))
    };
  }

  /**
   * Get intervention context
   */
  private async getInterventionContext(studentId: string): Promise<StudentContext['interventions']> {
    const sessions = this.db.prepare(`
      SELECT cs.*, css.studentId
      FROM counseling_sessions cs
      JOIN counseling_session_students css ON cs.id = css.sessionId
      WHERE css.studentId = ?
      ORDER BY cs.sessionDate DESC
      LIMIT 5
    `).all(studentId) as any[];

    const interventions = this.db.prepare(`
      SELECT * FROM interventions 
      WHERE studentId = ? AND status IN ('Devam', 'Planlandı')
      ORDER BY created_at DESC
    `).all(studentId) as any[];

    return {
      recentSessions: sessions.map(session => ({
        date: session.sessionDate,
        type: session.sessionType === 'individual' ? 'Bireysel' : 'Grup',
        topic: session.topic,
        summary: session.detailedNotes
      })),
      activeInterventions: interventions.map(int => ({
        title: int.title,
        status: int.status,
        startDate: int.date
      }))
    };
  }

  /**
   * Get talents and interests context
   */
  private async getTalentsInterestsContext(studentId: string): Promise<StudentContext['talentsInterests']> {
    const profile = this.db.prepare(
      'SELECT * FROM talents_interests_profiles WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 1'
    ).get(studentId) as any;

    if (!profile) {
      return undefined;
    }

    const talents: string[] = [];
    if (profile.creativeTalents) talents.push(...safeJsonParseArray(profile.creativeTalents, [], 'creative talents'));
    if (profile.physicalTalents) talents.push(...safeJsonParseArray(profile.physicalTalents, [], 'physical talents'));

    const interests: string[] = [];
    if (profile.primaryInterests) interests.push(...safeJsonParseArray(profile.primaryInterests, [], 'primary interests'));
    if (profile.exploratoryInterests) interests.push(...safeJsonParseArray(profile.exploratoryInterests, [], 'exploratory interests'));

    return {
      talents,
      interests,
      hobbies: safeJsonParseArray(profile.clubMemberships, [], 'club memberships'),
      careerGoals: safeJsonParseArray(profile.careerAspirations, [], 'career aspirations')
    };
  }

  /**
   * Get health context
   */
  private async getHealthContext(studentId: string): Promise<StudentContext['health']> {
    const health = this.db.prepare(
      'SELECT * FROM standardized_health_profiles WHERE studentId = ?'
    ).get(studentId) as any;

    if (!health) {
      return undefined;
    }

    return {
      conditions: safeJsonParseArray(health.chronicDiseases, [], 'chronic diseases'),
      medications: safeJsonParseArray(health.currentMedications, [], 'current medications'),
      notes: health.additionalNotes
    };
  }

  /**
   * Get holistic profile context (YENİ!)
   */
  private async getHolisticProfileContext(studentId: string): Promise<StudentContext['holisticProfile']> {
    try {
      // Holistik profil verilerini topla
      const socioeconomic = getLatestSocioeconomicByStudent(studentId);
      const interests = getLatestInterestByStudent(studentId);
      const futureVision = getLatestFutureVisionByStudent(studentId);
      const strengths = getLatestStrengthByStudent(studentId);

      // Veri yoksa undefined döndür
      if (!socioeconomic && !interests && !futureVision && !strengths) {
        return undefined;
      }

      return {
        socioeconomic: socioeconomic ? {
          familyIncomeLevel: socioeconomic.familyIncomeLevel,
          parentEmploymentStatus: socioeconomic.parentEmploymentStatus,
          educationLevel: `Anne: ${socioeconomic.motherEducationLevel || 'Bilinmiyor'}, Baba: ${socioeconomic.fatherEducationLevel || 'Bilinmiyor'}`,
          housingCondition: socioeconomic.housingCondition,
          resourceAccess: `İnternet: ${socioeconomic.internetAccess || 'Bilinmiyor'}, Cihaz: ${socioeconomic.deviceAccess || 'Bilinmiyor'}`,
          financialBarriers: socioeconomic.financialBarriers,
          supportSystems: socioeconomic.resourcesAndSupports
        } : undefined,
        
        interests: interests ? {
          hobbies: interests.hobbies,
          passions: interests.passions,
          favoriteSubjects: interests.favoriteSubjects,
          careerInterests: interests.careerInterests,
          extracurriculars: `Kulüpler: ${interests.clubMemberships || 'Yok'}, Gönüllü: ${interests.volunteerWork || 'Yok'}`
        } : undefined,
        
        futureVision: futureVision ? {
          careerGoals: futureVision.careerAspirations,
          educationalAspirations: futureVision.educationalGoals,
          lifeGoals: futureVision.lifeGoals,
          motivationSources: futureVision.motivationSources,
          preparationSteps: futureVision.shortTermGoals
        } : undefined,
        
        strengths: strengths ? {
          personalStrengths: strengths.personalStrengths ? [strengths.personalStrengths] : [],
          academicStrengths: strengths.academicStrengths ? [strengths.academicStrengths] : [],
          socialStrengths: strengths.socialStrengths ? [strengths.socialStrengths] : [],
          characterTraits: strengths.resilienceFactors ? [strengths.resilienceFactors] : []
        } : undefined
      };
    } catch (error) {
      console.error('Holistik profil verileri alınırken hata:', error);
      return undefined;
    }
  }

  /**
   * Calculate performance trend from exams
   */
  private calculatePerformanceTrend(exams: Array<{ totalScore?: number; score?: number; grade?: number }>): 'improving' | 'declining' | 'stable' {
    if (exams.length < 2) return 'stable';

    const recent = exams.slice(0, 3);
    const older = exams.slice(3, 6);

    if (recent.length === 0 || older.length === 0) return 'stable';

    const recentAvg = recent.reduce((sum, e) => sum + ((e as any).totalScore || (e as any).score || (e as any).grade || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, e) => sum + ((e as any).totalScore || (e as any).score || (e as any).grade || 0), 0) / older.length;

    const diff = recentAvg - olderAvg;

    if (diff > 5) return 'improving';
    if (diff < -5) return 'declining';
    return 'stable';
  }

  /**
   * Analyze behavior trends
   */
  private analyzeBehaviorTrends(incidents: Array<{ behaviorType: string }>): string {
    if (incidents.length === 0) return 'Davranış kaydı yok';

    const recent = incidents.slice(0, 5);
    const positiveCount = recent.filter((i: any) => i.behaviorType === 'OLUMLU').length;
    const negativeCount = recent.length - positiveCount;

    if (positiveCount > negativeCount * 2) {
      return 'Son dönemde olumlu davranışlar ağırlıkta';
    } else if (negativeCount > positiveCount * 2) {
      return 'Son dönemde olumsuz davranışlar artışta';
    } else {
      return 'Davranış dengeli seyrediyor';
    }
  }

  /**
   * Format context as natural language text for AI
   */
  formatContextForAI(context: StudentContext): string {
    let text = `# ${context.student.name} - Öğrenci Profili\n\n`;

    text += `## Temel Bilgiler\n`;
    text += `- Sınıf: ${context.student.class}\n`;
    if (context.student.age) text += `- Yaş: ${context.student.age}\n`;
    if (context.student.gender) text += `- Cinsiyet: ${context.student.gender}\n`;
    text += `\n`;

    if (context.academic.gpa) {
      text += `## Akademik Durum\n`;
      text += `- Not Ortalaması: ${context.academic.gpa}\n`;
      text += `- Performans Eğilimi: ${context.academic.performanceTrend === 'improving' ? 'Gelişiyor' : context.academic.performanceTrend === 'declining' ? 'Düşüşte' : 'Stabil'}\n`;
      if (context.academic.strengths && context.academic.strengths.length > 0) {
        text += `- Güçlü Dersler: ${context.academic.strengths.join(', ')}\n`;
      }
      if (context.academic.weaknesses && context.academic.weaknesses.length > 0) {
        text += `- Gelişim Gereken Dersler: ${context.academic.weaknesses.join(', ')}\n`;
      }
      text += `\n`;
    }

    if (context.socialEmotional.competencies) {
      text += `## Sosyal-Duygusal Gelişim\n`;
      Object.entries(context.socialEmotional.competencies).forEach(([key, value]) => {
        text += `- ${key}: ${value}/10\n`;
      });
      if (context.socialEmotional.relationships) {
        text += `- Akran İlişkileri: ${context.socialEmotional.relationships}\n`;
      }
      text += `\n`;
    }

    if (context.behavioral.recentIncidents && context.behavioral.recentIncidents.length > 0) {
      text += `## Davranışsal Durum\n`;
      text += `- Olumlu Davranış Sayısı: ${context.behavioral.positiveCount}\n`;
      text += `- Olumsuz Davranış Sayısı: ${context.behavioral.negativeCount}\n`;
      text += `- Eğilim: ${context.behavioral.trends}\n`;
      text += `\n`;
    }

    if (context.attendance.rate !== undefined) {
      text += `## Devam Durumu\n`;
      text += `- Devam Oranı: %${context.attendance.rate}\n`;
      text += `- Son 30 Gündeki Devamsızlık: ${context.attendance.recentAbsences} gün\n`;
      text += `\n`;
    }

    text += `## Risk Değerlendirmesi\n`;
    text += `- Risk Seviyesi: ${context.risk.level}\n`;
    if (context.risk.factors && context.risk.factors.length > 0) {
      text += `- Risk Faktörleri: ${context.risk.factors.join(', ')}\n`;
    }
    if (context.risk.protectiveFactors && context.risk.protectiveFactors.length > 0) {
      text += `- Koruyucu Faktörler: ${context.risk.protectiveFactors.join(', ')}\n`;
    }
    if (context.risk.alerts && context.risk.alerts.length > 0) {
      text += `- Aktif Uyarılar: ${context.risk.alerts.length} adet\n`;
    }
    text += `\n`;

    if (context.interventions.activeInterventions && context.interventions.activeInterventions.length > 0) {
      text += `## Aktif Müdahaleler\n`;
      context.interventions.activeInterventions.forEach(int => {
        text += `- ${int.title} (${int.status})\n`;
      });
      text += `\n`;
    }

    if (context.talentsInterests) {
      text += `## Yetenek ve İlgi Alanları\n`;
      if (context.talentsInterests.talents && context.talentsInterests.talents.length > 0) {
        text += `- Yetenekler: ${context.talentsInterests.talents.join(', ')}\n`;
      }
      if (context.talentsInterests.interests && context.talentsInterests.interests.length > 0) {
        text += `- İlgi Alanları: ${context.talentsInterests.interests.join(', ')}\n`;
      }
      if (context.talentsInterests.careerGoals && context.talentsInterests.careerGoals.length > 0) {
        text += `- Kariyer Hedefleri: ${context.talentsInterests.careerGoals.join(', ')}\n`;
      }
    }

    // HOLİSTİK PROFİL VERİLERİ - ÖĞRENCİYİ TANIMAYAN BAĞLAM!
    if (context.holisticProfile) {
      text += `\n═══════════════════════════════════════════════════════\n`;
      text += `## 🌟 HOLİSTİK PROFİL: ÖĞRENCININ TAMAMLAYICI YÖNLER\n`;
      text += `═══════════════════════════════════════════════════════\n\n`;
      
      if (context.holisticProfile.strengths) {
        text += `### Güçlü Yönler ve Karakter Özellikleri\n`;
        if (context.holisticProfile.strengths.personalStrengths && context.holisticProfile.strengths.personalStrengths.length > 0) {
          text += `- Kişisel Güçler: ${context.holisticProfile.strengths.personalStrengths.join(', ')}\n`;
        }
        if (context.holisticProfile.strengths.academicStrengths && context.holisticProfile.strengths.academicStrengths.length > 0) {
          text += `- Akademik Güçler: ${context.holisticProfile.strengths.academicStrengths.join(', ')}\n`;
        }
        if (context.holisticProfile.strengths.socialStrengths && context.holisticProfile.strengths.socialStrengths.length > 0) {
          text += `- Sosyal Güçler: ${context.holisticProfile.strengths.socialStrengths.join(', ')}\n`;
        }
        if (context.holisticProfile.strengths.characterTraits && context.holisticProfile.strengths.characterTraits.length > 0) {
          text += `- Dayanıklılık Faktörleri: ${context.holisticProfile.strengths.characterTraits.join(', ')}\n`;
        }
        text += `\n`;
      }

      if (context.holisticProfile.interests) {
        text += `### İlgi Alanları ve Hobiler\n`;
        if (context.holisticProfile.interests.hobbies) {
          text += `- Hobiler: ${context.holisticProfile.interests.hobbies}\n`;
        }
        if (context.holisticProfile.interests.passions) {
          text += `- Tutkuları: ${context.holisticProfile.interests.passions}\n`;
        }
        if (context.holisticProfile.interests.favoriteSubjects) {
          text += `- Favori Dersler: ${context.holisticProfile.interests.favoriteSubjects}\n`;
        }
        if (context.holisticProfile.interests.careerInterests) {
          text += `- Kariyer İlgi Alanları: ${context.holisticProfile.interests.careerInterests}\n`;
        }
        if (context.holisticProfile.interests.extracurriculars) {
          text += `- Ders Dışı Aktiviteler: ${context.holisticProfile.interests.extracurriculars}\n`;
        }
        text += `\n`;
      }

      if (context.holisticProfile.futureVision) {
        text += `### Gelecek Vizyonu ve Hedefler\n`;
        if (context.holisticProfile.futureVision.careerGoals) {
          text += `- Kariyer Hedefleri: ${context.holisticProfile.futureVision.careerGoals}\n`;
        }
        if (context.holisticProfile.futureVision.educationalAspirations) {
          text += `- Eğitim Hedefleri: ${context.holisticProfile.futureVision.educationalAspirations}\n`;
        }
        if (context.holisticProfile.futureVision.lifeGoals) {
          text += `- Hayat Hedefleri: ${context.holisticProfile.futureVision.lifeGoals}\n`;
        }
        if (context.holisticProfile.futureVision.motivationSources) {
          text += `- Motivasyon Kaynakları: ${context.holisticProfile.futureVision.motivationSources}\n`;
        }
        if (context.holisticProfile.futureVision.preparationSteps) {
          text += `- Hazırlık Adımları: ${context.holisticProfile.futureVision.preparationSteps}\n`;
        }
        text += `\n`;
      }

      if (context.holisticProfile.socioeconomic) {
        text += `### Sosyoekonomik Durum ve Destek Sistemleri\n`;
        if (context.holisticProfile.socioeconomic.familyIncomeLevel) {
          text += `- Aile Gelir Düzeyi: ${context.holisticProfile.socioeconomic.familyIncomeLevel}\n`;
        }
        if (context.holisticProfile.socioeconomic.parentEmploymentStatus) {
          text += `- Ebeveyn İstihdam Durumu: ${context.holisticProfile.socioeconomic.parentEmploymentStatus}\n`;
        }
        if (context.holisticProfile.socioeconomic.educationLevel) {
          text += `- Ebeveyn Eğitim Seviyesi: ${context.holisticProfile.socioeconomic.educationLevel}\n`;
        }
        if (context.holisticProfile.socioeconomic.housingCondition) {
          text += `- Konut Durumu: ${context.holisticProfile.socioeconomic.housingCondition}\n`;
        }
        if (context.holisticProfile.socioeconomic.resourceAccess) {
          text += `- Kaynak Erişimi: ${context.holisticProfile.socioeconomic.resourceAccess}\n`;
        }
        if (context.holisticProfile.socioeconomic.financialBarriers) {
          text += `- Finansal Engeller: ${context.holisticProfile.socioeconomic.financialBarriers}\n`;
        }
        if (context.holisticProfile.socioeconomic.supportSystems) {
          text += `- Destek Sistemleri: ${context.holisticProfile.socioeconomic.supportSystems}\n`;
        }
        text += `\n`;
      }
    }

    // DERİN PATTERN ANALİZİ VE ÇIKARIMLAR - BU AI'nın GÜÇLÜ OLMASINI SAĞLAYAN BÖLÜM!
    if (context.patternInsights && context.patternInsights.length > 0) {
      text += `\n═══════════════════════════════════════════════════════\n`;
      text += `## 🔍 DERİN ANALİZ: PATTERN'LER VE ÇIKARIMLAR\n`;
      text += `═══════════════════════════════════════════════════════\n\n`;
      text += `Bu bölüm öğrencinin verilerinden otomatik olarak çıkarılan\n`;
      text += `trendler, pattern'ler, korelasyonlar ve öngörüler içerir.\n`;
      text += `Bu bilgiler, yüzeysel verilerin ötesinde derin içgörüler sunar.\n\n`;
      text += this.patternAnalyzer.formatInsightsForAI(context.patternInsights);
    }

    return text;
  }
}
