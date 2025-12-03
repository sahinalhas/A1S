/**
 * Suggestion Queue Service
 * AI önerilerini yöneten merkezi servis
 * 
 * Bu servis, AI'nın otomatik olarak kayıt yapması yerine,
 * önerileri kuyruğa alıp kullanıcı onayı bekler.
 */

import * as repository from '../repository/ai-suggestion.repository.js';
import * as studentRepo from '../../students/repository/students.repository.js';
import type { 
  CreateSuggestionRequest, 
  ReviewSuggestionRequest,
  AISuggestion,
  SuggestionFilters,
  ProposedChange
} from '../../../../shared/types/ai-suggestion.types.js';

export class SuggestionQueueService {
  private static instance: SuggestionQueueService;

  private constructor() {
    // Başlangıçta süresi dolmuş önerileri temizle
    this.cleanupExpiredSuggestions();
  }

  static getInstance(): SuggestionQueueService {
    if (!SuggestionQueueService.instance) {
      SuggestionQueueService.instance = new SuggestionQueueService();
    }
    return SuggestionQueueService.instance;
  }

  /**
   * Yeni öneri oluştur
   * @param request - Öneri isteği
   * @param schoolId - Okul ID (opsiyonel, güvenlik kontrolü için)
   */
  async createSuggestion(request: CreateSuggestionRequest, schoolId?: string): Promise<string> {
    // Öğrencinin var olduğunu doğrula
    let student;
    
    if (schoolId) {
      student = studentRepo.getStudentByIdAndSchool(request.studentId, schoolId);
      if (!student) {
        throw new Error(`Öğrenci bulunamadı veya bu okula ait değil: ${request.studentId}`);
      }
    } else {
      student = studentRepo.getStudentById(request.studentId);
      if (!student) {
        throw new Error(`Öğrenci bulunamadı: ${request.studentId}`);
      }
    }

    // Öneri oluştur
    const suggestionId = repository.createSuggestion(request);

    console.log(`✅ AI Öneri oluşturuldu: ${request.title} (${request.suggestionType}) - ${suggestionId}`);

    return suggestionId;
  }

  /**
   * Toplu öneri oluştur
   */
  async createBulkSuggestions(requests: CreateSuggestionRequest[]): Promise<string[]> {
    return repository.createBulkSuggestions(requests);
  }

  /**
   * Öneriyi onayla ve uygula
   */
  async approveSuggestion(
    suggestionId: string,
    reviewedBy: string,
    reviewNotes?: string,
    feedbackRating?: number,
    feedbackNotes?: string
  ): Promise<void> {
    const suggestion = repository.getSuggestionById(suggestionId);
    
    if (!suggestion) {
      throw new Error('Öneri bulunamadı');
    }

    if (suggestion.status !== 'PENDING') {
      throw new Error('Bu öneri zaten işleme alınmış');
    }

    // Öneriyi onayla
    repository.updateSuggestionStatus(
      suggestionId,
      'APPROVED',
      reviewedBy,
      reviewNotes,
      undefined,
      feedbackRating,
      feedbackNotes
    );

    // Öneriyi uygula (gerçek değişiklikleri yap)
    await this.applySuggestion(suggestion);

    console.log(`✅ Öneri onaylandı ve uygulandı: ${suggestionId}`);
  }

  /**
   * Öneriyi reddet
   */
  async rejectSuggestion(
    suggestionId: string,
    reviewedBy: string,
    reviewNotes?: string,
    feedbackRating?: number,
    feedbackNotes?: string
  ): Promise<void> {
    const suggestion = repository.getSuggestionById(suggestionId);
    
    if (!suggestion) {
      throw new Error('Öneri bulunamadı');
    }

    if (suggestion.status !== 'PENDING') {
      throw new Error('Bu öneri zaten işleme alınmış');
    }

    repository.updateSuggestionStatus(
      suggestionId,
      'REJECTED',
      reviewedBy,
      reviewNotes,
      undefined,
      feedbackRating,
      feedbackNotes
    );

    console.log(`❌ Öneri reddedildi: ${suggestionId}`);
  }

