import { apiClient } from '../core/client';

export interface EnhancedRiskScore {
 studentId: string;
 studentName: string;
 overallRiskScore: number;
 riskLevel: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK' | 'KRİTİK';
 confidence: number;
 factorScores: {
 academic: number;
 behavioral: number;
 attendance: number;
 socialEmotional: number;
 familySupport: number;
 peerRelations: number;
 motivation: number;
 health: number;
 };
 predictiveIndicators: {
 shortTerm: {
 nextWeek: string;
 probability: number;
 suggestedActions: string[];
 };
 mediumTerm: {
 nextMonth: string;
 probability: number;
 suggestedActions: string[];
 };
 longTerm: {
 nextSemester: string;
 probability: number;
 suggestedActions: string[];
 };
 };
 keyRiskFactors: Array<{
 factor: string;
 severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
 description: string;
 trend: 'IMPROVING' | 'STABLE' | 'DECLINING';
 recommendation: string;
 }>;
 protectiveFactors: Array<{
 factor: string;
 strength: number;
 description: string;
 }>;
 calculatedAt: string;
}

export interface RiskTrendAnalysis {
 studentId: string;
 historicalScores: Array<{
 date: string;
 score: number;
 level: string;
 }>;
 trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'VOLATILE';
 trendPercentage: number;
 volatilityIndex: number;
 predictions: {
 next7Days: number;
 next30Days: number;
 next90Days: number;
 };
}

export const enhancedRiskAPI = {
 async getEnhancedRiskScore(studentId: string): Promise<EnhancedRiskScore> {
 const response = await apiClient.get<{ data: EnhancedRiskScore }>(
 `/api/enhanced-risk/score/${studentId}`
 );
 return response.data;
 },

 async getTrendAnalysis(studentId: string): Promise<RiskTrendAnalysis> {
 const response = await apiClient.get<{ data: RiskTrendAnalysis }>(
 `/api/enhanced-risk/trend/${studentId}`
 );
 return response.data;
 },

 async batchCalculate(studentIds: string[]): Promise<EnhancedRiskScore[]> {
 const response = await apiClient.post<{ data: EnhancedRiskScore[] }>(
 '/api/enhanced-risk/batch-calculate',
 { studentIds }
 );
 return response.data;
 }
};
