/**
 * Hourly Action Planner Service
 * Saatlik Eylem Planlayıcı Servisi
 * 
 * Rehber öğretmen için saatlik/günlük aksiyon planları ve öncelikli görev yönetimi
 */

import { AIProviderService } from './ai-provider.service.js';
import getDatabase from '../lib/database.js';
import { dailyActionPlanRepository } from '../repositories/daily-action-plan.repository.js';

export interface HourlyAction {
  time: string;
  timeSlot: string;
  actionType: 'GÖRÜŞME' | 'İZLEME' | 'MÜDAHALE' | 'DÖKÜMENTASYON' | 'AİLE_İLETİŞİMİ' | 'TOPLANTI' | 'ACİL';
  priority: 'ACİL' | 'YÜKSEK' | 'ORTA' | 'DÜŞÜK';
  studentId?: string;
  studentName?: string;
  action: string;
  duration: number;
  expectedOutcome: string;
  preparationNeeded: string[];
  resources: string[];
  followUp?: string;
}

export interface DailyPriorities {
  criticalActions: HourlyAction[];
  highPriorityActions: HourlyAction[];
  routineActions: HourlyAction[];
  opportunisticActions: HourlyAction[];
}

export interface ActionTracking {
  actionId: string;
  status: 'PLANLI' | 'DEVAM_EDİYOR' | 'TAMAMLANDI' | 'ERTELENDİ' | 'İPTAL';
  completedAt?: string;
  notes?: string;
  outcome?: string;
  nextSteps?: string[];
}

export interface CounselorDailyPlan {
  date: string;
  counselorName: string;
  generatedAt: string;
  
  dailySummary: {
    totalActions: number;
    criticalCount: number;
    highPriorityCount: number;
    estimatedWorkload: string;
    keyFocusAreas: string[];
  };
  
  morningBriefing: {
    urgentMatters: string[];
    keyStudentsToMonitor: Array<{
      studentId: string;
      name: string;
      reason: string;
      suggestedTime: string;
    }>;
    preparationTasks: string[];
  };
  
  hourlySchedule: HourlyAction[];
  
  priorities: DailyPriorities;
  
  flexibilityRecommendations: {
    bufferTimes: string[];
    contingencyPlans: Array<{
      scenario: string;
      action: string;
    }>;
    adjustmentStrategies: string[];
  };
  
  endOfDayChecklist: string[];
  
  tomorrowPrep: string[];
}

export interface WeeklyActionPlan {
  weekStartDate: string;
  weekEndDate: string;
  
  weeklyGoals: string[];
  
  dailyPlans: Map<string, CounselorDailyPlan>;
  
  recurringActions: Array<{
    day: string;
    time: string;
    action: string;
    priority: string;
  }>;
  
  weeklyPriorities: {
    criticalStudents: Array<{
      studentId: string;
      name: string;
      interventions: string[];
      checkpoints: string[];
    }>;
    groupSessions: Array<{
      topic: string;
      targetGroup: string;
      scheduledTime: string;
    }>;
    administrativeTasks: string[];
  };
}

class HourlyActionPlannerService {
  private aiProvider: AIProviderService;
  private db: ReturnType<typeof getDatabase>;

  constructor() {
    this.aiProvider = AIProviderService.getInstance();
    this.db = getDatabase();
  }

