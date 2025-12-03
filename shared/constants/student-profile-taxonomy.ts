/**
 * Comprehensive Student Profile Taxonomy
 * AI-ready standardized data structure for student profiling
 */

// ==================== ACADEMIC STRENGTHS & WEAKNESSES ====================

export const ACADEMIC_SUBJECTS = [
  { value: 'MATEMATIK', label: 'Matematik', category: 'sayısal' },
  { value: 'FEN_BILIMLERI', label: 'Fen Bilimleri', category: 'sayısal' },
  { value: 'FIZIK', label: 'Fizik', category: 'sayısal' },
  { value: 'KIMYA', label: 'Kimya', category: 'sayısal' },
  { value: 'BIYOLOJI', label: 'Biyoloji', category: 'sayısal' },
  { value: 'TURKCE', label: 'Türkçe', category: 'sözel' },
  { value: 'EDEBIYAT', label: 'Edebiyat', category: 'sözel' },
  { value: 'TARIH', label: 'Tarih', category: 'sözel' },
  { value: 'COGRAFYA', label: 'Coğrafya', category: 'sözel' },
  { value: 'SOSYAL_BILGILER', label: 'Sosyal Bilgiler', category: 'sözel' },
  { value: 'INGILIZCE', label: 'İngilizce', category: 'dil' },
  { value: 'ALMANCA', label: 'Almanca', category: 'dil' },
  { value: 'FRANSIZCA', label: 'Fransızca', category: 'dil' },
  { value: 'GORSEL_SANATLAR', label: 'Görsel Sanatlar', category: 'sanat' },
  { value: 'MUZIK', label: 'Müzik', category: 'sanat' },
  { value: 'BEDEN_EGITIMI', label: 'Beden Eğitimi', category: 'fiziksel' },
  { value: 'DIN_KULTURU', label: 'Din Kültürü', category: 'sözel' },
  { value: 'TEKNOLOJI_TASARIM', label: 'Teknoloji ve Tasarım', category: 'uygulamalı' },
  { value: 'BILISIM', label: 'Bilişim Teknolojileri', category: 'uygulamalı' },
] as const;

export const ACADEMIC_SKILLS = [
  { value: 'PROBLEM_COZME', label: 'Problem Çözme', category: 'bilişsel' },
  { value: 'ANALITIK_DUSUNME', label: 'Analitik Düşünme', category: 'bilişsel' },
  { value: 'ELESTIREL_DUSUNME', label: 'Eleştirel Düşünme', category: 'bilişsel' },
  { value: 'YARATICI_DUSUNME', label: 'Yaratıcı Düşünme', category: 'bilişsel' },
  { value: 'HIZLI_OGRENMME', label: 'Hızlı Öğrenme', category: 'bilişsel' },
  { value: 'HAFIZA', label: 'Güçlü Hafıza', category: 'bilişsel' },
  { value: 'DIKKAT_YOGUNLASMA', label: 'Dikkat ve Yoğunlaşma', category: 'bilişsel' },
  { value: 'ZAMAN_YONETIMI', label: 'Zaman Yönetimi', category: 'yürütücü' },
  { value: 'ORGANIZASYON', label: 'Organizasyon Becerisi', category: 'yürütücü' },
  { value: 'PLANLAMA', label: 'Planlama', category: 'yürütücü' },
  { value: 'OZDUZENLE', label: 'Öz-düzenleme', category: 'yürütücü' },
  { value: 'ARASTIRMA', label: 'Araştırma Becerisi', category: 'akademik' },
  { value: 'SUNUM', label: 'Sunum Yapma', category: 'akademik' },
  { value: 'YAZILI_IFADE', label: 'Yazılı İfade', category: 'akademik' },
  { value: 'SOZLU_IFADE', label: 'Sözlü İfade', category: 'akademik' },
] as const;

// ==================== SOCIAL & EMOTIONAL STRENGTHS ====================

