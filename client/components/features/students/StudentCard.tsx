import { Card, CardContent } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Checkbox } from '@/components/atoms/Checkbox';
import { Eye, Pencil, Trash2, User, GraduationCap, AlertTriangle, ArrowRight, Heart, Target, BookOpen, Calendar } from 'lucide-react';
import type { Student } from '@/lib/storage';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface StudentCardProps {
 student: Student;
 isSelected?: boolean;
 onSelect?: (selected: boolean) => void;
 onEdit?: (student: Student) => void;
 onDelete?: (student: Student) => void;
 onView?: (student: Student) => void;
}

export function StudentCard({
 student,
 isSelected = false,
 onSelect,
 onEdit,
 onDelete,
 onView,
}: StudentCardProps) {
 const getRiskConfig = (risk?: string) => {
 switch (risk) {
 case 'Yüksek':
 return {
 gradient: 'from-red-500/10 to-red-600/5',
 border: 'border-red-500/20',
 glow: 'shadow-red-500/10',
 badge: 'bg-red-500/10 text-red-700 border-red-500/20',
 icon: 'text-red-600'
 };
 case 'Orta':
 return {
 gradient: 'from-amber-500/10 to-orange-600/5',
 border: 'border-amber-500/20',
 glow: 'shadow-amber-500/10',
 badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
 icon: 'text-amber-600'
 };
 default:
 return {
 gradient: 'from-emerald-500/10 to-teal-600/5',
 border: 'border-emerald-500/20',
 glow: 'shadow-emerald-500/10',
 badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
 icon: 'text-emerald-600'
 };
 }
 };

 const riskConfig = getRiskConfig(student.risk);

 return (
 <Card
 className={`
 group relative overflow-hidden border-2 backdrop-blur-xl bg-gradient-to-br ${riskConfig.gradient}
 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 ${riskConfig.border} ${riskConfig.glow}
 ${isSelected ? 'ring-2 ring-primary ring-offset-2 shadow-xl scale-[1.02]' : ''}
 cursor-pointer
 `}
 onClick={() => onView?.(student)}
 >
 {/* Animated background overlay */}
 <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/20 to-transparent dark:from-white/10 dark:via-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
 
 {/* Shine effect */}
 <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
 
 <CardContent className="p-5 md:p-6 relative">
 <div className="space-y-4">
 {/* Header Section */}
 <div className="flex items-start justify-between">
 <div className="flex items-start gap-3 flex-1 min-w-0">
 {onSelect && (
 <Checkbox
 checked={isSelected}
 onCheckedChange={(checked) => {
 onSelect(checked as boolean);
 }}
 onClick={(e) => e.stopPropagation()}
 className="mt-2 flex-shrink-0 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
 />
 )}
 <div className="flex-1 min-w-0">
 <div className="flex items-center gap-3 mb-2">
 <div className={`rounded-full bg-gradient-to-br from-violet-500 to-purple-600 p-2.5 shadow-lg ring-2 ring-violet-500/20`}>
 <User className="h-5 w-5 text-white" />
 </div>
 <div className="flex-1 min-w-0">
 <h3 className="font-bold text-lg md:text-xl truncate group-hover:text-primary transition-colors">
 {student.name} {student.surname}
 </h3>
 <div className="flex items-center gap-2 mt-0.5">
 <Badge variant="secondary" className="text-[10px] font-mono px-2 py-0.5">
 #{student.id}
 </Badge>
 </div>
 </div>
 </div>
 </div>
 </div>
 <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-12">
 <ArrowRight className="h-5 w-5 text-primary flex-shrink-0" />
 </div>
 </div>

 {/* Info Badges */}
 <div className="flex flex-wrap gap-2">
 <Badge variant="outline" className="text-xs border-violet-500/40 bg-violet-500/10 hover:bg-violet-500/20 transition-colors">
 <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
 {student.class}
 </Badge>
 <Badge variant="outline" className="text-xs border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 transition-colors">
 {student.gender === 'E' ? '👨 Erkek' : '👩 Kız'}
 </Badge>
 <Badge className={`text-xs border-2 font-medium ${riskConfig.badge} shadow-sm`}>
 <AlertTriangle className={`mr-1.5 h-3.5 w-3.5 ${riskConfig.icon}`} />
 {student.risk || 'Düşük'}
 </Badge>
 </div>

 {/* Action Buttons - Shortcuts */}
 <div className="flex gap-1.5 pt-2 border-t border-border/50">
 <Button
 asChild
 size="sm"
 className="flex-1 text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
 onClick={(e) => e.stopPropagation()}
 title="Profili Görüntüle"
 >
 <Link to={`/ogrenci/${student.id}`}>
 <Eye className="h-3.5 w-3.5" />
 </Link>
 </Button>

 <Button
 asChild
 size="sm"
 className="flex-1 text-xs h-9 bg-orange-600 hover:bg-orange-700 text-white shadow-sm"
 onClick={(e) => e.stopPropagation()}
 title="Kariyer Rehberliği"
 >
 <Link to={`/ogrenci/${student.id}?tab=career`}>
 <Target className="h-3.5 w-3.5" />
 </Link>
 </Button>

 <Button
 asChild
 size="sm"
 className="flex-1 text-xs h-9 bg-blue-500 hover:bg-blue-600 text-white shadow-sm"
 onClick={(e) => e.stopPropagation()}
 title="Çalışma Programı"
 >
 <Link to={`/ogrenci/${student.id}?tab=academic&subtab=calisma-programi`}>
 <Calendar className="h-3.5 w-3.5" />
 </Link>
 </Button>

 {onEdit && (
 <Button
 size="sm"
 variant="outline"
 onClick={(e) => {
 e.stopPropagation();
 onEdit(student);
 }}
 className="h-9 px-2.5 hover:bg-orange-500/10 hover:border-orange-500/50 hover:text-orange-600 transition-all"
 title="Düzenle"
 >
 <Pencil className="h-3.5 w-3.5" />
 </Button>
 )}
 {onDelete && (
 <Button
 size="sm"
 variant="outline"
 onClick={(e) => {
 e.stopPropagation();
 onDelete(student);
 }}
 className="h-9 px-2.5 text-destructive hover:bg-destructive/10 hover:border-destructive/50 transition-all"
 title="Sil"
 >
 <Trash2 className="h-3.5 w-3.5" />
 </Button>
 )}
 </div>
 </div>
 </CardContent>
 </Card>
 );
}
