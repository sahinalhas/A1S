# Okul İzolasyonu Analizi ve Düzeltme Planı

## 📋 Özet
Bu dokümanda, A1S uygulamasındaki tüm veritabanı şemalarının okul izolasyonu durumu analiz edilmiş ve eksik olan tablolar tespit edilmiştir.

## ✅ Okul İzolasyonu Mevcut Olan Tablolar

### 1. **students** tablosu
- ✅ `schoolId` kolonu mevcut
- ✅ Foreign key: `FOREIGN KEY (schoolId) REFERENCES schools (id) ON DELETE CASCADE`
- ✅ Index: `idx_students_schoolId`

### 2. **academic.schema.ts** - Akademik Tablolar
Aşağıdaki tablolarda `schoolId` kolonu **MEVCUT**:
- ✅ `academic_records`
- ✅ `interventions`
- ✅ `progress`
- ✅ `academic_goals`
- ✅ `study_sessions`
- ✅ `notes`
- ✅ `study_assignments`
- ✅ `exam_results`
- ✅ `behavior_incidents`
- ✅ `attendance_records`

### 3. **counseling.schema.ts** - Rehberlik Tablolar
- ✅ `counseling_sessions` - schoolId mevcut

### 4. **exam-management.schema.ts** - Sınav Yönetimi
- ✅ `exam_sessions` - school_id mevcut

### 5. **notifications.schema.ts** - Bildirim Tablolar
Aşağıdaki tablolarda `schoolId` kolonu **MEVCUT**:
- ✅ `notification_logs`
- ✅ `notification_preferences`
- ✅ `parent_access_tokens`
- ✅ `scheduled_tasks`

### 6. **early-warning.schema.ts** - Erken Uyarı Tablolar
Aşağıdaki tablolarda `schoolId` kolonu **MEVCUT**:
- ✅ `risk_score_history`
- ✅ `early_warning_alerts`
- ✅ `intervention_recommendations`
- ✅ `intervention_effectiveness`
- ✅ `parent_feedback`
- ✅ `escalation_logs`

---

## ❌ Okul İzolasyonu EKSİK Olan Tablolar

### 1. **subjects** ve **topics** (academic.schema.ts)
**SORUN**: Bu tablolar tüm okullar için ortak kullanılıyor, schoolId yok
**ETKİ**: Bir okul ders/konu eklediğinde diğer okullar da görüyor
**ÇÖZÜM**: Her iki tabloya da `schoolId` kolonu eklenmelidir

### 2. **counseling.schema.ts** - Rehberlik Tablolar
**EKSİK** tablolar:
- ❌ `meeting_notes` - schoolId YOK
- ❌ `counseling_session_students` - schoolId YOK
- ❌ `parent_meetings` - schoolId YOK
- ❌ `home_visits` - schoolId YOK
- ❌ `family_participation` - schoolId YOK
- ❌ `counseling_reminders` - schoolId YOK
- ❌ `counseling_follow_ups` - schoolId YOK
- ❌ `counseling_outcomes` - schoolId YOK
- ❌ `peer_relationships` - schoolId YOK

### 3. **exam-management.schema.ts** - Sınav Yönetimi
**EKSİK** tablolar:
- ❌ `exam_types` - Tüm okullar için ortak (TYT, AYT, LGS, YDT)
- ❌ `exam_subjects` - Tüm okullar için ortak
- ❌ `exam_session_results` - schoolId YOK
- ❌ `school_exam_results` - schoolId YOK
- ❌ `student_exam_goals` - schoolId YOK
- ❌ `question_analysis` - schoolId YOK
- ❌ `subject_performance_heatmap` - schoolId YOK
- ❌ `exam_benchmarks` - schoolId YOK
- ❌ `exam_time_analysis` - schoolId YOK
- ❌ `exam_predictions` - schoolId YOK
- ❌ `exam_alerts` - schoolId YOK
- ❌ `student_development_plans` - schoolId YOK

### 4. **surveys.schema.ts** - Anket Tablolar
**EKSİK** tablolar:
- ❌ `survey_templates` - Tüm okullar için ortak şablonlar
- ❌ `survey_questions` - Tüm okullar için ortak
- ❌ `survey_distributions` - schoolId YOK
- ❌ `survey_responses` - schoolId YOK
- ❌ `surveys` - schoolId YOK
- ❌ `survey_distribution_codes` - schoolId YOK

### 5. **career-guidance.schema.ts** - Kariyer Rehberliği
**EKSİK** tablolar:
- ❌ `career_profiles` - Tüm okullar için ortak meslek profilleri
- ❌ `student_career_targets` - schoolId YOK
- ❌ `career_analysis_history` - schoolId YOK
- ❌ `career_roadmaps` - schoolId YOK
- ❌ `student_competencies` - schoolId YOK

