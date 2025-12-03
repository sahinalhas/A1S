import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';

interface ProgressTimelineProps {
 data: Array<{
 subject: string;
 current: number;
 target: number;
 improvement: number;
 }>;
 title?: string;
}

export function ProgressTimeline({ data, title = 'Akademik İlerleme Durumu' }: ProgressTimelineProps) {
 const colors = {
 current: '#8b5cf6',
 target: '#10b981',
 improvement: '#f59e0b'
 };

 return (
 <Card>
 <CardHeader>
 <CardTitle>{title}</CardTitle>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={350}>
 <BarChart data={data} layout="vertical">
 <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
 <XAxis type="number" domain={[0, 100]} stroke="#6b7280" style={{ fontSize: '12px' }} />
 <YAxis dataKey="subject" type="category" stroke="#6b7280" style={{ fontSize: '12px' }} width={100} />
 <Tooltip 
 contentStyle={{ 
 backgroundColor: '#fff', 
 border: '1px solid #e5e7eb',
 borderRadius: '8px',
 fontSize: '12px'
 }}
 />
 <Legend wrapperStyle={{ fontSize: '12px' }} />
 <Bar dataKey="current" name="Mevcut" fill={colors.current} radius={[0, 4, 4, 0]} />
 <Bar dataKey="target" name="Hedef" fill={colors.target} radius={[0, 4, 4, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 );
}
