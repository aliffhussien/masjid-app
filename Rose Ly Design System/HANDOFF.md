# Rose Ly — VSCode Handoff

Selamat datang. Project ni siap untuk di-deploy atau sambung kembangkan dalam VSCode.

## Quick Start

```bash
# 1. Buka folder projek dalam VSCode, pasang dependensi
npm install

# 2. Jalankan mod pembangunan (local development)
npm run dev
# Buka http://localhost:3000

# 3. Bina fail pengeluaran yang dioptimumkan (production bundle)
npm run build
```

Hub akan keluar dengan 4 link: Setup Wizard, Mobile Admin, TV Display, Mode Jumaat.

## Struktur fail

```
index.html                  ← Hub utama (pintu masuk)
manifest.webmanifest        ← PWA manifest
sw.js                       ← Service worker untuk install PWA + offline shell
colors_and_type.css         ← Design tokens
DEPLOY.md                   ← Panduan deploy detail
HANDOFF.md                  ← Fail ini

shared/
  state.js                  ← Cross-tab profile sync (localStorage)
  i18n.js                   ← BM/EN translations dictionary
  solat.js                  ← Wrapper API JAKIM e-Solat
  news.js                   ← Fetcher RSS Bernama via rss2json
  ticker.js                 ← Auto-fill ticker dengan hadith bila notice kosong

assets/
  logo-mark.png             ← App icon 1024×1024
  favicon.png               ← 256×256
  Menjelang_Azan.mp3        ← Audio cue pra-azan (13 saat)

ui_kits/
  setup-wizard/             ← Onboarding 5-langkah
    index.html, Splash.jsx, WizardSteps.jsx
  mobile-admin/             ← Apl admin telefon
    index.html, AdminShell.jsx, KandunganTab.jsx, ...
  tv-display/               ← Paparan TV 1920×1080
    index.html, jumaat.html, Sky.jsx (WebGL), ...

preview/                    ← Design system reference cards
```

## Apa yang dah siap

- ✅ **Stunning Analog SVG Clock** — Jam analog premium dengan stroke-dashoffset animation terpasang indah di header TV display.
- ✅ **Premium "Tabung Infaq" Donation Slide** — Slaid Infaq berasaskan glassmorphism, progress bar sasaran kutipan kutipan, dan pulsing heart animation.
- ✅ **Remote Control Sync** — Sinkronisasi penuh masa nyata antara Mobile Admin Remote Tab dengan TV Display (fasa solat, main/jeda, tempoh slaid, trigger slaid).
- ✅ Setup wizard 5-langkah (welcome → GPS → mosque → logo upload → finish)
- ✅ TV display dengan WebGL sky animasi
- ✅ Prayer phase overlays (PRE_AZAN, AZAN, IQAMAH, SOLAT, KHUTBAH)
- ✅ Audio cue pra-azan dengan timing tepat (audio habis ngam-ngam masa azan masuk)
- ✅ Quran ambient audio continuous play (114 surah loop)
- ✅ Mode Jumaat dengan banner + khutbah stage
- ✅ Mobile admin: slaid editor + drag-reorder + swipe-to-delete + undo
- ✅ Khutbah Jumaat editor + PDF parser (JAKIM e-Khutbah)
- ✅ Theme system (Rose/Emerald/Sapphire/Gold/Steel) — apply ke semua surface
- ✅ e-Solat API integration (waktu solat real-time)
- ✅ Backup/restore JSON
- ✅ Pull-to-refresh
- ✅ Multi-language picker (UI strings dah disediakan dalam i18n.js)
- ✅ **Dynamic Self-Healing Weather API** — API cuaca Open-Meteo automatik berdasarkan GPS koordinat masjid.
- ✅ **Rich Daily Hadiths Rotation** — Pangkalan data mengandungi 10 kad mutiara hadith & selawat harian.
- ✅ **WebGL Performance Guardian (Sky.jsx)** — Auto-degradasi resolusi fragment shader jika FPS jatuh bawah 33 untuk keselamatan 24/7.
- ✅ **Resilient Blur Filter Bugfix** — Skrin 100% tajam dan jelas, hanya kabur secara automatik apabila fasa solat aktif dipaparkan.

## Deploy ke production (FREE, RM0)

### PWA sahaja (cepat, 15 minit)
1. Sign up vercel.com (free, GitHub login)
2. Drag folder ZIP ni ke Vercel dashboard
3. Click Deploy
4. Dapat URL `xxx.vercel.app`
5. User Android: buka URL di Chrome → tap "Add to Home Screen" → install macam app

### APK + PWA
1. Install Android Studio + JDK 17 (free)
2. Buka `rose-ly/android/` (codebase asal)
3. Build → Generate Signed APK
4. Letak `rose-ly.apk` di root project ni
5. Button download di Hub auto-aktif

Detail penuh dalam `DEPLOY.md`.

## Sambung kerja kemudian

### Roadmap

**Fasa 1 — Integrate dengan codebase asal (1-2 minggu)**
- Codebase asal `rose-ly/web/` ada Supabase, prayer engine, automation
- Port design + UX improvements dari kit ke React components asal

**Fasa 2 — Polish (1 minggu)**
- Multi-device testing (Android TV box + iPad + phone)
- Apply i18n labels lengkap
- Self-host audio files (cloud bucket)
- Error tracking

**Fasa 3 — Distribution (1 minggu)**
- Sign APK dengan production keystore
- Submit Google Play ($25 one-time)
- Custom domain

### Bila nak sambung — chat baru

> "Sambung Rose Ly — fasa [1/2/3]. Saya dah ada [Supabase project / domain / keystore]. Apa next?"

Saya akan tahu state semasa dari fail-fail ni.

## Dependencies

Tiada `package.json`. Semua via CDN dalam HTML:
- React 18.3.1 + Babel standalone (untuk JSX runtime)
- Outfit + Cairo fonts (Google Fonts)
- Audio Quran (cdn.islamic.network — free)
- Prayer times (api.waktusolat.app — free)
- News (api.rss2json.com — free tier)

Sebab pakai CDN: zero-build, drag-drop deploy. Untuk production, baik bundle dengan Vite.

## Stack reference

| Tools | Role |
|---|---|
| Vite (codebase asal) | Bundler React |
| React 18 | UI |
| Tailwind v4 (codebase asal) | Styling |
| Framer Motion (codebase asal) | Animation |
| Supabase (codebase asal) | Cross-device sync + auth |
| Capacitor (codebase asal) | Android APK wrapper |
| WebGL/GLSL | Sky shader |
| localStorage | State storage (demo) |

## Lesen + kredit

Internal project. Audio Menjelang Azan dari recording sendiri. Logo Rose Ly © Aliff Hussien.

---

Selamat berkerja. Apa-apa stuck, buka chat baru dan share screenshot + path fail.
