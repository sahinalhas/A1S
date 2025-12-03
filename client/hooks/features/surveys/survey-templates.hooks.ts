import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SurveyTemplate } from "@/lib/survey-types";
import { surveyService } from "@/services/survey.service";
import { useToast } from "@/hooks/utils/toast.utils";
import { createSchoolScopedQueryKey, getSelectedSchoolId } from "@/lib/school-context";

const schoolId = () => getSelectedSchoolId();

export const SURVEY_QUERY_KEYS = {
 templates: () => createSchoolScopedQueryKey(['survey-templates'], schoolId()),
 template: (id: string) => createSchoolScopedQueryKey(['survey-templates', id], schoolId()),
 distributions: () => createSchoolScopedQueryKey(['survey-distributions'], schoolId()),
 distribution: (id: string) => createSchoolScopedQueryKey(['survey-distributions', id], schoolId()),
 questions: (templateId: string) => createSchoolScopedQueryKey(['survey-questions', templateId], schoolId()),
 responses: (distributionId?: string) => 
 distributionId 
   ? createSchoolScopedQueryKey(['survey-responses', distributionId], schoolId()) 
   : createSchoolScopedQueryKey(['survey-responses'], schoolId()),
 analytics: (distributionId: string) => createSchoolScopedQueryKey(['survey-analytics', distributionId], schoolId()),
 statistics: (distributionId: string) => createSchoolScopedQueryKey(['survey-statistics', distributionId], schoolId()),
};

export function useSurveyTemplates() {
 return useQuery({
 queryKey: SURVEY_QUERY_KEYS.templates(),
 queryFn: ({ signal }) => surveyService.getTemplates(signal),
 staleTime: 5 * 60 * 1000,
 gcTime: 10 * 60 * 1000,
 });
}

export function useCreateTemplate() {
 const { toast } = useToast();
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: (templateData: Partial<SurveyTemplate>) => 
 surveyService.createTemplate(templateData),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: SURVEY_QUERY_KEYS.templates() });
 toast({
 title:"Başarılı",
 description:"Anket şablonu oluşturuldu",
 });
 },
 onError: (error: unknown) => {
 toast({
 title:"Hata",
 description: error instanceof Error ? error.message :"Anket şablonu oluşturulamadı",
 variant:"destructive",
 });
 },
 });
}

export function useUpdateTemplate() {
 const { toast } = useToast();
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: ({ id, data }: { id: string; data: Partial<SurveyTemplate> }) =>
 surveyService.updateTemplate(id, data),
 onSuccess: async () => {
 await queryClient.invalidateQueries({ queryKey: SURVEY_QUERY_KEYS.templates() });
 toast({
 title:"Başarılı",
 description:"Anket şablonu güncellendi",
 });
 },
 onError: (error: unknown) => {
 toast({
 title:"Hata",
 description: error instanceof Error ? error.message :"Anket şablonu güncellenemedi",
 variant:"destructive",
 });
 },
 });
}

export function useDeleteTemplate() {
 const { toast } = useToast();
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: (templateId: string) => surveyService.deleteTemplate(templateId),
 onMutate: async (templateId) => {
 const queryKey = SURVEY_QUERY_KEYS.templates();
 await queryClient.cancelQueries({ queryKey });
 const previousTemplates = queryClient.getQueryData<SurveyTemplate[]>(queryKey);
 
 queryClient.setQueryData<SurveyTemplate[]>(
 queryKey,
 (old) => old?.filter((t) => t.id !== templateId) ?? []
 );

 return { previousTemplates, queryKey };
 },
 onSuccess: () => {
 toast({
 title:"Başarılı",
 description:"Anket şablonu silindi",
 });
 },
 onError: (error: unknown, _, context) => {
 if (context?.previousTemplates && context?.queryKey) {
 queryClient.setQueryData(context.queryKey, context.previousTemplates);
 }
 toast({
 title:"Hata",
 description: error instanceof Error ? error.message :"Anket şablonu silinemedi",
 variant:"destructive",
 });
 },
 onSettled: () => {
 queryClient.invalidateQueries({ queryKey: SURVEY_QUERY_KEYS.templates() });
 },
 });
}