  async generateDailyPlan(
    date: string, 
    counselorName: string = 'Rehber Öğretmen', 
    forceRegenerate: boolean = false
  ): Promise<CounselorDailyPlan> {
    if (!forceRegenerate) {
      const cachedPlan = dailyActionPlanRepository.getPlanByDate(date);
      if (cachedPlan) {
        console.log(`📋 Using cached daily plan for ${date}`);
        return cachedPlan;
      }
    }

    console.log(`🔄 Generating new daily plan for ${date}...`);
    
    const studentsNeedingAttention = await this.identifyPriorityStudents(date);
    const existingAppointments = await this.getScheduledAppointments(date);
    const pendingTasks = await this.getPendingTasks(date);

    const isAvailable = await this.aiProvider.isAvailable();
    if (!isAvailable) {
      const fallbackPlan = this.generateFallbackDailyPlan(date, counselorName, studentsNeedingAttention);
      dailyActionPlanRepository.savePlan(fallbackPlan, false);
      return fallbackPlan;
    }

    const prompt = this.buildDailyPlanPrompt(date, studentsNeedingAttention, existingAppointments, pendingTasks);

    try {
      const response = await this.aiProvider.chat({
        messages: [
          {
            role: 'system',
            content: 'Sen deneyimli bir okul rehber öğretmenisin. Günlük iş akışını optimize etme, önceliklendirme ve zaman yönetimi konusunda uzmansın. Her saati etkili kullanarak öğrencilere maksimum destek sağlamayı bilirsin.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3
      });

      const newPlan = this.parseDailyPlanResponse(date, counselorName, response, studentsNeedingAttention);
      dailyActionPlanRepository.savePlan(newPlan, false);
      console.log(`✅ Daily plan saved for ${date}`);
      return newPlan;
    } catch (error) {
      console.error('Daily plan generation error:', error);
      const fallbackPlan = this.generateFallbackDailyPlan(date, counselorName, studentsNeedingAttention);
      dailyActionPlanRepository.savePlan(fallbackPlan, false);
      return fallbackPlan;
    }
  }

  async generateAutoScheduledPlan(date: string, counselorName: string = 'Rehber Öğretmen'): Promise<CounselorDailyPlan> {
    if (dailyActionPlanRepository.hasAutoGeneratedPlanForDate(date)) {
      console.log(`⏭️ Auto-generated plan already exists for ${date}`);
      return dailyActionPlanRepository.getPlanByDate(date)!;
    }

    console.log(`🤖 Auto-generating daily plan for ${date}...`);
    const plan = await this.generateDailyPlan(date, counselorName, true);
    
    dailyActionPlanRepository.savePlan(plan, true);
    console.log(`✅ Auto-generated plan saved for ${date}`);
    
    return plan;
  }

  private async identifyPriorityStudents(date: string): Promise<any[]> {
    const students: unknown[] = [];

    const highRiskStudents = this.db.prepare(`
      SELECT DISTINCT s.id, s.name, ewa.alertLevel, ewa.title
      FROM students s
      JOIN early_warning_alerts ewa ON s.id = ewa.studentId
      WHERE ewa.status = 'AÇIK' AND ewa.alertLevel IN ('KRİTİK', 'YÜKSEK')
      ORDER BY 
        CASE ewa.alertLevel 
          WHEN 'KRİTİK' THEN 1 
          WHEN 'YÜKSEK' THEN 2 
        END
      LIMIT 10
    `).all();

    students.push(...highRiskStudents.map((s: any) => ({
      ...s,
      reason: `${s.alertLevel} seviye uyarı: ${s.title}`,
      priority: s.alertLevel === 'KRİTİK' ? 'ACİL' : 'YÜKSEK'
    })));

    const recentAbsences = this.db.prepare(`
      SELECT s.id, s.name, COUNT(a.id) as absenceCount
      FROM students s
      JOIN attendance a ON s.id = a.studentId
      WHERE a.status = 'Devamsız' 
        AND a.date >= date('now', '-7 days')
      GROUP BY s.id, s.name
      HAVING absenceCount >= 3
      ORDER BY absenceCount DESC
      LIMIT 5
    `).all();

    students.push(...(recentAbsences as any[]).map(s => ({
      ...s,
      reason: `Son 7 günde ${s.absenceCount} gün devamsızlık`,
      priority: 'YÜKSEK'
    })));

    const behaviorIssues = this.db.prepare(`
      SELECT s.id, s.name, COUNT(bi.id) as incidentCount
      FROM students s
      JOIN behavior_incidents bi ON s.id = bi.studentId
      WHERE bi.incidentDate >= date('now', '-14 days')
        AND bi.intensity IN ('ORTA', 'YÜKSEK')
      GROUP BY s.id, s.name
      HAVING incidentCount >= 2
      ORDER BY incidentCount DESC
      LIMIT 5
    `).all();

    students.push(...(behaviorIssues as any[]).map(s => ({
      ...s,
      reason: `Son 14 günde ${s.incidentCount} davranış olayı`,
      priority: 'ORTA'
    })));

    return students;
  }

  private async getScheduledAppointments(date: string): Promise<any[]> {
    const appointments = this.db.prepare(`
      SELECT cs.*
      FROM counseling_sessions cs
      WHERE DATE(cs.sessionDate) = ?
        AND cs.completed = 0
      ORDER BY cs.sessionDate
    `).all(date);

    return appointments as any[];
  }

  private async getPendingTasks(date: string): Promise<any[]> {
    const tasks: unknown[] = [];

    const pendingFollowUps = this.db.prepare(`
      SELECT fu.*
      FROM counseling_follow_ups fu
      WHERE DATE(fu.followUpDate) <= ?
        AND fu.status = 'pending'
      ORDER BY fu.followUpDate
    `).all(date);

    tasks.push(...pendingFollowUps);

    const pendingReminders = this.db.prepare(`
      SELECT r.*
      FROM counseling_reminders r
      WHERE DATE(r.reminderDate) = ?
        AND r.status = 'pending'
      ORDER BY r.reminderDate
    `).all(date);

    tasks.push(...pendingReminders);

    return tasks;
  }

  private buildDailyPlanPrompt(date: string, priorityStudents: unknown[], appointments: unknown[], tasks: unknown[]): string {
    return `${date} tarihi için DETAYLI GÜNLÜK EYLEM PLANI oluştur:

📅 TARİH: ${date}

👥 ÖNCELİKLİ ÖĞRENCİLER:
${JSON.stringify(priorityStudents, null, 2)}

📋 PLANLANAN GÖRÜŞMELER:
${JSON.stringify(appointments, null, 2)}

✓ BEKLEYEN GÖREVLER:
${JSON.stringify(tasks, null, 2)}

🎯 PLAN GEREKSİNİMLERİ:

1. SABAH BRİFİNGİ (08:00-08:30):
   - Acil konular
   - İzlenecek kritik öğrenciler
   - Hazırlık görevleri

2. SAATLİK PROGRAM (08:30-17:00):
   Her saat için:
   - Zaman dilimi
   - Aksiyon tipi (görüşme/izleme/müdahale/dokümantasyon/aile iletişimi/toplantı/acil)
   - Öncelik seviyesi
   - Öğrenci bilgisi (varsa)
   - Yapılacak iş
   - Süre (dakika)
   - Beklenen sonuç
   - Hazırlık gereksinimleri
   - Kaynaklar

3. ÖNCELİKLENDİRME:
   - Kritik aksiyonlar
   - Yüksek öncelikli aksiyonlar
   - Rutin aksiyonlar
   - Fırsatçı aksiyonlar (zaman kalırsa)

4. ESNEKLİK ÖNERİLERİ:
   - Tampon zamanlar
   - Beklenmedik durumlar için planlar
   - Ayarlama stratejileri

5. GÜN SONU:
   - Kontrol listesi
   - Yarına hazırlık

⏰ ZAMAN YÖNETİMİ PRENSİPLERİ:
- Acil durumlar için %20 tampon bırak
- Grupla benzer görevleri
- Enerji seviyelerine göre planla (sabah: karmaşık, öğleden sonra: rutin)
- Her 90 dakikada 10 dk mola
- Dökümentasyon için süre ayır

📊 GÜNLÜK ÖZET:
- Toplam aksiyon sayısı
- Kritik/yüksek öncelikli sayıları
- Tahmini iş yükü
- Ana odak alanları

Yanıtını JSON formatında ver (TypeScript CounselorDailyPlan tipine uygun).`;
  }

  private parseDailyPlanResponse(date: string, counselorName: string, response: string, priorityStudents: unknown[]): CounselorDailyPlan {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        const fallbackPlan = this.generateFallbackDailyPlan(date, counselorName, priorityStudents);
        
        const normalizeHourlySchedule = (schedule: unknown[]): HourlyAction[] => {
          return schedule.map((action: any) => ({
            ...action,
            preparationNeeded: Array.isArray(action.preparationNeeded) 
              ? action.preparationNeeded 
              : (action.preparationNeeded ? [action.preparationNeeded] : []),
            resources: Array.isArray(action.resources) 
              ? action.resources 
              : (action.resources ? [action.resources] : [])
          }));
        };

        const normalizePriorities = (priorities: any): DailyPriorities => {
          if (!priorities) return fallbackPlan.priorities;
          
          return {
            criticalActions: Array.isArray(priorities.criticalActions) ? normalizeHourlySchedule(priorities.criticalActions) : [],
            highPriorityActions: Array.isArray(priorities.highPriorityActions) ? normalizeHourlySchedule(priorities.highPriorityActions) : [],
            routineActions: Array.isArray(priorities.routineActions) ? normalizeHourlySchedule(priorities.routineActions) : [],
            opportunisticActions: Array.isArray(priorities.opportunisticActions) ? normalizeHourlySchedule(priorities.opportunisticActions) : []
          };
        };

        const validatedPlan = {
          date,
          counselorName,
          generatedAt: new Date().toISOString(),
          dailySummary: parsed.dailySummary || fallbackPlan.dailySummary,
          morningBriefing: parsed.morningBriefing || fallbackPlan.morningBriefing,
          hourlySchedule: Array.isArray(parsed.hourlySchedule) && parsed.hourlySchedule.length > 0 
            ? normalizeHourlySchedule(parsed.hourlySchedule)
            : fallbackPlan.hourlySchedule,
          priorities: normalizePriorities(parsed.priorities),
          flexibilityRecommendations: parsed.flexibilityRecommendations || fallbackPlan.flexibilityRecommendations,
          endOfDayChecklist: Array.isArray(parsed.endOfDayChecklist) && parsed.endOfDayChecklist.length > 0
            ? parsed.endOfDayChecklist 
            : fallbackPlan.endOfDayChecklist,
          tomorrowPrep: Array.isArray(parsed.tomorrowPrep) && parsed.tomorrowPrep.length > 0
            ? parsed.tomorrowPrep 
            : fallbackPlan.tomorrowPrep
        };
        
        return validatedPlan;
      }
    } catch (error) {
      console.error('JSON parse error:', error);
      console.log('Falling back to database-driven plan generation...');
    }

    return this.generateFallbackDailyPlan(date, counselorName, priorityStudents);
  }

