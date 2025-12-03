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

const failureReasonsQuestions: SurveyQuestion[] = [];

const failureReasonsCategories = [
  { category: 'Öğretmen ve Ders İlişkisi', items: [
    'Bazı öğretmenlerimizin anlattıklarını anlayamıyorum',
    'Öğretmenlerin anlattıkları kitaptakinin aynısı olduğundan dersi dinlemiyorum',
    'Öğretmenlerimle anlaşamadığım için',
    'Öğretmenler konuları yeterli şekilde öğretemediklerinden dolayı başarısızım',
    'Bazı öğretmenlerin tavırları beni dersten soğutuyor'
  ]},
  { category: 'Okul Ortamı ve Sınıf Yapısı', items: [
    'Okul idaresi öğrenci problemleri ile ilgilenmediği için',
    'Okul ortamından dolayı',
    'Sınıfımız çok kalabalık, öğretmenler bizimle fazla ilgilenemiyor',
    'Tahtayı iyi göremiyorum',
    'Bazı arkadaşlar sınıfın huzurunu bozuyor',
    'Okulu sevmiyorum'
  ]},
  { category: 'Ders Yönetimi ve Ödev', items: [
    'Derslerimizin fazlalığından dolayı başarısız oluyorum',
    'Ağır öğrenilen dersler hep aynı günlerde, zihinsel olarak yoruluyorum',
    'Yazılılarda çok konudan sorumlu tutuluyoruz',
    'Derslerimizde uygulama yapamadığımız için',
    'Ödev çok veriliyor'
  ]},
  { category: 'Evde Ders Çalışma Ortamı', items: [
    'Evde ders çalışma ortamım yok',
    'Derslerde not tutmuyorum, çalışırken özet çıkarmıyorum'
  ]},
  { category: 'Aile Baskısı ve Beklentileri', items: [
    'Ailemin benden üstün başarı beklemesi beni korkutuyor',
    'Ailem bana her gün okulla ilgili sıkıcı sorular soruyor',
    'Ailem başarısız olduğumda beni cezalandırıyor',
    'Ailemin ilgisini çekmek için bilerek başarısız oluyorum',
    'Ailem beni dinlemiyor, fikirlerime önem vermiyor'
  ]},
  { category: 'Ekonomik Problemler', items: [
    'Ailemdeki ekonomik problemlerden dolayı',
    'Okul dışındaki saatlerde çalıştığımdan dolayı'
  ]},
  { category: 'Sağlık Sorunları', items: [
    'Yeterince uyuyamadığım için, derslerde uyukladığımı hissediyorum',
    'Yeterli beslenemediğim için',
    'Gözlerimde bozukluk var',
    'Kulaklarımdan rahatsızım'
  ]},
  { category: 'Aile Yapısı Sorunları', items: [
    'Annem-babam olmadığı için',
    'Ailemden ayrı olduğum için',
    'Ailemde kardeşler arasında ayrım yapıldığı için',
    'Ailemde öz-üvey ayrımı yapıldığı için',
    'Ailemden yeterli ilgi ve desteği göremediğim için'
  ]},
  { category: 'Aile İçi Huzursuzluk', items: [
    'Ailemdeki huzursuzluktan dolayı',
    'Babamın kötü alışkanlıklarından dolayı yaşadığı problemleri bana yansıttığı için',
    'Ailemdeki uzun süreli hastalıklardan dolayı'
  ]},
  { category: 'Akademik Kaygı ve Özgüven', items: [
    'Yazılı sınavlarda unuttuğumdan dolayı',
    'Yazılı sınavlarda heyecanlandığımdan dolayı',
    'Sözlü anlatımlarda heyecanlandığımdan dolayı',
    'Bazı dersleri başaramayacağım kaygısı içindeyim',
    'Sınıfta doğru cevabı bilsem bile sorulara cevap vermekten çekiniyorum',
    'Okulun sonunda bir meslek sahibi olabileceğimi düşünmüyorum'
  ]},
  { category: 'Dikkat ve Hafıza Sorunları', items: [
    'Çok çabuk dikkatim dağıldığından',
    'Okuduklarımı çabuk unutuyorum',
    'Ders sırasında sık sık hayal kuruyor ve derslerden uzaklaşıyorum'
  ]},
  { category: 'Öğrenme Yöntem ve Motivasyonu', items: [
    'Okuduklarımı anlayamadığımdan',
    'Bize öğretilenlerin gereksiz olduğuna inandığım için',
    'Ders dışı faaliyetleri (Spor, TV, vs.) derse tercih ederim',
    'Derslerime günü gününe çalışmadığım için',
    'Çalışma programına uyamıyorum',
    'Öğrenme isteksizliğimden dolayı',
    'Verimli ders çalışma yöntemlerini bilmediğimden'
  ]},
  { category: 'Sosyal İlişkiler', items: [
    'Beraber olduğum arkadaş grubumdan dolayı',
    'Kardeşlerim ders çalışmamı engelledikleri için'
  ]}
];

failureReasonsCategories.forEach(({ category, items }) => {
  items.forEach((item, index) => {
    const questionId = `basarisizlik-nedenleri-2025-q-${failureReasonsQuestions.length + 1}`;
    failureReasonsQuestions.push({
      id: questionId,
      questionText: item,
      questionType: 'YES_NO',
      required: false,
      options: ['Evet', 'Hayır'],
      category
    });
  });
});

export const DEFAULT_SURVEY_TEMPLATES_FAILURE_REASONS: SurveyTemplateDefault[] = [
  {
    template: {
      id: 'basarisizlik-nedenleri-2025',
      title: 'Başarısızlık Nedenleri Anketi',
      description: 'Öğrencilerin bazı derslerden neden başarısız olduğunu, akademik performans engelleri ve destek ihtiyaçlarını tespit etmek için kullanılan anketi. MEB Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürlüğü formatına uygun.',
      targetAudience: 'STUDENT',
      tags: ['Başarısızlık Analizi', 'Rehberlik', 'MEB', 'Akademik Destek', 'Sorun Tanımlama'],
      createdBy: 'Sistem',
      isActive: true
    },
    questions: failureReasonsQuestions
  }
];
