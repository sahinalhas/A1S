/**
 * Career Profiles and Competency Constants
 * Meslek Profilleri ve Yetkinlik Sabitleri
 */

import type { Competency, CareerProfile, CompetencyCategory } from '../types/career-guidance.types';

// Yetkinlik Tanımları
export const COMPETENCIES: Record<string, Competency> = {
  // Akademik Yetkinlikler
  MATH_SKILLS: {
    id: 'MATH_SKILLS',
    name: 'Matematik Becerileri',
    category: 'ACADEMIC',
    description: 'Problem çözme, sayısal analiz ve matematiksel düşünme'
  },
  SCIENCE_SKILLS: {
    id: 'SCIENCE_SKILLS',
    name: 'Fen Bilimleri Becerileri',
    category: 'ACADEMIC',
    description: 'Bilimsel düşünme, deney tasarımı ve analiz'
  },
  LANGUAGE_SKILLS: {
    id: 'LANGUAGE_SKILLS',
    name: 'Dil Becerileri',
    category: 'ACADEMIC',
    description: 'Okuma, yazma ve dil kullanımı'
  },
  RESEARCH_SKILLS: {
    id: 'RESEARCH_SKILLS',
    name: 'Araştırma Becerileri',
    category: 'ACADEMIC',
    description: 'Bilgi toplama, analiz ve sentez yapma'
  },
  CRITICAL_THINKING: {
    id: 'CRITICAL_THINKING',
    name: 'Eleştirel Düşünme',
    category: 'ACADEMIC',
    description: 'Analitik ve mantıksal düşünme yeteneği'
  },

  // Sosyal-Duygusal Yetkinlikler
  EMPATHY: {
    id: 'EMPATHY',
    name: 'Empati',
    category: 'SOCIAL_EMOTIONAL',
    description: 'Başkalarının duygularını anlama ve paylaşma'
  },
  TEAMWORK: {
    id: 'TEAMWORK',
    name: 'Takım Çalışması',
    category: 'SOCIAL_EMOTIONAL',
    description: 'Grup içinde etkili çalışabilme'
  },
  EMOTIONAL_REGULATION: {
    id: 'EMOTIONAL_REGULATION',
    name: 'Duygu Düzenleme',
    category: 'SOCIAL_EMOTIONAL',
    description: 'Duygularını kontrol ve yönetme'
  },
  CONFLICT_RESOLUTION: {
    id: 'CONFLICT_RESOLUTION',
    name: 'Çatışma Yönetimi',
    category: 'SOCIAL_EMOTIONAL',
    description: 'Çatışmaları çözme ve arabuluculuk'
  },

  // İletişim Becerileri
  VERBAL_COMMUNICATION: {
    id: 'VERBAL_COMMUNICATION',
    name: 'Sözlü İletişim',
    category: 'COMMUNICATION',
    description: 'Etkili konuşma ve sunum yapma'
  },
  WRITTEN_COMMUNICATION: {
    id: 'WRITTEN_COMMUNICATION',
    name: 'Yazılı İletişim',
    category: 'COMMUNICATION',
    description: 'Etkili yazma ve raporlama'
  },
  ACTIVE_LISTENING: {
    id: 'ACTIVE_LISTENING',
    name: 'Aktif Dinleme',
    category: 'COMMUNICATION',
    description: 'Dikkatli dinleme ve anlama'
  },
  PERSUASION: {
    id: 'PERSUASION',
    name: 'İkna Kabiliyeti',
    category: 'COMMUNICATION',
    description: 'Başkalarını etkileme ve ikna etme'
  },

  // Liderlik Becerileri
  LEADERSHIP: {
    id: 'LEADERSHIP',
    name: 'Liderlik',
    category: 'LEADERSHIP',
    description: 'Grup yönetme ve yönlendirme'
  },
  DECISION_MAKING: {
    id: 'DECISION_MAKING',
    name: 'Karar Verme',
    category: 'LEADERSHIP',
    description: 'Etkili ve zamanında karar alma'
  },
  STRATEGIC_THINKING: {
    id: 'STRATEGIC_THINKING',
    name: 'Stratejik Düşünme',
    category: 'LEADERSHIP',
    description: 'Uzun vadeli planlama ve vizyon geliştirme'
  },

  // Teknik Beceriler
  PROGRAMMING: {
    id: 'PROGRAMMING',
    name: 'Programlama',
    category: 'TECHNICAL',
    description: 'Kod yazma ve yazılım geliştirme'
  },
  DATA_ANALYSIS: {
    id: 'DATA_ANALYSIS',
    name: 'Veri Analizi',
    category: 'TECHNICAL',
    description: 'Veri işleme ve analiz etme'
  },
  TECHNICAL_DRAWING: {
    id: 'TECHNICAL_DRAWING',
    name: 'Teknik Çizim',
    category: 'TECHNICAL',
    description: 'Teknik ve mühendislik çizimleri'
  },
  LABORATORY_SKILLS: {
    id: 'LABORATORY_SKILLS',
    name: 'Laboratuvar Becerileri',
    category: 'TECHNICAL',
    description: 'Laboratuvar ekipmanları kullanımı'
  },

  // Yaratıcı Yetkinlikler
  CREATIVITY: {
    id: 'CREATIVITY',
    name: 'Yaratıcılık',
    category: 'CREATIVE',
    description: 'Yenilikçi ve özgün fikirler üretme'
  },
  ARTISTIC_ABILITY: {
    id: 'ARTISTIC_ABILITY',
    name: 'Sanatsal Yetenek',
    category: 'CREATIVE',
    description: 'Görsel ve sanatsal ifade'
  },
  DESIGN_THINKING: {
    id: 'DESIGN_THINKING',
    name: 'Tasarım Düşüncesi',
    category: 'CREATIVE',
    description: 'Kullanıcı odaklı tasarım yapma'
  },
  INNOVATION: {
    id: 'INNOVATION',
    name: 'Yenilikçilik',
    category: 'CREATIVE',
    description: 'Yeni çözümler ve yaklaşımlar geliştirme'
  },

  // Fiziksel Yetkinlikler
  PHYSICAL_COORDINATION: {
    id: 'PHYSICAL_COORDINATION',
    name: 'Fiziksel Koordinasyon',
    category: 'PHYSICAL',
    description: 'El-göz koordinasyonu ve motor beceriler'
  },
  STAMINA: {
    id: 'STAMINA',
    name: 'Dayanıklılık',
    category: 'PHYSICAL',
    description: 'Fiziksel dayanıklılık ve kondisyon'
  },
  MANUAL_DEXTERITY: {
    id: 'MANUAL_DEXTERITY',
    name: 'El Becerisi',
    category: 'PHYSICAL',
    description: 'Hassas el işleri ve uygulama'
  }
};

