import { Users, UserCheck, UserX, AlertTriangle } from 'lucide-react';
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
 title: 'Düşük Risk',
 value: stats.lowRisk,
 subtitle: `${stats.total > 0 ? ((stats.lowRisk / stats.total) * 100).toFixed(1) : 0}% öğrenci`,
 icon: UserCheck,
 gradient: MODERN_GRADIENTS.green,
 },
 {
 title: 'Orta Risk',
 value: stats.mediumRisk,
 subtitle: `${stats.total > 0 ? ((stats.mediumRisk / stats.total) * 100).toFixed(1) : 0}% öğrenci`,
 icon: AlertTriangle,
 gradient: MODERN_GRADIENTS.amber,
 },
 {
 title: 'Yüksek Risk',
 value: stats.highRisk,
 subtitle: `${stats.total > 0 ? ((stats.highRisk / stats.total) * 100).toFixed(1) : 0}% öğrenci`,
 icon: UserX,
 gradient: MODERN_GRADIENTS.rose,
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
