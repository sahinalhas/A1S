import { randomUUID } from 'crypto';
import type { InterventionRecommendation, EarlyWarningAlert } from '../../../../shared/types/early-warning.types';

export function generateAcademicInterventions(
  studentId: string,
  alerts: EarlyWarningAlert[]
): InterventionRecommendation[] {
  const interventions: InterventionRecommendation[] = [];
  
  const academicAlerts = alerts.filter(a => a.alertType === 'AKADEMİK');
  
  if (academicAlerts.some(a => a.alertLevel === 'KRİTİK')) {
    interventions.push({
      id: randomUUID(),
      studentId,
      alertId: academicAlerts.find(a => a.alertLevel === 'KRİTİK')?.id,
      recommendationType: 'AKADEMİK_DESTEK',
      priority: 'ACİL',
      title: 'Yoğun Akademik Destek Programı',
      description: 'Öğrencinin kritik akademik durumu için acil ve yoğun destek programı başlatılmalı.',
      suggestedActions: JSON.stringify([
        'Birebir ders desteği (haftada en az 3 saat)',
        'Akran mentörlük programına dahil etme',
        'Aile ile acil görüşme ve ev çalışma planı oluşturma',
        'Haftalık ilerleme takibi',
        'Eksik konuların tespiti ve telafi programı'
      ]),
      targetArea: 'Akademik Başarı',
      expectedOutcome: 'Not ortalamasının 2.5 üzerine çıkarılması ve başarısız ders sayısının azaltılması',
      resources: 'Ders öğretmenleri, akran mentörler, rehber öğretmen, veli desteği',
      estimatedDuration: '3 ay',
      status: 'ÖNERİLDİ'
    });
  }
  
  if (academicAlerts.some(a => a.title.includes('Ders Başarısızlığı'))) {
    interventions.push({
      id: randomUUID(),
      studentId,
      alertId: academicAlerts.find(a => a.title.includes('Ders Başarısızlığı'))?.id,
      recommendationType: 'DERS_BAZLI_DESTEK',
      priority: 'YÜKSEK',
      title: 'Ders Bazlı Telafi Programı',
      description: 'Başarısız olunan dersler için özel telafi ve destek programı uygulanmalı.',
      suggestedActions: JSON.stringify([
        'Her ders için bireysel çalışma planı hazırlama',
        'İlgili ders öğretmenleri ile koordinasyon',
        'Ek kaynak materyallerin sağlanması',
        'Haftalık konu testleri ve değerlendirme',
        'Online eğitim platformlarından faydalanma'
      ]),
      targetArea: 'Ders Başarısı',
      expectedOutcome: 'Tüm derslerde geçme notunun sağlanması',
      resources: 'Branş öğretmenleri, eğitim materyalleri, online kaynaklar',
      estimatedDuration: '2 ay',
      status: 'ÖNERİLDİ'
    });
  }
  
  if (academicAlerts.some(a => a.title.includes('Performans Düşüşü'))) {
    interventions.push({
      id: randomUUID(),
      studentId,
      alertId: academicAlerts.find(a => a.title.includes('Performans Düşüşü'))?.id,
      recommendationType: 'MOTIVASYON',
      priority: 'ORTA',
      title: 'Motivasyon ve Çalışma Becerisi Geliştirme',
      description: 'Akademik düşüşün altında yatan nedenlerin tespiti ve motivasyon desteği.',
      suggestedActions: JSON.stringify([
        'Bireysel rehberlik görüşmeleri (haftada 1)',
        'Çalışma becerilerinin değerlendirilmesi',
        'Hedef belirleme ve takip sistemi',
        'Başarı hikayelerinin paylaşılması',
        'Sosyal-duygusal destek sağlanması'
      ]),
      targetArea: 'Motivasyon ve Çalışma Becerileri',
      expectedOutcome: 'Öğrencinin çalışma motivasyonunun artması ve performansın eski seviyesine dönmesi',
      resources: 'Rehber öğretmen, sınıf öğretmeni, aile desteği',
      estimatedDuration: '6 hafta',
      status: 'ÖNERİLDİ'
    });
  }
  
  return interventions;
}