  private generateBasicPlanFromText(date: string, counselorName: string, text: string): CounselorDailyPlan {
    const baseActions: HourlyAction[] = [
      {
        time: '08:00',
        timeSlot: '08:00-08:30',
        actionType: 'DÖKÜMENTASYON',
        priority: 'YÜKSEK',
        action: 'Günlük planlama ve öncelik belirleme',
        duration: 30,
        expectedOutcome: 'Günlük yol haritası netleşir',
        preparationNeeded: ['Önceki gün notları', 'Uyarı listesi'],
        resources: ['Planlama şablonu']
      },
      {
        time: '09:00',
        timeSlot: '09:00-10:00',
        actionType: 'GÖRÜŞME',
        priority: 'YÜKSEK',
        action: 'Yüksek riskli öğrenci görüşmeleri',
        duration: 60,
        expectedOutcome: 'Risk değerlendirmesi ve aksiyon planı',
        preparationNeeded: ['Öğrenci dosyası', 'Önceki görüşme notları'],
        resources: ['Görüşme odası', 'Değerlendirme formları']
      }
    ];

    return {
      date,
      counselorName,
      generatedAt: new Date().toISOString(),
      dailySummary: {
        totalActions: baseActions.length,
        criticalCount: 1,
        highPriorityCount: 1,
        estimatedWorkload: 'Orta-Yoğun',
        keyFocusAreas: ['Risk yönetimi', 'Öğrenci görüşmeleri']
      },
      morningBriefing: {
        urgentMatters: ['AI yanıtından çıkarılan acil konular'],
        keyStudentsToMonitor: [],
        preparationTasks: ['Günlük hazırlık', 'Dosya gözden geçirme']
      },
      hourlySchedule: baseActions,
      priorities: {
        criticalActions: baseActions.filter(a => a.priority === 'ACİL'),
        highPriorityActions: baseActions.filter(a => a.priority === 'YÜKSEK'),
        routineActions: baseActions.filter(a => a.priority === 'ORTA'),
        opportunisticActions: baseActions.filter(a => a.priority === 'DÜŞÜK')
      },
      flexibilityRecommendations: {
        bufferTimes: ['10:30-11:00', '14:30-15:00'],
        contingencyPlans: [
          { scenario: 'Acil durum', action: 'Rutin görevleri ertele' },
          { scenario: 'Öğrenci krizi', action: 'Acil müdahale protokolü' }
        ],
        adjustmentStrategies: ['Esnek zaman blokları kullan', 'Öncelikleri dinamik güncelle']
      },
      endOfDayChecklist: [
        'Tüm görüşme notları tamamlandı mı?',
        'Acil takip gerektiren durumlar var mı?',
        'Yarın için hazırlık yapıldı mı?',
        'Bekleyen görevler kontrol edildi mi?'
      ],
      tomorrowPrep: [
        'Yarının öncelikli öğrencilerini belirle',
        'Gerekli materyalleri hazırla',
        'Planlanmış görüşmeleri gözden geçir'
      ]
    };
  }

