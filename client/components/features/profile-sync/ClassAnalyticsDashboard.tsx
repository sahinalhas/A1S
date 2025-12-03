import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Users, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';
import { fetchWithSchool } from '@/lib/api/core/fetch-helpers';

interface ClassAnalyticsDashboardProps {
 classId: string;
}

interface ClassSummary {
 classId: string;
 totalStudents: number;
 identifiedStudents: number;
 riskDistribution: Record<string, number>;
 averageScores: {
 academic: number;
 socialEmotional: number;
 behavioral: number;
 motivation: number;
 };
 highRiskStudents: Array<{
 studentId: string;
 riskLevel: number;
 priority: string;
 challenges: string[];
 }>;
}

export default function ClassAnalyticsDashboard({ classId }: ClassAnalyticsDashboardProps) {
 const [summary, setSummary] = useState<ClassSummary | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetchClassSummary();
 }, [classId]);

 const fetchClassSummary = async () => {
 try {
 const response = await fetchWithSchool(`/api/profile-sync/class/${classId}/summary`);
 if (response.ok) {
 const data = await response.json();
 setSummary(data);
 }
 } catch (error) {
 console.error('Error fetching class summary:', error);
 } finally {
 setLoading(false);
 }
 };

 if (loading) {
 return (
 <Card>
 <CardContent className="p-6">
 <div className=" space-y-4">
 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
 <div className="h-4 bg-gray-200 rounded w-1/2"></div>
 </div>
 </CardContent>
 </Card>
 );
 }

 if (!summary) {
 return (
 <Card>
 <CardContent className="p-6 text-center">
 <p className="text-gray-500">Sınıf verisi bulunamadı</p>
 </CardContent>
 </Card>
 );
 }

 return (
 <div className="space-y-4">
 {/* Overview Stats */}
 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
 <Card>
 <CardContent className="p-4">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-blue-100 rounded">
 <Users className="h-5 w-5 text-blue-600" />
 </div>
 <div>
 <p className="text-sm text-gray-500">Toplam Öğrenci</p>
 <p className="text-2xl font-bold">{summary.totalStudents}</p>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardContent className="p-4">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-green-100 rounded">
 <BarChart3 className="h-5 w-5 text-green-600" />
 </div>
 <div>
 <p className="text-sm text-gray-500">Profillenen</p>
 <p className="text-2xl font-bold">{summary.identifiedStudents}</p>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardContent className="p-4">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-orange-100 rounded">
 <AlertTriangle className="h-5 w-5 text-orange-600" />
 </div>
 <div>
 <p className="text-sm text-gray-500">Yüksek Risk</p>
 <p className="text-2xl font-bold">
 {(summary.riskDistribution.high || 0) + (summary.riskDistribution.critical || 0)}
 </p>
 </div>
 </div>
 </CardContent>
 </Card>

 <Card>
 <CardContent className="p-4">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-purple-100 rounded">
 <TrendingUp className="h-5 w-5 text-purple-600" />
 </div>
 <div>
 <p className="text-sm text-gray-500">Ortalama Akademik</p>
 <p className="text-2xl font-bold">{summary.averageScores.academic}</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Risk Distribution */}
 <Card>
 <CardHeader>
 <CardTitle className="text-lg">Risk Dağılımı</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex gap-4 flex-wrap">
 <Badge variant="outline" className="bg-green-50 border-green-300">
 Düşük: {summary.riskDistribution.low || 0}
 </Badge>
 <Badge variant="outline" className="bg-yellow-50 border-yellow-300">
 Orta: {summary.riskDistribution.medium || 0}
 </Badge>
 <Badge variant="outline" className="bg-orange-50 border-orange-300">
 Yüksek: {summary.riskDistribution.high || 0}
 </Badge>
 <Badge variant="outline" className="bg-red-50 border-red-300">
 Kritik: {summary.riskDistribution.critical || 0}
 </Badge>
 </div>
 </CardContent>
 </Card>

 {/* High Risk Students */}
 {summary.highRiskStudents.length > 0 && (
 <Card className="border-orange-200">
 <CardHeader>
 <CardTitle className="text-lg flex items-center gap-2">
 <AlertTriangle className="h-5 w-5 text-orange-600" />
 Öncelikli Öğrenciler
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-3">
 {summary.highRiskStudents.map((student) => (
 <div
 key={student.studentId}
 className="p-3 border rounded-lg bg-orange-50"
 >
 <div className="flex items-center justify-between mb-2">
 <span className="font-medium">{student.studentId}</span>
 <Badge variant="destructive">
 {student.priority === 'critical' ? 'Kritik' : 'Yüksek'}
 </Badge>
 </div>
 {student.challenges.length > 0 && (
 <div className="flex gap-2 flex-wrap">
 {student.challenges.slice(0, 3).map((challenge, idx) => (
 <Badge key={idx} variant="outline" className="text-xs">
 {challenge}
 </Badge>
 ))}
 </div>
 )}
 </div>
 ))}
 </div>
 </CardContent>
 </Card>
 )}

 {/* Average Scores */}
 <Card>
 <CardHeader>
 <CardTitle className="text-lg">Ortalama Skorlar</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div>
 <p className="text-sm text-gray-500">Akademik</p>
 <p className="text-xl font-bold text-blue-600">{summary.averageScores.academic}</p>
 </div>
 <div>
 <p className="text-sm text-gray-500">Sosyal-Duygusal</p>
 <p className="text-xl font-bold text-green-600">{summary.averageScores.socialEmotional}</p>
 </div>
 <div>
 <p className="text-sm text-gray-500">Davranışsal</p>
 <p className="text-xl font-bold text-orange-600">{summary.averageScores.behavioral}</p>
 </div>
 <div>
 <p className="text-sm text-gray-500">Motivasyon</p>
 <p className="text-xl font-bold text-purple-600">{summary.averageScores.motivation}</p>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
