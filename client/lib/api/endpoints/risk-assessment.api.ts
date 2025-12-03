import { apiClient, createApiHandler } from '../core/client';
import { API_ERROR_MESSAGES } from "../../constants/messages.constants";

type RiskFactors = any;

export async function getRiskFactorsByStudent(studentId: string): Promise<RiskFactors[]> {
 return createApiHandler(
 () => apiClient.get<RiskFactors[]>(`/api/risk-factors/${studentId}`, { showErrorToast: false }),
 [],
 API_ERROR_MESSAGES.RISK_FACTORS.LOAD_ERROR
 )();
}

export async function getLatestRiskFactors(studentId: string): Promise<RiskFactors | null> {
 return createApiHandler(
 () => apiClient.get<RiskFactors>(`/api/risk-factors/${studentId}/latest`, { showErrorToast: false }),
 null
 )();
}

export async function addRiskFactors(risk: RiskFactors): Promise<void> {
 return apiClient.post('/api/risk-factors', risk, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.RISK_FACTORS.ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.RISK_FACTORS.ADD_ERROR,
 });
}

export async function updateRiskFactors(id: string, updates: Partial<RiskFactors>): Promise<void> {
 return apiClient.put(`/api/risk-factors/${id}`, updates, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.RISK_FACTORS.UPDATE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.RISK_FACTORS.UPDATE_ERROR,
 });
}
