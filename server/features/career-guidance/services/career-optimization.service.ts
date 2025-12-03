/**
 * Career Optimization Service
 * Kariyer Optimizasyon Servisi
 * 
 * AI destekli kariyer yol haritası oluşturur ve optimizasyon önerileri sunar
 */

import type { Database } from 'better-sqlite3';
import type {
  CareerProfile,
  StudentCompetencyProfile,
  CareerRoadmap,
  DevelopmentStep,
  DevelopmentResource,
  Milestone,
  CompetencyGap,
  CareerMatchResult
} from '../../../../shared/types/career-guidance.types';
import { AIProviderService } from '../../../services/ai-provider.service';
import { CareerMatchingService } from './career-matching.service';
import { COMPETENCIES } from '../../../../shared/constants/career-profiles';

export class CareerOptimizationService {
  private aiProvider: AIProviderService;
  private matchingService: CareerMatchingService;

  constructor(private db: Database) {
    this.aiProvider = AIProviderService.getInstance();
    this.matchingService = new CareerMatchingService();
  }

  /**
   * Generate Career Roadmap
   * Kariyer Yol Haritası Oluştur
   */
  async generateCareerRoadmap(
    studentId: string,
    studentName: string,
    targetCareer: CareerProfile,
    studentCompetencies: StudentCompetencyProfile[],
    customGoals?: string[]
  ): Promise<CareerRoadmap> {
    const matchResult = this.matchingService.matchCareer(targetCareer, studentCompetencies);
    const gaps = matchResult.gaps;

    const developmentSteps = await this.createDevelopmentSteps(
      studentId,
      gaps,
      matchResult.strengths,
      customGoals
    );

    const aiRecommendations = await this.generateAIRecommendations(
      studentName,
      targetCareer,
      matchResult,
      developmentSteps
    );

    const motivationalInsights = await this.generateMotivationalInsights(
      studentName,
      targetCareer,
      matchResult
    );

    const projectedMatchScore = this.calculateProjectedScore(
      matchResult.matchScore,
      gaps.length
    );

    const estimatedCompletionTime = this.calculateTotalTime(developmentSteps);

    const roadmap: CareerRoadmap = {
      id: `cr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      targetCareerId: targetCareer.id,
      targetCareerName: targetCareer.name,
      currentMatchScore: matchResult.matchScore,
      projectedMatchScore,
      estimatedCompletionTime,
      developmentSteps,
      aiRecommendations,
      motivationalInsights,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return roadmap;
  }

  /**
   * Create Development Steps
   * Gelişim Adımlarını Oluştur
   */
  private async createDevelopmentSteps(
    studentId: string,
    gaps: CompetencyGap[],
    strengths: string[],
    customGoals?: string[]
  ): Promise<DevelopmentStep[]> {
    const steps: DevelopmentStep[] = [];

    const prioritizedGaps = gaps.slice(0, 8);

    for (const gap of prioritizedGaps) {
      const step: DevelopmentStep = {
        id: `ds_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        competencyId: gap.competencyId,
        competencyName: gap.competencyName,
        currentLevel: gap.currentLevel,
        targetLevel: gap.requiredLevel,
        priority: gap.importance,
        timeline: gap.estimatedDevelopmentTime,
        strategies: await this.generateStrategies(gap),
        resources: await this.generateResources(gap),
        milestones: this.generateMilestones(gap)
      };

      steps.push(step);
    }

