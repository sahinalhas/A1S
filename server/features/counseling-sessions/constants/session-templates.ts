export const QUICK_NOTES_TEMPLATES = {
  positive: [
    'Öğrenci görüşmeye istekli katıldı ve işbirlikçi bir tutum sergiledi.',
    'Öğrenci durumunu açık bir şekilde ifade etti, çözüm odaklı yaklaşım gösterdi.',
    'İlerleme kaydedildi, öğrenci hedefleri konusunda kararlı görünüyor.',
    'Öğrenci öz farkındalık düzeyi yüksek, değişime açık.',
  ],
  neutral: [
    'Öğrenci görüşmeye katıldı, ancak sınırlı ifade kullandı.',
    'Durum hakkında bilgi alındı, takip edilmesi gerekiyor.',
    'Öğrenci görüşmeye katıldı, durumu hakkında genel bilgi paylaşıldı.',
  ],
  concern: [
    'Öğrenci görüşmeye isteksiz katıldı, dirençli tutum gözlemlendi.',
    'Durum dikkatli takip gerektirir, aile desteği önemli.',
    'Öğrenci açılmakta zorlandı, güven ilişkisi kurulması gerekiyor.',
    'Risk faktörleri gözlemlendi, yakın takip planlandı.',
  ],
  crisis: [
    'Acil müdahale gerekli, ilgili birimler bilgilendirildi.',
    'Kriz durumu tespit edildi, aile ve yönetim bilgilendirildi.',
    'Öğrenci güvenliği için önlemler alındı, uzman desteği gerekli.',
  ],
};

export const OUTCOME_TEMPLATES = {
  understanding: [
    'Öğrencinin durumu anlaşıldı ve destek sağlandı.',
    'Sorun kaynağı belirlendi, çözüm alternatifleri tartışıldı.',
    'Öğrenci kendini ifade etti, duyguları normalleştirildi.',
  ],
  planning: [
    'Eylem planı oluşturuldu, adımlar belirlendi.',
    'Kısa ve uzun vadeli hedefler belirlendi.',
    'Başa çıkma stratejileri geliştirildi.',
  ],
  referral: [
    'Uzman desteği için yönlendirme yapıldı.',
    'Aile görüşmesi planlandı.',
    'Öğretmenlerle işbirliği için plan yapıldı.',
  ],
  monitoring: [
    'Düzenli takip planlandı.',
    'Haftalık kontrol görüşmeleri kararlaştırıldı.',
    'İlerleme değerlendirmesi için randevu verildi.',
  ],
};

export const ACTION_TEMPLATES = {
  student: [
    'Öğrenci günlük duygu durumu kaydetmeye başlayacak.',
    'Öğrenci belirlenen stratejileri deneyecek ve sonuçları paylaşacak.',
    'Öğrenci haftalık hedeflerini yazacak ve takip edecek.',
    'Öğrenci rahatsız olduğunda danışmana ulaşacak.',
  ],
  counselor: [
    'Danışman haftalık takip görüşmesi planlayacak.',
    'Danışman sınıf öğretmenini bilgilendirecek.',
    'Danışman veli görüşmesi ayarlayacak.',
    'Danışman ilerleme raporu hazırlayacak.',
  ],
  parent: [
    'Veli evde destekleyici tutum gösterecek.',
    'Veli haftalık danışmanla iletişime geçecek.',
    'Veli öğrencinin sosyal çevresini izleyecek.',
    'Veli belirlenen stratejileri uygulayacak.',
  ],
  teacher: [
    'Öğretmen sınıf içi davranışları gözlemleyecek.',
    'Öğretmen öğrenciye ek destek sağlayacak.',
    'Öğretmen ilerleme hakkında geri bildirim verecek.',
  ],
};

export const FOLLOW_UP_TEMPLATES = {
  shortTerm: [
    '1 hafta içinde kontrol görüşmesi yapılacak.',
    '3 gün içinde öğrencinin durumu telefonla sorgulanacak.',
    'Gelecek hafta aynı gün-saatte görüşme planlandı.',
  ],
  mediumTerm: [
    '2 hafta sonra ilerleme değerlendirmesi yapılacak.',
    'Ay sonunda kapsamlı değerlendirme planlandı.',
    '1 ay sonra durum değerlendirmesi ve plan revizyonu yapılacak.',
  ],
  longTerm: [
    'Dönem sonunda genel değerlendirme yapılacak.',
    '3 ay sonunda ilerleme raporu hazırlanacak.',
    'Yıl sonu kapsamlı değerlendirme planlandı.',
  ],
};

export const EMOTIONAL_STATE_DESCRIPTIONS = {
  sakin: 'Öğrenci sakin ve dengeli bir duygusal durumda görüldü.',
  kaygılı: 'Öğrenci kaygılı ve endişeli görünüyor, destek gerekiyor.',
  üzgün: 'Öğrenci üzgün ve çökkün bir halde, duygusal destek sağlandı.',
  sinirli: 'Öğrenci sinirli ve öfkeli, duygu düzenleme teknikleri paylaşıldı.',
  mutlu: 'Öğrenci mutlu ve pozitif bir duygusal durumda.',
  karışık: 'Öğrenci karışık duygular yaşıyor, duyguları tanımlama çalışması yapıldı.',
};

export const PARTICIPATION_DESCRIPTIONS = {
  çok_aktif: 'Öğrenci görüşmeye çok aktif katıldı, inisiyatif alıyor.',
  aktif: 'Öğrenci görüşmeye istekli ve aktif katılım gösterdi.',
  pasif: 'Öğrenci pasif kaldı, yönlendirmelerle katılım sağlandı.',
  dirençli: 'Öğrenci dirençli tutum gösterdi, güven oluşturma çalışması yapıldı.',
  kapalı: 'Öğrenci kendini ifade etmekte zorlandı, alternatif iletişim yolları denendi.',
};

export const SESSION_FLOW_DESCRIPTIONS = {
  çok_olumlu: 'Görüşme çok olumlu geçti, hedeflere ulaşıldı.',
  olumlu: 'Görüşme olumlu geçti, ilerleme kaydedildi.',
  nötr: 'Görüşme normal seyrinde geçti.',
  sorunlu: 'Görüşme zorlu geçti, bazı engellerle karşılaşıldı.',
  kriz: 'Kriz durumu tespit edildi, acil müdahale yapıldı.',
};