export const SOCIAL_SKILLS = [
  { value: 'LIDERLIK', label: 'Liderlik', category: 'sosyal' },
  { value: 'TAKIM_CALISMA', label: 'Takım Çalışması', category: 'sosyal' },
  { value: 'EMPATI', label: 'Empati', category: 'duygusal' },
  { value: 'ILETISIM', label: 'İletişim Becerisi', category: 'sosyal' },
  { value: 'ETKIN_DINLEME', label: 'Etkin Dinleme', category: 'sosyal' },
  { value: 'CATISMA_YONETIMI', label: 'Çatışma Yönetimi', category: 'sosyal' },
  { value: 'ISBIRLIGI', label: 'İşbirliği', category: 'sosyal' },
  { value: 'SOZLU_ILETISIM', label: 'Sözlü İletişim', category: 'sosyal' },
  { value: 'YAZILI_ILETISIM', label: 'Yazılı İletişim', category: 'sosyal' },
  { value: 'IKNA_ETME', label: 'İkna Etme', category: 'sosyal' },
  { value: 'MUDAHALE', label: 'Müzakere', category: 'sosyal' },
  { value: 'KULTUREL_DUYARLILIK', label: 'Kültürel Duyarlılık', category: 'sosyal' },
  { value: 'DUYGUSAL_FARKINDA', label: 'Duygusal Farkındalık', category: 'duygusal' },
  { value: 'DUYGU_DUZENLEME', label: 'Duygu Düzenleme', category: 'duygusal' },
  { value: 'OZGUVEN', label: 'Özgüven', category: 'duygusal' },
  { value: 'OZFARKINDA', label: 'Öz-farkındalık', category: 'duygusal' },
  { value: 'DIRENGENLIK', label: 'Dirençlilik (Resilience)', category: 'duygusal' },
  { value: 'STRES_YONETIMI', label: 'Stres Yönetimi', category: 'duygusal' },
  { value: 'UYUM', label: 'Uyum Sağlama', category: 'duygusal' },
  { value: 'SORUMLULUK', label: 'Sorumluluk Alma', category: 'duygusal' },
] as const;

// ==================== CREATIVE & ARTISTIC STRENGTHS ====================

export const CREATIVE_TALENTS = [
  { value: 'RESIM', label: 'Resim', category: 'görsel_sanat' },
  { value: 'HEYKEL', label: 'Heykel', category: 'görsel_sanat' },
  { value: 'GRAFIK_TASARIM', label: 'Grafik Tasarım', category: 'görsel_sanat' },
  { value: 'FOTOGRAF', label: 'Fotoğrafçılık', category: 'görsel_sanat' },
  { value: 'SERAMIK', label: 'Seramik', category: 'görsel_sanat' },
  { value: 'MUZIK_CALGI', label: 'Müzik (Çalgı)', category: 'müzik' },
  { value: 'VOKAL', label: 'Vokal/Şan', category: 'müzik' },
  { value: 'BESTE', label: 'Beste/Kompozisyon', category: 'müzik' },
  { value: 'DANS', label: 'Dans', category: 'performans' },
  { value: 'TIYATRO', label: 'Tiyatro/Oyunculuk', category: 'performans' },
  { value: 'YARATICI_YAZARLIK', label: 'Yaratıcı Yazarlık', category: 'edebiyat' },
  { value: 'SIIR', label: 'Şiir', category: 'edebiyat' },
  { value: 'HIKAYE', label: 'Hikaye/Roman Yazma', category: 'edebiyat' },
  { value: 'SENARYO', label: 'Senaryo Yazımı', category: 'edebiyat' },
  { value: 'EL_BECERILERI', label: 'El Becerileri', category: 'uygulamalı' },
  { value: 'YARATICI_PROBLEM', label: 'Yaratıcı Problem Çözme', category: 'düşünce' },
  { value: 'INOVASYON', label: 'İnovasyon/Yenilikçilik', category: 'düşünce' },
] as const;

// ==================== PHYSICAL & SPORTS TALENTS ====================

