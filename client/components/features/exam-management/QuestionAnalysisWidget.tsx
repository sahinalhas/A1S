import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/organisms/Card/card';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';
import { Badge } from '@/components/atoms/Badge/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { FileQuestion, TrendingUp, AlertCircle } from 'lucide-react';

async function fetchQuestionAnalysis(sessionId: string) {
 const response = await fetchWithSchool(`/api/exam-management/question-analysis/${sessionId}`);
 const result = await response.json();
 if (!result.success) throw new Error(result.error);
 return result.data;
}

interface QuestionAnalysisWidgetProps {
 sessionId: string;
 sessionName?: string;
}

const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

export function QuestionAnalysisWidget({ sessionId, sessionName }: QuestionAnalysisWidgetProps) {
 const { data: analysis, isLoading } = useQuery({
 queryKey: ['question-analysis', sessionId],
 queryFn: () => fetchQuestionAnalysis(sessionId),
 });

 if (isLoading) {
 return (
 <Card>
 <CardHeader>
 <CardTitle>Soru Bazlı Analiz</CardTitle>
 <CardDescription>Yükleniyor...</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="h-64 bg-muted rounded" />
 </CardContent>
 </Card>
 );
 }

 if (!analysis || !analysis.questions || analysis.questions.length === 0) {
 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <FileQuestion className="h-5 w-5 text-primary" />
 Soru Bazlı Analiz
 </CardTitle>
 <CardDescription>Soru zorluk ve ayırt edicilik analizi</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="text-center py-8 text-muted-foreground">
 <p>Henüz soru analizi yapılmamış</p>
 </div>
 </CardContent>
 </Card>
 );
 }

 const difficultyData = [
 { name: 'Çok Kolay', value: analysis.questions.filter((q: any) => q.difficulty_level === 'very_easy').length },
 { name: 'Kolay', value: analysis.questions.filter((q: any) => q.difficulty_level === 'easy').length },
 { name: 'Orta', value: analysis.questions.filter((q: any) => q.difficulty_level === 'medium').length },
 { name: 'Zor', value: analysis.questions.filter((q: any) => q.difficulty_level === 'hard').length },
 { name: 'Çok Zor', value: analysis.questions.filter((q: any) => q.difficulty_level === 'very_hard').length },
 ].filter(d => d.value > 0);

 const discriminationData = analysis.questions
 .sort((a: any, b: any) => b.discrimination_index - a.discrimination_index)
 .slice(0, 10)
 .map((q: any) => ({
 name: `S${q.question_number}`,
 'Ayırt Edicilik': (q.discrimination_index * 100).toFixed(1),
 }));

 const problematicQuestions = analysis.questions.filter(
 (q: any) => q.discrimination_index < 0.2 || q.difficulty_index < 0.2 || q.difficulty_index > 0.9
 );

 return (
 <Card>
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <FileQuestion className="h-5 w-5 text-primary" />
 Soru Bazlı Analiz
 </CardTitle>
 <CardDescription>
 {sessionName} - Soru zorluk ve ayırt edicilik analizi
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <h4 className="text-sm font-medium mb-4">Zorluk Dağılımı</h4>
 <ResponsiveContainer width="100%" height={200}>
 <PieChart>
 <Pie
 data={difficultyData}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, percent }) => `${name} %${(percent * 100).toFixed(0)}`}
 outerRadius={80}
 fill="#8884d8"
 dataKey="value"
 >
 {difficultyData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip />
 </PieChart>
 </ResponsiveContainer>
 </div>

 <div>
 <h4 className="text-sm font-medium mb-4">En Ayırt Edici 10 Soru</h4>
 <ResponsiveContainer width="100%" height={200}>
 <BarChart data={discriminationData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" />
 <YAxis />
 <Tooltip />
 <Bar dataKey="Ayırt Edicilik" fill="#3b82f6" />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {problematicQuestions.length > 0 && (
 <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
 <div className="flex items-center gap-2 mb-2">
 <AlertCircle className="h-5 w-5 text-orange-600" />
 <h4 className="font-medium text-orange-900">Sorunlu Sorular</h4>
 </div>
 <p className="text-sm text-orange-800 mb-3">
 Aşağıdaki sorular çok kolay, çok zor veya düşük ayırt ediciliğe sahip:
 </p>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
 {problematicQuestions.slice(0, 8).map((q: any) => (
 <Badge key={q.id} variant="outline" className="justify-center">
 Soru {q.question_number}
 </Badge>
 ))}
 </div>
 </div>
 )}

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="border rounded-lg p-4 space-y-2">
 <div className="text-sm text-muted-foreground">Ortalama Zorluk</div>
 <div className="text-2xl font-bold">
 {(analysis.summary.avg_difficulty * 100).toFixed(0)}%
 </div>
 <p className="text-xs text-muted-foreground">
 {analysis.summary.avg_difficulty < 0.4 ? 'Zor sınav' : 
 analysis.summary.avg_difficulty > 0.7 ? 'Kolay sınav' : 
 'Dengeli sınav'}
 </p>
 </div>

 <div className="border rounded-lg p-4 space-y-2">
 <div className="text-sm text-muted-foreground">Ortalama Ayırt Edicilik</div>
 <div className="text-2xl font-bold">
 {(analysis.summary.avg_discrimination * 100).toFixed(0)}%
 </div>
 <p className="text-xs text-muted-foreground">
 {analysis.summary.avg_discrimination > 0.3 ? 'İyi ayırt ediyor' : 'Geliştirilmeli'}
 </p>
 </div>

 <div className="border rounded-lg p-4 space-y-2">
 <div className="text-sm text-muted-foreground">Güvenilirlik (KR-20)</div>
 <div className="text-2xl font-bold">
 {(analysis.summary.reliability * 100).toFixed(0)}%
 </div>
 <p className="text-xs text-muted-foreground">
 {analysis.summary.reliability > 0.7 ? 'Güvenilir' : 'Orta güvenilirlik'}
 </p>
 </div>
 </div>
 </CardContent>
 </Card>
 );
}
