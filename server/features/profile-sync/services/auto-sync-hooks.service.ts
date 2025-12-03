/**
 * Auto Sync Hooks Service - REFACTORED
 * Veri geldiğinde AI önerisi oluşturur (otomatik kayıt yapmaz)
 * 
 * ÖNCEKİ DAVRAN: Otomatik olarak profili günceller
 * YENİ DAVRAN: AI önerisi oluşturur ve kullanıcı onayı bekler
 * 
 * Bu değişiklik, rehber öğretmenin kontrolünü korur ve
 * AI'nın sadece asistan rolünde çalışmasını sağlar.
 */

import { ProfileAggregationService } from './profile-aggregation.service.js';
import { SuggestionQueueService } from '../../ai-suggestions/services/suggestion-queue.service.js';
import type { ProfileUpdateRequest, DataSource } from '../types/profile-sync.types.js';
import type { CreateSuggestionRequest, ProposedChange } from '../../../../shared/types/ai-suggestion.types.js';
import { asyncOpMonitor } from '../../../services/async-operation-monitor.service.js';

export class AutoSyncHooksService {
  private aggregationService: ProfileAggregationService;
  private suggestionService: SuggestionQueueService;
  private static instance: AutoSyncHooksService;

  private constructor() {
    this.aggregationService = new ProfileAggregationService();
    this.suggestionService = SuggestionQueueService.getInstance();
  }

  static getInstance(): AutoSyncHooksService {
    if (!AutoSyncHooksService.instance) {
      AutoSyncHooksService.instance = new AutoSyncHooksService();
    }
    return AutoSyncHooksService.instance;
  }

  /**
   * Görüşme tamamlandığında AI önerisi oluştur
   */
  async onCounselingSessionCompleted(sessionData: {
    id: string;
    studentId?: string;
    studentIds?: string[];
    detailedNotes?: string;
    sessionTags?: string[];
    emotionalState?: string;
    cooperationLevel?: number;
    [key: string]: unknown;
  }): Promise<void> {
    const studentIds = sessionData.studentId 
      ? [sessionData.studentId] 
      : sessionData.studentIds || [];

    for (const studentId of studentIds) {
      await asyncOpMonitor.executeAsyncSafely(
        'counseling-session-sync',
        async () => {
          console.log('🎯 Counseling session completed, creating AI suggestion...');
          
          // Öneri oluştur (otomatik kayıt yok!)
          const suggestion: CreateSuggestionRequest = {
            studentId,
            suggestionType: 'PROFILE_UPDATE',
            source: 'counseling_session',
            sourceId: sessionData.id,
            priority: sessionData.emotionalState === 'ENDIŞELI' || sessionData.emotionalState === 'ÜZGÜN' 
              ? 'HIGH' 
              : 'MEDIUM',
            
            title: 'Rehberlik Görüşmesi Sonrası Profil Güncelleme',
            description: `Öğrenci ile yapılan görüşme sonucu profil güncelleme önerisi. ${
              sessionData.detailedNotes ? sessionData.detailedNotes.substring(0, 100) + '...' : ''
            }`,
            reasoning: 'Görüşme notları ve gözlemler temelinde profil bilgilerinin güncellenmesi önerilmektedir.',
            confidence: 0.85,
            
            proposedChanges: this.buildProposedChangesFromSession(sessionData),
            currentValues: {
              source: 'counseling_session',
              sessionId: sessionData.id
            },
            
            aiModel: 'profile-aggregation',
            aiVersion: '1.0',
            analysisData: {
              sessionData: {
                notes: sessionData.detailedNotes,
                tags: sessionData.sessionTags,
                emotionalState: sessionData.emotionalState,
                cooperationLevel: sessionData.cooperationLevel
              }
            }
          };

          const suggestionId = await this.suggestionService.createSuggestion(suggestion);
          console.log(`✅ AI önerisi oluşturuldu (Görüşme): ${suggestionId} - Öğrenci ${studentId}`);
        },
        {
          sessionId: sessionData.id,
          studentId,
          emotionalState: sessionData.emotionalState
        },
        (error) => {
          console.error(`❌ AI önerisi oluşturulamadı (Öğrenci ${studentId}):`, error);
        }
      );
    }
  }

