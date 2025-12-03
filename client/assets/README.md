# Client Assets

Bu klasör client tarafında import edilen statik dosyaları içerir.

## 📁 Klasör Yapısı

```
client/assets/
├── images/         # Import edilecek resimler
├── fonts/          # Import edilecek fontlar
├── styles/         # Global CSS dosyaları (isteğe bağlı)
└── README.md       # Bu dosya
```

## 🎯 Client Assets vs Public Assets

### Client Assets (client/assets/)
- ✅ **Import ile kullanılır**
- ✅ **Build sırasında işlenir** (optimize, minify, hash)
- ✅ **Tree-shaking** (kullanılmayanlar bundle'a dahil edilmez)
- ✅ **Cache busting** (hash ile otomatik)

### Public Assets (public/)
- ✅ **URL ile erişilir**
- ✅ **Build sırasında kopyalanır** (değiştirilmez)
- ✅ **Hash eklenmez** (dosya adı sabit kalır)
- ✅ **Büyük dosyalar için uygun**

## 📖 Kullanım Örnekleri

### 1. Resim Import

```tsx
// Resmi import et
import logo from '@/assets/images/logo.png';
import heroBackground from '@/assets/images/hero-bg.jpg';

function MyComponent() {
  return (
    <div>
      {/* Import edilen resmi kullan */}
      <img src={logo} alt="Logo" />
      
      {/* Inline style ile */}
      <div style={{ backgroundImage: `url(${heroBackground})` }}>
        Hero Section
      </div>
    </div>
  );
}
```

### 2. CSS'te Kullanım

```css
/* Import edilen resimler CSS'te de kullanılabilir */
.header {
  background-image: url('@/assets/images/header-bg.png');
}

.logo {
  content: url('@/assets/images/logo.svg');
}
```

### 3. Font Import

```css
/* client/assets/styles/fonts.css */
@font-face {
  font-family: 'CustomFont';
  src: url('@/assets/fonts/CustomFont-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

body {
  font-family: 'CustomFont', sans-serif;
}
```

### 4. TypeScript ile Tip Güvenliği

```typescript
// vite-env.d.ts veya types/assets.d.ts
declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.svg' {
  const value: string;
  export default value;
}

declare module '*.woff2' {
  const value: string;
  export default value;
}
```

## 🚀 Best Practices

### 1. Resim Optimizasyonu

```bash
# WebP formatına çevir (daha küçük boyut)
convert image.png -quality 85 image.webp

# SVG optimize et
svgo input.svg -o output.svg

# PNG optimize et
optipng -o7 image.png
```

### 2. Responsive Resimler

```tsx
import logoSmall from '@/assets/images/logo-small.png';
import logoLarge from '@/assets/images/logo-large.png';

function Logo() {
  return (
    <picture>
      <source media="(max-width: 768px)" srcSet={logoSmall} />
      <source media="(min-width: 769px)" srcSet={logoLarge} />
      <img src={logoLarge} alt="Logo" />
    </picture>
  );
}
```

### 3. Lazy Loading

```tsx
import { lazy, Suspense } from 'react';

// Component lazy loading
const HeavyImage = lazy(() => import('./HeavyImage'));

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyImage />
    </Suspense>
  );
}

// Resim lazy loading
function Gallery() {
  return <img src={image} loading="lazy" alt="..." />;
}
```

### 4. SVG Component Olarak Import

```tsx
// Vite ile SVG'yi React component olarak import et
import { ReactComponent as Logo } from '@/assets/images/logo.svg';

function Header() {
  return (
    <div>
      {/* SVG artık bir React component */}
      <Logo className="w-12 h-12 text-blue-500" />
    </div>
  );
}
```

## 📏 Dosya Boyutu Limitleri

Vite konfigürasyonunda `assetsInlineLimit: 4096` (4KB) ayarlanmış.

- **< 4 KB:** Base64 olarak inline edilir (HTTP request tasarrufu)
- **≥ 4 KB:** Ayrı dosya olarak bundle edilir

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    assetsInlineLimit: 4096, // 4 KB
  },
});
```

## 🎨 Önerilen Dosya Formatları

### Resimler
| Format | Kullanım | Avantaj |
|--------|----------|---------|
| SVG | Logo, ikonlar, basit grafikler | Vektörel, küçük boyut, ölçeklenebilir |
| WebP | Fotoğraflar, karmaşık grafikler | PNG/JPEG'den %25-35 daha küçük |
| PNG | Şeffaf arkaplan gereken resimler | Kayıpsız sıkıştırma |
| JPG | Fotoğraflar | Küçük boyut, fotoğraflar için ideal |

### Fontlar
| Format | Tarayıcı Desteği | Boyut |
|--------|------------------|-------|
| WOFF2 | Modern (önerilen) | En küçük (~30% daha küçük) |
| WOFF | Tüm modern tarayıcılar | Orta |
| TTF | Eski tarayıcılar | Büyük |

## 🔧 Vite Asset Handling

### URL Referansları

```tsx
// Otomatik olarak işlenir
import imageUrl from '@/assets/images/photo.jpg';

