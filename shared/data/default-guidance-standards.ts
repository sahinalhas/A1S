import type { GuidanceStandard } from '../types/guidance-standards.types.js';

export const DEFAULT_GUIDANCE_STANDARDS: GuidanceStandard = {
  individual: [
    {
      id: 'ind-001',
      title: 'Kişisel Gelişim',
      type: 'individual',
      parentId: null,
      level: 1,
      order: 1,
      isCustom: false,
      children: [
        {
          id: 'ind-001-001',
          title: 'Öz Farkındalık',
          type: 'individual',
          parentId: 'ind-001',
          level: 2,
          order: 1,
          isCustom: false,
          items: [
            { id: 'ind-001-001-001', title: 'Güçlü ve zayıf yönleri tanıma', categoryId: 'ind-001-001', order: 1, isCustom: false },
            { id: 'ind-001-001-002', title: 'Kişilik özellikleri farkındalığı', categoryId: 'ind-001-001', order: 2, isCustom: false },
            { id: 'ind-001-001-003', title: 'Değerler ve ilgi alanları belirleme', categoryId: 'ind-001-001', order: 3, isCustom: false },
          ]
        },
        {
          id: 'ind-001-002',
          title: 'Duygu Yönetimi',
          type: 'individual',
          parentId: 'ind-001',
          level: 2,
          order: 2,
          isCustom: false,
          items: [
            { id: 'ind-001-002-001', title: 'Duyguları tanıma ve adlandırma', categoryId: 'ind-001-002', order: 1, isCustom: false },
            { id: 'ind-001-002-002', title: 'Stres yönetimi teknikleri', categoryId: 'ind-001-002', order: 2, isCustom: false },
            { id: 'ind-001-002-003', title: 'Öfke kontrolü stratejileri', categoryId: 'ind-001-002', order: 3, isCustom: false },
          ]
        },
      ]
    },
    {
      id: 'ind-002',
      title: 'Akademik Başarı',
      type: 'individual',
      parentId: null,
      level: 1,
      order: 2,
      isCustom: false,
      children: [
        {
          id: 'ind-002-001',
          title: 'Etkili Çalışma Yöntemleri',
          type: 'individual',
          parentId: 'ind-002',
          level: 2,
          order: 1,
          isCustom: false,
          items: [
            { id: 'ind-002-001-001', title: 'Ders çalışma tekniklerini öğrenme', categoryId: 'ind-002-001', order: 1, isCustom: false },
            { id: 'ind-002-001-002', title: 'Zaman yönetimi becerilerini geliştirme', categoryId: 'ind-002-001', order: 2, isCustom: false },
            { id: 'ind-002-001-003', title: 'Notlar alma ve özetleme', categoryId: 'ind-002-001', order: 3, isCustom: false },
          ]
        },
        {
          id: 'ind-002-002',
          title: 'Sınav Hazırlığı',
          type: 'individual',
          parentId: 'ind-002',
          level: 2,
          order: 2,
          isCustom: false,
          items: [
            { id: 'ind-002-002-001', title: 'Sınav kaygısı ile baş etme', categoryId: 'ind-002-002', order: 1, isCustom: false },
            { id: 'ind-002-002-002', title: 'Sınav stratejileri geliştirme', categoryId: 'ind-002-002', order: 2, isCustom: false },
            { id: 'ind-002-002-003', title: 'Test çözme teknikleri', categoryId: 'ind-002-002', order: 3, isCustom: false },
          ]
        },
      ]
    },
  ],
  group: [
    {
      id: 'grp-001',
      title: 'Sosyal Beceriler',
      type: 'group',
      parentId: null,
      level: 1,
      order: 1,
      isCustom: false,
      children: [
        {
          id: 'grp-001-001',
          title: 'İletişim Becerisi',
          type: 'group',
          parentId: 'grp-001',
          level: 2,
          order: 1,
          isCustom: false,
          items: [
            { id: 'grp-001-001-001', title: 'Aktif dinleme', categoryId: 'grp-001-001', order: 1, isCustom: false },
            { id: 'grp-001-001-002', title: 'Kendini ifade etme', categoryId: 'grp-001-001', order: 2, isCustom: false },
            { id: 'grp-001-001-003', title: 'Etkili konuşma', categoryId: 'grp-001-001', order: 3, isCustom: false },
          ]
        },
        {
          id: 'grp-001-002',
          title: 'Çatışma Çözümü',
          type: 'group',
          parentId: 'grp-001',
          level: 2,
          order: 2,
          isCustom: false,
          items: [
            { id: 'grp-001-002-001', title: 'Anlaşmazlık yönetimi', categoryId: 'grp-001-002', order: 1, isCustom: false },
            { id: 'grp-001-002-002', title: 'Müzakere becerisi', categoryId: 'grp-001-002', order: 2, isCustom: false },
            { id: 'grp-001-002-003', title: 'Uzlaşma stratejileri', categoryId: 'grp-001-002', order: 3, isCustom: false },
          ]
        },
      ]
    },
    {
      id: 'grp-002',
      title: 'Ekip Çalışması',
      type: 'group',
      parentId: null,
      level: 1,
      order: 2,
      isCustom: false,
      children: [
        {
          id: 'grp-002-001',
          title: 'İş Birliği',
          type: 'group',
          parentId: 'grp-002',
          level: 2,
          order: 1,
          isCustom: false,
          items: [
            { id: 'grp-002-001-001', title: 'Ortak hedef belirleme', categoryId: 'grp-002-001', order: 1, isCustom: false },
            { id: 'grp-002-001-002', title: 'Görev dağılımı', categoryId: 'grp-002-001', order: 2, isCustom: false },
            { id: 'grp-002-001-003', title: 'Katılımcı olma', categoryId: 'grp-002-001', order: 3, isCustom: false },
          ]
        },
      ]
    },
  ]
};
