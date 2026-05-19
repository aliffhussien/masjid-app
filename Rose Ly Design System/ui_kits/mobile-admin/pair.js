// pair.js — runs BEFORE state.js to bootstrap the phone with the TV's profile.
//
// The TV's QR now encodes all key fields in the URL:
//   ?mosque=<uuid>&n=<mosqueName>&z=<zone>&t=<theme>&a=<address>
//
// This means the phone gets the correct mosque name, zone, and theme
// IMMEDIATELY on first open — no Supabase needed for the initial setup.
// Supabase then handles ongoing real-time changes after that.
(function () {
  try {
    const p      = new URLSearchParams(window.location.search);
    const id     = p.get('mosque');
    if (!id || id.length < 8) return;

    const KEY    = 'rl-profile-v1';
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}');

    // Decode URL fields — these come directly from the TV's current profile
    const incoming = { mosqueId: id };
    if (p.get('n')) incoming.mosqueName    = decodeURIComponent(p.get('n'));
    if (p.get('a')) incoming.mosqueAddress = decodeURIComponent(p.get('a'));
    if (p.get('z')) incoming.zone          = p.get('z');
    if (p.get('t')) incoming.theme         = p.get('t');
    if (p.get('s')) incoming.setupComplete = p.get('s') === '1';

    // If already on this mosque AND the URL carries no extra data, nothing to do
    const hasNewData = p.has('n') || p.has('z') || p.has('t');
    if (stored.mosqueId === id && !hasNewData) return;

    // Merge: keep any local admin-only data (slides, notices, pinCode, etc.)
    // but overwrite mosque identity fields with what TV sent
    localStorage.setItem(KEY, JSON.stringify({ ...stored, ...incoming }));
  } catch {}
})();