export function generateBehavioralInterventions(
  studentId: string,
  alerts: EarlyWarningAlert[]
): InterventionRecommendation[] {
  const interventions: InterventionRecommendation[] = [];
  
  const behavioralAlerts = alerts.filter(a => a.alertType === 'DAVRANIŞSAL');
  
  if (behavioralAlerts.some(a => a.alertLevel === 'KRİTİK')) {
    interventions.push({
      id: randomUUID(),
      studentId,
      alertId: behavioralAlerts.find(a => a.alertLevel === 'KRİTİK')?.id,
      recommendationType: 'DAVRANIŞSAL_MÜDAHALE',
      priority: 'ACİL',
      title: 'Yoğun Davranış Müdahale Planı',
      description: 'Ciddi davranış sorunları için kapsamlı müdahale planı ve uzman desteği.',
      suggestedActions: JSON.stringify([
        'Fonksiyonel Davranış Değerlendirmesi (FDD) yapılması',
        'Bireysel Davranış Destek Planı (BDDP) oluşturulması',
        'Günlük davranış izleme ve kayıt',
        'Pozitif davranış pekiştirme sistemi',
        'Psikolog/pedagog yönlendirmesi',
        'Aile eğitimi ve işbirliği'
      ]),
      targetArea: 'Davranış Düzenleme',
      expectedOutcome: 'Ciddi davranış olaylarının azaltılması ve olumlu davranış repertuarının genişletilmesi',
      resources: 'Rehber öğretmen, psikolog, aile, sınıf öğretmeni',
      estimatedDuration: '3-6 ay',
      status: 'ÖNERİLDİ'
    });
  }
  
  if (behavioralAlerts.some(a => a.title.includes('Yoğun Davranış'))) {
    interventions.push({
      id: randomUUID(),
      studentId,
      alertId: behavioralAlerts.find(a => a.title.includes('Yoğun Davranış'))?.id,
      recommendationType: 'PATERN_ANALİZİ',
      priority: 'YÜKSEK',
      title: 'Davranış Patern Analizi ve Müdahale',
      description: 'Davranış olaylarının patern analizinin yapılması ve önleyici stratejiler geliştirilmesi.',
      suggestedActions: JSON.stringify([
        'ABC (Öncül-Davranış-Sonuç) analizi yapma',
        'Tetikleyici faktörlerin belirlenmesi',
        'Önleyici stratejilerin geliştirilmesi',
        'Alternatif davranış öğretimi',
        'Çevresel düzenlemeler'
      ]),
      targetArea: 'Davranış Önleme',
      expectedOutcome: 'Davranış olaylarının sıklığında %50 azalma',
      resources: 'Rehber öğretmen, özel eğitim uzmanı, sınıf öğretmeni',
      estimatedDuration: '2 ay',
      status: 'ÖNERİLDİ'
    });
  }
  
  if (behavioralAlerts.some(a => a.title.includes('Negatif'))) {
    interventions.push({
      id: randomUUID(),
      studentId,
      alertId: behavioralAlerts.find(a => a.title.includes('Negatif'))?.id,
      recommendationType: 'POZİTİF_PEKİŞTİRME',
      priority: 'ORTA',
      title: 'Pozitif Davranış Pekiştirme Programı',
      description: 'Olumlu davranışların artırılması için sistematik pekiştirme programı.',
      suggestedActions: JSON.stringify([
        'Hedef davranışların belirlenmesi',
        'Jeton ekonomisi veya puan sistemi kurulması',
        'Olumlu davranışların hemen pekiştirilmesi',
        'Başarıların görünür kılınması',
        'Aile ile koordineli çalışma'
      ]),
      targetArea: 'Olumlu Davranış Artırma',
      expectedOutcome: 'Olumlu davranış oranının %70 üzerine çıkarılması',
      resources: 'Tüm öğretmenler, aile, öğrenci',
      estimatedDuration: '6-8 hafta',
      status: 'ÖNERİLDİ'
    });
  }
  
  return interventions;
}