export const PHYSICAL_TALENTS = [
  { value: 'FUTBOL', label: 'Futbol', category: 'takım_sporu' },
  { value: 'BASKETBOL', label: 'Basketbol', category: 'takım_sporu' },
  { value: 'VOLEYBOL', label: 'Voleybol', category: 'takım_sporu' },
  { value: 'HENTBOL', label: 'Hentbol', category: 'takım_sporu' },
  { value: 'ATLETIZM', label: 'Atletizm', category: 'bireysel' },
  { value: 'YUZME', label: 'Yüzme', category: 'bireysel' },
  { value: 'JIMNASTIK', label: 'Jimnastik', category: 'bireysel' },
  { value: 'TENIS', label: 'Tenis', category: 'bireysel' },
  { value: 'BADMINTON', label: 'Badminton', category: 'bireysel' },
  { value: 'MASA_TENISI', label: 'Masa Tenisi', category: 'bireysel' },
  { value: 'KARATE', label: 'Karate', category: 'dövüş' },
  { value: 'TAEKWONDO', label: 'Taekwondo', category: 'dövüş' },
  { value: 'JUDO', label: 'Judo', category: 'dövüş' },
  { value: 'BISIKLET', label: 'Bisiklet', category: 'bireysel' },
  { value: 'KOSU', label: 'Koşu', category: 'bireysel' },
  { value: 'GUC_ANTRENMAN', label: 'Güç Antrenmanı', category: 'fitness' },
  { value: 'YOGA', label: 'Yoga', category: 'fitness' },
  { value: 'DANS_SPOR', label: 'Dans (Spor)', category: 'performans' },
  { value: 'KOORDINASYON', label: 'El-Göz Koordinasyonu', category: 'beceri' },
  { value: 'DENGE', label: 'Denge', category: 'beceri' },
  { value: 'CEVIKLIK', label: 'Çeviklik', category: 'beceri' },
  { value: 'DAYANIKLILIK', label: 'Dayanıklılık', category: 'beceri' },
] as const;

// ==================== INTEREST AREAS ====================

export const INTEREST_AREAS = [
  { value: 'BILIM_TEKNOLOJI', label: 'Bilim ve Teknoloji', category: 'akademik' },
  { value: 'ROBOTIK', label: 'Robotik', category: 'teknoloji' },
  { value: 'KODLAMA', label: 'Kodlama/Programlama', category: 'teknoloji' },
  { value: 'OYUN_TASARIM', label: 'Oyun Tasarımı', category: 'teknoloji' },
  { value: 'YAPAY_ZEKA', label: 'Yapay Zeka', category: 'teknoloji' },
  { value: 'EDEBIYAT', label: 'Edebiyat', category: 'sanat' },
  { value: 'TARIH', label: 'Tarih', category: 'sosyal' },
  { value: 'FELSEFE', label: 'Felsefe', category: 'sosyal' },
  { value: 'SOSYOLOJI', label: 'Sosyoloji', category: 'sosyal' },
  { value: 'PSIKOLOJI', label: 'Psikoloji', category: 'sosyal' },
  { value: 'GONULLU_CALISMA', label: 'Gönüllü Çalışmalar', category: 'sosyal' },
  { value: 'CEVRE', label: 'Çevre ve Doğa', category: 'sosyal' },
  { value: 'HAYVAN_HAKLARI', label: 'Hayvan Hakları', category: 'sosyal' },
  { value: 'SINEMA', label: 'Sinema', category: 'sanat' },
  { value: 'MUZIK_DINLEME', label: 'Müzik Dinleme', category: 'sanat' },
  { value: 'OKUMA', label: 'Okuma/Kitap', category: 'akademik' },
  { value: 'SEYAHAT', label: 'Seyahat', category: 'keşif' },
  { value: 'KULTUR', label: 'Kültür ve Sanat', category: 'sanat' },
  { value: 'YEMEK', label: 'Yemek Yapma', category: 'uygulama' },
  { value: 'BAHCECILIK', label: 'Bahçecilik', category: 'uygulama' },
  { value: 'FOTOGRAF_ILGI', label: 'Fotoğrafçılık', category: 'sanat' },
  { value: 'VIDEO_YAPIM', label: 'Video Yapımı', category: 'sanat' },
  { value: 'PODCAST', label: 'Podcast/Radyo', category: 'medya' },
  { value: 'BLOG_YAZILIK', label: 'Blog Yazarlığı', category: 'medya' },
  { value: 'KOLEKSIYON', label: 'Koleksiyon Yapma', category: 'hobi' },
  { value: 'OYUN', label: 'Oyunlar (Dijital/Analog)', category: 'eğlence' },
] as const;

