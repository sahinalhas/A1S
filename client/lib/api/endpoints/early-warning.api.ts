import { apiClient } from '../core/client';
import type { 
 RiskAnalysisResult, 
 RiskScoreHistory, 
 EarlyWarningAlert, 
 InterventionRecommendation 
} from '@shared/types';

export const earlyWarningApi = {
 analyzeStudentRisk: (studentId: string) =>
 apiClient.request<RiskAnalysisResult>(`/api/early-warning/analyze/${studentId}`, {
 method: 'POST',
 showSuccessToast: true,
 successMessage: 'Risk analizi tamamlandı'
 }),

 getRiskScoreHistory: (studentId: string) =>
 apiClient.request<RiskScoreHistory[]>(`/api/early-warning/risk-score/${studentId}/history`),

 getLatestRiskScore: (studentId: string) =>
 apiClient.request<RiskScoreHistory>(`/api/early-warning/risk-score/${studentId}/latest`),

 getAllAlerts: () =>
 apiClient.request<EarlyWarningAlert[]>('/api/early-warning/alerts'),

 getActiveAlerts: () =>
 apiClient.request<EarlyWarningAlert[]>('/api/early-warning/alerts/active'),

 getAlertsByStudent: (studentId: string) =>
 apiClient.request<EarlyWarningAlert[]>(`/api/early-warning/alerts/student/${studentId}`),

 getAlertById: (id: string) =>
 apiClient.request<EarlyWarningAlert>(`/api/early-warning/alerts/${id}`),

 updateAlertStatus: (id: string, status: string) =>
 apiClient.request(`/api/early-warning/alerts/${id}/status`, {
 method: 'PUT',
 body: { status },
 showSuccessToast: true,
 successMessage: 'Uyarı durumu güncellendi'
 }),

 updateAlert: (id: string, updates: Partial<EarlyWarningAlert>) =>
 apiClient.request(`/api/early-warning/alerts/${id}`, {
 method: 'PUT',
 body: updates,
 showSuccessToast: true,
 successMessage: 'Uyarı güncellendi'
 }),

 deleteAlert: (id: string) =>
 apiClient.request(`/api/early-warning/alerts/${id}`, {
 method: 'DELETE',
 showSuccessToast: true,
 successMessage: 'Uyarı silindi'
 }),

 getRecommendationsByStudent: (studentId: string) =>
 apiClient.request<InterventionRecommendation[]>(`/api/early-warning/recommendations/student/${studentId}`),

 getRecommendationsByAlert: (alertId: string) =>
 apiClient.request<InterventionRecommendation[]>(`/api/early-warning/recommendations/alert/${alertId}`),

 getActiveRecommendations: () =>
 apiClient.request<InterventionRecommendation[]>('/api/early-warning/recommendations/active'),

 updateRecommendationStatus: (id: string, status: string) =>
 apiClient.request(`/api/early-warning/recommendations/${id}/status`, {
 method: 'PUT',
 body: { status },
 showSuccessToast: true,
 successMessage: 'Öneri durumu güncellendi'
 }),

 updateRecommendation: (id: string, updates: Partial<InterventionRecommendation>) =>
 apiClient.request(`/api/early-warning/recommendations/${id}`, {
 method: 'PUT',
 body: updates,
 showSuccessToast: true,
 successMessage: 'Öneri güncellendi'
 }),

 deleteRecommendation: (id: string) =>
 apiClient.request(`/api/early-warning/recommendations/${id}`, {
 method: 'DELETE',
 showSuccessToast: true,
 successMessage: 'Öneri silindi'
 }),

 getHighRiskStudents: () =>
 apiClient.request<any[]>('/api/early-warning/high-risk-students'),

 getDashboardSummary: () =>
 apiClient.request<any>('/api/early-warning/dashboard/summary')
};