export function generateAttendanceInterventions(
  studentId: string,
  alerts: EarlyWarningAlert[]
): InterventionRecommendation[] {
  const interventions: InterventionRecommendation[] = [];
  
  const attendanceAlerts = alerts.filter(a => a.alertType === 'DEVAMSIZLIK');
  
  if (attendanceAlerts.some(a => a.alertLevel === 'KRİTİK' || a.alertLevel === 'YÜKSEK')) {
    interventions.push({
      id: randomUUID(),
      studentId,
      alertId: attendanceAlerts.find(a => a.alertLevel === 'KRİTİK' || a.alertLevel === 'YÜKSEK')?.id,
      recommendationType: 'DEVAMSIZLIK_MÜDAHALE',
      priority: 'ACİL',
      title: 'Devamsızlık Azaltma Planı',
      description: 'Yüksek devamsızlık oranı için kapsamlı müdahale ve aile işbirliği planı.',
      suggestedActions: JSON.stringify([
        'Acil aile görüşmesi ve devamsızlık nedenleri analizi',
        'Günlük devam takip sistemi kurma',
        'Sabah arama/hatırlatma servisi',
        'Sosyal hizmetler ile koordinasyon',
        'Okula bağlılık artırıcı aktiviteler',
        'Gerekirse ev ziyareti yapılması'
      ]),
      targetArea: 'Devam Oranı',
      expectedOutcome: 'Devam oranının %90 üzerine çıkarılması',
      resources: 'Rehber öğretmen, okul yönetimi, aile, sosyal hizmetler',
      estimatedDuration: '2-3 ay',
      status: 'ÖNERİLDİ'
    });
  }
  
  if (attendanceAlerts.some(a => a.title.includes('Mazeretsiz'))) {
    interventions.push({
      id: randomUUID(),
      studentId,
      alertId: attendanceAlerts.find(a => a.title.includes('Mazeretsiz'))?.id,
      recommendationType: 'NEDENSELLİK_ANALİZİ',
      priority: 'YÜKSEK',
      title: 'Devamsızlık Nedenleri Araştırması',
      description: 'Mazeretsiz devamsızlıkların altında yatan nedenlerin detaylı araştırılması.',
      suggestedActions: JSON.stringify([
        'Öğrenci ile bireysel görüşme',
        'Aile ile detaylı görüşme',
        'Okul fobisi/anksiyetesi değerlendirmesi',
        'Akran ilişkileri incelemesi',
        'Ekonomik/sosyal engellerin tespiti',
        'Gerekirse uzman yönlendirmesi'
      ]),
      targetArea: 'Devamsızlık Nedenleri',
      expectedOutcome: 'Temel nedenlerin belirlenmesi ve çözüm planı oluşturulması',
      resources: 'Rehber öğretmen, psikolog, aile',
      estimatedDuration: '4 hafta',
      status: 'ÖNERİLDİ'
    });
  }
  
  if (attendanceAlerts.some(a => a.title.includes('Geç Kalma'))) {
    interventions.push({
      id: randomUUID(),
      studentId,
      alertId: attendanceAlerts.find(a => a.title.includes('Geç Kalma'))?.id,
      recommendationType: 'RUTİN_OLUŞTURMA',
      priority: 'ORTA',
      title: 'Sabah Rutini Düzenleme Desteği',
      description: 'Sık geç kalma sorunu için sabah rutini oluşturma ve aile desteği.',
      suggestedActions: JSON.stringify([
        'Aile ile sabah rutini planlaması',
        'Akşam hazırlık alışkanlığı oluşturma',
        'Uyku düzeni kontrolü',
        'Ulaşım sorunlarının tespiti',
        'Motivasyon artırıcı ödül sistemi'
      ]),
      targetArea: 'Zamanında Gelme',
      expectedOutcome: 'Geç kalmaların azami %5 seviyesine düşürülmesi',
      resources: 'Aile, sınıf öğretmeni, öğrenci',
      estimatedDuration: '3-4 hafta',
      status: 'ÖNERİLDİ'
    });
  }
  
  return interventions;
}

