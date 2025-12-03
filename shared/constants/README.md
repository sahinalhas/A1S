# Constants Kullanım Kılavuzu

Bu klasörde, uygulamada kullanılan sabit değerler (constants) bulunmaktadır. **Magic string'leri doğrudan kod içinde kullanmak yerine, bu constant'ları kullanmalısınız.**

## 📋 Mevcut Constants

### 1. `common.constants.ts` - Genel Sabitler

#### Session Modes (Görüşme Şekilleri)
```typescript
import { SESSION_MODES } from '@shared/constants/common.constants';

// ✅ DOĞRU KULLANIM
if (sessionMode === SESSION_MODES.YUZ_YUZE) { }
if (sessionMode === SESSION_MODES.ONLINE) { }
if (sessionMode === SESSION_MODES.TELEFON) { }

// ❌ YANLIŞ KULLANIM - Magic string kullanmayın!
if (sessionMode === 'yüz_yüze') { }  // KULLANMAYIN
if (sessionMode === 'online') { }     // KULLANMAYIN
```

#### Participant Types (Katılımcı Tipleri)
```typescript
import { PARTICIPANT_TYPES } from '@shared/constants/common.constants';

// ✅ DOĞRU KULLANIM
if (participantType === PARTICIPANT_TYPES.OGRENCI) { }
if (participantType === PARTICIPANT_TYPES.VELI) { }
if (participantType === PARTICIPANT_TYPES.OGRETMEN) { }

// ❌ YANLIŞ KULLANIM
if (participantType === 'öğrenci') { }  // KULLANMAYIN
```

#### Risk Levels (Risk Seviyeleri)
```typescript
import { RISK_LEVELS } from '@shared/constants/common.constants';

// ✅ DOĞRU KULLANIM
if (riskLevel === RISK_LEVELS.DUSUK) { }
if (riskLevel === RISK_LEVELS.ORTA) { }
if (riskLevel === RISK_LEVELS.YUKSEK) { }

// ❌ YANLIŞ KULLANIM
if (riskLevel === 'Düşük') { }  // KULLANMAYIN
```

### 2. `student-profile-taxonomy.ts` - Öğrenci Profil Sabitleri

Akademik dersler, beceriler, ilgi alanları vb. için standart değerler.

## 🎨 AI Utilities

AI bileşenleri için ortak yardımcı fonksiyonlar:

```typescript
import { 
  getPriorityColor, 
  getStatusColor, 
  getScoreColor,
  getPriorityLabel,
  getUrgencyLabel 
} from '@/lib/ai/ai-utils';

// Öncelik renklerini almak için
<Badge variant={getPriorityColor(priority)}>
  {getPriorityLabel(priority)}
</Badge>

// Skor renklerini almak için
<span className={getScoreColor(score)}>{score}</span>
```

## 🔄 AI Data Fetching Hook

AI önerileri için standart veri çekme:

```typescript
import { useAIRecommendations } from '@/lib/ai/useAIRecommendations';

const { data, isLoading, refetch, isRefetching } = useAIRecommendations({
  queryKey: ['my-ai-data'],
  queryFn: () => fetchMyData(),
  refetchInterval: 30000, // 30 saniye
});
```

## ✨ Standardized Profile Sections Hook

Profil bölümleri için ortak hook:

```typescript
import { useStandardizedProfileSection } from '@/hooks/useStandardizedProfileSection';

const { savedData, isSubmitting, onSubmit, refetch } = useStandardizedProfileSection({
  studentId,
  sectionName: 'Akademik profil',
  apiEndpoint: 'academic',
  form,
  defaultValues: form.getValues(),
  onUpdate,
});
```

## 📚 Yeni Constants Ekleme

Yeni bir constant eklerken:

1. İlgili dosyaya ekleyin (veya yeni dosya oluşturun)
2. TypeScript type tanımlarını ekleyin
3. Bu README'yi güncelleyin
4. Varsa ilgili utility fonksiyonlarını güncelleyin

## 🎯 Neden Constants Kullanmalıyız?

1. **Yazım Hatalarını Önler**: TypeScript type checking ile hataları compile-time'da yakalar
2. **Refactoring Kolaylığı**: Tek bir yerden değiştirip tüm uygulamayı günceller
3. **Tutarlılık**: Aynı değerlerin her yerde aynı şekilde kullanılmasını sağlar
4. **Bakım Kolaylığı**: Kod daha okunabilir ve sürdürülebilir olur
5. **Autocomplete**: IDE otomatik tamamlama önerileri verir

## 📝 Örnek Dönüşüm

### Önce (❌ Kötü)
```typescript
// SessionForm.tsx
<select value={mode}>
  <option value="yüz_yüze">Yüz Yüze</option>
  <option value="online">Online</option>
  <option value="telefon">Telefon</option>
</select>

if (mode === 'online') {
  // ...
}
```

### Sonra (✅ İyi)
```typescript
import { SESSION_MODES, SESSION_MODE_LABELS } from '@shared/constants/common.constants';

<select value={mode}>
  <option value={SESSION_MODES.YUZ_YUZE}>{SESSION_MODE_LABELS[SESSION_MODES.YUZ_YUZE]}</option>
  <option value={SESSION_MODES.ONLINE}>{SESSION_MODE_LABELS[SESSION_MODES.ONLINE]}</option>
  <option value={SESSION_MODES.TELEFON}>{SESSION_MODE_LABELS[SESSION_MODES.TELEFON]}</option>
</select>

if (mode === SESSION_MODES.ONLINE) {
  // ...
}
```

## 🔍 Mevcut Magic String'leri Bulma

Magic string içeren dosyaları bulmak için:

```bash
# Session modes için
grep -r "yüz_yüze\|online.*telefon" --include="*.ts" --include="*.tsx"

# Risk levels için  
grep -r "Düşük\|Orta\|Yüksek" --include="*.ts" --include="*.tsx"

# Participant types için
grep -r "öğrenci.*veli.*öğretmen" --include="*.ts" --include="*.tsx"
```

---

## ✅ Constant Kullanımı Kontrol Listesi

Yeni constant eklerken veya kullanırken:

- [ ] **Null Safety**: Fonksiyonlar `null` veya `undefined` değerleri güvenli şekilde ele alıyor mu?
- [ ] **Type Safety**: TypeScript return type'ları doğru tanımlanmış mı?
- [ ] **Fallback Values**: Beklenmeyen değerler için fallback mekanizması var mı?
- [ ] **Test Coverage**: Yeni constant'lar için birim testleri yazıldı mı?
- [ ] **Documentation**: README güncellenmiş mi?
- [ ] **Migration**: Eski magic string'ler yeni constant'lara dönüştürülmüş mü?

### Örnek Güvenli Kullanım

```typescript
// ❌ GÜVENSIZ - null/undefined kontrolü yok
export function getPriorityLabel(priority: string): string {
  return priority.toLowerCase(); // priority null ise hata verir!
}

// ✅ GÜVENLİ - null kontrolü var
export function getPriorityLabel(priority: string | undefined | null): string {
  if (!priority) return 'Belirtilmemiş';
  return priority.toLowerCase();
}
```

---

**Not:** Yeni kod yazarken veya mevcut kodu güncellerken, her zaman constants kullanmaya özen gösterin.
