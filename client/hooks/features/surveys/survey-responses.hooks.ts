import { useQuery } from "@tanstack/react-query";
import { surveyService } from "@/services/survey.service";
import { SURVEY_QUERY_KEYS } from "./survey-templates.hooks";

export function useSurveyResponses(distributionId?: string) {
 return useQuery({
 queryKey: SURVEY_QUERY_KEYS.responses(distributionId),
 queryFn: () => surveyService.getResponses({ distributionId }),
 enabled: !!distributionId,
 staleTime: 2 * 60 * 1000,
 gcTime: 5 * 60 * 1000,
 });
}
