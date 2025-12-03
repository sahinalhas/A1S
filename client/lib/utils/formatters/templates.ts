import { toast } from "sonner";
import type { ScheduleTemplate, WeeklySlot, StudySubject, TemplateCustomization } from "../../types/study.types";
import { 
  loadSubjects, 
  loadSubjectsAsync, 
  saveSubjects,
  getWeeklySlotsByStudent,
  removeWeeklySlot,
  saveWeeklySlots,
  loadWeeklySlots
} from "../../api/endpoints/study.api";
import { apiClient } from "../../api/core/client";

const SCHEDULE_TEMPLATES: ScheduleTemplate[] = [
  // ========== OKUL DERSLERİ ŞABLONLARI ==========
  {
    id: 'okul-5-sinif-hafif',
    name: '5. Sınıf Hafif Program',
    description: 'Günde 1-1.5 saat dengeli tekrar - Dikkat süresi 25-30 dk bloklar, oyunlaştırma destekli',
    category: 'Okul',
    estimatedWeeklyHours: 7,
    difficulty: 'Kolay',
    tags: ['okul', '5.sınıf', 'hafif', 'başlangıç', 'dikkat-geliştirme'],
    subjects: [
      { id: 'mat-5', name: 'Matematik', category: 'Okul' },
      { id: 'tur-5', name: 'Türkçe', category: 'Okul' },
      { id: 'fen-5', name: 'Fen Bilimleri', category: 'Okul' },
      { id: 'sos-5', name: 'Sosyal Bilgiler', category: 'Okul' },
      { id: 'ing-5', name: 'İngilizce', category: 'Okul' }
    ],
    slots: [
      { day: 1, start: '16:00', end: '16:30', subjectId: 'mat-5' },
      { day: 1, start: '17:00', end: '17:30', subjectId: 'tur-5' },
      { day: 2, start: '16:00', end: '16:30', subjectId: 'fen-5' },
      { day: 2, start: '17:00', end: '17:30', subjectId: 'ing-5' },
      { day: 3, start: '16:00', end: '16:30', subjectId: 'mat-5' },
      { day: 3, start: '17:00', end: '17:30', subjectId: 'sos-5' },
      { day: 4, start: '16:00', end: '16:30', subjectId: 'tur-5' },
      { day: 4, start: '17:00', end: '17:30', subjectId: 'fen-5' },
      { day: 5, start: '16:00', end: '16:30', subjectId: 'mat-5' },
      { day: 5, start: '17:00', end: '17:30', subjectId: 'ing-5' },
      { day: 6, start: '10:00', end: '11:00', subjectId: 'mat-5' },
      { day: 6, start: '14:00', end: '15:00', subjectId: 'tur-5' }
    ]
  },
  {
    id: 'okul-5-sinif-dengeli',
    name: '5. Sınıf Dengeli Program',
    description: 'Günde 1.5-2 saat - Görsel ve işitsel öğrenme teknikleri, aktif katılım odaklı',
    category: 'Okul',
    estimatedWeeklyHours: 11,
    difficulty: 'Orta',
    tags: ['okul', '5.sınıf', 'dengeli', 'aktif-öğrenme', 'çoklu-zeka'],
    subjects: [
      { id: 'mat-5', name: 'Matematik', category: 'Okul' },
      { id: 'tur-5', name: 'Türkçe', category: 'Okul' },
      { id: 'fen-5', name: 'Fen Bilimleri', category: 'Okul' },
      { id: 'sos-5', name: 'Sosyal Bilgiler', category: 'Okul' },
      { id: 'ing-5', name: 'İngilizce', category: 'Okul' },
      { id: 'din-5', name: 'Din Kültürü', category: 'Okul' }
    ],
    slots: [
      { day: 1, start: '16:00', end: '16:45', subjectId: 'mat-5' },
      { day: 1, start: '17:00', end: '17:45', subjectId: 'tur-5' },
      { day: 2, start: '16:00', end: '16:45', subjectId: 'fen-5' },
      { day: 2, start: '17:00', end: '17:45', subjectId: 'ing-5' },
      { day: 3, start: '16:00', end: '16:45', subjectId: 'mat-5' },
      { day: 3, start: '17:00', end: '17:45', subjectId: 'sos-5' },
      { day: 4, start: '16:00', end: '16:45', subjectId: 'tur-5' },
      { day: 4, start: '17:00', end: '17:45', subjectId: 'din-5' },
      { day: 5, start: '16:00', end: '16:45', subjectId: 'mat-5' },
      { day: 5, start: '17:00', end: '17:45', subjectId: 'fen-5' },
      { day: 6, start: '10:00', end: '11:30', subjectId: 'mat-5' },
      { day: 6, start: '14:00', end: '15:00', subjectId: 'tur-5' },
      { day: 7, start: '10:00', end: '11:00', subjectId: 'ing-5' }
    ]
  },
  {
    id: 'okul-6-sinif-hafif',
    name: '6. Sınıf Hafif Program',
    description: 'Günde 1.5 saat - Kavram haritaları ve not alma teknikleri ile destekli öğrenme',
    category: 'Okul',
    estimatedWeeklyHours: 9,
    difficulty: 'Kolay',
    tags: ['okul', '6.sınıf', 'hafif', 'kavram-haritası', 'not-alma'],
    subjects: [
      { id: 'mat-6', name: 'Matematik', category: 'Okul' },
      { id: 'tur-6', name: 'Türkçe', category: 'Okul' },
      { id: 'fen-6', name: 'Fen Bilimleri', category: 'Okul' },
      { id: 'sos-6', name: 'Sosyal Bilgiler', category: 'Okul' },
      { id: 'ing-6', name: 'İngilizce', category: 'Okul' }
    ],
    slots: [
      { day: 1, start: '16:00', end: '16:45', subjectId: 'mat-6' },
      { day: 1, start: '17:00', end: '17:45', subjectId: 'tur-6' },
      { day: 2, start: '16:00', end: '16:45', subjectId: 'fen-6' },
      { day: 2, start: '17:00', end: '17:30', subjectId: 'ing-6' },
      { day: 3, start: '16:00', end: '16:45', subjectId: 'mat-6' },
      { day: 3, start: '17:00', end: '17:45', subjectId: 'sos-6' },
      { day: 4, start: '16:00', end: '16:45', subjectId: 'tur-6' },
      { day: 4, start: '17:00', end: '17:30', subjectId: 'fen-6' },
      { day: 5, start: '16:00', end: '16:45', subjectId: 'mat-6' },
      { day: 5, start: '17:00', end: '17:30', subjectId: 'ing-6' },
      { day: 6, start: '10:00', end: '11:00', subjectId: 'mat-6' },
      { day: 6, start: '14:00', end: '15:00', subjectId: 'tur-6' }
    ]
  },
  {
    id: 'okul-6-sinif-dengeli',
    name: '6. Sınıf Dengeli Program',
    description: 'Günde 2 saat - Interleaving (karışık) çalışma tekniği ile uzun süreli hafıza',
    category: 'Okul',
    estimatedWeeklyHours: 13,
    difficulty: 'Orta',
    tags: ['okul', '6.sınıf', 'dengeli', 'interleaving', 'uzun-süreli-hafıza'],
    subjects: [
      { id: 'mat-6', name: 'Matematik', category: 'Okul' },
      { id: 'tur-6', name: 'Türkçe', category: 'Okul' },
      { id: 'fen-6', name: 'Fen Bilimleri', category: 'Okul' },
      { id: 'sos-6', name: 'Sosyal Bilgiler', category: 'Okul' },
      { id: 'ing-6', name: 'İngilizce', category: 'Okul' },
      { id: 'din-6', name: 'Din Kültürü', category: 'Okul' }
    ],
    slots: [
      { day: 1, start: '16:00', end: '17:00', subjectId: 'mat-6' },
      { day: 1, start: '17:30', end: '18:15', subjectId: 'tur-6' },
      { day: 2, start: '16:00', end: '17:00', subjectId: 'fen-6' },
      { day: 2, start: '17:30', end: '18:15', subjectId: 'ing-6' },
      { day: 3, start: '16:00', end: '17:00', subjectId: 'mat-6' },
      { day: 3, start: '17:30', end: '18:15', subjectId: 'sos-6' },
      { day: 4, start: '16:00', end: '17:00', subjectId: 'tur-6' },
      { day: 4, start: '17:30', end: '18:15', subjectId: 'din-6' },
      { day: 5, start: '16:00', end: '17:00', subjectId: 'mat-6' },
      { day: 5, start: '17:30', end: '18:15', subjectId: 'fen-6' },
      { day: 6, start: '10:00', end: '11:30', subjectId: 'mat-6' },
      { day: 6, start: '14:00', end: '15:30', subjectId: 'tur-6' },
      { day: 7, start: '10:00', end: '11:00', subjectId: 'fen-6' }
    ]
  },
  {
    id: 'okul-7-sinif-hafif',
    name: '7. Sınıf Hafif Program',
    description: 'Günde 1.5-2 saat - Cornell not sistemi ve özet çıkarma teknikleri',
    category: 'Okul',
    estimatedWeeklyHours: 10,
    difficulty: 'Kolay',
    tags: ['okul', '7.sınıf', 'hafif', 'cornell-not', 'özet-çıkarma'],
    subjects: [
      { id: 'mat-7', name: 'Matematik', category: 'Okul' },
      { id: 'tur-7', name: 'Türkçe', category: 'Okul' },
      { id: 'fen-7', name: 'Fen Bilimleri', category: 'Okul' },
      { id: 'sos-7', name: 'Sosyal Bilgiler', category: 'Okul' },
      { id: 'ing-7', name: 'İngilizce', category: 'Okul' }
    ],
    slots: [
      { day: 1, start: '16:00', end: '17:00', subjectId: 'mat-7' },
      { day: 1, start: '17:30', end: '18:15', subjectId: 'tur-7' },
      { day: 2, start: '16:00', end: '17:00', subjectId: 'fen-7' },
      { day: 2, start: '17:30', end: '18:00', subjectId: 'ing-7' },
      { day: 3, start: '16:00', end: '17:00', subjectId: 'mat-7' },
      { day: 3, start: '17:30', end: '18:15', subjectId: 'sos-7' },
      { day: 4, start: '16:00', end: '17:00', subjectId: 'tur-7' },
      { day: 4, start: '17:30', end: '18:00', subjectId: 'fen-7' },
      { day: 5, start: '16:00', end: '17:00', subjectId: 'mat-7' },
      { day: 5, start: '17:30', end: '18:00', subjectId: 'ing-7' },
      { day: 6, start: '10:00', end: '11:30', subjectId: 'mat-7' },
      { day: 6, start: '14:00', end: '15:00', subjectId: 'tur-7' }
    ]
  },
  {
    id: 'okul-7-sinif-dengeli',
    name: '7. Sınıf Dengeli Program',
    description: 'Günde 2-2.5 saat - Pomodoro + Spaced Repetition ile pekiştirmeli öğrenme',
    category: 'Okul',
    estimatedWeeklyHours: 16,
    difficulty: 'Orta',
    tags: ['okul', '7.sınıf', 'dengeli', 'pomodoro', 'spaced-repetition'],
    subjects: [
      { id: 'mat-7', name: 'Matematik', category: 'Okul' },
      { id: 'tur-7', name: 'Türkçe', category: 'Okul' },
      { id: 'fen-7', name: 'Fen Bilimleri', category: 'Okul' },
      { id: 'sos-7', name: 'Sosyal Bilgiler', category: 'Okul' },
      { id: 'ing-7', name: 'İngilizce', category: 'Okul' },
      { id: 'din-7', name: 'Din Kültürü', category: 'Okul' }
    ],
    slots: [
      { day: 1, start: '16:00', end: '17:15', subjectId: 'mat-7' },
      { day: 1, start: '17:45', end: '18:45', subjectId: 'tur-7' },
      { day: 2, start: '16:00', end: '17:15', subjectId: 'fen-7' },
      { day: 2, start: '17:45', end: '18:30', subjectId: 'ing-7' },
      { day: 3, start: '16:00', end: '17:15', subjectId: 'mat-7' },
      { day: 3, start: '17:45', end: '18:45', subjectId: 'sos-7' },
      { day: 4, start: '16:00', end: '17:15', subjectId: 'tur-7' },
      { day: 4, start: '17:45', end: '18:30', subjectId: 'din-7' },
      { day: 5, start: '16:00', end: '17:15', subjectId: 'mat-7' },
      { day: 5, start: '17:45', end: '18:30', subjectId: 'fen-7' },
      { day: 6, start: '10:00', end: '12:00', subjectId: 'mat-7' },
      { day: 6, start: '14:00', end: '15:30', subjectId: 'tur-7' },
      { day: 7, start: '10:00', end: '11:30', subjectId: 'fen-7' }
    ]
  },
  {
    id: 'okul-7-sinif-yogun',
    name: '7. Sınıf Yoğun Program',
    description: 'Günde 3 saat - LGS hazırlık öncesi kapsamlı çalışma, soru çözümü ağırlıklı',
    category: 'Okul',
    estimatedWeeklyHours: 20,
    difficulty: 'Yoğun',
    tags: ['okul', '7.sınıf', 'yoğun', 'lgs-hazırlık', 'soru-çözümü'],
    subjects: [
      { id: 'mat-7', name: 'Matematik', category: 'Okul' },
      { id: 'tur-7', name: 'Türkçe', category: 'Okul' },
      { id: 'fen-7', name: 'Fen Bilimleri', category: 'Okul' },
      { id: 'sos-7', name: 'Sosyal Bilgiler', category: 'Okul' },
      { id: 'ing-7', name: 'İngilizce', category: 'Okul' },
      { id: 'din-7', name: 'Din Kültürü', category: 'Okul' }
    ],
    slots: [
      { day: 1, start: '16:00', end: '17:30', subjectId: 'mat-7' },
      { day: 1, start: '18:00', end: '19:00', subjectId: 'tur-7' },
      { day: 2, start: '16:00', end: '17:30', subjectId: 'fen-7' },
      { day: 2, start: '18:00', end: '19:00', subjectId: 'mat-7' },
      { day: 3, start: '16:00', end: '17:30', subjectId: 'tur-7' },
      { day: 3, start: '18:00', end: '19:00', subjectId: 'sos-7' },
      { day: 4, start: '16:00', end: '17:30', subjectId: 'mat-7' },
      { day: 4, start: '18:00', end: '19:00', subjectId: 'ing-7' },
      { day: 5, start: '16:00', end: '17:30', subjectId: 'fen-7' },
      { day: 5, start: '18:00', end: '19:00', subjectId: 'din-7' },
      { day: 6, start: '09:00', end: '11:00', subjectId: 'mat-7' },
      { day: 6, start: '14:00', end: '16:00', subjectId: 'tur-7' },
      { day: 7, start: '10:00', end: '12:00', subjectId: 'fen-7' },
      { day: 7, start: '14:00', end: '15:30', subjectId: 'sos-7' }
    ]
  },
  {
    id: 'okul-8-sinif-hafif',
    name: '8. Sınıf Hafif Program',
    description: 'Günde 2 saat - Okul derslerini takip etmeye odaklı, hafif tempo',
    category: 'Okul',
    estimatedWeeklyHours: 12,
    difficulty: 'Kolay',
    tags: ['okul', '8.sınıf', 'hafif', 'okul-takibi', 'stressiz'],
    subjects: [
      { id: 'mat-8', name: 'Matematik', category: 'Okul' },
      { id: 'tur-8', name: 'Türkçe', category: 'Okul' },
      { id: 'fen-8', name: 'Fen Bilimleri', category: 'Okul' },
      { id: 'sos-8', name: 'Sosyal Bilgiler', category: 'Okul' },
      { id: 'ing-8', name: 'İngilizce', category: 'Okul' }
    ],
    slots: [
      { day: 1, start: '16:00', end: '17:00', subjectId: 'mat-8' },
      { day: 1, start: '17:30', end: '18:30', subjectId: 'tur-8' },
      { day: 2, start: '16:00', end: '17:00', subjectId: 'fen-8' },
      { day: 2, start: '17:30', end: '18:15', subjectId: 'ing-8' },
      { day: 3, start: '16:00', end: '17:00', subjectId: 'mat-8' },
      { day: 3, start: '17:30', end: '18:30', subjectId: 'sos-8' },
      { day: 4, start: '16:00', end: '17:00', subjectId: 'tur-8' },
      { day: 4, start: '17:30', end: '18:15', subjectId: 'fen-8' },
      { day: 5, start: '16:00', end: '17:00', subjectId: 'mat-8' },
      { day: 5, start: '17:30', end: '18:15', subjectId: 'ing-8' },
      { day: 6, start: '10:00', end: '11:30', subjectId: 'mat-8' },
      { day: 6, start: '14:00', end: '15:30', subjectId: 'tur-8' }
    ]
  },
  {
    id: 'okul-8-sinif-dengeli',
    name: '8. Sınıf Dengeli Program',
    description: 'Günde 2.5 saat - Okul + LGS paralel hazırlık, konu tekrarı ve pekiştirme',
    category: 'Okul',
    estimatedWeeklyHours: 17,
    difficulty: 'Orta',
    tags: ['okul', '8.sınıf', 'dengeli', 'lgs-paralel', 'konu-tekrarı'],
    subjects: [
      { id: 'mat-8', name: 'Matematik', category: 'Okul' },
      { id: 'tur-8', name: 'Türkçe', category: 'Okul' },
      { id: 'fen-8', name: 'Fen Bilimleri', category: 'Okul' },
      { id: 'sos-8', name: 'Sosyal Bilgiler', category: 'Okul' },
      { id: 'ing-8', name: 'İngilizce', category: 'Okul' },
      { id: 'din-8', name: 'Din Kültürü', category: 'Okul' }
    ],
    slots: [
      { day: 1, start: '16:00', end: '17:15', subjectId: 'mat-8' },
      { day: 1, start: '17:45', end: '19:00', subjectId: 'tur-8' },
      { day: 2, start: '16:00', end: '17:15', subjectId: 'fen-8' },
      { day: 2, start: '17:45', end: '18:45', subjectId: 'mat-8' },
      { day: 3, start: '16:00', end: '17:15', subjectId: 'tur-8' },
      { day: 3, start: '17:45', end: '18:45', subjectId: 'sos-8' },
      { day: 4, start: '16:00', end: '17:15', subjectId: 'mat-8' },
      { day: 4, start: '17:45', end: '18:30', subjectId: 'ing-8' },
      { day: 5, start: '16:00', end: '17:15', subjectId: 'fen-8' },
      { day: 5, start: '17:45', end: '18:30', subjectId: 'din-8' },
      { day: 6, start: '09:30', end: '11:30', subjectId: 'mat-8' },
      { day: 6, start: '14:00', end: '15:30', subjectId: 'tur-8' },
      { day: 7, start: '10:00', end: '11:30', subjectId: 'fen-8' },
      { day: 7, start: '14:00', end: '15:00', subjectId: 'sos-8' }
    ]
  },
  {
    id: 'okul-lise-9-hafif',
    name: '9. Sınıf Hafif Program',
    description: 'Günde 2 saat - Lise adaptasyonu, temel kavramlar ve çalışma alışkanlığı',
    category: 'Okul',
    estimatedWeeklyHours: 12,
    difficulty: 'Kolay',
    tags: ['okul', '9.sınıf', 'lise', 'adaptasyon', 'temel-kavramlar'],
    subjects: [
      { id: 'mat-9', name: 'Matematik', category: 'Okul' },
      { id: 'tur-9', name: 'Türk Dili ve Edebiyatı', category: 'Okul' },
      { id: 'fiz-9', name: 'Fizik', category: 'Okul' },
      { id: 'kim-9', name: 'Kimya', category: 'Okul' },
      { id: 'biy-9', name: 'Biyoloji', category: 'Okul' },
      { id: 'tar-9', name: 'Tarih', category: 'Okul' }
    ],
    slots: [
      { day: 1, start: '16:30', end: '17:30', subjectId: 'mat-9' },
      { day: 1, start: '18:00', end: '19:00', subjectId: 'tur-9' },
      { day: 2, start: '16:30', end: '17:30', subjectId: 'fiz-9' },
      { day: 2, start: '18:00', end: '18:45', subjectId: 'kim-9' },
      { day: 3, start: '16:30', end: '17:30', subjectId: 'mat-9' },
      { day: 3, start: '18:00', end: '18:45', subjectId: 'tar-9' },
      { day: 4, start: '16:30', end: '17:30', subjectId: 'tur-9' },
      { day: 4, start: '18:00', end: '18:45', subjectId: 'biy-9' },
      { day: 5, start: '16:30', end: '17:30', subjectId: 'mat-9' },
      { day: 5, start: '18:00', end: '18:45', subjectId: 'fiz-9' },
      { day: 6, start: '10:00', end: '11:30', subjectId: 'mat-9' },
      { day: 6, start: '14:00', end: '15:00', subjectId: 'tur-9' }
    ]
  },
  {
    id: 'okul-lise-9-dengeli',
    name: '9. Sınıf Dengeli Program',
    description: 'Günde 2.5 saat - Sayısal ve sözel dersler arası denge, aktif öğrenme',
    category: 'Okul',
    estimatedWeeklyHours: 15,
    difficulty: 'Orta',
    tags: ['okul', '9.sınıf', 'lise', 'dengeli', 'aktif-öğrenme'],
    subjects: [
      { id: 'mat-9', name: 'Matematik', category: 'Okul' },
      { id: 'tur-9', name: 'Türk Dili ve Edebiyatı', category: 'Okul' },
      { id: 'fiz-9', name: 'Fizik', category: 'Okul' },
      { id: 'kim-9', name: 'Kimya', category: 'Okul' },
      { id: 'biy-9', name: 'Biyoloji', category: 'Okul' },
      { id: 'tar-9', name: 'Tarih', category: 'Okul' },
      { id: 'cog-9', name: 'Coğrafya', category: 'Okul' }
    ],
    slots: [
      { day: 1, start: '16:30', end: '17:45', subjectId: 'mat-9' },
      { day: 1, start: '18:15', end: '19:15', subjectId: 'tur-9' },
      { day: 2, start: '16:30', end: '17:45', subjectId: 'fiz-9' },
      { day: 2, start: '18:15', end: '19:00', subjectId: 'kim-9' },
      { day: 3, start: '16:30', end: '17:45', subjectId: 'mat-9' },
      { day: 3, start: '18:15', end: '19:00', subjectId: 'tar-9' },
      { day: 4, start: '16:30', end: '17:45', subjectId: 'tur-9' },
      { day: 4, start: '18:15', end: '19:00', subjectId: 'biy-9' },
      { day: 5, start: '16:30', end: '17:45', subjectId: 'mat-9' },
      { day: 5, start: '18:15', end: '19:00', subjectId: 'cog-9' },
      { day: 6, start: '10:00', end: '12:00', subjectId: 'mat-9' },
      { day: 6, start: '14:00', end: '15:30', subjectId: 'fiz-9' },
      { day: 7, start: '10:00', end: '11:00', subjectId: 'tur-9' }
    ]
  },
  {
    id: 'okul-lise-10-dengeli',
    name: '10. Sınıf Dengeli Program',
    description: 'Günde 2.5-3 saat - TYT temel konuları ve okul paralel çalışma',
    category: 'Okul',
    estimatedWeeklyHours: 18,
    difficulty: 'Orta',
    tags: ['okul', '10.sınıf', 'lise', 'tyt-temel', 'paralel-çalışma'],
    subjects: [
      { id: 'mat-10', name: 'Matematik', category: 'Okul' },
      { id: 'tur-10', name: 'Türk Dili ve Edebiyatı', category: 'Okul' },
      { id: 'fiz-10', name: 'Fizik', category: 'Okul' },
      { id: 'kim-10', name: 'Kimya', category: 'Okul' },
      { id: 'biy-10', name: 'Biyoloji', category: 'Okul' },
      { id: 'tar-10', name: 'Tarih', category: 'Okul' },
      { id: 'cog-10', name: 'Coğrafya', category: 'Okul' }
    ],
    slots: [
      { day: 1, start: '16:30', end: '18:00', subjectId: 'mat-10' },
      { day: 1, start: '18:30', end: '19:30', subjectId: 'tur-10' },
      { day: 2, start: '16:30', end: '18:00', subjectId: 'fiz-10' },
      { day: 2, start: '18:30', end: '19:15', subjectId: 'kim-10' },
      { day: 3, start: '16:30', end: '18:00', subjectId: 'mat-10' },
      { day: 3, start: '18:30', end: '19:15', subjectId: 'tar-10' },
      { day: 4, start: '16:30', end: '18:00', subjectId: 'tur-10' },
      { day: 4, start: '18:30', end: '19:15', subjectId: 'biy-10' },
      { day: 5, start: '16:30', end: '18:00', subjectId: 'mat-10' },
      { day: 5, start: '18:30', end: '19:15', subjectId: 'cog-10' },
      { day: 6, start: '09:30', end: '11:30', subjectId: 'mat-10' },
      { day: 6, start: '14:00', end: '16:00', subjectId: 'fiz-10' },
      { day: 7, start: '10:00', end: '11:30', subjectId: 'tur-10' }
    ]
  },
  {
    id: 'okul-lise-11-dengeli',
    name: '11. Sınıf Dengeli Program',
    description: 'Günde 3 saat - YKS hazırlığına geçiş, AYT konularına giriş',
    category: 'Okul',
    estimatedWeeklyHours: 21,
    difficulty: 'Orta',
    tags: ['okul', '11.sınıf', 'lise', 'yks-geçiş', 'ayt-başlangıç'],
    subjects: [
      { id: 'mat-11', name: 'Matematik', category: 'Okul' },
      { id: 'tur-11', name: 'Türk Dili ve Edebiyatı', category: 'Okul' },
      { id: 'fiz-11', name: 'Fizik', category: 'Okul' },
      { id: 'kim-11', name: 'Kimya', category: 'Okul' },
      { id: 'biy-11', name: 'Biyoloji', category: 'Okul' },
      { id: 'tar-11', name: 'Tarih', category: 'Okul' }
    ],
    slots: [
      { day: 1, start: '16:00', end: '17:30', subjectId: 'mat-11' },
      { day: 1, start: '18:00', end: '19:30', subjectId: 'tur-11' },
      { day: 2, start: '16:00', end: '17:30', subjectId: 'fiz-11' },
      { day: 2, start: '18:00', end: '19:00', subjectId: 'kim-11' },
      { day: 3, start: '16:00', end: '17:30', subjectId: 'mat-11' },
      { day: 3, start: '18:00', end: '19:00', subjectId: 'tar-11' },
      { day: 4, start: '16:00', end: '17:30', subjectId: 'tur-11' },
      { day: 4, start: '18:00', end: '19:00', subjectId: 'biy-11' },
      { day: 5, start: '16:00', end: '17:30', subjectId: 'mat-11' },
      { day: 5, start: '18:00', end: '19:00', subjectId: 'fiz-11' },
      { day: 6, start: '09:00', end: '11:30', subjectId: 'mat-11' },
      { day: 6, start: '14:00', end: '16:00', subjectId: 'fiz-11' },
      { day: 7, start: '10:00', end: '12:00', subjectId: 'tur-11' },
      { day: 7, start: '14:00', end: '15:30', subjectId: 'kim-11' }
    ]
  },
  // ========== LGS ŞABLONLARI ==========
  {
    id: 'lgs-light',
    name: 'LGS Hafif Program',
    description: 'Günde 2-2.5 saat dengeli çalışma - Pomodoro tekniği ile 30 dk bloklar',
    category: 'LGS',
    estimatedWeeklyHours: 15,
    difficulty: 'Kolay',
    tags: ['lgs', 'hafif', '8.sınıf', 'başlangıç', 'pomodoro'],
    subjects: [
      { id: 'mat-lgs', name: 'Matematik', category: 'LGS' },
      { id: 'fen-lgs', name: 'Fen Bilimleri', category: 'LGS' },
      { id: 'tur-lgs', name: 'Türkçe', category: 'LGS' },
      { id: 'sos-lgs', name: 'Sosyal Bilgiler', category: 'LGS' }
    ],
    slots: [
      { day: 1, start: '17:00', end: '18:00', subjectId: 'mat-lgs' },
      { day: 1, start: '19:00', end: '20:00', subjectId: 'tur-lgs' },
      { day: 2, start: '17:00', end: '18:00', subjectId: 'fen-lgs' },
      { day: 2, start: '19:00', end: '20:00', subjectId: 'mat-lgs' },
      { day: 3, start: '17:00', end: '18:00', subjectId: 'tur-lgs' },
      { day: 3, start: '19:00', end: '20:00', subjectId: 'sos-lgs' },
      { day: 4, start: '17:00', end: '18:00', subjectId: 'mat-lgs' },
      { day: 4, start: '19:00', end: '20:00', subjectId: 'fen-lgs' },
      { day: 5, start: '17:00', end: '18:00', subjectId: 'sos-lgs' },
      { day: 5, start: '19:00', end: '20:00', subjectId: 'tur-lgs' },
      { day: 6, start: '10:00', end: '11:30', subjectId: 'mat-lgs' },
      { day: 6, start: '14:00', end: '15:30', subjectId: 'fen-lgs' },
      { day: 7, start: '10:00', end: '11:30', subjectId: 'tur-lgs' },
      { day: 7, start: '14:00', end: '15:30', subjectId: 'sos-lgs' }
    ]
  },
  {
    id: 'lgs-balanced',
    name: 'LGS Dengeli Program',
    description: 'Günde 3 saat interleaving (karışık) çalışma - Farklı dersler arası geçiş',
    category: 'LGS',
    estimatedWeeklyHours: 21,
    difficulty: 'Orta',
    tags: ['lgs', 'dengeli', '8.sınıf', 'interleaving', 'spaced-repetition'],
    subjects: [
      { id: 'mat-lgs', name: 'Matematik', category: 'LGS' },
      { id: 'fen-lgs', name: 'Fen Bilimleri', category: 'LGS' },
      { id: 'tur-lgs', name: 'Türkçe', category: 'LGS' },
      { id: 'sos-lgs', name: 'Sosyal Bilgiler', category: 'LGS' },
      { id: 'ing-lgs', name: 'İngilizce', category: 'LGS' },
      { id: 'din-lgs', name: 'Din Kültürü', category: 'LGS' }
    ],
    slots: [
      { day: 1, start: '17:00', end: '18:30', subjectId: 'mat-lgs' },
      { day: 1, start: '19:00', end: '20:00', subjectId: 'tur-lgs' },
      { day: 2, start: '17:00', end: '18:30', subjectId: 'fen-lgs' },
      { day: 2, start: '19:00', end: '20:00', subjectId: 'mat-lgs' },
      { day: 3, start: '17:00', end: '18:30', subjectId: 'tur-lgs' },
      { day: 3, start: '19:00', end: '20:00', subjectId: 'sos-lgs' },
      { day: 4, start: '17:00', end: '18:30', subjectId: 'mat-lgs' },
      { day: 4, start: '19:00', end: '20:00', subjectId: 'ing-lgs' },
      { day: 5, start: '17:00', end: '18:30', subjectId: 'fen-lgs' },
      { day: 5, start: '19:00', end: '20:00', subjectId: 'din-lgs' },
      { day: 6, start: '09:00', end: '11:00', subjectId: 'mat-lgs' },
      { day: 6, start: '14:00', end: '16:00', subjectId: 'tur-lgs' },
      { day: 7, start: '09:00', end: '11:00', subjectId: 'fen-lgs' },
      { day: 7, start: '14:00', end: '16:00', subjectId: 'sos-lgs' }
    ]
  },
  {
    id: 'lgs-intense',
    name: 'LGS Yoğun Program',
    description: 'Günde 4 saat hedef odaklı çalışma - Sabah + akşam dengeli program',
    category: 'LGS',
    estimatedWeeklyHours: 27,
    difficulty: 'Yoğun',
    tags: ['lgs', 'yoğun', '8.sınıf', 'hedef-yüksek', 'sabah-akşam'],
    subjects: [
      { id: 'mat-lgs', name: 'Matematik', category: 'LGS' },
      { id: 'fen-lgs', name: 'Fen Bilimleri', category: 'LGS' },
      { id: 'tur-lgs', name: 'Türkçe', category: 'LGS' },
      { id: 'sos-lgs', name: 'Sosyal Bilgiler', category: 'LGS' },
      { id: 'ing-lgs', name: 'İngilizce', category: 'LGS' },
      { id: 'din-lgs', name: 'Din Kültürü', category: 'LGS' }
    ],
    slots: [
      { day: 1, start: '17:00', end: '19:00', subjectId: 'mat-lgs' },
      { day: 1, start: '19:30', end: '21:00', subjectId: 'tur-lgs' },
      { day: 2, start: '17:00', end: '19:00', subjectId: 'fen-lgs' },
      { day: 2, start: '19:30', end: '21:00', subjectId: 'mat-lgs' },
      { day: 3, start: '17:00', end: '19:00', subjectId: 'tur-lgs' },
      { day: 3, start: '19:30', end: '21:00', subjectId: 'sos-lgs' },
      { day: 4, start: '17:00', end: '19:00', subjectId: 'mat-lgs' },
      { day: 4, start: '19:30', end: '21:00', subjectId: 'ing-lgs' },
      { day: 5, start: '17:00', end: '19:00', subjectId: 'fen-lgs' },
      { day: 5, start: '19:30', end: '21:00', subjectId: 'din-lgs' },
      { day: 6, start: '09:00', end: '11:30', subjectId: 'mat-lgs' },
      { day: 6, start: '14:00', end: '16:30', subjectId: 'fen-lgs' },
      { day: 7, start: '09:00', end: '11:30', subjectId: 'tur-lgs' },
      { day: 7, start: '14:00', end: '16:30', subjectId: 'sos-lgs' }
    ]
  },
  {
    id: 'tyt-basic',
    name: 'TYT Temel Program',
    description: 'Günde 2.5-3 saat dengeli TYT hazırlık - Sabah zihin açıklığı ile zor dersler',
    category: 'TYT',
    estimatedWeeklyHours: 18,
    difficulty: 'Kolay',
    tags: ['tyt', 'temel', '11-12.sınıf', 'başlangıç', 'dengeli'],
    subjects: [
      { id: 'mat-tyt', name: 'Matematik', category: 'TYT' },
      { id: 'fiz-tyt', name: 'Fizik', category: 'TYT' },
      { id: 'kim-tyt', name: 'Kimya', category: 'TYT' },
      { id: 'biy-tyt', name: 'Biyoloji', category: 'TYT' },
      { id: 'tur-tyt', name: 'Türkçe', category: 'TYT' },
      { id: 'tar-tyt', name: 'Tarih', category: 'TYT' },
      { id: 'cog-tyt', name: 'Coğrafya', category: 'TYT' }
    ],
    slots: [
      { day: 1, start: '17:00', end: '18:30', subjectId: 'mat-tyt' },
      { day: 1, start: '19:00', end: '20:00', subjectId: 'tur-tyt' },
      { day: 2, start: '17:00', end: '18:30', subjectId: 'fiz-tyt' },
      { day: 2, start: '19:00', end: '20:00', subjectId: 'mat-tyt' },
      { day: 3, start: '17:00', end: '18:30', subjectId: 'kim-tyt' },
      { day: 3, start: '19:00', end: '20:00', subjectId: 'tur-tyt' },
      { day: 4, start: '17:00', end: '18:30', subjectId: 'biy-tyt' },
      { day: 4, start: '19:00', end: '20:00', subjectId: 'tar-tyt' },
      { day: 5, start: '17:00', end: '18:30', subjectId: 'mat-tyt' },
      { day: 5, start: '19:00', end: '20:00', subjectId: 'cog-tyt' },
      { day: 6, start: '09:00', end: '11:00', subjectId: 'mat-tyt' },
      { day: 6, start: '14:00', end: '16:00', subjectId: 'tur-tyt' },
      { day: 7, start: '09:00', end: '11:00', subjectId: 'fiz-tyt' },
      { day: 7, start: '14:00', end: '15:30', subjectId: 'kim-tyt' }
    ]
  },
  {
    id: 'tyt-balanced',
    name: 'TYT Dengeli Program',
    description: 'Günde 3.5-4 saat optimize edilmiş çalışma - Interleaving ile kalıcı öğrenme',
    category: 'TYT',
    estimatedWeeklyHours: 24,
    difficulty: 'Orta',
    tags: ['tyt', 'dengeli', '11-12.sınıf', 'interleaving', 'optimize'],
    subjects: [
      { id: 'mat-tyt', name: 'Matematik', category: 'TYT' },
      { id: 'fiz-tyt', name: 'Fizik', category: 'TYT' },
      { id: 'kim-tyt', name: 'Kimya', category: 'TYT' },
      { id: 'biy-tyt', name: 'Biyoloji', category: 'TYT' },
      { id: 'tur-tyt', name: 'Türkçe', category: 'TYT' },
      { id: 'tar-tyt', name: 'Tarih', category: 'TYT' },
      { id: 'cog-tyt', name: 'Coğrafya', category: 'TYT' }
    ],
    slots: [
      { day: 1, start: '17:00', end: '19:00', subjectId: 'mat-tyt' },
      { day: 1, start: '19:30', end: '21:00', subjectId: 'tur-tyt' },
      { day: 2, start: '17:00', end: '19:00', subjectId: 'fiz-tyt' },
      { day: 2, start: '19:30', end: '21:00', subjectId: 'mat-tyt' },
      { day: 3, start: '17:00', end: '19:00', subjectId: 'kim-tyt' },
      { day: 3, start: '19:30', end: '21:00', subjectId: 'tur-tyt' },
      { day: 4, start: '17:00', end: '19:00', subjectId: 'biy-tyt' },
      { day: 4, start: '19:30', end: '21:00', subjectId: 'tar-tyt' },
      { day: 5, start: '17:00', end: '19:00', subjectId: 'mat-tyt' },
      { day: 5, start: '19:30', end: '21:00', subjectId: 'cog-tyt' },
      { day: 6, start: '09:00', end: '11:30', subjectId: 'mat-tyt' },
      { day: 6, start: '14:00', end: '16:30', subjectId: 'fiz-tyt' },
      { day: 7, start: '09:00', end: '11:30', subjectId: 'tur-tyt' },
      { day: 7, start: '14:00', end: '16:00', subjectId: 'kim-tyt' }
    ]
  },
  {
    id: 'tyt-intense',
    name: 'TYT Yoğun Program',
    description: 'Günde 5 saat hedef odaklı - Sabah zihin tazeyken sayısal, akşam sözel',
    category: 'TYT',
    estimatedWeeklyHours: 30,
    difficulty: 'Yoğun',
    tags: ['tyt', 'yoğun', '12.sınıf', 'hedef-yüksek', 'sabah-akşam'],
    subjects: [
      { id: 'mat-tyt', name: 'Matematik', category: 'TYT' },
      { id: 'fiz-tyt', name: 'Fizik', category: 'TYT' },
      { id: 'kim-tyt', name: 'Kimya', category: 'TYT' },
      { id: 'biy-tyt', name: 'Biyoloji', category: 'TYT' },
      { id: 'tur-tyt', name: 'Türkçe', category: 'TYT' },
      { id: 'tar-tyt', name: 'Tarih', category: 'TYT' },
      { id: 'cog-tyt', name: 'Coğrafya', category: 'TYT' }
    ],
    slots: [
      { day: 1, start: '08:00', end: '10:00', subjectId: 'mat-tyt' },
      { day: 1, start: '17:00', end: '19:00', subjectId: 'fiz-tyt' },
      { day: 1, start: '19:30', end: '21:00', subjectId: 'tur-tyt' },
      { day: 2, start: '08:00', end: '10:00', subjectId: 'mat-tyt' },
      { day: 2, start: '17:00', end: '19:00', subjectId: 'kim-tyt' },
      { day: 2, start: '19:30', end: '21:00', subjectId: 'tar-tyt' },
      { day: 3, start: '08:00', end: '10:00', subjectId: 'fiz-tyt' },
      { day: 3, start: '17:00', end: '19:00', subjectId: 'mat-tyt' },
      { day: 3, start: '19:30', end: '21:00', subjectId: 'tur-tyt' },
      { day: 4, start: '08:00', end: '10:00', subjectId: 'mat-tyt' },
      { day: 4, start: '17:00', end: '19:00', subjectId: 'biy-tyt' },
      { day: 4, start: '19:30', end: '21:00', subjectId: 'cog-tyt' },
      { day: 5, start: '08:00', end: '10:00', subjectId: 'kim-tyt' },
      { day: 5, start: '17:00', end: '19:00', subjectId: 'mat-tyt' },
      { day: 5, start: '19:30', end: '21:00', subjectId: 'tur-tyt' },
      { day: 6, start: '09:00', end: '12:00', subjectId: 'mat-tyt' },
      { day: 6, start: '14:00', end: '16:30', subjectId: 'fiz-tyt' },
      { day: 7, start: '09:00', end: '12:00', subjectId: 'tur-tyt' },
      { day: 7, start: '14:00', end: '16:00', subjectId: 'kim-tyt' }
    ]
  },
  {
    id: 'ayt-science',
    name: 'AYT Sayısal Program',
    description: 'MF - Sabah matematik, öğleden sonra fen - Spaced repetition ile pekiştirme',
    category: 'AYT',
    estimatedWeeklyHours: 27,
    difficulty: 'Yoğun',
    tags: ['ayt', 'sayısal', 'mf', '12.sınıf', 'spaced-repetition'],
    subjects: [
      { id: 'mat-ayt', name: 'Matematik', category: 'AYT' },
      { id: 'fiz-ayt', name: 'Fizik', category: 'AYT' },
      { id: 'kim-ayt', name: 'Kimya', category: 'AYT' },
      { id: 'biy-ayt', name: 'Biyoloji', category: 'AYT' }
    ],
    slots: [
      { day: 1, start: '08:00', end: '10:00', subjectId: 'mat-ayt' },
      { day: 1, start: '17:00', end: '19:00', subjectId: 'fiz-ayt' },
      { day: 1, start: '19:30', end: '21:00', subjectId: 'mat-ayt' },
      { day: 2, start: '08:00', end: '10:00', subjectId: 'mat-ayt' },
      { day: 2, start: '17:00', end: '19:00', subjectId: 'kim-ayt' },
      { day: 2, start: '19:30', end: '21:00', subjectId: 'fiz-ayt' },
      { day: 3, start: '08:00', end: '10:00', subjectId: 'fiz-ayt' },
      { day: 3, start: '17:00', end: '19:00', subjectId: 'mat-ayt' },
      { day: 3, start: '19:30', end: '21:00', subjectId: 'biy-ayt' },
      { day: 4, start: '08:00', end: '10:00', subjectId: 'mat-ayt' },
      { day: 4, start: '17:00', end: '19:00', subjectId: 'kim-ayt' },
      { day: 4, start: '19:30', end: '21:00', subjectId: 'fiz-ayt' },
      { day: 5, start: '08:00', end: '10:00', subjectId: 'kim-ayt' },
      { day: 5, start: '17:00', end: '19:00', subjectId: 'mat-ayt' },
      { day: 6, start: '09:00', end: '12:00', subjectId: 'mat-ayt' },
      { day: 6, start: '14:00', end: '16:30', subjectId: 'fiz-ayt' },
      { day: 7, start: '09:00', end: '11:30', subjectId: 'kim-ayt' },
      { day: 7, start: '14:00', end: '16:30', subjectId: 'biy-ayt' }
    ]
  },
  {
    id: 'ayt-equal',
    name: 'AYT Eşit Ağırlık Program',
    description: 'EA - Sabah matematik ve türkçe, akşam sosyal - Dengeli dağılım',
    category: 'AYT',
    estimatedWeeklyHours: 27,
    difficulty: 'Yoğun',
    tags: ['ayt', 'ea', 'eşit-ağırlık', '12.sınıf', 'dengeli'],
    subjects: [
      { id: 'mat-ayt', name: 'Matematik', category: 'AYT' },
      { id: 'tur-ayt', name: 'Türk Dili ve Edebiyatı', category: 'AYT' },
      { id: 'tar1-ayt', name: 'Tarih-1', category: 'AYT' },
      { id: 'cog1-ayt', name: 'Coğrafya-1', category: 'AYT' }
    ],
    slots: [
      { day: 1, start: '08:00', end: '10:00', subjectId: 'mat-ayt' },
      { day: 1, start: '17:00', end: '19:00', subjectId: 'tur-ayt' },
      { day: 1, start: '19:30', end: '21:00', subjectId: 'tar1-ayt' },
      { day: 2, start: '08:00', end: '10:00', subjectId: 'tur-ayt' },
      { day: 2, start: '17:00', end: '19:00', subjectId: 'mat-ayt' },
      { day: 2, start: '19:30', end: '21:00', subjectId: 'cog1-ayt' },
      { day: 3, start: '08:00', end: '10:00', subjectId: 'mat-ayt' },
      { day: 3, start: '17:00', end: '19:00', subjectId: 'tar1-ayt' },
      { day: 3, start: '19:30', end: '21:00', subjectId: 'tur-ayt' },
      { day: 4, start: '08:00', end: '10:00', subjectId: 'tur-ayt' },
      { day: 4, start: '17:00', end: '19:00', subjectId: 'mat-ayt' },
      { day: 4, start: '19:30', end: '21:00', subjectId: 'cog1-ayt' },
      { day: 5, start: '08:00', end: '10:00', subjectId: 'mat-ayt' },
      { day: 5, start: '17:00', end: '19:00', subjectId: 'tur-ayt' },
      { day: 6, start: '09:00', end: '12:00', subjectId: 'mat-ayt' },
      { day: 6, start: '14:00', end: '16:30', subjectId: 'tur-ayt' },
      { day: 7, start: '09:00', end: '11:30', subjectId: 'tar1-ayt' },
      { day: 7, start: '14:00', end: '16:00', subjectId: 'cog1-ayt' }
    ]
  },
  {
    id: 'ayt-verbal',
    name: 'AYT Sözel Program',
    description: 'TM - Sabah okuma ve analiz, akşam hafıza - Pomodoro ile odaklanma',
    category: 'AYT',
    estimatedWeeklyHours: 27,
    difficulty: 'Yoğun',
    tags: ['ayt', 'sözel', 'tm', '12.sınıf', 'pomodoro'],
    subjects: [
      { id: 'tur-ayt', name: 'Türk Dili ve Edebiyatı', category: 'AYT' },
      { id: 'tar1-ayt', name: 'Tarih-1', category: 'AYT' },
      { id: 'cog1-ayt', name: 'Coğrafya-1', category: 'AYT' },
      { id: 'fel-ayt', name: 'Felsefe', category: 'AYT' }
    ],
    slots: [
      { day: 1, start: '08:00', end: '10:00', subjectId: 'tur-ayt' },
      { day: 1, start: '17:00', end: '19:00', subjectId: 'tar1-ayt' },
      { day: 1, start: '19:30', end: '21:00', subjectId: 'cog1-ayt' },
      { day: 2, start: '08:00', end: '10:00', subjectId: 'tur-ayt' },
      { day: 2, start: '17:00', end: '19:00', subjectId: 'fel-ayt' },
      { day: 2, start: '19:30', end: '21:00', subjectId: 'tar1-ayt' },
      { day: 3, start: '08:00', end: '10:00', subjectId: 'tar1-ayt' },
      { day: 3, start: '17:00', end: '19:00', subjectId: 'tur-ayt' },
      { day: 3, start: '19:30', end: '21:00', subjectId: 'cog1-ayt' },
      { day: 4, start: '08:00', end: '10:00', subjectId: 'tur-ayt' },
      { day: 4, start: '17:00', end: '19:00', subjectId: 'tar1-ayt' },
      { day: 4, start: '19:30', end: '21:00', subjectId: 'fel-ayt' },
      { day: 5, start: '08:00', end: '10:00', subjectId: 'cog1-ayt' },
      { day: 5, start: '17:00', end: '19:00', subjectId: 'tur-ayt' },
      { day: 6, start: '09:00', end: '12:00', subjectId: 'tur-ayt' },
      { day: 6, start: '14:00', end: '16:30', subjectId: 'tar1-ayt' },
      { day: 7, start: '09:00', end: '11:30', subjectId: 'cog1-ayt' },
      { day: 7, start: '14:00', end: '16:00', subjectId: 'fel-ayt' }
    ]
  },
  {
    id: 'ydt-basic',
    name: 'YDT Temel Program',
    description: 'Günde 2 saat İngilizce - Grammar + kelime + okuma dengesi',
    category: 'YDT',
    estimatedWeeklyHours: 15,
    difficulty: 'Kolay',
    tags: ['ydt', 'temel', 'ingilizce', '12.sınıf', 'dengeli'],
    subjects: [
      { id: 'grammar-ydt', name: 'Grammar', category: 'YDT' },
      { id: 'reading-ydt', name: 'Reading', category: 'YDT' },
      { id: 'vocab-ydt', name: 'Vocabulary', category: 'YDT' },
      { id: 'listening-ydt', name: 'Listening', category: 'YDT' }
    ],
    slots: [
      { day: 1, start: '17:00', end: '18:00', subjectId: 'grammar-ydt' },
      { day: 1, start: '19:00', end: '20:00', subjectId: 'reading-ydt' },
      { day: 2, start: '17:00', end: '18:00', subjectId: 'vocab-ydt' },
      { day: 2, start: '19:00', end: '20:00', subjectId: 'grammar-ydt' },
      { day: 3, start: '17:00', end: '18:00', subjectId: 'reading-ydt' },
      { day: 3, start: '19:00', end: '20:00', subjectId: 'listening-ydt' },
      { day: 4, start: '17:00', end: '18:00', subjectId: 'grammar-ydt' },
      { day: 4, start: '19:00', end: '20:00', subjectId: 'vocab-ydt' },
      { day: 5, start: '17:00', end: '18:00', subjectId: 'reading-ydt' },
      { day: 5, start: '19:00', end: '20:00', subjectId: 'grammar-ydt' },
      { day: 6, start: '10:00', end: '11:30', subjectId: 'reading-ydt' },
      { day: 6, start: '14:00', end: '15:30', subjectId: 'grammar-ydt' },
      { day: 7, start: '10:00', end: '11:00', subjectId: 'vocab-ydt' }
    ]
  },
  {
    id: 'ydt-intense',
    name: 'YDT Yoğun Program',
    description: 'Günde 3 saat İngilizce - Sabah okuma, akşam dil bilgisi - Spaced repetition',
    category: 'YDT',
    estimatedWeeklyHours: 21,
    difficulty: 'Yoğun',
    tags: ['ydt', 'yoğun', 'ingilizce', '12.sınıf', 'hedef-yüksek', 'spaced-repetition'],
    subjects: [
      { id: 'grammar-ydt', name: 'Grammar', category: 'YDT' },
      { id: 'reading-ydt', name: 'Reading', category: 'YDT' },
      { id: 'vocab-ydt', name: 'Vocabulary', category: 'YDT' },
      { id: 'listening-ydt', name: 'Listening', category: 'YDT' },
      { id: 'writing-ydt', name: 'Writing', category: 'YDT' }
    ],
    slots: [
      { day: 1, start: '17:00', end: '18:30', subjectId: 'grammar-ydt' },
      { day: 1, start: '19:00', end: '20:30', subjectId: 'reading-ydt' },
      { day: 2, start: '17:00', end: '18:30', subjectId: 'vocab-ydt' },
      { day: 2, start: '19:00', end: '20:30', subjectId: 'grammar-ydt' },
      { day: 3, start: '17:00', end: '18:30', subjectId: 'reading-ydt' },
      { day: 3, start: '19:00', end: '20:30', subjectId: 'listening-ydt' },
      { day: 4, start: '17:00', end: '18:30', subjectId: 'writing-ydt' },
      { day: 4, start: '19:00', end: '20:30', subjectId: 'vocab-ydt' },
      { day: 5, start: '17:00', end: '18:30', subjectId: 'grammar-ydt' },
      { day: 5, start: '19:00', end: '20:30', subjectId: 'reading-ydt' },
      { day: 6, start: '09:00', end: '11:00', subjectId: 'reading-ydt' },
      { day: 6, start: '14:00', end: '16:00', subjectId: 'grammar-ydt' },
      { day: 7, start: '09:00', end: '11:00', subjectId: 'vocab-ydt' },
      { day: 7, start: '14:00', end: '15:30', subjectId: 'listening-ydt' }
    ]
  }
];

