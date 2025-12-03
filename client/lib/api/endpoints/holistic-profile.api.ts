import { apiClient } from '../core/client';
import type {
 StudentStrength,
 StudentSocialRelation,
 StudentInterest,
 StudentFutureVision,
 StudentSELCompetency,
 StudentSocioeconomic
} from '@shared/types';

export interface HolisticProfileData {
 strengths: StudentStrength | null;
 socialRelations: StudentSocialRelation | null;
 interests: StudentInterest | null;
 futureVision: StudentFutureVision | null;
 selCompetencies: StudentSELCompetency | null;
 socioeconomic: StudentSocioeconomic | null;
}

export const holisticProfileApi = {
 // Combined endpoint
 getHolisticProfile: (studentId: string) =>
 apiClient.request<HolisticProfileData>(`/api/holistic-profile/student/${studentId}`),

 // Strengths
 getStrengthsByStudent: (studentId: string) =>
 apiClient.request<StudentStrength[]>(`/api/holistic-profile/strengths/student/${studentId}`),
 
 getLatestStrength: (studentId: string) =>
 apiClient.request<StudentStrength>(`/api/holistic-profile/strengths/student/${studentId}/latest`),
 
 createStrength: (data: Omit<StudentStrength, 'id' | 'created_at' | 'updated_at'>) =>
 apiClient.request<StudentStrength>('/api/holistic-profile/strengths', {
 method: 'POST',
 body: data,
 showSuccessToast: true,
 successMessage: 'Güçlü yönler kaydedildi'
 }),
 
 updateStrength: (id: string, data: Partial<StudentStrength>) =>
 apiClient.request<StudentStrength>(`/api/holistic-profile/strengths/${id}`, {
 method: 'PUT',
 body: data,
 showSuccessToast: true,
 successMessage: 'Güçlü yönler güncellendi'
 }),
 
 deleteStrength: (id: string) =>
 apiClient.request(`/api/holistic-profile/strengths/${id}`, {
 method: 'DELETE',
 showSuccessToast: true,
 successMessage: 'Güçlü yönler silindi'
 }),

 // Social Relations
 getSocialRelationsByStudent: (studentId: string) =>
 apiClient.request<StudentSocialRelation[]>(`/api/holistic-profile/social-relations/student/${studentId}`),
 
 getLatestSocialRelation: (studentId: string) =>
 apiClient.request<StudentSocialRelation>(`/api/holistic-profile/social-relations/student/${studentId}/latest`),
 
 createSocialRelation: (data: Omit<StudentSocialRelation, 'id' | 'created_at' | 'updated_at'>) =>
 apiClient.request<StudentSocialRelation>('/api/holistic-profile/social-relations', {
 method: 'POST',
 body: data,
 showSuccessToast: true,
 successMessage: 'Sosyal ilişkiler kaydedildi'
 }),
 
 updateSocialRelation: (id: string, data: Partial<StudentSocialRelation>) =>
 apiClient.request<StudentSocialRelation>(`/api/holistic-profile/social-relations/${id}`, {
 method: 'PUT',
 body: data,
 showSuccessToast: true,
 successMessage: 'Sosyal ilişkiler güncellendi'
 }),
 
 deleteSocialRelation: (id: string) =>
 apiClient.request(`/api/holistic-profile/social-relations/${id}`, {
 method: 'DELETE',
 showSuccessToast: true,
 successMessage: 'Sosyal ilişkiler silindi'
 }),

 // Interests
 getInterestsByStudent: (studentId: string) =>
 apiClient.request<StudentInterest[]>(`/api/holistic-profile/interests/student/${studentId}`),
 
 getLatestInterest: (studentId: string) =>
 apiClient.request<StudentInterest>(`/api/holistic-profile/interests/student/${studentId}/latest`),
 
 createInterest: (data: Omit<StudentInterest, 'id' | 'created_at' | 'updated_at'>) =>
 apiClient.request<StudentInterest>('/api/holistic-profile/interests', {
 method: 'POST',
 body: data,
 showSuccessToast: true,
 successMessage: 'İlgi alanları kaydedildi'
 }),
 
 updateInterest: (id: string, data: Partial<StudentInterest>) =>
 apiClient.request<StudentInterest>(`/api/holistic-profile/interests/${id}`, {
 method: 'PUT',
 body: data,
 showSuccessToast: true,
 successMessage: 'İlgi alanları güncellendi'
 }),
 
 deleteInterest: (id: string) =>
 apiClient.request(`/api/holistic-profile/interests/${id}`, {
 method: 'DELETE',
 showSuccessToast: true,
 successMessage: 'İlgi alanları silindi'
 }),

 // Future Vision
 getFutureVisionByStudent: (studentId: string) =>
 apiClient.request<StudentFutureVision[]>(`/api/holistic-profile/future-vision/student/${studentId}`),
 
 getLatestFutureVision: (studentId: string) =>
 apiClient.request<StudentFutureVision>(`/api/holistic-profile/future-vision/student/${studentId}/latest`),
 
 createFutureVision: (data: Omit<StudentFutureVision, 'id' | 'created_at' | 'updated_at'>) =>
 apiClient.request<StudentFutureVision>('/api/holistic-profile/future-vision', {
 method: 'POST',
 body: data,
 showSuccessToast: true,
 successMessage: 'Gelecek vizyonu kaydedildi'
 }),
 
 updateFutureVision: (id: string, data: Partial<StudentFutureVision>) =>
 apiClient.request<StudentFutureVision>(`/api/holistic-profile/future-vision/${id}`, {
 method: 'PUT',
 body: data,
 showSuccessToast: true,
 successMessage: 'Gelecek vizyonu güncellendi'
 }),
 
 deleteFutureVision: (id: string) =>
 apiClient.request(`/api/holistic-profile/future-vision/${id}`, {
 method: 'DELETE',
 showSuccessToast: true,
 successMessage: 'Gelecek vizyonu silindi'
 }),

 // SEL Competencies
 getSELCompetenciesByStudent: (studentId: string) =>
 apiClient.request<StudentSELCompetency[]>(`/api/holistic-profile/sel-competencies/student/${studentId}`),
 
 getLatestSELCompetency: (studentId: string) =>
 apiClient.request<StudentSELCompetency>(`/api/holistic-profile/sel-competencies/student/${studentId}/latest`),
 
 createSELCompetency: (data: Omit<StudentSELCompetency, 'id' | 'created_at' | 'updated_at'>) =>
 apiClient.request<StudentSELCompetency>('/api/holistic-profile/sel-competencies', {
 method: 'POST',
 body: data,
 showSuccessToast: true,
 successMessage: 'SEL yetkinlikleri kaydedildi'
 }),
 
 updateSELCompetency: (id: string, data: Partial<StudentSELCompetency>) =>
 apiClient.request<StudentSELCompetency>(`/api/holistic-profile/sel-competencies/${id}`, {
 method: 'PUT',
 body: data,
 showSuccessToast: true,
 successMessage: 'SEL yetkinlikleri güncellendi'
 }),
 
 deleteSELCompetency: (id: string) =>
 apiClient.request(`/api/holistic-profile/sel-competencies/${id}`, {
 method: 'DELETE',
 showSuccessToast: true,
 successMessage: 'SEL yetkinlikleri silindi'
 }),

 // Socioeconomic
 getSocioeconomicByStudent: (studentId: string) =>
 apiClient.request<StudentSocioeconomic[]>(`/api/holistic-profile/socioeconomic/student/${studentId}`),
 
 getLatestSocioeconomic: (studentId: string) =>
 apiClient.request<StudentSocioeconomic>(`/api/holistic-profile/socioeconomic/student/${studentId}/latest`),
 
 createSocioeconomic: (data: Omit<StudentSocioeconomic, 'id' | 'created_at' | 'updated_at'>) =>
 apiClient.request<StudentSocioeconomic>('/api/holistic-profile/socioeconomic', {
 method: 'POST',
 body: data,
 showSuccessToast: true,
 successMessage: 'Sosyoekonomik bilgiler kaydedildi'
 }),
 
 updateSocioeconomic: (id: string, data: Partial<StudentSocioeconomic>) =>
 apiClient.request<StudentSocioeconomic>(`/api/holistic-profile/socioeconomic/${id}`, {
 method: 'PUT',
 body: data,
 showSuccessToast: true,
 successMessage: 'Sosyoekonomik bilgiler güncellendi'
 }),
 
 deleteSocioeconomic: (id: string) =>
 apiClient.request(`/api/holistic-profile/socioeconomic/${id}`, {
 method: 'DELETE',
 showSuccessToast: true,
 successMessage: 'Sosyoekonomik bilgiler silindi'
 }),
};
