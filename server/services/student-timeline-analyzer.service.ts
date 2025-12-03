/**
 * Student Timeline Analyzer Service
 * Öğrenci Zaman Çizelgesi Analiz Servisi
 * 
 * Kronolojik timeline görünümü, pattern tespiti ve sebep-sonuç analizi
 */

import getDatabase from '../lib/database.js';
import { AIProviderService } from './ai-provider.service.js';

export interface TimelineEvent {
  id: string;
  date: string;
  time?: string;
  eventType: 'AKADEMİK' | 'DAVRANIŞSAL' | 'SOSYAL' | 'SAĞLIK' | 'AİLE' | 'MÜDAHALE' | 'BAŞARI';
  category: string;
  title: string;
  description: string;
  severity?: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
  impact: 'POZİTİF' | 'NÖTR' | 'NEGATİF';
  relatedEvents?: string[];
  metadata?: any;
}

export interface PatternCluster {
  clusterId: string;
  patternName: string;
  events: TimelineEvent[];
  startDate: string;
  endDate: string;
  frequency: string;
  triggers: string[];
  outcomes: string[];
  interventionPoints: string[];
}

export interface CausalRelationship {
  causeEvent: TimelineEvent;
  effectEvent: TimelineEvent;
  relationshipType: 'DİREKT' | 'DOLAYLI' | 'OLASI' | 'KORELASYON';
  confidence: number;
  explanation: string;
  timeGap: string;
  mediatingFactors?: string[];
}

export interface TurningPoint {
  date: string;
  event: TimelineEvent;
  significance: 'KRİTİK' | 'ÖNEMLI' | 'DÖNÜM_NOKTASI';
  beforeState: string;
  afterState: string;
  catalysts: string[];
  longTermEffects: string[];
}

export interface StudentTimeline {
  studentId: string;
  studentName: string;
  generatedAt: string;
  timelineStart: string;
  timelineEnd: string;
  
  chronologicalEvents: TimelineEvent[];
  
  patternClusters: PatternCluster[];
  
  causalRelationships: CausalRelationship[];
  
  turningPoints: TurningPoint[];
  
  trendAnalysis: {
    academicTrend: 'YÜKSELIŞ' | 'DÜŞÜŞ' | 'STABIL' | 'DALGALI';
    behavioralTrend: 'İYİLEŞME' | 'KÖTÜLEŞME' | 'STABIL' | 'DALGALI';
    socialTrend: 'GELIŞEN' | 'ZAYIFLAYAN' | 'STABIL';
    overallTrajectory: string;
    keyInfluencers: string[];
  };
  
  criticalPeriods: Array<{
    period: string;
    description: string;
    events: TimelineEvent[];
    interventionsNeeded: string[];
  }>;
  
  successMoments: Array<{
    date: string;
    achievement: string;
    contributingFactors: string[];
    lessonsLearned: string[];
    replicationStrategy: string;
  }>;
  
  insights: {
    keyPatterns: string[];
    rootCauses: string[];
    protectiveFactors: string[];
    vulnerabilities: string[];
    recommendedInterventions: string[];
  };
}

class StudentTimelineAnalyzerService {
  private db: ReturnType<typeof getDatabase>;
  private aiProvider: AIProviderService;

  constructor() {
    this.db = getDatabase();
    this.aiProvider = AIProviderService.getInstance();
  }