  private generateFallbackDailyPlan(date: string, counselorName: string, priorityStudents: unknown[]): CounselorDailyPlan {
    const criticalStudents = priorityStudents.filter(s => s.priority === 'ACİL');
    const highPriorityStudents = priorityStudents.filter(s => s.priority === 'YÜKSEK');

    const actions: HourlyAction[] = [
      {
        time: '08:00',
        timeSlot: '08:00-08:30',
        actionType: 'DÖKÜMENTASYON',
        priority: 'YÜKSEK',
        action: 'Günlük planlama ve uyarı kontrolleri',
        duration: 30,
        expectedOutcome: 'Günlük öncelikler belirlenir',
        preparationNeeded: ['Sistem kontrolleri', 'Uyarı listesi'],
        resources: ['Bilgisayar', 'Planlama notları']
      }
    ];

    let currentTime = 8.5;
    criticalStudents.forEach((student, i) => {
      const hour = Math.floor(currentTime);
      const minute = (currentTime % 1) * 60;
      actions.push({
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        timeSlot: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}-${(hour + 1).toString().padStart(2, '0')}:00`,
        actionType: 'MÜDAHALE',
        priority: 'ACİL',
        studentId: student.id,
        studentName: student.name,
        action: `Acil müdahale: ${student.reason}`,
        duration: 60,
        expectedOutcome: 'Risk azaltma ve destek planı',
        preparationNeeded: ['Öğrenci dosyası', 'Müdahale protokolü'],
        resources: ['Görüşme odası', 'Acil durum formları'],
        followUp: 'Aynı gün takip gerekli'
      });
      currentTime += 1;
    });

    highPriorityStudents.slice(0, 3).forEach((student, i) => {
      const hour = Math.floor(currentTime);
      const minute = (currentTime % 1) * 60;
      actions.push({
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        timeSlot: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}-${(hour + 1).toString().padStart(2, '0')}:00`,
        actionType: 'GÖRÜŞME',
        priority: 'YÜKSEK',
        studentId: student.id,
        studentName: student.name,
        action: `Görüşme: ${student.reason}`,
        duration: 45,
        expectedOutcome: 'Durum değerlendirmesi ve destek planı',
        preparationNeeded: ['Öğrenci profili gözden geçir'],
        resources: ['Görüşme odası'],
        followUp: '2-3 gün içinde takip'
      });
      currentTime += 0.75;
    });

