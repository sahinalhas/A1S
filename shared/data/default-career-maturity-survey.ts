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

const careerMaturityQuestions: SurveyQuestion[] = [];

const careerMaturityCategories = [
  { category: 'Karar Vermede Bağımsızlık', items: [
    'Hangi mesleğin bana uygun olduğunu büyüklerimin daha iyi bilecekleri düşüncesindeyim.',
    'İnsan mesleğini tesadüfen seçer.',
    'İnsan hangi mesleği seçmesi gerektiği konusunda ailesinin tavsiyelerini dikkate alırsa hata yapmaz.',
    'Hangi mesleğe gireceğime ailemin karar vermesi iyi olacak. Böylece sonuçta bir hata olursa ben sorumlu olmam.',
    'Ailemin seçtiği mesleğe girersem onların daha çok yardım ve desteğini sağlayabilirim diye düşünüyorum.'
  ]},
  { category: 'Mesleki Bilgi Arayışı ve Araştırma', items: [
    'Meslekleri daha iyi tanımak için, bu konuda yazılmış kaynak kitaplar olup olmadığını araştırırım.',
    'Öğretmenlerime, öğrettikleri konu alanlarıyla ilgili üniversite programlarının neler olduğu hakkında sorular sorar, onlardan bu konularda beni aydınlatmalarını rica ederim.',
    'Televizyonda bir mesleğin özelliklerini ve ülke ekonomisindeki yerini tanıtan programları ilgi ile izlerim.',
    'Yeteneğime uygun olduğunu düşündüğüm meslekleri inceliyorum.',
    'Meslekleri tanıtan kaynak kitapları okurum.',
    'İlgilendiğim bir meslekteki insanların neler yaptıklarını, hangi koşullarda çalıştıklarını öğrenmek için işyerlerine giderim.',
    'Meslek tercihlerimi belirlemeden önce, sadece ilgi duyduğum meslekleri değil, mümkün olduğu kadar başka bir çok mesleği de incelemeye çalışıyorum.',
    'Yeni bir meslek adı duyduğumda hemen o mesleği incelemek için harekete geçerim.',
    'Benden önce liseyi bitirip yüksek öğretime devam eden arkadaşlarıma bölümleri hakkında sorular sorarım.',
    'Tercih ettiğim meslekleri tanıtıcı toplantılara katılırım.'
  ]},
  { category: 'Öz Farkındalık ve Kendini Tanıma', items: [
    'Girmek istediğim meslekler hakkında bilinmesi gereken her şeyi biliyorum.',
    'Üniversitede program tercihimi belirlemeden önce, hangi alanlarda ne derece güçlü, hangi alanlarda ne derece zayıf olduğumu değerlendireceğim.',
    'Çok erken yaşlardan beri meslek yaşamımdan neler beklediğimi, ne gibi yeteneklere ve kişilik özelliklerine sahip olduğumu düşünürüm.',
    'Yeteneklerimi tanımam gerekiyor, ama bunu nasıl yapacağımı bilmiyorum.',
    'Benimle ilgili yönergeleri açıklamaları dikkatle okurum. (Seçmeli dersler listesi, Sınav kılavuzu gibi)'
  ]},
  { category: 'Öğrenci Hayatında Kariyer Odağı', items: [
    'Gelecekteki mesleğimi ben belirleyeceğime göre, bu konuda gerekli bilgiyi edinmek için benim harekete geçmem gerektiği düşüncesindeyim.',
    'Öğrencilik hayatımda daima hangi derslerin yada ders dışı faaliyetlerin bana ne yönden yararlı olabileceğini, hangi hedefe erişmek için katkısı olabileceğini düşünürüm.',
    'Hiç kimsenin beni benden iyi tanımayacağını ve mesleğimi seçme sorumluluğunun bana ait olduğunu düşünürüm.',
    'Herhangi bir işim için bir iş yerinde örneğin; banka, hastane, fabrika ve benzeri yerlere gitsem orada çalışanların yaptıklarını gözler,"ben bu işleri yapabilir miyim, bunları yapmaktan zevk alabilir miyim?" diye düşünürüm.'
  ]},
  { category: 'Mesleki Seçim Kararlılığı', items: [
    'Kendimi bildim bileli hangi mesleğe girmek istediğimi düşünürüm.',
    'Ne olmak, hangi mesleği seçmek istediğim konusunda zaman zaman hayallere dalarım, ama aslında henüz tercihlerimi belirlemiş değilim.',
    'Şu ana kadar hangi programları tercih edeceğimi belirleyemedim. Çünkü her gün başka bir seçenek bana çekici geliyor.'
  ]},
  { category: 'Belirsizlik ve Kararsızlık', items: [
    'İstediğim mesleği seçemeyeceksem "bu konuyu düşünmenin ne gereği var" diyorum.',
    'Bir meslek seçiminde dikkate alınacak o kadar çok faktör var ki, en iyisi işi oluruna bırakmak diye düşünüyorum.',
    'Şimdiden meslek tercihleri üzerinde düşünmeyi gereksiz buluyorum.',
    'İstediğim mesleğe giremeyeceksem meslek seçimi üzerinde düşünmenin ne yararı var diye düşünüyorum.',
    'Ne zaman meslek seçme konusu açılsa içimi bir sıkıntı kaplar.',
    'Bana uygun hiçbir meslek bulamıyorum.',
    'Bazı insanların hangi mesleği seçmek istedikleri konusunda nasıl da emin ve kararlı olabildiklerine şaşıyorum.'
  ]},
  { category: 'Meslek Tercihinde Değişkenlik', items: [
    'Meslek tercihlerimde sık sık değişiklik yapıyorum.',
    'Üniversite sınavımda hangi alanla ilgili test alacağımı belirledim, ama o alanda hangi programlara girmek istediğime karar veremedim.',
    'Şu anda belirli bir meslek alanı belirlemedim ama kararımdan memnun değilim.',
    'Bir çok mesleğe heves ediyorum ve ilgi duyuyorum ama hepsinin bir kusuru var. Bir türlü birine karar veremiyorum.'
  ]},
  { category: 'Erteleme ve Dış Faktörler', items: [
    'Benim için önemli olan sınava hazırlanmaktır. Meslek tercihimi zamanı gelince belirlerim.',
    'Meslek seçerken pek çok kişiden bilgi ve görüş almaya niyetlendim. Ama sonuçta kargaşaya ve kararsızlığa düşünce bu işi oluruna bıraktım.'
  ]}
];

