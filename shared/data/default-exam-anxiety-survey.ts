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

const examAnxietyQuestions: SurveyQuestion[] = [];

const examAnxietyCategories = [
  { category: 'Sınav Hazırlığı ve Çalışma Alışkanlıkları', items: [
    'Sınava girmeden de sınıf geçmenin ve başarılı olmanın bir yolu olmasını isterdim',
    'Eğer sınavlar olmasaydı dersleri daha iyi öğreneceğimden eminim',
    'Hiçbir zaman sınavlara tam olarak hazırlandığım duygusunu yaşayamam',
    'Önemli bir sınava hazırlanırken çok kere olumsuz düşüncelerle peşin bir yenilgiyi yaşarım',
    'Bir sınava ne kadar çok çalışırsam, o kadar çok karıştırıyorum',
    'Önemli problemlerimden biri, bir sınava tam olarak hazırlanıp hazırlanmadığımı bilememektir'
  ]},
  { category: 'Güven ve Öz Değerlendirme', items: [
    'Bir sınavda başarılı olmak, diğer sınavlarda kendime güvenimin artmasına sebep olmaz',
    'Çevremdekiler (ailem, arkadaşlarım) başaracağım konusunda bana güveniyorlar',
    'Kendimi bir toplayabilsem, bir çok kişiden daha iyi notlar alacağımı biliyorum',
    'Bir sınavdan önce ne kendime tam olarak güvenebilirim, ne de zihinsel olarak gevşeyebilirim',
    'Eğer düşük not alırsam, annem ve babam hayal kırıklığına uğrar'
  ]},
  { category: 'Sınav Sırasında Dikkat Dağılması', items: [
    'Bir sınav sırasında, bazen zihnimin sınavla ilgili olmayan konulara kaydığını hissederim',
    'Sınav sırasında çevremdeki insanların gezinmesi ve bana bakmalarından sıkıntı duyarım',
    'Bir sınav sırasında dışarıdan gelen gürültüler, çevremdeki sesler, ışık, oda sıcaklığı, vb. beni rahatsız eder',
    'Bir sınav sırasında duygularım dikkatimin dağılmasına neden olur',
    'Sınav sırasında bazen gerçekten bildiklerimi unutacak kadar heyecanlanıyorum'
  ]},
  { category: 'Sosyal ve Aile Baskısı', items: [
    'Önemli bir sınavdan önce veya sınav sırasında bazı arkadaşlarımın çalışırken daha az zorlandıklarını ve benden daha akıllı olduklarını düşünürüm',
    'Her zaman düşünmesem de, başarısız olursam çevremdekilerin hakkımdaki düşünceleri beni rahatsız eder',
    'Başarısız olursam, insanlar benim yeteneğimden şüpheye düşecekler',
    'Başarısız olursam, kendimle ilgili görüşlerim değişir',
    'Başarısız olursam arkadaşlarımın gözünde değerimin düşeceğini biliyorum',
    'Düşük not aldığımda hiç kimseye notumu söylemem',
    'Kendi notumu söylemeden önce arkadaşlarımın kaç aldığını bilmek isterim',
    'Düşük not aldığım zaman, tanıdığım bazı insanların benimle alay edeceğini biliyorum ve bu beni rahatsız ediyor'
  ]},
  { category: 'Fiziksel Anksiyete Belirtileri', items: [
    'Önemli bir sınavdan önce / sonra canım bir şey yemek istemez',
    'Önemli bir sınava girecek olmam uykularımı bozar',
    'Bir türlü gevşeyemem',
    'Önemli sınavlardan önce midem bulanır',
    'Sınav sırasında, bacağımı salladığımı, parmaklarımı sıraya vurduğumu fark ediyorum',
    'Bir sınav sırasında bedenimin belirli yerlerindeki kaslar kasılır',
    'Gerçekten önemli bir sınava girerken çoğunlukla bedensel olarak panik halinde olurum'
  ]},
  { category: 'Duygusal Tepkiler', items: [
    'Sınavlarla ilgili endişelerim çoğunlukla tam olarak hazırlanmamı engeller ve bu durum beni daha çok endişelendirir',
    'Ne kadar başarılı olacağım konusundaki endişeler, sınava hazırlığımı ve sınav başarımı etkiler',
    'Sınavdan önce daima huzursuz, gergin ve sıkıntılı olurum',
    'Sınav sonuçlarını almadan önce kendimi çok endişeli ve huzursuz hissederim',
    'Bir sınavdan önce çoğunlukla içimden bağırmak gelir',
    'Önemli sinavlardan önce zihnım adeta durur kalır'
  ]},
  { category: 'Sınavlarla İlgili İnançlar', items: [
    'Öğretmenin sık sık küçük yazılı veya sözlü yoklamalar yaptığı derslerden nefret ederim',
    'Sınavların mutlaka resmi, ciddi ve gerginlik yaratan durumlar olması gerekmez',
    'Sınavlarda başarılı olanlar çoğunlukla hayatta da iyi pozisyonlara gelirler',
    'Geleceğimin sınavlarda göstereceğim başarıya bağlı olduğunu bilmek beni üzüyor',
    'Sınavların insanın gelecekteki amaçlarına ulaşması konusunda ölçü olmasına hayret ederim',
    'Sınavlar insanın gerçekten ne kadar bildiğini göstermez',
    'Başlarken bir sınav veya teste ihtiyaç duyulmayan bir işe girebilmeyi çok isterim',
    'Sınıf geçmek için sınava girmektense, ödev hazırlamayı tercih ederdim',
    'Eğer sınavlara yalnız başıma girsem ve zamanla sınırlanmamış olsam çok daha başarılı olacağımı düşünüyorum',
    'Sınavdaki sonuçların hayat başarım ve geleceğimle doğrudan ilişkili olduğunu düşünürüm'
  ]},
  { category: 'Sınav Sonrası Değerlendirme', items: [
    'Bir sınavdan sonra çoğunlukla yapmış olduğumdan daha iyi yapabileceğimi düşünürüm',
    'Bir sınavdan başarılı olamazsam, zaman zaman zannettiğim kadar akıllı olamadığımı düşünürüm'
  ]},
  { category: 'Sınav İşleminin Değerlendirilmesi', items: [
    'Testi değerlendirenlerin, bazı öğrencilerin sınavda çok heyecanlandıklarını bilmelerini ve bunu testi değerlendirirken hesaba katmalarını isterdim'
  ]}
];

examAnxietyCategories.forEach(({ category, items }) => {
  items.forEach((item, index) => {
    const questionId = `sinav-kaygisi-2025-q-${examAnxietyQuestions.length + 1}`;
    examAnxietyQuestions.push({
      id: questionId,
      questionText: item,
      questionType: 'YES_NO',
      required: false,
      options: ['Her zaman/Genellikle', 'Bazen', 'Hiçbir zaman'],
      category
    });
  });
});

export const DEFAULT_SURVEY_TEMPLATES_EXAM_ANXIETY: SurveyTemplateDefault[] = [
  {
    template: {
      id: 'sinav-kaygisi-2025',
      title: 'Sınav Kaygısı Ölçeği',
      description: 'Öğrencilerin sınav kaygısı düzeyini, stres tepkilerini ve sınav performansını etkileyen faktörleri değerlendirmek için kullanılan kapsamlı ölçek. MEB Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürlüğü formatına uygun.',
      targetAudience: 'STUDENT',
      tags: ['Kaygı Değerlendirmesi', 'Rehberlik', 'MEB', 'Sınav Hazırlığı', 'Psikolojik Destek'],
      createdBy: 'Sistem',
      isActive: true
    },
    questions: examAnxietyQuestions
  }
];
