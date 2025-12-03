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

const multipleIntelligencesQuestions: SurveyQuestion[] = [];

const multipleIntelligencesCategories = [
  { category: 'Dilsel Zeka (Linguistic Intelligence)', items: [
    'Resimlerden çok yazılar dikkatimi çeker.',
    'İsimler, yerler, tarihler konusunda belleğim iyidir.',
    'Kitap okumayı severim.',
    'Düşüncelerimi kelimeleri doğru bir şekilde telaffuz ederek kolaylıkla ifade edebilirim.',
    'Bilmecelerden, kelime oyunlarından hoşlanırım.',
    'Duyduğum ya da okuduklarımı kolaylıkla hatırlar ve dinleyerek daha iyi öğrenirim.',
    'Yaşıma göre kelime hazinem iyidir.',
    'Yazı yazmaktan hoşlanırım ve yazı yazarken sözcükleri yerli yerinde kullanırım.',
    'Öğrendiğim yeni kelimeleri kullanmayı severim.',
    'Sözel tartışmalarda karşımdaki kişileri konuşmamla etkilerim.'
  ]},
  { category: 'Mantıksal-Matematiksel Zeka (Logical-Mathematical Intelligence)', items: [
    'Matematik ve fen derslerinden hoşlanırım.',
    'Matematik oyunlarından hoşlanırım ve aritmetik problemleri kafadan hesaplarım.',
    'Bir sorunun çözümü için farklı alternatifler üretebilirim.',
    'Satranç ve benzeri strateji oyunlarını severim.',
    'Mantık bulmacalarını, beyin jimnastiğini severim.',
    'Matematiğe dayalı bilgisayar oyunlarını severim.',
    'Deneylerden, yeni denemeler yapmaktan hoşlanırım.',
    'Arkadaşlarıma oranla daha soyut düşünebilirim.',
    'Bir aracın, bir makinenin çalışma sistemini kolaylıkla kavrarım.',
    'Sebep - sonuç ilişkilerini kurmaktan zevk alırım.'
  ]},
  { category: 'Mekansal Zeka (Spatial Intelligence)', items: [
    'Renklere karşı çok duyarlıyımdır.',
    'Çizelge, tablo ya da harita türü materyalleri daha kolay algılarım.',
    'Arkadaşlarıma oranla daha fazla hayal kurarım.',
    'Resim yapmayı ve boyamayı çok severim.',
    'Yap-boz, lego gibi oyunlardan hoşlanırım.',
    'Daha önce gittiğim yerleri kolayca hatırlarım.',
    'Bulmaca çözmekten hoşlanırım.',
    'Rüyalarımı çok net ve ayrıntılarıyla hatırlarım.',
    'Resimli kitapları daha çok severim.',
    'Çalışırken karalamalar yapar, kitaplarıma, defterlerime çizgiler çizer, notlar alırım.'
  ]},
  { category: 'Müzik Zekası (Musical Intelligence)', items: [
    'Şarkıların melodilerini rahatlıkla hatırlarım.',
    'Güzel şarkı söyler, kendimce basit besteler oluştururum.',
    'Müzik aleti çalar ya da çalmayı çok isterim.',
    'Müzik dersini çok severim.',
    'Ritmik konuşur ya da hareket ederim.',
    'Farkında olmadan mırıldanırım.',
    'Çalışırken veya bir konu üzerinde düşünürken elimle ya da ayağımla ritim tutarım.',
    'Çevredeki sesler çok dikkatimi çeker ve bu sesleri kolaylıkla taklit edebilirim.',
    'Çalışırken veya yorgun olduğumda müzik dinlemek çok hoşuma gider.',
    'Müzikle uğraşmayı ve öğrendiğim şarkıları paylaşmayı severim.'
  ]},
  { category: 'Doğacı Zeka (Naturalistic Intelligence)', items: [
    'Hayvanlara karşı çok meraklıyımdır.',
    'Doğa konusunda çevremdekileri bilinçlendirmeye çalışırım.',
    'Evde hayvan besler ya da beslemeyi çok severim.',
    'Bahçede toprakla, bitkilerle oynamayı çok severim.',
    'Farklı bitkileri incelemeyi ve yetiştirmeyi severim.',
    'Çevre kirliliğine karşı duyarlı davranırım.',
    'Doğayla, bitkilerle ya da hayvanlarla ilgili belgesellere ilgi duyarım.',
    'Mevsimlerle ve iklim olaylarıyla çok ilgilenirim.',
    'Değişik meyve ve sebzelere karşı ilgiliyimdir.',
    'Doğa olaylarıyla ilgilenir ve doğal yaşamı korumak için elimden geleni yaparım.'
  ]},
  { category: 'Kişilerarası Zeka (Interpersonal Intelligence)', items: [
    'Arkadaşlarımla oyun oynamaktan, grupla yapılan farklı organizasyonlarda yer almaktan hoşlanırım.',
    'Çevremde bir lider olarak görülürüm.',
    'Problemi olan arkadaşlarıma öğütler veririm.',
    'Arkadaşlarım fikirlerime değer verir.',
    'Organizasyonların vazgeçilmez elamanıyımdır.',
    'Yeni insanlarla tanışmak için girişimlerde bulunmaktan, onlara bir şeyler anlatmaktan çok hoşlanırım.',
    'Arkadaşlarımla yakın ilişkiler kurar ve onları sık sık ararım.',
    'Arkadaşlarımın sorunlarına yardımcı olmaktan hoşlanırım.',
    'Çevremdekiler benimle arkadaşlık kurmak ister.',
    'İnsanlara selam verir, hatırlarını sorarım.'
  ]},
  { category: 'Bedensel-Kinestetik Zeka (Bodily-Kinesthetic Intelligence)', items: [
    'Spor yaptığımda zihinsel olarak rahatladığımı hissederim.',
    'Oturduğum yerde duramam, kımıldanırım.',
    'Düşüncelerimi mimik-davranışlarla rahat ifade ederim.',
    'Bir şeyi okumak, oturup düşünmek yerine, hareket ederek, yaparak öğrenmeyi severim.',
    'Merak ettiğim şeyleri elime alarak incelemek isterim.',
    'Boş vakitlerimi dışarıda geçirmek isterim.',
    'Arkadaşlarımla fiziksel oyunlar oynamayı severim.',
    'El becerilerim gelişmiştir.',
    'Sorunlarımı ya da bir sözcüğü anlatırken vücut hareketlerini ve beden dilini rahatlıkla kullanabilirim.',
    'Dokunduğumu, etkileşimde bulunduğumu ve incelediğimi daha kolay öğrenirim.'
  ]},
  { category: 'Kişisel Zeka (Intrapersonal Intelligence)', items: [
    'Bağımsızca düşünmeyi ve bağımsız davranmayı severim.',
    'Güçlü ve zayıf yanlarımı bilirim.',
    'Tek başıma zaman geçirmekten keyif alır, bu nedenle de yalnız çalışmayı daha çok severim.',
    'Çoğunlukla yalnız olmayı severim.',
    'Yaptığım işleri arkadaşlarımla paylaşmayı severim.',
    'Yaptığım işlerin bilincindeyimdir.',
    'Pek kimseye akıl danışmam, fikirlerimi ve olayları kendim analiz ederim.',
    'Kendime saygım yüksektir.',
    'Yoğun olarak uğraştığım bir ilgi alanım ve hobim vardır.',
    'Yardım istemeden kendi başıma problemleri çözmeyi, ürünler ortaya koymayı severim.'
  ]}
];

