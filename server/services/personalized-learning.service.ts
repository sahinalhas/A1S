import { getDatabase } from '../lib/database/connection.js';
import { AIProviderService } from './ai-provider.service.js';
import { logger } from '../utils/logger.js';

export interface LearningStyleProfile {
  studentId: string;
  studentName: string;
  primaryLearningStyle: string;
  secondaryLearningStyle: string;
  learningPreferences: {
    visual: number;
    auditory: number;
    kinesthetic: number;
    reading: number;
  };
  strengths: string[];
  challenges: string[];
  recommendations: string[];
}

export interface AcademicStrengthAnalysis {
  studentId: string;
  strongSubjects: Array<{
    subject: string;
    score: number;
    skills: string[];
  }>;
  weakSubjects: Array<{
    subject: string;
    score: number;
    gaps: string[];
  }>;
  overallPattern: string;
  improvementAreas: string[];
}

export interface PersonalizedStudyPlan {
  studentId: string;
  studentName: string;
  generatedAt: string;
  learningStyle: string;
  motivationType: string;
  weeklyGoals: Array<{
    subject: string;
    goal: string;
    estimatedHours: number;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    strategies: string[];
  }>;
  dailySchedule: Array<{
    day: string;
    sessions: Array<{
      time: string;
      subject: string;
      activity: string;
      duration: number;
      method: string;
    }>;
  }>;
  motivationStrategies: Array<{
    strategy: string;
    frequency: string;
    expectedOutcome: string;
  }>;
  resources: Array<{
    subject: string;
    resourceType: string;
    description: string;
    link?: string;
  }>;
  progressTracking: {
    checkpoints: string[];
    successMetrics: string[];
  };
}

export class PersonalizedLearningService {
  private db: ReturnType<typeof getDatabase>;
  private aiProvider: AIProviderService;

  constructor() {
    this.db = getDatabase();
    this.aiProvider = AIProviderService.getInstance();
  }

  async analyzeLearningStyle(studentId: string): Promise<LearningStyleProfile> {
    const student = this.db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as { id: string; name: string } | undefined;
    if (!student) {
      throw new Error('Öğrenci bulunamadı');
    }

    const learningStyleData = this.db.prepare(`
      SELECT primaryLearningStyle, secondaryLearningStyle, learningPreferences
      FROM learning_styles
      WHERE studentId = ?
      ORDER BY assessmentDate DESC LIMIT 1
    `).get(studentId) as { primaryLearningStyle?: string; secondaryLearningStyle?: string; learningPreferences?: string } | undefined;

    const academicProfile = this.db.prepare(`
      SELECT strongSubjects, weakSubjects, strongSkills, weakSkills
      FROM academic_profiles
      WHERE studentId = ?
      ORDER BY assessmentDate DESC LIMIT 1
    `).get(studentId) as { strongSubjects?: string; weakSubjects?: string; strongSkills?: string; weakSkills?: string } | undefined;

    let preferences = {
      visual: 5,
      auditory: 5,
      kinesthetic: 5,
      reading: 5
    };

    if (learningStyleData?.learningPreferences) {
      try {
        preferences = JSON.parse(learningStyleData.learningPreferences);
      } catch (e) {
        logger.warn('Öğrenme tercihleri parse edilemedi, varsayılan değerler kullanılıyor', 'PersonalizedLearningService', e);
      }
    }

    const primaryStyle = learningStyleData?.primaryLearningStyle || 
                        this.determinePrimaryStyle(preferences);
    const secondaryStyle = learningStyleData?.secondaryLearningStyle || 
                          this.determineSecondaryStyle(preferences, primaryStyle);

    const strengths = this.identifyStrengths(primaryStyle, academicProfile);
    const challenges = this.identifyChallenges(primaryStyle, academicProfile);
    const recommendations = await this.generateLearningRecommendations(
      studentId, 
      primaryStyle, 
      strengths, 
      challenges
    );

    return {
      studentId,
      studentName: student.name,
      primaryLearningStyle: primaryStyle,
      secondaryLearningStyle: secondaryStyle,
      learningPreferences: preferences,
      strengths,
      challenges,
      recommendations
    };
  }

