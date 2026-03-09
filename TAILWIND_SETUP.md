# Tailwind CSS Setup Guide

Lightning Games artık Tailwind CSS ile entegre edilmiştir!

## Installation

### 1. Dependencies Yükle

```bash
npm install
```

veya Bun kullanıyorsan:

```bash
bun install
```

### 2. Tailwind CSS'i Derle

Development modunda (watch mode):

```bash
npm run tailwind
```

veya Bun ile:

```bash
bun run tailwind
```

Production build:

```bash
npx tailwindcss -i ./styles/tailwind.css -o ./styles/tailwind-output.css --minify
```

### 3. Uygulamayı Başlat

```bash
npm start
```

## Dosya Yapısı

- `tailwind.config.js` - Tailwind konfigürasyonu
- `postcss.config.js` - PostCSS konfigürasyonu
- `styles/tailwind.css` - Tailwind input dosyası
- `styles/tailwind-output.css` - Derlenmiş CSS (otomatik oluşturulur)
- `styles/main.css` - Mevcut custom CSS (korunur)

## Kullanım

### Tailwind Classes

HTML'de doğrudan Tailwind classes kullanabilirsin:

```html
<button class="btn-neon">Click Me</button>
<div class="card-neon">Content</div>
<input class="input-neon" type="text" placeholder="Enter text">
```

### Custom Components

`styles/tailwind.css` içinde önceden tanımlanmış custom components:

- `.btn-neon` - Neon buton
- `.card-neon` - Neon kart
- `.input-neon` - Neon input
- `.badge-neon` - Neon badge
- `.text-neon` - Neon metin
- `.animate-neon-glow` - Neon glow animasyonu

### Neon Colors

Tailwind config'de tanımlanmış renkler:

- `neon-cyan` - #00d4ff
- `neon-magenta` - #ff00aa
- `neon-green` - #00ff88
- `neon-yellow` - #ffcc00
- `neon-orange` - #ff8844
- `neon-purple` - #8855ff
- `neon-red` - #ff4466
- `neon-dark` - #050512

## Mevcut CSS ile Uyumlu

- Tailwind CSS `preflight` devre dışı bırakıldı
- Mevcut `styles/main.css` korunur
- Her iki CSS de birlikte çalışır

## Build Process

`npm run dist` çalıştırırken Tailwind CSS otomatik olarak derlenecek.

## Notlar

- Tailwind output dosyası (`tailwind-output.css`) otomatik oluşturulur
- `.gitignore`'a eklenmiştir
- Development sırasında `npm run tailwind` ile watch mode'u açık tutun