    steps.sort((a, b) => {
      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    return steps;
  }

  /**
   * Generate Strategies
   * Geliştirme Stratejileri Oluştur
   */
  private async generateStrategies(gap: CompetencyGap): Promise<string[]> {
    const strategies: Record<string, string[]> = {
      MATH_SKILLS: [
        'Her gün 30 dakika matematik problemi çöz',
        'Online matematik kurslarına katıl (Khan Academy, Coursera)',
        'Matematik öğretmeninden ek çalışma materyalleri iste',
        'Matematik kulüplerine veya yarışmalara katıl'
      ],
      SCIENCE_SKILLS: [
        'Laboratuvar çalışmalarına aktif katıl',
        'Bilim dergileri ve makaleler oku',
        'Bilim fuarlarına ve yarışmalara katıl',
        'Bilimsel deney videoları izle ve uygula'
      ],
      PROGRAMMING: [
        'Online programlama kurslarına başla (freeCodeCamp, Codecademy)',
        'Her hafta küçük bir proje geliştir',
        'GitHub\'da açık kaynak projelere katkıda bulun',
        'Programlama topluluklarına katıl'
      ],
      EMPATHY: [
        'Aktif dinleme pratiği yap',
        'Farklı bakış açılarını anlamaya çalış',
        'Gönüllü çalışmalara katıl',
        'Duygusal zeka kitapları oku'
      ],
      LEADERSHIP: [
        'Okul kulüplerinde liderlik rolü üstlen',
        'Grup projelerinde koordinatör ol',
        'Liderlik kitapları ve case study\'ler oku',
        'Mentorluk programlarına katıl'
      ],
      VERBAL_COMMUNICATION: [
        'Sunum becerileri kursuna katıl',
        'Tartışma kulüplerine katıl',
        'Kamu konuşması pratiği yap',
        'Podcast ve TED konuşmaları dinle'
      ],
      CREATIVITY: [
        'Yaratıcı yazma veya sanat derslerine katıl',
        'Beyin fırtınası egzersizleri yap',
        'Farklı sanat formlarını keşfet',
        'Yaratıcılık üzerine atölyeler ve workshoplar\'a katıl'
      ]
    };

    return strategies[gap.competencyId] || [
      `${gap.competencyName} üzerine düzenli pratik yap`,
      'İlgili kurslar ve eğitimlere katıl',
      'Alanda deneyimli mentorlardan destek al',
      'Gerçek projeler üzerinde çalış'
    ];
  }

  /**
   * Generate Resources
   * Kaynaklar Oluştur
   */
  private async generateResources(gap: CompetencyGap): Promise<DevelopmentResource[]> {
    const resourceTemplates: Record<string, DevelopmentResource[]> = {
      MATH_SKILLS: [
        { type: 'COURSE', title: 'Khan Academy Matematik', description: 'Kapsamlı online matematik kursu', url: 'https://tr.khanacademy.org/math', duration: 'Esnek' },
        { type: 'BOOK', title: 'Matematik Olimpiyatlarına Hazırlık', description: 'Problem çözme teknikleri' },
        { type: 'PRACTICE', title: 'Günlük Problem Çözme', description: '30 dakikalık günlük pratik' }
      ],
      PROGRAMMING: [
        { type: 'COURSE', title: 'CS50: Introduction to Computer Science', description: 'Harvard\'ın ücretsiz programlama kursu', url: 'https://cs50.harvard.edu/' },
        { type: 'COURSE', title: 'freeCodeCamp', description: 'İnteraktif programlama öğrenimi', url: 'https://www.freecodecamp.org/' },
        { type: 'PRACTICE', title: 'Günlük Kod Pratiği', description: 'HackerRank veya LeetCode\'da günlük problem çözme' }
      ],
      EMPATHY: [
        { type: 'BOOK', title: 'Duygusal Zeka', description: 'Daniel Goleman' },
        { type: 'ACTIVITY', title: 'Gönüllü Çalışma', description: 'Sosyal sorumluluk projelerine katılım' },
        { type: 'WORKSHOP', title: 'Aktif Dinleme Atölyesi', description: 'İletişim becerileri geliştirme' }
      ],
      LEADERSHIP: [
        { type: 'BOOK', title: 'Liderlik İlkeleri', description: 'Stephen Covey - 7 Alışkanlık' },
        { type: 'MENTORSHIP', title: 'Liderlik Mentorlüğü', description: 'Deneyimli bir liderden rehberlik al' },
        { type: 'ACTIVITY', title: 'Kulüp Liderliği', description: 'Okul kulübünde aktif rol al' }
      ]
    };

    const defaultResources: DevelopmentResource[] = [
      { type: 'COURSE', title: `${gap.competencyName} Geliştirme Kursu`, description: 'Temel ve ileri seviye eğitim' },
      { type: 'PRACTICE', title: 'Düzenli Pratik', description: 'Haftalık uygulama egzersizleri' },
      { type: 'MENTORSHIP', title: 'Mentorluk', description: 'Alanda uzman birinden destek' }
    ];

    return resourceTemplates[gap.competencyId] || defaultResources;
  }

  /**
   * Generate Milestones
   * Ara Hedefler Oluştur
   */
  private generateMilestones(gap: CompetencyGap): Milestone[] {
    const milestones: Milestone[] = [];
    const currentLevel = gap.currentLevel;
    const targetLevel = gap.requiredLevel;

    const levelDifference = targetLevel - currentLevel;

    if (levelDifference <= 2) {
      milestones.push({
        description: `${gap.competencyName} seviyesini ${targetLevel}'e yükselt`,
        targetDate: this.addMonths(new Date(), 2).toISOString().split('T')[0],
        successCriteria: [
          'Temel kavramları uygulayabilme',
          'Bağımsız çalışma yürütebilme',
          'Başarılı proje/ödev tamamlama'
        ]
      });
    } else {
      const midLevel = Math.ceil((currentLevel + targetLevel) / 2);
      
      milestones.push({
        description: `${gap.competencyName} seviyesini ${midLevel}'e yükselt`,
        targetDate: this.addMonths(new Date(), 3).toISOString().split('T')[0],
        successCriteria: [
          'Temel becerileri kazanma',
          'Rehberlik altında uygulama yapabilme'
        ]
      });

      milestones.push({
        description: `${gap.competencyName} seviyesini ${targetLevel}'e yükselt`,
        targetDate: this.addMonths(new Date(), 6).toISOString().split('T')[0],
        successCriteria: [
          'İleri seviye becerileri kazanma',
          'Bağımsız ve etkili çalışma yapabilme',
          'Başkalarına öğretebilme seviyesine ulaşma'
        ]
      });
    }

    return milestones;
  }

  /**
   * Generate AI Recommendations
   * AI Önerileri Oluştur
   */
  private async generateAIRecommendations(
    studentName: string,
    targetCareer: CareerProfile,
    matchResult: CareerMatchResult,
    developmentSteps: DevelopmentStep[]
  ): Promise<string[]> {
    const prompt = `
Sen bir kariyer danışmanısın. Öğrenci için kişiselleştirilmiş kariyer önerileri oluştur.

Öğrenci: ${studentName}
Hedef Meslek: ${targetCareer.name}
Mevcut Uyum Skoru: ${matchResult.matchScore.toFixed(1)}/100

Güçlü Yönler: ${matchResult.strengths.join(', ') || 'Belirleniyor'}
Gelişim Gereken Alanlar: ${matchResult.gaps.slice(0, 5).map(g => g.competencyName).join(', ')}

${developmentSteps.length} gelişim adımı planlandı.

Lütfen öğrenciye:
1. Kısa vadeli (3-6 ay) öneriler
2. Orta vadeli (6-12 ay) öneriler
3. Uzun vadeli (1-2 yıl) stratejiler
4. Ekstra fırsatlar ve kaynaklar

Her öneride spesifik, uygulanabilir ve motive edici ol. JSON array formatında 6-8 öneri döndür.
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          { role: 'system', content: 'Sen deneyimli bir kariyer danışmanısın. Öğrencilere pratik ve motive edici öneriler sunuyorsun.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      });

      const recommendations = this.parseAIResponse(response);
      return recommendations.length > 0 ? recommendations : this.getDefaultRecommendations(targetCareer);
    } catch (error) {
      console.error('AI recommendations error:', error);
      return this.getDefaultRecommendations(targetCareer);
    }
  }

  /**
   * Generate Motivational Insights
   * Motivasyonel İçgörüler Oluştur
   */
  private async generateMotivationalInsights(
    studentName: string,
    targetCareer: CareerProfile,
    matchResult: CareerMatchResult
  ): Promise<string[]> {
    const prompt = `
${studentName} isimli öğrenci ${targetCareer.name} mesleğini hedefliyor.

Mevcut uyum skoru: ${matchResult.matchScore.toFixed(1)}/100
Güçlü yönleri: ${matchResult.strengths.join(', ') || 'Gelişim sürecinde'}

Bu öğrenci için:
1. Motive edici ve cesaretlendirici mesajlar
2. Güçlü yönlerini vurgulayan özel notlar
3. Hedefine ulaşabileceğine dair pozitif perspektifler
4. İlham verici anekdotlar veya örnekler

JSON array formatında 4-6 motivasyonel içgörü döndür. Kısa, öz ve güçlü olsun.
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          { role: 'system', content: 'Sen empatik ve destekleyici bir kariyer danışmanısın. Öğrencileri motive ediyorsun.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8
      });

      const insights = this.parseAIResponse(response);
      return insights.length > 0 ? insights : this.getDefaultMotivationalInsights(matchResult);
    } catch (error) {
      console.error('AI motivational insights error:', error);
      return this.getDefaultMotivationalInsights(matchResult);
    }
  }

  /**
   * Calculate Projected Score
   * Tahmini Skor Hesapla
   */
  private calculateProjectedScore(currentScore: number, gapCount: number): number {
    if (gapCount === 0) return Math.min(currentScore + 10, 100);
    
    const improvement = Math.min(30, gapCount * 5);
    const projected = currentScore + improvement;
    
    return Math.min(Math.round(projected), 95);
  }

  /**
   * Calculate Total Time
   * Toplam Süre Hesapla
   */
  private calculateTotalTime(steps: DevelopmentStep[]): string {
    const criticalSteps = steps.filter(s => s.priority === 'CRITICAL').length;
    const highSteps = steps.filter(s => s.priority === 'HIGH').length;
    
    const totalMonths = (criticalSteps * 3) + (highSteps * 2) + (steps.length - criticalSteps - highSteps);
    
    if (totalMonths <= 6) return '3-6 ay';
    if (totalMonths <= 12) return '6-12 ay';
    if (totalMonths <= 18) return '12-18 ay';
    return '18-24 ay';
  }

  /**
   * Parse AI Response
   * AI Yanıtını Parse Et
   */
  private parseAIResponse(response: string): string[] {
    try {
      // Try JSON parsing first
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed.filter(item => typeof item === 'string' && item.trim().length > 0);
        }
      }
    } catch (jsonError) {
      console.warn('JSON parsing failed, falling back to text parsing:', jsonError);
    }
    
    // Fallback to text parsing
    try {
      const lines = response.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 10 && (line.match(/^[\d\-\*\•]/) || line.length > 20));
      
      return lines
        .map(line => line.replace(/^[\d\-\*\•\.\)]+\s*/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 8);
    } catch (error) {
      console.error('AI response parsing completely failed:', error);
      return [];
    }
  }

  /**
   * Get Default Recommendations
   * Varsayılan Öneriler
   */
  private getDefaultRecommendations(career: CareerProfile): string[] {
    return [
      `${career.name} mesleği için gerekli becerileri düzenli olarak geliştir`,
      'İlgili alanlarda staj veya gönüllü çalışma fırsatlarını araştır',
      'Sektördeki profesyonellerle networking yap ve mentorluk fırsatları ara',
      'Online kurslar ve sertifika programlarıyla kendini geliştir',
      'Kişisel projeler geliştirerek portföy oluştur',
      'İlgili kitaplar, makaleler ve sektör yayınlarını takip et'
    ];
  }

  /**
   * Get Default Motivational Insights
   * Varsayılan Motivasyonel İçgörüler
   */
  private getDefaultMotivationalInsights(matchResult: CareerMatchResult): string[] {
    const insights = [
      'Her büyük başarı, küçük adımlarla başlar. Sen doğru yoldasın!',
      'Güçlü yönlerin seni bu hedefe götürecek temel yapı taşları.'
    ];

    if (matchResult.matchScore >= 70) {
      insights.push('Mevcut yeteneklerin hedef mesleğinle güçlü bir uyum gösteriyor!');
    } else {
      insights.push('Gelişim sürecin tam da şimdi başlıyor ve bu heyecan verici!');
    }

    if (matchResult.strengths.length > 0) {
      insights.push(`${matchResult.strengths[0]} alanındaki yeteneğin seni öne çıkaracak.`);
    }

    insights.push('Tutku ve kararlılık, yetenekten daha güçlüdür.');
    
    return insights;
  }

  /**
   * Add Months to Date
   * Tarihe Ay Ekle
   */
  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }
}
