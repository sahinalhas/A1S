import { useQuery } from "@tanstack/react-query";
import { format, subDays } from "date-fns";
import { tr } from "date-fns/locale/tr";
import { fetchWithSchool } from "@/lib/api/core/fetch-helpers";
import { useMemo } from "react";
import {
 LineChart,
 Line,
 BarChart,
 Bar,
 PieChart,
 Pie,
 Cell,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 Legend,
 ResponsiveContainer,
} from "recharts";
import { Users, Clock, Calendar, Timer, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/organisms/Card";
import { CHART_COLORS } from "@/lib/config/theme.config";
import type {
 OverallStats,
 TimeSeriesData,
 TopicAnalysis,
 ParticipantAnalysis,
 ClassAnalysis,
 SessionModeAnalysis,
} from "./types";

const PARTICIPANT_COLORS = [
 CHART_COLORS.primary,
 CHART_COLORS.success,
 CHART_COLORS.warning,
 CHART_COLORS.accent,
];

const MODE_COLORS = [
 CHART_COLORS.info,
 CHART_COLORS.success,
 CHART_COLORS.warning,
];

export default function SessionAnalytics() {
 const endDate = format(new Date(), 'yyyy-MM-dd');
 const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd');

 const { data: overallStats, isLoading: statsLoading } = useQuery<OverallStats>({
 queryKey: ['/api/counseling-sessions/analytics/overview'],
 queryFn: async () => {
 const response = await fetchWithSchool('/api/counseling-sessions/analytics/overview');
 if (!response.ok) throw new Error('Failed to fetch overview stats');
 return response.json();
 },
 staleTime: 2 * 60 * 1000,
 gcTime: 5 * 60 * 1000,
 });

 const { data: timeSeriesData, isLoading: timeSeriesLoading } = useQuery<TimeSeriesData[]>({
 queryKey: ['/api/counseling-sessions/analytics/time-series', startDate, endDate],
 queryFn: async () => {
 const response = await fetchWithSchool(
 `/api/counseling-sessions/analytics/time-series?period=daily&startDate=${startDate}&endDate=${endDate}`
 );
 if (!response.ok) throw new Error('Failed to fetch time series data');
 return response.json();
 },
 staleTime: 2 * 60 * 1000,
 gcTime: 5 * 60 * 1000,
 });

 const { data: topicData, isLoading: topicLoading } = useQuery<TopicAnalysis[]>({
 queryKey: ['/api/counseling-sessions/analytics/topics'],
 queryFn: async () => {
 const response = await fetchWithSchool('/api/counseling-sessions/analytics/topics');
 if (!response.ok) throw new Error('Failed to fetch topic data');
 return response.json();
 },
 staleTime: 1 * 60 * 1000,
 gcTime: 5 * 60 * 1000,
 });

 const { data: participantData, isLoading: participantLoading } = useQuery<ParticipantAnalysis[]>({
 queryKey: ['/api/counseling-sessions/analytics/participants'],
 queryFn: async () => {
 const response = await fetchWithSchool('/api/counseling-sessions/analytics/participants');
 if (!response.ok) throw new Error('Failed to fetch participant data');
 return response.json();
 },
 staleTime: 2 * 60 * 1000,
 gcTime: 5 * 60 * 1000,
 });

 const { data: classData, isLoading: classLoading } = useQuery<ClassAnalysis[]>({
 queryKey: ['/api/counseling-sessions/analytics/classes'],
 queryFn: async () => {
 const response = await fetchWithSchool('/api/counseling-sessions/analytics/classes');
 if (!response.ok) throw new Error('Failed to fetch class data');
 return response.json();
 },
 staleTime: 1 * 60 * 1000,
 gcTime: 5 * 60 * 1000,
 });

 const { data: modeData, isLoading: modeLoading } = useQuery<SessionModeAnalysis[]>({
 queryKey: ['/api/counseling-sessions/analytics/modes'],
 queryFn: async () => {
 const response = await fetchWithSchool('/api/counseling-sessions/analytics/modes');
 if (!response.ok) throw new Error('Failed to fetch mode data');
 return response.json();
 },
 staleTime: 2 * 60 * 1000,
 gcTime: 5 * 60 * 1000,
 });

 const topTopics = useMemo(() => {
 return (topicData || []).slice(0, 10);
 }, [topicData]);

 const formattedTimeSeriesData = useMemo(() => {
 const data = timeSeriesData || [];
 return data.map(item => ({
 ...item,
 date: format(new Date(item.date), 'dd MMM', { locale: tr }),
 }));
 }, [timeSeriesData]);

 const optimizedClassData = useMemo(() => 
 classData || []
 , [classData]);

 if (statsLoading || timeSeriesLoading || topicLoading || participantLoading || classLoading || modeLoading) {
 return (
 <div className="flex items-center justify-center h-64">
 <Loader2 className="h-8 w-8 text-muted-foreground" />
 </div>
 );
 }

 return (
 <div className="space-y-6">
 {/* İstatistik Kartları */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Toplam Görüşmeler</CardTitle>
 <Users className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{overallStats?.totalSessions || 0}</div>
 <p className="text-xs text-muted-foreground">
 Bireysel: %{overallStats?.individualPercentage.toFixed(0) || 0} | Grup: %{overallStats?.groupPercentage.toFixed(0) || 0}
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Aktif Görüşmeler</CardTitle>
 <Clock className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{overallStats?.activeSessions || 0}</div>
 <p className="text-xs text-muted-foreground">
 Tamamlanan: {overallStats?.completedSessions || 0}
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Bu Ay</CardTitle>
 <Calendar className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{overallStats?.thisMonthSessions || 0}</div>
 <p className="text-xs text-muted-foreground">
 Bu hafta: {overallStats?.thisWeekSessions || 0} | Bugün: {overallStats?.todaySessions || 0}
 </p>
 </CardContent>
 </Card>

 <Card>
 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
 <CardTitle className="text-sm font-medium">Ortalama Süre</CardTitle>
 <Timer className="h-4 w-4 text-muted-foreground" />
 </CardHeader>
 <CardContent>
 <div className="text-2xl font-bold">{overallStats?.avgDuration.toFixed(0) || 0} dk</div>
 <p className="text-xs text-muted-foreground">
 En uzun: {overallStats?.longestDuration || 0} dk | En kısa: {overallStats?.shortestDuration || 0} dk
 </p>
 </CardContent>
 </Card>
 </div>

 {/* Grafikler Grid */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {/* Zaman Serisi Grafiği */}
 <Card className="lg:col-span-2">
 <CardHeader>
 <CardTitle>Görüşme Trendi (Son 30 Gün)</CardTitle>
 </CardHeader>
 <CardContent>
 {formattedTimeSeriesData.length > 0 ? (
 <ResponsiveContainer width="100%" height={300}>
 <LineChart data={formattedTimeSeriesData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="date" />
 <YAxis />
 <Tooltip 
 formatter={(value: any, name: string) => {
 const labels: Record<string, string> = {
 count: 'Toplam',
 completed: 'Tamamlanan',
 active: 'Aktif',
 };
 return [value, labels[name] || name];
 }}
 />
 <Legend 
 formatter={(value: string) => {
 const labels: Record<string, string> = {
 count: 'Toplam',
 completed: 'Tamamlanan',
 active: 'Aktif',
 };
 return labels[value] || value;
 }}
 />
 <Line 
 type="monotone" 
 dataKey="count" 
 stroke={CHART_COLORS.primary} 
 strokeWidth={2}
 name="Toplam"
 />
 <Line 
 type="monotone" 
 dataKey="completed" 
 stroke={CHART_COLORS.success} 
 strokeWidth={2}
 name="Tamamlanan"
 />
 <Line 
 type="monotone" 
 dataKey="active" 
 stroke={CHART_COLORS.warning} 
 strokeWidth={2}
 name="Aktif"
 />
 </LineChart>
 </ResponsiveContainer>
 ) : (
 <div className="h-[300px] flex items-center justify-center text-muted-foreground">
 Veri bulunamadı
 </div>
 )}
 </CardContent>
 </Card>

 {/* Katılımcı Tipi Dağılımı */}
 <Card>
 <CardHeader>
 <CardTitle>Katılımcı Tipi Dağılımı</CardTitle>
 </CardHeader>
 <CardContent>
 {participantData && participantData.length > 0 ? (
 <ResponsiveContainer width="100%" height={250}>
 <PieChart>
 <Pie
 data={participantData}
 cx="50%"
 cy="50%"
 innerRadius={60}
 outerRadius={80}
 paddingAngle={5}
 dataKey="count"
 label={(entry) => `${entry.type} (${entry.percentage.toFixed(0)}%)`}
 >
 {participantData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length]} />
 ))}
 </Pie>
 <Tooltip 
 formatter={(value: any) => [`${value} görüşme`, 'Sayı']}
 />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 ) : (
 <div className="h-[250px] flex items-center justify-center text-muted-foreground">
 Veri bulunamadı
 </div>
 )}
 </CardContent>
 </Card>

 {/* Görüşme Şekli */}
 <Card>
 <CardHeader>
 <CardTitle>Görüşme Şekli</CardTitle>
 </CardHeader>
 <CardContent>
 {modeData && modeData.length > 0 ? (
 <ResponsiveContainer width="100%" height={250}>
 <PieChart>
 <Pie
 data={modeData}
 cx="50%"
 cy="50%"
 outerRadius={80}
 paddingAngle={5}
 dataKey="count"
 label={(entry) => `${entry.mode} (${entry.percentage.toFixed(0)}%)`}
 >
 {modeData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={MODE_COLORS[index % MODE_COLORS.length]} />
 ))}
 </Pie>
 <Tooltip 
 formatter={(value: any) => [`${value} görüşme`, 'Sayı']}
 />
 <Legend />
 </PieChart>
 </ResponsiveContainer>
 ) : (
 <div className="h-[250px] flex items-center justify-center text-muted-foreground">
 Veri bulunamadı
 </div>
 )}
 </CardContent>
 </Card>

 {/* Konu Analizi */}
 <Card className="lg:col-span-2">
 <CardHeader>
 <CardTitle>En Çok İşlenen Konular (Top 10)</CardTitle>
 </CardHeader>
 <CardContent>
 {topTopics.length > 0 ? (
 <ResponsiveContainer width="100%" height={400}>
 <BarChart 
 data={topTopics} 
 layout="vertical"
 margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
 >
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis type="number" />
 <YAxis 
 type="category" 
 dataKey="topic" 
 width={140}
 />
 <Tooltip 
 formatter={(value: any, name: string) => {
 if (name === 'count') return [value, 'Görüşme Sayısı'];
 if (name === 'avgDuration') return [`${value.toFixed(0)} dk`, 'Ort. Süre'];
 return [value, name];
 }}
 />
 <Legend 
 formatter={(value: string) => {
 if (value === 'count') return 'Görüşme Sayısı';
 if (value === 'avgDuration') return 'Ort. Süre (dk)';
 return value;
 }}
 />
 <Bar dataKey="count" fill={CHART_COLORS.primary} name="Görüşme Sayısı" />
 </BarChart>
 </ResponsiveContainer>
 ) : (
 <div className="h-[400px] flex items-center justify-center text-muted-foreground">
 Veri bulunamadı
 </div>
 )}
 </CardContent>
 </Card>

 {/* Sınıf Dağılımı */}
 <Card className="lg:col-span-2">
 <CardHeader>
 <CardTitle>Sınıf Dağılımı</CardTitle>
 </CardHeader>
 <CardContent>
 {optimizedClassData && optimizedClassData.length > 0 ? (
 <ResponsiveContainer width="100%" height={300}>
 <BarChart data={optimizedClassData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="className" />
 <YAxis />
 <Tooltip 
 formatter={(value: any) => [`${value} görüşme`, 'Sayı']}
 />
 <Legend 
 formatter={() => 'Görüşme Sayısı'}
 />
 <Bar dataKey="count" fill={CHART_COLORS.accent} name="Görüşme Sayısı" />
 </BarChart>
 </ResponsiveContainer>
 ) : (
 <div className="h-[300px] flex items-center justify-center text-muted-foreground">
 Veri bulunamadı
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 </div>
 );
}
