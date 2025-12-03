import { AIProviderService } from '../../../services/ai-provider.service.js';
import { logger } from '../../../utils/logger.js';
import type { GeneratedTipContent, GuidanceTipCategory, GuidanceTipImportance } from '../types/guidance-tips.types.js';
import { GUIDANCE_TIP_CATEGORIES } from '../types/guidance-tips.types.js';

export interface BatchTipResult {
  tips: GeneratedTipContent[];
  generatedCount: number;
  requestedCount: number;
}

export class GuidanceTipsAIService {
  private aiService: AIProviderService;

  constructor() {
    this.aiService = AIProviderService.getInstance();
  }

  async generateBatchTips(
    count: number = 10, 
    enabledCategories?: GuidanceTipCategory[]
  ): Promise<BatchTipResult> {
    const tips: GeneratedTipContent[] = [];
    const categoriesToUse = enabledCategories && enabledCategories.length > 0 
      ? enabledCategories 
      : GUIDANCE_TIP_CATEGORIES.map(c => c.value);

    const shuffledCategories = this.shuffleArray([...categoriesToUse]);
    const selectedCategories: GuidanceTipCategory[] = [];
    
    for (let i = 0; i < count; i++) {
      selectedCategories.push(shuffledCategories[i % shuffledCategories.length]);
    }

    try {
      const categoryInfoList = selectedCategories.map(cat => {
        const info = GUIDANCE_TIP_CATEGORIES.find(c => c.value === cat);
        return {
          category: cat,
          label: info?.label || 'Genel Rehberlik',
          description: info?.description || ''
        };
      });

      const categoriesText = categoryInfoList.map((c, i) => 
        `${i + 1}. ${c.label} (${c.description})`
      ).join('\n');

      const response = await this.aiService.chat({
        messages: [
          {
            role: 'system',
            content: `Sen 20 yıllık deneyime sahip, hem akademik hem de uygulamalı alanda uzmanlaşmış bir psikolojik danışman ve rehber öğretmensin. Türkiye'deki okullarda çalışan rehber öğretmenlere mesleki gelişimleri için kapsamlı, bilimsel temelli ve pratik bilgiler sunuyorsun.

Görevin: Rehber öğretmenlerin profesyonel gelişimine katkı sağlayacak, günlük işlerinde kullanabilecekleri değerli bilgiler üretmek.

UZMANLIK ALANLARIN:

1. DANIŞMA KURAMLARI:
- Psikoanalitik Kuram (Freud, bilinçdışı, savunma mekanizmaları)
- Bilişsel-Davranışçı Terapi (BDT teknikleri, bilişsel çarpıtmalar, davranış değiştirme)
- Hümanistik/Danışan Merkezli Yaklaşım (Rogers, koşulsuz kabul, empati)
- Gestalt Terapisi (şimdi ve burada, farkındalık, bitmemiş işler)
- Varoluşçu Terapi (anlam arayışı, özgürlük, sorumluluk)
- Çözüm Odaklı Kısa Terapi (istisnalar, ölçekleme soruları, mucize soru)
- Aile Sistemleri Kuramı (sistemik bakış, genogram, üçgenler)
- Narratif Terapi (hikaye yeniden yazma, dışsallaştırma)
- Adlerian Terapi (yaşam stili, sosyal ilgi, aşağılık duygusu)
- Gerçeklik Terapisi (seçim teorisi, WDEP sistemi)

2. DANIŞMANLIK BECERİLERİ:
- Aktif dinleme ve sözsüz iletişim
- Empatik anlayış kurma
- Duygu ve içerik yansıtma
- Açık-kapalı soru teknikleri
- Özetleme ve yapılandırma
- Yapıcı yüzleştirme
- Yorumlama ve anlam katma
- Terapötik ittifak kurma
- Hedef belirleme ve eylem planları

3. REHBERLİK HİZMETLERİ:
- Bireysel ve grup rehberliği
- Kariyer danışmanlığı
- Kriz müdahalesi
- Öğrenci-veli-öğretmen iletişimi
- Sınıf rehberlik programları

4. ÖZEL KONULAR:
- Ergen psikolojisi
- Öğrenme güçlükleri
- Akran zorbalığı
- Bağımlılık önleme
- Travma müdahalesi
- Sosyal-duygusal öğrenme

5. MESLEKİ ETİK:
- Gizlilik ve sınırları
- Çift ilişki
- Yetkinlik sınırları
- Bilgilendirilmiş onam

Cevabını her zaman Türkçe ver ve pratik, uygulanabilir bilgiler sun.`
          },
          {
            role: 'user',
            content: `Aşağıdaki ${count} kategori için birer adet profesyonel rehberlik bilgisi/ipucu oluştur:

${categoriesText}

HER BİLGİ İÇİN KURALLAR:
1. Başlık kısa ve çarpıcı olmalı (maksimum 60 karakter)
2. İçerik 150-200 kelime arasında olmalı
3. Pratik ve hemen uygulanabilir bilgi olmalı
4. Bilimsel temelli veya kanıta dayalı olmalı
5. Türk eğitim sistemine ve kültürüne uygun olmalı
6. Her bilgi BİRBİRİNDEN FARKLI ve BENZERSİZ olmalı

İÇERİK FORMATI:
- Kısa bir giriş paragrafı (2-3 cümle)
- 3-4 numaralı madde halinde açıklama
- Kısa bir kapanış cümlesi

JSON ARRAY formatında yanıt ver:
{
  "tips": [
    {
      "categoryIndex": 0,
      "title": "Kısa başlık",
      "content": "İçerik...",
      "importance": "NORMAL"
    },
    ...
  ]
}

importance değerleri: DUSUK, NORMAL, YUKSEK, KRITIK`
          }
        ],
        temperature: 0.9,
        format: 'json'
      });

      const parsed = this.parseBatchResponse(response, categoryInfoList);
      tips.push(...parsed);

      logger.info(`AI batch generated ${tips.length}/${count} guidance tips`, 'GuidanceTipsAI');

    } catch (error) {
      logger.error('Failed to generate batch tips from AI', 'GuidanceTipsAI', error);
    }

    return {
      tips,
      generatedCount: tips.length,
      requestedCount: count
    };
  }

