# Rose Ly — Setup Wizard

A first-run, GPS-driven onboarding flow for new mosques. Modern animated splash, 5 steps, ends with a friendly success ring.

## Files
- `index.html` — interactive demo. Auto-restarts after the Finish step.
- `Splash.jsx` — modern intro animation: glowing aubergine canvas, particle field, concentric rings radiating out behind the logo, glint sweep across the mark, then the wordmark + tagline reveal.
- `WizardSteps.jsx` — the five steps (Welcome → Searching → Results → Logo upload → Finish).

## The 5 steps
1. **Welcome.** Big rose-glow logo, "Cari Masjid Saya" CTA. Tappable "manual search" link below.
2. **Searching.** Pulsing radar rings + spinner; 1.8 s simulated GPS lookup.
3. **Results.** Five sample mosques, each with distance + zone code. Tap to select.
4. **Logo Upload.** Drag-and-drop / file picker, max 6 MB, compressed to 512 px WebP, saved to `localStorage` under `rl-mosque-logo` — same key the Mobile Admin uses, so they share state when previewed on the same origin.
5. **Finish.** Animated green check, then four micro-checklist items light up one by one.

## Design choices
- All steps live inside a single phone frame so the wizard looks at home alongside `mobile-admin/index.html`.
- Progress dots at the top — 5 dots, current one widens to a pill.
- Entry animation on each step: `rl-fadeUp` keyframe + spring-y `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- All copy in Bahasa Melayu, dignified register.

## Real production hookup (later)
- Replace the `SAMPLE_MOSQUES` constant with a real Overpass / Nominatim query (see `rose-ly/web/src/components/SetupWizard.jsx` for the exact API and zone-detection logic).
- Replace `localStorage` with the Supabase data store used by the rest of the app.
- Hand off to `MobileAdmin` (or `TVDisplay`) on Finish instead of restarting the wizard.