  /**
   * Anket cevaplandığında AI önerisi oluştur
   */
  async onSurveyResponseSubmitted(responseData: {
    id: string;
    studentId?: string;
    studentInfo?: { id?: string; [key: string]: unknown };
    responseData: unknown;
    distributionId: string;
    [key: string]: unknown;
  }): Promise<void> {
    const studentId = responseData.studentId || responseData.studentInfo?.id;
    
    if (!studentId) {
      console.warn('⚠️ Survey response has no student ID, skipping');
      return;
    }

    await asyncOpMonitor.executeAsyncSafely(
      'survey-response-sync',
      async () => {
        console.log('📋 Survey response submitted, creating AI suggestion...');
        
        const suggestion: CreateSuggestionRequest = {
          studentId,
          suggestionType: 'PROFILE_UPDATE',
          source: 'survey_response',
          sourceId: responseData.id,
          priority: 'MEDIUM',
          
          title: 'Anket Sonrası Profil Güncelleme',
          description: 'Öğrencinin anket cevapları temelinde profil güncelleme önerisi.',
          reasoning: 'Anket verileri öğrencinin ilgi alanları, güçlü yönleri ve gelişim alanları hakkında bilgi içermektedir.',
          confidence: 0.75,
          
          proposedChanges: this.buildProposedChangesFromSurvey(responseData),
          currentValues: {
            source: 'survey_response',
            responseId: responseData.id,
            distributionId: responseData.distributionId
          },
          
          aiModel: 'profile-aggregation',
          aiVersion: '1.0'
        };

        const suggestionId = await this.suggestionService.createSuggestion(suggestion);
        console.log(`✅ AI önerisi oluşturuldu (Anket): ${suggestionId}`);
      },
      { responseId: responseData.id, studentId, distributionId: responseData.distributionId }
    );
  }

  /**
   * Sınav sonucu eklendiğinde AI önerisi oluştur
   */
  async onExamResultAdded(examData: {
    id: string;
    studentId: string;
    examName: string;
    score: number;
    subject?: string;
    date: string;
    [key: string]: unknown;
  }): Promise<void> {
    await asyncOpMonitor.executeAsyncSafely(
      'exam-result-sync',
      async () => {
        console.log('📝 Exam result added, creating AI suggestion...');
        
        // Düşük notlar için yüksek öncelik
        const isLowScore = examData.score < 50;
        
        const suggestion: CreateSuggestionRequest = {
          studentId: examData.studentId,
          suggestionType: isLowScore ? 'ACADEMIC_INSIGHT' : 'PROFILE_UPDATE',
          source: 'exam_result',
          sourceId: examData.id,
          priority: isLowScore ? 'HIGH' : 'LOW',
          
          title: isLowScore 
            ? `Düşük Sınav Performansı: ${examData.examName}` 
            : `Sınav Sonucu Kaydı: ${examData.examName}`,
          description: `${examData.examName} sınavından ${examData.score} puan aldı. ${
            isLowScore 
              ? 'Akademik destek gerekebilir.' 
              : 'Performans profil verilerine eklenebilir.'
          }`,
          reasoning: isLowScore 
            ? 'Düşük sınav performansı, öğrencinin akademik zorluk yaşadığına işaret edebilir.'
            : 'Sınav sonucu, öğrencinin akademik gelişimini takip için kayıt altına alınmalıdır.',
          confidence: 0.9,
          
          proposedChanges: this.buildProposedChangesFromExam(examData),
          
          aiModel: 'profile-aggregation',
          aiVersion: '1.0'
        };

        const suggestionId = await this.suggestionService.createSuggestion(suggestion);
        console.log(`✅ AI önerisi oluşturuldu (Sınav): ${suggestionId}`);
      },
      { examId: examData.id, studentId: examData.studentId, examName: examData.examName, score: examData.score }
    );
  }

  /**
   * Davranış kaydı eklendiğinde AI önerisi oluştur
   */
  async onBehaviorIncidentRecorded(incidentData: {
    id: string;
    studentId: string;
    behaviorType: string;
    description: string;
    severity: string;
    date: string;
    [key: string]: unknown;
  }): Promise<void> {
    console.log('⚠️ Behavior incident recorded, creating AI suggestion...');

    try {
      const isSerious = incidentData.severity === 'YÜKSEK' || incidentData.severity === 'KRİTİK';
      
      const suggestion: CreateSuggestionRequest = {
        studentId: incidentData.studentId,
        suggestionType: isSerious ? 'INTERVENTION_PLAN' : 'BEHAVIOR_INSIGHT',
        source: 'behavior_incident',
        sourceId: incidentData.id,
        priority: isSerious ? 'CRITICAL' : 'MEDIUM',
        
        title: isSerious 
          ? `Kritik Davranış Olayı: ${incidentData.behaviorType}` 
          : `Davranış Kaydı: ${incidentData.behaviorType}`,
        description: `${incidentData.behaviorType} türünde davranış olayı kaydedildi. ${incidentData.description}`,
        reasoning: isSerious 
          ? 'Ciddi davranış olayı, acil müdahale ve davranışsal destek gerektirebilir.'
          : 'Davranış olayı, öğrencinin sosyal-duygusal gelişimini takip için kaydedilmelidir.',
        confidence: 0.95,
        
        proposedChanges: this.buildProposedChangesFromBehavior(incidentData),
        
        aiModel: 'profile-aggregation',
        aiVersion: '1.0'
      };

      const suggestionId = await this.suggestionService.createSuggestion(suggestion);
      console.log(`✅ AI önerisi oluşturuldu (Davranış): ${suggestionId}`);
    } catch (error) {
      console.error(`❌ AI önerisi oluşturulamadı:`, error);
    }
  }

