import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/organisms/Card';
import { Badge } from '@/components/atoms/Badge';
import { StatsGrid, SkeletonCard } from '@/components/molecules/StatsGrid';
import { 
  FileText, 
  Users, 
  Target,
  Award
} from 'lucide-react';

interface ExamStatsCardsProps {
  stats: {
    totalSessions: number;
    totalStudents: number;
    avgParticipationRate: number;
    avgOverallSuccess: number;
    sessionsThisMonth: number;
    sessionsLastMonth: number;
    trend: 'up' | 'down' | 'stable';
  };
  isLoading?: boolean;
}

export default function ExamStatsCards({ stats, isLoading }: ExamStatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[120px] bg-muted rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  const getTrendText = () => {
    if (stats.trend === 'up') return '+↑';
    if (stats.trend === 'down') return '-↓';
    return '→';
  };

  const cards = [
    {
      title: 'Toplam Deneme',
      value: stats.totalSessions,
      description: `Bu ay: ${stats.sessionsThisMonth}`,
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-600',
      change: getTrendText(),
    },
    {
      title: 'Toplam Öğrenci',
      value: stats.totalStudents,
      description: 'Sistemde kayıtlı',
      icon: Users,
      gradient: 'from-purple-500 to-violet-600',
      change: `${stats.totalStudents}`,
    },
    {
      title: 'Katılım Oranı',
      value: `%${stats.avgParticipationRate.toFixed(1)}`,
      description: 'Ortalama katılım yüzdesi',
      icon: Target,
      gradient: 'from-emerald-500 to-teal-600',
      change: stats.avgParticipationRate >= 70 ? 'Yüksek' : 'Orta',
    },
    {
      title: 'Genel Başarı',
      value: `%${stats.avgOverallSuccess.toFixed(1)}`,
      description: 'Ortalama başarı oranı',
      icon: Award,
      gradient: 'from-amber-500 to-orange-600',
      change: stats.avgOverallSuccess >= 60 ? 'İyi' : 'Geliştirilmeli',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -3, scale: 1.01 }}
        >
          <Card className="relative overflow-hidden border hover:shadow-lg transition-all duration-300 backdrop-blur-sm bg-white/50 dark:bg-slate-900/50">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 hover:opacity-5 transition-opacity`}></div>
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <div className={`p-2 md:p-2.5 rounded-lg bg-gradient-to-br ${card.gradient} shadow-md`}>
                  <card.icon className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </div>
                <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 py-0.5">
                  {card.change}
                </Badge>
              </div>
              <div className="space-y-0.5">
                <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{card.title}</p>
                <p className="text-xl md:text-2xl font-bold tracking-tight">{card.value}</p>
                <p className="text-[10px] md:text-xs text-muted-foreground truncate">{card.description}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
