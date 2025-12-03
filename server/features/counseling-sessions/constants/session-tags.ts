import type { SessionTag } from '../types';

export const ACADEMIC_TAGS: SessionTag[] = [
  { id: 'academic_success', label: 'Ders Başarısı', category: 'topic', color: '#10b981' },
  { id: 'homework_issue', label: 'Ödev Sorunu', category: 'topic', color: '#f59e0b' },
  { id: 'exam_anxiety', label: 'Sınav Kaygısı', category: 'topic', color: '#ef4444' },
  { id: 'study_skills', label: 'Çalışma Becerileri', category: 'topic', color: '#3b82f6' },
  { id: 'time_management', label: 'Zaman Yönetimi', category: 'topic', color: '#8b5cf6' },
  { id: 'motivation_low', label: 'Motivasyon Düşük', category: 'topic', color: '#ec4899' },
];

export const SOCIAL_TAGS: SessionTag[] = [
  { id: 'peer_relations', label: 'Akran İlişkileri', category: 'topic', color: '#06b6d4' },
  { id: 'isolation', label: 'İzolasyon', category: 'topic', color: '#6366f1' },
  { id: 'bullying_victim', label: 'Zorbalık Mağduru', category: 'topic', color: '#dc2626' },
  { id: 'bullying_perpetrator', label: 'Zorbalık Faili', category: 'topic', color: '#991b1b' },
  { id: 'friendship_conflict', label: 'Arkadaşlık Çatışması', category: 'topic', color: '#f97316' },
  { id: 'social_skills', label: 'Sosyal Beceriler', category: 'topic', color: '#14b8a6' },
];

export const FAMILY_TAGS: SessionTag[] = [
  { id: 'family_support_needed', label: 'Aile Desteği Gerekli', category: 'action', color: '#f59e0b' },
  { id: 'family_conflict', label: 'Aile İçi Çatışma', category: 'topic', color: '#ef4444' },
  { id: 'divorce_process', label: 'Boşanma Süreci', category: 'topic', color: '#dc2626' },
  { id: 'economic_hardship', label: 'Ekonomik Zorluk', category: 'topic', color: '#9333ea' },
  { id: 'parental_pressure', label: 'Aile Baskısı', category: 'topic', color: '#db2777' },
  { id: 'family_communication', label: 'Aile İletişimi', category: 'topic', color: '#0891b2' },
];

export const EMOTIONAL_TAGS: SessionTag[] = [
  { id: 'anxiety', label: 'Kaygı', category: 'emotion', color: '#f59e0b' },
  { id: 'depression', label: 'Depresif Belirtiler', category: 'emotion', color: '#6b7280' },
  { id: 'anger_issues', label: 'Öfke Kontrolü', category: 'emotion', color: '#dc2626' },
  { id: 'low_self_esteem', label: 'Düşük Özgüven', category: 'emotion', color: '#8b5cf6' },
  { id: 'stress', label: 'Stres', category: 'emotion', color: '#f97316' },
  { id: 'emotional_regulation', label: 'Duygu Düzenleme', category: 'emotion', color: '#10b981' },
];

export const BEHAVIORAL_TAGS: SessionTag[] = [
  { id: 'attendance_issue', label: 'Devamsızlık', category: 'topic', color: '#dc2626' },
  { id: 'discipline_problem', label: 'Disiplin Sorunu', category: 'topic', color: '#991b1b' },
  { id: 'aggression', label: 'Saldırganlık', category: 'topic', color: '#7f1d1d' },
  { id: 'rule_violation', label: 'Kural İhlali', category: 'topic', color: '#ef4444' },
  { id: 'attention_deficit', label: 'Dikkat Eksikliği', category: 'topic', color: '#f59e0b' },
  { id: 'hyperactivity', label: 'Hiperaktivite', category: 'topic', color: '#fb923c' },
];

