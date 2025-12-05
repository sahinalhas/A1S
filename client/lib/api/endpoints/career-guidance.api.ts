/**
 * Career Guidance API Client
 * Kariyer Rehberliği API İstemcisi
 */

import type {
    CareerProfile,
    CareerAnalysisResult,
    CareerRoadmap,
    CareerCategory
} from '../../../shared/types/career-guidance.types';
import { apiClient, createApiHandler } from '../core/client';

export interface GetCareersParams {
    category?: CareerCategory;
    search?: string;
}

export interface AnalyzeCareerMatchParams {
    studentId: string;
    careerId?: string;
}

export interface GenerateRoadmapParams {
    studentId: string;
    careerId: string;
    customGoals?: string[];
}

export async function getAllCareers(params?: GetCareersParams): Promise<CareerProfile[]> {
    return createApiHandler(
        async () => {
            const queryParams = new URLSearchParams();
            if (params?.category) queryParams.append('category', params.category);
            if (params?.search) queryParams.append('search', params.search);

            const url = `/api/career-guidance/careers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const response = await apiClient.get<{ success: boolean; data: CareerProfile[]; count: number }>(url, {
                showErrorToast: false
            });

            return response.data || [];
        },
        [],
        'Kariyer profilleri yüklenirken hata oluştu'
    )();
}

export async function getCareerById(careerId: string): Promise<CareerProfile | null> {
    return createApiHandler(
        async () => {
            const response = await apiClient.get<{ success: boolean; data: CareerProfile }>(
                `/api/career-guidance/careers/${careerId}`,
                { showErrorToast: false }
            );
            return response.data || null;
        },
        null,
        'Kariyer profili yüklenirken hata oluştu'
    )();
}

export async function searchCareers(searchTerm: string): Promise<CareerProfile[]> {
    return getAllCareers({ search: searchTerm });
}

export async function getCareersByCategory(category: CareerCategory): Promise<CareerProfile[]> {
    return getAllCareers({ category });
}

export async function analyzeCareerMatch(params: AnalyzeCareerMatchParams): Promise<CareerAnalysisResult | null> {
    return createApiHandler(
        async () => {
            const response = await apiClient.post<{ success: boolean; data: CareerAnalysisResult }>(
                '/api/career-guidance/analyze',
                {
                    studentId: params.studentId,
                    careerId: params.careerId
                },
                {
                    showErrorToast: true,
                    errorMessage: 'Kariyer analizi yapılırken hata oluştu'
                }
            );

            return response.data || null;
        },
        null,
        'Kariyer analizi yapılırken hata oluştu'
    )();
}

export async function generateCareerRoadmap(params: GenerateRoadmapParams): Promise<CareerRoadmap | null> {
    return createApiHandler(
        async () => {
            const response = await apiClient.post<{ success: boolean; data: CareerRoadmap }>(
                '/api/career-guidance/roadmap',
                {
                    studentId: params.studentId,
                    careerId: params.careerId,
                    customGoals: params.customGoals
                },
                {
                    showSuccessToast: true,
                    successMessage: 'Kariyer yol haritası oluşturuldu!',
                    showErrorToast: true,
                    errorMessage: 'Kariyer yol haritası oluşturulurken hata oluştu'
                }
            );

            return response.data || null;
        },
        null,
        'Kariyer yol haritası oluşturulurken hata oluştu'
    )();
}

export async function getStudentRoadmap(studentId: string): Promise<CareerRoadmap | null> {
    try {
        const response = await apiClient.get<{ success: boolean; data: CareerRoadmap | null }>(
            `/api/career-guidance/students/${studentId}/roadmap`,
            { showErrorToast: false }
        );

        return response.data || null;
    } catch (error: any) {
        // 404 is expected when no roadmap exists yet - don't show error
        if (error?.response?.status === 404) {
            return null;
        }
        // For other errors, log but don't show toast (silent failure)
        console.error('Error fetching student roadmap:', error);
        return null;
    }
}

export async function getAllStudentRoadmaps(studentId: string): Promise<CareerRoadmap[]> {
    return createApiHandler(
        async () => {
            const response = await apiClient.get<{ success: boolean; data: CareerRoadmap[]; count: number }>(
                `/api/career-guidance/students/${studentId}/roadmaps`,
                { showErrorToast: false }
            );

            return response.data || [];
        },
        [],
        'Yol haritaları yüklenirken hata oluştu'
    )();
}

export async function updateRoadmapProgress(roadmapId: string, updates: any): Promise<void> {
    return createApiHandler(
        async () => {
            await apiClient.put(
                `/api/career-guidance/roadmap/${roadmapId}`,
                updates,
                {
                    showSuccessToast: true,
                    successMessage: 'Yol haritası ilerleme güncellendi',
                    showErrorToast: true,
                    errorMessage: 'Yol haritası güncellenirken hata oluştu'
                }
            );
        },
        undefined,
        'Yol haritası güncellenirken hata oluştu'
    )();
}

export async function getStudentAnalysisHistory(studentId: string, limit: number = 5): Promise<CareerAnalysisResult[]> {
    return createApiHandler(
        async () => {
            const response = await apiClient.get<{ success: boolean; data: CareerAnalysisResult[] }>(
                `/api/career-guidance/students/${studentId}/analysis-history?limit=${limit}`,
                { showErrorToast: false }
            );

            return response.data || [];
        },
        [],
        'Kariyer analiz geçmişi yüklenirken hata oluştu'
    )();
}

export async function setStudentCareerTarget(studentId: string, careerId: string, notes?: string): Promise<void> {
    return apiClient.post(
        '/api/career-guidance/target',
        { studentId, careerId, notes },
        {
            showSuccessToast: true,
            successMessage: 'Kariyer hedefi belirlendi',
            errorMessage: 'Kariyer hedefi belirlenirken hata oluştu'
        }
    );
}

export interface StudentCompetency {
    studentId: string;
    competencyId: string;
    competencyName: string;
    category: string;
    currentLevel: number;
    assessmentDate: string;
    source: string;
}

export interface CompetencyStats {
    totalCompetencies: number;
    averageLevel: number;
    byCategory: Record<string, { count: number; averageLevel: number }>;
    strongCompetencies: StudentCompetency[];
    developmentAreas: StudentCompetency[];
}

export interface CareerComparison {
    studentId: string;
    careers: Array<{
        career: CareerProfile;
        matchScore: number;
        strengths: string[];
        gaps: any[];
        rank: number;
    }>;
    bestMatch: string;
    comparisonDate: string;
}

export async function getStudentCompetencies(studentId: string): Promise<StudentCompetency[]> {
    return createApiHandler(
        async () => {
            const response = await apiClient.get<{ success: boolean; data: StudentCompetency[]; count: number }>(
                `/api/career-guidance/students/${studentId}/competencies`,
                { showErrorToast: false }
            );

            return response.data || [];
        },
        [],
        'Yetkinlikler yüklenirken hata oluştu'
    )();
}

export async function refreshStudentCompetencies(studentId: string): Promise<StudentCompetency[]> {
    return createApiHandler(
        async () => {
            const response = await apiClient.post<{ success: boolean; data: StudentCompetency[]; count: number; message: string }>(
                `/api/career-guidance/students/${studentId}/competencies/refresh`,
                {},
                {
                    showSuccessToast: true,
                    successMessage: 'Yetkinlikler AI ile güncellendi',
                    showErrorToast: true,
                    errorMessage: 'Yetkinlikler güncellenirken hata oluştu'
                }
            );

            return response.data || [];
        },
        [],
        'Yetkinlikler güncellenirken hata oluştu'
    )();
}

export async function getStudentCompetencyStats(studentId: string): Promise<CompetencyStats> {
    return createApiHandler(
        async () => {
            const response = await apiClient.get<{ success: boolean; data: CompetencyStats }>(
                `/api/career-guidance/students/${studentId}/competencies/stats`,
                { showErrorToast: false }
            );

            return response.data || {
                totalCompetencies: 0,
                averageLevel: 0,
                byCategory: {},
                strongCompetencies: [],
                developmentAreas: []
            };
        },
        {
            totalCompetencies: 0,
            averageLevel: 0,
            byCategory: {},
            strongCompetencies: [],
            developmentAreas: []
        },
        'Yetkinlik istatistikleri yüklenirken hata oluştu'
    )();
}

export async function compareCareers(studentId: string, careerIds: string[]): Promise<CareerComparison | null> {
    return createApiHandler(
        async () => {
            const response = await apiClient.post<{ success: boolean; data: CareerComparison }>(
                '/api/career-guidance/compare',
                { studentId, careerIds },
                {
                    showErrorToast: true,
                    errorMessage: 'Meslekler karşılaştırılırken hata oluştu'
                }
            );

            return response.data || null;
        },
        null,
        'Meslekler karşılaştırılırken hata oluştu'
    )();
}
