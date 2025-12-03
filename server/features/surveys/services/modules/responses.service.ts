import * as repository from '../../repository/index.js';
import type { SurveyResponse } from '../../types/surveys.types.js';

export function getResponses(filters?: { distributionId?: string; studentId?: string }) {
  return repository.loadSurveyResponses(filters);
}

export function checkDuplicateResponse(distributionId: string, studentInfo?: any): boolean {
  const responses = repository.loadSurveyResponses({ distributionId });
  if (!Array.isArray(responses)) return false;
  
  // Anonim ankette duplicate check yapma
  if (!studentInfo) return false;
  
  // Aynı distributionId + studentInfo ile daha önceki yanıt var mı kontrol et
  return responses.some(r => {
    const storedInfo = typeof r.studentInfo === 'string' ? JSON.parse(r.studentInfo) : r.studentInfo;
    return (
      storedInfo?.name === studentInfo.name &&
      storedInfo?.class === studentInfo.class &&
      storedInfo?.number === studentInfo.number
    );
  });
}

export function createResponse(response: Partial<SurveyResponse>) {
  repository.saveSurveyResponse(response);
}

export function updateResponse(id: string, response: Partial<SurveyResponse>) {
  repository.updateSurveyResponse(id, response);
}

export function deleteResponse(id: string) {
  repository.deleteSurveyResponse(id);
}
