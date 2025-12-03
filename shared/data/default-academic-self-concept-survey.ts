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

const academicSelfConceptQuestions: SurveyQuestion[] = [];

const academicSelfConceptCategories = [
  { category: 'Türkçe Dili ve Yazı Becerisi', items: [
    'Bir yazı yazarken, bir ödev yaparken yazım (imla) kurallarına dikkat eder misiniz?',
    'Bir hikâye kitabını hızlı ve doğru okuyabilir misiniz?',
    'Kelimeleri doğru bir biçimde yazabiliyor ve söyleyebiliyor musunuz?',
    'Bir parçayı bir kere okuduktan sonra hemen özetleyebiliyor musunuz?',
    'Yeni duyduğunuz kelimelerin anlamını öğrenmeye çalışır mısınız?',
    'Okuduğunuz bir parçada belirtilen fikirler arasında ilişki kurabiliyor musunuz?',
    'Bir konuda edindiğiniz bilgileri, kendi sözcüklerinizle başkalarına aktarabiliyor musunuz?',
    'Bir konuyu söz ve yazı ile anlatırken, fikirleri doğru bir sıra ile verebiliyor musunuz?',
    'Bir yazıdaki fikir ve ifade hatalarını kolaylıkla görebilir misiniz?',
    'Akıcı bir üslupla güzel yazı (örneğin bir mektup) yazabilir misiniz?',
    'Okuduğunuz bir parçada anlatılan fikirleri bulup özetleyebiliyor musunuz?',
    'Sizin düzeyinizde, ama daha önce hiç görmediğiniz bir matematik kitabını rahatlıkla okuyabiliyor musunuz?'
  ]},
  { category: 'Matematik Becerisi', items: [
    'Çarpım tablosunu, bölme işlemini kolay öğrenebildiniz mi?',
    'Dört işlemle akıldan, hızlı problem çözebilir misiniz?',
    'Bir matematik probleminin çözüm yolunu öğrendikten sonra, ona benzer problemleri çözebiliyor musunuz?',
    'Sizin düzeyinizde bir matematik kitabını okuyarak bir problemin çözüm yolunu bulabiliyor musunuz?',
    'Boş zamanlarınızda, zevk için matematik problemleri çözmeye çalışır mısınız?',
    'Matematik dersinde, özel bir yardım (ders) almadan başarılı olabiliyor musunuz?',
    'Öğrendiğiniz matematik kurallarını fen bilisi derslerindeki problemlere uygulayabiliyor musunuz?',
    'Bir problemin, size öğretilen çözüm yollarından farklı çözüm yollarını bulabilir misiniz?'
  ]},
  { category: 'Görsel ve Mekansal Beceriler', items: [
    'Birbirine çok benzeyen iki resmin arasındaki küçük farklılıkları hemen görebilir misiniz?',
    'Bir dairenin merkezini doğru bir biçimde tahmin ederek işaretleyebilir misin?',
    'İki çizgi arasında çok az bir uzunluk farkı olduğunda, bunu kolaylıkla algılayabilir misiniz?',
    'Bir doğru parçasının kaç cm olduğunu doğru tahmin edebilir misiniz?',
    'İlk defa gittiğiniz bir binada yönünüzü kolaylıkla bulabilir misiniz?',
    'Bir defa başkaları ile birlikte gittiğiniz bir yeri, ikinci defa yalnız başına gittiğinizde, kolaylıkla bulabilir misiniz?',
    'Gelişigüzel parçaları ayrılmış bir şeklin veya cismin parçalarını eski yerlerine kolaylıkla yerleştirebilir misiniz?',
    'Bir makinenin şemasına bakarak makineyi kurabilir misiniz?',
    'Açılmış hali verilen geometrik bir cismin, kapandığı zaman açılacağı şekli göz önünde canlandırabilir misiniz?',
    'Boş bir kesme şeker kutusu kısa kenarından kesilip açılınca hangi yüzeyin nereye geleceğini göz önünde canlandırabilir misiniz?',
    'Bir kâğıda cetvel kullanmadan düzgün paralel çizgiler çizebiliyor musunuz?',
    'Karmaşık bir geometrik şeklin, sağa ve sola döndürülmesi ile alacağı durumu göz önünde canlandırabilir misiniz?',
    'Bir evin planına baktığınızda, evin yapılmış halini göz önünde canlandırabilir misiniz?',
    'Alet kullanmadan, düzgün geometrik şekiller çizebilir misiniz?',
    'Bir kâğıda çizilen yıldız biçimindeki bir şekli makasla, düzgün bir biçimde kesip çıkarabilir misiniz?',
    'Küçük bir deliğe, ince bir çubuğu, deliğin kenarına değdirmeden sokabilir misiniz?',
    'Küçük bir şeklin (örneğin bir çiçek resminin) içini, dışarı taşırmadan sulu boya ile boyayabilir misiniz?'
  ]},
  { category: 'İnce Motor Becerisi ve El Koordinasyonu', items: [
    'Attığınız bir bilyeyi veya bir taşı istediğiniz hedefe gönderebilir misiniz?',
    'Bir pastayı veya böreği, eşit olarak ve düzgün biçimde kesebilir misiniz?',
    'Bir bilyeyi, başka bir bilye ile vurarak, istediğiniz hedefe gönderebilir misiniz?',
    'Bir aletin (örneğin saatin) çok küçük bir parçasını (örneğin vidasını) yerine kolayca yerleştirebilir misiniz?',
    'Bir aleti parçalara ayırıp tekrar birleştirebilir misiniz?',
    'Tahtadan veya metalden oyuncaklar yapabilir misiniz?',
    'Kapı zili, kilit gibi ev aletlerini onarmaya çalışır mısınız?'
  ]},
  { category: 'Fen Bilimleri İlgisi ve Becerisi', items: [
    'Fen dersleri ile ilgili konuları kolay öğrenebiliyor musunuz?',
    'Fen derslerinde öğrendiğiniz ilke ve kuralları evinizdeki sorunların çözümünde kullanır mısınız?',
    'Fen dersleri ile ilgili konularda öğretilenlerden daha fazla bilgi edinmek için başka kaynaklara başvurduğunuz oluyor mu?',
    'Evcil hayvanların veya bitkilerin gelişmelerini incelemekten hoşlanır mısınız?',
    'Fen bilgisi ile ilgili problemleri çözmekten hoşlanır mısınız?',
    'Deniz dibindeki hayatı gösteren bir filmi ilgi ve dikkatle izler misiniz?',
    'Gelecekte kendinizi, bir laboratuvarda araştırmacı olarak düşlediğiniz olur mu?',
    'Bir kente gittiğinizde, müzeleri, tarihi yerleri gezer misiniz? (gezmek ister misiniz?)',
    'Bilimsel proje sergilerini gezer misiniz? (gezmek ister misiniz?)',
    'Televizyonda bilimsel buluşları anlatan belgesel programları izler misiniz?',
    'Ünlü bilim adamlarının hayatını anlatan televizyon dizilerini izler misiniz?',
    'Uzay araçlarının, roketlerin evrimini gösteren bir sergiyi izlemek ister misiniz?',
    'Havuzlarda balık üretme yöntemlerini gösteren bir filmi ilgi ile izler misiniz?',
    'Evcil hayvanların hangi koşullarda ve ortamlarda daha iyi geliştiklerini incelemekten hoşlanır mısınız?',
    'Yeni bir alet veya makine ile karşılaştığınızda, hemen onun nasıl çalıştığını öğrenmeye çalışır mısınız?',
    'Elektrikli aletlerin nasıl işlediklerini inceler misiniz?',
    'Evcil hayvan besler, bakımını yapar mısınız?',
    'Saksıda ve bahçede çiçek yetiştirip bakımını üstlenir misiniz?'
  ]},
  { category: 'Tarih ve Coğrafya İlgisi', items: [
    'Tarih ve coğrafya derslerinde okutulan konuları kolay öğrenebiliyor musunuz?',
    'Çeşitli atasözlerinin ve özdeyişlerin nereden çıktığını araştırmak ister misiniz?',
    'Tarih romanlarını okumaktan hoşlanır mısınız?',
    'Büyük coğrafya keşiflerini anlatan bir televizyon programı izlemekten hoşlanır mısınız?',
    'Orta Asya\'daki eski uygarlık eserlerini gösteren bir belgesel filmi izlemekten hoşlanır mısınız?',
    'Ünlü toplum liderlerinin hayatını anlatan eserleri okumak veya fimleri izlemek ister misiniz?'
  ]},
  { category: 'Sosyal Bilgiler ve Toplum İlgisi', items: [
    'İnsanların ne düşündüklerini ve ne hissettiklerini incelemekten hoşlanır mısınız?',
    'Çevrenizdeki insanların davranışlarının nedenlerini merak edip araştırır mısınız?',
    '"İnsan hakları" konulu bir ödev hazırlayıp sınıfta sunmak ister misiniz?',
    'İnsanların gazetelerde hangi haberleri merakla okuduklarını araştırmak ister misiniz?',
    '"Çocuklarda yaratıcılık" başlıklı bir makaleyi okumak ister misiniz?',
    '"Hayvanat bahçesine getirilen hayvanların yeni çevreye uyum sorunları" konulu bir belgesel filmi ilgi ile izler misiniz?',
    'İnsanların daha çok hangi malları almak istediklerini öğrenmeye çalışır mısınız?',
    'Arkadaşlarınız arasındaki çatışmaların çözümünde arabuluculuk yapar mısınız?'
  ]},
  { category: 'Tarım ve Üretim İlgisi', items: [
    'Bir çiftliğin yöneticisi olmayı düşünür müsünüz?',
    'Kaliteli meyve yetiştiren bir üretici olmayı düşünür müsünüz?',
    'Evinizde ipekböceği yetiştirip bakımını üslenebilir misiniz?',
    'Yeni çiçek türleri yetiştirmeyi denemek ister misiniz?',
    'Her türlü araç ve gereç sağlansa, bir kafes yapmayı dener misiniz?'
  ]},
  { category: 'Yabancı Dil Becerisi', items: [
    'Yeni öğrendiğiniz yabancı dildeki sözcükleri bir cümlede kullanmaya çalışır mısınız?',
    'Yabancı dildeki kelimeleri kolayca ezberleyebiliyor musunuz?',
    'Bir yabancı turistle, bildiğiniz yabancı dille konuşmaya çalışır mısınız?',
    'Gelecekte yabancı dilinizi ilerletip o dilde yazılmış dergi ve kitapları okumayı düşünür müsünüz?',
    'Yeni öğrendiğiniz yabancı dildeki sözcükleri doğru biçimde söylemeye gayret eder misiniz?'
  ]},
  { category: 'Mantık ve Strateji Becerileri', items: [
    'Satranç öğrenmek için çaba sarf ediyor musunuz?',
    'İnanç ve düşüncelerinizi başkalarına kolaylıkla anlatabilir misiniz?',
    'Tartışmalarda güçlü kanıtlar bularak, görüşünüzü karşınızdakilere kabul ettirebilir misiniz?',
    'Belleğiniz kuvvetli midir?',
    'Model uçak yapmaya çalışır mısınız?'
  ]}
];

