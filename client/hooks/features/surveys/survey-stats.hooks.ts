import { useMemo } from 'react';
import { SurveyTemplate } from '@/lib/survey-types';

interface SurveyDistribution {
 id: string;
 templateId: string;
 status: string;
 targetClasses?: string[];
 created_at?: string;
}

interface SurveyResponse {
 id: string;
 distributionId: string;
}

export function useSurveyStats(
 templates: SurveyTemplate[],
 distributions: SurveyDistribution[],
 responses: SurveyResponse[]
) {
 return useMemo(() => {
 const now = new Date();
 const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

 const recentTemplates = templates.filter(t => {
 const createdAt = new Date(t.created_at || 0);
 return createdAt >= thirtyDaysAgo;
 }).length;

 const activeDistributions = distributions.filter(d => d.status === 'ACTIVE' || d.status === 'active').length;
 const completedDistributions = distributions.filter(d => d.status === 'COMPLETED' || d.status === 'completed').length;

 // Calculate total expected recipients (each distribution can have multiple recipients)
 const totalExpectedRecipients = distributions.reduce((sum, d) => {
 const recipientCount = d.targetClasses?.length || 1;
 return sum + recipientCount;
 }, 0);

 // Response rate: actual responses / expected recipients
 const responseRate = totalExpectedRecipients > 0 
 ? Math.min(100, Math.round((responses.length / totalExpectedRecipients) * 100))
 : 0;

 // Distribution counts by template's target audience
 const distributionsByAudience: Record<string, number> = {};
 distributions.forEach(d => {
 const template = templates.find(t => t.id === d.templateId);
 if (template) {
 const audience = template.targetAudience || 'STUDENT';
 distributionsByAudience[audience] = (distributionsByAudience[audience] || 0) + 1;
 }
 });

 return {
 totalTemplates: templates.length,
 totalDistributions: distributions.length,
 totalResponses: responses.length,
 activeDistributions,
 completedDistributions,
 responseRate,
 distributionsByAudience,
 recentTemplates,
 };
 }, [templates, distributions, responses]);
}
