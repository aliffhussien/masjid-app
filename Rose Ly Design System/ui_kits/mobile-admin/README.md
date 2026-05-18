# Rose Ly — Mobile Admin UI Kit

A high-fidelity recreation of the phone-first admin/remote panel.

## Files
- `index.html` — interactive demo. Tap between Setup / Remote / Kandungan / Tetapan in the bottom tab bar.
- `AdminShell.jsx` — header, ambient glow, sticky tab bar, mobile preview slot
- `RemoteTab.jsx` — live status bar, phase chips, transport (prev/play-pause/next), slide-duration quick-pick, feature toggles
- `KandunganTab.jsx` — slide list + add-slide CTA
- `TetapanTab.jsx` — settings groupings (mosque, prayer zone, cloud sync, theme picker)
- `LivePreview.jsx` — embedded TV-display thumbnail with the rose glow + LIVE indicator
- `MosqueIcon.jsx` — reusable rounded-emerald mosque-icon tile

## What's faithful, what's faked
**Faithful**: tab labels (Setup / Remote Control / Kandungan / Tetapan), Malay copy, phase grid (3-column with emoji), transport controls, slide list, mosque-name header, sync status indicator, emerald primary, ambient glow background, deep rounded corners (`rounded-3xl`).

**Faked (cosmetic only)**:
- No Supabase sync; status badge is a static value.
- Phase chips don't actually drive the LivePreview overlay (the kits live in separate iframes).
- Slide editor is a list view only — no file-upload flow.
- Setup tab is a stub view.

## Design width
Render at **412×900** (typical Android phone width × tall portrait). The shell scales the live preview tile inside.
