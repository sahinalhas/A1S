import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/organisms/Card";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { Alert, AlertDescription } from "@/components/atoms/Alert";
import { FileText, ExternalLink, Info, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/core/client";
import { useNavigate } from "react-router-dom";

interface SurveyResponse {
 id: string;
 distributionId: string;
 studentId?: string;
 responseData: Record<string, any>;
 submittedAt: string;
 created_at?: string;
}

interface SurveyDistribution {
 id: string;
 templateId: string;
 title: string;
 description?: string;
 status: string;
}

interface AnketlerSectionProps {
 studentId: string;
 onUpdate: () => void;
}

export default function AnketlerSection({ studentId, onUpdate }: AnketlerSectionProps) {
 const navigate = useNavigate();

 // Ana survey sisteminden öğrencinin anket yanıtlarını al
 const { data: surveyResponses = [], isLoading } = useQuery<SurveyResponse[]>({
 queryKey: ['student-survey-responses', studentId],
 queryFn: async () => {
 const responses = await apiClient.get<SurveyResponse[]>(
 `/api/survey-responses?studentId=${encodeURIComponent(studentId)}`
 );
 return responses;
 },
 staleTime: 2 * 60 * 1000,
 });

 // Dağıtım bilgilerini al
 const { data: distributions = [] } = useQuery<SurveyDistribution[]>({
 queryKey: ['survey-distributions'],
 queryFn: async () => {
 return await apiClient.get<SurveyDistribution[]>('/api/survey-distributions');
 },
 staleTime: 5 * 60 * 1000,
 });

 // Yanıtları dağıtım bilgileriyle eşleştir - Array kontrolü ekle
 const enrichedResponses = Array.isArray(surveyResponses) ? surveyResponses.map(response => {
 const distribution = distributions.find(d => d.id === response.distributionId);
 return {
 ...response,
 distributionTitle: distribution?.title || 'Anket',
 distributionStatus: distribution?.status || 'unknown',
 };
 }) : [];

 const handleOpenSurveys = () => {
 navigate('/anketler');
 };

 const handleFillSurvey = () => {
 navigate(`/anketler?student=${studentId}`);
 };

 const calculateScore = (responseData: Record<string, any>): number | null => {
 const values = Object.values(responseData).filter(v => 
 typeof v === 'string' && !isNaN(Number(v))
 ).map(v => Number(v));
 
 if (values.length > 0) {
 return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
 }
 
 return null;
 };

 return (
 <Card>
 <CardHeader>
 <div className="flex items-center justify-between">
 <div>
 <CardTitle className="flex items-center gap-2">
 <FileText className="h-5 w-5" />
 Anket Sonuçları
 </CardTitle>
 <CardDescription>
 Öğrencinin tamamladığı anketler ve değerlendirmeler
 </CardDescription>
 </div>
 <div className="flex gap-2">
 <Button onClick={handleFillSurvey} size="sm" variant="outline">
 <Plus className="mr-2 h-4 w-4" />
 Öğrenci İçin Anket Doldur
 </Button>
 <Button onClick={handleOpenSurveys} size="sm">
 <ExternalLink className="mr-2 h-4 w-4" />
 Anketler Sayfası
 </Button>
 </div>
 </div>
 </CardHeader>
 <CardContent className="space-y-4">
 <Alert>
 <Info className="h-4 w-4" />
 <AlertDescription>
 Bu liste ana Anketler sisteminden otomatik olarak senkronize edilir. 
 Yeni anket eklemek veya mevcut anketleri görüntülemek için yukarıdaki butonları kullanın.
 </AlertDescription>
 </Alert>

 {isLoading ? (
 <div className="text-center py-8 text-muted-foreground">
 Anketler yükleniyor...
 </div>
 ) : enrichedResponses.length === 0 ? (
 <div className="text-center py-8 text-muted-foreground">
 <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
 <p>Henüz tamamlanmış anket bulunmuyor</p>
 <Button onClick={handleFillSurvey} className="mt-4" variant="outline">
 Öğrenci Adına Anket Doldur
 </Button>
 </div>
 ) : (
 <div className="space-y-3">
 {enrichedResponses.map((response) => {
 const score = calculateScore(response.responseData);
 const responseDate = new Date(response.submittedAt || response.created_at || '');
 
 return (
 <div
 key={response.id}
 className="flex items-center justify-between rounded-lg border p-4"
 >
 <div className="flex-1">
 <div className="flex items-center gap-2 mb-1">
 <div className="font-medium">{response.distributionTitle}</div>
 <Badge variant="outline" className="text-xs">
 {response.distributionStatus === 'ACTIVE' ? 'Aktif' : 
 response.distributionStatus === 'CLOSED' ? 'Kapalı' : 
 response.distributionStatus}
 </Badge>
 </div>
 <div className="text-sm text-muted-foreground">
 Tamamlanma: {responseDate.toLocaleDateString('tr-TR', {
 day: 'numeric',
 month: 'long',
 year: 'numeric'
 })}
 </div>
 </div>
 <div className="flex items-center gap-2">
 {score !== null && (
 <Badge variant="secondary" className="text-base px-3">
 {score} puan
 </Badge>
 )}
 </div>
 </div>
 );
 })}
 </div>
 )}

 <div className="pt-4 border-t">
 <h4 className="text-sm font-medium mb-2">İstatistikler</h4>
 <div className="grid grid-cols-3 gap-4">
 <div className="text-center p-3 bg-muted rounded-lg">
 <div className="text-2xl font-bold">{enrichedResponses.length}</div>
 <div className="text-xs text-muted-foreground">Toplam Anket</div>
 </div>
 <div className="text-center p-3 bg-muted rounded-lg">
 <div className="text-2xl font-bold">
 {enrichedResponses.filter(r => {
 const date = new Date(r.submittedAt || r.created_at || '');
 const monthAgo = new Date();
 monthAgo.setMonth(monthAgo.getMonth() - 1);
 return date >= monthAgo;
 }).length}
 </div>
 <div className="text-xs text-muted-foreground">Son 30 Gün</div>
 </div>
 <div className="text-center p-3 bg-muted rounded-lg">
 <div className="text-2xl font-bold">
 {enrichedResponses.filter(r => calculateScore(r.responseData) !== null).length}
 </div>
 <div className="text-xs text-muted-foreground">Puanlı</div>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 );
}
