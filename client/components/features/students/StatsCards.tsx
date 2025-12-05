import { Users, UserCheck, CalendarPlus, GraduationCap } from 'lucide-react';
import { StatCard } from '@/components/molecules/StatCard';
import { StatsGrid, SkeletonCard } from '@/components/molecules/StatsGrid';
import { MODERN_GRADIENTS } from '@/lib/config/theme.config';
import type { StudentStats } from '@/hooks/utils/student-stats.utils';

interface StatsCardsProps {
 stats: StudentStats;
 isLoading?: boolean;
}

export function StatsCards({ stats, isLoading = false }: StatsCardsProps) {
 if (isLoading) {
 return (
 <StatsGrid columns={4}>
 {[0, 1, 2, 3].map((i) => (
 <SkeletonCard key={i} index={i} />
 ))}
 </StatsGrid>
 );
 }

 const mainStats = [
 {
 title: 'Toplam Öğrenci',
 value: stats.total,
 subtitle: `${stats.female} Kız, ${stats.male} Erkek`,
 icon: Users,
 gradient: MODERN_GRADIENTS.blue,
 },
 {
 title: 'Kız Öğrenci',
 value: stats.female,
 subtitle: `${stats.total > 0 ? ((stats.female / stats.total) * 100).toFixed(1) : 0}% öğrenci`,
 icon: UserCheck,
 gradient: MODERN_GRADIENTS.rose,
 },
 {
 title: 'Erkek Öğrenci',
 value: stats.male,
 subtitle: `${stats.total > 0 ? ((stats.male / stats.total) * 100).toFixed(1) : 0}% öğrenci`,
 icon: GraduationCap,
 gradient: MODERN_GRADIENTS.blue,
 },
 {
 title: 'Bu Ay Yeni',
 value: stats.newThisMonth,
 subtitle: `${stats.newThisWeek} bu hafta kayıt`,
 icon: CalendarPlus,
 gradient: MODERN_GRADIENTS.green,
 },
 ];

 return (
 <StatsGrid columns={4}>
 {mainStats.map((stat, index) => (
 <StatCard
 key={stat.title}
 title={stat.title}
 value={stat.value}
 subtitle={stat.subtitle}
 icon={stat.icon}
 gradient={stat.gradient}
 delay={index * 0.1}
 />
 ))}
 </StatsGrid>
 );
}
