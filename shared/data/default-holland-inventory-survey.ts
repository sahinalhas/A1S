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

const hollandInventoryQuestions: SurveyQuestion[] = [];

const hollandInventoryCategories = [
  { category: 'Gerçekçi (Realistic) - Teknik ve Mekanik', items: [
    'Fırtınadan sonra zarar görmüş bir ağacı onarmak',
    'Bir daktilonun nasıl tamir edileceğini öğrenmek',
    'Tam doğru zaman tutmak için bir saati ayarlamak',
    'Elektronik alet çalıştırmak',
    'Bir ustayı televizyon tamir ederken seyretmek',
    'Bir slayt veya film projektörünü çalıştırmak',
    'Mobilya yapmak',
    'Değerli taşları kesmeyi ve parlatmayı öğrenmek',
    'Bir resim çerçevesi yapmak',
    'Gözlük için mercekleri parlatmak',
    'Kusurlarını bulmak için üretilen mamulleri incelemek',
    'Maddeleri ayırmak, biriktirmek ve saklamak',
    'Kuşların nasıl göç ettiğini öğrenmek',
    'Hava durumu tahmini için kişisel gözlemleri kullanmak',
    'Bitki hastalıklarını incelemek'
  ]},
  { category: 'Araştırıcı (Investigative) - Bilim ve Araştırma', items: [
    'Bir bilim müzesini incelemek',
    'Mikroskop gibi laboratuar aletlerini kullanmak',
    'Vitaminlerin hayvanlar üzerindeki etkisini araştırmak',
    'Biyoloji çalışmak',
    'Beynin nasıl çalıştığını öğrenmek',
    'Depremin nedenlerini araştırmak',
    'Ünlü bir bilim adamının dersine katılmak',
    'Dünyanın merkezi, güneş ve yıldızlar hakkında kitaplar okumak',
    'Yıldızların oluşumunu öğrenmek',
    'Kelebekleri gözlemlemek ve sınıflandırmak',
    'Bir havuz veya gölde yabani hayatı araştırmak',
    'Orman yangınları için gözetleme yapmak',
    'Yeni yöntemler veya politikalar geliştirmek',
    'Modern yazarların yazı stillerini araştırmak',
    'Diğer insanların bir problemin nasıl çözülebileceğine ilişkin kanılarını öğrenmek'
  ]},
  { category: 'Sanatsal (Artistic) - Yaratıcılık ve Sanat', items: [
    'Resimler tasarlamak ve çizmek',
    'Bir kuş yemliği tasarlamak',
    'Planlar veya grafikler yapmak',
    'Müzik eseri bestelemek veya düzenlemek',
    'Filmler için konu müziği bestelemek',
    'Yaratıcı fotoğraflar çekmek',
    'Bir müzik aleti çalmak',
    'Bir orkestrada caz müziği çalmak',
    'Bir sinema filmi senaryosu yazmak',
    'Bir magazin hikayesini anlatan çizimler yapmak',
    'Metal bir heykel tasarlamak',
    'Kısa hikayeler yazmak',
    'Tiyatro oyunu, müzikaller gibi sanatsal etkinliklerin eleştirilerini yazmak',
    'Bir tiyatro oyununda rol almak',
    'Yerel bir radyo istasyonunda çalınması için müzik parçaları seçmek'
  ]},
  { category: 'Sosyal (Social) - İnsan İlişkileri ve Hizmet', items: [
    'İnsanlara yeni bir hobi öğretmek',
    'Küçük grup tartışmalarına katılmak',
    'Acil durumlarda insanlara yardım etmek',
    'Bir toplum geliştirme projesinde çalışmak',
    'Çocuklara nasıl oyun oynanacağını veya spor yapılacağını göstermek',
    'Ziyaretçilere yol göstermek',
    'Bağımlılık yapıcı madde kullanan insanlara danışmanlık yapmak',
    'İnsanlara yasal doğruları açıklamak',
    'İnsanların mali kararlar vermelerine yardımcı olmak',
    'Arkadaşlar arasındaki bir tartışmayı yatıştırmak',
    'Birine önemli bir karar vermesinde yardım etmek',
    'Yaralı bir insana ilkyardım yapmak',
    'Tehlikedeki bir insana yardım etmeye çalışmak',
    'Fıkralar ve hikayeler anlatarak insanları eğlendirmek',
    'Bir proje üzerinde başkaları ile beraber çalışmak'
  ]},
  { category: 'Girişimci (Enterprising) - Liderlik ve Yönetim', items: [
    'Bir iş yaptırmak için parayla eleman tutmak',
    'Bir oyun için takım oluşturma',
    'Yeni bir satış kampanyası düzenlemek',
    'Bir toplantıyı yönetmek',
    'Küçük bir işletmeyi idare etmek',
    'Diğer insanların işlerini planlamak',
    'Telefonla iş idare etmek',
    'Bir politik kurum için kampanyaya katılmak',
    'İl genel meclisinde çalışmak',
    'Şirket hakkındaki şikayetleri konusunda işçilerle röportaj yapmak',
    'Bir sergiye gezi düzenlemek',
    'İş gezilerine çıkmak',
    'Yeni alışveriş merkezinin tanıtımını yapmak',
    'Fıkralar ve hikayeler anlatarak insanları eğlendirmek',
    'Kısa hikayeler yazmak'
  ]},
  { category: 'Geleneksel (Conventional) - Düzen ve Sistemler', items: [
    'Bankaya yatırılan paranın faizini hesaplamak',
    'Bir dükkanda envanter (kayıt) tutmak',
    'Mali bir hesaptaki hataları bulmak',
    'Bir rapor taslağındaki hataları bulmak için incelemek',
    'Bir kuruluşun parayla ilgili bütün işlerini yönetmek',
    'Masraflara ait hesap kayıtları tutmak',
    'Bir grup veya klüp için bütçe hazırlamak',
    'Mali raporları hazırlamak ve yorumlamak',
    'Taksit ödemelerini tahsil etmek',
    'Gelir vergisi kazancını düzenlemek',
    'Aylık bütçe planı yapmak',
    'Bir muhasebecilik sistemi kurmak',
    'Taşıma için nakil maliyetlerini hesaplamak',
    'Sertifika, plaket veya taktı belgesi hazırlamak',
    'İş gazeteleri veya dergileri okumak'
  ]}
];

