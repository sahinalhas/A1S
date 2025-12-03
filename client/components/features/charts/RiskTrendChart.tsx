import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';

interface RiskTrendChartProps {
 data: Array<{
 date: string;
 score: number;
 level: string;
 }>;
 title?: string;
}

export function RiskTrendChart({ data, title = 'Risk Skoru Trendi' }: RiskTrendChartProps) {
 const chartData = data.map(item => ({
 date: new Date(item.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
 'Risk Skoru': (item.score * 100).toFixed(0),
 level: item.level
 }));

 const getLevelColor = (level: string) => {
 switch (level) {
 case 'DÜŞÜK': return '#10b981';
 case 'ORTA': return '#f59e0b';
 case 'YÜKSEK': return '#f97316';
 case 'KRİTİK': return '#ef4444';
 default: return '#6b7280';
 }
 };

 return (
 <Card>
 <CardHeader>
 <CardTitle>{title}</CardTitle>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={300}>
 <AreaChart data={chartData}>
 <defs>
 <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
 <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
 <XAxis 
 dataKey="date" 
 stroke="#6b7280"
 style={{ fontSize: '12px' }}
 />
 <YAxis 
 stroke="#6b7280"
 style={{ fontSize: '12px' }}
 domain={[0, 100]}
 />
 <Tooltip 
 contentStyle={{ 
 backgroundColor: '#fff', 
 border: '1px solid #e5e7eb',
 borderRadius: '8px',
 fontSize: '12px'
 }}
 />
 <Legend 
 wrapperStyle={{ fontSize: '12px' }}
 />
 <Area 
 type="monotone" 
 dataKey="Risk Skoru" 
 stroke="#8b5cf6" 
 fillOpacity={1} 
 fill="url(#colorRisk)" 
 strokeWidth={2}
 />
 </AreaChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 );
}
