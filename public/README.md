# Public Assets

Bu klasör statik dosyaları (assets) içerir. Bu dosyalara doğrudan URL üzerinden erişilebilir.

## 📁 Klasör Yapısı

```
public/
├── images/                 # Resim dosyaları
│   ├── logos/             # Logo dosyaları
│   ├── icons/             # İkon dosyaları
│   ├── avatars/           # Avatar resimleri
│   └── backgrounds/       # Arkaplan resimleri
├── fonts/                 # Font dosyaları
├── locales/               # Çeviri dosyaları (i18n)
│   ├── tr.json           # Türkçe çeviriler
│   └── en.json           # İngilizce çeviriler
├── templates/             # Rapor şablonları
│   ├── pdf/              # PDF şablonları
│   └── excel/            # Excel şablonları
├── favicon.ico           # Site ikonu
├── icon-192.png          # PWA ikonu (192x192)
├── icon-512.png          # PWA ikonu (512x512)
├── manifest.json         # PWA manifest dosyası
├── offline.html          # Offline sayfası
├── service-worker.js     # Service worker
└── README.md             # Bu dosya
```

## 🎨 Images

### Logos

Logo dosyalarını `public/images/logos/` klasörüne ekleyin.

**Önerilen formatlar:**
- SVG (vektörel, tercih edilen)
- PNG (şeffaf arkaplan)

**Kullanım:**
```html
<!-- HTML -->
<img src="/images/logos/logo.svg" alt="Rehber360 Logo" />

<!-- React/TSX -->
<img src="/images/logos/logo.svg" alt="Rehber360 Logo" />
```

### Icons

İkon dosyalarını `public/images/icons/` klasörüne ekleyin.

**Kullanım:**
```html
<img src="/images/icons/dashboard-icon.svg" alt="Dashboard" />
```

**Not:** Lucide React zaten kullanımda. Özel ikonlar için bu klasörü kullanın.

### Avatars

Varsayılan avatar resimlerini `public/images/avatars/` klasörüne ekleyin.

**Kullanım:**
```typescript
const defaultAvatar = '/images/avatars/default.png';
const studentAvatar = student.avatarUrl || defaultAvatar;
```

### Backgrounds

Arkaplan resimlerini `public/images/backgrounds/` klasörüne ekleyin.

**Kullanım:**
```css
.hero-section {
  background-image: url('/images/backgrounds/hero-bg.jpg');
}
```

## 🔤 Fonts

Özel font dosyalarını `public/fonts/` klasörüne ekleyin.

**Örnek yapı:**
```
public/fonts/
├── Inter/
│   ├── Inter-Regular.woff2
│   ├── Inter-Bold.woff2
│   └── Inter-SemiBold.woff2
```

**CSS'de kullanım:**
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter/Inter-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

## 🌍 Locales (i18n)

Çeviri dosyaları `public/locales/` klasöründe bulunur.

**Mevcut diller:**
- `tr.json` - Türkçe
- `en.json` - İngilizce

**Kullanım:**

```typescript
import { loadTranslations, translate } from '@/lib/i18n';

// Çevirileri yükle
const translations = await loadTranslations('tr');

// Çeviri kullan
const saveText = translate(translations, 'common.save'); // "Kaydet"
```

**Detaylı bilgi:** `public/locales/` klasörü içindeki dosyalara bakın.

## 📄 Templates

PDF ve Excel rapor şablonları `public/templates/` klasöründe bulunur.

**Detaylı bilgi:** `public/templates/README.md` dosyasına bakın.

## 🔍 Public vs Client Assets

### Public Assets (public/)
- **Doğrudan URL erişimi:** `/images/logo.svg`
- **Build sırasında kopyalanır**
- **Hash eklenmez:** Dosya adı değişmez
- **Kullanım:** Statik dosyalar, favicon, manifest, büyük medya dosyaları

### Client Assets (client/assets/)
- **Import ile kullanılır:** `import logo from '@/assets/logo.svg'`
- **Build sırasında işlenir**
- **Hash eklenir:** `logo-a1b2c3d4.svg` (cache busting)
- **Kullanım:** Component'lerde import edilen dosyalar

**Ne zaman hangisini kullanmalı?**

| Public | Client Assets |
|--------|--------------|
| Favicon, manifest | Component'te import edilen resimler |
| Büyük video/ses dosyaları | CSS'te kullanılan resimler |
| Şablonlar (PDF/Excel) | Küçük-orta boyutlu resimler |
| Statik dökümanlar | Icon sprite'lar |
| SEO meta resimleri | Font dosyaları (alternatif) |

## 📖 Örnekler

### 1. Public Asset Kullanımı