// ==================== HEALTH TAXONOMY ====================

export const BLOOD_TYPES = [
  { value: 'A_RH_POSITIVE', label: 'A Rh+' },
  { value: 'A_RH_NEGATIVE', label: 'A Rh-' },
  { value: 'B_RH_POSITIVE', label: 'B Rh+' },
  { value: 'B_RH_NEGATIVE', label: 'B Rh-' },
  { value: 'AB_RH_POSITIVE', label: 'AB Rh+' },
  { value: 'AB_RH_NEGATIVE', label: 'AB Rh-' },
  { value: 'O_RH_POSITIVE', label: '0 Rh+' },
  { value: 'O_RH_NEGATIVE', label: '0 Rh-' },
  { value: 'BILINMIYOR', label: 'Bilinmiyor' },
] as const;

export const CHRONIC_DISEASES = [
  { value: 'ASTIM', label: 'Astım', category: 'solunum' },
  { value: 'DIYABET_TIP1', label: 'Diyabet Tip 1', category: 'metabolik' },
  { value: 'DIYABET_TIP2', label: 'Diyabet Tip 2', category: 'metabolik' },
  { value: 'EPILEPSI', label: 'Epilepsi', category: 'nörolojik' },
  { value: 'MIGRAN', label: 'Migren', category: 'nörolojik' },
  { value: 'OTIZM', label: 'Otizm Spektrum Bozukluğu', category: 'nörogelişimsel' },
  { value: 'DEHB', label: 'DEHB (Dikkat Eksikliği Hiperaktivite)', category: 'nörogelişimsel' },
  { value: 'DISLEKSI', label: 'Disleksi (Okuma Güçlüğü)', category: 'öğrenme' },
  { value: 'DISGRAFYA', label: 'Disgrafi (Yazma Güçlüğü)', category: 'öğrenme' },
  { value: 'DISKALKULYA', label: 'Diskalkuli (Matematik Güçlüğü)', category: 'öğrenme' },
  { value: 'SEREBRAL_PALSI', label: 'Serebral Palsi', category: 'nörolojik' },
  { value: 'KALP_HASTALIGI', label: 'Kalp Hastalığı', category: 'kardiyovasküler' },
  { value: 'ALERJI_RINIT', label: 'Alerjik Rinit', category: 'alerjik' },
  { value: 'EKZAMA', label: 'Ekzama/Atopik Dermatit', category: 'dermatolojik' },
  { value: 'SEKER_HASTALIGI', label: 'Şeker Hastalığı', category: 'metabolik' },
  { value: 'TIROID', label: 'Tiroid Hastalıkları', category: 'endokrin' },
  { value: 'ANEMYA', label: 'Anemi', category: 'hematolojik' },
  { value: 'ISKELET_SISTEM', label: 'İskelet Sistemi Bozuklukları', category: 'kas-iskelet' },
  { value: 'GOR_BOZUKLUGU', label: 'Görme Bozukluğu', category: 'duyusal' },
  { value: 'ISITME_BOZUKLUGU', label: 'İşitme Bozukluğu', category: 'duyusal' },
  { value: 'KONUSMA_BOZUKLUGU', label: 'Konuşma Bozukluğu', category: 'duyusal' },
] as const;

