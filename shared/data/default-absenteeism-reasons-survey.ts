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

const absenteeismReasonsQuestions: SurveyQuestion[] = [];

const absenteeismReasonsCategories = [
  { category: 'Okul Yönetimi ve Yapı', items: [
    'İhtiyaç duyduğumda okul idaresi izin vermediği için',
    'Geç kaldığımda okul yöneticileriyle karşılaşmak istemediğim için',
    'Boş derslerde ve öğle aralarında okulda verimli zaman geçireceğim bir alan/mekan olmadığı için',
    'Giriş ve çıkış saatleri bana uygun olmadığı için',
    'Kılık kıyafetim uygun olmadığında (saç, sakal, takı, makyaj vb.) okul yönetiminden çekindiğim için',
    'Okul binası (rampa, asansör vb) fiziksel durumuma uygun olmadığı için',
    'Okulda günlük ders saati çok fazla olduğu için',
    'Okulun ilk ya da son haftalarında ders yapılmadığı için'
  ]},
  { category: 'Okul Ortamı ve İmkanları', items: [
    'Okulda yeteneklerimi gösterebileceğim fırsatlar olmadığı için',
    'Öğretmenler aşırı disiplinli davrandığı için',
    'Bazı dersler çok sıkıcı geçtiği için'
  ]},
  { category: 'Öğretmen Davranışları', items: [
    'Öğretmenler, benden derslerde yapabileceklerimden daha fazlasını yapmamı bekledikleri için',
    'Öğretmenler, okulda öğrencilere karşı sürekli küçük düşürücü davranışlarında bulundukları için',
    'Öğretmenler, öğrenciler arasında ayrımcılık yaptığı için',
    'Öğretmenlerim bana yakınlık göstermediği için',
    'Diğer öğrenciler dersin işlenmesine engel olduğu için'
  ]},
  { category: 'Aile Faktörleri', items: [
    'Ailem, okula gidip gitmememi umursamadığı için',
    'Ders araç gerecim olmadığında',
    'Bazı günler harçlığım olmadığı için',
    'Bazı günler kıyafetlerim bakımsız (kirli, ütüsüz) olduğunda',
    'Aileme yardımcı olmam gereken günlerde',
    'Okul dışında bir işte çalışmak zorunda olduğum için',
    'Aile içinde sorunlarımız olduğu zamanlarda',
    'Evde misafir olduğu zaman',
    'Bir yakınım vefat ettiğinde'
  ]},
  { category: 'Ulaşım ve Çevre', items: [
    'Evim okula çok uzak olduğu için',
    'Havanın soğuk ya da yağışlı olduğu günlerde',
    'Okul yolu güvenli olmadığı için'
  ]},
  { category: 'Ek Eğitim ve Dış Faaliyetler', items: [
    'Özel kurs ve etütlere daha fazla zaman ayırdığım için',
    'Okul dışındaki etkinliklere katılmak için'
  ]},
  { category: 'Akademik Faktörler', items: [
    'Ertesi günün sınavlarına çalışmak için',
    'Ödevlerimi yapmadığım günlerde',
    'Başarısız olduğum derslere katılmak istemediğim için',
    'Bir üst öğretim kurumunun sınavlarına hazırlanmamda okul dersleri yetersiz kaldığı için',
    'Okulu bitirince iş bulabileceğime inanmadığım için',
    'Okulumu sevmediğim için'
  ]},
  { category: 'Sağlık ve Kişisel Faktörler', items: [
    'Hasta olduğum zaman',
    'Sabahları zamanında uyanamadığımda',
    'Yorucu geçen bir günden sonraki günü dinlenerek geçirmek istediğim için',
    'Dersin telafisi mümkün olduğunda',
    'Resmi tatillerden önceki ya da sonraki günlerde',
    'Bazı günler moralim bozuk olduğu için'
  ]},
  { category: 'Okulu Kaçma Alışkanlığı', items: [
    'Okuldan kaçmak eğlenceli geldiği için',
    'Okula gitmesem de sınıfı geçeceğimi bildiğim için',
    'Arkadaşlarıma göre yaşça daha büyük olduğum için'
  ]},
  { category: 'Sosyal Faktörler', items: [
    'Okul saatinde, okul dışından arkadaşlarımla görüşmek için',
    'Arkadaşlarımla okuldan kaçma kararı aldığımızda',
    'Okulda arkadaşlarım tarafından dışlandığım için',
    'Okuldaki öğrenciler fiziksel veya duygusal olarak bana zarar verdiği için',
    'Okulda arkadaşlarımla anlaşamadığım için'
  ]}
];

absenteeismReasonsCategories.forEach(({ category, items }) => {
  items.forEach((item, index) => {
    const questionId = `devamsizlik-nedenleri-2025-q-${absenteeismReasonsQuestions.length + 1}`;
    absenteeismReasonsQuestions.push({
      id: questionId,
      questionText: item,
      questionType: 'YES_NO',
      required: false,
      options: ['Hayır', 'Bazen', 'Evet'],
      category
    });
  });
});

export const DEFAULT_SURVEY_TEMPLATES_ABSENTEEISM_REASONS: SurveyTemplateDefault[] = [
  {
    template: {
      id: 'devamsizlik-nedenleri-2025',
      title: 'Devamsızlık Nedenleri Anketi',
      description: 'Öğrencilerin okula devamsızlık nedenlerini belirlemeyi amaçlayan ve çok boyutlu analiz sağlayan anketi. Okul yönetimi, öğretmen davranışları, aile faktörleri, sosyal ilişkiler ve kişisel faktörleri değerlendiren. MEB Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürlüğü formatına uygun.',
      targetAudience: 'STUDENT',
      tags: ['Devamsızlık', 'Rehberlik', 'MEB', 'Okul Uyumu', 'Sorun Tanımlama'],
      createdBy: 'Sistem',
      isActive: true
    },
    questions: absenteeismReasonsQuestions
  }
];
