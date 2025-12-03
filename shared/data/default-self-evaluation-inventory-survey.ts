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

const selfEvaluationQuestions: SurveyQuestion[] = [];

const selfEvaluationCategories = [
  { category: 'Matematiksel ve Nicel Yetenekler', items: [
    'Bir açının kaç derece olduğunu doğru bir biçimde tahmin edebiliyor musunuz?',
    'Sıfır, eşitlik, sonsuz gibi matematik kavramları kolay öğrenebildiniz mi?',
    'Bir problemin çözüm yolunu öğrendikten sonra benzer problemleri çözebiliyor musunuz?',
    'Sizin düzeyinizde bir matematik kitabından bir problemin çözüm yolunu kolaylıkla bulabiliyor musunuz?',
    'Bir problemin çözümünü veren denklemi hemen kurabilir misiniz?',
    'Öğrendiğiniz matematik kural ve ilkeleri fizik ve kimya dersinde karşılaştığınız problemlere uygulayabiliyor musunuz?',
    'Matematik dersinde öğrendiğiniz ilkeleri ilk karşılaştığınız bir probleme uygulayıp çözümünü bulabiliyor musunuz?',
    'Matematik bulmacaları çözer misiniz?',
    'Bir problemin, size öğretilen çözüm yolundan farklı çözüm yollarını bulabiliyor musunuz?',
    'Fizik, kimya ya da matematik alanında bir sorunla ilgili inceleme ya da proje yapar mısınız?',
    'Fizik ve kimya problemleri çözmekten zevk alır mısınız?'
  ]},
  { category: 'Dilsel ve Sözel Yetenekler', items: [
    'Bir yazıyı hızlı ve doğru okuyabiliyor musunuz?',
    'Kelimeleri düzgün bir biçimde söyleyebiliyor musunuz?',
    'Bir parçayı bir kere okuduktan sonra hemen özetleyebiliyor musunuz?',
    'Kelime bilginiz, sözcük dağarcığınız zengin midir?',
    'Okuduğunuz bir parçada belirtilen fikirler arasında ilişki kurabiliyor musunuz?',
    'Logaritma, sinüs gibi sembollerle yazılmış yazıları kolaylıkla okuyabiliyor musunuz?',
    'Bir konuda edindiğiniz bilgileri, kendi sözcüklerinizle başkalarına aktarabiliyor musunuz?',
    'Bir konuyu söz ve yazı ile anlatırken fikirleri doğru bir sıra ile verebiliyor musunuz?',
    'Bir yazıdaki fikir ve ifade hatalarını kolaylıkla görebiliyor musunuz?',
    'Akıcı bir üslûpla güzel yazı yazabiliyor musunuz?',
    'Bir yazının ana ve yardımcı fikirlerini kolaylıkla bulabiliyor musunuz?',
    'Daktilo edilmiş bir yazının hatalarını düzeltmekten hoşlanır mısınız?'
  ]},
  { category: 'Mekansal ve Görsel Yetenekler', items: [
    'Birbirine çok benzeyen karmaşık iki şekil arasındaki küçük farkı görebiliyor musunuz?',
    'Karmaşık bir geometrik şeklin sağa, sola, yukarıya ve aşağıya kaydırılması ile alacağı durumu göz önünde canlandırabilir misiniz?',
    'Açınımı verilmiş bir geometrik cismin kapalı halini göz ününde canlandırabilir misiniz?',
    'Sık rastlanmayan türden bir geometrik şeklin açınımını çizebilir misiniz?',
    'Karmaşık bir geometrik şeklin küçük bir parçasını bütünden soyutlayarak algılayabiliyor musunuz?',
    'Bir evin planına baktığınızda, evin yapılmış halini göz önünde canlandırabiliyor musunuz?',
    'Yabancısı olduğunuz kapalı bir mekanda yönünüzü kolaylıkla bulabilir misiniz?',
    'Gelişigüzel parçalara ayrılmış bir şekli yeniden ve çabucak oluşturabiliyor musunuz?',
    'Bir makinenin şemasına bakarak makineyi kurabilir misiniz?',
    'Bir evi veya salonu süslemekten hoşlanır mısınız?'
  ]},
  { category: 'Bilimsel İlgi ve Keşif Arzusu', items: [
    'Gelecekte kendinizi bir laboratuvarda araştırmacı olarak düşlediğiniz olur mu?',
    'Evcil hayvanların hangi koşul ve ortamlarda daha iyi geliştiklerini inceler misiniz?',
    'Deniz dibindeki hayatı gösteren bir filmi ilgi ve dikkatle dinler misiniz?',
    'Bir çiftliğin yöneticisi olmayı düşünür müsünüz?',
    'Çeşitli hayvan ve bitkilerin yaşayışını inceler misiniz?',
    'Bir kamp veya pikniğe gittiğinizde, çevredeki hayvan ve bitkileri inceler misiniz?',
    'Yeni çiçek türleri yetiştirmeyi dener misiniz?',
    'Bir makinenin (Örneğin, elektrik motoru) evrimini gösteren bir sergiyi gezmek ister misiniz?'
  ]},
  { category: 'Sanatsal ve Yaratıcı Yetenekler', items: [
    'El sanatları ya da resim kursuna gitmek ister misiniz?',
    'Ünlü sanatçıların, ressamların hayatını inceler misiniz?',
    'Ufak tefek besteler yapar mısınız?',
    'Şiir yazmayı hiç denediniz mi?',
    'Tahta ve metalden ev eşyaları yapar mısınız?',
    'Bir müzik alet çalar mısınız?',
    'Başkalarına dinletecek düzeyde bir müzik aleti çalabiliyor musunuz?',
    'Resim ya da elişleri yarışmalarına katılır mısınız?',
    'Müzik yarışmalarına katılır mısınız?',
    'Mimarlık ya da genel olarak sanat tarihi ile ilgili bir kitabı zevk duyarak okur musunuz?',
    'Konserleri, müzik programlarını izler misiniz?',
    'Çeşitli ülkelerin halk şarkılarını tanıtan bir programı izler misiniz?',
    'Sanat sohbetlerine katılır mısınız?'
  ]},
  { category: 'Sosyal ve İletişim Becerileri', items: [
    'Başkalarına, kişisel sorunlarının çözümünde yardımcı olabiliyor musunuz?',
    'İnanç ve düşüncelerinizi başkalarına kolaylıkla aktarabilir misiniz?',
    'Söz ve davranışlarınızın başkaları üzerindeki etkisini öğrenmeye çalışır mısınız?',
    'Tartışmalarda güçlü kanıtlar bularak görüşünüzü karşınızdakilere kabul ettirebilir misiniz?',
    'Konuşurken çevrenizdeki insanların ilgisini çekebilir ve görüşlerinizi onlara kabul ettirebilir misiniz?',
    'Okulda münazaralara katılır mısınız?',
    'Sizin gibi düşünmeyen insanları ikna etmek için uzun tartışmalara girer misiniz?'
  ]},
  { category: 'Mekanik ve Teknik Yetenekler', items: [
    'Mekanik bulmacalar çözer misiniz?',
    'Elektrikli oyuncakların nasıl işlediğini inceler misiniz?',
    'Her türlü araç ve gereç sağlansa bir radyo yapmayı dener misiniz?',
    'Evde bozulan aletleri onarır mısınız?',
    'Model uçak yapmaya çalışır mısınız?'
  ]},
  { category: 'İşletme ve Girişimcilik Yetkillikleri', items: [
    'Pazarlama ve satış yöntemlerini öğreten bir kursa devam etmek ister misiniz?',
    'Evleri dolaşıp, bir ürünün tanıtımını yapmaktan hoşlanır mısınız?',
    'Yaz aylarında bir dükkan ya da ticarethanede kendi isteğinizle çalıştınız mı?',
    'Çocukluğunuzda arkadaşlarınıza sakız, çikolata, bilye gibi şeyler sattınız mı?',
    'Okul kantini ya da kooperatifini yönetmek ister misiniz?'
  ]},
  { category: 'Yazı ve Edebiyat İlgisi', items: [
    'Ünlü yazarların hayatını inceler misiniz?',
    'Edebiyat ödüllerini izler, ödül alan eserleri okur musunuz?',
    'Hikaye, deneme, anı yazmayı denediniz mi?',
    'Gazeteler için ilginç haberler derlemek ister misiniz?',
    'Okul gazetesine yazı yazar mısınız?',
    'Çeşitli yazarların üslup özelliklerini inceler misiniz?',
    'Gazetelerde edebiyat ve tiyatro eleştirilerini okur musunuz?',
    'İnsan hakları konulu bir kompozisyon yazmak ister misiniz?'
  ]},
  { category: 'Sosyal ve Toplum Hizmetleri', items: [
    'Çeşitli kültürlerde çocuk yetiştirme yöntemleri konulu bir konferansı dinlemek ister misiniz?',
    'Yaşlılar yurdunda eğlence günleri düzenlemek ister misiniz?',
    'Felakete uğrayan insanlar için yardım kampanyalarına katılır mısınız?',
    'Bir hastanede gönüllü olarak çalışmak ister misiniz?',
    'Yetersizliği olan bireylere beceri kazandırma kursunda gönüllü olarak çalışmak ister misiniz?',
    'Boş vakitlerinizde yoksul çocuklara parasız ders verir misiniz?'
  ]},
  { category: 'Organize Etme ve Sistem Yönetimi', items: [
    'Daktilo edilmiş bir yazının hatalarını düzeltmekten hoşlanır mısınız?',
    'Bir işin ince ayrıntıları ile uğraşır mısınız?',
    'Yaptığınız herhangi bir işin temiz ve düzenli olması için özen gösterir misiniz?',
    'Ödevlerinizi zamanında, düzgün ve temiz bir biçimde yapar mısınız?',
    'Mektupları zamanında cevaplandırır mısınız?',
    'Her işinizi günü gününe yapar mısınız?',
    'İşçilerin verimini artırıcı yöntemler konulu bir makaleyi okur musunuz?'
  ]},
  { category: 'Araştırma ve Sosyal Bilimler', items: [
    'Gittiğiniz bir kentte insanların adetlerini inceler misiniz?',
    'Ailenin tarih boyunca değişimi konulu bir makaleyi okumaktan hoşlanır mısınız?',
    'Tropikal çiçeklerin evlerde nasıl yetiştirileceği konulu bir konferansı dinlemeye gider misiniz?',
    'Türkiye\'nin nüfus özelliklerini inceleyen bir araştırma ekibinde çalışmak ister misiniz?',
    'Pazarlama ve satış yöntemlerini öğreten bir kursa devam etmek ister misiniz?',
    'Televizyondaki reklamları eleştirir, daha iyi nasıl yapılabileceğini düşünür müsünüz?'
  ]},
  { category: 'Satranç ve Strateji Oyunları', items: [
    'Satranç oynar mısınız?',
    'Belleğiniz kuvvetli midir?'
  ]}
];

