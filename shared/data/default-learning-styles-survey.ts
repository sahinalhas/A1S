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

const learningStylesQuestions: SurveyQuestion[] = [];

const learningStylesCategories = [
  { category: 'Görsel Öğrenme (Visual)', items: [
    'Temiz ve düzenli bir sıraya sahip olmak isterim',
    'Sözel yönergeleri kullanamam, haritaya gereksinim duyarım',
    'Resimli bulmaca çözmeyi severim',
    'Gördüklerimi iyi hatırlarım',
    'Olaylar veya konular şematize edilirse daha iyi anlarım',
    'Resimli roman okumayı severim',
    'Okunmakta olan bir metnin kopyasını takip etmezsem anlamakta zorlanırım',
    'Derslerde not tutmayı tercih ederim',
    'Boş zamanlarımda okumayı severim',
    'Başkalarının ne yaptığını gözlerim',
    'Telefonda konuşmayı sevmem, yüz yüze konuşmayı tercih ederim',
    'Okurken parmağımla takip ederim',
    'Okurken kağıda çok yaklaşırım',
    'Yazılı karükatürleri tercih ederim',
    'Görsel ve sözcük hatırlama hafızam iyi değildir',
    'Kopyalanacak bir şey olmadan kolay çizemem',
    'Haritalardan çok sözel tarifleri ve yönergeleri tercih ederim',
    'Boş bir kağıda sütunlar çizmem istendiğinde kağıdı katlarım',
    'Defterimin içini genellikle resimlerle, şekillerle süslerim, karalama yaparım',
    'Genellikle grafikler, sembol ve simgeler benim öğrenmemi kolaylaştırmaz'
  ]},
  { category: 'İşitsel Öğrenme (Auditory)', items: [
    'Biri bana ders verir gibi bir şeyler anlatırsa başka dünyalara dalarım',
    'Duyduğum ama görmediğim yönergelere dikkat etmekte zorlanırım',
    'Sessiz okumayı severim',
    'Sözcükleri hatasız yazarım',
    'Şarkı sözlerini hatırlamakta zorlanırım',
    'Sözel tariflerin tekrarlanmasını isterim',
    'Kendi kendime düşünüp, çalışarak öğrenmeyi severim',
    'Radyo ve televizyonu yüksek sesle dinlerim',
    'Kendi kendime konuşurum',
    'Bütün yanlışlarımı öğretmenin anlatarak düzeltmesini isterim',
    'Sınıfta arkadaşlarımla tartışarak ve sohbet ederek öğrenmeyi severim',
    'Gözlerimi ellerime dayarım',
    'Daha iyi öğrenmek için müzik ve ritmi severim',
    'Sınıfta çok fazla konuşurum',
    'Boş zamanlarımda arkadaşlarımla konuşmayı ve şaka yapmayı severim',
    'Yüksek sesle okumayı severim',
    'Hikaye, şiir ve/ya kitap kasetleri dinlemeyi severim',
    'Anlatmayı yazmaya tercih ederim',
    'Kendi kendime çalışmaktansa öğretmeni dinleyerek öğrenmeyi tercih ederim',
    'Bir konu bana okunursa kendi okuduğumdan daha iyi anlarım',
    'Sessizliğe dayanamam. Ya ben ya da diğerlerinin konuşmasını isterim',
    'Genellikle ellerimi kullanarak ve hızlı konuşurum',
    'Başkalarının sözünü sık sık keserim'
  ]},
  { category: 'Kinestetik Öğrenme (Kinesthetic)', items: [
    'Ellerimi kullanabileceğim bir şeyler yapmaktan hoşlanırım',
    'Sandalyede otururken sallanırım ya da bacağımı sallarım',
    'Kalemimi elimde döndürürüm, masada tempo tutarım',
    'Öğretmenlerim asla çalışmadığımı düşünürler',
    'Öğretmenlerim sınıfta çok fazla hareket ettiğimi düşünürler',
    'Genellikle hiperaktif olduğum söylenir',
    'Çalışırken sık sık ara verir, başka şeyler yaparım',
    'Arkadaşlarıma el şakası yapmaya bayılırım',
    'Kapının üst çerçevesine asılarak odaya atlamak isterim',
    'Aktif olarak katıldığım etkinlikleri severim',
    'Bir şeyi görmek ya da duymak yetmez, dokunmak isterim',
    'Her şeye dokunmak isterim',
    'Objeleri biriktirmeyi severim',
    'Sınıfta tahta silmeyi, pencere yada kapı açıp kapatmayı hep ben yapmak isterim',
    'Kürdanları, kibritleri küçük küçük parçalara ayırırım',
    'Aletleri açar, içini söker, sonra yine bir araya getirmeye çalışırım'
  ]}
];

learningStylesCategories.forEach(({ category, items }) => {
  items.forEach((item, index) => {
    const questionId = `ogrenme-stilleri-2025-q-${learningStylesQuestions.length + 1}`;
    learningStylesQuestions.push({
      id: questionId,
      questionText: item,
      questionType: 'YES_NO',
      required: false,
      options: ['Evet', 'Hayır'],
      category
    });
  });
});

export const DEFAULT_SURVEY_TEMPLATES_LEARNING_STYLES: SurveyTemplateDefault[] = [
  {
    template: {
      id: 'ogrenme-stilleri-2025',
      title: 'Öğrenme Stilleri Envanteri',
      description: 'Öğrencilerin görsel, işitsel ve kinestetik öğrenme stillerini belirlemek için kullanılan envanteri. Her öğrencinin en etkili öğrenme yöntemiyle eğitim alabilmesi için rehberlik amaçlı anketi. MEB Özel Eğitim ve Rehberlik Hizmetleri Genel Müdürlüğü formatına uygun.',
      targetAudience: 'STUDENT',
      tags: ['Öğrenme Stilleri', 'Rehberlik', 'MEB', 'Uyum', 'Eğitim Tasarımı'],
      createdBy: 'Sistem',
      isActive: true
    },
    questions: learningStylesQuestions
  }
];