// Build sonrası: /assets/photo-a1b2c3d4.jpg
```

### Explicit URL Import

```tsx
// ?url ile kesinlikle URL olarak import et
import imageUrl from '@/assets/images/photo.jpg?url';
```

### Raw Import

```tsx
// ?raw ile içeriği string olarak al
import svgContent from '@/assets/images/icon.svg?raw';

function Icon() {
  return <div dangerouslySetInnerHTML={{ __html: svgContent }} />;
}
```

## 📦 Build Çıktısı

Production build sonrası:

```
dist/
├── assets/
│   ├── images/
│   │   ├── logo-a1b2c3d4.png
│   │   └── hero-e5f6g7h8.jpg
│   ├── fonts/
│   │   └── CustomFont-i9j0k1l2.woff2
│   └── js/
│       └── main-m3n4o5p6.js
└── index.html
```

## 🛠️ Geliştirme

### Asset Ekleme

```bash
# Resim ekle
cp new-image.png client/assets/images/

# Font ekle
cp new-font.woff2 client/assets/fonts/

# Global CSS ekle
cp styles.css client/assets/styles/
```

### Import Alias

`@/assets` alias'ı kullanarak kolay import:

```tsx
// ✅ Alias ile (önerilen)
import logo from '@/assets/images/logo.png';

// ❌ Relative path (kaçının)
import logo from '../../../assets/images/logo.png';
```

Alias konfigürasyonu:
- `tsconfig.json`: `"@/assets/*": ["./client/assets/*"]`
- `vite.config.ts`: `"@/assets": path.resolve(__dirname, "./client/assets")`

## ⚡ Performans İpuçları

1. **Resim boyutunu küçült**
   ```bash
   # 1920px genişliğe küçült
   convert large.jpg -resize 1920x large-optimized.jpg
   ```

2. **WebP kullan**
   ```tsx
   <picture>
     <source srcSet={imageWebp} type="image/webp" />
     <img src={imagePng} alt="..." />
   </picture>
   ```

3. **Font subsetting**
   ```bash
   # Sadece kullanılan karakterleri içeren font oluştur
   pyftsubset font.ttf --output-file=font-subset.woff2 --flavor=woff2 --text="ABCDEFabcdef123"
   ```

4. **Progressive JPEG**
   ```bash
   convert image.jpg -interlace Plane progressive.jpg
   ```

## 🔗 İlgili Dökümanlar

- [Public Assets](../../public/README.md)
- [Vite Asset Handling](https://vitejs.dev/guide/assets.html)
- [TypeScript Asset Types](https://vitejs.dev/guide/features.html#typescript)

---

**Güncellenme:** 29 Ekim 2025  
**Versiyon:** 1.0
