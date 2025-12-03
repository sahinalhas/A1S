import { apiClient } from '../core/client';

export interface MeetingPrepResponse {
 success: boolean;
 data: {
 prep?: string;
 plan?: string;
 brief?: string;
 };
 error?: string;
}

export interface PriorityStudent {
 studentId: string;
 studentName: string;
 class: string;
 priorityScore: number;
 status: string;
 criticalAlerts: number;
 reason: string;
}

export interface PriorityStudentsResponse {
 success: boolean;
 data: {
 total: number;
 priorities: PriorityStudent[];
 recommendations: string[];
 };
}

export interface InterventionRecommendation {
 recommendationType: string;
 priority: string;
 effectivenessScore: number;
 resources: string[];
}

export interface InterventionRecommendationsResponse {
 success: boolean;
 data: {
 studentId: string;
 riskLevel: string;
 totalRecommendations: number;
 recommendations: InterventionRecommendation[];
 implementationGuide: string[];
 };
}

export interface ResourceRecommendationsResponse {
 success: boolean;
 data: {
 category: string;
 resources: any[];
 };
}

export async function generateParentMeetingPrep(studentId: string): Promise<MeetingPrepResponse> {
 return apiClient.post<MeetingPrepResponse>('/api/ai-assistant/meeting-prep/parent', { studentId });
}

export async function generateInterventionPlan(studentId: string, focusArea: string): Promise<MeetingPrepResponse> {
 return apiClient.post<MeetingPrepResponse>('/api/ai-assistant/meeting-prep/intervention', { 
 studentId, 
 focusArea 
 });
}

export async function generateTeacherMeetingPrep(studentId: string, meetingPurpose?: string): Promise<MeetingPrepResponse> {
 return apiClient.post<MeetingPrepResponse>('/api/ai-assistant/meeting-prep/teacher', { 
 studentId, 
 meetingPurpose 
 });
}

export async function getPriorityStudents(limit = 10): Promise<PriorityStudentsResponse> {
 return apiClient.get<PriorityStudentsResponse>(`/api/ai-assistant/recommendations/priority-students?limit=${limit}`);
}

export async function getInterventionRecommendations(studentId: string): Promise<InterventionRecommendationsResponse> {
 return apiClient.get<InterventionRecommendationsResponse>(`/api/ai-assistant/recommendations/interventions?studentId=${studentId}`);
}

export async function getResourceRecommendations(category?: string): Promise<ResourceRecommendationsResponse> {
 const url = category 
 ? `/api/ai-assistant/recommendations/resources?category=${category}`
 : '/api/ai-assistant/recommendations/resources';
 return apiClient.get<ResourceRecommendationsResponse>(url);
}
