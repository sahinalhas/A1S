export const SESSION_MODES = {
  YUZ_YUZE: 'yüz_yüze',
  ONLINE: 'online',
  TELEFON: 'telefon',
} as const;

export type SessionMode = typeof SESSION_MODES[keyof typeof SESSION_MODES];

export const PARTICIPANT_TYPES = {
  OGRENCI: 'öğrenci',
  VELI: 'veli',
  OGRETMEN: 'öğretmen',
  DIGER: 'diğer',
} as const;

export type ParticipantType = typeof PARTICIPANT_TYPES[keyof typeof PARTICIPANT_TYPES];

export const RISK_LEVELS = {
  DUSUK: 'Düşük',
  ORTA: 'Orta',
  YUKSEK: 'Yüksek',
} as const;

export type RiskLevel = typeof RISK_LEVELS[keyof typeof RISK_LEVELS];

export const SESSION_MODE_LABELS: Record<SessionMode, string> = {
  [SESSION_MODES.YUZ_YUZE]: 'Yüz Yüze',
  [SESSION_MODES.ONLINE]: 'Online',
  [SESSION_MODES.TELEFON]: 'Telefon',
};

export const PARTICIPANT_TYPE_LABELS: Record<ParticipantType, string> = {
  [PARTICIPANT_TYPES.OGRENCI]: 'Öğrenci',
  [PARTICIPANT_TYPES.VELI]: 'Veli',
  [PARTICIPANT_TYPES.OGRETMEN]: 'Öğretmen',
  [PARTICIPANT_TYPES.DIGER]: 'Diğer',
};

// Session location labels
export const SESSION_LOCATION_LABELS: Record<string, string> = {
  'rehberlik_servisi': 'Rehberlik Servisi',
  'ogretmen_odasi': 'Öğretmen Odası',
  'sinif': 'Sınıf',
  'online': 'Online',
  'ev_ziyareti': 'Ev Ziyareti',
  'okul_bahcesi': 'Okul Bahçesi',
  'toplanti_odasi': 'Toplantı Odası',
  'diger': 'Diğer',
};

// Discipline status labels
export const DISCIPLINE_STATUS_LABELS: Record<string, string> = {
  'kurulu_sevk': 'Kurulu Sevk',
  'gorusu_alinan': 'Görüşü Alınan',
  'akran_gorusmesi': 'Akran Görüşmesi',
  'none': '-',
};

export const INSIGHT_PERIODS = {
  GUNLUK: 'GÜNLÜK',
  HAFTALIK: 'HAFTALIK',
  AYLIK: 'AYLIK',
} as const;

export type InsightPeriod = typeof INSIGHT_PERIODS[keyof typeof INSIGHT_PERIODS];

export const INSIGHT_PERIOD_LABELS: Record<InsightPeriod, string> = {
  [INSIGHT_PERIODS.GUNLUK]: 'Günlük',
  [INSIGHT_PERIODS.HAFTALIK]: 'Haftalık',
  [INSIGHT_PERIODS.AYLIK]: 'Aylık',
};
