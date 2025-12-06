import {
  LayoutDashboard,
  GraduationCap,
  Heart,
  Target,
  TrendingUp,
  FileText,
  Calendar,
  ClipboardList,
  ListChecks,
  UserCircle,
} from "lucide-react";
import { TabConfig } from "./types";

/**
 * Öğrenci Profili Ana Tab Yapılandırması
 * Veri Tipi Odaklı Yapı: 4 Sekme
 * Profesyonel & Akademik Standartlara Uygun Organizasyon
 */
export const STUDENT_PROFILE_MAIN_TABS: TabConfig[] = [
  {
    value: "overview",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Özet skorlar, profil tamamlama durumu ve hızlı aksiyonlar",
    variant: "pills"
  },
  {
    value: "academic",
    label: "Akademik Durum",
    icon: GraduationCap,
    description: "Notlar, sınavlar, devamsızlık ve akademik performans",
    variant: "pills"
  },
  {
    value: "psychosocial",
    label: "Psikososyal Durum",
    icon: Heart,
    description: "Psikososyal durum, davranış ve akran ilişkileri",
    variant: "pills"
  },
  {
    value: "career",
    label: "Kariyer Rehberliği",
    icon: Target,
    description: "Kariyer hedefleri, üniversite planlaması ve gelecek vizyonu",
    variant: "pills"
  },
  {
    value: "demographics",
    label: "Tanıtıcı Bilgiler",
    icon: UserCircle,
    description: "Kimlik, iletişim, aile ve sağlık bilgileri",
    variant: "pills"
  },
];

/**
 * Semantic Color System - Tab Renk Paleti
 */
export const STUDENT_TAB_COLORS = {
  overview: {
    gradient: "from-indigo-500 via-violet-500 to-purple-600",
    bg: "bg-gradient-to-r from-indigo-50/80 to-purple-50/80 dark:from-indigo-950/30 dark:to-purple-950/30",
    border: "border-indigo-200/50 dark:border-indigo-800/50",
  },
  academic: {
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30",
    border: "border-emerald-200/50 dark:border-emerald-800/50",
  },
  psychosocial: {
    gradient: "from-pink-500 to-rose-500",
    bg: "bg-gradient-to-r from-pink-50/80 to-rose-50/80 dark:from-pink-950/30 dark:to-rose-950/30",
    border: "border-pink-200/50 dark:border-pink-800/50",
  },
  career: {
    gradient: "from-amber-500 to-yellow-500",
    bg: "bg-gradient-to-r from-amber-50/80 to-yellow-50/80 dark:from-amber-950/30 dark:to-yellow-950/30",
    border: "border-amber-200/50 dark:border-amber-800/50",
  },
  "ai-tools": {
    gradient: "from-purple-500 to-indigo-500",
    bg: "bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-950/30 dark:to-indigo-950/30",
    border: "border-purple-200/50 dark:border-purple-800/50",
  },
  demographics: {
    gradient: "from-cyan-500 to-blue-500",
    bg: "bg-gradient-to-r from-cyan-50/80 to-blue-50/80 dark:from-cyan-950/30 dark:to-blue-950/30",
    border: "border-cyan-200/50 dark:border-cyan-800/50",
  },
} as const;

/**
 * Akademik Dashboard Alt Sekmeleri
 * Smart Academic Dashboard'da kullanılan alt sekmeler
 */
export const STUDENT_ACADEMIC_TABS: TabConfig[] = [
  {
    value: "performans",
    label: "Akademik Performans",
    icon: TrendingUp,
    description: "Standart akademik performans değerlendirmeleri",
    variant: "pills"
  },
  {
    value: "sinavlar",
    label: "Sınav Sonuçları",
    icon: FileText,
    description: "Sınav sonuçları ve detaylı analizler",
    variant: "pills"
  },
  {
    value: "calisma-programi",
    label: "Çalışma Programı",
    icon: Calendar,
    description: "Haftalık çalışma programı ve ders programı",
    variant: "pills"
  },
  {
    value: "konu-takibi",
    label: "Konu Takibi",
    icon: ListChecks,
    description: "Konu bazlı ilerleme ve soru takibi",
    variant: "pills"
  },
  {
    value: "anketler",
    label: "Anketler",
    icon: ClipboardList,
    description: "Öğrenci anketleri ve değerlendirme formları",
    variant: "pills"
  },
];

