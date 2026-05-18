/* Rose Ly — news fetcher.
 * Pulls free RSS feeds via rss2json (10k req/day free).
 * Caches 30 minutes in localStorage so we hit the API ~48× per device per day.
 * Falls back to hadith reminders if the API is down.
 */
(function () {
  const CACHE_KEY = 'rl-news-cache-v1';
  const CACHE_MIN = 30; // refresh every 30 minutes

  // Pick one or rotate — keeping a single feed reduces quota usage
  const FEEDS = [
    {
      label: 'BERNAMA',
      url: 'https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://www.bernama.com/bm/index.php/rss/rss.php?id=1'),
    },
  ];

  function readCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const c = JSON.parse(raw);
      if (Date.now() - (c.t || 0) > CACHE_MIN * 60 * 1000) return null;
      return c.items || null;
    } catch { return null; }
  }
  function writeCache(items) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), items })); } catch {}
  }

  async function fetchOnce(feed) {
    const res = await fetch(feed.url);
    if (!res.ok) throw new Error('http ' + res.status);
    const json = await res.json();
    if (!json.items) throw new Error('no items');
    return json.items.slice(0, 6).map(it => ({
      source: feed.label,
      title: (it.title || '').replace(/<[^>]+>/g, '').trim(),
    })).filter(it => it.title);
  }

  async function fetchNews() {
    const cached = readCache();
    if (cached) return cached;
    for (const feed of FEEDS) {
      try {
        const items = await fetchOnce(feed);
        if (items.length) {
          writeCache(items);
          return items;
        }
      } catch (e) { /* try next feed */ }
    }
    // All feeds failed → return null so caller can fall back to hadith
    return null;
  }

  window.RL_NEWS = { fetchNews };
})();