  async analyzeAcademicStrengths(studentId: string): Promise<AcademicStrengthAnalysis> {
    const examResults = this.db.prepare(`
      SELECT 
        examName,
        turkishScore, mathScore, scienceScore, socialScore,
        englishScore, religionScore, physicalEducationScore,
        totalScore, examDate
      FROM exam_results
      WHERE studentId = ? AND examDate >= date('now', '-6 months')
      ORDER BY examDate DESC
      LIMIT 10
    `).all(studentId) as Array<{ [key: string]: string | number }>;

    const academicProfile = this.db.prepare(`
      SELECT strongSubjects, weakSubjects, strongSkills, weakSkills
      FROM academic_profiles
      WHERE studentId = ?
      ORDER BY assessmentDate DESC LIMIT 1
    `).get(studentId) as { strongSubjects?: string; weakSubjects?: string; strongSkills?: string; weakSkills?: string } | undefined;

    const subjectScores = this.calculateSubjectAverages(examResults);
    const strongSubjects = this.identifyStrongSubjects(subjectScores, academicProfile);
    const weakSubjects = this.identifyWeakSubjects(subjectScores, academicProfile);
    const overallPattern = this.analyzeOverallPattern(strongSubjects, weakSubjects);
    const improvementAreas = this.identifyImprovementAreas(weakSubjects, academicProfile);

    return {
      studentId,
      strongSubjects,
      weakSubjects,
      overallPattern,
      improvementAreas
    };
  }

  async generatePersonalizedStudyPlan(studentId: string): Promise<PersonalizedStudyPlan> {
    const student = this.db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as { id: string; name: string; className?: string } | undefined;
    if (!student) {
      throw new Error('Öğrenci bulunamadı');
    }

    const [learningStyle, academicStrengths, motivationProfile] = await Promise.all([
      this.analyzeLearningStyle(studentId),
      this.analyzeAcademicStrengths(studentId),
      this.getMotivationProfile(studentId)
    ]);

    const isAIAvailable = await this.aiProvider.isAvailable();
    
    if (isAIAvailable) {
      return await this.generateAIStudyPlan(
        student,
        learningStyle,
        academicStrengths,
        motivationProfile
      );
    } else {
      return this.generateTemplateStudyPlan(
        student,
        learningStyle,
        academicStrengths,
        motivationProfile
      );
    }
  }