export const ALLERGIES = [
  { value: 'POLEN', label: 'Polen', category: 'çevresel' },
  { value: 'TOZ_AKAR', label: 'Toz Akarı', category: 'çevresel' },
  { value: 'HAYVAN_TUYÜ', label: 'Hayvan Tüyü', category: 'çevresel' },
  { value: 'KEDI', label: 'Kedi', category: 'hayvan' },
  { value: 'KOPEK', label: 'Köpek', category: 'hayvan' },
  { value: 'SUT', label: 'Süt ve Süt Ürünleri', category: 'besin' },
  { value: 'YUMURTA', label: 'Yumurta', category: 'besin' },
  { value: 'FISTIK', label: 'Fıstık', category: 'besin' },
  { value: 'FINDIK', label: 'Fındık', category: 'besin' },
  { value: 'BADEM', label: 'Badem', category: 'besin' },
  { value: 'SOYA', label: 'Soya', category: 'besin' },
  { value: 'BUGDAY_GLUTEN', label: 'Buğday/Gluten', category: 'besin' },
  { value: 'BALIK', label: 'Balık', category: 'besin' },
  { value: 'KABUKLU_DENIZ', label: 'Kabuklu Deniz Ürünleri', category: 'besin' },
  { value: 'SUSAM', label: 'Susam', category: 'besin' },
  { value: 'PENISILIN', label: 'Penisilin', category: 'ilaç' },
  { value: 'ANTIBIYOTIK', label: 'Antibiyotikler', category: 'ilaç' },
  { value: 'ASPIRIN', label: 'Aspirin', category: 'ilaç' },
  { value: 'ARI_SOKMASI', label: 'Arı Sokması', category: 'böcek' },
  { value: 'EŞEK_ARI', label: 'Eşek Arısı', category: 'böcek' },
  { value: 'LATEKS', label: 'Lateks', category: 'kimyasal' },
] as const;

export const MEDICATION_TYPES = [
  { value: 'AĞRI_KESICI', label: 'Ağrı Kesici', category: 'genel' },
  { value: 'ANTIBIYOTIK', label: 'Antibiyotik', category: 'enfeksiyon' },
  { value: 'ASTIM_ILACI', label: 'Astım İlacı', category: 'solunum' },
  { value: 'INSULIN', label: 'İnsülin', category: 'diyabet' },
  { value: 'EPILEPSI_ILACI', label: 'Epilepsi İlacı', category: 'nörolojik' },
  { value: 'DEHB_ILACI', label: 'DEHB İlacı (Ritalin vb.)', category: 'psikiyatrik' },
  { value: 'ANTIHISTAMINIK', label: 'Antihistaminik (Alerji)', category: 'alerji' },
  { value: 'VITAMIN', label: 'Vitamin/Mineral Desteği', category: 'takviye' },
  { value: 'DEMIR_ILACI', label: 'Demir İlacı', category: 'takviye' },
  { value: 'TIROID_ILACI', label: 'Tiroid İlacı', category: 'endokrin' },
  { value: 'KALP_ILACI', label: 'Kalp İlacı', category: 'kardiyovasküler' },
  { value: 'DIGER', label: 'Diğer', category: 'diğer' },
] as const;

// ==================== INTERVENTION TYPES ====================

