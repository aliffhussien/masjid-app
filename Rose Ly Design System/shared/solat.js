/* Rose Ly — e-Solat API helper.
 * Pulls real prayer times for a Malaysian JAKIM zone code.
 * Caches per-day in localStorage so we hit the network once a day.
 *
 * Usage:
 *   const times = await window.RL_SOLAT.fetchToday('WLY01');
 *   // → { Imsak:'05:40', Subuh:'05:50', Syuruk:'07:05', Zohor:'13:15', Asar:'16:35', Maghrib:'19:22', Isyak:'20:35' }
 */
(function () {
  const CACHE_KEY = 'rl-solat-cache-v1';
  const FALLBACK = {
    Imsak:   '05:40',
    Subuh:   '05:50',
    Syuruk:  '07:05',
    Zohor:   '13:15',
    Asar:    '16:35',
    Maghrib: '19:22',
    Isyak:   '20:35',
  };

  const todayKey = () => new Date().toISOString().slice(0, 10);

  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
    catch { return {}; }
  }
  function writeCache(obj) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(obj)); } catch {}
  }

  function hhmm(t) {
    if (!t && t !== 0) return null;
    // Handle Unix timestamp (seconds or ms) — API sometimes returns epoch
    const n = Number(t);
    if (!isNaN(n) && String(t).indexOf(':') === -1) {
      const d = new Date(n > 1e10 ? n : n * 1000); // seconds → ms if needed
      if (!isNaN(d.getTime())) {
        return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
      }
    }
    // Handle "HH:MM" or "H:MM:SS"
    const parts = String(t).split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }

  async function fetchToday(zone = 'WLY01') {
    const key = `${zone}|${todayKey()}`;
    const cache = readCache();
    if (cache[key]) return cache[key];

    // Try the public e-Solat endpoint (waktusolat.app proxies JAKIM and returns JSON).
    // Falls back to FALLBACK on failure — never throws.
    try {
      const res = await fetch(`https://api.waktusolat.app/v2/solat/${encodeURIComponent(zone)}`, {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error('http ' + res.status);
      const json  = await res.json();
      const today = json?.prayers?.find(p => p?.day === new Date().getDate());
      if (!today) throw new Error('no entry for today');
      const out = {
        Imsak:   hhmm(today.imsak)   || FALLBACK.Imsak,
        Subuh:   hhmm(today.fajr)    || FALLBACK.Subuh,
        Syuruk:  hhmm(today.syuruk)  || FALLBACK.Syuruk,
        Zohor:   hhmm(today.dhuhr)   || FALLBACK.Zohor,
        Asar:    hhmm(today.asr)     || FALLBACK.Asar,
        Maghrib: hhmm(today.maghrib) || FALLBACK.Maghrib,
        Isyak:   hhmm(today.isha)    || FALLBACK.Isyak,
      };
      cache[key] = out;
      // Trim cache to current day only
      const trimmed = {};
      Object.keys(cache).forEach(k => { if (k.endsWith('|' + todayKey())) trimmed[k] = cache[k]; });
      writeCache(trimmed);
      return out;
    } catch (e) {
      // Silent fallback — caller sees something sensible.
      return FALLBACK;
    }
  }

  function clearCache() {
    try { localStorage.removeItem(CACHE_KEY); } catch {}
  }

  window.RL_SOLAT = { fetchToday, clearCache, FALLBACK };
})();