  private async generateAIStudyPlan(
    student: { id: string; name: string; className?: string },
    learningStyle: LearningStyleProfile,
    academicStrengths: AcademicStrengthAnalysis,
    motivationProfile: { primaryType?: string; [key: string]: unknown }
  ): Promise<PersonalizedStudyPlan> {
    const prompt = `Bir öğrenci için KİŞİSELLEŞTİRİLMİŞ ÇALIŞMA PLANI oluştur:

ÖĞRENCİ BİLGİSİ:
- İsim: ${student.name}
- Sınıf: ${student.className}

ÖĞRENME STİLİ:
- Ana Stil: ${learningStyle.primaryLearningStyle}
- İkincil Stil: ${learningStyle.secondaryLearningStyle}
- Tercihler: ${JSON.stringify(learningStyle.learningPreferences)}
- Güçlü Yönler: ${learningStyle.strengths.join(', ')}
- Zorluklar: ${learningStyle.challenges.join(', ')}

AKADEMİK DURUM:
- Güçlü Dersler: ${academicStrengths.strongSubjects.map(s => s.subject).join(', ')}
- Zayıf Dersler: ${academicStrengths.weakSubjects.map(s => s.subject).join(', ')}
- Genel Pattern: ${academicStrengths.overallPattern}

MOTİVASYON PROFİLİ:
${JSON.stringify(motivationProfile, null, 2)}

Lütfen şu formatta bir plan oluştur (JSON):
{
  "weeklyGoals": [
    {
      "subject": "Ders adı",
      "goal": "Haftalık hedef",
      "estimatedHours": Tahmini saat,
      "priority": "HIGH/MEDIUM/LOW",
      "strategies": ["Strateji 1", "Strateji 2"]
    }
  ],
  "dailySchedule": [
    {
      "day": "Pazartesi",
      "sessions": [
        {
          "time": "15:00-16:00",
          "subject": "Matematik",
          "activity": "Konu çalışması",
          "duration": 60,
          "method": "Öğrenme stiline uygun yöntem"
        }
      ]
    }
  ],
  "motivationStrategies": [
    {
      "strategy": "Motivasyon stratejisi",
      "frequency": "Ne sıklıkla",
      "expectedOutcome": "Beklenen sonuç"
    }
  ],
  "resources": [
    {
      "subject": "Ders",
      "resourceType": "Video/Kitap/Uygulama vb.",
      "description": "Açıklama"
    }
  ],
  "progressTracking": {
    "checkpoints": ["Kontrol noktası 1"],
    "successMetrics": ["Başarı ölçütü 1"]
  }
}`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen uzman bir eğitim danışmanısın. Öğrencilere öğrenme stillerine ve akademik durumlarına göre kişiselleştirilmiş çalışma planları hazırlıyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        format: 'json'
      });

      const planData = JSON.parse(response);

      return {
        studentId: student.id,
        studentName: student.name,
        generatedAt: new Date().toISOString(),
        learningStyle: learningStyle.primaryLearningStyle,
        motivationType: motivationProfile.primaryType || 'MIXED',
        ...planData
      };
    } catch (error) {
      logger.warn('AI çalışma planı oluşturulamadı, şablon plan kullanılıyor', 'PersonalizedLearningService', error);
      return this.generateTemplateStudyPlan(student, learningStyle, academicStrengths, motivationProfile);
    }
  }

  private generateTemplateStudyPlan(
    student: { id: string; name: string; className?: string },
    learningStyle: LearningStyleProfile,
    academicStrengths: AcademicStrengthAnalysis,
    motivationProfile: { primaryType?: string; [key: string]: unknown }
  ): PersonalizedStudyPlan {
    const weakSubjects = academicStrengths.weakSubjects.slice(0, 3);
    
    const weeklyGoals = weakSubjects.map(subject => ({
      subject: subject.subject,
      goal: `${subject.subject} dersinde temel konuları güçlendir`,
      estimatedHours: 5,
      priority: 'HIGH' as const,
      strategies: this.getStrategiesForStyle(learningStyle.primaryLearningStyle, subject.subject)
    }));

    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
    const dailySchedule = days.map(day => ({
      day,
      sessions: weakSubjects.slice(0, 2).map((subject, index) => ({
        time: `${15 + index}:00-${16 + index}:00`,
        subject: subject.subject,
        activity: 'Konu tekrarı ve alıştırma',
        duration: 60,
        method: this.getMethodForStyle(learningStyle.primaryLearningStyle)
      }))
    }));

    return {
      studentId: student.id,
      studentName: student.name,
      generatedAt: new Date().toISOString(),
      learningStyle: learningStyle.primaryLearningStyle,
      motivationType: motivationProfile.primaryType || 'MIXED',
      weeklyGoals,
      dailySchedule,
      motivationStrategies: [
        {
          strategy: 'Küçük başarıları kutla',
          frequency: 'Günlük',
          expectedOutcome: 'Öz güven artışı'
        },
        {
          strategy: 'İlerleme takibi yap',
          frequency: 'Haftalık',
          expectedOutcome: 'Motivasyon devamlılığı'
        }
      ],
      resources: [
        {
          subject: 'Genel',
          resourceType: 'Uygulama',
          description: 'Khan Academy - Ücretsiz video dersler'
        }
      ],
      progressTracking: {
        checkpoints: ['Haftalık kısa sınav', 'Aylık değerlendirme'],
        successMetrics: ['Not ortalamasında artış', 'Özgüven gelişimi']
      }
    };
  }

  private determinePrimaryStyle(preferences: { visual: number; auditory: number; kinesthetic: number; reading: number }): string {
    const max = Math.max(preferences.visual, preferences.auditory, 
                        preferences.kinesthetic, preferences.reading);
    
    if (preferences.visual === max) return 'Görsel';
    if (preferences.auditory === max) return 'İşitsel';
    if (preferences.kinesthetic === max) return 'Kinestetik';
    return 'Okuma/Yazma';
  }

  private determineSecondaryStyle(preferences: { visual: number; auditory: number; kinesthetic: number; reading: number }, primaryStyle: string): string {
    const styles = ['Görsel', 'İşitsel', 'Kinestetik', 'Okuma/Yazma'];
    const values = [preferences.visual, preferences.auditory, 
                   preferences.kinesthetic, preferences.reading];
    
    const sorted = styles
      .map((style, i) => ({ style, value: values[i] }))
      .filter(s => s.style !== primaryStyle)
      .sort((a, b) => b.value - a.value);
    
    return sorted[0]?.style || 'Karma';
  }

  private identifyStrengths(learningStyle: string, academicProfile: { strongSkills?: string } | null | undefined): string[] {
    const strengths: string[] = [];
    
    const styleStrengths: Record<string, string[]> = {
      'Görsel': ['Diyagramlarla hızlı öğrenme', 'Görsel hafıza', 'Renk kodlama becerisi'],
      'İşitsel': ['Sözlü açıklamaları anlama', 'Tartışma yeteneği', 'Dinleme becerisi'],
      'Kinestetik': ['Pratik yaparak öğrenme', 'Deney ve aktivite başarısı', 'Motor beceriler'],
      'Okuma/Yazma': ['Not alma becerisi', 'Yazılı kaynaklardan öğrenme', 'Organizasyon']
    };

    strengths.push(...(styleStrengths[learningStyle] || []));

    if (academicProfile?.strongSkills) {
      try {
        const skills = JSON.parse(academicProfile.strongSkills);
        if (Array.isArray(skills)) {
          strengths.push(...skills.slice(0, 3));
        }
      } catch {
        logger.debug('Güçlü beceriler parse edilemedi', 'PersonalizedLearningService');
      }
    }

    return [...new Set(strengths)];
  }

  private identifyChallenges(learningStyle: string, academicProfile: { weakSkills?: string } | null | undefined): string[] {
    const challenges: string[] = [];
    
    const styleChallenges: Record<string, string[]> = {
      'Görsel': ['Sözlü anlatımları takip etme', 'Uzun metinleri okuma'],
      'İşitsel': ['Sessiz ortamda çalışma', 'Görsel materyallerden öğrenme'],
      'Kinestetik': ['Uzun süre oturarak çalışma', 'Teorik konular'],
      'Okuma/Yazma': ['Pratik uygulamalar', 'Hızlı karar verme']
    };

    challenges.push(...(styleChallenges[learningStyle] || []));

    if (academicProfile?.weakSkills) {
      try {
        const skills = JSON.parse(academicProfile.weakSkills);
        if (Array.isArray(skills)) {
          challenges.push(...skills.slice(0, 2));
        }
      } catch {
        logger.debug('Zayıf beceriler parse edilemedi', 'PersonalizedLearningService');
      }
    }

    return [...new Set(challenges)];
  }

  private async generateLearningRecommendations(
    studentId: string,
    learningStyle: string,
    strengths: string[],
    challenges: string[]
  ): Promise<string[]> {
    const recommendations: string[] = [];

    const styleRecommendations: Record<string, string[]> = {
      'Görsel': [
        'Renkli kalemler ve vurgulayıcılar kullan',
        'Akış şemaları ve zihin haritaları oluştur',
        'Video derslerden yararlan',
        'Görsel özetler hazırla'
      ],
      'İşitsel': [
        'Dersleri sesli kaydet ve tekrar dinle',
        'Grup çalışmalarına katıl',
        'Konuları sesli tekrar et',
        'Podcast ve sesli kitaplardan yararlan'
      ],
      'Kinestetik': [
        'Çalışırken hareket et (tempolu yürüyüş)',
        'Pratik uygulamalar ve deneyler yap',
        'Fiziksel modeller kullan',
        'Kısa molalarla çalış'
      ],
      'Okuma/Yazma': [
        'Detaylı notlar al',
        'Özet çıkar ve yeniden yaz',
        'Liste ve ana hatlar oluştur',
        'Yazılı kaynaklardan çok oku'
      ]
    };

    recommendations.push(...(styleRecommendations[learningStyle] || []));

    return recommendations.slice(0, 6);
  }

  private calculateSubjectAverages(examResults: Array<{ [key: string]: string | number }>): Record<string, number> {
    const subjects = [
      'turkishScore', 'mathScore', 'scienceScore', 'socialScore',
      'englishScore', 'religionScore', 'physicalEducationScore'
    ];

    const averages: Record<string, number> = {};

    subjects.forEach(subject => {
      const scores = examResults
        .map(exam => parseFloat(String(exam[subject])))
        .filter(score => !isNaN(score) && score > 0);
      
      if (scores.length > 0) {
        averages[subject] = scores.reduce((a, b) => a + b, 0) / scores.length;
      }
    });

    return averages;
  }

  private identifyStrongSubjects(scores: Record<string, number>, profile: unknown): Array<{ subject: string; score: number; skills: string[] }> {
    const strong: Array<{ subject: string; score: number; skills: string[] }> = [];
    
    Object.entries(scores).forEach(([key, value]) => {
      if (value >= 75) {
        strong.push({
          subject: this.getSubjectName(key),
          score: value,
          skills: ['Yüksek başarı', 'İyi performans']
        });
      }
    });

    return strong.sort((a, b) => b.score - a.score).slice(0, 3);
  }

  private identifyWeakSubjects(scores: Record<string, number>, profile: unknown): Array<{ subject: string; score: number; gaps: string[] }> {
    const weak: Array<{ subject: string; score: number; gaps: string[] }> = [];
    
    Object.entries(scores).forEach(([key, value]) => {
      if (value < 60) {
        weak.push({
          subject: this.getSubjectName(key),
          score: value,
          gaps: ['Temel kavramlar', 'Uygulama becerileri']
        });
      }
    });

    return weak.sort((a, b) => a.score - b.score).slice(0, 3);
  }

  private analyzeOverallPattern(strong: unknown[], weak: unknown[]): string {
    if (strong.length > weak.length) {
      return 'Genel olarak başarılı, bazı alanlarda desteklenmeli';
    } else if (weak.length > strong.length) {
      return 'Birden fazla alanda destek gerekiyor, kapsamlı plan şart';
    } else {
      return 'Dengeli bir profil, odaklanılacak alanlar belirgin';
    }
  }

  private identifyImprovementAreas(weak: Array<{ subject: string }>, profile: unknown): string[] {
    const areas = weak.map(w => `${w.subject} dersinde temel kavramları güçlendir`);
    areas.push('Çalışma alışkanlıklarını düzenli hale getir');
    areas.push('Motivasyonu artıracak kısa vadeli hedefler belirle');
    return areas;
  }

  private getSubjectName(key: string): string {
    const map: Record<string, string> = {
      'turkishScore': 'Türkçe',
      'mathScore': 'Matematik',
      'scienceScore': 'Fen',
      'socialScore': 'Sosyal',
      'englishScore': 'İngilizce',
      'religionScore': 'Din Kültürü',
      'physicalEducationScore': 'Beden Eğitimi'
    };
    return map[key] || key;
  }

  private async getMotivationProfile(studentId: string): Promise<{ primaryType?: string; [key: string]: unknown }> {
    const profile = this.db.prepare(`
      SELECT intrinsicMotivation, extrinsicMotivation, goalOrientation, resilienceLevel
      FROM motivation_profiles
      WHERE studentId = ?
      ORDER BY assessmentDate DESC LIMIT 1
    `).get(studentId) as { intrinsicMotivation?: number; extrinsicMotivation?: number; goalOrientation?: string; resilienceLevel?: number } | undefined;

    return profile || {
      intrinsicMotivation: 3,
      extrinsicMotivation: 3,
      goalOrientation: 'MIXED',
      resilienceLevel: 3,
      primaryType: 'MIXED'
    };
  }

  private getStrategiesForStyle(style: string, subject: string): string[] {
    const strategies: Record<string, string[]> = {
      'Görsel': [
        'Görsel özetler hazırla',
        'Diyagram ve şemalar çiz',
        'Renkli kartlar kullan'
      ],
      'İşitsel': [
        'Konuları sesli anlat',
        'Çalışma grubuna katıl',
        'Sesli tekrar yap'
      ],
      'Kinestetik': [
        'Pratik örnekler yap',
        'Hareket ederek çalış',
        'Model ve nesneler kullan'
      ],
      'Okuma/Yazma': [
        'Özet çıkar',
        'Not tutma tekniklerini kullan',
        'Yazılı alıştırmalar yap'
      ]
    };

    return strategies[style] || strategies['Görsel'];
  }

  private getMethodForStyle(style: string): string {
    const methods: Record<string, string> = {
      'Görsel': 'Video izleme ve görsel materyal inceleme',
      'İşitsel': 'Sesli ders dinleme ve tartışma',
      'Kinestetik': 'Pratik uygulama ve aktivite',
      'Okuma/Yazma': 'Okuma ve yazma çalışmaları'
    };

    return methods[style] || 'Karma yöntem';
  }
}
