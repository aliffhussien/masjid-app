/* Rose Ly — shared state.
 *
 * Sync strategy: Supabase Realtime BROADCAST.
 * ─────────────────────────────────────────────────────────────────────────────
 * Broadcast requires ZERO table creation, ZERO SQL, ZERO dashboard setup.
 * It works with just VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.
 * Both TV and Admin join the same channel `rl-<mosqueId>`.
 * When admin saves → broadcasts full profile → TV receives → applies instantly.
 * When admin first connects → sends `req` → TV responds with full profile.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { createClient } from '@supabase/supabase-js';

(function () {
  const KEY = 'rl-profile-v1';
  const DEFAULT_PROFILE = {
    mosqueId:      null,
    mosqueName:    'Masjid Al-Falah',
    mosqueAddress: 'Kampung Baru, Kuala Lumpur',
    logoUrl:       null,
    zone:          'WLY01',
    zoneLabel:     'Kuala Lumpur, Putrajaya',
    setupComplete: false,
    theme:         'rose',
  };

  function generateUUID() {
    try { if (crypto?.randomUUID) return crypto.randomUUID(); } catch {}
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // ── Supabase init ──────────────────────────────────────────────────────────
  let supabase = null;
  const SUPABASE_URL     = import.meta.env?.VITE_SUPABASE_URL     || '';
  const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
      console.warn('Rose Ly: gagal init Supabase', e);
    }
  }

  // ── localStorage helpers ───────────────────────────────────────────────────
  function readRaw() {
    try { const r = localStorage.getItem(KEY); return r ? JSON.parse(r) : null; }
    catch { return null; }
  }

  function loadProfile() {
    const raw = readRaw() || {};
    if (!raw.mosqueId) {
      raw.mosqueId = generateUUID();
      try { localStorage.setItem(KEY, JSON.stringify(Object.assign({}, DEFAULT_PROFILE, raw))); } catch {}
    }
    return Object.assign({}, DEFAULT_PROFILE, raw);
  }

  // ── Broadcast channel ──────────────────────────────────────────────────────
  // One channel per mosque. Carries two events:
  //   'sync' — stripped profile payload, applied by all listeners
  //   'req'  — request for the current profile (admin sends on join; TV responds)
  let ch = null;

  // Fields that change frequently (every slide tick) or are too large to broadcast.
  // These are kept local only; only real admin-level changes cross devices.
  const SKIP_BROADCAST = new Set([
    'activeSlideIdx', 'slidePaused', 'prayerTimesSync',
    'logoUrl',          // base64 data-URL can be 200KB — never broadcast
  ]);

  function stripForBroadcast(profile) {
    return Object.fromEntries(
      Object.entries(profile).filter(([k]) => !SKIP_BROADCAST.has(k))
    );
  }

  function applyIncoming(data) {
    if (!data) return;
    // Merge: remote wins on settings; local-only fields (PIN, logo, slideIdx) kept
    const current = readRaw() || {};
    const merged  = { ...current, ...data };
    try { localStorage.setItem(KEY, JSON.stringify(merged)); } catch {}
    try { window.dispatchEvent(new CustomEvent('rl-profile-change', { detail: merged })); } catch {}
  }

  // Debounced broadcast — max once per 600ms to avoid hammering the phone
  // every time the TV auto-advances a slide (every 8s).
  let _bTimer = null;
  function broadcast(profile) {
    if (!ch) return;
    clearTimeout(_bTimer);
    _bTimer = setTimeout(() => {
      const payload = stripForBroadcast(profile);
      ch.send({ type: 'broadcast', event: 'sync', payload: { d: payload } }).catch(() => {});
    }, 600);
  }

  function setupChannel(mosqueId) {
    if (!supabase || !mosqueId) return;
    if (ch) { try { supabase.removeChannel(ch); } catch {} ch = null; }

    const isAdmin = window.location.pathname.includes('mobile-admin');

    ch = supabase
      .channel(`rl-${mosqueId}`, { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'sync' }, ({ payload }) => applyIncoming(payload?.d))
      .on('broadcast', { event: 'req'  }, () => {
        // Any device that has good data can respond — TV usually does
        broadcast(loadProfile());
      })
      .subscribe(status => {
        if (status !== 'SUBSCRIBED') return;
        if (isAdmin) {
          // Ask TV for its current full profile
          setTimeout(() => {
            ch.send({ type: 'broadcast', event: 'req', payload: {} }).catch(() => {});
          }, 400);
        }
      });
  }

  // ── Core API ───────────────────────────────────────────────────────────────
  function saveProfile(partial) {
    const next = Object.assign(loadProfile(), partial || {});
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    try { window.dispatchEvent(new CustomEvent('rl-profile-change', { detail: next })); } catch {}
    broadcast(next);   // push to all other devices instantly
    return next;
  }

  function resetProfile() {
    const fresh = Object.assign({}, DEFAULT_PROFILE, { mosqueId: generateUUID() });
    try { localStorage.setItem(KEY, JSON.stringify(fresh)); } catch {}
    try { localStorage.removeItem('rl-mosque-logo'); } catch {}
    try { window.dispatchEvent(new CustomEvent('rl-profile-change', { detail: fresh })); } catch {}
    setupChannel(fresh.mosqueId);
    return fresh;
  }

  function useProfile() {
    const R = window.React;
    if (!R) throw new Error('React not loaded yet');
    const [profile, setProfile] = R.useState(loadProfile);
    R.useEffect(() => {
      const onChange  = e  => setProfile(e.detail || loadProfile());
      const onStorage = e  => { if (e.key === KEY) setProfile(loadProfile()); };
      window.addEventListener('rl-profile-change', onChange);
      window.addEventListener('storage',           onStorage);
      return () => {
        window.removeEventListener('rl-profile-change', onChange);
        window.removeEventListener('storage',           onStorage);
      };
    }, []);
    return [profile, partial => { setProfile(saveProfile(partial)); }];
  }

  // fetchProfileFromCloud — kept for API compatibility; now just requests via broadcast
  async function fetchProfileFromCloud(mosqueId) {
    if (!supabase || !mosqueId) return false;
    return new Promise(resolve => {
      // Listen for the response broadcast
      const timeout = setTimeout(() => resolve(false), 4000);
      const handler = e => {
        clearTimeout(timeout);
        window.removeEventListener('rl-profile-change', handler);
        resolve(true);
      };
      window.addEventListener('rl-profile-change', handler);
      // Send request
      if (ch) {
        ch.send({ type: 'broadcast', event: 'req', payload: {} }).catch(() => {
          clearTimeout(timeout);
          window.removeEventListener('rl-profile-change', handler);
          resolve(false);
        });
      } else {
        clearTimeout(timeout);
        window.removeEventListener('rl-profile-change', handler);
        resolve(false);
      }
    });
  }

  // ── PIN discovery ──────────────────────────────────────────────────────────
  // TV generates a fresh 4-digit PIN each session, joins a shared 'rl-discover'
  // channel, and responds to 'find:<pin>' requests with its full profile.
  // Admin sends 'find:<pin>' and waits for 'found:<pin>' with the profile.
  // No table, no QR, no camera — works on every device instantly.
  let discoverCh = null;
  const SESSION_PIN_KEY = 'rl-session-pin';

  function getSessionPin() {
    let pin = sessionStorage.getItem(SESSION_PIN_KEY);
    if (!pin) {
      pin = String(Math.floor(1000 + Math.random() * 9000));
      sessionStorage.setItem(SESSION_PIN_KEY, pin);
    }
    return pin;
  }

  let _discoverCleanupTimer = null;
  function setupDiscovery() {
    if (!supabase) return;
    if (discoverCh) return; // already open
    discoverCh = supabase
      .channel('rl-discover', { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'find' }, ({ payload }) => {
        if (payload?.pin !== getSessionPin()) return;
        const stripped = stripForBroadcast(loadProfile());
        // Include mosqueId in response even though it's not in SKIP_BROADCAST
        stripped.mosqueId = loadProfile().mosqueId;
        discoverCh.send({
          type: 'broadcast', event: 'found',
          payload: { pin: payload.pin, profile: loadProfile() },
        }).catch(() => {});
      })
      .subscribe();
  }

  function closeDiscovery() {
    if (!discoverCh || !supabase) return;
    try { supabase.removeChannel(discoverCh); } catch {}
    discoverCh = null;
  }

  async function findMosqueByPin(pin) {
    if (!supabase || !pin) return null;
    if (!discoverCh) setupDiscovery();
    return new Promise(resolve => {
      const done = (result) => {
        clearTimeout(timeout);
        // Close discovery channel 3s after pairing — no longer needed
        clearTimeout(_discoverCleanupTimer);
        _discoverCleanupTimer = setTimeout(closeDiscovery, 3000);
        resolve(result);
      };
      const timeout = setTimeout(() => done(null), 8000);

      const onFound = ({ payload }) => {
        if (payload?.pin !== pin || !payload?.profile) return;
        discoverCh.off('broadcast', { event: 'found' }, onFound);
        done(payload.profile);
      };
      discoverCh.on('broadcast', { event: 'found' }, onFound);
      discoverCh.send({ type: 'broadcast', event: 'find', payload: { pin } })
        .catch(() => done(null));
    });
  }

  // ── Init ───────────────────────────────────────────────────────────────────
  const initProfile = loadProfile();
  setTimeout(() => {
    setupChannel(initProfile.mosqueId);
    setupDiscovery(); // always join discovery so TV can respond to PIN requests
  }, 50);

  // Legacy logo migration
  try {
    const legacy = localStorage.getItem('rl-mosque-logo');
    const cur    = readRaw();
    if (legacy && (!cur || !cur.logoUrl)) saveProfile({ logoUrl: legacy });
  } catch {}

  window.RL_STATE = {
    loadProfile,
    saveProfile,
    resetProfile,
    useProfile,
    fetchProfileFromCloud,
    setupChannel,
    findMosqueByPin,
    getSessionPin,
    isCloudSynced: !!supabase,
    KEY,
  };

  // ── Theme ──────────────────────────────────────────────────────────────────
  const THEMES = {
    rose:    { accent:'#f43f5e', dark:'#e11d48', light:'#fb7185', soft:'#fda4af', glow:'rgba(244,63,94,0.4)',   dim:'rgba(244,63,94,0.15)',   edge:'rgba(244,63,94,0.30)',   shadow:'rgba(76,5,25,0.6)'   },
    emerald: { accent:'#10b981', dark:'#059669', light:'#34d399', soft:'#6ee7b7', glow:'rgba(16,185,129,0.4)',  dim:'rgba(16,185,129,0.15)',  edge:'rgba(16,185,129,0.30)',  shadow:'rgba(2,44,34,0.6)'   },
    blue:    { accent:'#3b82f6', dark:'#2563eb', light:'#60a5fa', soft:'#93c5fd', glow:'rgba(59,130,246,0.4)',  dim:'rgba(59,130,246,0.15)',  edge:'rgba(59,130,246,0.30)',  shadow:'rgba(23,37,84,0.6)'  },
    amber:   { accent:'#f59e0b', dark:'#d97706', light:'#fbbf24', soft:'#fcd34d', glow:'rgba(245,158,11,0.4)',  dim:'rgba(245,158,11,0.15)',  edge:'rgba(245,158,11,0.30)',  shadow:'rgba(69,26,3,0.6)'   },
    mono:    { accent:'#9ca3af', dark:'#71717a', light:'#d1d5db', soft:'#e5e7eb', glow:'rgba(156,163,175,0.4)', dim:'rgba(156,163,175,0.15)', edge:'rgba(156,163,175,0.30)', shadow:'rgba(24,24,27,0.6)'  },
  };

  function applyTheme(t) {
    const cfg = THEMES[t] || THEMES.rose;
    const s   = document.documentElement.style;
    s.setProperty('--rl-accent',        cfg.accent);
    s.setProperty('--rl-accent-dark',   cfg.dark);
    s.setProperty('--rl-accent-light',  cfg.light);
    s.setProperty('--rl-accent-soft',   cfg.soft);
    s.setProperty('--rl-accent-glow',   cfg.glow);
    s.setProperty('--rl-accent-dim',    cfg.dim);
    s.setProperty('--rl-accent-edge',   cfg.edge);
    s.setProperty('--rl-accent-shadow', cfg.shadow);
  }

  try { applyTheme(loadProfile().theme); } catch {}
  window.addEventListener('rl-profile-change', e => { try { applyTheme(e.detail?.theme); } catch {} });
  window.addEventListener('storage',           e => { if (e.key === KEY) { try { applyTheme(loadProfile().theme); } catch {} } });
})();
