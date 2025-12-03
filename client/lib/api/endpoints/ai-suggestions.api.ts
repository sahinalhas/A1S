/**
 * AI Suggestions API Client
 * AI öneri sistemi için frontend API client
 */

import type {
 AISuggestion,
 CreateSuggestionRequest,
 ReviewSuggestionRequest,
 SuggestionFilters,
 SuggestionStats
} from '../../../../shared/types/ai-suggestion.types';
import { apiClient, createApiHandler } from '../core/client';
import { AI_SUGGESTIONS_ENDPOINTS, buildQueryParams } from '../../constants/api-endpoints';

interface ApiSuccessResponse<T> {
 success: true;
 data: T;
}

export async function getPendingSuggestions(limit?: number): Promise<AISuggestion[]> {
 return createApiHandler(
 async () => {
 const url = limit
 ? AI_SUGGESTIONS_ENDPOINTS.PENDING + buildQueryParams({ limit })
 : AI_SUGGESTIONS_ENDPOINTS.PENDING;
 const response = await apiClient.get<AISuggestion[]>(
 url,
 { showErrorToast: false }
 );
 return response;
 },
 [],
 'Öneriler alınamadı'
 )();
}

export async function getStudentSuggestions(studentId: string): Promise<AISuggestion[]> {
 return createApiHandler(
 async () => {
 const response = await apiClient.get<AISuggestion[]>(
 AI_SUGGESTIONS_ENDPOINTS.BY_STUDENT(studentId),
 { showErrorToast: false }
 );
 return response;
 },
 [],
 'Öğrenci önerileri alınamadı'
 )();
}

export async function getSuggestionById(id: string): Promise<AISuggestion> {
 const response = await apiClient.get<AISuggestion>(
 AI_SUGGESTIONS_ENDPOINTS.BY_ID(id),
 { errorMessage: 'Öneri bulunamadı' }
 );
 return response;
}

export async function searchSuggestions(filters: SuggestionFilters): Promise<AISuggestion[]> {
 const response = await apiClient.post<AISuggestion[]>(
 AI_SUGGESTIONS_ENDPOINTS.SEARCH,
 filters,
 { errorMessage: 'Öneri araması yapılamadı' }
 );
 return response;
}

export async function approveSuggestion(
 id: string,
 reviewedBy: string,
 reviewNotes?: string,
 feedbackRating?: number,
 feedbackNotes?: string
): Promise<void> {
 await apiClient.post<ApiSuccessResponse<void>>(
 AI_SUGGESTIONS_ENDPOINTS.APPROVE(id),
 {
 reviewedBy,
 reviewNotes,
 feedbackRating,
 feedbackNotes
 },
 {
 showSuccessToast: true,
 successMessage: 'Öneri onaylandı',
 errorMessage: 'Öneri onaylanamadı',
 }
 );
}

export async function rejectSuggestion(
 id: string,
 reviewedBy: string,
 reviewNotes?: string,
 feedbackRating?: number,
 feedbackNotes?: string
): Promise<void> {
 await apiClient.post<ApiSuccessResponse<void>>(
 AI_SUGGESTIONS_ENDPOINTS.REJECT(id),
 {
 reviewedBy,
 reviewNotes,
 feedbackRating,
 feedbackNotes
 },
 {
 showSuccessToast: true,
 successMessage: 'Öneri reddedildi',
 errorMessage: 'Öneri reddedilemedi',
 }
 );
}

export async function modifySuggestion(
 id: string,
 reviewedBy: string,
 modifiedChanges: Record<string, unknown>[],
 reviewNotes?: string,
 feedbackRating?: number,
 feedbackNotes?: string
): Promise<void> {
 await apiClient.post<ApiSuccessResponse<void>>(
 AI_SUGGESTIONS_ENDPOINTS.MODIFY(id),
 {
 reviewedBy,
 modifiedChanges,
 reviewNotes,
 feedbackRating,
 feedbackNotes
 },
 {
 showSuccessToast: true,
 successMessage: 'Öneri düzenlendi ve uygulandı',
 errorMessage: 'Öneri düzenlenemedi',
 }
 );
}

export async function reviewSuggestion(request: ReviewSuggestionRequest): Promise<void> {
 await apiClient.post<ApiSuccessResponse<void>>(
 AI_SUGGESTIONS_ENDPOINTS.REVIEW(request.suggestionId),
 request,
 {
 showSuccessToast: true,
 successMessage: 'Öneri incelendi',
 errorMessage: 'Öneri incelenemedi',
 }
 );
}

export async function getSuggestionStats(): Promise<SuggestionStats> {
 return createApiHandler(
 async () => {
 const response = await apiClient.get<SuggestionStats>(
 AI_SUGGESTIONS_ENDPOINTS.STATS,
 { showErrorToast: false }
 );
 return response;
 },
 {
 totalPending: 0,
 totalApproved: 0,
 totalRejected: 0,
 totalModified: 0,
 byType: {} as Record<string, number>,
 byPriority: {} as Record<string, number>,
 avgConfidence: 0,
 avgFeedbackRating: 0,
 recentSuggestions: []
 },
 'İstatistikler alınamadı'
 )();
}

export async function cleanupExpiredSuggestions(): Promise<number> {
 const response = await apiClient.post<{ cleanedCount: number }>(
 AI_SUGGESTIONS_ENDPOINTS.CLEANUP,
 undefined,
 {
 showSuccessToast: true,
 successMessage: 'Süresi dolmuş öneriler temizlendi',
 errorMessage: 'Temizlik yapılamadı',
 }
 );
 return response.cleanedCount;
}

export async function createSuggestion(request: CreateSuggestionRequest): Promise<string> {
 const response = await apiClient.post<{ id: string }>(
 AI_SUGGESTIONS_ENDPOINTS.CREATE,
 request,
 {
 showSuccessToast: true,
 successMessage: 'Öneri oluşturuldu',
 errorMessage: 'Öneri oluşturulamadı',
 }
 );
 return response.id;
}

export async function createBulkSuggestions(requests: CreateSuggestionRequest[]): Promise<string[]> {
 const response = await apiClient.post<{ ids: string[] }>(
 AI_SUGGESTIONS_ENDPOINTS.BULK_CREATE,
 { suggestions: requests },
 {
 showSuccessToast: true,
 successMessage: `${requests.length} öneri oluşturuldu`,
 errorMessage: 'Toplu öneri oluşturulamadı',
 }
 );
 return response.ids;
}

