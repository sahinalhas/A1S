export interface SurveyQuestion {
  id?: string;
  questionText: string;
  questionType: 'YES_NO' | 'TEXT' | 'MULTIPLE_CHOICE' | 'SCALE' | 'CHECKBOX';
  required: boolean;
  options?: string[];
  category?: string;
}

export interface SurveyTemplateDefault {
  template: {
    id: string;
    title: string;
    description: string;
    targetAudience: 'STUDENT' | 'PARENT' | 'TEACHER' | 'ALL';
    tags: string[];
    createdBy: string;
    isActive: boolean;
  };
  questions: SurveyQuestion[];
}

const riskMapQuestions: SurveyQuestion[] = [];

const riskFactorCategories = [
  { category: 'Aile Eğitim Durumu', items: [
    'Anne en fazla ilkokul mezunu',
    'Baba en fazla ilkokul mezunu'
  ]},
  { category: 'Kardeş Durumu', items: [
    'Tek çocuk olan',
    '5 ve üstü kardeşi olan'
  ]},
  { category: 'Aile Yapısı', items: [
    'Anne ve babası ayrı yaşayan',
    'Anne ve babası boşanmış olan',
    'Yalnızca annesi ile yaşayan',
    'Yalnızca babası ile yaşayan',
    'Annesi hayatta olmayan',
    'Babası hayatta olmayan',
    'Anne ve babası hayatta olmayan',
    'Şehit Çocuğu'
  ]},
  { category: 'Bakım ve Yerleşim', items: [
    'Yalnızca büyükanne/büyükbabasıyla yaşayan',
    'Yalnızca diğer akrabalarıyla yaşayan',
    'Koruyucu aile gözetiminde olan',
    'Sevgi Evlerinde kalan',
    'Sosyal Hizmetler Çocuk Esirgeme Kurumunda kalan'
  ]},
  { category: 'Ailede Sağlık Sorunları', items: [
    'Ailesinde süreğen hastalığı olan',
    'Ailesinde ruhsal hastalığı olan',
    'Ailesinde bağımlı bireyler bulunan (alkol/madde)'
  ]},
  { category: 'Aile Hukuki ve Sosyal Durumu', items: [
    'Ailesinde cezai hükmü bulunan',
    'Ailesi mevsimlik işçi olan',
    'Aile içi şiddete maruz kalan'
  ]},
  { category: 'Öğrenci Özel Durumları', items: [
    'Özel yetenekli tanısı olan',
    'Yetersizlik alanında özel eğitim raporu olan'
  ]},
  { category: 'Öğrenci Sağlık Durumu', items: [
    'Süreğen hastalığı olan',
    'Ruhsal hastalığı olan'
  ]},
  { category: 'Yasal Tedbirler', items: [
    'Danışmanlık tedbir kararı olan',
    'Eğitim tedbir kararı olan'
  ]},
  { category: 'Sosyo-Ekonomik ve Akademik Durum', items: [
    'Maddi sıkıntı yaşayan',
    'Sürekli devamsız olan',
    'Bir işte çalışan',
    'Akademik başarısı düşük',
    'Riskli akran grubuna dahil olan'
  ]},
  { category: 'Diğer', items: [
    'Diğer (açıklama gerektirir)'
  ]}
];

riskFactorCategories.forEach(({ category, items }) => {
  items.forEach((item, index) => {
    const questionId = `sinif-risk-haritasi-2025-q-${riskMapQuestions.length + 1}`;
    riskMapQuestions.push({
      id: questionId,
      questionText: item,
      questionType: 'YES_NO',
      required: false,
      options: ['Evet', 'Hayır'],
      category
    });
  });
});

export const DEFAULT_SURVEY_TEMPLATES: SurveyTemplateDefault[] = [
  {
    template: {
      id: 'sinif-risk-haritasi-2025',
      title: 'Sınıf Risk Haritası',
      description: 'Öğrencilerin risk faktörlerini değerlendirmek için kullanılan kapsamlı risk haritası anketi. MEB Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürlüğü formatına uygun.',
      targetAudience: 'STUDENT',
      tags: ['Risk Değerlendirme', 'Rehberlik', 'MEB', 'Öğrenci Takip', 'Koruma'],
      createdBy: 'Sistem',
      isActive: true
    },
    questions: riskMapQuestions
  }
];
