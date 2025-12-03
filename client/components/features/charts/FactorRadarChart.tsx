import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';

interface FactorRadarChartProps {
 factorScores: {
 academic: number;
 behavioral: number;
 attendance: number;
 socialEmotional: number;
 familySupport: number;
 peerRelations: number;
 motivation: number;
 health: number;
 };
 title?: string;
}

export function FactorRadarChart({ factorScores, title = 'Risk Faktörleri Analizi' }: FactorRadarChartProps) {
 const chartData = [
 { factor: 'Akademik', value: factorScores.academic * 100, fullMark: 100 },
 { factor: 'Davranış', value: factorScores.behavioral * 100, fullMark: 100 },
 { factor: 'Devam', value: factorScores.attendance * 100, fullMark: 100 },
 { factor: 'Sosyal-Duygusal', value: factorScores.socialEmotional * 100, fullMark: 100 },
 { factor: 'Aile', value: factorScores.familySupport * 100, fullMark: 100 },
 { factor: 'Akran', value: factorScores.peerRelations * 100, fullMark: 100 },
 { factor: 'Motivasyon', value: factorScores.motivation * 100, fullMark: 100 },
 { factor: 'Sağlık', value: factorScores.health * 100, fullMark: 100 },
 ];

 return (
 <Card>
 <CardHeader>
 <CardTitle>{title}</CardTitle>
 </CardHeader>
 <CardContent>
 <ResponsiveContainer width="100%" height={400}>
 <RadarChart data={chartData}>
 <PolarGrid stroke="#e5e7eb" />
 <PolarAngleAxis 
 dataKey="factor" 
 stroke="#6b7280"
 style={{ fontSize: '12px' }}
 />
 <PolarRadiusAxis 
 angle={90} 
 domain={[0, 100]}
 stroke="#6b7280"
 style={{ fontSize: '10px' }}
 />
 <Radar 
 name="Risk Seviyesi" 
 dataKey="value" 
 stroke="#8b5cf6" 
 fill="#8b5cf6" 
 fillOpacity={0.6}
 strokeWidth={2}
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
 </RadarChart>
 </ResponsiveContainer>
 </CardContent>
 </Card>
 );
}
