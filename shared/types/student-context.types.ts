/**
 * Canonical Student Context Types
 * Öğrenci Bağlam Tipleri
 * 
 * Tüm öğrenci bağlam yapıları için tek kaynak
 */

import type { UnifiedStudentScores, ProfileCompleteness } from './student.types.js';
import type { PatternInsight } from '../../server/services/pattern-analysis.service.js';

/**
 * Kapsamlı öğrenci bağlamı - AI ve deep analysis için
 */
export interface StudentContext {
  // Temel Bilgiler
  student: {
    id: string;
    name: string;
    class: string; // Veritabanındaki 'class' kolonu ile tutarlı
    age?: number;
    gender?: string;
  };

  // Akademik Bilgiler
  academic: {
    gpa?: number;
    recentExams?: Array<{ subject: string; score: number; date: string }>;
    strengths?: string[];
    weaknesses?: string[];
    performanceTrend?: 'improving' | 'declining' | 'stable';
  };

  // Sosyal-Duygusal Bilgiler
  socialEmotional: {
    competencies?: Record<string, number>;
    strengths?: string[];
    challenges?: string[];
    relationships?: string;
  };

  // Davranışsal Bilgiler
  behavioral: {
    recentIncidents?: Array<{
      date: string;
      type: string;
      severity: string;
      description: string;
    }>;
    positiveCount?: number;
    negativeCount?: number;
    trends?: string;
  };

  // Devam Durumu
  attendance: {
    rate?: number;
    recentAbsences?: number;
    excusedVsUnexcused?: { excused: number; unexcused: number };
  };

  // Risk Değerlendirmesi
  risk: {
    level: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'ÇOK_YÜKSEK';
    factors?: string[];
    protectiveFactors?: string[];
    alerts?: Array<{
      type: string;
      level: string;
      description: string;
      date: string;
    }>;
  };

  // Görüşmeler ve Müdahaleler
  interventions: {
    recentSessions?: Array<{
      date: string;
      type: string;
      topic: string;
      summary?: string;
    }>;
    activeInterventions?: Array<{
      title: string;
      status: string;
      startDate: string;
    }>;
  };

  // Skorlar
  scores?: UnifiedStudentScores;
  completeness?: ProfileCompleteness;

  // Pattern Analysis ve Deep Insights
  patternInsights?: PatternInsight[];

  // HOLİSTİK PROFİL VERİLERİ
  holisticProfile?: {
    socioeconomic?: {
      familyIncomeLevel?: string;
      parentEmploymentStatus?: string;
      educationLevel?: string;
      housingCondition?: string;
      resourceAccess?: string;
      financialBarriers?: string;
      supportSystems?: string;
    };
    interests?: {
      hobbies?: string;
      passions?: string;
      favoriteSubjects?: string;
      careerInterests?: string;
      extracurriculars?: string;
    };
    futureVision?: {
      careerGoals?: string;
      educationalAspirations?: string;
      lifeGoals?: string;
      motivationSources?: string;
      preparationSteps?: string;
    };
    strengths?: {
      personalStrengths?: string[];
      academicStrengths?: string[];
      socialStrengths?: string[];
      characterTraits?: string[];
    };
  };
}

/**
 * Basit öğrenci bağlamı - AI session analysis için
 * Ağır StudentContext'in hafif versiyonu
 */
export interface BasicStudentContext {
  id: string;
  name: string;
  surname: string;
  class: string; // Veritabanındaki 'class' kolonu ile tutarlı
  age?: number;
  riskLevel?: string;
}

/**
 * Önceki görüşme bilgisi
 */
export interface PreviousSession {
  id: string;
  sessionDate: string;
  topic: string;
  detailedNotes?: string;
  emotionalState?: string;
  sessionFlow?: string;
}

/**
 * Risk uyarısı bilgisi
 */
export interface RiskAlert {
  id: string;
  type: string;
  severity: string;
  description: string;
  createdAt: string;
}