// Meslek Profilleri
export const CAREER_PROFILES: CareerProfile[] = [
  // STEM Meslekleri
  {
    id: 'SOFTWARE_ENGINEER',
    name: 'Yazılım Mühendisi',
    category: 'STEM',
    description: 'Yazılım sistemleri tasarlar, geliştirir ve sürdürür',
    requiredEducationLevel: 'Lisans (Bilgisayar Mühendisliği, Yazılım Mühendisliği)',
    averageSalary: '₺45,000 - ₺120,000',
    jobOutlook: 'Çok Yüksek',
    workEnvironment: 'Ofis, Uzaktan Çalışma',
    requiredCompetencies: [
      { competencyId: 'PROGRAMMING', competencyName: 'Programlama', category: 'TECHNICAL', minimumLevel: 8, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'INNOVATION', competencyName: 'Yenilikçilik', category: 'CREATIVE', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'DATA_SCIENTIST',
    name: 'Veri Bilimci',
    category: 'STEM',
    description: 'Büyük veri setlerini analiz eder ve içgörüler çıkarır',
    requiredEducationLevel: 'Lisans/Yüksek Lisans (Matematik, İstatistik, Bilgisayar Mühendisliği)',
    averageSalary: '₺50,000 - ₺150,000',
    jobOutlook: 'Çok Yüksek',
    workEnvironment: 'Ofis, Uzaktan Çalışma',
    requiredCompetencies: [
      { competencyId: 'DATA_ANALYSIS', competencyName: 'Veri Analizi', category: 'TECHNICAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'PROGRAMMING', competencyName: 'Programlama', category: 'TECHNICAL', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'MECHANICAL_ENGINEER',
    name: 'Makine Mühendisi',
    category: 'STEM',
    description: 'Mekanik sistemler ve makineler tasarlar ve geliştirir',
    requiredEducationLevel: 'Lisans (Makine Mühendisliği)',
    averageSalary: '₺35,000 - ₺85,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Ofis, Fabrika, Saha',
    requiredCompetencies: [
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'TECHNICAL_DRAWING', competencyName: 'Teknik Çizim', category: 'TECHNICAL', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'INNOVATION', competencyName: 'Yenilikçilik', category: 'CREATIVE', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 }
    ]
  },

  // Sağlık Meslekleri
  {
    id: 'PHYSICIAN',
    name: 'Doktor (Hekim)',
    category: 'HEALTH',
    description: 'Hastaları teşhis eder, tedavi eder ve sağlık danışmanlığı verir',
    requiredEducationLevel: 'Tıp Fakültesi + Uzmanlık',
    averageSalary: '₺60,000 - ₺200,000+',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Hastane, Klinik, Özel Muayenehane',
    requiredCompetencies: [
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.2 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'DECISION_MAKING', competencyName: 'Karar Verme', category: 'LEADERSHIP', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 7, importance: 'HIGH', weight: 0.1 },
      { competencyId: 'EMOTIONAL_REGULATION', competencyName: 'Duygu Düzenleme', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'NURSE',
    name: 'Hemşire',
    category: 'HEALTH',
    description: 'Hasta bakımı ve sağlık hizmetleri sunar',
    requiredEducationLevel: 'Lisans (Hemşirelik)',
    averageSalary: '₺25,000 - ₺60,000',
    jobOutlook: 'Çok Yüksek',
    workEnvironment: 'Hastane, Klinik, Bakım Evleri',
    requiredCompetencies: [
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 7, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'EMOTIONAL_REGULATION', competencyName: 'Duygu Düzenleme', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'PSYCHOLOGIST',
    name: 'Psikolog',
    category: 'HEALTH',
    description: 'Zihinsel sağlık danışmanlığı ve terapi sunar',
    requiredEducationLevel: 'Lisans (Psikoloji) + Yüksek Lisans',
    averageSalary: '₺30,000 - ₺80,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Klinik, Hastane, Özel Danışmanlık',
    requiredCompetencies: [
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 10, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'ACTIVE_LISTENING', competencyName: 'Aktif Dinleme', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'RESEARCH_SKILLS', competencyName: 'Araştırma Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.1 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.1 },
      { competencyId: 'EMOTIONAL_REGULATION', competencyName: 'Duygu Düzenleme', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'MEDIUM', weight: 0.1 }
    ]
  },

  // Eğitim Meslekleri
  {
    id: 'TEACHER',
    name: 'Öğretmen',
    category: 'EDUCATION',
    description: 'Öğrencilere eğitim verir ve gelişimlerini destekler',
    requiredEducationLevel: 'Lisans (Eğitim Fakültesi)',
    averageSalary: '₺25,000 - ₺50,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Okul, Eğitim Kurumları',
    requiredCompetencies: [
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'CRITICAL', weight: 0.2 },
      { competencyId: 'LEADERSHIP', competencyName: 'Liderlik', category: 'LEADERSHIP', minimumLevel: 7, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'CONFLICT_RESOLUTION', competencyName: 'Çatışma Yönetimi', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'EMOTIONAL_REGULATION', competencyName: 'Duygu Düzenleme', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },

  // İş ve Yönetim
  {
    id: 'BUSINESS_MANAGER',
    name: 'İşletme Yöneticisi',
    category: 'BUSINESS',
    description: 'İş operasyonlarını yönetir ve stratejik kararlar alır',
    requiredEducationLevel: 'Lisans (İşletme, Yönetim)',
    averageSalary: '₺40,000 - ₺120,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Ofis',
    requiredCompetencies: [
      { competencyId: 'LEADERSHIP', competencyName: 'Liderlik', category: 'LEADERSHIP', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'STRATEGIC_THINKING', competencyName: 'Stratejik Düşünme', category: 'LEADERSHIP', minimumLevel: 8, importance: 'CRITICAL', weight: 0.2 },
      { competencyId: 'DECISION_MAKING', competencyName: 'Karar Verme', category: 'LEADERSHIP', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'DATA_ANALYSIS', competencyName: 'Veri Analizi', category: 'TECHNICAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'PERSUASION', competencyName: 'İkna Kabiliyeti', category: 'COMMUNICATION', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'MARKETING_SPECIALIST',
    name: 'Pazarlama Uzmanı',
    category: 'BUSINESS',
    description: 'Pazarlama stratejileri geliştirir ve kampanyalar yürütür',
    requiredEducationLevel: 'Lisans (İşletme, Pazarlama)',
    averageSalary: '₺30,000 - ₺80,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Ofis, Uzaktan Çalışma',
    requiredCompetencies: [
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'DATA_ANALYSIS', competencyName: 'Veri Analizi', category: 'TECHNICAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'PERSUASION', competencyName: 'İkna Kabiliyeti', category: 'COMMUNICATION', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'STRATEGIC_THINKING', competencyName: 'Stratejik Düşünme', category: 'LEADERSHIP', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 }
    ]
  },

  // Sanat ve Tasarım
  {
    id: 'GRAPHIC_DESIGNER',
    name: 'Grafik Tasarımcı',
    category: 'ARTS',
    description: 'Görsel tasarımlar ve grafikler oluşturur',
    requiredEducationLevel: 'Lisans (Grafik Tasarım, Güzel Sanatlar)',
    averageSalary: '₺25,000 - ₺65,000',
    jobOutlook: 'Orta-Yüksek',
    workEnvironment: 'Ofis, Uzaktan Çalışma, Ajans',
    requiredCompetencies: [
      { competencyId: 'ARTISTIC_ABILITY', competencyName: 'Sanatsal Yetenek', category: 'CREATIVE', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'DESIGN_THINKING', competencyName: 'Tasarım Düşüncesi', category: 'CREATIVE', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'ARCHITECT',
    name: 'Mimar',
    category: 'ARTS',
    description: 'Bina ve yapılar tasarlar',
    requiredEducationLevel: 'Lisans (Mimarlık)',
    averageSalary: '₺35,000 - ₺90,000',
    jobOutlook: 'Orta-Yüksek',
    workEnvironment: 'Ofis, Saha',
    requiredCompetencies: [
      { competencyId: 'DESIGN_THINKING', competencyName: 'Tasarım Düşüncesi', category: 'CREATIVE', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 8, importance: 'CRITICAL', weight: 0.2 },
      { competencyId: 'TECHNICAL_DRAWING', competencyName: 'Teknik Çizim', category: 'TECHNICAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'INNOVATION', competencyName: 'Yenilikçilik', category: 'CREATIVE', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },

  // Hukuk
  {
    id: 'LAWYER',
    name: 'Avukat',
    category: 'LAW',
    description: 'Hukuki danışmanlık verir ve müvekkilleri temsil eder',
    requiredEducationLevel: 'Hukuk Fakültesi + Staj',
    averageSalary: '₺40,000 - ₺150,000',
    jobOutlook: 'Orta-Yüksek',
    workEnvironment: 'Ofis, Mahkeme',
    requiredCompetencies: [
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.2 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.2 },
      { competencyId: 'RESEARCH_SKILLS', competencyName: 'Araştırma Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'PERSUASION', competencyName: 'İkna Kabiliyeti', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.1 },
      { competencyId: 'EMOTIONAL_REGULATION', competencyName: 'Duygu Düzenleme', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },

  // Sosyal Hizmetler
  {
    id: 'SOCIAL_WORKER',
    name: 'Sosyal Çalışmacı',
    category: 'SOCIAL_SERVICES',
    description: 'Bireylere ve ailelere sosyal destek sağlar',
    requiredEducationLevel: 'Lisans (Sosyal Hizmetler)',
    averageSalary: '₺25,000 - ₺55,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Kamu Kurumları, STK, Saha',
    requiredCompetencies: [
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 10, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'ACTIVE_LISTENING', competencyName: 'Aktif Dinleme', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'CONFLICT_RESOLUTION', competencyName: 'Çatışma Yönetimi', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'EMOTIONAL_REGULATION', competencyName: 'Duygu Düzenleme', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'MEDIUM', weight: 0.15 }
    ]
  },

  // Spor
  {
    id: 'SPORTS_COACH',
    name: 'Spor Antrenörü',
    category: 'SPORTS',
    description: 'Sporcuların gelişimini sağlar ve takımları yönetir',
    requiredEducationLevel: 'Lisans (Beden Eğitimi, Spor Bilimleri)',
    averageSalary: '₺25,000 - ₺80,000',
    jobOutlook: 'Orta',
    workEnvironment: 'Spor Tesisleri, Saha',
    requiredCompetencies: [
      { competencyId: 'LEADERSHIP', competencyName: 'Liderlik', category: 'LEADERSHIP', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'STRATEGIC_THINKING', competencyName: 'Stratejik Düşünme', category: 'LEADERSHIP', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },

  // Medya ve İletişim
  {
    id: 'JOURNALIST',
    name: 'Gazeteci',
    category: 'MEDIA',
    description: 'Haber toplama, yazma ve yayımlama',
    requiredEducationLevel: 'Lisans (Gazetecilik, İletişim)',
    averageSalary: '₺25,000 - ₺70,000',
    jobOutlook: 'Orta',
    workEnvironment: 'Medya Kuruluşları, Saha',
    requiredCompetencies: [
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'RESEARCH_SKILLS', competencyName: 'Araştırma Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'ACTIVE_LISTENING', competencyName: 'Aktif Dinleme', category: 'COMMUNICATION', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'CONTENT_CREATOR',
    name: 'İçerik Üreticisi',
    category: 'MEDIA',
    description: 'Dijital içerik oluşturur ve sosyal medya yönetir',
    requiredEducationLevel: 'Lisans (İletişim, Medya) veya deneyim',
    averageSalary: '₺20,000 - ₺80,000',
    jobOutlook: 'Çok Yüksek',
    workEnvironment: 'Uzaktan Çalışma, Ofis',
    requiredCompetencies: [
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 7, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'DATA_ANALYSIS', competencyName: 'Veri Analizi', category: 'TECHNICAL', minimumLevel: 5, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'INNOVATION', competencyName: 'Yenilikçilik', category: 'CREATIVE', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'VIDEO_EDITOR',
    name: 'Video Editörü',
    category: 'MEDIA',
    description: 'Video içerikleri düzenler ve kurgusu yapar',
    requiredEducationLevel: 'Lisans (Sinema-TV, Medya) veya deneyim',
    averageSalary: '₺25,000 - ₺75,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Stüdyo, Ofis, Uzaktan Çalışma',
    requiredCompetencies: [
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'ARTISTIC_ABILITY', competencyName: 'Sanatsal Yetenek', category: 'CREATIVE', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 6, importance: 'LOW', weight: 0.1 }
    ]
  },
  {
    id: 'PUBLIC_RELATIONS',
    name: 'Halkla İlişkiler Uzmanı',
    category: 'MEDIA',
    description: 'Kurumsal iletişim ve halkla ilişkileri yönetir',
    requiredEducationLevel: 'Lisans (Halkla İlişkiler, İletişim)',
    averageSalary: '₺30,000 - ₺85,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Ofis, Saha',
    requiredCompetencies: [
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'PERSUASION', competencyName: 'İkna Kabiliyeti', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'STRATEGIC_THINKING', competencyName: 'Stratejik Düşünme', category: 'LEADERSHIP', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'PHOTOGRAPHER',
    name: 'Fotoğrafçı',
    category: 'MEDIA',
    description: 'Profesyonel fotoğraf çekimi yapar',
    requiredEducationLevel: 'Lisans (Fotoğrafçılık, Güzel Sanatlar) veya deneyim',
    averageSalary: '₺20,000 - ₺70,000',
    jobOutlook: 'Orta',
    workEnvironment: 'Stüdyo, Saha, Serbest Çalışma',
    requiredCompetencies: [
      { competencyId: 'ARTISTIC_ABILITY', competencyName: 'Sanatsal Yetenek', category: 'CREATIVE', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 8, importance: 'HIGH', weight: 0.25 },
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 }
    ]
  },

  // STEM Meslekleri (devam)
  {
    id: 'ELECTRICAL_ENGINEER',
    name: 'Elektrik Mühendisi',
    category: 'STEM',
    description: 'Elektrik sistemleri ve elektronik cihazlar tasarlar',
    requiredEducationLevel: 'Lisans (Elektrik-Elektronik Mühendisliği)',
    averageSalary: '₺35,000 - ₺90,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Ofis, Fabrika, Saha',
    requiredCompetencies: [
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'TECHNICAL_DRAWING', competencyName: 'Teknik Çizim', category: 'TECHNICAL', minimumLevel: 7, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'CIVIL_ENGINEER',
    name: 'İnşaat Mühendisi',
    category: 'STEM',
    description: 'Altyapı ve bina projeleri tasarlar ve yönetir',
    requiredEducationLevel: 'Lisans (İnşaat Mühendisliği)',
    averageSalary: '₺35,000 - ₺95,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Ofis, Şantiye, Saha',
    requiredCompetencies: [
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'TECHNICAL_DRAWING', competencyName: 'Teknik Çizim', category: 'TECHNICAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'LEADERSHIP', competencyName: 'Liderlik', category: 'LEADERSHIP', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'CHEMICAL_ENGINEER',
    name: 'Kimya Mühendisi',
    category: 'STEM',
    description: 'Kimyasal prosesler ve üretim sistemleri geliştirir',
    requiredEducationLevel: 'Lisans (Kimya Mühendisliği)',
    averageSalary: '₺35,000 - ₺85,000',
    jobOutlook: 'Orta-Yüksek',
    workEnvironment: 'Fabrika, Laboratuvar, Ofis',
    requiredCompetencies: [
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'LABORATORY_SKILLS', competencyName: 'Laboratuvar Becerileri', category: 'TECHNICAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'BIOMEDICAL_ENGINEER',
    name: 'Biyomedikal Mühendisi',
    category: 'STEM',
    description: 'Tıbbi cihaz ve biyomedikal sistemler geliştirir',
    requiredEducationLevel: 'Lisans (Biyomedikal Mühendisliği)',
    averageSalary: '₺35,000 - ₺90,000',
    jobOutlook: 'Çok Yüksek',
    workEnvironment: 'Laboratuvar, Hastane, Ofis',
    requiredCompetencies: [
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'LABORATORY_SKILLS', competencyName: 'Laboratuvar Becerileri', category: 'TECHNICAL', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'INNOVATION', competencyName: 'Yenilikçilik', category: 'CREATIVE', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'AEROSPACE_ENGINEER',
    name: 'Havacılık ve Uzay Mühendisi',
    category: 'STEM',
    description: 'Uçak, uzay araçları ve ilgili sistemler tasarlar',
    requiredEducationLevel: 'Lisans (Havacılık ve Uzay Mühendisliği)',
    averageSalary: '₺40,000 - ₺110,000',
    jobOutlook: 'Orta-Yüksek',
    workEnvironment: 'Ofis, Fabrika, Test Tesisleri',
    requiredCompetencies: [
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'TECHNICAL_DRAWING', competencyName: 'Teknik Çizim', category: 'TECHNICAL', minimumLevel: 7, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'INNOVATION', competencyName: 'Yenilikçilik', category: 'CREATIVE', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'CYBERSECURITY_SPECIALIST',
    name: 'Siber Güvenlik Uzmanı',
    category: 'STEM',
    description: 'Siber güvenlik önlemleri alır ve sistem güvenliğini sağlar',
    requiredEducationLevel: 'Lisans (Bilgisayar Mühendisliği, Siber Güvenlik)',
    averageSalary: '₺45,000 - ₺130,000',
    jobOutlook: 'Çok Yüksek',
    workEnvironment: 'Ofis, Uzaktan Çalışma',
    requiredCompetencies: [
      { competencyId: 'PROGRAMMING', competencyName: 'Programlama', category: 'TECHNICAL', minimumLevel: 8, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'RESEARCH_SKILLS', competencyName: 'Araştırma Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'INDUSTRIAL_ENGINEER',
    name: 'Endüstri Mühendisi',
    category: 'STEM',
    description: 'Üretim süreçlerini optimize eder ve verimliliği artırır',
    requiredEducationLevel: 'Lisans (Endüstri Mühendisliği)',
    averageSalary: '₺35,000 - ₺85,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Fabrika, Ofis',
    requiredCompetencies: [
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'DATA_ANALYSIS', competencyName: 'Veri Analizi', category: 'TECHNICAL', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'STRATEGIC_THINKING', competencyName: 'Stratejik Düşünme', category: 'LEADERSHIP', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'MATHEMATICIAN',
    name: 'Matematikçi',
    category: 'STEM',
    description: 'Matematiksel araştırmalar yapar ve modeller geliştirir',
    requiredEducationLevel: 'Lisans/Yüksek Lisans (Matematik)',
    averageSalary: '₺30,000 - ₺80,000',
    jobOutlook: 'Orta',
    workEnvironment: 'Akademi, Araştırma Kurumları',
    requiredCompetencies: [
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 10, importance: 'CRITICAL', weight: 0.4 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'RESEARCH_SKILLS', competencyName: 'Araştırma Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'DATA_ANALYSIS', competencyName: 'Veri Analizi', category: 'TECHNICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'PHYSICIST',
    name: 'Fizikçi',
    category: 'STEM',
    description: 'Fizik araştırmaları yapar ve teoriler geliştirir',
    requiredEducationLevel: 'Lisans/Yüksek Lisans/Doktora (Fizik)',
    averageSalary: '₺30,000 - ₺85,000',
    jobOutlook: 'Orta',
    workEnvironment: 'Akademi, Araştırma Laboratuvarları',
    requiredCompetencies: [
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 10, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 9, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'RESEARCH_SKILLS', competencyName: 'Araştırma Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'LABORATORY_SKILLS', competencyName: 'Laboratuvar Becerileri', category: 'TECHNICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'ENVIRONMENTAL_ENGINEER',
    name: 'Çevre Mühendisi',
    category: 'STEM',
    description: 'Çevre koruma ve sürdürülebilirlik projeleri geliştirir',
    requiredEducationLevel: 'Lisans (Çevre Mühendisliği)',
    averageSalary: '₺30,000 - ₺75,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Ofis, Saha, Laboratuvar',
    requiredCompetencies: [
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'RESEARCH_SKILLS', competencyName: 'Araştırma Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 }
    ]
  },

  // Sağlık Meslekleri (devam)
  {
    id: 'DENTIST',
    name: 'Diş Hekimi',
    category: 'HEALTH',
    description: 'Ağız ve diş sağlığı ile ilgilenir',
    requiredEducationLevel: 'Diş Hekimliği Fakültesi',
    averageSalary: '₺50,000 - ₺180,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Klinik, Özel Muayenehane, Hastane',
    requiredCompetencies: [
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'PHARMACIST',
    name: 'Eczacı',
    category: 'HEALTH',
    description: 'İlaç hazırlama ve danışmanlık yapar',
    requiredEducationLevel: 'Eczacılık Fakültesi',
    averageSalary: '₺35,000 - ₺90,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Eczane, Hastane',
    requiredCompetencies: [
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'PHYSICAL_THERAPIST',
    name: 'Fizyoterapist',
    category: 'HEALTH',
    description: 'Fiziksel rehabilitasyon ve tedavi uygular',
    requiredEducationLevel: 'Lisans (Fizyoterapi)',
    averageSalary: '₺25,000 - ₺65,000',
    jobOutlook: 'Çok Yüksek',
    workEnvironment: 'Hastane, Klinik, Spor Tesisleri',
    requiredCompetencies: [
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'NUTRITIONIST',
    name: 'Diyetisyen',
    category: 'HEALTH',
    description: 'Beslenme planları hazırlar ve danışmanlık verir',
    requiredEducationLevel: 'Lisans (Beslenme ve Diyetetik)',
    averageSalary: '₺25,000 - ₺60,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Hastane, Özel Danışmanlık, Spor Tesisleri',
    requiredCompetencies: [
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'RESEARCH_SKILLS', competencyName: 'Araştırma Becerileri', category: 'ACADEMIC', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'MEDICAL_LABORATORY_TECHNICIAN',
    name: 'Tıbbi Laboratuvar Teknisyeni',
    category: 'HEALTH',
    description: 'Tıbbi testler ve laboratuvar analizleri yapar',
    requiredEducationLevel: 'Lisans (Tıbbi Laboratuvar)',
    averageSalary: '₺22,000 - ₺50,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Hastane, Laboratuvar',
    requiredCompetencies: [
      { competencyId: 'LABORATORY_SKILLS', competencyName: 'Laboratuvar Becerileri', category: 'TECHNICAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.25 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 8, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'RADIOLOGIST',
    name: 'Radyoloji Teknisyeni',
    category: 'HEALTH',
    description: 'Tıbbi görüntüleme cihazlarını kullanır',
    requiredEducationLevel: 'Lisans (Radyoloji)',
    averageSalary: '₺25,000 - ₺60,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Hastane, Klinik',
    requiredCompetencies: [
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.25 },
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.2 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'PARAMEDIC',
    name: 'Paramedik',
    category: 'HEALTH',
    description: 'Acil sağlık hizmetleri ve ilk yardım sağlar',
    requiredEducationLevel: 'Ön Lisans/Lisans (Acil Tıp)',
    averageSalary: '₺22,000 - ₺50,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Ambulans, Hastane, Saha',
    requiredCompetencies: [
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'DECISION_MAKING', competencyName: 'Karar Verme', category: 'LEADERSHIP', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'EMOTIONAL_REGULATION', competencyName: 'Duygu Düzenleme', category: 'SOCIAL_EMOTIONAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.2 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },

  // Eğitim Meslekleri (devam)
  {
    id: 'SCHOOL_COUNSELOR',
    name: 'Okul Psikolojik Danışmanı (PDR)',
    category: 'EDUCATION',
    description: 'Öğrenci rehberliği ve psikolojik danışmanlık yapar',
    requiredEducationLevel: 'Lisans (PDR)',
    averageSalary: '₺25,000 - ₺55,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Okul, Eğitim Kurumları',
    requiredCompetencies: [
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 10, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'ACTIVE_LISTENING', competencyName: 'Aktif Dinleme', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'CONFLICT_RESOLUTION', competencyName: 'Çatışma Yönetimi', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'UNIVERSITY_PROFESSOR',
    name: 'Üniversite Öğretim Üyesi',
    category: 'EDUCATION',
    description: 'Yüksek öğretim ve akademik araştırma yapar',
    requiredEducationLevel: 'Doktora + Akademik Kadro',
    averageSalary: '₺35,000 - ₺100,000',
    jobOutlook: 'Orta',
    workEnvironment: 'Üniversite',
    requiredCompetencies: [
      { competencyId: 'RESEARCH_SKILLS', competencyName: 'Araştırma Becerileri', category: 'ACADEMIC', minimumLevel: 10, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 9, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 9, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'LEADERSHIP', competencyName: 'Liderlik', category: 'LEADERSHIP', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'SPECIAL_EDUCATION_TEACHER',
    name: 'Özel Eğitim Öğretmeni',
    category: 'EDUCATION',
    description: 'Özel gereksinimli öğrencilere eğitim verir',
    requiredEducationLevel: 'Lisans (Özel Eğitim)',
    averageSalary: '₺25,000 - ₺55,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Okul, Rehabilitasyon Merkezleri',
    requiredCompetencies: [
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 10, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'EMOTIONAL_REGULATION', competencyName: 'Duygu Düzenleme', category: 'SOCIAL_EMOTIONAL', minimumLevel: 9, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'INSTRUCTIONAL_DESIGNER',
    name: 'Eğitim Tasarımcısı',
    category: 'EDUCATION',
    description: 'Eğitim programları ve öğrenme materyalleri tasarlar',
    requiredEducationLevel: 'Lisans (Eğitim Teknolojileri, Öğretim Tasarımı)',
    averageSalary: '₺28,000 - ₺70,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Ofis, Uzaktan Çalışma',
    requiredCompetencies: [
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'DESIGN_THINKING', competencyName: 'Tasarım Düşüncesi', category: 'CREATIVE', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'DATA_ANALYSIS', competencyName: 'Veri Analizi', category: 'TECHNICAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'EARLY_CHILDHOOD_EDUCATOR',
    name: 'Okul Öncesi Öğretmeni',
    category: 'EDUCATION',
    description: '0-6 yaş arası çocukların eğitimini sağlar',
    requiredEducationLevel: 'Lisans (Okul Öncesi Öğretmenliği)',
    averageSalary: '₺22,000 - ₺45,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Anaokulu, Kreş',
    requiredCompetencies: [
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'EMOTIONAL_REGULATION', competencyName: 'Duygu Düzenleme', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },

  // İş ve Yönetim (devam)
  {
    id: 'FINANCIAL_ANALYST',
    name: 'Finansal Analist',
    category: 'BUSINESS',
    description: 'Finansal verileri analiz eder ve raporlar hazırlar',
    requiredEducationLevel: 'Lisans (İşletme, Ekonomi, Finans)',
    averageSalary: '₺35,000 - ₺95,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Ofis',
    requiredCompetencies: [
      { competencyId: 'DATA_ANALYSIS', competencyName: 'Veri Analizi', category: 'TECHNICAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'RESEARCH_SKILLS', competencyName: 'Araştırma Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'ACCOUNTANT',
    name: 'Muhasebeci',
    category: 'BUSINESS',
    description: 'Finansal kayıtları tutar ve raporlama yapar',
    requiredEducationLevel: 'Lisans (İşletme, Muhasebe)',
    averageSalary: '₺25,000 - ₺65,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Ofis',
    requiredCompetencies: [
      { competencyId: 'MATH_SKILLS', competencyName: 'Matematik Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 7, importance: 'MEDIUM', weight: 0.2 },
      { competencyId: 'DATA_ANALYSIS', competencyName: 'Veri Analizi', category: 'TECHNICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'HUMAN_RESOURCES',
    name: 'İnsan Kaynakları Uzmanı',
    category: 'BUSINESS',
    description: 'Personel yönetimi ve işe alım süreçlerini yürütür',
    requiredEducationLevel: 'Lisans (İşletme, İnsan Kaynakları)',
    averageSalary: '₺28,000 - ₺75,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Ofis',
    requiredCompetencies: [
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'CONFLICT_RESOLUTION', competencyName: 'Çatışma Yönetimi', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'DECISION_MAKING', competencyName: 'Karar Verme', category: 'LEADERSHIP', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'DATA_ANALYSIS', competencyName: 'Veri Analizi', category: 'TECHNICAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'ENTREPRENEUR',
    name: 'Girişimci',
    category: 'BUSINESS',
    description: 'Kendi işini kurar ve yönetir',
    requiredEducationLevel: 'Değişken (Lisans tercih edilir)',
    averageSalary: 'Değişken (₺0 - ₺500,000+)',
    jobOutlook: 'Orta',
    workEnvironment: 'Serbest',
    requiredCompetencies: [
      { competencyId: 'INNOVATION', competencyName: 'Yenilikçilik', category: 'CREATIVE', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'LEADERSHIP', competencyName: 'Liderlik', category: 'LEADERSHIP', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'STRATEGIC_THINKING', competencyName: 'Stratejik Düşünme', category: 'LEADERSHIP', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'PERSUASION', competencyName: 'İkna Kabiliyeti', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'DECISION_MAKING', competencyName: 'Karar Verme', category: 'LEADERSHIP', minimumLevel: 8, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'SALES_REPRESENTATIVE',
    name: 'Satış Temsilcisi',
    category: 'BUSINESS',
    description: 'Ürün ve hizmet satışı yapar',
    requiredEducationLevel: 'Lise/Lisans',
    averageSalary: '₺20,000 - ₺80,000 (komisyon dahil)',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Ofis, Saha',
    requiredCompetencies: [
      { competencyId: 'PERSUASION', competencyName: 'İkna Kabiliyeti', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'ACTIVE_LISTENING', competencyName: 'Aktif Dinleme', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'PROJECT_MANAGER',
    name: 'Proje Yöneticisi',
    category: 'BUSINESS',
    description: 'Projeleri planlar, yönetir ve koordine eder',
    requiredEducationLevel: 'Lisans + Sertifikasyon (PMP vb.)',
    averageSalary: '₺40,000 - ₺110,000',
    jobOutlook: 'Çok Yüksek',
    workEnvironment: 'Ofis, Uzaktan Çalışma',
    requiredCompetencies: [
      { competencyId: 'LEADERSHIP', competencyName: 'Liderlik', category: 'LEADERSHIP', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'STRATEGIC_THINKING', competencyName: 'Stratejik Düşünme', category: 'LEADERSHIP', minimumLevel: 8, importance: 'CRITICAL', weight: 0.2 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'DECISION_MAKING', competencyName: 'Karar Verme', category: 'LEADERSHIP', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'SUPPLY_CHAIN_MANAGER',
    name: 'Tedarik Zinciri Yöneticisi',
    category: 'BUSINESS',
    description: 'Lojistik ve tedarik süreçlerini yönetir',
    requiredEducationLevel: 'Lisans (İşletme, Lojistik)',
    averageSalary: '₺35,000 - ₺95,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Ofis, Depo',
    requiredCompetencies: [
      { competencyId: 'STRATEGIC_THINKING', competencyName: 'Stratejik Düşünme', category: 'LEADERSHIP', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'DATA_ANALYSIS', competencyName: 'Veri Analizi', category: 'TECHNICAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'LEADERSHIP', competencyName: 'Liderlik', category: 'LEADERSHIP', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'DECISION_MAKING', competencyName: 'Karar Verme', category: 'LEADERSHIP', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },

  // Sanat ve Tasarım (devam)
  {
    id: 'INTERIOR_DESIGNER',
    name: 'İç Mimar',
    category: 'ARTS',
    description: 'İç mekan tasarımı ve dekorasyon yapar',
    requiredEducationLevel: 'Lisans (İç Mimarlık)',
    averageSalary: '₺25,000 - ₺70,000',
    jobOutlook: 'Orta-Yüksek',
    workEnvironment: 'Ofis, Saha',
    requiredCompetencies: [
      { competencyId: 'DESIGN_THINKING', competencyName: 'Tasarım Düşüncesi', category: 'CREATIVE', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'ARTISTIC_ABILITY', competencyName: 'Sanatsal Yetenek', category: 'CREATIVE', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'TECHNICAL_DRAWING', competencyName: 'Teknik Çizim', category: 'TECHNICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'FASHION_DESIGNER',
    name: 'Moda Tasarımcısı',
    category: 'ARTS',
    description: 'Giysi ve aksesuar tasarlar',
    requiredEducationLevel: 'Lisans (Moda Tasarımı)',
    averageSalary: '₺22,000 - ₺90,000',
    jobOutlook: 'Orta',
    workEnvironment: 'Atölye, Ofis',
    requiredCompetencies: [
      { competencyId: 'ARTISTIC_ABILITY', competencyName: 'Sanatsal Yetenek', category: 'CREATIVE', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'DESIGN_THINKING', competencyName: 'Tasarım Düşüncesi', category: 'CREATIVE', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'INNOVATION', competencyName: 'Yenilikçilik', category: 'CREATIVE', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'ANIMATOR',
    name: 'Animatör',
    category: 'ARTS',
    description: 'Dijital animasyonlar ve görsel efektler oluşturur',
    requiredEducationLevel: 'Lisans (Animasyon, Güzel Sanatlar)',
    averageSalary: '₺25,000 - ₺80,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Stüdyo, Ofis, Uzaktan Çalışma',
    requiredCompetencies: [
      { competencyId: 'ARTISTIC_ABILITY', competencyName: 'Sanatsal Yetenek', category: 'CREATIVE', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 8, importance: 'HIGH', weight: 0.25 },
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'MUSICIAN',
    name: 'Müzisyen',
    category: 'ARTS',
    description: 'Müzik yapımı ve performans sergiler',
    requiredEducationLevel: 'Konservatuvar veya deneyim',
    averageSalary: '₺15,000 - ₺100,000+',
    jobOutlook: 'Orta',
    workEnvironment: 'Stüdyo, Sahne, Serbest',
    requiredCompetencies: [
      { competencyId: 'ARTISTIC_ABILITY', competencyName: 'Sanatsal Yetenek', category: 'CREATIVE', minimumLevel: 10, importance: 'CRITICAL', weight: 0.4 },
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 8, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'EMOTIONAL_REGULATION', competencyName: 'Duygu Düzenleme', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'ART_DIRECTOR',
    name: 'Sanat Yönetmeni',
    category: 'ARTS',
    description: 'Yaratıcı projelerin görsel yönünü yönetir',
    requiredEducationLevel: 'Lisans (Güzel Sanatlar, Grafik Tasarım)',
    averageSalary: '₺35,000 - ₺100,000',
    jobOutlook: 'Orta-Yüksek',
    workEnvironment: 'Ajans, Ofis',
    requiredCompetencies: [
      { competencyId: 'ARTISTIC_ABILITY', competencyName: 'Sanatsal Yetenek', category: 'CREATIVE', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'LEADERSHIP', competencyName: 'Liderlik', category: 'LEADERSHIP', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'STRATEGIC_THINKING', competencyName: 'Stratejik Düşünme', category: 'LEADERSHIP', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 }
    ]
  },

  // Hukuk (devam)
  {
    id: 'JUDGE',
    name: 'Hakim',
    category: 'LAW',
    description: 'Hukuki kararlar verir ve mahkeme yönetir',
    requiredEducationLevel: 'Hukuk Fakültesi + Hakim Adaylığı',
    averageSalary: '₺50,000 - ₺150,000',
    jobOutlook: 'Orta',
    workEnvironment: 'Mahkeme',
    requiredCompetencies: [
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 10, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'DECISION_MAKING', competencyName: 'Karar Verme', category: 'LEADERSHIP', minimumLevel: 10, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 9, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'EMOTIONAL_REGULATION', competencyName: 'Duygu Düzenleme', category: 'SOCIAL_EMOTIONAL', minimumLevel: 9, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'RESEARCH_SKILLS', competencyName: 'Araştırma Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'NOTARY',
    name: 'Noter',
    category: 'LAW',
    description: 'Resmi belge onayı ve hukuki işlemler yapar',
    requiredEducationLevel: 'Hukuk Fakültesi + Noterlik Sınavı',
    averageSalary: '₺45,000 - ₺140,000',
    jobOutlook: 'Orta',
    workEnvironment: 'Noter Ofisi',
    requiredCompetencies: [
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'RESEARCH_SKILLS', competencyName: 'Araştırma Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'LEGAL_CONSULTANT',
    name: 'Hukuk Danışmanı',
    category: 'LAW',
    description: 'Şirketlere ve bireylere hukuki danışmanlık verir',
    requiredEducationLevel: 'Hukuk Fakültesi',
    averageSalary: '₺35,000 - ₺120,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Ofis, Uzaktan Çalışma',
    requiredCompetencies: [
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'WRITTEN_COMMUNICATION', competencyName: 'Yazılı İletişim', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'RESEARCH_SKILLS', competencyName: 'Araştırma Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'STRATEGIC_THINKING', competencyName: 'Stratejik Düşünme', category: 'LEADERSHIP', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 }
    ]
  },

  // Sosyal Hizmetler (devam)
  {
    id: 'CHILD_PROTECTION_WORKER',
    name: 'Çocuk Koruma Uzmanı',
    category: 'SOCIAL_SERVICES',
    description: 'Çocukların hakları ve güvenliğini korur',
    requiredEducationLevel: 'Lisans (Sosyal Hizmetler, Psikoloji)',
    averageSalary: '₺25,000 - ₺60,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Kamu Kurumları, Saha',
    requiredCompetencies: [
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 10, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'ACTIVE_LISTENING', competencyName: 'Aktif Dinleme', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'CONFLICT_RESOLUTION', competencyName: 'Çatışma Yönetimi', category: 'SOCIAL_EMOTIONAL', minimumLevel: 9, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'EMOTIONAL_REGULATION', competencyName: 'Duygu Düzenleme', category: 'SOCIAL_EMOTIONAL', minimumLevel: 9, importance: 'HIGH', weight: 0.15 },
      { competencyId: 'DECISION_MAKING', competencyName: 'Karar Verme', category: 'LEADERSHIP', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'REHABILITATION_COUNSELOR',
    name: 'Rehabilitasyon Danışmanı',
    category: 'SOCIAL_SERVICES',
    description: 'Engelli bireylerin topluma katılımını destekler',
    requiredEducationLevel: 'Lisans (Sosyal Hizmetler, Rehabilitasyon)',
    averageSalary: '₺24,000 - ₺55,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Rehabilitasyon Merkezleri, Hastane',
    requiredCompetencies: [
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 10, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'ACTIVE_LISTENING', competencyName: 'Aktif Dinleme', category: 'COMMUNICATION', minimumLevel: 9, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'EMOTIONAL_REGULATION', competencyName: 'Duygu Düzenleme', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'COMMUNITY_ORGANIZER',
    name: 'Toplum Organizatörü',
    category: 'SOCIAL_SERVICES',
    description: 'Toplumsal projeleri organize eder ve yönetir',
    requiredEducationLevel: 'Lisans (Sosyoloji, Sosyal Hizmetler)',
    averageSalary: '₺22,000 - ₺55,000',
    jobOutlook: 'Orta',
    workEnvironment: 'STK, Topluluk Merkezleri',
    requiredCompetencies: [
      { competencyId: 'LEADERSHIP', competencyName: 'Liderlik', category: 'LEADERSHIP', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 9, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'STRATEGIC_THINKING', competencyName: 'Stratejik Düşünme', category: 'LEADERSHIP', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'FAMILY_COUNSELOR',
    name: 'Aile Danışmanı',
    category: 'SOCIAL_SERVICES',
    description: 'Ailelere psikolojik destek ve danışmanlık verir',
    requiredEducationLevel: 'Lisans (Psikoloji, Aile Danışmanlığı) + Sertifika',
    averageSalary: '₺25,000 - ₺65,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Klinik, Danışmanlık Merkezi',
    requiredCompetencies: [
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 10, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'ACTIVE_LISTENING', competencyName: 'Aktif Dinleme', category: 'COMMUNICATION', minimumLevel: 10, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'CONFLICT_RESOLUTION', competencyName: 'Çatışma Yönetimi', category: 'SOCIAL_EMOTIONAL', minimumLevel: 9, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'EMOTIONAL_REGULATION', competencyName: 'Duygu Düzenleme', category: 'SOCIAL_EMOTIONAL', minimumLevel: 9, importance: 'MEDIUM', weight: 0.1 }
    ]
  },

  // Spor (devam)
  {
    id: 'PROFESSIONAL_ATHLETE',
    name: 'Profesyonel Sporcu',
    category: 'SPORTS',
    description: 'Profesyonel düzeyde spor yapar',
    requiredEducationLevel: 'Yetenek ve Deneyim',
    averageSalary: '₺15,000 - ₺500,000+',
    jobOutlook: 'Düşük-Orta',
    workEnvironment: 'Spor Tesisleri, Saha',
    requiredCompetencies: [
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 10, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'PHYSICAL_COORDINATION', competencyName: 'Fiziksel Koordinasyon', category: 'PHYSICAL', minimumLevel: 10, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'EMOTIONAL_REGULATION', competencyName: 'Duygu Düzenleme', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'DECISION_MAKING', competencyName: 'Karar Verme', category: 'LEADERSHIP', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'SPORTS_PHYSIOTHERAPIST',
    name: 'Spor Fizyoterapisti',
    category: 'SPORTS',
    description: 'Sporcuların yaralanmalarını tedavi eder',
    requiredEducationLevel: 'Lisans (Fizyoterapi) + Spor Uzmanlığı',
    averageSalary: '₺28,000 - ₺80,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Spor Tesisleri, Klinik',
    requiredCompetencies: [
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'FITNESS_TRAINER',
    name: 'Fitness Antrenörü',
    category: 'SPORTS',
    description: 'Bireysel fitness programları hazırlar ve uygular',
    requiredEducationLevel: 'Sertifika veya Lisans (Beden Eğitimi)',
    averageSalary: '₺18,000 - ₺60,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Spor Salonu, Özel Antrenörlük',
    requiredCompetencies: [
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'EMPATHY', competencyName: 'Empati', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.2 },
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'LEADERSHIP', competencyName: 'Liderlik', category: 'LEADERSHIP', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'PHYSICAL_COORDINATION', competencyName: 'Fiziksel Koordinasyon', category: 'PHYSICAL', minimumLevel: 8, importance: 'MEDIUM', weight: 0.1 }
    ]
  },

  // El Sanatları ve Teknik İşler (TRADES)
  {
    id: 'ELECTRICIAN',
    name: 'Elektrikçi',
    category: 'TRADES',
    description: 'Elektrik tesisatı kurar ve onarır',
    requiredEducationLevel: 'Meslek Lisesi veya Usta-Çırak',
    averageSalary: '₺20,000 - ₺55,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Saha, İnşaat, Bina',
    requiredCompetencies: [
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 6, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 6, importance: 'MEDIUM', weight: 0.2 },
      { competencyId: 'PHYSICAL_COORDINATION', competencyName: 'Fiziksel Koordinasyon', category: 'PHYSICAL', minimumLevel: 8, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'PLUMBER',
    name: 'Tesisatçı',
    category: 'TRADES',
    description: 'Su ve doğalgaz tesisatı kurar ve onarır',
    requiredEducationLevel: 'Meslek Lisesi veya Usta-Çırak',
    averageSalary: '₺22,000 - ₺60,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Saha, İnşaat, Bina',
    requiredCompetencies: [
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'PHYSICAL_COORDINATION', competencyName: 'Fiziksel Koordinasyon', category: 'PHYSICAL', minimumLevel: 8, importance: 'HIGH', weight: 0.25 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 6, importance: 'MEDIUM', weight: 0.2 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'CARPENTER',
    name: 'Marangoz',
    category: 'TRADES',
    description: 'Ahşap mobilya ve yapılar üretir',
    requiredEducationLevel: 'Meslek Lisesi veya Usta-Çırak',
    averageSalary: '₺20,000 - ₺55,000',
    jobOutlook: 'Orta',
    workEnvironment: 'Atölye, Saha',
    requiredCompetencies: [
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'PHYSICAL_COORDINATION', competencyName: 'Fiziksel Koordinasyon', category: 'PHYSICAL', minimumLevel: 8, importance: 'HIGH', weight: 0.25 },
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 7, importance: 'MEDIUM', weight: 0.2 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'WELDER',
    name: 'Kaynakçı',
    category: 'TRADES',
    description: 'Metal parçaları kaynak yaparak birleştirir',
    requiredEducationLevel: 'Meslek Lisesi veya Usta-Çırak',
    averageSalary: '₺22,000 - ₺60,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Fabrika, İnşaat, Atölye',
    requiredCompetencies: [
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'PHYSICAL_COORDINATION', competencyName: 'Fiziksel Koordinasyon', category: 'PHYSICAL', minimumLevel: 8, importance: 'HIGH', weight: 0.25 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 8, importance: 'MEDIUM', weight: 0.2 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 6, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 5, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'AUTO_MECHANIC',
    name: 'Oto Tamircisi',
    category: 'TRADES',
    description: 'Araç bakımı ve onarımı yapar',
    requiredEducationLevel: 'Meslek Lisesi veya Usta-Çırak',
    averageSalary: '₺20,000 - ₺50,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Servis, Atölye',
    requiredCompetencies: [
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.3 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.25 },
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 6, importance: 'MEDIUM', weight: 0.2 },
      { competencyId: 'PHYSICAL_COORDINATION', competencyName: 'Fiziksel Koordinasyon', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.1 }
    ]
  },
  {
    id: 'HVAC_TECHNICIAN',
    name: 'Klima ve Havalandırma Teknisyeni',
    category: 'TRADES',
    description: 'Klima ve havalandırma sistemlerini kurar ve onarır',
    requiredEducationLevel: 'Meslek Lisesi veya Sertifika',
    averageSalary: '₺22,000 - ₺60,000',
    jobOutlook: 'Çok Yüksek',
    workEnvironment: 'Saha, Bina',
    requiredCompetencies: [
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 8, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'SCIENCE_SKILLS', competencyName: 'Fen Bilimleri Becerileri', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.25 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'MEDIUM', weight: 0.2 },
      { competencyId: 'PHYSICAL_COORDINATION', competencyName: 'Fiziksel Koordinasyon', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'CHEF',
    name: 'Aşçı (Şef)',
    category: 'TRADES',
    description: 'Yemek hazırlar ve mutfak yönetir',
    requiredEducationLevel: 'Aşçılık Okulu veya Usta-Çırak',
    averageSalary: '₺20,000 - ₺70,000',
    jobOutlook: 'Yüksek',
    workEnvironment: 'Restoran, Otel',
    requiredCompetencies: [
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.25 },
      { competencyId: 'CREATIVITY', competencyName: 'Yaratıcılık', category: 'CREATIVE', minimumLevel: 8, importance: 'HIGH', weight: 0.25 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 8, importance: 'HIGH', weight: 0.2 },
      { competencyId: 'LEADERSHIP', competencyName: 'Liderlik', category: 'LEADERSHIP', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 },
      { competencyId: 'TEAMWORK', competencyName: 'Takım Çalışması', category: 'SOCIAL_EMOTIONAL', minimumLevel: 7, importance: 'MEDIUM', weight: 0.15 }
    ]
  },
  {
    id: 'LOCKSMITH',
    name: 'Çilingir',
    category: 'TRADES',
    description: 'Kilit sistemlerini kurar, onarır ve açar',
    requiredEducationLevel: 'Usta-Çırak veya Sertifika',
    averageSalary: '₺18,000 - ₺50,000',
    jobOutlook: 'Orta',
    workEnvironment: 'Saha, Atölye',
    requiredCompetencies: [
      { competencyId: 'MANUAL_DEXTERITY', competencyName: 'El Becerisi', category: 'PHYSICAL', minimumLevel: 9, importance: 'CRITICAL', weight: 0.35 },
      { competencyId: 'CRITICAL_THINKING', competencyName: 'Eleştirel Düşünme', category: 'ACADEMIC', minimumLevel: 7, importance: 'HIGH', weight: 0.25 },
      { competencyId: 'PHYSICAL_COORDINATION', competencyName: 'Fiziksel Koordinasyon', category: 'PHYSICAL', minimumLevel: 8, importance: 'MEDIUM', weight: 0.2 },
      { competencyId: 'VERBAL_COMMUNICATION', competencyName: 'Sözlü İletişim', category: 'COMMUNICATION', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 },
      { competencyId: 'STAMINA', competencyName: 'Dayanıklılık', category: 'PHYSICAL', minimumLevel: 6, importance: 'MEDIUM', weight: 0.1 }
    ]
  }
];

// Yetkinlik Kategorisi Etiketleri
export const COMPETENCY_CATEGORY_LABELS: Record<CompetencyCategory, string> = {
  ACADEMIC: 'Akademik Yetkinlikler',
  SOCIAL_EMOTIONAL: 'Sosyal-Duygusal Yetkinlikler',
  TECHNICAL: 'Teknik Beceriler',
  CREATIVE: 'Yaratıcı Yetkinlikler',
  PHYSICAL: 'Fiziksel Yetkinlikler',
  LEADERSHIP: 'Liderlik Becerileri',
  COMMUNICATION: 'İletişim Becerileri'
};

// Meslek Kategorisi Etiketleri
export const CAREER_CATEGORY_LABELS = {
  STEM: 'Fen, Teknoloji, Mühendislik, Matematik',
  HEALTH: 'Sağlık',
  EDUCATION: 'Eğitim',
  BUSINESS: 'İş ve Yönetim',
  ARTS: 'Sanat ve Tasarım',
  SOCIAL_SERVICES: 'Sosyal Hizmetler',
  LAW: 'Hukuk',
  SPORTS: 'Spor',
  MEDIA: 'Medya ve İletişim',
  TRADES: 'El Sanatları ve Teknik İşler'
};

// Uyumluluk Seviyesi Renkleri
export const COMPATIBILITY_COLORS = {
  EXCELLENT: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  GOOD: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  MODERATE: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  LOW: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' }
};

// Önem Seviyesi Renkleri
export const IMPORTANCE_COLORS = {
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-800' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-800' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  LOW: { bg: 'bg-gray-100', text: 'text-gray-800' }
};