selfEvaluationCategories.forEach(({ category, items }) => {
  items.forEach((item, index) => {
    const questionId = `kendini-degerlendirme-2025-q-${selfEvaluationQuestions.length + 1}`;
    selfEvaluationQuestions.push({
      id: questionId,
      questionText: item,
      questionType: 'YES_NO',
      required: false,
      options: ['Hiçbir Zaman', 'Ara Sıra', 'Sık Sık', 'Her Zaman'],
      category
    });
  });
});

export const DEFAULT_SURVEY_TEMPLATES_SELF_EVALUATION_INVENTORY: SurveyTemplateDefault[] = [
  {
    template: {
      id: 'kendini-degerlendirme-2025',
      title: 'Kendini Değerlendirme Envanteri',
      description: 'Yetenek, ilgi ve değerlerinizi tanımanız için hazırlanmış kapsamlı envanter. Matematiksel yetenekler, dilsel beceriler, mekansal algı, sanatsal yetenekler, sosyal beceriler ve mesleki ilgiler dahil olmak üzere 100 soru ile çok boyutlu benlik değerlendirmesi sağlayan. MEB rehberlik hizmetlerine uygun yetenek ve ilgi değerlendirme aracı.',
      targetAudience: 'STUDENT',
      tags: ['Kendini Değerlendirme', 'Yetenek İlgi Değer', 'Mesleki Rehberlik', 'MEB', 'İlgi Envanteri'],
      createdBy: 'Sistem',
      isActive: true
    },
    questions: selfEvaluationQuestions
  }
];
