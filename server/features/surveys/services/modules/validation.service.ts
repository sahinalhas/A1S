import type { SurveyDistribution, SurveyQuestion } from '../../types/surveys.types.js';

export function validateDistributionStatus(distribution: SurveyDistribution) {
  // Allow ACTIVE and DRAFT for public surveys - only reject CLOSED/ARCHIVED
  if (distribution.status === 'CLOSED' || distribution.status === 'ARCHIVED') {
    throw new Error('Anket artık aktif değil');
  }

  const now = new Date();
  if (distribution.startDate && new Date(distribution.startDate) > now) {
    throw new Error('Anket henüz başlamamış');
  }

  if (distribution.endDate && new Date(distribution.endDate) < now) {
    throw new Error('Anket süresi dolmuş');
  }
}

export function validateResponseData(distribution: SurveyDistribution, questions: SurveyQuestion[], responseData: Record<string, unknown>, studentInfo?: Record<string, unknown>) {
  if (!distribution.allowAnonymous) {
    if (!studentInfo?.name || !studentInfo?.class || !studentInfo?.number) {
      throw new Error('Öğrenci bilgileri zorunludur (ad, sınıf, numara)');
    }
  }

  for (const question of questions) {
    if (question.required) {
      const answer = responseData?.[question.id];
      if (!answer || answer === '' || answer === null || answer === undefined) {
        throw new Error(`Soru ${question.orderIndex + 1} zorunludur ve yanıtlanmamış`);
      }
    }
  }
}