  private parseBatchResponse(
    response: string, 
    categoryInfoList: { category: GuidanceTipCategory; label: string; description: string }[]
  ): GeneratedTipContent[] {
    const tips: GeneratedTipContent[] = [];
    
    try {
      let jsonStr = response;
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);
      
      if (parsed.tips && Array.isArray(parsed.tips)) {
        for (const tipData of parsed.tips) {
          if (!tipData.title || !tipData.content) continue;
          
          const categoryIndex = tipData.categoryIndex ?? tips.length;
          const category = categoryInfoList[categoryIndex % categoryInfoList.length]?.category || 'GENEL';
          
          const importance = ['DUSUK', 'NORMAL', 'YUKSEK', 'KRITIK'].includes(tipData.importance)
            ? tipData.importance as GuidanceTipImportance
            : 'NORMAL';

          tips.push({
            title: String(tipData.title).slice(0, 200),
            content: String(tipData.content),
            category,
            importance
          });
        }
      }
    } catch (error) {
      logger.error('Failed to parse batch AI response', 'GuidanceTipsAI', error);
    }

    return tips;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async generateRandomTip(preferredCategory?: GuidanceTipCategory): Promise<GeneratedTipContent | null> {
    try {
      const category = preferredCategory || this.getRandomCategory();
      const categoryInfo = GUIDANCE_TIP_CATEGORIES.find(c => c.value === category);

      const response = await this.aiService.chat({
        messages: [
          {
            role: 'system',
            content: `Sen 20 yıllık deneyime sahip, hem akademik hem de uygulamalı alanda uzmanlaşmış bir psikolojik danışman ve rehber öğretmensin. Türkiye'deki okullarda çalışan rehber öğretmenlere mesleki gelişimleri için kapsamlı, bilimsel temelli ve pratik bilgiler sunuyorsun.

Görevin: Rehber öğretmenlerin profesyonel gelişimine katkı sağlayacak, günlük işlerinde kullanabilecekleri değerli bilgiler üretmek.

UZMANLIK ALANLARIN:

1. DANIŞMA KURAMLARI:
- Psikoanalitik Kuram (Freud, bilinçdışı, savunma mekanizmaları)
- Bilişsel-Davranışçı Terapi (BDT teknikleri, bilişsel çarpıtmalar, davranış değiştirme)
- Hümanistik/Danışan Merkezli Yaklaşım (Rogers, koşulsuz kabul, empati)
- Gestalt Terapisi (şimdi ve burada, farkındalık, bitmemiş işler)
- Varoluşçu Terapi (anlam arayışı, özgürlük, sorumluluk)
- Çözüm Odaklı Kısa Terapi (istisnalar, ölçekleme soruları, mucize soru)
- Aile Sistemleri Kuramı (sistemik bakış, genogram, üçgenler)
- Narratif Terapi (hikaye yeniden yazma, dışsallaştırma)
- Adlerian Terapi (yaşam stili, sosyal ilgi, aşağılık duygusu)
- Gerçeklik Terapisi (seçim teorisi, WDEP sistemi)

2. DANIŞMANLIK BECERİLERİ:
- Aktif dinleme ve sözsüz iletişim
- Empatik anlayış kurma
- Duygu ve içerik yansıtma
- Açık-kapalı soru teknikleri
- Özetleme ve yapılandırma
- Yapıcı yüzleştirme
- Yorumlama ve anlam katma
- Terapötik ittifak kurma
- Hedef belirleme ve eylem planları

3. REHBERLİK HİZMETLERİ:
- Bireysel ve grup rehberliği
- Kariyer danışmanlığı
- Kriz müdahalesi
- Öğrenci-veli-öğretmen iletişimi
- Sınıf rehberlik programları

4. ÖZEL KONULAR:
- Ergen psikolojisi
- Öğrenme güçlükleri
- Akran zorbalığı
- Bağımlılık önleme
- Travma müdahalesi
- Sosyal-duygusal öğrenme

5. MESLEKİ ETİK:
- Gizlilik ve sınırları
- Çift ilişki
- Yetkinlik sınırları
- Bilgilendirilmiş onam

Cevabını her zaman Türkçe ver ve pratik, uygulanabilir bilgiler sun.
JSON formatında yanıt ver: {"title": "string", "content": "string", "importance": "NORMAL|YUKSEK|KRITIK"}`
          },
          {
            role: 'user',
            content: `"${categoryInfo?.label || 'Genel Rehberlik'}" kategorisinde (${categoryInfo?.description || ''}) rehber öğretmenler için profesyonel bir bilgi/ipucu oluştur.

KURALLAR:
1. Başlık kısa ve çarpıcı olmalı (maksimum 60 karakter)
2. İçerik 180-250 kelime arasında olmalı
3. Pratik ve hemen uygulanabilir bilgi olmalı
4. Bilimsel temelli veya kanıta dayalı olmalı
5. Türk eğitim sistemine ve kültürüne uygun olmalı

İÇERİK FORMATI (ÇOK ÖNEMLİ):
- Kısa bir giriş paragrafı yaz (2-3 cümle)
- Ardından NUMARALANDIRILMIŞ ADIMLAR veya MADDELER halinde yaz:
  Örnek format:
  "Giriş açıklaması...

  1. **Birinci Adım:** Açıklama...
  2. **İkinci Adım:** Açıklama...
  3. **Üçüncü Adım:** Açıklama..."

- Her maddeyi kalın başlık ve açıklama şeklinde yaz
- 3-5 madde olsun
- Kısa bir kapanış cümlesi ekle

ÖRNEK İÇERİK YAPISI:
"Aktif dinleme, danışan ile güven ilişkisi kurmanın temel taşıdır.

1. **Göz Teması Kurun:** Danışanla göz temasını koruyarak onun söylediklerine odaklandığınızı gösterin.

2. **Yansıtma Yapın:** "Anlıyorum ki..." veya "Demek istediğiniz..." gibi ifadelerle danışanın söylediklerini yansıtın.

3. **Soru Sorun:** Açık uçlu sorularla danışanın düşüncelerini derinleştirmesine yardımcı olun.

Bu teknikleri kullanarak danışanlarınızla daha etkili bir iletişim kurabilirsiniz."

JSON formatında yanıt ver:
{
  "title": "Kısa ve etkileyici başlık",
  "content": "Yapılandırılmış içerik (giriş + numaralı maddeler + kapanış)",
  "importance": "NORMAL"
}`
          }
        ],
        temperature: 0.85,
        format: 'json'
      });

      const parsed = this.parseAIResponse(response, category);
      
      if (parsed) {
        logger.info(`AI generated guidance tip: ${parsed.title} [${category}]`, 'GuidanceTipsAI');
        return parsed;
      }

      logger.warn('AI response parsing failed', 'GuidanceTipsAI');
      return null;
    } catch (error) {
      logger.error('Failed to generate guidance tip from AI', 'GuidanceTipsAI', error);
      return null;
    }
  }

  private parseAIResponse(response: string, category: GuidanceTipCategory): GeneratedTipContent | null {
    try {
      let jsonStr = response;
      
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const parsed = JSON.parse(jsonStr);

      if (!parsed.title || !parsed.content) {
        return null;
      }

      const importance = ['DUSUK', 'NORMAL', 'YUKSEK', 'KRITIK'].includes(parsed.importance) 
        ? parsed.importance as GuidanceTipImportance
        : 'NORMAL';

      return {
        title: String(parsed.title).slice(0, 200),
        content: String(parsed.content),
        category,
        importance
      };
    } catch (error) {
      logger.error('Failed to parse AI response', 'GuidanceTipsAI', error);
      return null;
    }
  }

  private getRandomCategory(): GuidanceTipCategory {
    const allCategories = GUIDANCE_TIP_CATEGORIES.map(c => c.value);
    return allCategories[Math.floor(Math.random() * allCategories.length)];
  }
}

export const guidanceTipsAIService = new GuidanceTipsAIService();
