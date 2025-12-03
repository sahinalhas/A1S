export type GuidanceTipCategory =
  // Temel Rehberlik
  | 'PSIKOLOJIK_DANISMANLIK'
  | 'KARIYER_REHBERLIGI'
  | 'OGRENCI_ILETISIMI'
  | 'VELI_GORUSMESI'
  | 'KRIZ_YONETIMI'
  | 'MOTIVASYON'
  | 'SINIF_YONETIMI'
  | 'MEVZUAT'
  | 'TEKNIK_BILGI'
  | 'GENEL'
  // Psikolojik Destek
  | 'ERGEN_PSIKOLOJISI'
  | 'OZEL_EGITIM'
  | 'BAGIMLILIK'
  | 'AKRAN_ZORBALIGI'
  | 'OGRENME_GUCLUGU'
  | 'SOSYAL_DUYGUSAL'
  | 'AILE_TERAPISI'
  | 'TRAVMA_MUDAHALE'
  | 'OYUN_TERAPISI'
  | 'PSIKOMETRI'
  // Eğitim Desteği
  | 'GRUP_REHBERLIGI'
  | 'OKUL_UYUM'
  | 'SINAV_KAYGISI'
  // Kişisel Gelişim
  | 'OZGUVEN'
  | 'ZAMAN_YONETIMI'
  // Yaşam Becerileri
  | 'ILETISIM_BECERILERI'
  | 'PROBLEM_COZME'
  | 'KARAR_VERME'
  | 'DEGER_EGITIMI'
  | 'MEDYA_OKURYAZARLIGI'
  // Danışma Kuramları
  | 'PSIKANALITIK_KURAM'
  | 'BILISSSEL_DAVRANISCI'
  | 'HÜMANISTIK_YAKLASIM'
  | 'GESTALT_TERAPISI'
  | 'VAROLUŞCU_TERAPI'
  | 'COZUM_ODAKLI'
  | 'AILE_SISTEMLERI'
  | 'NARRATIVE_TERAPI'
  | 'ADLERYAN_TERAPI'
  | 'REALITE_TERAPISI'
  // Danışmanlık Becerileri
  | 'AKTIF_DINLEME'
  | 'EMPATI'
  | 'YANSITMA'
  | 'SORULAR_SORMA'
  | 'OZET_YAPMA'
  | 'YUZLESTIRME'
  | 'YORUMLAMA'
  | 'GERI_BILDIRIM'
  | 'HEDEF_BELIRLEME'
  | 'ILISSKI_KURMA'
  // Etik ve Mesleki Gelişim
  | 'MESLEKI_ETIK'
  | 'SUPERVIZYON'
  | 'VAKA_FORMULASYONU'
  | 'RAPOR_YAZIMI';

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

export interface GuidanceTipUserView {
  id: string;
  tipId: string;
  userId: string;
  viewedAt: string;
  dismissed: boolean;
  rating: number | null;
}

export interface UserCategoryPreferences {
  userId: string;
  enabledCategories: GuidanceTipCategory[];
  updatedAt: string;
}

export interface GeneratedTipContent {
  title: string;
  content: string;
  category: GuidanceTipCategory;
  importance: GuidanceTipImportance;
}

export interface CategoryInfo {
  value: GuidanceTipCategory;
  label: string;
  description: string;
  icon: string;
  group: 'temel' | 'psikoloji' | 'egitim' | 'gelisim' | 'beceri' | 'kuramlar' | 'danismanlik' | 'etik';
}

