/* Rose Ly — auto-filler for ticker.
 * When the admin's notice list is empty, this pulls rotating Islamic reminders
 * from the existing hadith library (shipped in tokens.js) so the TV ticker
 * always has something dignified to show — no external news API required.
 *
 * Reasoning: mosques don't want random unreviewed news in their footer.
 * Notices controlled by imam = source of truth. Hadith reminders = quiet fallback.
 */
(function () {
  function getTickerItems() {
    const profile = window.RL_STATE?.loadProfile() || {};
    const notices = (profile.notices || []).filter(Boolean);
    if (notices.length > 0) {
      return notices.map(t => ({ source: 'MAKLUMAN', title: t }));
    }
    // Fallback to rotating hadith reminders
    const pool = (window.RL?.hadiths) || [];
    if (pool.length === 0) return [];
    const today = new Date().toDateString();
    let seed = 0;
    for (const c of today) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
    const rotation = [];
    for (let i = 0; i < Math.min(6, pool.length); i++) {
      const h = pool[(seed + i) % pool.length];
      rotation.push({ source: 'HIKMAH', title: h.text || h.content });
    }
    return rotation;
  }
  window.RL_TICKER = { getTickerItems };
})();
