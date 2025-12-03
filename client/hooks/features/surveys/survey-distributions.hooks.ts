import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SurveyDistribution } from "@/lib/survey-types";
import { surveyService } from "@/services/survey.service";
import { useToast } from "@/hooks/utils/toast.utils";
import { SURVEY_QUERY_KEYS } from "./survey-templates.hooks";

export function useSurveyDistributions() {
 return useQuery({
 queryKey: SURVEY_QUERY_KEYS.distributions(),
 queryFn: ({ signal }) => surveyService.getDistributions(signal),
 staleTime: 5 * 60 * 1000,
 gcTime: 10 * 60 * 1000,
 });
}

export function useCreateDistribution() {
 const { toast } = useToast();
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: (distributionData: Omit<SurveyDistribution, 'id' | 'created_at' | 'updated_at'>) => surveyService.createDistribution(distributionData),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: SURVEY_QUERY_KEYS.distributions() });
 toast({
 title:"Başarılı",
 description:"Anket dağıtımı oluşturuldu",
 });
 },
 onError: (error: unknown) => {
 toast({
 title:"Hata",
 description: error instanceof Error ? error.message :"Anket dağıtımı oluşturulamadı",
 variant:"destructive",
 });
 },
 });
}

export function useUpdateDistribution() {
 const { toast } = useToast();
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: ({ id, data }: { id: string; data: Partial<SurveyDistribution> }) =>
 surveyService.updateDistribution(id, data),
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: SURVEY_QUERY_KEYS.distributions() });
 toast({
 title:"Başarılı",
 description:"Anket dağıtımı güncellendi",
 });
 },
 onError: (error: unknown) => {
 toast({
 title:"Hata",
 description: error instanceof Error ? error.message :"Anket dağıtımı güncellenemedi",
 variant:"destructive",
 });
 },
 });
}

export function useDeleteDistribution() {
 const { toast } = useToast();
 const queryClient = useQueryClient();

 return useMutation({
 mutationFn: (distributionId: string) => surveyService.deleteDistribution(distributionId),
 onMutate: async (distributionId) => {
 const queryKey = SURVEY_QUERY_KEYS.distributions();
 await queryClient.cancelQueries({ queryKey });
 const previousDistributions = queryClient.getQueryData<SurveyDistribution[]>(queryKey);

 queryClient.setQueryData<SurveyDistribution[]>(
 queryKey,
 (old) => old?.filter((d) => d.id !== distributionId) ?? []
 );

 return { previousDistributions, queryKey };
 },
 onSuccess: () => {
 toast({
 title:"Başarılı",
 description:"Anket dağıtımı silindi",
 });
 },
 onError: (error: unknown, _, context) => {
 if (context?.previousDistributions && context?.queryKey) {
 queryClient.setQueryData(context.queryKey, context.previousDistributions);
 }
 toast({
 title:"Hata",
 description: error instanceof Error ? error.message :"Anket dağıtımı silinemedi",
 variant:"destructive",
 });
 },
 onSettled: () => {
 queryClient.invalidateQueries({ queryKey: SURVEY_QUERY_KEYS.distributions() });
 },
 });
}
