import { apiClient, createApiHandler } from '../core/client';
import { API_ERROR_MESSAGES } from "../../constants/messages.constants";

type RiskFactors = any;

export async function getRiskFactorsByStudent(studentId: string): Promise<RiskFactors[]> {
 return createApiHandler(
 async () => {
   const result = await apiClient.get<RiskFactors>(`/api/standardized-profile/${studentId}/risk-protective`, { showErrorToast: false });
   return result && Object.keys(result).length > 0 ? [result] : [];
 },
 [],
 API_ERROR_MESSAGES.RISK_FACTORS.LOAD_ERROR
 )();
}

export async function getLatestRiskFactors(studentId: string): Promise<RiskFactors | null> {
 return createApiHandler(
 async () => {
   const result = await apiClient.get<RiskFactors>(`/api/standardized-profile/${studentId}/risk-protective`, { showErrorToast: false });
   return result && Object.keys(result).length > 0 ? result : null;
 },
 null
 )();
}

export async function addRiskFactors(risk: RiskFactors): Promise<void> {
 const { studentId, ...riskData } = risk;
 return apiClient.post(`/api/standardized-profile/${studentId}/risk-protective`, riskData, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.RISK_FACTORS.ADD_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.RISK_FACTORS.ADD_ERROR,
 });
}

export async function updateRiskFactors(studentId: string, updates: Partial<RiskFactors>): Promise<void> {
 return apiClient.post(`/api/standardized-profile/${studentId}/risk-protective`, updates, {
 showSuccessToast: true,
 successMessage: API_ERROR_MESSAGES.RISK_FACTORS.UPDATE_SUCCESS,
 errorMessage: API_ERROR_MESSAGES.RISK_FACTORS.UPDATE_ERROR,
 });
}
