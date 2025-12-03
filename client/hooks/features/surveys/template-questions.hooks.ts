import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SurveyQuestion } from "@/lib/survey-types";
import { surveyService } from "@/services/survey.service";
import { useToast } from "@/hooks/utils/toast.utils";
import { SURVEY_QUERY_KEYS } from "./survey-templates.hooks";

export function useTemplateQuestions(templateId: string, enabled = true) {
 return useQuery({
 queryKey: SURVEY_QUERY_KEYS.questions(templateId),
 queryFn: () => surveyService.getTemplateQuestions(templateId),
 enabled: enabled && !!templateId,
 staleTime: 5 * 60 * 1000,
 gcTime: 10 * 60 * 1000,
 });
}

export function useCreateQuestion() {
 const { toast } = useToast();
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: (questionData: Omit<SurveyQuestion, 'id' | 'created_at'> & { templateId: string }) => surveyService.createQuestion(questionData),
 onSuccess: (_, variables) => {
 queryClient.invalidateQueries({ 
 queryKey: SURVEY_QUERY_KEYS.questions(variables.templateId) 
 });
 toast({
 title:"Başarılı",
 description:"Soru eklendi",
 });
 },
 onError: (error: unknown) => {
 toast({
 title:"Hata",
 description: error instanceof Error ? error.message :"Soru eklenemedi",
 variant:"destructive",
 });
 },
 });
}

export function useUpdateQuestion() {
 const { toast } = useToast();
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: ({ id, data }: { id: string; data: Partial<SurveyQuestion> }) =>
 surveyService.updateQuestion(id, data),
 onSuccess: (_, variables) => {
 if (variables.data.templateId) {
 queryClient.invalidateQueries({
 queryKey: SURVEY_QUERY_KEYS.questions(variables.data.templateId),
 });
 }
 toast({
 title:"Başarılı",
 description:"Soru güncellendi",
 });
 },
 onError: (error: unknown) => {
 toast({
 title:"Hata",
 description: error instanceof Error ? error.message :"Soru güncellenemedi",
 variant:"destructive",
 });
 },
 });
}

export function useDeleteQuestion() {
 const { toast } = useToast();
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: ({ questionId, templateId }: { questionId: string; templateId: string }) =>
 surveyService.deleteQuestion(questionId),
 onMutate: async ({ questionId, templateId }) => {
 await queryClient.cancelQueries({ queryKey: SURVEY_QUERY_KEYS.questions(templateId) });
 const previousQuestions = queryClient.getQueryData<SurveyQuestion[]>(
 SURVEY_QUERY_KEYS.questions(templateId)
 );

 queryClient.setQueryData<SurveyQuestion[]>(
 SURVEY_QUERY_KEYS.questions(templateId),
 (old) => old?.filter((q) => q.id !== questionId) ?? []
 );

 return { previousQuestions, templateId };
 },
 onSuccess: () => {
 toast({
 title:"Başarılı",
 description:"Soru silindi",
 });
 },
 onError: (error: unknown, _, context) => {
 if (context?.previousQuestions && context?.templateId) {
 queryClient.setQueryData(
 SURVEY_QUERY_KEYS.questions(context.templateId),
 context.previousQuestions
 );
 }
 toast({
 title:"Hata",
 description: error instanceof Error ? error.message :"Soru silinemedi",
 variant:"destructive",
 });
 },
 onSettled: (_, __, variables) => {
 queryClient.invalidateQueries({
 queryKey: SURVEY_QUERY_KEYS.questions(variables.templateId),
 });
 },
 });
}