export const GUIDANCE_TIP_CATEGORIES: CategoryInfo[] = [
  // Temel Rehberlik
  { value: 'PSIKOLOJIK_DANISMANLIK', label: 'Psikolojik Danışmanlık', description: 'Danışmanlık teknikleri ve yaklaşımları', icon: 'Brain', group: 'temel' },
  { value: 'KARIYER_REHBERLIGI', label: 'Kariyer Rehberliği', description: 'Mesleki yönlendirme ve kariyer planlaması', icon: 'Briefcase', group: 'temel' },
  { value: 'OGRENCI_ILETISIMI', label: 'Öğrenci İletişimi', description: 'Öğrencilerle etkili iletişim kurma', icon: 'Users', group: 'temel' },
  { value: 'VELI_GORUSMESI', label: 'Veli Görüşmesi', description: 'Veli toplantıları ve görüşme teknikleri', icon: 'Heart', group: 'temel' },
  { value: 'KRIZ_YONETIMI', label: 'Kriz Yönetimi', description: 'Acil durumlar ve kriz müdahalesi', icon: 'AlertTriangle', group: 'temel' },
  { value: 'MOTIVASYON', label: 'Motivasyon', description: 'Öğrenci motivasyonu artırma teknikleri', icon: 'Star', group: 'temel' },
  { value: 'SINIF_YONETIMI', label: 'Sınıf Yönetimi', description: 'Sınıf rehberlik çalışmaları', icon: 'BookOpen', group: 'temel' },
  { value: 'MEVZUAT', label: 'Mevzuat', description: 'MEB mevzuatı ve yasal düzenlemeler', icon: 'Scale', group: 'temel' },
  { value: 'TEKNIK_BILGI', label: 'Teknik Bilgi', description: 'Rehberlik alanında teknik bilgiler', icon: 'Wrench', group: 'temel' },
  { value: 'GENEL', label: 'Genel', description: 'Genel rehberlik bilgileri', icon: 'Lightbulb', group: 'temel' },
  
  // Psikolojik Destek
  { value: 'ERGEN_PSIKOLOJISI', label: 'Ergen Psikolojisi', description: 'Ergenlik dönemi özellikleri ve yaklaşımlar', icon: 'User', group: 'psikoloji' },
  { value: 'OZEL_EGITIM', label: 'Özel Eğitim', description: 'Özel gereksinimli öğrencilere yönelik uygulamalar', icon: 'Accessibility', group: 'psikoloji' },
  { value: 'BAGIMLILIK', label: 'Bağımlılık', description: 'Madde ve teknoloji bağımlılığı ile mücadele', icon: 'ShieldAlert', group: 'psikoloji' },
  { value: 'AKRAN_ZORBALIGI', label: 'Akran Zorbalığı', description: 'Zorbalık önleme ve müdahale stratejileri', icon: 'UserX', group: 'psikoloji' },
  { value: 'OGRENME_GUCLUGU', label: 'Öğrenme Güçlüğü', description: 'Öğrenme güçlüğü olan öğrencilere destek', icon: 'BookX', group: 'psikoloji' },
  { value: 'SOSYAL_DUYGUSAL', label: 'Sosyal-Duygusal Öğrenme', description: 'SEL programları ve uygulamaları', icon: 'HeartHandshake', group: 'psikoloji' },
  { value: 'AILE_TERAPISI', label: 'Aile Terapisi', description: 'Aile dinamikleri ve müdahale yaklaşımları', icon: 'Home', group: 'psikoloji' },
  { value: 'TRAVMA_MUDAHALE', label: 'Travma Müdahale', description: 'Travma sonrası destek ve iyileşme', icon: 'HeartPulse', group: 'psikoloji' },
  { value: 'OYUN_TERAPISI', label: 'Oyun Terapisi', description: 'Çocuklarla oyun temelli çalışmalar', icon: 'Gamepad2', group: 'psikoloji' },
  { value: 'PSIKOMETRI', label: 'Psikometri', description: 'Test ve ölçme değerlendirme teknikleri', icon: 'ClipboardCheck', group: 'psikoloji' },
  
  // Eğitim Desteği
  { value: 'GRUP_REHBERLIGI', label: 'Grup Rehberliği', description: 'Grup çalışmaları ve etkinlikleri', icon: 'UsersRound', group: 'egitim' },
  { value: 'OKUL_UYUM', label: 'Okul Uyum', description: 'Okula uyum ve geçiş süreçleri', icon: 'School', group: 'egitim' },
  { value: 'SINAV_KAYGISI', label: 'Sınav Kaygısı', description: 'Sınav stresi ve kaygı yönetimi', icon: 'FileWarning', group: 'egitim' },
  
  // Kişisel Gelişim
  { value: 'OZGUVEN', label: 'Özgüven', description: 'Özgüven geliştirme çalışmaları', icon: 'Trophy', group: 'gelisim' },
  { value: 'ZAMAN_YONETIMI', label: 'Zaman Yönetimi', description: 'Etkili zaman kullanımı ve planlama', icon: 'Clock', group: 'gelisim' },
  
  // Yaşam Becerileri
  { value: 'ILETISIM_BECERILERI', label: 'İletişim Becerileri', description: 'Etkili iletişim teknikleri', icon: 'MessageCircle', group: 'beceri' },
  { value: 'PROBLEM_COZME', label: 'Problem Çözme', description: 'Problem çözme ve analitik düşünme', icon: 'Puzzle', group: 'beceri' },
  { value: 'KARAR_VERME', label: 'Karar Verme', description: 'Sağlıklı karar verme süreçleri', icon: 'CheckCircle', group: 'beceri' },
  { value: 'DEGER_EGITIMI', label: 'Değer Eğitimi', description: 'Değerler eğitimi ve karakter gelişimi', icon: 'Gem', group: 'beceri' },
  { value: 'MEDYA_OKURYAZARLIGI', label: 'Medya Okuryazarlığı', description: 'Dijital vatandaşlık ve medya okuryazarlığı', icon: 'Smartphone', group: 'beceri' },

  // Danışma Kuramları
  { value: 'PSIKANALITIK_KURAM', label: 'Psikoanalitik Kuram', description: 'Freud ve psikoanalitik yaklaşım temelleri', icon: 'Layers', group: 'kuramlar' },
  { value: 'BILISSSEL_DAVRANISCI', label: 'Bilişsel-Davranışçı Terapi', description: 'BDT teknikleri ve uygulamaları', icon: 'Cpu', group: 'kuramlar' },
  { value: 'HÜMANISTIK_YAKLASIM', label: 'Hümanistik Yaklaşım', description: 'Rogers ve danışan merkezli terapi', icon: 'Sparkles', group: 'kuramlar' },
  { value: 'GESTALT_TERAPISI', label: 'Gestalt Terapisi', description: 'Şimdi ve burada odaklı çalışmalar', icon: 'Circle', group: 'kuramlar' },
  { value: 'VAROLUŞCU_TERAPI', label: 'Varoluşçu Terapi', description: 'Anlam arayışı ve varoluşsal temalar', icon: 'Compass', group: 'kuramlar' },
  { value: 'COZUM_ODAKLI', label: 'Çözüm Odaklı Terapi', description: 'Kısa süreli çözüm odaklı yaklaşım', icon: 'Target', group: 'kuramlar' },
  { value: 'AILE_SISTEMLERI', label: 'Aile Sistemleri Kuramı', description: 'Sistemik aile terapisi yaklaşımları', icon: 'Network', group: 'kuramlar' },
  { value: 'NARRATIVE_TERAPI', label: 'Narratif Terapi', description: 'Öykü temelli terapi yaklaşımı', icon: 'BookText', group: 'kuramlar' },
  { value: 'ADLERYAN_TERAPI', label: 'Adlerian Terapi', description: 'Bireysel psikoloji ve yaşam stili analizi', icon: 'UserCircle', group: 'kuramlar' },
  { value: 'REALITE_TERAPISI', label: 'Gerçeklik Terapisi', description: 'Seçim teorisi ve sorumluluk odağı', icon: 'Focus', group: 'kuramlar' },

  // Danışmanlık Becerileri
  { value: 'AKTIF_DINLEME', label: 'Aktif Dinleme', description: 'Etkili dinleme teknikleri ve sözsüz iletişim', icon: 'Ear', group: 'danismanlik' },
  { value: 'EMPATI', label: 'Empati', description: 'Empatik anlayış ve duygusal bağ kurma', icon: 'Heart', group: 'danismanlik' },
  { value: 'YANSITMA', label: 'Yansıtma', description: 'Duygu ve içerik yansıtma teknikleri', icon: 'Mirror', group: 'danismanlik' },
  { value: 'SORULAR_SORMA', label: 'Soru Sorma Teknikleri', description: 'Açık-kapalı sorular ve keşfettirici sorular', icon: 'HelpCircle', group: 'danismanlik' },
  { value: 'OZET_YAPMA', label: 'Özetleme', description: 'Görüşme özetleme ve ana noktaları belirleme', icon: 'FileText', group: 'danismanlik' },
  { value: 'YUZLESTIRME', label: 'Yüzleştirme', description: 'Yapıcı yüzleştirme ve tutarsızlıkları ele alma', icon: 'AlertCircle', group: 'danismanlik' },
  { value: 'YORUMLAMA', label: 'Yorumlama', description: 'Davranış ve duygulara anlam katma', icon: 'Search', group: 'danismanlik' },
  { value: 'GERI_BILDIRIM', label: 'Geri Bildirim', description: 'Etkili ve yapıcı geri bildirim verme', icon: 'MessageSquare', group: 'danismanlik' },
  { value: 'HEDEF_BELIRLEME', label: 'Hedef Belirleme', description: 'SMART hedefler ve eylem planları', icon: 'Flag', group: 'danismanlik' },
  { value: 'ILISSKI_KURMA', label: 'İlişki Kurma', description: 'Terapötik ittifak ve güven oluşturma', icon: 'Handshake', group: 'danismanlik' },

  // Etik ve Mesleki Gelişim
  { value: 'MESLEKI_ETIK', label: 'Mesleki Etik', description: 'Etik ilkeler ve mesleki sınırlar', icon: 'Shield', group: 'etik' },
  { value: 'SUPERVIZYON', label: 'Süpervizyon', description: 'Süpervizyon alma ve verme süreçleri', icon: 'Users', group: 'etik' },
  { value: 'VAKA_FORMULASYONU', label: 'Vaka Formülasyonu', description: 'Vaka kavramsallaştırma ve planlama', icon: 'ClipboardList', group: 'etik' },
  { value: 'RAPOR_YAZIMI', label: 'Rapor Yazımı', description: 'Profesyonel rapor ve kayıt tutma', icon: 'FileEdit', group: 'etik' },
];

export const CATEGORY_GROUPS = [
  { id: 'temel', label: 'Temel Rehberlik', description: 'Rehberlik hizmetlerinin temel alanları' },
  { id: 'psikoloji', label: 'Psikolojik Destek', description: 'Psikolojik danışmanlık ve müdahale' },
  { id: 'egitim', label: 'Eğitim Desteği', description: 'Eğitim süreçlerine yönelik çalışmalar' },
  { id: 'gelisim', label: 'Kişisel Gelişim', description: 'Bireysel gelişim ve güçlendirme' },
  { id: 'beceri', label: 'Yaşam Becerileri', description: 'Temel yaşam becerileri eğitimi' },
  { id: 'kuramlar', label: 'Danışma Kuramları', description: 'Psikolojik danışma kuram ve yaklaşımları' },
  { id: 'danismanlik', label: 'Danışmanlık Becerileri', description: 'Temel danışmanlık teknikleri ve becerileri' },
  { id: 'etik', label: 'Etik ve Mesleki Gelişim', description: 'Mesleki etik ve profesyonel gelişim' },
];
