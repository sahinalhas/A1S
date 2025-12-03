export type GuidanceTipCategory =
  | 'PSIKOLOJIK_DANISMANLIK'
  | 'KARIYER_REHBERLIGI'
  | 'OGRENCI_ILETISIMI'
  | 'VELI_GORUSMESI'
  | 'KRIZ_YONETIMI'
  | 'MOTIVASYON'
  | 'SINIF_YONETIMI'
  | 'MEVZUAT'
  | 'TEKNIK_BILGI'
  | 'GENEL';

export type GuidanceTipImportance = 'DUSUK' | 'NORMAL' | 'YUKSEK' | 'KRITIK';

export interface GuidanceTip {
  id: string;
  category: GuidanceTipCategory;
  title: string;
  content: string;
  source: string;
  importance: GuidanceTipImportance;
  isRead: boolean;
  isActive: boolean;
  viewCount: number;
  lastShownAt: string | null;
  generatedAt: string;
  created_at: string;
  updated_at: string;
}

export const GUIDANCE_TIP_CATEGORY_LABELS: Record<GuidanceTipCategory, string> = {
  'PSIKOLOJIK_DANISMANLIK': 'Psikolojik Danışmanlık',
  'KARIYER_REHBERLIGI': 'Kariyer Rehberliği',
  'OGRENCI_ILETISIMI': 'Öğrenci İletişimi',
  'VELI_GORUSMESI': 'Veli Görüşmesi',
  'KRIZ_YONETIMI': 'Kriz Yönetimi',
  'MOTIVASYON': 'Motivasyon',
  'SINIF_YONETIMI': 'Sınıf Yönetimi',
  'MEVZUAT': 'Mevzuat',
  'TEKNIK_BILGI': 'Teknik Bilgi',
  'GENEL': 'Genel',
};