  /**
   * Görüşme notu eklendiğinde AI önerisi oluştur
   */
  async onMeetingNoteAdded(noteData: {
    id: string;
    studentId: string;
    type: string;
    note: string;
    plan?: string;
    date: string;
    [key: string]: unknown;
  }): Promise<void> {
    console.log('📝 Meeting note added, creating AI suggestion...');

    try {
      const suggestion: CreateSuggestionRequest = {
        studentId: noteData.studentId,
        suggestionType: noteData.plan ? 'FOLLOW_UP' : 'PROFILE_UPDATE',
        source: 'meeting_note',
        sourceId: noteData.id,
        priority: noteData.plan ? 'HIGH' : 'MEDIUM',
        
        title: `${noteData.type} Görüşme Notu`,
        description: noteData.note.substring(0, 100) + '...',
        reasoning: noteData.plan 
          ? 'Görüşme notu takip planı içermektedir.'
          : 'Görüşme notları profil verilerine eklenmelidir.',
        confidence: 0.8,
        
        proposedChanges: [{
          field: 'meetingNotes',
          currentValue: null,
          proposedValue: noteData.note,
          reason: 'Görüşme notu eklenmesi'
        }],
        
        aiModel: 'profile-aggregation',
        aiVersion: '1.0'
      };

      const suggestionId = await this.suggestionService.createSuggestion(suggestion);
      console.log(`✅ AI önerisi oluşturuldu (Not): ${suggestionId}`);
    } catch (error) {
      console.error(`❌ AI önerisi oluşturulamadı:`, error);
    }
  }

  /**
   * Veli görüşmesi yapıldığında AI önerisi oluştur
   */
  async onParentMeetingRecorded(meetingData: {
    id: string;
    studentId: string;
    attendees: string;
    topics: string;
    outcomes?: string;
    followUpActions?: string;
    meetingDate: string;
    [key: string]: unknown;
  }): Promise<void> {
    console.log('👨‍👩‍👧 Parent meeting recorded, creating AI suggestion...');

    try {
      const hasFollowUp = !!meetingData.followUpActions;
      
      const suggestion: CreateSuggestionRequest = {
        studentId: meetingData.studentId,
        suggestionType: hasFollowUp ? 'FOLLOW_UP' : 'PROFILE_UPDATE',
        source: 'parent_meeting',
        sourceId: meetingData.id,
        priority: hasFollowUp ? 'HIGH' : 'MEDIUM',
        
        title: 'Veli Görüşmesi Kaydı',
        description: `Veli görüşmesi yapıldı. Konular: ${meetingData.topics}`,
        reasoning: hasFollowUp 
          ? 'Veli görüşmesi takip eylemleri içermektedir.'
          : 'Veli görüşmesi aile dinamikleri hakkında bilgi içermektedir.',
        confidence: 0.85,
        
        proposedChanges: this.buildProposedChangesFromParentMeeting(meetingData),
        
        aiModel: 'profile-aggregation',
        aiVersion: '1.0'
      };

      const suggestionId = await this.suggestionService.createSuggestion(suggestion);
      console.log(`✅ AI önerisi oluşturuldu (Veli): ${suggestionId}`);
    } catch (error) {
      console.error(`❌ AI önerisi oluşturulamadı:`, error);
    }
  }

  /**
   * Öz değerlendirme yapıldığında AI önerisi oluştur
   */
  async onSelfAssessmentCompleted(assessmentData: {
    id: string;
    studentId: string;
    mood: string;
    energy: number;
    notes?: string;
    date: string;
    [key: string]: unknown;
  }): Promise<void> {
    console.log('🎯 Self assessment completed, creating AI suggestion...');

    try {
      const isLowMood = assessmentData.mood === 'KÖTÜ' || assessmentData.mood === 'ÇOK_KÖTÜ';
      
      const suggestion: CreateSuggestionRequest = {
        studentId: assessmentData.studentId,
        suggestionType: isLowMood ? 'INTERVENTION_PLAN' : 'PROFILE_UPDATE',
        source: 'self_assessment',
        sourceId: assessmentData.id,
        priority: isLowMood ? 'HIGH' : 'LOW',
        
        title: isLowMood ? 'Düşük Ruh Hali Tespiti' : 'Öz Değerlendirme Kaydı',
        description: `Öğrenci ruh hali: ${assessmentData.mood}, Enerji: ${assessmentData.energy}/10`,
        reasoning: isLowMood 
          ? 'Düşük ruh hali, duygusal destek gerektirebilir.'
          : 'Öz değerlendirme, öğrencinin duygusal durumunu takip için kayıt altına alınmalıdır.',
        confidence: 0.8,
        
        proposedChanges: [{
          field: 'emotionalState',
          currentValue: null,
          proposedValue: assessmentData.mood,
          reason: 'Öz değerlendirme sonucu'
        }],
        
        aiModel: 'profile-aggregation',
        aiVersion: '1.0'
      };

      const suggestionId = await this.suggestionService.createSuggestion(suggestion);
      console.log(`✅ AI önerisi oluşturuldu (Öz Değ.): ${suggestionId}`);
    } catch (error) {
      console.error(`❌ AI önerisi oluşturulamadı:`, error);
    }
  }

