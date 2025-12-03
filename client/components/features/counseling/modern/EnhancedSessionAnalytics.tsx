import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/organisms/Card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SessionStats } from '@/hooks/features/counseling/session-stats.hooks';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Clock } from 'lucide-react';

interface EnhancedSessionAnalyticsProps {
 stats: SessionStats;
}

const COLORS = {
 individual: '#3b82f6',
 group: '#8b5cf6',
 active: '#f59e0b',
 completed: '#10b981',
};

export default function EnhancedSessionAnalytics({ stats }: EnhancedSessionAnalyticsProps) {
 const typeData = [
 { name: 'Bireysel', value: stats.individual, color: COLORS.individual },
 { name: 'Grup', value: stats.group, color: COLORS.group },
 ].filter(item => item.value > 0);

 const statusData = [
 { name: 'Aktif', value: stats.active, color: COLORS.active },
 { name: 'Tamamlandı', value: stats.completed, color: COLORS.completed },
 ].filter(item => item.value > 0);

 const modeData = Object.entries(stats.sessionsByMode).map(([mode, count]) => ({
 name: mode,
 count,
 }));

 const weeklyData = [
 { name: 'Bu Hafta', value: stats.completedThisWeek },
 { name: 'Bu Ay', value: stats.completedThisMonth },
 ];

 return (
 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
 <Card>
 <CardHeader>
 <CardTitle className="text-base flex items-center gap-2">
 <PieChartIcon className="h-5 w-5 text-blue-600" />
 Görüşme Tipleri
 </CardTitle>
 <CardDescription>Bireysel ve grup dağılımı</CardDescription>
 </CardHeader>
 <CardContent>
 {typeData.length > 0 ? (
 <ResponsiveContainer width="100%" height={250}>
 <PieChart>
 <Pie
 data={typeData}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
 outerRadius={80}
 fill="#8884d8"
 dataKey="value"
 >
 {typeData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip />
 </PieChart>
 </ResponsiveContainer>
 ) : (
 <div className="h-[250px] flex items-center justify-center text-muted-foreground">
 Veri yok
 </div>
 )}
 </CardContent>
 </Card>

 <Card>
 <CardHeader>
 <CardTitle className="text-base flex items-center gap-2">
 <PieChartIcon className="h-5 w-5 text-green-600" />
 Durum Dağılımı
 </CardTitle>
 <CardDescription>Aktif ve tamamlanan görüşmeler</CardDescription>
 </CardHeader>
 <CardContent>
 {statusData.length > 0 ? (
 <ResponsiveContainer width="100%" height={250}>
 <PieChart>
 <Pie
 data={statusData}
 cx="50%"
 cy="50%"
 labelLine={false}
 label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
 outerRadius={80}
 fill="#8884d8"
 dataKey="value"
 >
 {statusData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip />
 </PieChart>
 </ResponsiveContainer>
 ) : (
 <div className="h-[250px] flex items-center justify-center text-muted-foreground">
 Veri yok
 </div>
 )}
 </CardContent>
 </Card>

 {modeData.length > 0 && (
 <Card>
 <CardHeader>
 <CardTitle className="text-base flex items-center gap-2">
 <BarChart3 className="h-5 w-5 text-purple-600" />
 Görüşme Modları
 </CardTitle>
 <CardDescription>Yüz yüze, online ve diğer</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={250}>
 <BarChart data={modeData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" />
 <YAxis />
 <Tooltip />
 <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 )}

 <Card>
 <CardHeader>
 <CardTitle className="text-base flex items-center gap-2">
 <TrendingUp className="h-5 w-5 text-blue-600" />
 Haftalık & Aylık Trend
 </CardTitle>
 <CardDescription>Tamamlanan görüşmeler</CardDescription>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={250}>
 <LineChart data={weeklyData}>
 <CartesianGrid strokeDasharray="3 3" />
 <XAxis dataKey="name" />
 <YAxis />
 <Tooltip />
 <Legend />
 <Line 
 type="monotone" 
 dataKey="value" 
 stroke="#10b981" 
 strokeWidth={2}
 dot={{ fill: '#10b981', r: 5 }}
 activeDot={{ r: 7 }}
 name="Görüşme Sayısı"
 />
 </LineChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>

 <Card className="md:col-span-2">
 <CardHeader>
 <CardTitle className="text-base flex items-center gap-2">
 <Clock className="h-5 w-5 text-amber-600" />
 Süre Analizi
 </CardTitle>
 <CardDescription>Ortalama ve toplam görüşme süreleri</CardDescription>
 </CardHeader>
 <CardContent>
 <div className="grid gap-4 md:grid-cols-3">
 <div className="flex flex-col items-center justify-center p-6 rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100">
 <div className="text-3xl font-bold text-blue-900">
 {stats.averageDuration}
 </div>
 <div className="text-sm text-blue-700 mt-1">Ortalama Süre (dk)</div>
 </div>
 <div className="flex flex-col items-center justify-center p-6 rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100">
 <div className="text-3xl font-bold text-purple-900">
 {Math.floor(stats.totalDuration / 60)}s {stats.totalDuration % 60}dk
 </div>
 <div className="text-sm text-purple-700 mt-1">Toplam Süre</div>
 </div>
 <div className="flex flex-col items-center justify-center p-6 rounded-lg border bg-gradient-to-br from-green-50 to-green-100">
 <div className="text-3xl font-bold text-green-900 capitalize">
 {stats.mostActiveDay}
 </div>
 <div className="text-sm text-green-700 mt-1">En Aktif Gün</div>
 </div>
 </div>
 </CardContent>
 </Card>
 </div>
 );
}
