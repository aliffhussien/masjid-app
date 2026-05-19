// pair.js — runs BEFORE state.js.
// Reads ?mosque=<id>&n=<name>&z=<zone>&t=<theme>&a=<addr>&s=<setup>
// from the pairing QR and bootstraps localStorage so state.js connects
// to the correct channel and shows the right mosque immediately.
(function () {
  try {
    const p  = new URLSearchParams(window.location.search);
    const id = p.get('mosque');
    if (!id || id.length < 8) return;

    const KEY    = 'rl-profile-v1';
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}');

    const incoming = { mosqueId: id };
    if (p.get('n')) incoming.mosqueName    = decodeURIComponent(p.get('n'));
    if (p.get('a')) incoming.mosqueAddress = decodeURIComponent(p.get('a'));
    if (p.get('z')) incoming.zone          = p.get('z');
    if (p.get('t')) incoming.theme         = p.get('t');
    if (p.get('s')) incoming.setupComplete = p.get('s') === '1';

    const hasNewData = p.has('n') || p.has('z') || p.has('t');
    if (stored.mosqueId === id && !hasNewData) return;

    // Merge: TV identity wins, keep any admin-only data (slides, notices, PIN, etc.)
    localStorage.setItem(KEY, JSON.stringify({ ...stored, ...incoming }));

    // Re-init the broadcast channel with the new mosqueId after state.js loads
    // (state.js exposes setupChannel for exactly this purpose)
    window.addEventListener('load', () => {
      try { window.RL_STATE?.setupChannel(id); } catch {}
    }, { once: true });
  } catch {}
})();
