
/**
 * AI Context Provider
 * Provides page-specific AI actions and context with modal support
 */

import { createContext, useContext, useMemo, ReactNode, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Brain, MessageSquare, FileText, TrendingUp, Users, 
  AlertTriangle, Sparkles, Target, Mail, Calendar,
  Shield, BarChart3, ClipboardList, Lightbulb,
  GraduationCap, Heart, UserCircle, Edit, Zap
} from 'lucide-react';
import { toast } from 'sonner';

export interface AIAction {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  onClick: () => void;
  disabled?: boolean;
  modalType?: 'intervention' | 'report' | 'parent-comm' | 'risk' | 'chat' | 'navigate';
}

export interface StudentContext {
  id: string;
  name: string;
}

interface AIContextValue {
  contextActions: AIAction[];
  generalActions: AIAction[];
  currentContext: string;
  studentContext: StudentContext | null;
  setStudentContext: (context: StudentContext | null) => void;
}

const AIContext = createContext<AIContextValue | null>(null);

export function useAIContext() {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIContext must be used within AIContextProvider');
  }
  return context;
}

interface AIContextProviderProps {
  children: ReactNode;
}

export function AIContextProvider({ children }: AIContextProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [manualStudentContext, setManualStudentContext] = useState<StudentContext | null>(null);

  const setStudentContext = useCallback((context: StudentContext | null) => {
    setManualStudentContext(context);
  }, []);

  const { contextActions, currentContext, studentContext } = useMemo(() => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const studentIdFromPath = path.match(/\/ogrenci\/([^/]+)/)?.[1];
    const studentIdFromQuery = searchParams.get('student');
    const studentId = studentIdFromPath || studentIdFromQuery || manualStudentContext?.id;
    
    let detectedStudentContext: StudentContext | null = manualStudentContext;
    
    if (studentIdFromPath && !manualStudentContext) {
      detectedStudentContext = { id: studentIdFromPath, name: 'Öğrenci' };
    }

    // Student Profile Context
    if (path.includes('/ogrenci/') && studentId) {
      return {
        currentContext: 'Öğrenci Profili',
        studentContext: detectedStudentContext,
        contextActions: [
          {
            id: 'risk-analysis',
            icon: Shield,
            label: 'Risk Analizi',
            description: 'Öğrencinin risk faktörlerini AI ile analiz et',
            badge: 'Popüler',
            badgeVariant: 'secondary' as const,
            onClick: () => {},
            modalType: 'risk' as const,
          },
          {
            id: 'intervention-plan',
            icon: Target,
            label: 'Müdahale Planı',
            description: 'Kanıta dayalı müdahale planı oluştur',
            badge: 'AI',
            onClick: () => {},
            modalType: 'intervention' as const,
          },
          {
            id: 'auto-report',
            icon: FileText,
            label: 'Otomatik Rapor',
            description: 'Gelişim, RAM veya BEP raporu oluştur',
            onClick: () => {},
            modalType: 'report' as const,
          },
          {
            id: 'parent-letter',
            icon: Mail,
            label: 'Veli Mektubu',
            description: 'AI destekli veli iletişim mektubu hazırla',
            onClick: () => {},
            modalType: 'parent-comm' as const,
          },
          {
            id: 'ai-chat',
            icon: MessageSquare,
            label: 'AI ile Konuş',
            description: 'Bu öğrenci hakkında AI ile sohbet et',
            onClick: () => {},
            modalType: 'chat' as const,
          },
        ],
      };
    }

    // Students List Context
    if (path === '/ogrenci') {
      return {
        currentContext: 'Öğrenci Listesi',
        studentContext: null,
        contextActions: [
          {
            id: 'priority-students',
            icon: Users,
            label: 'Öncelikli Öğrenciler',
            description: 'AI ile öncelikli öğrencileri belirle',
            badge: 'Hızlı',
            onClick: () => navigate('/ai-araclari?tab=risk'),
            modalType: 'navigate' as const,
          },
          {
            id: 'class-comparison',
            icon: TrendingUp,
            label: 'Sınıf Karşılaştırma',
            description: 'Sınıflar arası AI destekli karşılaştırma',
            onClick: () => navigate('/ai-araclari?tab=gunluk'),
            modalType: 'navigate' as const,
          },
          {
            id: 'bulk-analysis',
            icon: Brain,
            label: 'Toplu Analiz',
            description: 'Seçili öğrenciler için toplu analiz',
            onClick: () => navigate('/ai-araclari?tab=ai-asistan'),
            modalType: 'navigate' as const,
          },
        ],
      };
    }

    // Counseling Sessions Context
    if (path === '/gorusmeler') {
      const hasStudent = !!manualStudentContext;
      return {
        currentContext: hasStudent ? `Görüşme - ${manualStudentContext?.name}` : 'Görüşme Yönetimi',
        studentContext: manualStudentContext,
        contextActions: hasStudent ? [
          {
            id: 'risk-analysis',
            icon: Shield,
            label: 'Risk Analizi',
            description: `${manualStudentContext?.name} için risk değerlendirmesi`,
            badge: 'AI',
            onClick: () => {},
            modalType: 'risk' as const,
          },
          {
            id: 'intervention-plan',
            icon: Target,
            label: 'Müdahale Planı',
            description: 'Görüşmeye dayalı müdahale planı oluştur',
            onClick: () => {},
            modalType: 'intervention' as const,
          },
          {
            id: 'session-notes-ai',
            icon: FileText,
            label: 'Not Özeti',
            description: 'Görüşme notlarını AI ile özetle',
            onClick: () => {},
            modalType: 'chat' as const,
          },
          {
            id: 'parent-comm-session',
            icon: Mail,
            label: 'Veli Mesajı',
            description: 'Görüşme sonrası veli bilgilendirmesi hazırla',
            onClick: () => {},
            modalType: 'parent-comm' as const,
          },
        ] : [
          {
            id: 'session-summary',
            icon: FileText,
            label: 'Oturum Özeti',
            description: 'Son görüşmeni AI ile özetle',
            onClick: () => toast.info('Bir görüşme seçerek AI özelliklerine erişebilirsiniz'),
            modalType: 'navigate' as const,
          },
          {
            id: 'meeting-prep',
            icon: Calendar,
            label: 'Görüşme Hazırlığı',
            description: 'Veli/öğretmen görüşmesi için AI brifingi',
            onClick: () => {},
            modalType: 'chat' as const,
          },
          {
            id: 'intervention-tracking',
            icon: Target,
            label: 'Müdahale Takibi',
            description: 'Aktif müdahale planlarını görüntüle',
            onClick: () => navigate('/mudahale-takip'),
            modalType: 'navigate' as const,
          },
        ],
      };
    }

    // Exams Context
    if (path === '/olcme-degerlendirme' || path === '/sinavlar') {
      return {
        currentContext: 'Ölçme Değerlendirme',
        studentContext: null,
        contextActions: [
          {
            id: 'performance-analysis',
            icon: TrendingUp,
            label: 'Performans Analizi',
            description: 'Sınav performansını AI ile değerlendir',
            onClick: () => navigate('/ai-araclari?tab=ai-asistan'),
            modalType: 'navigate' as const,
          },
          {
            id: 'weak-topics',
            icon: AlertTriangle,
            label: 'Zayıf Konular',
            description: 'Zayıf konuları tespit et ve öneriler al',
            badge: 'Yeni',
            badgeVariant: 'secondary' as const,
            onClick: () => navigate('/ai-araclari?tab=ai-asistan'),
            modalType: 'navigate' as const,
          },
          {
            id: 'class-insights',
            icon: BarChart3,
            label: 'Sınıf İçgörüleri',
            description: 'Sınıf bazlı performans analizi',
            onClick: () => navigate('/ai-araclari?tab=gunluk'),
            modalType: 'navigate' as const,
          },
        ],
      };
    }

    // Surveys Context
    if (path === '/anketler') {
      return {
        currentContext: 'Anket Yönetimi',
        studentContext: null,
        contextActions: [
          {
            id: 'survey-analysis',
            icon: Brain,
            label: 'Anket Analizi',
            description: 'Anket sonuçlarını AI ile analiz et',
            badge: 'AI',
            onClick: () => toast.info('Anket listesinden bir anket seçerek AI analizi başlatabilirsiniz'),
            modalType: 'navigate' as const,
          },
          {
            id: 'survey-insights',
            icon: Lightbulb,
            label: 'Anket İçgörüleri',
            description: 'Tüm anket verilerinden içgörüler çıkar',
            onClick: () => navigate('/ai-araclari?tab=gunluk'),
            modalType: 'navigate' as const,
          },
          {
            id: 'survey-comparison',
            icon: BarChart3,
            label: 'Anket Karşılaştırma',
            description: 'Farklı anketlerin sonuçlarını karşılaştır',
            badge: 'Yeni',
            badgeVariant: 'secondary' as const,
            onClick: () => navigate('/ai-araclari?tab=ai-asistan'),
            modalType: 'navigate' as const,
          },
          {
            id: 'survey-recommendations',
            icon: Target,
            label: 'Öneriler Oluştur',
            description: 'Anket sonuçlarına göre aksiyon önerileri',
            onClick: () => {},
            modalType: 'chat' as const,
          },
        ],
      };
    }

    // Reports Context
    if (path === '/raporlar') {
      return {
        currentContext: 'Raporlar',
        studentContext: null,
        contextActions: [
          {
            id: 'ai-insights',
            icon: Sparkles,
            label: 'AI İçgörüleri',
            description: 'Raporlardan AI destekli içgörüler',
            onClick: () => navigate('/ai-araclari?tab=gunluk'),
            modalType: 'navigate' as const,
          },
          {
            id: 'trend-analysis',
            icon: TrendingUp,
            label: 'Trend Analizi',
            description: 'Okul genelinde trend analizi',
            onClick: () => navigate('/ai-araclari?tab=ai-asistan'),
            modalType: 'navigate' as const,
          },
        ],
      };
    }

    // AI Tools Page
    if (path === '/ai-araclari') {
      return {
        currentContext: 'AI Araçları',
        studentContext: null,
        contextActions: [],
      };
    }

    // Risk Dashboard
    if (path === '/risk') {
      return {
        currentContext: 'Risk Takibi',
        studentContext: null,
        contextActions: [
          {
            id: 'critical-alerts',
            icon: AlertTriangle,
            label: 'Kritik Uyarılar',
            description: 'Acil müdahale gerektiren durumlar',
            badge: 'Acil',
            badgeVariant: 'destructive' as const,
            onClick: () => navigate('/ai-araclari?tab=risk'),
            modalType: 'navigate' as const,
          },
        ],
      };
    }

    // Intervention Tracking
    if (path === '/mudahale-takip') {
      return {
        currentContext: 'Müdahale Takibi',
        studentContext: null,
        contextActions: [
          {
            id: 'active-interventions',
            icon: Target,
            label: 'Aktif Müdahaleler',
            description: 'Devam eden müdahale planları',
            onClick: () => {},
            modalType: 'chat' as const,
          },
          {
            id: 'intervention-summary',
            icon: ClipboardList,
            label: 'Müdahale Özeti',
            description: 'Tüm müdahalelerin AI özeti',
            onClick: () => navigate('/ai-araclari?tab=gunluk'),
            modalType: 'navigate' as const,
          },
        ],
      };
    }

    // Parent Access Context
    if (path === '/veli-erisim') {
      return {
        currentContext: 'Veli Erişim',
        studentContext: detectedStudentContext,
        contextActions: [
          {
            id: 'parent-message-generator',
            icon: Mail,
            label: 'Veli Mesajı Oluştur',
            description: 'AI ile kişiselleştirilmiş veli mesajı hazırla',
            badge: 'AI',
            onClick: () => {},
            modalType: 'parent-comm' as const,
          },
          {
            id: 'parent-meeting-prep',
            icon: Calendar,
            label: 'Görüşme Hazırlığı',
            description: 'Veli görüşmesi için AI brifingi',
            onClick: () => {},
            modalType: 'chat' as const,
          },
          {
            id: 'communication-insights',
            icon: TrendingUp,
            label: 'İletişim Analizi',
            description: 'Veli iletişim kalıplarını analiz et',
            onClick: () => navigate('/ai-araclari?tab=gunluk'),
            modalType: 'navigate' as const,
          },
        ],
      };
    }

    // School Dashboard Context
    if (path === '/okul-dashboard') {
      return {
        currentContext: 'Okul Dashboard',
        studentContext: null,
        contextActions: [
          {
            id: 'trend-prediction',
            icon: TrendingUp,
            label: 'Trend Tahmini',
            description: 'Gelecek dönem için tahminler',
            onClick: () => navigate('/ai-araclari?tab=ai-asistan'),
            modalType: 'navigate' as const,
          },
          {
            id: 'priority-students-dashboard',
            icon: AlertTriangle,
            label: 'Öncelikli Durumlar',
            description: 'Acil dikkat gerektiren öğrenciler',
            badge: 'Kritik',
            badgeVariant: 'destructive' as const,
            onClick: () => navigate('/ai-araclari?tab=risk'),
            modalType: 'navigate' as const,
          },
        ],
      };
    }

    // Notifications Context
    if (path === '/bildirimler') {
      return {
        currentContext: 'Bildirimler',
        studentContext: null,
        contextActions: [
          {
            id: 'notification-summary',
            icon: Sparkles,
            label: 'Bildirim Özeti',
            description: 'Günlük bildirimlerin AI özeti',
            onClick: () => {},
            modalType: 'chat' as const,
          },
          {
            id: 'priority-actions',
            icon: Target,
            label: 'Öncelikli Eylemler',
            description: 'Bugün yapılması gereken eylemler',
            onClick: () => navigate('/ai-araclari?tab=gunluk'),
            modalType: 'navigate' as const,
          },
        ],
      };
    }

    // Content Management Context
    if (path === '/icerik-yonetimi') {
      return {
        currentContext: 'İçerik Yönetimi',
        studentContext: null,
        contextActions: [
          {
            id: 'content-suggestions',
            icon: Lightbulb,
            label: 'İçerik Önerileri',
            description: 'AI destekli rehberlik içerik önerileri',
            onClick: () => {},
            modalType: 'chat' as const,
          },
          {
            id: 'topic-analysis',
            icon: Brain,
            label: 'Konu Analizi',
            description: 'Popüler konuları analiz et',
            onClick: () => navigate('/ai-araclari?tab=gunluk'),
            modalType: 'navigate' as const,
          },
        ],
      };
    }

    // Settings Context - AI Settings specific
    if (path === '/ayarlar') {
      return {
        currentContext: 'Ayarlar',
        studentContext: null,
        contextActions: [
          {
            id: 'ai-config-help',
            icon: Brain,
            label: 'AI Yapılandırma Yardımı',
            description: 'AI ayarları hakkında yardım al',
            onClick: () => {},
            modalType: 'chat' as const,
          },
        ],
      };
    }

    // Statistics Context
    if (path === '/istatistik') {
      return {
        currentContext: 'İstatistikler',
        studentContext: null,
        contextActions: [
          {
            id: 'stats-analysis',
            icon: BarChart3,
            label: 'İstatistik Analizi',
            description: 'Verilerin AI destekli analizi',
            onClick: () => {},
            modalType: 'chat' as const,
          },
          {
            id: 'trend-insights',
            icon: TrendingUp,
            label: 'Trend İçgörüleri',
            description: 'Eğilimleri ve desenleri analiz et',
            onClick: () => navigate('/ai-araclari?tab=ai-asistan'),
            modalType: 'navigate' as const,
          },
        ],
      };
    }

    // AI Assistant Page
    if (path === '/ai-asistan') {
      return {
        currentContext: 'AI Asistan',
        studentContext: null,
        contextActions: [
          {
            id: 'ai-chat-main',
            icon: MessageSquare,
            label: 'Sohbet',
            description: 'AI ile derinlemesine sohbet',
            badge: 'Aktif',
            onClick: () => {},
            modalType: 'chat' as const,
          },
          {
            id: 'ai-tools-explore',
            icon: Brain,
            label: 'Tüm Araçları Keşfet',
            description: 'Tüm AI araçlarına erişin',
            onClick: () => navigate('/ai-araclari'),
            modalType: 'navigate' as const,
          },
        ],
      };
    }

    // Günlük (merged: AI Insights + Daily Plan)
    if (path.includes('gunluk') || path.includes('ai-insights') || path.includes('gunluk-plan')) {
      return {
        currentContext: 'Günlük İçgörüler ve Plan',
        studentContext: null,
        contextActions: [
          {
            id: 'insights-help',
            icon: Lightbulb,
            label: 'İçgörü Rehberi',
            description: 'İçgörüleri nasıl kullanacağınızı öğrenin',
            onClick: () => {},
            modalType: 'chat' as const,
          },
          {
            id: 'plan-details',
            icon: Calendar,
            label: 'Plan Yardımı',
            description: 'Günlük planın detaylı açıklaması',
            onClick: () => {},
            modalType: 'chat' as const,
          },
          {
            id: 'generate-new-insights',
            icon: Sparkles,
            label: 'Yeni İçgörü Üret',
            description: 'AI ile yeni analiz ve öneriler al',
            onClick: () => {},
            modalType: 'chat' as const,
          },
        ],
      };
    }

    // Backup Context
    if (path === '/yedekleme') {
      return {
        currentContext: 'Yedekleme',
        studentContext: null,
        contextActions: [
          {
            id: 'backup-help',
            icon: Shield,
            label: 'Yedekleme Rehberi',
            description: 'Yedekleme işlemlerini anlamak',
            onClick: () => {},
            modalType: 'chat' as const,
          },
        ],
      };
    }

    // Default/Dashboard
    return {
      currentContext: 'Dashboard',
      studentContext: null,
      contextActions: [
        {
          id: 'daily-insights',
          icon: Sparkles,
          label: 'Günlük İçgörüler',
          description: 'Bugün için AI önerileri ve içgörüler',
          badge: 'Güncel',
          onClick: () => navigate('/ai-araclari?tab=gunluk'),
          modalType: 'navigate' as const,
        },
        {
          id: 'daily-plan',
          icon: Calendar,
          label: 'Günlük Plan',
          description: 'AI destekli günlük aksiyon planı',
          onClick: () => navigate('/ai-araclari?tab=gunluk'),
          modalType: 'navigate' as const,
        },
        {
          id: 'priority-alerts',
          icon: AlertTriangle,
          label: 'Öncelikli Öğrenciler',
          description: 'Dikkat gerektiren öğrenciler',
          onClick: () => navigate('/ai-araclari?tab=risk'),
          modalType: 'navigate' as const,
        },
      ],
    };
  }, [location.pathname, location.search, navigate, manualStudentContext]);

  // General actions available everywhere
  const generalActions: AIAction[] = useMemo(() => [
    {
      id: 'chat',
      icon: MessageSquare,
      label: 'AI ile Sohbet',
      description: 'Genel sorularını AI asistana sor',
      onClick: () => {},
      modalType: 'chat' as const,
    },
    {
      id: 'ai-tools',
      icon: Brain,
      label: 'Tüm AI Araçları',
      description: 'AI araçlar sayfasına git',
      onClick: () => navigate('/ai-araclari'),
      modalType: 'navigate' as const,
    },
  ], [navigate]);

  const value: AIContextValue = {
    contextActions,
    generalActions,
    currentContext,
    studentContext,
    setStudentContext,
  };

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}
