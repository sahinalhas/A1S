/**
 * Profile Sync API Client
 * Canlı profil senkronizasyon API çağrıları
 */

import { apiClient, createApiHandler } from '../core/client';
import { PROFILE_SYNC_ENDPOINTS, buildQueryParams } from '../../constants/api-endpoints';

export interface UnifiedStudentIdentity {
 studentId: string;
 lastUpdated: string;
 
 // Core Identity
 summary: string;
 keyCharacteristics: string[];
 currentState: string;
 
 // Domain Scores (0-100)
 academicScore: number;
 socialEmotionalScore: number;
 behavioralScore: number;
 motivationScore: number;
 riskLevel: number;
 
 // Quick Facts
 strengths: string[];
 challenges: string[];
 recentChanges: string[];
 
 // AI Insights
 personalityProfile: string;
 learningStyle: string;
 interventionPriority: 'low' | 'medium' | 'high' | 'critical';
 recommendedActions: string[];
}

export interface ProfileSyncLog {
 id: string;
 studentId: string;
 source: string;
 sourceId: string;
 domain: string;
 action: string;
 validationScore: number;
 aiReasoning: string;
 extractedInsights: Record<string, any>;
 timestamp: string;
 processedBy: string;
}

export interface SyncStatistics {
 totalUpdates: number;
 avgValidationScore: number;
 uniqueSources: number;
 affectedDomains: number;
}

export interface ConflictResolution {
 id: string;
 studentId: string;
 conflictType: string;
 domain?: string;
 oldValue: unknown;
 newValue: unknown;
 resolvedValue?: unknown;
 resolutionMethod: string;
 severity: string;
 reasoning?: string;
 timestamp: string;
 resolvedBy?: string;
}

export interface ManualCorrectionRequest {
 studentId: string;
 domain: string;
 field: string;
 oldValue: unknown;
 newValue: unknown;
 reason: string;
 correctedBy: string;
}

export async function getStudentIdentity(studentId: string): Promise<UnifiedStudentIdentity | null> {
 return createApiHandler(
 async () => {
 return await apiClient.get<UnifiedStudentIdentity>(
 PROFILE_SYNC_ENDPOINTS.IDENTITY(studentId),
 { showErrorToast: false }
 );
 },
 null,
 'Öğrenci kimlik bilgileri yüklenemedi'
 )();
}

export async function refreshStudentIdentity(studentId: string): Promise<void> {
 return apiClient.post<void>(
 PROFILE_SYNC_ENDPOINTS.REFRESH(studentId),
 undefined,
 {
 showSuccessToast: true,
 successMessage: 'Öğrenci profili yenilendi',
 errorMessage: 'Profil yenilenemedi',
 }
 );
}

export async function getStudentSyncLogs(studentId: string, limit = 50): Promise<ProfileSyncLog[]> {
 return createApiHandler(
 async () => {
 const url = PROFILE_SYNC_ENDPOINTS.LOGS_BY_STUDENT(studentId) + buildQueryParams({ limit });
 return await apiClient.get<ProfileSyncLog[]>(url, { showErrorToast: false });
 },
 [],
 'Senkronizasyon logları yüklenemedi'
 )();
}

export async function getSyncStatistics(studentId?: string): Promise<SyncStatistics | null> {
 return createApiHandler(
 async () => {
 const url = studentId 
 ? PROFILE_SYNC_ENDPOINTS.STATISTICS + buildQueryParams({ studentId })
 : PROFILE_SYNC_ENDPOINTS.STATISTICS;
 return await apiClient.get<SyncStatistics>(url, { showErrorToast: false });
 },
 null,
 'İstatistikler yüklenemedi'
 )();
}

export async function getAllIdentities(): Promise<UnifiedStudentIdentity[]> {
 return createApiHandler(
 async () => {
 return await apiClient.get<UnifiedStudentIdentity[]>(
 PROFILE_SYNC_ENDPOINTS.IDENTITIES,
 { showErrorToast: false }
 );
 },
 [],
 'Öğrenci kimlikleri yüklenemedi'
 )();
}