export const INTERVENTION_TYPES = [
  { value: 'BIREBIR_DERS', label: 'Birebir Ders Desteği', category: 'akademik' },
  { value: 'GRUP_CALISMA', label: 'Grup Çalışması', category: 'akademik' },
  { value: 'ONLINE_DESTEK', label: 'Online Ders Desteği', category: 'akademik' },
  { value: 'OZEL_EGITIM', label: 'Özel Eğitim Desteği', category: 'akademik' },
  { value: 'SINAV_HAZIRLAMA', label: 'Sınav Hazırlık Desteği', category: 'akademik' },
  { value: 'OKUMA_YAZMMA', label: 'Okuma-Yazma Desteği', category: 'akademik' },
  { value: 'MATEMATIK_DESTEK', label: 'Matematik Desteği', category: 'akademik' },
  { value: 'POZITIF_PEKISTIRME', label: 'Pozitif Pekiştirme', category: 'davranışsal' },
  { value: 'DAVRANIS_SOZLESMESI', label: 'Davranış Sözleşmesi', category: 'davranışsal' },
  { value: 'OFKE_YONETIMI', label: 'Öfke Yönetimi', category: 'davranışsal' },
  { value: 'DUYGU_DUZENLEME', label: 'Duygu Düzenleme Eğitimi', category: 'davranışsal' },
  { value: 'MOTIVASYON_ARTIRMA', label: 'Motivasyon Artırma', category: 'davranışsal' },
  { value: 'DIKKAT_YOGUNLASMA', label: 'Dikkat Yoğunlaşma Teknikleri', category: 'davranışsal' },
  { value: 'SOSYAL_BECERI', label: 'Sosyal Beceri Eğitimi', category: 'sosyal' },
  { value: 'AKRAN_DESTEGI', label: 'Akran Desteği Programı', category: 'sosyal' },
  { value: 'GRUP_TERAPISI', label: 'Grup Terapisi', category: 'sosyal' },
  { value: 'CATISMA_COZME', label: 'Çatışma Çözme Eğitimi', category: 'sosyal' },
  { value: 'LIDERLIK_EGITIMI', label: 'Liderlik Eğitimi', category: 'sosyal' },
  { value: 'ILETISIM_BECERISI', label: 'İletişim Becerisi Eğitimi', category: 'sosyal' },
  { value: 'VELI_GORUSMESI', label: 'Veli Görüşmesi', category: 'aile' },
  { value: 'AILE_DANISMANLIGI', label: 'Aile Danışmanlığı', category: 'aile' },
  { value: 'EV_ZIYARETI', label: 'Ev Ziyareti', category: 'aile' },
  { value: 'AILE_EGITIMI', label: 'Aile Eğitimi', category: 'aile' },
  { value: 'VELI_SEMINERI', label: 'Veli Semineri', category: 'aile' },
  { value: 'BIREYSEL_DANISMAN', label: 'Bireysel Danışmanlık', category: 'psikolojik' },
  { value: 'PSIKOLOG_YONLENDIRME', label: 'Psikolog Yönlendirme', category: 'psikolojik' },
  { value: 'PSIKIYATR_YONLENDIRME', label: 'Psikiyatri Yönlendirme', category: 'psikolojik' },
  { value: 'KRIZ_MUDAHALE', label: 'Kriz Müdahalesi', category: 'psikolojik' },
  { value: 'TRAVMA_DESTEGI', label: 'Travma Desteği', category: 'psikolojik' },
  { value: 'MESLEK_REHBERLIGI', label: 'Meslek Rehberliği', category: 'kariyer' },
  { value: 'UNIVERSITE_REHBER', label: 'Üniversite Rehberliği', category: 'kariyer' },
  { value: 'STAJ_PROGRAMI', label: 'Staj Programı', category: 'kariyer' },
  { value: 'MENTOR_ESLESTIRME', label: 'Mentor Eşleştirmesi', category: 'kariyer' },
] as const;

// ==================== BEHAVIOR CATEGORIES ====================

