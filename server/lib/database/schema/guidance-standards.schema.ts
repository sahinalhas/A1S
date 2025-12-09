import type Database from 'better-sqlite3';

export function createGuidanceStandardsTables(db: Database.Database): void {
  db.exec(`
    DROP TABLE IF EXISTS drp_uc;
    DROP TABLE IF EXISTS drp_iki;
    DROP TABLE IF EXISTS drp_bir;
    DROP TABLE IF EXISTS drp_hizmet_alani;
    DROP TABLE IF EXISTS ana_kategoriler;
    DROP TABLE IF EXISTS guidance_items;
    DROP TABLE IF EXISTS guidance_categories;

    CREATE TABLE IF NOT EXISTS ana_kategoriler (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ad TEXT NOT NULL,
      is_custom INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS drp_hizmet_alani (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ana_kategori_id INTEGER,
      ad TEXT NOT NULL,
      is_custom INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ana_kategori_id) REFERENCES ana_kategoriler(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS drp_bir (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drp_hizmet_alani_id INTEGER,
      ad TEXT NOT NULL,
      is_custom INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (drp_hizmet_alani_id) REFERENCES drp_hizmet_alani(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS drp_iki (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drp_bir_id INTEGER,
      ad TEXT NOT NULL,
      is_custom INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (drp_bir_id) REFERENCES drp_bir(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS drp_uc (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      drp_iki_id INTEGER,
      kod TEXT,
      aciklama TEXT,
      is_custom INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (drp_iki_id) REFERENCES drp_iki(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_drp_hizmet_alani_ana ON drp_hizmet_alani(ana_kategori_id);
    CREATE INDEX IF NOT EXISTS idx_drp_bir_hizmet ON drp_bir(drp_hizmet_alani_id);
    CREATE INDEX IF NOT EXISTS idx_drp_iki_bir ON drp_iki(drp_bir_id);
    CREATE INDEX IF NOT EXISTS idx_drp_uc_iki ON drp_uc(drp_iki_id);
  `);

  console.log('✅ Guidance standards tables created (5 tables)');
}