hollandInventoryCategories.forEach(({ category, items }) => {
  items.forEach((item, index) => {
    const questionId = `holland-inventory-2025-q-${hollandInventoryQuestions.length + 1}`;
    hollandInventoryQuestions.push({
      id: questionId,
      questionText: item,
      questionType: 'YES_NO',
      required: false,
      options: ['Hoşlanmam', 'Farketmez', 'Hoşlanırım'],
      category
    });
  });
});

export const DEFAULT_SURVEY_TEMPLATES_HOLLAND_INVENTORY: SurveyTemplateDefault[] = [
  {
    template: {
      id: 'holland-inventory-2025',
      title: 'Holland Mesleki Tercih Envanteri',
      description: 'Öğrencilerin mesleki ilgilerini ve kişilik özelliklerini Holland\'s mesleki tercih teorisine göre değerlendiren anketi. Gerçekçi, araştırıcı, sanatsal, sosyal, girişimci ve geleneksel kariyer tiplerini belirlemeyi amaçlayan. MEB Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürlüğü formatına uygun.',
      targetAudience: 'STUDENT',
      tags: ['Holland Teorisi', 'Kariyer Seçimi', 'Mesleki Tercih', 'Rehberlik', 'MEB'],
      createdBy: 'Sistem',
      isActive: true
    },
    questions: hollandInventoryQuestions
  }
];