export const BEHAVIOR_CATEGORIES = [
  { value: 'OLUMLU_AKADEMIK', label: 'Olumlu Akademik Davranış', type: 'OLUMLU' },
  { value: 'OLUMLU_SOSYAL', label: 'Olumlu Sosyal Davranış', type: 'OLUMLU' },
  { value: 'OLUMLU_LIDERLIK', label: 'Liderlik/Yardımseverlik', type: 'OLUMLU' },
  { value: 'OLUMLU_SORUMLULUK', label: 'Sorumluluk Alma', type: 'OLUMLU' },
  { value: 'OLUMLU_BASARI', label: 'Başarı/Gelişim', type: 'OLUMLU' },
  
  { value: 'GECIKME', label: 'Derse Geç Kalma', type: 'KÜÇÜK_İHLAL' },
  { value: 'ODEVI_YAPMAMA', label: 'Ödevi Yapmama', type: 'KÜÇÜK_İHLAL' },
  { value: 'MALZEME_EKSIKLIGI', label: 'Malzeme Eksikliği', type: 'KÜÇÜK_İHLAL' },
  { value: 'KONUSMA', label: 'Derste Konuşma', type: 'KÜÇÜK_İHLAL' },
  { value: 'DIKKATSIZLIK', label: 'Dikkatsizlik', type: 'KÜÇÜK_İHLAL' },
  { value: 'KIYAFET_IHLALI', label: 'Kıyafet Kuralı İhlali', type: 'KÜÇÜK_İHLAL' },
  
  { value: 'KURALLARA_UYMAMA', label: 'Okul Kurallarına Uymama', type: 'ORTA_DÜZEY' },
  { value: 'SAYGISIZLIK', label: 'Saygısız Davranış', type: 'ORTA_DÜZEY' },
  { value: 'YALAN', label: 'Yalan Söyleme', type: 'ORTA_DÜZEY' },
  { value: 'KOPYA', label: 'Kopya Çekme', type: 'ORTA_DÜZEY' },
  { value: 'KAVGA_KUCUK', label: 'Küçük Çaplı Kavga', type: 'ORTA_DÜZEY' },
  { value: 'UYGUNSUZ_DIL', label: 'Uygunsuz Dil Kullanımı', type: 'ORTA_DÜZEY' },
  { value: 'TEKNOLOJI_IHLALI', label: 'Teknoloji Kullanım İhlali', type: 'ORTA_DÜZEY' },
  
  { value: 'FIZIKSEL_SIDDET', label: 'Fiziksel Şiddet', type: 'CİDDİ' },
  { value: 'ZORBALIK', label: 'Zorbalık (Bullying)', type: 'CİDDİ' },
  { value: 'TEHDIT', label: 'Tehdit Etme', type: 'CİDDİ' },
  { value: 'HIRSIZLIK', label: 'Hırsızlık', type: 'CİDDİ' },
  { value: 'VANDALIZM', label: 'Vandalizm/Mal Tahribi', type: 'CİDDİ' },
  { value: 'SIBER_ZORBALIK', label: 'Siber Zorbalık', type: 'CİDDİ' },
  { value: 'CINSEL_TACIZ', label: 'Cinsel Taciz', type: 'CİDDİ' },
  
  { value: 'MADDE_KULLANIMI', label: 'Madde Kullanımı', type: 'ÇOK_CİDDİ' },
  { value: 'SILAH_TASIMA', label: 'Silah/Tehlikeli Nesne Taşıma', type: 'ÇOK_CİDDİ' },
  { value: 'CIDDI_SIDDET', label: 'Ciddi Fiziksel Şiddet', type: 'ÇOK_CİDDİ' },
  { value: 'ORGANIZE_ZORBALIK', label: 'Organize Zorbalık/Çete', type: 'ÇOK_CİDDİ' },
  { value: 'KENDINE_ZARAR', label: 'Kendine Zarar Verme', type: 'ÇOK_CİDDİ' },
  { value: 'INTIHAR_GIRISIIMI', label: 'İntihar Girişimi/Tehdidi', type: 'ÇOK_CİDDİ' },
] as const;

// ==================== LEARNING STYLES ====================

export const LEARNING_STYLES = [
  { value: 'GORSEL', label: 'Görsel Öğrenen', description: 'Grafik, şema, resim ile öğrenir' },
  { value: 'ISITSEL', label: 'İşitsel Öğrenen', description: 'Dinleyerek, tartışarak öğrenir' },
  { value: 'KINESTETIK', label: 'Kinestetik Öğrenen', description: 'Yaparak, deneyerek öğrenir' },
  { value: 'OKUMA_YAZMA', label: 'Okuma-Yazma Öğrenen', description: 'Okuyup yazarak öğrenir' },
  { value: 'SOSYAL', label: 'Sosyal Öğrenen', description: 'Grup çalışması ile öğrenir' },
  { value: 'BIREYSEL', label: 'Bireysel Öğrenen', description: 'Yalnız çalışarak öğrenir' },
] as const;

// ==================== MOTIVATION SOURCES ====================

export const MOTIVATION_SOURCES = [
  { value: 'AILE_BEKLENTISI', label: 'Aile Beklentisi', category: 'dışsal' },
  { value: 'OGRETMEN_DESTEGI', label: 'Öğretmen Desteği', category: 'dışsal' },
  { value: 'AKRAN_REKABETI', label: 'Akran Rekabeti', category: 'dışsal' },
  { value: 'BASARI_ODULLERI', label: 'Başarı Ödülleri', category: 'dışsal' },
  { value: 'TOPLUMSAL_TANIM', label: 'Toplumsal Tanınma', category: 'dışsal' },
  { value: 'KISISEL_GELISIM', label: 'Kişisel Gelişim İsteği', category: 'içsel' },
  { value: 'MERAK', label: 'Merak ve Öğrenme Arzusu', category: 'içsel' },
  { value: 'HEDEF_ODAKLILIK', label: 'Hedef Odaklılık', category: 'içsel' },
  { value: 'KONU_ILGISI', label: 'Konu İlgisi', category: 'içsel' },
  { value: 'OZGVUEN', label: 'Özgüven Kazanma', category: 'içsel' },
  { value: 'GELECEK_VIZYONU', label: 'Gelecek Vizyonu', category: 'içsel' },
] as const;

