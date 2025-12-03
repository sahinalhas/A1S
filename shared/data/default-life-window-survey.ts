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

const lifeWindowQuestions: SurveyQuestion[] = [];

const lifeWindowCategories = [
  { category: 'Sağlık Sorunları', items: [
    'Sürekli devam eden bir hastalığım var'
  ]},
  { category: 'Aile ve Eğitim', items: [
    'Ailem benim bir üst öğrenime devam etmemi istemiyor',
    'Ailemin benden beklentisi çok yüksek',
    'Aile ortamımızda sık sık tartışma olur',
    'Ailemden ayrı yaşıyorum',
    'Ailemi bana ve ihtiyaçlarıma (maddi, manevi) karşı ilgisiz buluyorum',
    'Ailemiz içerisinde belli kurallar yoktur',
    'Ailemde zararlı alışkanlıkları olan birey/bireyler var'
  ]},
  { category: 'Travma ve Kriz Yaşantıları', items: [
    'Deprem/yangın/sel/savaş/trafik kazası vb. durumlarından en az birini yaşadım',
    'Sevdiğim bir yakınımı kaybettiğim için çok üzgünüm',
    'Ailemden biri/birileri şehit/gazi oldu'
  ]},
  { category: 'İnanç ve Değerler', items: [
    'Değerlerimi/inançlarımı yaşayabileceğim ortam sağlanmıyor'
  ]},
  { category: 'Duygusal Zorluklar', items: [
    'Daha önce yaşamadığım bazı korkularım var',
    'Öfkemi kontrol edemiyorum',
    'Çoğu zaman kimseyle konuşmak/görüşmek istemiyorum',
    'Hayatı yaşamaya değer bulmuyorum',
    'Kendime hiç güvenim yok',
    'Yaşamım üzerinde hiç kontrolüm yok',
    'Fazla heyecanlanıyorum'
  ]},
  { category: 'Sosyal İlişkiler ve Akran Grupları', items: [
    'Arkadaşlarımdan bazıları bağımlılık yapıcı madde kullanıyor',
    'Arkadaşlık kurmakta zorlanıyorum',
    'Fiziksel güce ihtiyacım olduğunda beni destekleyecek bir grubun üyesiyim',
    'Farklı tercihlerimden dolayı çevrim tarafından dışlanıyorum'
  ]},
  { category: 'Teknoloji Kullanımı', items: [
    'Teknoloji ile (cep telefonu, tablet, internet vs.) çok vakit geçiriyorum',
    'Ailem teknoloji ile (cep telefonu, tablet, internet vs.) çok vakit geçiriyor'
  ]},
  { category: 'Maddi Sıkıntılar', items: [
    'Temel ihtiyaçlarımızı karşılayacak maddi olanaklardan yoksunum',
    'Ailemin geçimini sağlamak için bir işte çalışıyorum'
  ]},
  { category: 'Şiddet ve Taciz', items: [
    'Çevremdeki insanlar tarafından istemediğim söz ve hareketlere maruz kalıyorum',
    'Hoşlanmadığım davranışlara zorlanıyorum'
  ]},
  { category: 'Öz Imaj ve Kabul', items: [
    'Fiziksel görünüşümden rahatsızım',
    'Kendimi belirli bir alanda çok yetenekli buluyorum',
    'Kendimi herhangi bir alanda yetenekli bulmuyorum'
  ]},
  { category: 'Akademik Durumlar', items: [
    'İstesem de derslerimde başarılı olamıyorum',
    'Annem/babam okuma yazma bilmiyor',
    'Başkaları ile kıyaslanıyorum',
    'Dersler ilgi çekici hale getirilmiyor',
    'Okulu bitirdikten sonra ne yapmak istediğimi bilmiyorum',
    'Okulu sevmiyorum'
  ]},
  { category: 'Okul Ortamı ve İlişkiler', items: [
    'Okulda problemlerimizle fazla ilgilenilmiyor',
    'Okulda kendimi güvende hissetmiyorum',
    'Okuldaki disiplin anlayışından rahatsızım',
    'Okulda yeteri kadar sosyal etkinlik düzenlenmiyor',
    'Okulda alınan kararlarda öğrencilerin görüşü alınmıyor',
    'Öğrenci sorunları öğrencilerle çözülmek yerine önce ailelere aktarılıyor',
    'Öğrenciler arasında ayrım yapılıyor',
    'Okula uyum sağlayamadım',
    'Okul yeterince temiz değil'
  ]},
  { category: 'Okul Dışı Fırsatlar', items: [
    'Okul dışında kaliteli vakit geçireceğim aktiviteler yapacak fırsatım yok'
  ]}
];

lifeWindowCategories.forEach(({ category, items }) => {
  items.forEach((item, index) => {
    const questionId = `yasam-pencerem-2025-q-${lifeWindowQuestions.length + 1}`;
    lifeWindowQuestions.push({
      id: questionId,
      questionText: item,
      questionType: 'YES_NO',
      required: false,
      options: ['Evet', 'Hayır'],
      category
    });
  });
});

export const DEFAULT_SURVEY_TEMPLATES_LIFE_WINDOW: SurveyTemplateDefault[] = [
  {
    template: {
      id: 'yasam-pencerem-2025',
      title: 'Yaşam Pencerem',
      description: 'Öğrencilerin kişisel, ailesel, sosyal ve eğitimsel yaşamlarına ilişkin zorlukları ve destekleme alanlarını belirlemek için kullanılan kapsamlı rehberlik anketi. MEB Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürlüğü formatına uygun.',
      targetAudience: 'STUDENT',
      tags: ['Rehberlik', 'MEB', 'Yaşam Zorlukları', 'Öğrenci Takip', 'Destekleme'],
      createdBy: 'Sistem',
      isActive: true
    },
    questions: lifeWindowQuestions
  }
];