    actions.push({
      time: '14:00',
      timeSlot: '14:00-15:00',
      actionType: 'DÖKÜMENTASYON',
      priority: 'ORTA',
      action: 'Görüşme notlarını tamamla ve sisteme gir',
      duration: 60,
      expectedOutcome: 'Tüm dokümantasyon güncel',
      preparationNeeded: ['Görüşme notları'],
      resources: ['Bilgisayar']
    });

    actions.push({
      time: '15:30',
      timeSlot: '15:30-16:30',
      actionType: 'AİLE_İLETİŞİMİ',
      priority: 'YÜKSEK',
      action: 'Öncelikli aileler ile iletişim',
      duration: 60,
      expectedOutcome: 'Aile bilgilendirmesi ve işbirliği',
      preparationNeeded: ['Aile iletişim bilgileri', 'Özet notlar'],
      resources: ['Telefon', 'İletişim formu']
    });

    return {
      date,
      counselorName,
      generatedAt: new Date().toISOString(),
      dailySummary: {
        totalActions: actions.length,
        criticalCount: criticalStudents.length,
        highPriorityCount: highPriorityStudents.length,
        estimatedWorkload: criticalStudents.length > 2 ? 'Yoğun' : highPriorityStudents.length > 3 ? 'Orta-Yoğun' : 'Normal',
        keyFocusAreas: ['Acil müdahaleler', 'Yüksek riskli öğrenciler', 'Aile iletişimi']
      },
      morningBriefing: {
        urgentMatters: criticalStudents.map(s => `${s.name}: ${s.reason}`),
        keyStudentsToMonitor: [...criticalStudents, ...highPriorityStudents].slice(0, 5).map(s => ({
          studentId: s.id,
          name: s.name,
          reason: s.reason,
          suggestedTime: 'Sabah saatleri tercih edilir'
        })),
        preparationTasks: [
          'Acil durum öğrenci dosyalarını hazırla',
          'Müdahale protokollerini gözden geçir',
          'Aile iletişim bilgilerini kontrol et'
        ]
      },
      hourlySchedule: actions.sort((a, b) => a.time.localeCompare(b.time)),
      priorities: {
        criticalActions: actions.filter(a => a.priority === 'ACİL'),
        highPriorityActions: actions.filter(a => a.priority === 'YÜKSEK'),
        routineActions: actions.filter(a => a.priority === 'ORTA'),
        opportunisticActions: actions.filter(a => a.priority === 'DÜŞÜK')
      },
      flexibilityRecommendations: {
        bufferTimes: ['10:00-10:15', '12:00-13:00', '16:30-17:00'],
        contingencyPlans: [
          {
            scenario: 'Yeni acil durum',
            action: 'Rutin görevleri ertele, acil duruma odaklan'
          },
          {
            scenario: 'Görüşme uzarsa',
            action: 'Sonraki düşük öncelikli görevi ertele'
          },
          {
            scenario: 'Öğrenci gelmezse',
            action: 'Bekleyen dokümantasyonu tamamla veya diğer önceliklere geç'
          }
        ],
        adjustmentStrategies: [
          'Her saat başı 5-10 dakika tampon bırak',
          'Öğle arası esneklik için uzat',
          'Kritik olmayan görevleri yarına taşıyabilirsin'
        ]
      },
      endOfDayChecklist: [
        '✓ Tüm acil durumlar çözüldü mü?',
        '✓ Görüşme notları sisteme girildi mi?',
        '✓ Aile iletişimleri tamamlandı mı?',
        '✓ Yarın için takip gereken öğrenciler belirlendi mi?',
        '✓ Bekleyen acil durumlar var mı?'
      ],
      tomorrowPrep: [
        'Bugün çözülemeyen konuları yarına taşı',
        'Yeni uyarıları kontrol et',
        'Yarının öncelikli öğrencilerini belirle',
        'Gerekli materyalleri hazırla',
        'Takip gerektiren durumları not et'
      ]
    };
  }
}

export default HourlyActionPlannerService;
