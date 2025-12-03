import * as repository from '../../repository/index.js';
import { sanitizeString } from '../../../../middleware/validation.js';
import { v4 as uuidv4 } from 'uuid';
import type { SurveyDistribution } from '../../types/surveys.types.js';

export function getAllDistributions() {
  return repository.loadSurveyDistributions();
}

export function getDistributionById(id: string) {
  return repository.getSurveyDistribution(id);
}

export function getDistributionByPublicLink(publicLink: string) {
  return repository.getSurveyDistributionByLink(publicLink);
}

export function createDistribution(distribution: Partial<SurveyDistribution>) {
  const sanitizedDistribution = {
    ...distribution,
    title: distribution.title ? sanitizeString(distribution.title) : undefined,
    description: distribution.description ? sanitizeString(distribution.description) : undefined,
    publicLink: distribution.publicLink || uuidv4(),
    status: distribution.status || 'ACTIVE'
  };
  
  repository.saveSurveyDistribution(sanitizedDistribution);
}

export function updateDistribution(id: string, distribution: Partial<SurveyDistribution>) {
  const sanitizedDistribution = {
    ...distribution,
    title: distribution.title ? sanitizeString(distribution.title) : undefined,
    description: distribution.description ? sanitizeString(distribution.description) : undefined
  };
  
  repository.updateSurveyDistribution(id, sanitizedDistribution);
}

export function deleteDistribution(id: string) {
  repository.deleteSurveyDistribution(id);
}