### 6. **holistic-profile.schema.ts** - Bütünsel Profil
**EKSİK** tablolar:
- ❌ `student_future_vision` - schoolId YOK
- ❌ `student_strengths` - schoolId YOK
- ❌ `student_interests` - schoolId YOK
- ❌ `student_sel_competencies` - schoolId YOK
- ❌ `student_socioeconomic` - schoolId YOK

### 7. **student_documents** ve **attendance** (students.schema.ts)
**EKSİK** tablolar:
- ❌ `student_documents` - schoolId YOK
- ❌ `attendance` - schoolId YOK (eski tablo, attendance_records var)

### 8. **notifications.schema.ts**
**EKSİK** tablolar:
- ❌ `notification_templates` - Tüm okullar için ortak şablonlar (bu normal olabilir)

### 9. **Coaching Klasöründeki Tablolar** (coaching/*.schema.ts)
İncelenmesi gereken dosyalar:
- achievements.schema.ts
- coaching-recommendations.schema.ts
- evaluations-360.schema.ts
- learning-styles.schema.ts
- multiple-intelligence.schema.ts
- self-assessments.schema.ts
- smart-goals.schema.ts

---

## 🎯 Düzeltme Stratejisi

### Kategori 1: Ortak Referans Tabloları (Okul İzolasyonu GEREKMİYOR)
Bu tablolar tüm okullar için ortak kullanılmalı:
- `exam_types` (TYT, AYT, LGS, YDT)
- `exam_subjects` (Her sınav türü için dersler)
- `career_profiles` (Meslek profilleri)
- `notification_templates` (Bildirim şablonları)
- `survey_templates` ve `survey_questions` (Varsayılan anket şablonları)

### Kategori 2: Öğrenci Bazlı Tablolar (schoolId EKLENMELİ)
Bu tablolar öğrenciye bağlı ve schoolId eklenmelidir:
- Tüm `student_*` ile başlayan tablolar
- `meeting_notes`, `parent_meetings`, `home_visits`, `family_participation`
- `counseling_*` tabloları
- `exam_session_results`, `school_exam_results`
- `survey_distributions`, `survey_responses`, `surveys`
- `career_roadmaps`, `career_analysis_history`, `student_career_targets`

### Kategori 3: Ders/Konu Tabloları (ÖZEL DURUM)
`subjects` ve `topics` tabloları için iki seçenek:
1. **Seçenek A**: Her okul kendi ders/konularını oluşturur (schoolId ekle)
2. **Seçenek B**: Ortak ders/konu havuzu + okul bazlı özelleştirme

**ÖNERİ**: Seçenek A - Her okul kendi ders/konularını yönetsin

---

## 📝 Düzeltme Adımları

### Adım 1: Öğrenci Bazlı Tabloları Düzelt
1. `counseling.schema.ts` - 9 tablo
2. `exam-management.schema.ts` - 12 tablo
3. `surveys.schema.ts` - 6 tablo
4. `career-guidance.schema.ts` - 5 tablo
5. `holistic-profile.schema.ts` - 5 tablo
6. `students.schema.ts` - 2 tablo

### Adım 2: Ders/Konu Tablolarını Düzelt
1. `subjects` tablosuna schoolId ekle
2. `topics` tablosuna schoolId ekle

### Adım 3: Coaching Tablolarını İncele ve Düzelt
1. Her dosyayı incele
2. Gerekli yerlere schoolId ekle

### Adım 4: Migration ve Index Oluştur
1. Tüm yeni schoolId kolonları için index oluştur
2. Mevcut veriler için schoolId populate et
3. Foreign key constraint'leri ekle

---

## 🔍 Kritik Noktalar

### 1. Veri Bütünlüğü
- Öğrenci ile ilişkili tüm tablolarda schoolId, öğrencinin schoolId'si ile eşleşmelidir
- Migration sırasında mevcut veriler için schoolId populate edilmelidir

### 2. Query Performansı
- Tüm schoolId kolonları için index oluşturulmalıdır
- Composite index'ler düşünülmelidir (örn: studentId + schoolId)

### 3. Uygulama Katmanı
- Tüm repository'lerde schoolId filtresi eklenmelidir
- API endpoint'lerinde schoolId kontrolü yapılmalıdır
- Middleware'de aktif okul kontrolü olmalıdır

### 4. Seed Data
- Varsayılan veriler (exam_types, subjects, vb.) için schoolId stratejisi belirlenmelidir
- Her yeni okul için varsayılan veriler otomatik oluşturulmalıdır

---

## 📊 Toplam Etkilenen Tablo Sayısı

- ✅ Okul izolasyonu MEVCUT: **21 tablo**
- ❌ Okul izolasyonu EKSİK: **~45 tablo**
- 🔄 Ortak kullanılmalı (izolasyon gerekmez): **5 tablo**

**TOPLAM DÜZELTİLMESİ GEREKEN: ~45 tablo**
