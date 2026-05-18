---
name: rose-ly-design
description: Use this skill to generate well-branded interfaces and assets for Rose Ly — a Malaysian mosque (masjid) TV display + mobile admin product. Contains essential design guidelines, colors, typography, fonts, assets, and UI kit components for prototyping kiosk screens, mobile admin views, and slide decks in the Rose Ly visual language.
user-invocable: true
---

Read the `README.md` file within this skill first — it covers product context, content fundamentals (Bahasa Melayu primary, English fallback), visual foundations (glass panels, big rounded corners, rose/emerald accents, WebGL sky cinematics), and iconography. Then explore the other available files: `colors_and_type.css` for tokens, `ui_kits/` for component recreations, `assets/` for the brand mark + favicon + pre-azan audio cue.

Key things to know:
- **Two surfaces**: TV kiosk (1920×1080, rose accent) and Mobile Admin (phone-first, emerald accent).
- **Language**: Bahasa Melayu is primary. Religious-register copy stays formal; admin chrome is short, brutal, UPPERCASE with `tracking-widest`.
- **Typography**: Outfit (display, weight 900 default), Cairo (Arabic), JetBrains Mono (mono).
- **Iconography**: inline heroicons-style stroke SVGs at `strokeWidth=2.5`. Emoji is used in admin tooling only. Weather glyphs are emoji.
- **Motifs**: glass panels with `40px` radius over a WebGL sky; `vfx-grain` + `vfx-vignette` always-on; `drop-shadow` everywhere for legibility; `tabular-nums` on every number.

If creating visual artifacts (slides, mocks, throwaway prototypes), **copy assets out** of this skill folder into your project and create static HTML files. Reference the UI kit components for accurate cosmetic detail rather than recreating them from scratch.

If working on production code, copy assets and read the rules here to become an expert in designing with the Rose Ly brand. The codebase uses React 19 + Vite + Tailwind v4 + Framer Motion — match those conventions.

If the user invokes this skill without any other guidance, ask them what they want to build (a new TV slide layout? a new admin tab? a marketing page? a deck?), ask 4–6 clarifying questions about audience/tone/length/variations, and then act as an expert designer who outputs HTML artifacts *or* production-style JSX, depending on the need.