export function getScheduleTemplates(): ScheduleTemplate[] {
  return SCHEDULE_TEMPLATES;
}

export function getTemplatesByCategory(category?: string): ScheduleTemplate[] {
  if (!category || category === 'Tümü') {
    return SCHEDULE_TEMPLATES;
  }
  return SCHEDULE_TEMPLATES.filter(t => t.category === category);
}

function addMinutesToTime(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function hasTimeConflict(slot1: WeeklySlot, slot2: WeeklySlot): boolean {
  if (slot1.day !== slot2.day) return false;
  
  const slot1Start = timeToMinutes(slot1.start);
  const slot1End = timeToMinutes(slot1.end);
  const slot2Start = timeToMinutes(slot2.start);
  const slot2End = timeToMinutes(slot2.end);
  
  return !(slot1End <= slot2Start || slot2End <= slot1Start);
}

function findNonConflictingTime(
  day: number,
  preferredStart: string,
  duration: number,
  templateSlots: WeeklySlot[]
): { start: string; end: string } {
  const candidateTimes = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  for (const time of candidateTimes) {
    const testSlot = {
      day: day as 1 | 2 | 3 | 4 | 5 | 6 | 7,
      start: time,
      end: addMinutesToTime(time, duration)
    };

    const conflicts = templateSlots.filter(
      s => s.day === day && hasTimeConflict(testSlot as WeeklySlot, s)
    );

    if (conflicts.length === 0) {
      return { start: time, end: addMinutesToTime(time, duration) };
    }
  }

  return { start: preferredStart, end: addMinutesToTime(preferredStart, duration) };
}

function createCustomizationSlots(
  studentId: string,
  customization: TemplateCustomization,
  existingSubjects: StudySubject[],
  templateSlots: WeeklySlot[] = []
): { slots: WeeklySlot[], subjects: StudySubject[] } {
  const slots: WeeklySlot[] = [];
  const subjectsToAdd: StudySubject[] = [];

  const findOrCreateSubject = (name: string, category: string): string => {
    const existing = existingSubjects.find(s => 
      s.name.toLowerCase() === name.toLowerCase()
    );
    if (existing) return existing.id;

    const alreadyAdded = subjectsToAdd.find(s => 
      s.name.toLowerCase() === name.toLowerCase()
    );
    if (alreadyAdded) return alreadyAdded.id;

    const newSubject: StudySubject = {
      id: crypto.randomUUID(),
      name,
      category: category as any,
      code: name.toLowerCase().replace(/\s+/g, '-'),
      description: 'Özelleştirmeden eklendi'
    };
    subjectsToAdd.push(newSubject);
    return newSubject.id;
  };

  if (customization.dailyRepetition?.enabled) {
    const duration = customization.dailyRepetition.durationMinutes || 30;
    const subjectId = findOrCreateSubject('Günlük Tekrar', 'Genel');
    
    for (let day = 1; day <= 5; day++) {
      const time = findNonConflictingTime(day, '20:00', duration, templateSlots);
      slots.push({
        id: crypto.randomUUID(),
        studentId,
        day: day as 1 | 2 | 3 | 4 | 5 | 6 | 7,
        start: time.start,
        end: time.end,
        subjectId
      });
    }
  }

  if (customization.weeklyRepetition?.enabled) {
    const duration = customization.weeklyRepetition.durationMinutes || 60;
    const day = customization.weeklyRepetition.day || 6;
    const subjectId = findOrCreateSubject('Haftalık Tekrar', 'Genel');
    
    const time = findNonConflictingTime(day, '11:00', duration, templateSlots);
    slots.push({
      id: crypto.randomUUID(),
      studentId,
      day,
      start: time.start,
      end: time.end,
      subjectId
    });
  }

  if (customization.bookReading?.enabled) {
    const duration = customization.bookReading.durationMinutes || 30;
    const daysPerWeek = Math.min(customization.bookReading.daysPerWeek || 3, 7);
    const subjectId = findOrCreateSubject('Kitap Okuma', 'Genel');
    
    for (let i = 0; i < daysPerWeek; i++) {
      const day = (i % 7) + 1;
      const time = findNonConflictingTime(day, '21:00', duration, templateSlots);
      slots.push({
        id: crypto.randomUUID(),
        studentId,
        day: day as 1 | 2 | 3 | 4 | 5 | 6 | 7,
        start: time.start,
        end: time.end,
        subjectId
      });
    }
  }

  if (customization.questionSolving?.enabled) {
    const subjectId = findOrCreateSubject('Soru Çözümü', 'Genel');
    
    const time1 = findNonConflictingTime(3, '19:00', 60, templateSlots);
    slots.push({
      id: crypto.randomUUID(),
      studentId,
      day: 3,
      start: time1.start,
      end: time1.end,
      subjectId
    });
    
    const time2 = findNonConflictingTime(5, '19:00', 60, templateSlots);
    slots.push({
      id: crypto.randomUUID(),
      studentId,
      day: 5,
      start: time2.start,
      end: time2.end,
      subjectId
    });
  }

  if (customization.mockExam?.enabled) {
    const duration = customization.mockExam.durationMinutes || 120;
    const day = customization.mockExam.day || 7;
    const subjectId = findOrCreateSubject('Deneme Sınavı', 'Genel');
    
    const time = findNonConflictingTime(day, '10:00', duration, templateSlots);
    slots.push({
      id: crypto.randomUUID(),
      studentId,
      day,
      start: time.start,
      end: time.end,
      subjectId
    });
  }

  return { slots, subjects: subjectsToAdd };
}

export async function applyScheduleTemplate(
  templateId: string,
  studentId: string,
  replaceExisting: boolean = false,
  customization?: TemplateCustomization
): Promise<void> {
  const template = SCHEDULE_TEMPLATES.find(t => t.id === templateId);
  if (!template) {
    toast.error('Şablon bulunamadı');
    return;
  }

  try {
    if (replaceExisting) {
      const existing = getWeeklySlotsByStudent(studentId);
      for (const slot of existing) {
        await removeWeeklySlot(slot.id);
      }
    }

    await loadSubjectsAsync();
    const existingSubjects = loadSubjects();
    
    const subjectIdMap = new Map<string, string>();
    const subjectsToAdd: StudySubject[] = [];
    
    for (const templateSubject of template.subjects) {
      const existing = existingSubjects.find(s => 
        s.name.toLowerCase() === templateSubject.name.toLowerCase() && 
        s.category === templateSubject.category
      );
      
      if (existing) {
        subjectIdMap.set(templateSubject.id, existing.id);
      } else {
        const newSubject: StudySubject = {
          id: crypto.randomUUID(),
          name: templateSubject.name,
          category: templateSubject.category as any,
          code: templateSubject.name.toLowerCase().replace(/\s+/g, '-'),
          description: `${template.name} şablonundan eklendi`
        };
        subjectsToAdd.push(newSubject);
        subjectIdMap.set(templateSubject.id, newSubject.id);
      }
    }

    const newSlots: WeeklySlot[] = template.slots.map(templateSlot => ({
      id: crypto.randomUUID(),
      studentId,
      day: templateSlot.day,
      start: templateSlot.start,
      end: templateSlot.end,
      subjectId: subjectIdMap.get(templateSlot.subjectId) || templateSlot.subjectId
    }));

    let customizationSlots: WeeklySlot[] = [];
    if (customization) {
      const allExistingSubjects = [...existingSubjects, ...subjectsToAdd];
      const customResult = createCustomizationSlots(studentId, customization, allExistingSubjects, newSlots);
      customizationSlots = customResult.slots;
      subjectsToAdd.push(...customResult.subjects);
    }
    
    if (subjectsToAdd.length > 0) {
      const allSubjects = [...existingSubjects, ...subjectsToAdd];
      await saveSubjects(allSubjects);
    }
    
    const existingSlots = replaceExisting ? [] : loadWeeklySlots();
    const allSlots = [...existingSlots, ...newSlots, ...customizationSlots];
    
    await saveWeeklySlots(allSlots);

    // Backend'e özelleştirmeyi kaydet
    if (customization) {
      try {
        await apiClient.post(`/students/${studentId}/templates/${templateId}/customizations`, customization);
      } catch (error) {
        console.error('Error saving customization to backend:', error);
        // Devam et - özelleştirme frontende kaydedildi
      }
    }

    const customizationCount = customizationSlots.length;
    const baseDescription = `${template.estimatedWeeklyHours} saatlik program eklendi`;
    const customDescription = customizationCount > 0 
      ? `${baseDescription} + ${customizationCount} özelleştirme bloğu`
      : baseDescription;

    toast.success(`"${template.name}" şablonu uygulandı`, {
      description: customDescription
    });
  } catch (error) {
    console.error('Error applying template:', error);
    toast.error('Şablon uygulanırken hata oluştu');
    throw error;
  }
}
