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

const careerInterestQuestions: SurveyQuestion[] = [];

const careerInterestCategories = [
  { category: 'Üretim ve Tarım', items: [
    'Bir tarlanın yanından geçerken özellikle ürününe dikkat etmek',
    'Çiftlik hayvanlarına ilgi duymak',
    'Sebze ve meyve yetiştirmek',
    'Modern çiftçilik yöntemleri hakkında yazılar okumak',
    'Ormanda tatil yapmak',
    'Başka ülkelerin iklim yapılarıyla ilgilenmek',
    'Değişik çiçek cinslerine ilgi duymak',
    'Yağmurun ne zaman yağacağını önceden tahmin etmek',
    'Türkiye\'nin yer altı zenginliklerini araştırmak',
    'Madenlerin ve petrolün nasıl oluştuğunu merak etmek',
    'Deniz sahilinden geçecek bir geziye katılmak',
    'Yüksek dağlara ve tepelere tırmanmak',
    'Kır gezilerinde şifalı bitkileri toplamak',
    'Nükleer santrallerin yapılmasına karşı çıkmak',
    'Denizin dibini ve suları araştırmak',
    'Hasta ve yaralı hayvanlara yardımcı olmak'
  ]},
  { category: 'Teknik ve Mekanik', items: [
    'Bozulan elektronik aletleri tamir etmek',
    'Evdeki eski mobilyaları onarmak',
    'Bilgisayarda özel programlar geliştirmek',
    'Sayısal bilgi gerektiren bilmeceler çözmek',
    'Bir binanın mimari özelliğini incelemek',
    'Ev, apartman ve benzeri yapıların projelerini çizmek',
    'Radyo veya TV\'den günlük haberleri takip etmek',
    'Radyo, TV devrelerinin nasıl çalıştığını araştırmak',
    'Mobilya fuarını gezmek',
    'Araba modelleriyle ilgilenmek',
    'Teknolojik yeniliklerle ilgilenmek',
    'Kullandığı cihazların fonksiyonlarını geliştirmek ve çoğaltmak',
    'Farklı bir yakıtla çalışabilecek otomobil geliştirmek',
    'Keşif ve icatlarla ilgilenmek',
    'Bilim-teknik dergilerini okumak',
    'El becerisi gerektiren işleri titizlikle yapmak'
  ]},
  { category: 'Sosyal Hizmetler ve İnsan İlişkileri', items: [
    'Akıl danışılabilecek bir kişi olmak',
    'İnsan davranışlarının nedenini araştırmak',
    'İnsanlardaki psikolojik sorunların sebeplerini incelemek',
    'Okul tercihi yaparken arkadaşlarına yol göstermek',
    'Dernek, vakıf gibi hayır kurumlarında çalışmak',
    'Bir başkasına yapılan haksızlığa karşı koymak',
    'İnsanları suça iten nedenler üzerine yazı yazmak',
    'Cezaevinde bir arkadaşını ziyaret etmek',
    'Hastanede yatan yakınlarını sık sık ziyaret etmek',
    'İnsanları etkilemenin yollarını öğrenmek',
    'Münazaralara katılmak',
    'Çeşitli toplulukların sosyal yapılarını incelemek',
    'Bir kurumun personel müdürü olmak',
    'Bir kurumu temsilen görüşmelerde bulunmak',
    'İnsanlara yardım etmeyi sevmek',
    'İnsan ilişkilerinde nazik olmak'
  ]},
  { category: 'Sanat ve Tasarım', items: [
    'Müzeleri gezmek',
    'El sanatları sergilerini gezmek',
    'Antika eşyalara ilgi duymak',
    'Türk Sanat Müziği ve Klasik müzikten hoşlanmak',
    'Saz, gitar, org, piyano, flüt vb. müzik aletlerinden birini kullanabilmek',
    'Güzel resim yapmak',
    'Sanat galerilerini gezmek',
    'El becerisi kermeslerini gezmek',
    'Halı ve kilim mağazalarının vitrinlerine bakmak',
    'Evdeki eşyaların yerleştirilmesinde fikir beyan etmek',
    'Mobilya fuarını gezmek',
    'Kumaşlara desen ve renk vermek',
    'Çamurdan figürler yapmak',
    'Sulu boyayla tabiat resimleri yapmak',
    'Modayı izlemek',
    'Sinemaya ve tiyatroya gitmek'
  ]},
  { category: 'Edebiyat ve Dil', items: [
    'Kitap okumak',
    'Gazetelerde köşe yazılarını okumak',
    'Yabancı dilden kitap tercüme etmek',
    'Ünlü şairlerin en az birinin tüm eserlerini okumak',
    'Yeni duyduğum yabancı bir kelime için sözlüğe bakmak',
    'Dil öğrenmenin pratik yollarını araştırmak',
    'Gazete bayiinin önünden geçerken gazete manşetlerine bakmak',
    'Farklı dillerdeki ortak kelimeleri bulmaya çalışmak',
    'Türkçe dersinde dilbilgisinde başarılı olmak',
    'Düşüncelerini söz ve yazı ile aktarabilmek',
    'Yabancı dildeki eşya isimlerini hafızada tutabilmek',
    'Genel kültür ansiklopedilerini karıştırmak',
    'Gazete ve dergilerdeki dış politika yazılarını okumak',
    'Mizah dergilerini okumak',
    'Büyük bir yazar veya şair olmayı düşünmek',
    'Çocuklara masal anlatmak'
  ]},
  { category: 'Araştırma ve Bilim', items: [
    'Modern yaşamın problemlerini araştırmak',
    'Uluslararası konferanslara katılmak',
    'İnsan vücudunun işleyişini incelemek',
    'Matematiksel hesaplara ilgi duymak',
    'Pul veya benzeri koleksiyonlar yapmak',
    'TV\'de açık oturum yönetmek',
    'Liderlerin hayat hikayelerini okumak',
    'Turistlerle konuşmaya çalışmak',
    'Enflasyonun nedenlerini araştırmak',
    'Yabani hayvan resimlerini biriktirmek',
    'Halkın gelenek ve inançlarının nedenlerini incelemek',
    'Olayların neden ve sonuçlarını merak etmek',
    'Zarar eden bir şirketi kara geçirmek',
    'Bilim-kurgu filmlerini izlemek',
    'Uzun süre masa başında çalışmaya sabretmek',
    'Bir derste veya oturumda muhatabına konunun incelikleri hakkında soru sormak'
  ]},
  { category: 'Tıp ve Sağlık', items: [
    'Hasta insanlara yardım etmek',
    'Alınan ilaçların prospektüsünü okumak',
    'Laboratuarda deney yapmak',
    'İnsan ve hayvan hücrelerini incelemek',
    'Bir hastanın ameliyatını izlemek',
    'Sağlık kuruluşlarında çalışmak',
    'Sağlık alanındaki buluşları izlemek',
    'Ölmek üzere olan bir hastaya yardım etmek',
    'Kanserin tedavisini merak etmek',
    'Şifalı suların ve kaplıcaların faydalarını araştırmak',
    'Bilim müzesini gezmek',
    'Farklı ırkların, neden farklı renklerde tenleri olduğunu araştırmak',
    'Bilimsel formüllerin nasıl geliştirildiğini merak etmek',
    'Göz hastalıkları ve tedavisiyle ilgilenmek',
    'İnsanların beslenme alışkanlıklarını araştırmak',
    'Sporla ilgili yaralanmaların tedavisini merak etmek'
  ]},
  { category: 'İşletme ve Ekonomi', items: [
    '"Milyarder Olma Sanatı" adlı kitabı okumak',
    'Parayı dövize çevirmek',
    'Borsayla ilgilenmek',
    'Bir işletmenin muhasebesini tutmak',
    'Döviz kurlarını takip etmek',
    'Reklamları izlemek',
    'Güçlü bir hafızaya sahip olmak',
    'Söz söyleme ve ikna kabiliyetine sahip olmak',
    'Satın alacağı bir malın toptan fiyatını öğrenmek',
    'Bir firmanın kar-zarar hesaplarıyla ilgilenmek',
    'Alışveriş yaparken pazarlık etmek',
    'Fiyatının yüksekliğine rağmen lüks bir lokantada yemek yemek',
    'Ekonomi dergilerini izlemek',
    'Serbest piyasa ekonomisini savunmak',
    'İçişleri ve dış ticaretle ilgilenmek',
    'Kurumsal yönetim konularıyla ilgilenmek'
  ]},
  { category: 'Siyaset ve Yönetim', items: [
    'Seyrettiği polisiye filmlerin sonucunu tahmin etmek',
    'TV\'lerde siyasi tartışma programlarını izlemek',
    'Liderlerin hayat hikayelerini okumak',
    'Oyunlarda kaptan olmak',
    'Olumsuz biteceği tahmin edilen bir işte bile sonuna kadar sabretmek',
    'Miting ve kitle gösterilerine katılmak',
    'Yeni anayasayı veren gazeteyi almak',
    'Meclis TV\'yi izlemek',
    'Yakın tarihe ait belgeleri çözmek',
    'Toplum önünde etkili ve güzel konuşmak',
    'Dini konularda bilgili olmak',
    'Farklı ırkların ve dillerin nasıl oluştuğunu araştırmak',
    'Tarihi olay ve kişileri incelemek',
    'Güne programlı başlamak',
    'Bir işe başlamadan önce o işin genel planını ve programını yapmak',
    'Randevularına zamanında gitmek'
  ]},
  { category: 'Uluslararası ve Kültür', items: [
    'Bir para birimi ile ilgilenmek',
    'Yabancı ülkeleri merak etmek',
    'Taklit yapmak',
    'TV\'lerdeki kültür-sanat programlarını izlemek',
    'TV\'lerdeki açık oturum programlarını izlemek',
    'Gazetelerdeki "sorunlarınıza çözümler" türündeki yazıları okumak',
    'Fotoğraf makinesi taşımak',
    'Gezilerde fotoğraf makinesi taşımak',
    'Bir hayır kurumu için para toplamak',
    'Turistlere rehberlik etmek',
    'Eşya ve olayların ayrıntılarına dikkat etmek',
    'Kitaplarını kullanmadan önce ciltlemek',
    'Oturduğu evin dekoruna ve düzenine önem vermek',
    'Duygularını düşüncelerini abartılı bir şekilde aktarmak',
    'Giyimine özen göstermek',
    'Sanat tarihimizde özel bir yeri olan camileri gezmek'
  ]},
  { category: 'Astronomi ve Doğa', items: [
    'Pul veya benzeri koleksiyonlar yapmak',
    'Yabani hayvan resimlerini biriktirmek',
    'Astronomisi ile ilgili kitaplar okumak',
    'Bilim-kurgu filmlerini izlemek',
    'Denizin dibini ve suları araştırmak',
    'Yüksek dağlara ve tepelere tırmanmak',
    'Deniz sahilinden geçecek bir geziye katılmak',
    'Yağmurun ne zaman yağacağını önceden tahmin etmek',
    'Başka ülkelerin iklim yapılarıyla ilgilenmek',
    'Değişik çiçek cinslerine ilgi duymak',
    'Kır gezilerinde şifalı bitkileri toplamak',
    'Ormanda tatil yapmak',
    'Çiftlik hayvanlarına ilgi duymak',
    'Sebze ve meyve yetiştirmek',
    'Madenlerin ve petrolün nasıl oluştuğunu merak etmek',
    'İnsan ve evrenin niçin yaratıldığını düşünmek'
  ]},
  { category: 'El Sanatları ve Üretim', items: [
    'Güzel resim yapmak',
    'Evdeki eski mobilyaları onarmak',
    'El sanatları sergilerini gezmek',
    'Halı ve kilim mağazalarının vitrinlerine bakmak',
    'Çocuklara pratik oyuncaklar yapmak',
    'Kumaşlara desen ve renk vermek',
    'Çamurdan figürler yapmak',
    'Sulu boyayla tabiat resimleri yapmak',
    'Dokuma tezgahında çalışmak',
    'El becerisi kermeslerini gezmek',
    'El becerisi gerektiren işleri titizlikle yapmak',
    'Evdeki eşyaların yerleştirilmesinde fikir beyan etmek',
    'Saz, gitar, org, piyano, flüt vb. müzik aletlerinden birini kullanabilmek',
    'Taklit yapmak',
    'Modayı izlemek',
    'Çocuklara masal anlatmak'
  ]}
];

