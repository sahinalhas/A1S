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

const efficientStudyQuestions: SurveyQuestion[] = [];

const efficientStudyCategories = [
  { category: 'Hedef Belirleme ve Zaman Yönetimi', items: [
    'Zamanı verimli kullanmak için kısa, orta ve uzun dönemli hedefler belirlerim',
    'Belirlediğim hedeflerimi her zaman göreceğim bir yere koyarım',
    'Hedeflerim arasında öncelik sırası belirlerim',
    'Hedeflerimi gerçekleştirmek üzere her gün belirli bir zaman ayırır ve ayırdığım bu zamana uyarım',
    'Başarılı olmak için enerjimi okul ile ilgili hedeflerim doğrultusunda kullanırım'
  ]},
  { category: 'Çalışma Planlaması', items: [
    'Çalışma planı yaparken nasıl, ne zaman ve nerede çalışacağıma karar veririm',
    'Çalışma planımda her ders ya da konuya ayrılacak süreyi kendi öğrenme hızıma göre planlarım',
    'Aynı anda birden fazla iş yapmak yerine bunlardan birini seçer ve ona odaklanırım',
    'Ders çalışırken belirli aralıklarla mola veririm',
    'Çalışma planımda derslerimi aksatmayacak şekilde sosyal ve kültürel faaliyetlere yer veririm',
    'Çalışma planımda okula, dinlenmeye, ev ile ilgili sorumluluklarıma ve uykuya ayırdığım süreyi belirtirim'
  ]},
  { category: 'Enerji ve Motivasyon Yönetimi', items: [
    'Çalışma saatlerimi kendimi dinlenmiş hissettiğim zamanlara göre planlarım',
    'Verimsiz geçirdiğim zamanların farkına varırım ve gerekli önlemleri alırım',
    'Teknolojik aletlere (TV, bilgisayar, telefon vb.) ayırdığım zamanı kısıtlarım'
  ]},
  { category: 'Ders Çalışma Teknikleri', items: [
    'Uzun konuları küçük parçalara bölerek çalışırım',
    'Hatırlamayı kolaylaştırmak için şekil (şema, grafik, tablo) çizerek çalışırım',
    'Çalışmayı bitirmeden önce notlarımı hızlıca gözden geçiririm',
    'Öğrendiklerimi, uyumadan önce ve sabah kalkınca hızlı bir şekilde gözden geçiririm',
    'Öğrendiklerimi ihtiyaç duyduğumda günlük hayatta kullanırım'
  ]},
  { category: 'Çalışma Ortamı Düzenlemesi', items: [
    'Çalışma masamın yüksekliği boyuma uygundur',
    'Çalışma masamı yalnızca ders çalışmak için kullanırım',
    'Çalışmaya başlamadan önce gerekli araç gereçleri hazır bulundururum',
    'Sürekli aynı yerde ders çalışırım',
    'Her zaman masa veya sehpada ve oturarak çalışırım'
  ]},
  { category: 'Çalışma Ortamı Özellikleri', items: [
    'Çalışma ortamımın sessiz sakin olmasına dikkat ederim',
    'Çalışma ortamımın düzenli ve sade olmasına dikkat ederim',
    'Çalışma masamda, öğreneceğim konu dışındaki materyalleri kaldırırım',
    'Ders çalışırken aynı zamanda başka bir işle (TV izlemek, müzik dinlemek, telefonla konuşmak vb.) uğraşmamaya dikkat ederim',
    'Çalışma ortamıma dersle ilgili hatırlatıcı notlar asarım',
    'Çalışma ortamımda dikkatimi dağıtan afiş, poster vb. bulundurmam',
    'Çalışma ortamım ne çok sıcak ne çok soğuktur',
    'Çalışma ortamımı düzenli olarak havalandırırım'
  ]},
  { category: 'Dikkat ve Odaklanma', items: [
    'Hayal kurduğumu fark ettiğimde ders çalışmaya ara veririm',
    'Hayal kurmayı dinlenme aralarında kendime ödül olarak veririm'
  ]},
  { category: 'Okuma ve Anlama Stratejileri', items: [
    'Ders çalışmaya başlamadan önce çalışacağım konunun ana ve alt başlıklarını, ilk ve son paragraflarını gözden geçiririm',
    'Çalışacağım konu ile ilgili olarak ayrıntılı sorular hazırlarım',
    'Hazırladığım soruların cevabını bulmak için tekrar tekrar okurum',
    'Hazırladığım soruları kendi kendime anlatarak cevaplarım',
    'Öğrendiklerimi unutmamak için günlük, haftalık, aylık tekrar yaparım'
  ]},
  { category: 'Derste Dikkat ve Katılım', items: [
    'Dinlerken hangi konunun önemli olduğunu ayırt ederim',
    'Her konuya ait ana fikirleri anlamaya çalışırım',
    'Öğretmenin özellikle üzerinde durduğu noktalara dikkat ederim',
    'Anlamadığım konularda soru sorarak, eksik bulduğum yerleri tamamlayarak derse katılırım',
    'Dinlediğim konuyu ayrıntılı öğrenmek için başka kaynaklardan (kitap, internet vb.) yararlanırım'
  ]},
  { category: 'Ders Hazırlığı ve Not Tutma', items: [
    'Derste not tutarım',
    'O gün işlenecek konuları okuyarak derse gelirim',
    'İşlenecek konular ile ilgili anlamadığım noktaları derste öğretmene sorarım'
  ]}
];

efficientStudyCategories.forEach(({ category, items }) => {
  items.forEach((item, index) => {
    const questionId = `verimli-ders-calisma-2025-q-${efficientStudyQuestions.length + 1}`;
    efficientStudyQuestions.push({
      id: questionId,
      questionText: item,
      questionType: 'YES_NO',
      required: false,
      options: ['Hayır', 'Kısmen', 'Evet'],
      category
    });
  });
});

export const DEFAULT_SURVEY_TEMPLATES_EFFICIENT_STUDY: SurveyTemplateDefault[] = [
  {
    template: {
      id: 'verimli-ders-calisma-2025',
      title: 'Verimli Ders Çalışma Kontrol Listesi',
      description: 'Öğrencilerin verimli ders çalışma yöntem ve tekniklerini değerlendirmek ve özgün bir çalışma yöntemi geliştirebilmeleri amacıyla hazırlanan anketi. Zaman yönetimi, planlama, çalışma teknikleri, çalışma ortamı ve derste katılım gibi faktörleri kapsamlı şekilde değerlendiren. MEB Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürlüğü formatına uygun.',
      targetAudience: 'STUDENT',
      tags: ['Ders Çalışma', 'Zaman Yönetimi', 'Rehberlik', 'MEB', 'Akademik Beceriler'],
      createdBy: 'Sistem',
      isActive: true
    },
    questions: efficientStudyQuestions
  }
];
