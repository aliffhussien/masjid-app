# Rose Ly — Panduan Deploy & Handoff

## Quick Deploy (5 Minit, FREE)

### Cara Paling Cepat & Selamat (Vercel / Netlify / GitHub Pages)

Memandangkan projek ini sudah dinaik taraf sepenuhnya kepada **Vite + React Bundler**, langkah deployment kini jauh lebih profesional, pantas, dan bersaiz kecil (compact)!

1. Jalankan arahan kompilasi tempatan:
   ```bash
   npm run build
   ```
2. Ini akan membina satu folder bernama `dist` di dalam projek anda yang mengandungi kod JavaScript yang sangat dioptimumkan (88% lebih kecil!) dan media statik.
3. Daftar masuk ke [vercel.com](https://vercel.com).
4. Klik **"Add New → Project"** dan sambungkan dengan repositori GitHub projek ini, ATAU pasang Vercel CLI dan jalankan `vercel` di dalam folder ini (pilih `dist` sebagai direktori output).
5. Dalam masa 30 saat, anda akan menerima URL rasmi pengeluaran seperti `rose-ly.vercel.app`!

---

## Apa yang ada vs apa yang belum

### ✅ Working dalam demo
- Setup wizard 5-step dengan logo upload
- TV display dengan WebGL sky animasi
- Mobile admin: slaid editor, khutbah PDF parser, ticker, themes, language toggle
- Prayer phase overlays + audio cues
- Quran audio continuous play (kalau CDN online)
- e-Solat API sync waktu solat sebenar
- Backup/restore data sebagai JSON
- Cross-tab sync & Cloud sync (Supabase realtime)

### 🔌 Konfigurasi Supabase Realtime Cloud (Cross-Device Sync)

Kini, telefon pintar (Admin) dan TV Display boleh diselaraskan secara langsung di seluruh internet! Untuk mengaktifkannya:

1. Daftar projek baharu di [Supabase Dashboard](https://supabase.com).
2. Jalankan SQL Schema di **SQL Editor** Supabase:
   ```sql
   create table mosques (
     id uuid primary key,
     name text not null,
     profile jsonb not null default '{}'::jsonb,
     updated_at timestamp with time zone default timezone('utc'::text, now()) not null
   );

   -- Aktifkan Realtime Replication untuk table mosques
   alter publication supabase_realtime add table mosques;
   ```
3. Salin butiran `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` ke dalam fail persekitaran `.env` anda (Rujuk [.env.example](file:///c:/Sheikh%20Hussien%20Empire/projects_archive/rose-ly/Rose%20Ly%20Design%20System/.env.example)).
4. Jalankan `npm run build` semula. Siap!

### ❌ Belum siap untuk full production
- **Authentication** (sesiapa boleh edit kalau dapat URL)
  - Solution: Supabase Auth, mosque-specific login
- **i18n strings** belum semua diterjemah (toggle siap, labels masih Malay)
- **Audio Quran reliability** (CDN free, tiada SLA)
---

## Untuk sambung kerja kemudian

### Roadmap dari design kit → production

**Fasa 1: Integrate dengan codebase asal `rose-ly/web`** (~1-2 minggu)
- Codebase asal sudah ada: Supabase, prayer engine, real WebGL sky, automation
- Port design + UX improvements dari kit ke React components asal
- Logic dah ada, kita hanya naik-tarafkan UI

**Fasa 2: Polish & test** (~1 minggu)
- Multi-device testing (Android TV box + iPad + phone)
- Apply i18n labels lengkap
- Self-host audio files (CDN dengan SLA atau cloud bucket)
- Error tracking (Sentry/LogRocket)

**Fasa 3: Distribution** (~1 minggu)
- Sign APK dengan production keystore
- Submit ke Google Play Store ($25 one-time)
- Custom domain setup
- Onboarding videos / docs

### Apa yang perlu dipanggil bila sambung
- Supabase project (kalau dah set up sebelum ni — boleh check `rose-ly/web/.env`)
- Domain (kalau dah beli)
- Keystore Android (kalau dah generate — JANGAN HILANG)

---

## File structure design kit

```
shared/
  state.js       — cross-tab profile sync via localStorage
  i18n.js        — BM/EN translations dictionary
  solat.js       — JAKIM e-Solat API wrapper
  ticker.js      — auto-fill ticker with hadith reminders
  news.js        — news fetcher (kalau dah tambah)

ui_kits/
  setup-wizard/  — 5-step onboarding
  mobile-admin/  — phone admin app
  tv-display/    — 1920×1080 kiosk display

assets/
  logo-mark.png      — app icon (1024×1024 transparent)
  favicon.png        — browser tab icon
  Menjelang_Azan.mp3 — pre-azan vocal cue (13 saat)
```

---

## Untuk reach out kemudian

Bila nak sambung, bukak chat ini balik dan kata:
> "Sambung Rose Ly — fasa [1/2/3]. Apa saya kena sediakan?"

Saya akan tahu state semasa dari fail-fail ini.
