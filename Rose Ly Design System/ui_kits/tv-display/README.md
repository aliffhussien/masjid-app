# Rose Ly — TV Display UI Kit

A high-fidelity recreation of the 1920×1080 kiosk dashboard that runs in mosques.

## Files
- `index.html` — interactive demo. Use the bottom-right phase switcher to toggle Normal / Pre-Azan / Azan / Iqamah / Solat / Khutbah overlays. Tab between slides with the dots.
- `tokens.js` — shared color/spacing constants
- `Sky.jsx` — CSS gradient stand-in for the WebGL `RealitySky` shader (sun, stars, sea reflection)
- `TVHeader.jsx` — logo + hadith rotation + weather + Hijri date + analog/digital clock
- `PrayerSidebar.jsx` — next-prayer countdown + 7-prayer list with active glow row
- `MainStage.jsx` — slide engine: world-clock + announcement + poster variants
- `NewsTicker.jsx` — marquee ticker + brand stripe
- `PhaseOverlay.jsx` — full-screen Pre-Azan / Azan / Iqamah / Solat / Khutbah overlays

## What's faithful, what's faked
**Faithful**: layout grid, exact font weights & tracking, glass-panel chrome, rose accent, drop-shadow recipes, header anatomy, prayer-row sizing, ticker mechanics, full-screen overlay copy + sizing, grain + vignette VFX.

**Faked (cosmetic only)**:
- The WebGL/GLSL sky shader is replaced by a CSS gradient + radial glows + a static star field. The real shader supports time-of-day sun orbit and shooting stars; we don't.
- Weather data is hard-coded.
- The hadith carousel rotates client-side but pulls from a tiny inline list, not the full 100+ in the codebase.
- No Quran audio playback, no Azan automation engine, no Supabase sync.

## Design width
Render at **1920×1080**. The demo scales to fit any viewport.