careerInterestCategories.forEach(({ category, items }) => {
  items.forEach((item, index) => {
    const questionId = `mesleki-egilim-2025-q-${careerInterestQuestions.length + 1}`;
    careerInterestQuestions.push({
      id: questionId,
      questionText: item,
      questionType: 'YES_NO',
      required: false,
      options: ['Evet', 'Hayır'],
      category
    });
  });
});

export const DEFAULT_SURVEY_TEMPLATES_CAREER_INTEREST: SurveyTemplateDefault[] = [
  {
    template: {
      id: 'mesleki-egilim-2025',
      title: 'Mesleki Eğilim Belirleme Testi',
      description: 'Öğrencilerin çeşitli meslek ve sosyal-kültürel etkinliklere karşı ilgilerini ölçmek amacıyla hazırlanan ilgi envanteri. Öğrencilerin iş, meslek ve kariyer yolu seçiminde rehberlik amaçlı kapsamlı bir anketi. MEB Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürlüğü formatına uygun.',
      targetAudience: 'STUDENT',
      tags: ['Kariyer Planlaması', 'Mesleki İlgi', 'Rehberlik', 'MEB', 'Kariyer Seçimi'],
      createdBy: 'Sistem',
      isActive: true
    },
    questions: careerInterestQuestions
  }
];