export async function correctAIExtraction(correction: ManualCorrectionRequest): Promise<void> {
 return apiClient.post<void>(
 PROFILE_SYNC_ENDPOINTS.CORRECTION,
 correction,
 {
 showSuccessToast: true,
 successMessage: 'Düzeltme kaydedildi',
 errorMessage: 'Düzeltme kaydedilemedi',
 }
 );
}

export async function getCorrectionHistory(studentId: string): Promise<any[]> {
 return createApiHandler(
 async () => {
 const response = await apiClient.get<{ corrections: any[] }>(
 PROFILE_SYNC_ENDPOINTS.CORRECTIONS(studentId),
 { showErrorToast: false }
 );
 return response.corrections || [];
 },
 [],
 'Düzeltme geçmişi yüklenemedi'
 )();
}

export async function undoLastUpdate(studentId: string, logId: string, performedBy: string): Promise<void> {
 return apiClient.post<void>(
 PROFILE_SYNC_ENDPOINTS.UNDO,
 { studentId, logId, performedBy },
 {
 showSuccessToast: true,
 successMessage: 'Güncelleme geri alındı',
 errorMessage: 'Geri alma işlemi başarısız',
 }
 );
}

export async function getPendingConflicts(studentId?: string): Promise<ConflictResolution[]> {
 return createApiHandler(
 async () => {
 const url = studentId 
 ? PROFILE_SYNC_ENDPOINTS.CONFLICTS_PENDING + buildQueryParams({ studentId })
 : PROFILE_SYNC_ENDPOINTS.CONFLICTS_PENDING;
 const response = await apiClient.get<{ conflicts: ConflictResolution[] }>(
 url,
 { showErrorToast: false }
 );
 return response.conflicts || [];
 },
 [],
 'Çakışmalar yüklenemedi'
 )();
}

export async function resolveConflictManually(
 conflictId: string, 
 selectedValue: any, 
 resolvedBy: string,
 reason?: string
): Promise<void> {
 return apiClient.post<void>(
 PROFILE_SYNC_ENDPOINTS.CONFLICTS_RESOLVE,
 { conflictId, selectedValue, resolvedBy, reason },
 {
 showSuccessToast: true,
 successMessage: 'Çakışma çözüldü',
 errorMessage: 'Çakışma çözülemedi',
 }
 );
}

export async function bulkResolveConflicts(
 resolutions: Array<{ conflictId: string; selectedValue: any }>,
 resolvedBy: string
): Promise<void> {
 return apiClient.post<void>(
 PROFILE_SYNC_ENDPOINTS.CONFLICTS_BULK_RESOLVE,
 { resolutions, resolvedBy },
 {
 showSuccessToast: true,
 successMessage: `${resolutions.length} çakışma çözüldü`,
 errorMessage: 'Toplu çakışma çözümü başarısız',
 }
 );
}

export async function getClassProfileSummary(classId: string): Promise<any> {
 return createApiHandler(
 async () => {
 return await apiClient.get<any>(
 PROFILE_SYNC_ENDPOINTS.CLASS_SUMMARY(classId),
 { showErrorToast: false }
 );
 },
 null,
 'Sınıf özeti yüklenemedi'
 )();
}

export async function getClassTrends(classId: string, period?: string): Promise<any> {
 return createApiHandler(
 async () => {
 const url = period
 ? PROFILE_SYNC_ENDPOINTS.CLASS_TRENDS(classId) + buildQueryParams({ period })
 : PROFILE_SYNC_ENDPOINTS.CLASS_TRENDS(classId);
 return await apiClient.get<any>(url, { showErrorToast: false });
 },
 null,
 'Sınıf trendleri yüklenemedi'
 )();
}

export async function compareClasses(classIds: string[]): Promise<any> {
 return createApiHandler(
 async () => {
 const url = PROFILE_SYNC_ENDPOINTS.CLASS_COMPARE + buildQueryParams({ classes: classIds.join(',') });
 return await apiClient.get<any>(url, { showErrorToast: false });
 },
 null,
 'Sınıflar karşılaştırılamadı'
 )();
}