  async generateStudentTimeline(studentId: string, startDate?: string, endDate?: string): Promise<StudentTimeline> {
    const student = this.db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as any;
    if (!student) {
      throw new Error('Öğrenci bulunamadı');
    }

    const events = await this.collectAllEvents(studentId, startDate, endDate);
    const sortedEvents = events.sort((a, b) => a.date.localeCompare(b.date));

    const isAvailable = await this.aiProvider.isAvailable();
    if (!isAvailable) {
      return this.generateFallbackTimeline(studentId, student.name, sortedEvents);
    }

    const prompt = this.buildTimelineAnalysisPrompt(student, sortedEvents);

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen öğrenci gelişimi ve davranış analizi konusunda uzman bir eğitim danışmanısın. Zaman içindeki olayları analiz ederek pattern\'ler, sebep-sonuç ilişkileri ve dönüm noktalarını tespit ediyorsun.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2
      });

      return this.parseTimelineResponse(studentId, student.name, sortedEvents, response);
    } catch (error) {
      console.error('Timeline analysis error:', error);
      return this.generateFallbackTimeline(studentId, student.name, sortedEvents);
    }
  }

  private async collectAllEvents(studentId: string, startDate?: string, endDate?: string): Promise<TimelineEvent[]> {
    const events: TimelineEvent[] = [];

    const dateFilter = startDate && endDate 
      ? `AND date >= '${startDate}' AND date <= '${endDate}'`
      : '';

    let academicEvents: unknown[] = [];
    try {
      academicEvents = this.db.prepare(`
        SELECT examDate as eventDate, totalScore as grade, examName as subject, examType
        FROM exam_results
        WHERE studentId = ? ${dateFilter.replace(/date/g, 'examDate')}
        ORDER BY examDate DESC
      `).all(studentId) as any[];
    } catch (error) {
      // Table may not exist yet
      academicEvents = [];
    }

    academicEvents.forEach(e => {
      events.push({
        id: `exam-${e.eventDate}-${e.subject}`,
        date: e.eventDate,
        eventType: 'AKADEMİK',
        category: 'Sınav',
        title: `${e.subject} - ${e.examType || 'Sınav'}`,
        description: `Not: ${e.grade}`,
        impact: parseFloat(e.grade) >= 70 ? 'POZİTİF' : parseFloat(e.grade) >= 50 ? 'NÖTR' : 'NEGATİF',
        severity: parseFloat(e.grade) < 40 ? 'YÜKSEK' : parseFloat(e.grade) < 50 ? 'ORTA' : 'DÜŞÜK',
        metadata: { grade: e.grade, subject: e.subject }
      });
    });

    let behaviorEvents: unknown[] = [];
    try {
      behaviorEvents = this.db.prepare(`
        SELECT incidentDate, behaviorType, behaviorCategory, description, antecedent, consequence
        FROM standardized_behavior_incidents
        WHERE studentId = ? ${dateFilter.replace(/date/g, 'incidentDate')}
        ORDER BY incidentDate DESC
      `).all(studentId) as any[];
    } catch (error) {
      // Table may not exist yet
      behaviorEvents = [];
    }

    behaviorEvents.forEach(e => {
      events.push({
        id: `behavior-${e.incidentDate}-${e.behaviorType}`,
        date: e.incidentDate,
        eventType: 'DAVRANIŞSAL',
        category: e.behaviorType,
        title: `Davranış Olayı: ${e.behaviorType}`,
        description: e.description,
        impact: 'NEGATİF',
        severity: e.intensity === 'YÜKSEK' ? 'KRİTİK' : e.intensity === 'ORTA' ? 'YÜKSEK' : 'ORTA',
        metadata: { antecedent: e.antecedent, consequence: e.consequence }
      });
    });

    const attendanceEvents = this.db.prepare(`
      SELECT date, status, notes
      FROM attendance
      WHERE studentId = ? AND status != 'Mevcut' ${dateFilter}
      ORDER BY date DESC
    `).all(studentId) as any[];

    attendanceEvents.forEach(e => {
      events.push({
        id: `attendance-${e.date}`,
        date: e.date,
        eventType: 'DAVRANIŞSAL',
        category: 'Devamsızlık',
        title: `Devamsızlık: ${e.status}`,
        description: e.notes || e.status,
        impact: 'NEGATİF',
        severity: e.status === 'Devamsız' ? 'ORTA' : 'DÜŞÜK',
        metadata: { status: e.status }
      });
    });

    let counselingEvents: unknown[] = [];
    try {
      counselingEvents = this.db.prepare(`
        SELECT sessionDate as date, sessionType, topic, sessionMode as mode, detailedNotes as notes, '' as outcome
        FROM counseling_sessions cs
        JOIN counseling_session_students css ON cs.id = css.sessionId
        WHERE css.studentId = ? ${dateFilter.replace(/date/g, 'sessionDate')}
        ORDER BY sessionDate DESC
      `).all(studentId) as any[];
    } catch (error) {
      // Table may not exist yet
      counselingEvents = [];
    }

    counselingEvents.forEach(e => {
      events.push({
        id: `counseling-${e.date}`,
        date: e.date,
        eventType: 'MÜDAHALE',
        category: e.sessionType || 'Görüşme',
        title: `${e.sessionType}: ${e.topic}`,
        description: e.notes || e.outcome || 'Rehberlik görüşmesi',
        impact: 'POZİTİF',
        metadata: { mode: e.mode, outcome: e.outcome }
      });
    });

    const interventions = this.db.prepare(`
      SELECT date, title, status
      FROM interventions
      WHERE studentId = ? ${dateFilter}
      ORDER BY date DESC
    `).all(studentId) as any[];

    interventions.forEach(e => {
      events.push({
        id: `intervention-${e.date}-${e.title}`,
        date: e.date,
        eventType: 'MÜDAHALE',
        category: 'Müdahale Planı',
        title: e.title,
        description: `Durum: ${e.status}`,
        impact: 'POZİTİF',
        metadata: { status: e.status }
      });
    });

    return events;
  }

  private buildTimelineAnalysisPrompt(student: any, events: TimelineEvent[]): string {
    return `${student.name} öğrencisi için DERİNLEMESİNE ZAMAN ÇİZELGESİ ANALİZİ yap:

👤 ÖĞRENCİ: ${student.name}
📅 TARİH ARALIĞI: ${events[0]?.date || 'Bilinmiyor'} - ${events[events.length - 1]?.date || 'Bugün'}

📊 KRONOLOJİK OLAYLAR (${events.length} olay):
${JSON.stringify(events, null, 2)}

🎯 ANALİZ GEREKSİNİMLERİ:

1. PATTERN KÜMELERİ:
   - Tekrar eden olay gruplarını tespit et
   - Her küme için: başlangıç-bitiş, frekans, tetikleyiciler, sonuçlar
   - Müdahale fırsatlarını belirle

2. SEBEP-SONUÇ İLİŞKİLERİ:
   - Olaylar arası nedensel bağlantılar
   - İlişki tipi (direkt/dolaylı/olası/korelasyon)
   - Güven seviyesi (0-100)
   - Zaman aralığı
   - Aracı faktörler

3. DÖNÜM NOKTALARI:
   - Kritik değişim anları
   - Öncesi ve sonrası durum
   - Katalizörler
   - Uzun vadeli etkiler

4. TREND ANALİZİ:
   - Akademik trend (yükseliş/düşüş/stabil/dalgalı)
   - Davranışsal trend (iyileşme/kötüleşme/stabil/dalgalı)
   - Sosyal trend (gelişen/zayıflayan/stabil)
   - Genel yörünge
   - Ana etki faktörleri

5. KRİTİK DÖNEMLER:
   - Yoğun olay dönemleri
   - Açıklama
   - İlgili olaylar
   - Gerekli müdahaleler

6. BAŞARI ANLARI:
   - Önemli başarılar
   - Katkıda bulunan faktörler
   - Öğrenilen dersler
   - Tekrar stratejisi

7. İÇGÖRÜLER:
   - Ana pattern'ler
   - Kök nedenler
   - Koruyucu faktörler
   - Kırılganlıklar
   - Önerilen müdahaleler

⚠️ ÖNEMLİ:
- Kanıta dayalı analizler yap
- Spesifik tarih ve olaylara referans ver
- Net sebep-sonuç ilişkileri kur
- Erken müdahale fırsatlarını vurgula
- Başarı faktörlerini belirle

Yanıtını JSON formatında ver (TypeScript StudentTimeline tipine uygun).`;
  }

  private parseTimelineResponse(studentId: string, studentName: string, events: TimelineEvent[], response: string): StudentTimeline {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        const validatedTimeline = {
          studentId,
          studentName,
          generatedAt: new Date().toISOString(),
          timelineStart: events[0]?.date || new Date().toISOString().split('T')[0],
          timelineEnd: events[events.length - 1]?.date || new Date().toISOString().split('T')[0],
          chronologicalEvents: events,
          patternClusters: Array.isArray(parsed.patternClusters) ? parsed.patternClusters : [],
          causalRelationships: Array.isArray(parsed.causalRelationships) ? parsed.causalRelationships : [],
          turningPoints: Array.isArray(parsed.turningPoints) ? parsed.turningPoints : [],
          trendAnalysis: parsed.trendAnalysis || this.generateFallbackTimeline(studentId, studentName, events).trendAnalysis,
          criticalPeriods: Array.isArray(parsed.criticalPeriods) ? parsed.criticalPeriods : [],
          successMoments: Array.isArray(parsed.successMoments) ? parsed.successMoments : [],
          insights: parsed.insights || this.generateFallbackTimeline(studentId, studentName, events).insights
        };
        
        return validatedTimeline;
      }
    } catch (error) {
      console.error('Timeline parse error:', error);
      console.log('Falling back to rule-based timeline generation...');
    }

    return this.generateFallbackTimeline(studentId, studentName, events);
  }

  private generateFallbackTimeline(studentId: string, studentName: string, events: TimelineEvent[]): StudentTimeline {
    const academicEvents = events.filter(e => e.eventType === 'AKADEMİK');
    const behaviorEvents = events.filter(e => e.eventType === 'DAVRANIŞSAL');
    const positiveEvents = events.filter(e => e.impact === 'POZİTİF');

    return {
      studentId,
      studentName,
      generatedAt: new Date().toISOString(),
      timelineStart: events[0]?.date || new Date().toISOString().split('T')[0],
      timelineEnd: events[events.length - 1]?.date || new Date().toISOString().split('T')[0],
      chronologicalEvents: events,
      patternClusters: [
        {
          clusterId: 'cluster-1',
          patternName: 'Akademik Olaylar',
          events: academicEvents,
          startDate: academicEvents[0]?.date || '',
          endDate: academicEvents[academicEvents.length - 1]?.date || '',
          frequency: 'Dönemsel',
          triggers: ['Sınav dönemleri'],
          outcomes: ['Performans değişimleri'],
          interventionPoints: ['Sınav öncesi destek']
        }
      ],
      causalRelationships: [],
      turningPoints: [],
      trendAnalysis: {
        academicTrend: this.calculateAcademicTrend(academicEvents),
        behavioralTrend: behaviorEvents.length > 5 ? 'KÖTÜLEŞME' : behaviorEvents.length > 2 ? 'DALGALI' : 'STABIL',
        socialTrend: 'STABIL',
        overallTrajectory: 'Detaylı analiz için AI servisi gerekli',
        keyInfluencers: ['Akademik performans', 'Davranış olayları']
      },
      criticalPeriods: behaviorEvents.length > 3 ? [
        {
          period: 'Son dönem',
          description: 'Yoğun davranış olayları',
          events: behaviorEvents.slice(0, 5),
          interventionsNeeded: ['Davranış destek planı', 'Aile görüşmesi']
        }
      ] : [],
      successMoments: positiveEvents.slice(0, 3).map(e => ({
        date: e.date,
        achievement: e.title,
        contributingFactors: ['Değerlendirme gerekli'],
        lessonsLearned: ['Başarı faktörlerini belirle'],
        replicationStrategy: 'Destekleyici ortam sağla'
      })),
      insights: {
        keyPatterns: ['AI analizi için yeterli veri mevcut'],
        rootCauses: ['Detaylı analiz gerekli'],
        protectiveFactors: positiveEvents.length > 0 ? ['Müdahale yanıtı pozitif'] : [],
        vulnerabilities: behaviorEvents.length > 3 ? ['Tekrarlayan davranış sorunları'] : [],
        recommendedInterventions: [
          'Kapsamlı değerlendirme yap',
          'Pattern analizi için AI kullan',
          'Bireysel destek planı oluştur'
        ]
      }
    };
  }

  private calculateAcademicTrend(academicEvents: TimelineEvent[]): 'YÜKSELIŞ' | 'DÜŞÜŞ' | 'STABIL' | 'DALGALI' {
    if (academicEvents.length < 3) return 'STABIL';

    const recent = academicEvents.slice(0, 3);
    const earlier = academicEvents.slice(-3);

    const recentAvg = recent.reduce((sum, e) => {
      const grade = parseFloat(e.metadata?.grade || '0');
      return sum + grade;
    }, 0) / recent.length;

    const earlierAvg = earlier.reduce((sum, e) => {
      const grade = parseFloat(e.metadata?.grade || '0');
      return sum + grade;
    }, 0) / earlier.length;

    const diff = recentAvg - earlierAvg;

    if (diff > 10) return 'YÜKSELIŞ';
    if (diff < -10) return 'DÜŞÜŞ';
    
    const variance = recent.reduce((sum, e) => {
      const grade = parseFloat(e.metadata?.grade || '0');
      return sum + Math.abs(grade - recentAvg);
    }, 0) / recent.length;

    return variance > 15 ? 'DALGALI' : 'STABIL';
  }
}

export default StudentTimelineAnalyzerService;