// ==================== RISK PROTECTIVE FACTORS ====================

export const PROTECTIVE_FACTORS = [
  { value: 'GUCLU_AILE_DESTEGI', label: 'Güçlü Aile Desteği', category: 'aile' },
  { value: 'POZITIF_AKRAN', label: 'Pozitif Akran İlişkileri', category: 'sosyal' },
  { value: 'OGRETMEN_MENTOR', label: 'Öğretmen/Mentor Desteği', category: 'okul' },
  { value: 'AKADEMIK_BASARI', label: 'Akademik Başarı', category: 'akademik' },
  { value: 'OZGUVEN', label: 'Yüksek Özgüven', category: 'kişisel' },
  { value: 'DIRENGENLIK', label: 'Dirençlilik (Resilience)', category: 'kişisel' },
  { value: 'PROBLEM_COZME', label: 'Problem Çözme Becerisi', category: 'kişisel' },
  { value: 'DUYGU_DUZENLEME', label: 'Duygu Düzenleme', category: 'kişisel' },
  { value: 'HEDEF_YONELIM', label: 'Hedef Yönelimi', category: 'kişisel' },
  { value: 'EKSTRAKURIKULER', label: 'Ekstraküriküler Aktiviteler', category: 'okul' },
  { value: 'TOPLUM_BAGLARI', label: 'Toplumsal Bağlar', category: 'sosyal' },
  { value: 'KULTUR_KIMLIK', label: 'Kültürel Kimlik', category: 'sosyal' },
  { value: 'EKONOMIK_ISTIKRAR', label: 'Ekonomik İstikrar', category: 'aile' },
] as const;

// ==================== SCALE TYPES ====================

export const SKILL_LEVELS = [
  { value: 'ZAYIF', label: 'Zayıf', score: 1 },
  { value: 'GELISMEKTE', label: 'Gelişmekte', score: 2 },
  { value: 'YETERLI', label: 'Yeterli', score: 3 },
  { value: 'IYI', label: 'İyi', score: 4 },
  { value: 'ILERI', label: 'İleri', score: 5 },
] as const;

export const INTENSITY_LEVELS = [
  { value: 'COK_DUSUK', label: 'Çok Düşük', score: 1 },
  { value: 'DUSUK', label: 'Düşük', score: 2 },
  { value: 'ORTA', label: 'Orta', score: 3 },
  { value: 'YUKSEK', label: 'Yüksek', score: 4 },
  { value: 'COK_YUKSEK', label: 'Çok Yüksek', score: 5 },
] as const;

export const FREQUENCY_LEVELS = [
  { value: 'YOK', label: 'Yok', score: 0 },
  { value: 'NADIREN', label: 'Nadiren', score: 1 },
  { value: 'BAZEN', label: 'Bazen', score: 2 },
  { value: 'SIKLIKLA', label: 'Sıklıkla', score: 3 },
  { value: 'DUZENLI', label: 'Düzenli', score: 4 },
] as const;

// ==================== HELPER FUNCTIONS ====================

export const getTaxonomyLabel = (taxonomy: readonly any[], value: string): string => {
  const item = taxonomy.find((t) => t.value === value);
  return item?.label || value;
};

export const getTaxonomyByCategory = (taxonomy: readonly any[], category: string) => {
  return taxonomy.filter((t) => t.category === category);
};

export const getAllCategories = (taxonomy: readonly any[]): string[] => {
  const categories = new Set(taxonomy.map((t) => t.category).filter(Boolean));
  return Array.from(categories);
};