academicSelfConceptCategories.forEach(({ category, items }) => {
  items.forEach((item, index) => {
    const questionId = `akademik-benlik-2025-q-${academicSelfConceptQuestions.length + 1}`;
    academicSelfConceptQuestions.push({
      id: questionId,
      questionText: item,
      questionType: 'YES_NO',
      required: false,
      options: ['Hiçbir Zaman', 'Ara Sıra', 'Sık Sık', 'Her Zaman'],
      category
    });
  });
});

export const DEFAULT_SURVEY_TEMPLATES_ACADEMIC_SELF_CONCEPT: SurveyTemplateDefault[] = [
  {
    template: {
      id: 'akademik-benlik-2025',
      title: 'Akademik Benlik Kavramı Ölçeği',
      description: 'Öğrencilerin akademik yetenek ve ilgilerini değerlendirmek amacıyla hazırlanan ölçek. Türkçe dili, matematik, mekansal beceriler, fen bilimleri, tarih-coğrafya, sosyal bilgiler ve yabancı dil gibi farklı akademik alanlardaki benlik algısını kapsamlı şekilde ölçen. MEB Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürlüğü formatına uygun.',
      targetAudience: 'STUDENT',
      tags: ['Akademik Benlik', 'Yetenek Değerlendirmesi', 'Rehberlik', 'MEB', 'Akademik İlgi'],
      createdBy: 'Sistem',
      isActive: true
    },
    questions: academicSelfConceptQuestions
  }
];