careerMaturityCategories.forEach(({ category, items }) => {
  items.forEach((item, index) => {
    const questionId = `mesleki-olgunluk-2025-q-${careerMaturityQuestions.length + 1}`;
    careerMaturityQuestions.push({
      id: questionId,
      questionText: item,
      questionType: 'YES_NO',
      required: false,
      options: ['Bana Hiç Uygun Değil', 'Bana Pek Uygun Değil', 'Bana Biraz Uygun', 'Bana Uygun', 'Bana Çok Uygun'],
      category
    });
  });
});

export const DEFAULT_SURVEY_TEMPLATES_CAREER_MATURITY: SurveyTemplateDefault[] = [
  {
    template: {
      id: 'mesleki-olgunluk-2025',
      title: 'Mesleki Olgunluk Ölçeği',
      description: 'Meslek seçimiyle ilgili tutum ve davranışları ölçen, öğrencilerin mesleki olgunluk düzeyini değerlendiren kapsamlı ölçek. Karar vermede bağımsızlık, bilgi arayışı, öz farkındalık ve mesleki seçim kararlılığını ölçen. MEB rehberlik hizmetlerine uygun kariyer danışmanlığı aracı.',
      targetAudience: 'STUDENT',
      tags: ['Mesleki Olgunluk', 'Kariyer Seçimi', 'Karar Verme', 'MEB', 'Rehberlik'],
      createdBy: 'Sistem',
      isActive: true
    },
    questions: careerMaturityQuestions
  }
];
