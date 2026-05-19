/* Rose Ly — news fetcher.
 * Tries multiple Malaysian RSS feeds via rss2json (10k req/day free).
 * Caches 30 minutes. Falls back to mosque notices if all feeds fail.
 */
(function () {
  const CACHE_KEY = 'rl-news-cache-v1';
  const CACHE_MIN = 30;

  // Multiple feeds — tries in order until one returns results
  const FEEDS = [
    {
      label: 'AWANI',
      url: 'https://api.rss2json.com/v1/api.json?rss_url=' +
           encodeURIComponent('https://www.astroawani.com/rss.xml'),
    },
    {
      label: 'FMT',
      url: 'https://api.rss2json.com/v1/api.json?rss_url=' +
           encodeURIComponent('https://www.freemalaysiatoday.com/feed/'),
    },
    {
      label: 'MALAYMAIL',
      url: 'https://api.rss2json.com/v1/api.json?rss_url=' +
           encodeURIComponent('https://www.malaymail.com/feed'),
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
    const res = await fetch(feed.url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error('http ' + res.status);
    const json = await res.json();
    if (!json.items?.length) throw new Error('empty');
    return json.items.slice(0, 6).map(it => ({
      source: feed.label,
      title:  (it.title || '').replace(/<[^>]+>/g, '').trim(),
    })).filter(it => it.title);
  }

  async function fetchNews() {
    const cached = readCache();
    if (cached) return cached;
    for (const feed of FEEDS) {
      try {
        const items = await fetchOnce(feed);
        if (items.length) { writeCache(items); return items; }
      } catch { /* try next feed */ }
    }
    return null; // all failed — caller falls back to mosque notices
  }

  function clearCache() {
    try { localStorage.removeItem(CACHE_KEY); } catch {}
  }

  window.RL_NEWS = { fetchNews, clearCache };
})();
