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

const internetAddictionQuestions: SurveyQuestion[] = [];

const internetAddictionCategories = [
  { category: 'Zaman Kaybı ve Kontrol Kaybı', items: [
    'İnternete girdiğinizde düşündüğünüzden daha uzun süre kaldığınızı ne sıklıkta fark ediyorsunuz?',
    'İnternette ne kadar kaldığınızı saklamaya ne sıklıkta çalışıyorsunuz?',
    'İnternette geçirdiğiniz vakti ne sıklıkta azaltmaya çalışıyor ancak başarılı olamıyorsunuz?',
    'İnternetteyken ne sıklıkta kendinizi "Birkaç dakika daha!" derken buluyorsunuz?',
    'Kendinizi ne sıklıkta tekrar ne zaman internete gireceğinizi düşünürken buluyorsunuz?'
  ]},
  { category: 'Sosyal ve Akademik Etkileri', items: [
    'İnternette daha fazla kalmak için evdeki sorumluluklarınızı ne sıklıkta ihmal ediyorsunuz?',
    'İnternetin heyecanını dostlarınızın yakınlığına ne sıklıkta tercih ediyorsunuz?',
    'Hayatınızdaki insanlar internette geçirdiğiniz süre konusunda ne sıklıkta şikâyet ediyorlar?',
    'İnternette geçirdiğiniz zaman nedeniyle derslerinizde ne sıklıkta problem yaşıyorsunuz?',
    'Dersteki performansınız ya da üretkenliğiniz internet sebebiyle ne sıklıkta düşüyor?',
    'Arkadaşlarınızla dışarı gitmek yerine internette kalmayı ne sıklıkta tercih ediyorsunuz?'
  ]},
  { category: 'Duygusal Bağımlılık ve Kaçış Davranışları', items: [
    'Hayatınızla alakalı sizi rahatsız eden düşünceleri interneti kullanarak zihninizden ne sıklıkta uzaklaştırıyorsunuz?',
    'İnternetin olmadığı bir hayatın boş, keyifsiz ve sıkıcı olacağını ne sıklıkta düşünüyorsunuz?',
    'İnternet kullanmadığınız zaman ne sıklıkta depresif, huysuz ve kaygılı oluyor ve internet kullandığınızda geçtiğini hissediyorsunuz?',
    'İnternette olmadığınızda internete ne zaman geri döneceğinizle ne sıklıkta meşgul oluyorsunuz ya da internette olduğunuzu ne sıklıkta hayal ediyorsunuz?'
  ]},
  { category: 'Olumsuz Tepkiler ve Yatışma Belirtileri', items: [
    'İnternetteyken meşgul edildiğinizde ne sıklıkta bağırıyor, sinirleniyor ya da öfke duyuyorsunuz?',
    'Geç vakitlere kadar internette olduğunuz için ne sıklıkta uykusuz kalıyorsunuz?',
    'İnternet üzerinden ne sıklıkta yeni biriyle arkadaşlık kuruyorsunuz?',
    'İnternette ne yaptığınız sorulduğunda ne sıklıkta saldırgan ya da ketum oluyorsunuz?'
  ]},
  { category: 'İnternet Kullanım Davranışları', items: [
    'Bir şey yapmadan önce e-mailinizi ne sıklıkta kontrol ediyorsunuz?'
  ]}
];

internetAddictionCategories.forEach(({ category, items }) => {
  items.forEach((item, index) => {
    const questionId = `internet-bagimlilik-2025-q-${internetAddictionQuestions.length + 1}`;
    internetAddictionQuestions.push({
      id: questionId,
      questionText: item,
      questionType: 'YES_NO',
      required: false,
      options: ['Hiçbir Zaman', 'Bazen', 'Sıklıkla', 'Çoğu Zaman', 'Her Zaman'],
      category
    });
  });
});

export const DEFAULT_SURVEY_TEMPLATES_INTERNET_ADDICTION: SurveyTemplateDefault[] = [
  {
    template: {
      id: 'internet-bagimlilik-2025',
      title: 'İnternet Bağımlılığı Ölçeği',
      description: 'Öğrencilerin internet bağımlılığı düzeyini ölçmek amacıyla hazırlanan kapsamlı ölçek. Zaman kaybı, kontrol kaybı, sosyal ve akademik etkiler, duygusal bağımlılık, kaçış davranışları ve yatışma belirtilerini değerlendiren. MEB rehberlik hizmetlerine uygun bilinçli internet kullanımı değerlendirme aracı.',
      targetAudience: 'STUDENT',
      tags: ['İnternet Bağımlılığı', 'Dijital Okuryazarlık', 'Çevrimiçi Davranışlar', 'MEB', 'Sağlıklı Kullanım'],
      createdBy: 'Sistem',
      isActive: true
    },
    questions: internetAddictionQuestions
  }
];