export const STATUS_TAGS: SessionTag[] = [
  { id: 'progress_made', label: 'İlerleme Var', category: 'status', color: '#10b981' },
  { id: 'no_change', label: 'Değişim Yok', category: 'status', color: '#6b7280' },
  { id: 'deterioration', label: 'Kötüleşme Var', category: 'status', color: '#dc2626' },
  { id: 'first_session', label: 'İlk Görüşme', category: 'status', color: '#3b82f6' },
  { id: 'follow_up', label: 'Takip Görüşmesi', category: 'status', color: '#8b5cf6' },
  { id: 'crisis_intervention', label: 'Kriz Müdahalesi', category: 'status', color: '#dc2626' },
];

export const ACTION_TAGS: SessionTag[] = [
  { id: 'teacher_notification', label: 'Öğretmen Bilgilendirme', category: 'action', color: '#3b82f6' },
  { id: 'parent_meeting_needed', label: 'Veli Görüşmesi Gerekli', category: 'action', color: '#f59e0b' },
  { id: 'specialist_referral', label: 'Uzman Yönlendirme', category: 'action', color: '#8b5cf6' },
  { id: 'urgent_intervention', label: 'Acil Müdahale', category: 'action', color: '#dc2626' },
  { id: 'monitoring_required', label: 'İzleme Gerekli', category: 'action', color: '#06b6d4' },
  { id: 'group_session_recommended', label: 'Grup Çalışması Önerisi', category: 'action', color: '#10b981' },
];

export const CAREER_TAGS: SessionTag[] = [
  { id: 'career_guidance', label: 'Kariyer Rehberliği', category: 'topic', color: '#0891b2' },
  { id: 'university_planning', label: 'Üniversite Planlama', category: 'topic', color: '#3b82f6' },
  { id: 'vocational_guidance', label: 'Meslek Seçimi', category: 'topic', color: '#14b8a6' },
  { id: 'exam_preparation', label: 'Sınav Hazırlık', category: 'topic', color: '#8b5cf6' },
];

export const ALL_SESSION_TAGS: SessionTag[] = [
  ...ACADEMIC_TAGS,
  ...SOCIAL_TAGS,
  ...FAMILY_TAGS,
  ...EMOTIONAL_TAGS,
  ...BEHAVIORAL_TAGS,
  ...STATUS_TAGS,
  ...ACTION_TAGS,
  ...CAREER_TAGS,
];

export const TAG_CATEGORIES = {
  academic: ACADEMIC_TAGS,
  social: SOCIAL_TAGS,
  family: FAMILY_TAGS,
  emotional: EMOTIONAL_TAGS,
  behavioral: BEHAVIORAL_TAGS,
  status: STATUS_TAGS,
  action: ACTION_TAGS,
  career: CAREER_TAGS,
};

export function getTagsByCategory(category: keyof typeof TAG_CATEGORIES): SessionTag[] {
  return TAG_CATEGORIES[category] || [];
}

export function getTagById(tagId: string): SessionTag | undefined {
  return ALL_SESSION_TAGS.find(tag => tag.id === tagId);
}

export function suggestTagsForTopic(topicPath: string): SessionTag[] {
  const lowerTopic = topicPath.toLowerCase();
  const suggestions: SessionTag[] = [];

  if (lowerTopic.includes('akademik') || lowerTopic.includes('başarı')) {
    suggestions.push(...ACADEMIC_TAGS.slice(0, 3));
  }
  
  if (lowerTopic.includes('sosyal') || lowerTopic.includes('akran')) {
    suggestions.push(...SOCIAL_TAGS.slice(0, 3));
  }
  
  if (lowerTopic.includes('aile') || lowerTopic.includes('veli')) {
    suggestions.push(...FAMILY_TAGS.slice(0, 3));
  }
  
  if (lowerTopic.includes('duygusal') || lowerTopic.includes('psikolojik')) {
    suggestions.push(...EMOTIONAL_TAGS.slice(0, 3));
  }
  
  if (lowerTopic.includes('davranış') || lowerTopic.includes('disiplin')) {
    suggestions.push(...BEHAVIORAL_TAGS.slice(0, 3));
  }
  
  if (lowerTopic.includes('kariyer') || lowerTopic.includes('meslek')) {
    suggestions.push(...CAREER_TAGS.slice(0, 3));
  }

  return suggestions.length > 0 ? suggestions : STATUS_TAGS.slice(0, 3);
}