  /**
   * Öneriyi düzenle ve uygula
   */
  async modifySuggestion(
    suggestionId: string,
    reviewedBy: string,
    modifiedChanges: ProposedChange[],
    reviewNotes?: string,
    feedbackRating?: number,
    feedbackNotes?: string
  ): Promise<void> {
    const suggestion = repository.getSuggestionById(suggestionId);
    
    if (!suggestion) {
      throw new Error('Öneri bulunamadı');
    }

    if (suggestion.status !== 'PENDING') {
      throw new Error('Bu öneri zaten işleme alınmış');
    }

    repository.updateSuggestionStatus(
      suggestionId,
      'MODIFIED',
      reviewedBy,
      reviewNotes,
      modifiedChanges,
      feedbackRating,
      feedbackNotes
    );

    // Düzenlenmiş öneriyi uygula
    const modifiedSuggestion = { ...suggestion, proposedChanges: modifiedChanges };
    await this.applySuggestion(modifiedSuggestion);

    console.log(`✏️ Öneri düzenlendi ve uygulandı: ${suggestionId}`);
  }

  /**
   * Toplu öneri inceleme
   */
  async reviewSuggestion(request: ReviewSuggestionRequest): Promise<void> {
    switch (request.status) {
      case 'APPROVED':
        await this.approveSuggestion(
          request.suggestionId,
          request.reviewedBy,
          request.reviewNotes,
          request.feedbackRating,
          request.feedbackNotes
        );
        break;
      case 'REJECTED':
        await this.rejectSuggestion(
          request.suggestionId,
          request.reviewedBy,
          request.reviewNotes,
          request.feedbackRating,
          request.feedbackNotes
        );
        break;
      case 'MODIFIED':
        if (!request.modifiedChanges) {
          throw new Error('Düzenlenmiş değişiklikler gerekli');
        }
        await this.modifySuggestion(
          request.suggestionId,
          request.reviewedBy,
          request.modifiedChanges,
          request.reviewNotes,
          request.feedbackRating,
          request.feedbackNotes
        );
        break;
    }
  }

  /**
   * Öneriyi gerçekten uygula (profil güncelleme, müdahale oluşturma, vb.)
   */
  private async applySuggestion(suggestion: AISuggestion): Promise<void> {
    // Bu metodun içeriği, öneri tipine göre farklı işlemler yapacak
    // Şimdilik sadece konsola logluyoruz, gerçek implementasyonlar eklenecek
    
    console.log(`🔧 Öneri uygulanıyor: ${suggestion.suggestionType}`);
    
    switch (suggestion.suggestionType) {
      case 'PROFILE_UPDATE':
        // ProfileAggregationService ile profil güncelle
        console.log('  → Profil güncelleniyor...');
        break;
      
      case 'RISK_ALERT':
        // Risk uyarısı oluştur
        console.log('  → Risk uyarısı oluşturuluyor...');
        break;
      
      case 'INTERVENTION_PLAN':
        // Müdahale planı oluştur
        console.log('  → Müdahale planı oluşturuluyor...');
        break;
      
      case 'MEETING_SUGGESTION':
        // Toplantı önerisi oluştur
        console.log('  → Toplantı önerisi kaydediliyor...');
        break;
      
      case 'FOLLOW_UP':
        // Takip görüşmesi planla
        console.log('  → Takip görüşmesi planlanıyor...');
        break;
      
      case 'BEHAVIOR_INSIGHT':
      case 'ACADEMIC_INSIGHT':
        // Insight kaydet
        console.log('  → İçgörü kaydediliyor...');
        break;
    }
  }

  /**
   * Öğrenci için bekleyen önerileri getir
   */
  getPendingSuggestionsForStudent(studentId: string): AISuggestion[] {
    return repository.getPendingSuggestionsForStudent(studentId);
  }

  /**
   * Tüm bekleyen önerileri getir
   */
  getAllPendingSuggestions(limit?: number): AISuggestion[] {
    return repository.getAllPendingSuggestions(limit);
  }

  /**
   * Öneri ara
   */
  searchSuggestions(filters: SuggestionFilters): AISuggestion[] {
    return repository.searchSuggestions(filters);
  }

  /**
   * Öneri istatistikleri
   */
  getStats() {
    return repository.getSuggestionStats();
  }

  /**
   * Süresi dolmuş önerileri temizle
   */
  cleanupExpiredSuggestions(): number {
    const cleaned = repository.cleanupExpiredSuggestions();
    if (cleaned > 0) {
      console.log(`🧹 ${cleaned} süresi dolmuş öneri temizlendi`);
    }
    return cleaned;
  }

  /**
   * Öneriyi ID ile getir
   */
  getSuggestionById(id: string): AISuggestion | null {
    return repository.getSuggestionById(id);
  }
}

export default SuggestionQueueService;
