// pair.js — runs BEFORE state.js to apply the ?mosque=<uuid> URL parameter.
// When phone scans the TV's QR code it opens:
//   /ui_kits/mobile-admin/index.html?mosque=<tv-mosque-id>
// This module reads that param and writes it to localStorage so that state.js
// subscribes to the correct Supabase realtime channel on startup.
(function () {
  try {
    const param = new URLSearchParams(window.location.search).get('mosque');
    if (!param || param.length < 8) return;
    const KEY = 'rl-profile-v1';
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (raw.mosqueId === param) return; // already paired to this mosque
    // Write only the mosqueId so state.js will fetch the full profile from Supabase
    localStorage.setItem(KEY, JSON.stringify({ mosqueId: param }));
  } catch {}
})();