  /**
   * Devamsızlık kaydı eklendiğinde AI önerisi oluştur
   */
  async onAttendanceRecorded(attendanceData: {
    id: string;
    studentId: string;
    date: string;
    status: string;
    notes?: string;
    [key: string]: unknown;
  }): Promise<void> {
    // Sadece önemli devamsızlıkları işle (Yok, Geç)
    if (attendanceData.status !== 'Var') {
      console.log('📅 Attendance recorded, creating AI suggestion...');

      try {
        const suggestion: CreateSuggestionRequest = {
          studentId: attendanceData.studentId,
          suggestionType: 'PROFILE_UPDATE',
          source: 'attendance',
          sourceId: attendanceData.id,
          priority: attendanceData.status === 'Yok' ? 'MEDIUM' : 'LOW',
          
          title: `Devamsızlık Kaydı: ${attendanceData.status}`,
          description: `${attendanceData.date} tarihinde ${attendanceData.status}`,
          reasoning: 'Devamsızlık kayıtları, öğrencinin okula bağlılığını ve risk faktörlerini değerlendirmek için önemlidir.',
          confidence: 0.9,
          
          proposedChanges: [{
            field: 'attendanceRecord',
            currentValue: null,
            proposedValue: attendanceData.status,
            reason: 'Devamsızlık kaydı'
          }],
          
          aiModel: 'profile-aggregation',
          aiVersion: '1.0'
        };

        const suggestionId = await this.suggestionService.createSuggestion(suggestion);
        console.log(`✅ AI önerisi oluşturuldu (Devamsızlık): ${suggestionId}`);
      } catch (error) {
        console.error(`❌ AI önerisi oluşturulamadı:`, error);
      }
    }
  }

  // ==================== HELPER METHODS ====================

  private buildProposedChangesFromSession(sessionData: { emotionalState?: string; cooperationLevel?: number; [key: string]: unknown }): ProposedChange[] {
    const changes: ProposedChange[] = [];
    
    if (sessionData.emotionalState) {
      changes.push({
        field: 'emotionalState',
        currentValue: null,
        proposedValue: sessionData.emotionalState,
        reason: 'Görüşmede gözlemlenen duygusal durum'
      });
    }
    
    if (sessionData.cooperationLevel !== undefined) {
      changes.push({
        field: 'cooperationLevel',
        currentValue: null,
        proposedValue: sessionData.cooperationLevel,
        reason: 'Görüşmedeki işbirliği düzeyi'
      });
    }
    
    return changes;
  }

  private buildProposedChangesFromSurvey(responseData: unknown): ProposedChange[] {
    return [{
      field: 'surveyData',
      currentValue: null,
      proposedValue: 'Anket verileri işlenmeyi bekliyor',
      reason: 'Anket cevapları profil verilerine dahil edilebilir'
    }];
  }

  private buildProposedChangesFromExam(examData: { examName: string; score: number }): ProposedChange[] {
    return [{
      field: 'academicPerformance',
      currentValue: null,
      proposedValue: `${examData.examName}: ${examData.score}`,
      reason: 'Sınav performansı akademik profile eklenmeli'
    }];
  }

  private buildProposedChangesFromBehavior(incidentData: { behaviorType: string; severity: string }): ProposedChange[] {
    return [{
      field: 'behavioralConcerns',
      currentValue: null,
      proposedValue: `${incidentData.behaviorType} (${incidentData.severity})`,
      reason: 'Davranış olayı profil verilerine eklenmeli'
    }];
  }

  private buildProposedChangesFromParentMeeting(meetingData: { outcomes?: string }): ProposedChange[] {
    const changes: ProposedChange[] = [];
    
    if (meetingData.outcomes) {
      changes.push({
        field: 'familyDynamics',
        currentValue: null,
        proposedValue: meetingData.outcomes,
        reason: 'Veli görüşmesi sonuçları'
      });
    }
    
    return changes;
  }
}

// Singleton instance export
export const autoSyncHooks = AutoSyncHooksService.getInstance();