multipleIntelligencesCategories.forEach(({ category, items }) => {
  items.forEach((item, index) => {
    const questionId = `coklu-zeka-2025-q-${multipleIntelligencesQuestions.length + 1}`;
    multipleIntelligencesQuestions.push({
      id: questionId,
      questionText: item,
      questionType: 'YES_NO',
      required: false,
      options: ['Hiç Uygun Değil', 'Çok Az Uygun', 'Kısmen Uygun', 'Oldukça Uygun', 'Tamamen Uygun'],
      category
    });
  });
});

export const DEFAULT_SURVEY_TEMPLATES_MULTIPLE_INTELLIGENCES: SurveyTemplateDefault[] = [
  {
    template: {
      id: 'coklu-zeka-2025',
      title: 'Çoklu Zeka Envanteri',
      description: 'Howard Gardner\'ın Çoklu Zeka Kuramına dayanan, öğrencilerin ilgi ve yetenek alanlarını tespit etmek amacıyla hazırlanan kapsamlı envanter. Dilsel, matematiksel, mekansal, müzik, doğacı, kişilerarası, bedensel-kinestetik ve kişisel zeka olmak üzere 8 zeka türünü ölçen. MEB rehberlik hizmetlerine uygun yetenek belirleme aracı.',
      targetAudience: 'STUDENT',
      tags: ['Çoklu Zeka', 'Gardner', 'Zeka Türleri', 'MEB', 'Potansiyel Keşfetme'],
      createdBy: 'Sistem',
      isActive: true
    },
    questions: multipleIntelligencesQuestions
  }
];
