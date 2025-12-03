import { useState } from 'react';
import type { AISessionAnalysisRequest, AISessionAnalysisResponse } from '@/../../shared/schemas/ai-session-analysis.schemas';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';

export function useAISessionAnalysis() {
 const [isAnalyzing, setIsAnalyzing] = useState(false);
 const [analysis, setAnalysis] = useState<AISessionAnalysisResponse | null>(null);
 const [error, setError] = useState<string | null>(null);

 const analyzeSession = async (request: AISessionAnalysisRequest) => {
 setIsAnalyzing(true);
 setError(null);

 try {
 const response = await fetchWithSchool('/api/ai-assistant/analyze-session', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(request)
 });

 if (!response.ok) {
 let errorMessage = 'Analiz başarısız oldu';
 
 try {
 const errorData = await response.json();
 errorMessage = errorData.error || errorMessage;
 } catch (parseError) {
 if (response.status === 503) {
 errorMessage = 'AI servisi şu anda yoğun. Lütfen birkaç saniye sonra tekrar deneyin.';
 } else if (response.status === 504) {
 errorMessage = 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
 } else if (response.status >= 500) {
 errorMessage = 'Sunucu hatası oluştu. Lütfen tekrar deneyin.';
 }
 }
 
 throw new Error(errorMessage);
 }

 const data = await response.json();
 setAnalysis(data.data);
 return data.data;

 } catch (err: any) {
 const errorMessage = err.message || 'Bir hata oluştu';
 setError(errorMessage);
 throw err;
 } finally {
 setIsAnalyzing(false);
 }
 };

 const clearAnalysis = () => {
 setAnalysis(null);
 setError(null);
 };

 return {
 analyzeSession,
 clearAnalysis,
 analysis,
 isAnalyzing,
 error
 };
}
