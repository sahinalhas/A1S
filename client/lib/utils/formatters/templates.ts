import { toast } from "sonner";
import type { ScheduleTemplate, WeeklySlot, StudySubject } from "../../types/study.types";
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

export async function applyScheduleTemplate(
  templateId: string,
  studentId: string,
  replaceExisting: boolean = false
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
    
    if (subjectsToAdd.length > 0) {
      const allSubjects = [...existingSubjects, ...subjectsToAdd];
      await saveSubjects(allSubjects);
    }

    const newSlots: WeeklySlot[] = template.slots.map(templateSlot => ({
      id: crypto.randomUUID(),
      studentId,
      day: templateSlot.day,
      start: templateSlot.start,
      end: templateSlot.end,
      subjectId: subjectIdMap.get(templateSlot.subjectId) || templateSlot.subjectId
    }));
    
    const existingSlots = replaceExisting ? [] : loadWeeklySlots();
    const allSlots = [...existingSlots, ...newSlots];
    
    await saveWeeklySlots(allSlots);

    toast.success(`"${template.name}" şablonu uygulandı`, {
      description: `${template.estimatedWeeklyHours} saatlik program eklendi`
    });
  } catch (error) {
    console.error('Error applying template:', error);
    toast.error('Şablon uygulanırken hata oluştu');
    throw error;
  }
}
