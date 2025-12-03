/**
 * Parent Communication AI Service
 * Veli iletişimi için AI destekli mesaj ve rapor oluşturma servisi
 */

import { AIProviderService } from '../../../services/ai-provider.service.js';
import { StudentContextService } from '../../../services/student-context.service.js';

export interface ParentMessage {
  subject: string;
  body: string;
  tone: 'formal' | 'friendly' | 'concerned' | 'positive';
  messageType: 'progress_update' | 'concern' | 'achievement' | 'meeting_request' | 'general';
}

export interface DevelopmentReport {
  summary: string;
  academicProgress: {
    strengths: string[];
    areasForImprovement: string[];
    recommendations: string[];
  };
  socialEmotional: {
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  };
  behavioralObservations: string[];
  nextSteps: string[];
}

export class ParentCommunicationAIService {
  private aiProvider: AIProviderService;
  private contextService: StudentContextService;

  constructor() {
    this.aiProvider = AIProviderService.getInstance();
    this.contextService = new StudentContextService();
  }

  /**
   * Veli için gelişim raporu oluştur
   */
  async generateDevelopmentReport(studentId: string): Promise<DevelopmentReport> {
    const context = await this.contextService.getStudentContext(studentId);
    const contextText = this.contextService.formatContextForAI(context);

    const prompt = `
Aşağıdaki öğrenci verilerini kullanarak veliler için kapsamlı bir gelişim raporu oluştur:

${contextText}

Rapor şu bölümleri içermeli:
1. Genel Özet (1-2 paragraf)
2. Akademik İlerleme (Güçlü yönler, gelişim alanları, öneriler)
3. Sosyal-Duygusal Durum (Güçlü yönler, endişeler, öneriler)
4. Davranışsal Gözlemler
5. Sonraki Adımlar ve Veli İçin Öneriler

JSON formatında şu yapıda döndür:
{
  "summary": "...",
  "academicProgress": {
    "strengths": ["...", "..."],
    "areasForImprovement": ["...", "..."],
    "recommendations": ["...", "..."]
  },
  "socialEmotional": {
    "strengths": ["...", "..."],
    "concerns": ["...", "..."],
    "recommendations": ["...", "..."]
  },
  "behavioralObservations": ["...", "..."],
  "nextSteps": ["...", "..."]
}
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: `Sen deneyimli bir rehber öğretmensin ve velilerle profesyonel iletişim kuruyorsun. 
            Yapıcı, pozitif ve destekleyici bir dil kullan. Velilere net ve uygulanabilir öneriler sun.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.4,
        format: 'json'
      });

      return JSON.parse(response);
    } catch (error) {
      console.error('Development report generation error:', error);
      return this.getFallbackDevelopmentReport(context);
    }
  }

  /**
   * Veli mesajı oluştur
   */
  async generateParentMessage(
    studentId: string,
    messageType: ParentMessage['messageType'],
    specificContent?: string
  ): Promise<ParentMessage> {
    const context = await this.contextService.getStudentContext(studentId);
    
    const prompt = `
Öğrenci: ${context.student.name}
Sınıf: ${context.student.grade}

Mesaj Tipi: ${messageType}
${specificContent ? `Özel İçerik: ${specificContent}` : ''}

Öğrenci Bağlamı:
- Akademik Durum: ${context.academic.gpa ? `Ortalama ${context.academic.gpa}` : 'Bilgi yok'}
- Risk Seviyesi: ${context.risk.level}
- Son Gelişmeler: ${context.academic.performanceTrend || 'Bilgi yok'}

Veliye gönderilecek ${this.getMessageTypeLabel(messageType)} mesajı oluştur.

JSON formatında döndür:
{
  "subject": "Mesaj başlığı",
  "body": "Mesaj içeriği (2-3 paragraf, profesyonel ve destekleyici)",
  "tone": "formal|friendly|concerned|positive"
}
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: `Sen veli iletişiminde uzman bir rehber öğretmensin. 
            Mesajların nazik, profesyonel ve çözüm odaklı olmalı. 
            Velilerin endişelerini anladığını göster ve yapıcı öneriler sun.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        format: 'json'
      });

      const message = JSON.parse(response);
      return {
        ...message,
        messageType
      };
    } catch (error) {
      console.error('Parent message generation error:', error);
      return this.getFallbackParentMessage(context, messageType);
    }
  }

  /**
   * Toplantı daveti mesajı oluştur
   */
  async generateMeetingInvitation(
    studentId: string,
    meetingPurpose: string,
    suggestedDates: string[]
  ): Promise<ParentMessage> {
    const context = await this.contextService.getStudentContext(studentId);

    const prompt = `
Öğrenci: ${context.student.name}
Sınıf: ${context.student.grade}

Toplantı Amacı: ${meetingPurpose}
Önerilen Tarihler: ${suggestedDates.join(', ')}

Veliye nazik ve profesyonel bir toplantı davet mesajı oluştur.

JSON formatında döndür:
{
  "subject": "Toplantı daveti başlığı",
  "body": "Davet mesajı içeriği",
  "tone": "formal"
}
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen veli toplantıları organize eden profesyonel bir rehber öğretmensin.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        format: 'json'
      });

      const message = JSON.parse(response);
      return {
        ...message,
        messageType: 'meeting_request' as const
      };
    } catch (error) {
      console.error('Meeting invitation error:', error);
      return {
        subject: `Veli Toplantısı Daveti - ${context.student.name}`,
        body: `Sayın Veli,\n\n${context.student.name} ile ilgili ${meetingPurpose} konusunu görüşmek üzere bir veli toplantısı düzenlemek istiyoruz.\n\nÖnerilen tarihler: ${suggestedDates.join(', ')}\n\nSaygılarımızla,\nRehberlik Servisi`,
        tone: 'formal',
        messageType: 'meeting_request'
      };
    }
  }

  /**
   * Başarı bildirimi mesajı
   */
  async generateAchievementMessage(
    studentId: string,
    achievement: string
  ): Promise<ParentMessage> {
    const context = await this.contextService.getStudentContext(studentId);

    const prompt = `
Öğrenci: ${context.student.name}
Başarı: ${achievement}

Veliye öğrencisinin başarısını kutlayan pozitif ve motive edici bir mesaj oluştur.

JSON formatında döndür:
{
  "subject": "Başarı mesajı başlığı",
  "body": "Kutlama mesajı (pozitif ve motive edici)",
  "tone": "positive"
}
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen öğrenci başarılarını kutlayan ve motive eden bir rehber öğretmensin.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        format: 'json'
      });

      const message = JSON.parse(response);
      return {
        ...message,
        messageType: 'achievement' as const
      };
    } catch (error) {
      console.error('Achievement message error:', error);
      return {
        subject: `Harika Haber - ${context.student.name}`,
        body: `Sayın Veli,\n\n${context.student.name}'in ${achievement} başarısını sizlerle paylaşmaktan mutluluk duyuyoruz. Öğrencinizi kutlarız!\n\nSaygılarımızla,\nRehberlik Servisi`,
        tone: 'positive',
        messageType: 'achievement'
      };
    }
  }

  /**
   * Endişe bildirimi mesajı (hassas konular için)
   */
  async generateConcernMessage(
    studentId: string,
    concernArea: string,
    details: string
  ): Promise<ParentMessage> {
    const context = await this.contextService.getStudentContext(studentId);

    const prompt = `
Öğrenci: ${context.student.name}
Endişe Alanı: ${concernArea}
Detaylar: ${details}

Veliye endişeleri nazik ama net bir şekilde ileten, çözüm odaklı bir mesaj oluştur.
Suçlayıcı dil kullanma, destekleyici ve işbirlikçi ol.

JSON formatında döndür:
{
  "subject": "Mesaj başlığı (endişe kelimesini kullanma)",
  "body": "Mesaj içeriği (empati + gözlem + öneri)",
  "tone": "concerned"
}
`;

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: `Sen hassas konularda veli iletişimi yapan deneyimli bir rehber öğretmensin. 
            Empati göster, suçlama, velilerle işbirliği yap ve çözüm odaklı ol.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        format: 'json'
      });

      const message = JSON.parse(response);
      return {
        ...message,
        messageType: 'concern' as const
      };
    } catch (error) {
      console.error('Concern message error:', error);
      return {
        subject: `${context.student.name} Hakkında Görüşme Talebi`,
        body: `Sayın Veli,\n\n${context.student.name} ile ilgili ${concernArea} konusunda gözlemlerimiz var. Birlikte değerlendirip destek planı oluşturmak istiyoruz.\n\nSaygılarımızla,\nRehberlik Servisi`,
        tone: 'concerned',
        messageType: 'concern'
      };
    }
  }

  private getMessageTypeLabel(type: ParentMessage['messageType']): string {
    const labels = {
      progress_update: 'ilerleme bildirimi',
      concern: 'endişe bildirimi',
      achievement: 'başarı kutlaması',
      meeting_request: 'toplantı daveti',
      general: 'genel bilgilendirme'
    };
    return labels[type] || 'genel';
  }

  private getFallbackDevelopmentReport(context: any): DevelopmentReport {
    return {
      summary: `${context.student.name} için gelişim raporu. AI servisi şu anda kullanılamıyor.`,
      academicProgress: {
        strengths: ['Veri analizi bekleniyor'],
        areasForImprovement: ['Veri analizi bekleniyor'],
        recommendations: ['AI servisi aktif olduğunda detaylı analiz yapılacak']
      },
      socialEmotional: {
        strengths: ['Veri analizi bekleniyor'],
        concerns: ['Veri analizi bekleniyor'],
        recommendations: ['AI servisi aktif olduğunda detaylı analiz yapılacak']
      },
      behavioralObservations: ['Veri analizi bekleniyor'],
      nextSteps: ['Ollama veya OpenAI aktif hale getirin']
    };
  }

  private getFallbackParentMessage(context: any, messageType: ParentMessage['messageType']): ParentMessage {
    return {
      subject: `${context.student.name} Hakkında`,
      body: `Sayın Veli,\n\n${context.student.name} ile ilgili sizinle görüşmek istiyoruz.\n\nSaygılarımızla,\nRehberlik Servisi`,
      tone: 'formal',
      messageType
    };
  }
}