```tsx
// Doğrudan URL ile erişim
function Logo() {
  return <img src="/images/logos/logo.svg" alt="Logo" />;
}

// Fetch ile yükleme
async function loadTemplate() {
  const response = await fetch('/templates/pdf/student-report.pdf');
  const blob = await response.blob();
  return blob;
}
```

### 2. Client Asset Kullanımı

```tsx
// Import ile kullanım
import logo from '@/assets/images/logo.png';

function Header() {
  return <img src={logo} alt="Logo" />;
}

// CSS'te kullanım
// src/styles/hero.css
.hero {
  background-image: url('@/assets/images/hero-bg.jpg');
}
```

### 3. i18n Kullanımı

```tsx
import { useEffect, useState } from 'react';
import { loadTranslations, translate, getCurrentLanguage } from '@/lib/i18n';

function MyComponent() {
  const [t, setT] = useState<any>({});
  
  useEffect(() => {
    const language = getCurrentLanguage();
    loadTranslations(language).then(translations => {
      setT(translations);
    });
  }, []);
  
  return (
    <div>
      <button>{translate(t, 'common.save')}</button>
      <h1>{translate(t, 'students.title')}</h1>
    </div>
  );
}
```

### 4. Font Kullanımı

```css
/* client/assets/styles/fonts.css */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter/Inter-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

body {
  font-family: 'Inter', sans-serif;
}
```

## 🚀 Best Practices

### 1. Dosya İsimlendirme
```
✅ logo-dark.svg
✅ student-avatar.png
✅ background-hero.jpg

❌ Logo Dark.svg
❌ StudentAvatar.png
❌ BACKGROUND.JPG
```

### 2. Dosya Boyutu
- **Resimler:** < 500 KB (optimize edin)
- **Fontlar:** WOFF2 kullanın (en küçük)
- **PDF:** < 5 MB
- **Excel:** < 10 MB

### 3. Resim Optimizasyonu
```bash
# ImageMagick ile optimize et
convert input.png -quality 85 -strip output.png

# SVG optimize et (SVGO)
svgo input.svg -o output.svg
```

### 4. Responsive Resimler
```html
<!-- Farklı boyutlar için -->
<picture>
  <source media="(max-width: 768px)" srcset="/images/logo-mobile.svg">
  <source media="(min-width: 769px)" srcset="/images/logo-desktop.svg">
  <img src="/images/logo.svg" alt="Logo">
</picture>
```

### 5. Lazy Loading
```tsx
// Resim lazy loading
<img src="/images/large-image.jpg" loading="lazy" alt="..." />

// Component lazy loading
import { lazy } from 'react';
const HeavyComponent = lazy(() => import('./HeavyComponent'));
```

## 🔒 Güvenlik

⚠️ **Önemli:**
- Public klasöründeki dosyalar herkese açıktır
- Hassas bilgi, API key, şifre içeren dosyalar eklemeyin
- Kullanıcı yüklediği dosyaları public'e kaydetmeyin
- Kullanıcı dosyaları için ayrı storage kullanın (server/uploads/)

## 📚 İlgili Dökümanlar

- [i18n Konfigürasyonu](../client/lib/i18n/README.md) (oluşturulacak)
- [Template Kullanımı](./templates/README.md)
- [Vite Asset Handling](https://vitejs.dev/guide/assets.html)
- [PWA Best Practices](https://web.dev/pwa/)

## 🛠️ Geliştirici Notları

### Asset Ekleme

```bash
# Resim ekle
cp my-logo.svg public/images/logos/

# Font ekle
cp Inter-Regular.woff2 public/fonts/Inter/

# Template ekle
cp student-report.pdf public/templates/pdf/
```

### Build'de Asset'ler

Production build sırasında:
1. Public klasörü `dist/` klasörüne kopyalanır
2. Hash eklenmez (dosya adları korunur)
3. URL'ler değişmez

### Cache Stratejisi

```javascript
// service-worker.js'de cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('assets-v1').then((cache) => {
      return cache.addAll([
        '/images/logos/logo.svg',
        '/fonts/Inter/Inter-Regular.woff2',
      ]);
    })
  );
});
```

## ❓ Sık Sorulan Sorular

**S: Public'e mi yoksa client/assets'e mi koymalıyım?**  
C: Component'te import edecekseniz client/assets/, URL ile erişecekseniz public/

**S: Resimler neden gösterilmiyor?**  
C: Public dosyaları `/` ile başlamalı: `/images/logo.svg`

**S: Build sonrası dosyalar kayboldu?**  
C: Public klasörü `dist/` içine kopyalanır. Deployment'ta `dist/` klasörünü serve edin.

**S: Font'lar yüklenmiyor?**  
C: CSS'de path'i kontrol edin: `url('/fonts/Inter/Inter-Regular.woff2')`

---

**Güncellenme:** 29 Ekim 2025  
**Versiyon:** 1.0