export function seedGuidanceStandards(db: Database.Database): void {
  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM ana_kategoriler');
  const result = checkStmt.get() as { count: number };

  if (result.count > 0) {
    console.log('✅ Guidance standards already seeded');
    return;
  }

  try {
    db.exec('BEGIN TRANSACTION');

    db.exec(`
      INSERT INTO ana_kategoriler (id, ad) VALUES
      (1, 'Grup Çalışmaları'),
      (2, 'Bireysel Çalışmalar');
    `);

    db.exec(`
      INSERT INTO drp_hizmet_alani (id, ana_kategori_id, ad) VALUES
      (1, 1, 'Ö - GELİŞİMSEL VE ÖNLEYİCİ HİZMETLER'),
      (2, 1, 'İ - İYİLEŞTİRİCİ HİZMETLER'),
      (3, 1, 'D - DESTEK HİZMETLER'),
      (4, 2, 'Ö - GELİŞİMSEL VE ÖNLEYİCİ HİZMETLER'),
      (5, 2, 'İ - İYİLEŞTİRİCİ HİZMETLER'),
      (6, 2, 'D - DESTEK HİZMETLER');
    `);

    db.exec(`
      INSERT INTO drp_bir (id, drp_hizmet_alani_id, ad) VALUES
      (1, 1, 'ÖS - SINIF REHBERLİK PROGRAMI'),
      (2, 1, 'ÖOB - BİREYİ TANIMA ÇALIŞMALARI'),
      (3, 1, 'ÖOV - BİLGİ VERME ÇALIŞMALARI'),
      (4, 1, 'ÖOY - YÖNELTME VE İZLEME'),
      (5, 2, 'İG - GRUPLA PSİKOLOJİK DANIŞMA'),
      (6, 2, 'İP - PSİKOSOSYAL MÜDAHALE'),
      (7, 3, 'DM - MÜŞAVİRLİK'),
      (8, 3, 'DP - PROGRAM YÖNETİMİ, ARAŞTIRMA, PROJE'),
      (9, 3, 'Dİ - İŞ BİRLİĞİ'),
      (10, 3, 'DG - MESLEKİ GELİŞİM'),
      (11, 4, 'ÖOB - BİREYİ TANIMA ÇALIŞMALARI'),
      (12, 4, 'ÖOV - BİLGİ VERME ÇALIŞMALARI'),
      (13, 4, 'ÖOY - YÖNELTME VE İZLEME'),
      (14, 5, 'İB - BİREYSEL PSİKOLOJİK DANIŞMA'),
      (15, 5, 'İP - PSİKOSOSYAL MÜDAHALE'),
      (16, 5, 'İS - SEVK (YÖNLENDİRME)'),
      (17, 6, 'DM - MÜŞAVİRLİK');
    `);

    db.exec(`
      INSERT INTO drp_iki (id, drp_bir_id, ad) VALUES
      (1, 1, 'ÖSO - Okul Öncesi'),
      (2, 1, 'ÖSİ - İlkokul'),
      (3, 1, 'ÖSR - Ortaokul'),
      (4, 1, 'ÖSL - Ortaöğretim'),
      (5, 3, 'ÖOVK - SOSYAL DUYGUSAL GELİŞİM'),
      (6, 3, 'ÖOVE - AKADEMİK GELİŞİM'),
      (7, 3, 'ÖOVM - KARİYER GELİŞİMİ'),
      (8, 7, 'DMV - VELİYE YÖNELİK'),
      (9, 7, 'DMÖ - ÖĞRETMENE YÖNELİK'),
      (10, 7, 'DMD - DİĞER KİŞİLERE YÖNELİK'),
      (11, 9, 'DİT - TOPLANTILAR'),
      (12, 9, 'DİF - FAALİYETLER'),
      (13, 2, 'GRUP BİREYİ TANIMA'),
      (14, 4, 'GRUP YÖNELTME'),
      (15, 6, 'GRUP PSİKOSOSYAL'),
      (16, 8, 'GRUP PROGRAM YÖNETİMİ'),
      (17, 10, 'GRUP MESLEKİ GELİŞİM'),
      (18, 11, 'BİREYSEL BİREYİ TANIMA'),
      (19, 12, 'ÖOVK - SOSYAL DUYGUSAL GELİŞİM'),
      (20, 12, 'ÖOVE - AKADEMİK GELİŞİM'),
      (21, 12, 'ÖOVM - KARİYER GELİŞİMİ'),
      (22, 13, 'BİREYSEL YÖNELTME'),
      (23, 14, 'BİREYSEL DANIŞMA'),
      (24, 15, 'İPbB - BİLDİRİM YÜKÜMLÜLÜĞÜ'),
      (25, 15, 'İPbT - KORUYUCU VE DESTEKLEYİCİ TEDBİR'),
      (26, 15, 'İPbİ - İNTHAR'),
      (27, 16, 'BİREYSEL SEVK'),
      (28, 17, 'DMV - VELİYE YÖNELİK'),
      (29, 17, 'DMÖ - ÖĞRETMENE YÖNELİK');
    `);

    db.exec(`
      INSERT INTO drp_uc (drp_iki_id, kod, aciklama) VALUES
      -- Okul Öncesi
      (1, 'ÖSO', 'Kimden, nereden, ne zaman ve nasıl yardım isteyebileceğini bilir.'),
      -- İlkokul
      (2, 'ÖSİ1', 'Kimden, nereden, ne zaman ve nasıl yardım isteyebileceğini bilir.'),
      (2, 'ÖSİ2', 'Kişisel güvenliği için kişisel alanların gerekliliğini fark eder.'),
      -- Ortaokul
      (3, 'ÖSR5', 'Kimden, nereden, ne zaman ve nasıl yardım isteyebileceğini bilir.'),
      (3, 'ÖSR8', 'Sınavlara ilişkin duygularını açıklar.'),
      -- Ortaöğretim
      (4, 'ÖSL9', 'Zorbalıkla baş etme yollarını kullanır'),
      (4, 'ÖSL9', 'Kimden, nereden, ne zaman ve nasıl yardım isteyebileceğini bilir.'),
      (4, 'ÖSL11', 'Ergen-ebeveyn ilişkilerini değerlendirir.'),
      (4, 'ÖSL034', 'Kişisel sınırların farkında olur.'),
      (4, 'ÖSL035', 'Kendini koruma becerisi kazanır'),
      -- GRUP BİREYİ TANIMA
      (13, 'B.K.P.1.c', 'Yaşam Pencerem'),
      (13, 'S.l.2.a', 'Okul Risk Haritası'),
      (13, 'S.l.4.a', 'Sınıf Risk Haritası'),
      (13, 'B.K.G.4.c', 'Öğrenci Bilgi Formu'),
      (13, 'B.K.O.1.c', 'Bana Kendini Anlat'),
      (13, 'B.G.G.5.a', 'Kimdir Bu'),
      (13, 'B.G.G.6.a', 'Kime Göre Ben Neyim'),
      (13, 'B.G.G.9.a', 'Sosyometri'),
      (13, 'B.G.G.2.c', 'Çocuğumu Tanıyorum'),
      (13, 'B.K.G.3.c', 'Kendimi Tanıyorum'),
      (13, 'B.K.A.7.c', 'Şiddet Algısı Anketi'),
      (13, 'B.K.A.8.c', 'Şiddet Sıklığı Anketi'),
      (13, 'B.K.A.9.c', 'Şiddet Meşruiyeti Anketi'),
      (13, 'B.G.G.10.c', 'Şiddet Algısı Anketi (Veli)'),
      (13, 'B.G.G.11.c', 'Şiddet Sıklığı Anketi (Veli)'),
      (13, 'B.G.G.12.c', 'Şiddet Meşruiyeti Anketi (Veli)'),
      (13, 'B.G.G.13.c', 'Şiddet Algısı Anketi (Öğretmen)'),
      (13, 'B.G.G.14.c', 'Şiddet Sıklığı Anketi (Öğretmen)'),
      (13, 'B.G.G.15.c', 'Şiddet Meşruiyeti Anketi (Öğretmen 4-6.sınıf)'),
      (13, 'B.G.G.16.c', 'Şiddet Meşruiyeti Anketi (Öğretmen 7-12. sınıf)'),
      (13, 'B.K.A.2.c', 'Devamsızlık Nedenleri Anketi'),
      (13, 'B.K.A.15.a', 'RİBA (İlkokul-Öğrenci Formu)'),
      (13, 'B.K.A.16.a', 'RİBA (Ortaokul-Öğrenci Formu)'),
      (13, 'B.K.A.17.a', 'RİBA (Lise-Öğrenci Formu)'),
      (13, 'B.K.A.18.a', 'RİBA (Okul Öncesi-Öğretmen Formu)'),
      (13, 'B.K.A.19.a', 'RİBA (İlkokul-Öğretmen Formu)'),
      (13, 'B.K.A.20.a', 'RİBA(Ortaokul-Öğretmen Formu)'),
      (13, 'B.K.A.21.a', 'RİBA (Lise-Öğretmen Formu)'),
      (13, 'B.K.A.22.a', 'RİBA (Okul Öncesi-Veli Formu)'),
      (13, 'B.K.A.23.a', 'RİBA (İlkokul-Veli Formu)'),
      (13, 'B.K.A.24.a', 'RİBA (Ortaokul-Veli Formu)'),
      (13, 'B.K.A.25.a', 'RİBA (Lise-Veli Formu)'),
      (13, 'B.K.I.1.c', 'Verimli Ders Çalışma Kontrol Listesi'),
      (13, 'B.G.D.1.c', 'Snellen Testi'),
      (13, 'ÖOB2', 'Diğer'),
      -- SOSYAL DUYGUSAL GELİŞİM (GRUP)
      (5, 'ÖOVKg', 'Akran Arabuluculuğu'),
      (5, 'ÖOVKg', 'Akran Zorbalığı'),
      (5, 'ÖOVKg', 'Atılganlık'),
      (5, 'ÖOVKg', 'Bireysel Farklılıklara Saygı'),
      (5, 'ÖOVKg', 'Çatışma Çözme Becerileri'),
      (5, 'ÖOVKg', 'Çocuklarda Cinsel Eğitim'),
      (5, 'ÖOVKg', 'Duygu Kontrolü'),
      (5, 'ÖOVKg', 'Eleştirel Düşünme Becerisi'),
      (5, 'ÖOVKg', 'Ergenleri Bilgilendirme ve Farkındalık Kazandırma Eğitim Programı'),
      (5, 'ÖOVKg', 'Geleceği Planlama'),
      -- YÖNELTME (GRUP)
      (14, 'ÖOY', 'Alan/Dal Tercihleri'),
      (14, 'ÖOY', 'Seçmeli Ders'),
      (14, 'ÖOY', 'Sosyal Kulüpler'),
      (14, 'ÖOY', 'Sosyal ve Kültürel Faaliyetler'),
      -- PSİKOSOSYAL MÜDAHALE (GRUP)
      (15, 'İpg', 'PSD Programı (Güçlendirici-GÖÇ)'),
      (15, 'İpg', 'PSD Programı (Güçlendirici-CİNSEL İSTİSMAR)'),
      (15, 'İpg', 'PSD Programı (Güçlendirici-İNTİHAR)'),
      (15, 'İpg', 'PSD Programı (Güçlendirici-TERÖR)'),
      (15, 'İpg', 'PSD Programı (Güçlendirici-DOĞAL AFET)'),
      (15, 'İpg', 'PSD Programı (Güçlendirici-ÖLÜM YAS)'),
      (15, 'İpg', 'PSD Programı (SALGIN HASTALIK)'),
      -- BİREYSEL BİREYİ TANIMA
      (18, 'B.K.P.1.c', 'Yaşam Pencerem'),
      (18, 'B.K.G.4.c', 'Öğrenci Bilgi Formu'),
      (18, 'B.K.G.12.c', 'Yol Haritam'),
      (18, 'B.K.O.1.c', 'Bana Kendini Anlat'),
      (18, 'B.K.G.3.c', 'Kendimi Tanıyorum'),
      (18, 'B.K.A.7.c', 'Şiddet Algısı Anketi'),
      (18, 'B.K.A.8.c', 'Şiddet Sıklığı Anketi'),
      (18, 'B.K.A.9.c', 'Şiddet Meşruiyeti Anketi'),
      (18, 'B.G.G.10.c', 'Şiddet Algısı Anketi (Veli)'),
      (18, 'B.G.G.11.c', 'Şiddet Sıklığı Anketi (Veli)'),
      (18, 'B.G.G.12.c', 'Şiddet Meşruiyeti Anketi (Veli)'),
      (18, 'B.G.G.13.c', 'Şiddet Algısı Anketi (Öğretmen)'),
      (18, 'B.G.G.14.c', 'Şiddet Sıklığı Anketi (Öğretmen)'),
      (18, 'B.G.G.15.c', 'Şiddet Meşruiyeti Anketi (Öğretmen 4-6.sınıf)'),
      (18, 'B.G.G.16.c', 'Şiddet Meşruiyeti Anketi (Öğretmen 7-12. sınıf)'),
      (18, 'B.K.I.1.c', 'Verimli Ders Çalışma Kontrol Listesi'),
      (18, 'B.G.G.2.c', 'Çocuğumu Tanıyorum Formu'),
      (18, 'B.G.G.1.c', 'Aile içi Gözlem Formu'),
      (18, 'B.G.G.3.c', 'DEHB Gözlem Formu'),
      (18, 'B.G.G.4.c', 'Ev Ziyaret Formu'),
      (18, 'B.G.G.7.c', 'Öğrenci Gözlem Kaydı'),
      (18, 'B.G.G.8.a', 'Özel Öğrenme Güçlüğü Gözlem Formu'),
      (18, 'B.K.G.7.c', 'Öğrenci-Ön görüşme Formu'),
      (18, 'B.K.A.2.c', 'Devamsızlık Nedenleri Anketi'),
      (18, 'ÖOB99', 'Diğer'),
      -- BİREYSEL SOSYAL DUYGUSAL
      (19, 'ÖOVKb', 'Aile'),
      (19, 'ÖOVKb', 'Arkadaşlık İlişkileri'),
      (19, 'ÖOVKb', 'Davranış Sorunları'),
      (19, 'ÖOVKb', 'Psikolojik Uyum'),
      (19, 'ÖOVKb', 'Sağlık'),
      (19, 'ÖOVKb', 'Sosyal Uyum'),
      (19, 'ÖOVKb', 'Sosyo-ekonomik Konular'),
      -- BİREYSEL AKADEMİK
      (20, 'ÖOVEb', 'Başarısızlık Nedenleri'),
      (20, 'ÖOVEb', 'Çalışma Programı Hazırlama'),
      (20, 'ÖOVEb', 'Ders Seçimi'),
      (20, 'ÖOVEb', 'Devamsızlığı Önleme'),
      (20, 'ÖOVEb', 'Devamsızlık Nedenleri'),
      (20, 'ÖOVEb', 'Dikkat Geliştirme Çalışmaları'),
      (20, 'ÖOVEb', 'Hedef Belirleme'),
      (20, 'ÖOVEb', 'Motivasyon'),
      (20, 'ÖOVEb', 'Okul Kuralları'),
      (20, 'ÖOVEb', 'Okul ve Çevresindeki Eğitim Olanakları'),
      -- BİREYSEL PSİKOLOJİK DANIŞMA
      (23, 'İB', 'Aile'),
      (23, 'İB', 'Davranış Sorunları'),
      (23, 'İB', 'Okula ve Çevreye Uyum'),
      (23, 'İB', 'Psikolojik Uyum'),
      (23, 'İB', 'Sağlık'),
      (23, 'İB', 'Sosyal Uyum'),
      (23, 'İB', 'Sosyo-ekonomik Konular'),
      (23, 'İB', 'Yöneltme Yerleştirme'),
      (23, 'İB', 'OBM'),
      -- BİLDİRİM YÜKÜMLÜLÜĞÜ
      (24, 'İPbB', 'Cinsel İstismar'),
      (24, 'İPbB', 'Duygusal İhmal'),
      (24, 'İPbB', 'Duygusal İstismar'),
      (24, 'İPbB', 'Eğitim ile İlgili İhmal'),
      (24, 'İPbB', 'Ekonomik İstismar'),
      (24, 'İPbB', 'Fiziksel İhmal'),
      (24, 'İPbB', 'Fiziksel İstismar'),
      (24, 'İPbB', 'Madde Bulundurma'),
      (24, 'İPbB', 'Madde Kullanımı'),
      (24, 'İPbB', 'Madde Satışı'),
      (24, 'İPbB', 'Sağlık İhmalı'),
      -- KORUYUCU TEDBİR
      (25, 'İPbT', 'Danışmanlık Tedbiri'),
      (25, 'İPbT', 'Danışmanlık ve Eğitim Tedbiri'),
      (25, 'İPbT', 'Eğitim Tedbiri'),
      -- İNTİHAR
      (26, 'İPbİ', 'Tamamlanmamış İntihar'),
      (26, 'İPbİ', 'Tamamlanmış İntihar'),
      -- SEVK
      (27, 'İS', 'RAM'),
      (27, 'İS', 'Sağlık'),
      (27, 'İS', 'Sosyal Hizmet'),
      (27, 'İS', 'Diğer Kurumlar'),
      -- VELİYE YÖNELİK (BİREYSEL)
      (28, 'DMVG', 'Aile'),
      (28, 'DMVG', 'Akademik Konular'),
      (28, 'DMVG', 'Davranış Sorunları'),
      (28, 'DMVG', 'Okula ve Çevreye Uyum'),
      (28, 'DMVG', 'Psikolojik Uyum'),
      (28, 'DMVG', 'Sağlık'),
      (28, 'DMVG', 'Sosyal Uyum'),
      (28, 'DMVG', 'Sosyo-ekonomik Konular'),
      (28, 'DMVG', 'Yönetime Yerleştirme'),
      -- ÖĞRETMENE YÖNELİK (BİREYSEL)
      (29, 'DMÖG', 'Aile'),
      (29, 'DMÖG', 'Akademik Konular'),
      (29, 'DMÖG', 'Davranış Sorunları'),
      (29, 'DMÖG', 'Okula ve Çevreye Uyum'),
      (29, 'DMÖG', 'Psikolojik Uyum'),
      (29, 'DMÖG', 'Sağlık'),
      (29, 'DMÖG', 'Sosyal Uyum'),
      (29, 'DMÖG', 'Sosyo-ekonomik Konular'),
      (29, 'DMÖG', 'Yönetime Yerleştirme');
    `);

    db.exec('COMMIT');
    console.log('✅ Guidance standards seeded with all default data');
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('❌ Error seeding guidance standards:', error);
    throw error;
  }
}

export function resetGuidanceStandardsToDefaults(db: Database.Database): void {
  try {
    db.exec('BEGIN TRANSACTION');
    db.exec('DELETE FROM drp_uc');
    db.exec('DELETE FROM drp_iki');
    db.exec('DELETE FROM drp_bir');
    db.exec('DELETE FROM drp_hizmet_alani');
    db.exec('DELETE FROM ana_kategoriler');
    db.exec('COMMIT');
    
    seedGuidanceStandards(db);
    console.log('✅ Guidance standards reset to defaults');
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('❌ Error resetting guidance standards:', error);
    throw error;
  }
}
