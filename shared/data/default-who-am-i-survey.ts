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

const whoAmIQuestions: SurveyQuestion[] = [];

const whoAmICategories = [
  { category: 'Davranış Özellikleri', items: [
    'Hareketliyim',
    'Kavgacıyım',
    'Plansızım',
    'Uysalım',
    'Somurtkanım',
    'Pasaklıyım',
    'Çok konuşuyorum'
  ]},
  { category: 'Zeka ve Akademik Yetenek', items: [
    'Yeterince akıllı değilim',
    'Zekiyim',
    'Ezberciyim',
    'Beceriksizim',
    'Yetenekliyim',
    'Başarılıyım'
  ]},
  { category: 'Kişilik ve Duygusal Özellikler', items: [
    'Cesaretsizim',
    'Ciddiyim',
    'Neşeliyim',
    'Cana yakınım',
    'Haylazım',
    'Güçlüyüm',
    'Hayalperestim',
    'Kıskancım',
    'Kötümserim',
    'Tembelim'
  ]},
  { category: 'Sosyal ve İlişkisel Özellikler', items: [
    'Yakışıklıyım/Güzelim',
    'İlgisizim',
    'Saygısızım',
    'Şımarığım',
    'Uyumsuzum',
    'Mutlu değilim',
    'Sevilen biriyim',
    'Sakarım',
    'Dürüstüm',
    'Paylaşımcıyım',
    'Popülerim'
  ]},
  { category: 'Sağlık ve Spor', items: [
    'Her zaman hastayım',
    'Sportmenim'
  ]},
  { category: 'Olumsuz Benlik Algısı', items: [
    'Talihsizim',
    'Zavallının biriyim'
  ]},
  { category: 'Pozitif Kişilik Özellikleri', items: [
    'Kararlıyım'
  ]}
];

whoAmICategories.forEach(({ category, items }) => {
  items.forEach((item, index) => {
    const questionId = `kime-gore-ben-neyim-2025-q-${whoAmIQuestions.length + 1}`;
    whoAmIQuestions.push({
      id: questionId,
      questionText: item,
      questionType: 'CHECKBOX',
      required: false,
      options: ['Öğretmenlerime Göre', 'Anneme Göre', 'Babama Göre', 'Kardeşlerime Göre', 'Arkadaşlarıma Göre', 'Bana Göre'],
      category
    });
  });
});

export const DEFAULT_SURVEY_TEMPLATES_WHO_AM_I: SurveyTemplateDefault[] = [
  {
    template: {
      id: 'kime-gore-ben-neyim-2025',
      title: 'Kime Göre Ben Neyim? Formu',
      description: 'Öğrencilerin kendilerine yönelik farklı perspektiflerden bakılarak benlik algısını ve sosyal anlamlandırmalarını değerlendiren form. Öğretmenler, ailesi (anne, baba, kardeşler) ve arkadaşları tarafından nasıl görüldüklerini ve kendi algılarını karşılaştıran. Benlik konsepti gelişimi ve kişisel farkındalık için MEB rehberlik hizmetlerine uygun araç.',
      targetAudience: 'STUDENT',
      tags: ['Benlik Algısı', 'Sosyal Perspektif', 'Kişisel Farkındalık', 'MEB', 'Öz Tanıma'],
      createdBy: 'Sistem',
      isActive: true
    },
    questions: whoAmIQuestions
  }
];
