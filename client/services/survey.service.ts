import { 
 SurveyTemplate, 
 SurveyDistribution, 
 SurveyQuestion, 
 SurveyResponse,
 SurveyAnalytics,
 DistributionStatistics
} from "@/lib/survey-types";
import { apiClient } from '@/lib/api/core/client';
import { SURVEY_ENDPOINTS } from '@/lib/constants/api-endpoints';

export const surveyService = {
 async getTemplates(signal?: AbortSignal): Promise<SurveyTemplate[]> {
 return await apiClient.get<SurveyTemplate[]>(
 SURVEY_ENDPOINTS.TEMPLATES,
 { errorMessage: 'Anket şablonları yüklenemedi' }
 );
 },

 async getDistributions(signal?: AbortSignal): Promise<SurveyDistribution[]> {
 return await apiClient.get<SurveyDistribution[]>(
 SURVEY_ENDPOINTS.DISTRIBUTIONS,
 { errorMessage: 'Anket dağıtımları yüklenemedi' }
 );
 },

 async getTemplateQuestions(templateId: string): Promise<SurveyQuestion[]> {
 return await apiClient.get<SurveyQuestion[]>(
 SURVEY_ENDPOINTS.QUESTIONS(templateId),
 { errorMessage: 'Anket soruları yüklenemedi' }
 );
 },

 async createDistribution(distributionData: Omit<SurveyDistribution, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
 return await apiClient.post<void>(
 SURVEY_ENDPOINTS.DISTRIBUTIONS,
 distributionData,
 {
 showSuccessToast: true,
 successMessage: 'Anket dağıtımı oluşturuldu',
 errorMessage: 'Anket dağıtımı oluşturulamadı',
 }
 );
 },

 async createTemplate(templateData: Partial<SurveyTemplate>): Promise<void> {
 return await apiClient.post<void>(
 SURVEY_ENDPOINTS.TEMPLATES,
 templateData,
 {
 showSuccessToast: true,
 successMessage: 'Anket şablonu oluşturuldu',
 errorMessage: 'Anket şablonu oluşturulamadı',
 }
 );
 },

 async updateTemplate(templateId: string, templateData: Partial<SurveyTemplate>): Promise<void> {
 return await apiClient.put<void>(
 SURVEY_ENDPOINTS.TEMPLATE_BY_ID(templateId),
 templateData,
 {
 showSuccessToast: true,
 successMessage: 'Anket şablonu güncellendi',
 errorMessage: 'Anket şablonu güncellenemedi',
 }
 );
 },

 async deleteTemplate(templateId: string): Promise<void> {
 return await apiClient.delete<void>(
 SURVEY_ENDPOINTS.TEMPLATE_BY_ID(templateId),
 {
 showSuccessToast: true,
 successMessage: 'Anket şablonu silindi',
 errorMessage: 'Anket şablonu silinemedi',
 }
 );
 },

 async updateDistribution(distributionId: string, distributionData: Partial<SurveyDistribution>): Promise<void> {
 return await apiClient.put<void>(
 SURVEY_ENDPOINTS.DISTRIBUTION_BY_ID(distributionId),
 distributionData,
 {
 showSuccessToast: true,
 successMessage: 'Anket dağıtımı güncellendi',
 errorMessage: 'Anket dağıtımı güncellenemedi',
 }
 );
 },

 async deleteDistribution(distributionId: string): Promise<void> {
 return await apiClient.delete<void>(
 SURVEY_ENDPOINTS.DISTRIBUTION_BY_ID(distributionId),
 {
 showSuccessToast: true,
 successMessage: 'Anket dağıtımı silindi',
 errorMessage: 'Anket dağıtımı silinemedi',
 }
 );
 },

 async getResponses(params?: { distributionId?: string; studentId?: string }): Promise<SurveyResponse[]> {
 const queryParams = new URLSearchParams();
 if (params?.distributionId) queryParams.append('distributionId', params.distributionId);
 if (params?.studentId) queryParams.append('studentId', params.studentId);
 const queryString = queryParams.toString();
 const url = queryString ? `${SURVEY_ENDPOINTS.RESPONSES}?${queryString}` : SURVEY_ENDPOINTS.RESPONSES;
 
 return await apiClient.get<SurveyResponse[]>(
 url,
 { errorMessage: 'Anket yanıtları yüklenemedi' }
 );
 },

 async getAnalytics(distributionId: string): Promise<SurveyAnalytics> {
 return await apiClient.get<SurveyAnalytics>(
 SURVEY_ENDPOINTS.ANALYTICS(distributionId),
 { errorMessage: 'Anket analizleri yüklenemedi' }
 );
 },

 async getStatistics(distributionId: string): Promise<DistributionStatistics> {
 return await apiClient.get<DistributionStatistics>(
 SURVEY_ENDPOINTS.STATISTICS(distributionId),
 { errorMessage: 'Dağıtım istatistikleri yüklenemedi' }
 );
 },

 async downloadExcelTemplate(distributionId: string): Promise<Blob> {
 return await apiClient.get<Blob>(
 `${SURVEY_ENDPOINTS.DISTRIBUTION_BY_ID(distributionId)}/excel-template`,
 { 
 errorMessage: 'Excel şablonu indirilemedi',
 showErrorToast: true 
 }
 );
 },

 async createQuestion(questionData: Omit<SurveyQuestion, 'id' | 'created_at'> & { templateId: string }): Promise<void> {
 return await apiClient.post<void>(
 SURVEY_ENDPOINTS.QUESTIONS(questionData.templateId),
 questionData,
 {
 showSuccessToast: true,
 successMessage: 'Soru eklendi',
 errorMessage: 'Soru eklenemedi',
 }
 );
 },

 async updateQuestion(questionId: string, questionData: Partial<SurveyQuestion>): Promise<void> {
 return await apiClient.put<void>(
 SURVEY_ENDPOINTS.QUESTION_BY_ID(questionId),
 questionData,
 {
 showSuccessToast: true,
 successMessage: 'Soru güncellendi',
 errorMessage: 'Soru güncellenemedi',
 }
 );
 },

 async deleteQuestion(questionId: string): Promise<void> {
 return await apiClient.delete<void>(
 SURVEY_ENDPOINTS.QUESTION_BY_ID(questionId),
 {
 showSuccessToast: true,
 successMessage: 'Soru silindi',
 errorMessage: 'Soru silinemedi',
 }
 );
 }
};
