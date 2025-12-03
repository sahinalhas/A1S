import { Card, CardContent, CardHeader, CardTitle } from '@/components/organisms/Card';
import { cn } from '@/lib/utils';

interface AttendanceHeatmapProps {
 data: Array<{
 date: string;
 status: 'present' | 'absent' | 'late' | 'excused';
 }>;
 title?: string;
}

export function AttendanceHeatmap({ data, title = 'Devam Durumu Haritası' }: AttendanceHeatmapProps) {
 const getColor = (status: string) => {
 switch (status) {
 case 'present': return 'bg-green-500';
 case 'absent': return 'bg-red-500';
 case 'late': return 'bg-yellow-500';
 case 'excused': return 'bg-blue-500';
 default: return 'bg-gray-200';
 }
 };

 const getLabel = (status: string) => {
 switch (status) {
 case 'present': return 'Geldi';
 case 'absent': return 'Gelmedi';
 case 'late': return 'Geç';
 case 'excused': return 'Mazeret';
 default: return '';
 }
 };

 const weeks = [];
 for (let i = 0; i < data.length; i += 7) {
 weeks.push(data.slice(i, i + 7));
 }

 return (
 <Card>
 <CardHeader>
 <CardTitle>{title}</CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 <div className="flex flex-wrap gap-1">
 {weeks.map((week, weekIndex) => (
 <div key={weekIndex} className="flex flex-col gap-1">
 {week.map((day, dayIndex) => (
 <div
 key={dayIndex}
 className={cn(
 'w-8 h-8 rounded flex items-center justify-center',
 getColor(day.status)
 )}
 title={`${new Date(day.date).toLocaleDateString('tr-TR')} - ${getLabel(day.status)}`}
 >
 <span className="text-xs text-white font-medium">
 {new Date(day.date).getDate()}
 </span>
 </div>
 ))}
 </div>
 ))}
 </div>

 <div className="flex gap-4 text-xs">
 <div className="flex items-center gap-1">
 <div className="w-4 h-4 bg-green-500 rounded"></div>
 <span>Geldi</span>
 </div>
 <div className="flex items-center gap-1">
 <div className="w-4 h-4 bg-red-500 rounded"></div>
 <span>Gelmedi</span>
 </div>
 <div className="flex items-center gap-1">
 <div className="w-4 h-4 bg-yellow-500 rounded"></div>
 <span>Geç</span>
 </div>
 <div className="flex items-center gap-1">
 <div className="w-4 h-4 bg-blue-500 rounded"></div>
 <span>Mazeret</span>
 </div>
 </div>
 </div>
 </CardContent>
 </Card>
 );
}
