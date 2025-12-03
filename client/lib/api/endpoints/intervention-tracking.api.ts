import { apiClient } from '../core/client';
import type { InterventionEffectiveness, ParentFeedback, EscalationLog } from '@/../../shared/types/notification.types';

export const interventionTrackingApi = {
 // Intervention Effectiveness
 getEffectiveness: async (params?: {
 studentId?: string;
 interventionId?: string;
 effectivenessLevel?: string;
 }) => {
 const query = new URLSearchParams();
 if (params?.studentId) query.set('studentId', params.studentId);
 if (params?.interventionId) query.set('interventionId', params.interventionId);
 if (params?.effectivenessLevel) query.set('effectivenessLevel', params.effectivenessLevel);
 
 const response = await apiClient.get<{ success: boolean; data: InterventionEffectiveness[] }>(
 `/intervention-tracking/effectiveness?${query.toString()}`
 );
 return response.data;
 },

 getEffectivenessById: async (interventionId: number) => {
 const response = await apiClient.get<{ success: boolean; data: InterventionEffectiveness }>(
 `/intervention-tracking/effectiveness/${interventionId}`
 );
 return response.data;
 },

 getEffectivenessStats: async () => {
 const response = await apiClient.get<{
 success: boolean;
 data: {
 total: number;
 effective: number;
 needsImprovement: number;
 withAiAnalysis: number;
 };
 }>('/intervention-tracking/effectiveness/stats');
 return response.data;
 },

 trackEffectiveness: (data: {
 interventionId: number;
 studentId: number;
 preMetrics: any;
 postMetrics: any;
 lessonsLearned?: string;
 }) => apiClient.post<InterventionEffectiveness>('/intervention-tracking/effectiveness', data),

 getSimilarSuccesses: (params: {
 studentId: number;
 issueType: string;
 riskLevel: string;
 }) => apiClient.post<Array<{
 intervention: any;
 effectiveness: InterventionEffectiveness;
 similarity_score: number;
 }>>('/intervention-tracking/similar-successes', params),

 getInterventionInsights: (interventionId: number) =>
 apiClient.get<{
 effectiveness: InterventionEffectiveness;
 ai_analysis: any;
 recommendations: string[];
 }>(`/intervention-tracking/insights/${interventionId}`),

 // Parent Feedback
 submitParentFeedback: (data: {
 studentId: number;
 interventionId?: number;
 rating: number;
 feedbackText?: string;
 }) => apiClient.post<ParentFeedback>('/intervention-tracking/parent-feedback', data),

 getParentFeedback: (studentId: number) =>
 apiClient.get<ParentFeedback[]>(`/intervention-tracking/parent-feedback/${studentId}`),

 // Escalation
 createEscalation: (data: {
 studentId: number;
 alertId: number;
 escalatedFrom: string;
 escalatedTo: string;
 reason: string;
 }) => apiClient.post<EscalationLog>('/intervention-tracking/escalation', data),

 acknowledgeEscalation: (id: number) =>
 apiClient.put<EscalationLog>(`/intervention-tracking/escalation/${id}/acknowledge`, {}),

 resolveEscalation: (id: number, resolution: string) =>
 apiClient.put<EscalationLog>(`/intervention-tracking/escalation/${id}/resolve`, { resolution }),

 getEscalationLogs: (params: {
 studentId?: number;
 status?: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED';
 }) => {
 const query = new URLSearchParams();
 if (params.studentId) query.set('studentId', params.studentId.toString());
 if (params.status) query.set('status', params.status);
 
 return apiClient.get<EscalationLog[]>(`/intervention-tracking/escalation?${query.toString()}`);
 },

 getEscalationMetrics: () =>
 apiClient.get<{
 total_escalations: number;
 pending: number;
 acknowledged: number;
 resolved: number;
 avg_response_time: number;
 critical_count: number;
 }>('/intervention-tracking/escalation/metrics'),
};