export function generateSocialEmotionalInterventions(
  studentId: string,
  alerts: EarlyWarningAlert[]
): InterventionRecommendation[] {
  const interventions: InterventionRecommendation[] = [];
  
  const socialAlerts = alerts.filter(a => a.alertType === 'SOSYAL-DUYGUSAL');
  
  if (socialAlerts.some(a => a.alertLevel === 'KRİTİK')) {
    interventions.push({
      id: randomUUID(),
      studentId,
      alertId: socialAlerts.find(a => a.alertLevel === 'KRİTİK')?.id,
      recommendationType: 'UZMAN_YÖNLENDIRME',
      priority: 'ACİL',
      title: 'Acil Psikolojik Destek Yönlendirmesi',
      description: 'Kritik sosyal-duygusal durum için profesyonel psikolojik destek sağlanmalı.',
      suggestedActions: JSON.stringify([
        'Çocuk psikiyatrisi/psikolojisi yönlendirmesi',
        'Kriz müdahale planı oluşturma',
        'Günlük sosyal-duygusal izleme',
        'Aile terapisi önerisi',
        'Okul içi güvenlik planı',
        'İlaç tedavisi değerlendirmesi (gerekirse)'
      ]),
      targetArea: 'Psikolojik Sağlık',
      expectedOutcome: 'Profesyonel destek alınması ve kriz durumunun stabilize edilmesi',
      resources: 'Psikolog, psikiyatrist, rehber öğretmen, aile',
      estimatedDuration: 'Uzun dönem (6+ ay)',
      status: 'ÖNERİLDİ'
    });
  }
  
  if (socialAlerts.some(a => a.title.includes('Yoğun Rehberlik'))) {
    interventions.push({
      id: randomUUID(),
      studentId,
      alertId: socialAlerts.find(a => a.title.includes('Yoğun Rehberlik'))?.id,
      recommendationType: 'YAPILI_DANIŞMANLIK',
      priority: 'YÜKSEK',
      title: 'Yapılandırılmış Rehberlik Programı',
      description: 'Düzenli ve yapılandırılmış bireysel rehberlik desteği programı.',
      suggestedActions: JSON.stringify([
        'Haftada 2 kez 45 dakikalık görüşmeler',
        'Bilişsel-davranışçı teknikler kullanma',
        'Duygu düzenleme becerileri öğretimi',
        'Başa çıkma stratejileri geliştirme',
        'İlerleme takibi ve değerlendirme'
      ]),
      targetArea: 'Sosyal-Duygusal Beceriler',
      expectedOutcome: 'Sosyal-duygusal düzenleme becerilerinin gelişmesi',
      resources: 'Rehber öğretmen, psikolog',
      estimatedDuration: '3 ay',
      status: 'ÖNERİLDİ'
    });
  }
  
  if (socialAlerts.some(a => a.title.includes('Çoklu Endişe'))) {
    interventions.push({
      id: randomUUID(),
      studentId,
      alertId: socialAlerts.find(a => a.title.includes('Çoklu Endişe'))?.id,
      recommendationType: 'BÜTÜNCÜL_DESTEK',
      priority: 'YÜKSEK',
      title: 'Bütüncül Sosyal-Duygusal Destek Planı',
      description: 'Çoklu endişe alanlarına yönelik kapsamlı ve bütüncül destek planı.',
      suggestedActions: JSON.stringify([
        'Tüm endişe alanlarının önceliklendirilmesi',
        'Çok disiplinli ekip toplantısı',
        'Alan bazlı müdahale stratejileri',
        'Aile ve öğretmen koordinasyonu',
        'Haftalık ilerleme değerlendirmesi'
      ]),
      targetArea: 'Çoklu Alan Gelişimi',
      expectedOutcome: 'Endişe alanlarının azaltılması ve genel refahın artması',
      resources: 'Rehber öğretmen, psikolog, öğretmenler, aile',
      estimatedDuration: '4-6 ay',
      status: 'ÖNERİLDİ'
    });
  }
  
  return interventions;
}

export function generateAllInterventions(
  studentId: string,
  alerts: EarlyWarningAlert[]
): InterventionRecommendation[] {
  const interventions: InterventionRecommendation[] = [
    ...generateAcademicInterventions(studentId, alerts),
    ...generateBehavioralInterventions(studentId, alerts),
    ...generateAttendanceInterventions(studentId, alerts),
    ...generateSocialEmotionalInterventions(studentId, alerts)
  ];
  
  interventions.sort((a, b) => {
    const priorityOrder = { 'ACİL': 0, 'YÜKSEK': 1, 'ORTA': 2, 'DÜŞÜK': 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return interventions;
}
