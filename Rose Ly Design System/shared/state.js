/* Rose Ly — shared state across kits.
 * One file, included from every kit, so the hub, wizard, admin, and TV display
 * all read/write the same mosque profile from localStorage and sync to Supabase Realtime Cloud!
 *
 * Local-First, Cloud-Synced architecture. Falls back safely to offline localStorage if cloud config is not set.
 */
import { createClient } from '@supabase/supabase-js';

(function () {
  const KEY = 'rl-profile-v1';
  const DEFAULT_PROFILE = {
    mosqueId:      null, // Generated dynamically on first load if missing
    mosqueName:    'Masjid Al-Falah',
    mosqueAddress: 'Kampung Baru, Kuala Lumpur',
    logoUrl:       null,
    zone:          'WLY01',
    zoneLabel:     'Kuala Lumpur, Putrajaya',
    setupComplete: false,
    theme:         'rose',
  };

  // Safe UUID generator for mosque identity
  function generateUUID() {
    try {
      if (crypto && crypto.randomUUID) return crypto.randomUUID();
    } catch (e) {}
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Supabase Client Initialization (Reads from Vite env or global window variables)
  let supabase = null;
  const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || window.VITE_SUPABASE_URL || '';
  const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || window.VITE_SUPABASE_ANON_KEY || '';

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('📡 Rose Ly Cloud Sync: Supabase Realtime Client Connected.');
    } catch (e) {
      console.warn('⚠️ Rose Ly Cloud Sync: Gagal memulakan Supabase client:', e);
    }
  } else {
    console.log('🏠 Rose Ly Cloud Sync: Mod Local-First aktif (Tiada pembolehubah persekitaran Supabase dikesan).');
  }

  function readRaw() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  function loadProfile() {
    const raw = readRaw() || {};
    // Auto-generate UUID if missing to ensure distinct mosque identity
    if (!raw.mosqueId) {
      raw.mosqueId = generateUUID();
      try { localStorage.setItem(KEY, JSON.stringify(Object.assign({}, DEFAULT_PROFILE, raw))); } catch (e) {}
    }
    return Object.assign({}, DEFAULT_PROFILE, raw);
  }

  function saveProfile(partial) {
    const next = Object.assign(loadProfile(), partial || {});
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch (e) {}
    
    // Broadcast locally in same browser tab & cross-tab
    try {
      window.dispatchEvent(new CustomEvent('rl-profile-change', { detail: next }));
    } catch (e) {}

    // Cloud Sync: Background Postgres Upsert
    if (supabase && next.mosqueId) {
      supabase
        .from('mosques')
        .upsert({
          id: next.mosqueId,
          name: next.mosqueName,
          profile: next,
          updated_at: new Date().toISOString()
        })
        .then(({ error }) => {
          if (error) {
            console.error('⚠️ Rose Ly Cloud Sync: Gagal menulis data ke Supabase:', error);
          } else {
            console.log('📡 Rose Ly Cloud Sync: Profil berjaya diselaraskan ke database cloud.');
          }
        });
    }
    return next;
  }

  function resetProfile() {
    const freshId = generateUUID();
    const freshProfile = Object.assign({}, DEFAULT_PROFILE, { mosqueId: freshId });
    try { localStorage.setItem(KEY, JSON.stringify(freshProfile)); } catch (e) {}
    try { localStorage.removeItem('rl-mosque-logo'); } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent('rl-profile-change', { detail: freshProfile }));
    } catch (e) {}
    return freshProfile;
  }

  /** React hook — call as `RL_STATE.useProfile()` after React is loaded. */
  function useProfile() {
    const R = window.React;
    if (!R) throw new Error('React not loaded yet');
    const [profile, setProfile] = R.useState(loadProfile);
    
    R.useEffect(() => {
      const onChange = (e) => setProfile(e.detail || loadProfile());
      const onStorage = (e) => { if (e.key === KEY) setProfile(loadProfile()); };
      window.addEventListener('rl-profile-change', onChange);
      window.addEventListener('storage', onStorage);
      return () => {
        window.removeEventListener('rl-profile-change', onChange);
        window.removeEventListener('storage', onStorage);
      };
    }, []);
    return [profile, (partial) => { setProfile(saveProfile(partial)); }];
  }

  // Realtime Cloud Pull: Subscribe to Supabase Realtime channel for this specific mosque ID
  let activeSubscription = null;
  function subscribeToRealtime(mosqueId) {
    if (!supabase || !mosqueId || activeSubscription) return;

    activeSubscription = supabase
      .channel(`mosque-${mosqueId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'mosques',
        filter: `id=eq.${mosqueId}`
      }, payload => {
        if (payload.new && payload.new.profile) {
          const remote = payload.new.profile;
          const local = loadProfile();
          // Only update if there are real changes
          if (JSON.stringify(remote) !== JSON.stringify(local)) {
            console.log('📡 Rose Ly Cloud Sync: Menerima perubahan profil daripada cloud. Mengemas kini paparan...');
            try { localStorage.setItem(KEY, JSON.stringify(remote)); } catch (e) {}
            try {
              window.dispatchEvent(new CustomEvent('rl-profile-change', { detail: remote }));
            } catch (e) {}
          }
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`📡 Rose Ly Cloud Sync: Berjaya melanggan saluran realtime untuk Masjid ID: ${mosqueId}`);
        }
      });
  }

  // Initial load sync trigger
  const initProfile = loadProfile();
  if (initProfile.mosqueId) {
    // Wait a brief tick for browser load before setting up realtime listener
    setTimeout(() => subscribeToRealtime(initProfile.mosqueId), 100);
  }

  // Legacy migration — pull old `rl-mosque-logo` key into profile on first load
  (function migrate() {
    try {
      const legacy = localStorage.getItem('rl-mosque-logo');
      const cur = readRaw();
      if (legacy && (!cur || !cur.logoUrl)) {
        saveProfile({ logoUrl: legacy });
      }
    } catch (e) {}
  })();

  // Fetch a mosque's profile from Supabase and write it into localStorage.
  // Called by the admin app when it is opened via a pairing QR code.
  async function fetchProfileFromCloud(mosqueId) {
    if (!supabase || !mosqueId) return false;
    try {
      const { data, error } = await supabase
        .from('mosques')
        .select('profile')
        .eq('id', mosqueId)
        .maybeSingle();
      if (error || !data?.profile) return false;
      const remote = data.profile;
      try { localStorage.setItem(KEY, JSON.stringify(remote)); } catch {}
      try {
        window.dispatchEvent(new CustomEvent('rl-profile-change', { detail: remote }));
      } catch {}
      return true;
    } catch { return false; }
  }

  window.RL_STATE = { loadProfile, saveProfile, resetProfile, useProfile, fetchProfileFromCloud, isCloudSynced: !!supabase, KEY };

  // Apply theme CSS variables whenever profile changes — single source of truth.
  const THEMES = {
    rose:    { accent: '#f43f5e', dark: '#e11d48', light: '#fb7185', soft: '#fda4af', glow: 'rgba(244,63,94,0.4)', dim: 'rgba(244,63,94,0.15)', edge: 'rgba(244,63,94,0.30)', shadow: 'rgba(76,5,25,0.6)' },
    emerald: { accent: '#10b981', dark: '#059669', light: '#34d399', soft: '#6ee7b7', glow: 'rgba(16,185,129,0.4)', dim: 'rgba(16,185,129,0.15)', edge: 'rgba(16,185,129,0.30)', shadow: 'rgba(2,44,34,0.6)' },
    blue:    { accent: '#3b82f6', dark: '#2563eb', light: '#60a5fa', soft: '#93c5fd', glow: 'rgba(59,130,246,0.4)', dim: 'rgba(59,130,246,0.15)', edge: 'rgba(59,130,246,0.30)', shadow: 'rgba(23,37,84,0.6)' },
    amber:   { accent: '#f59e0b', dark: '#d97706', light: '#fbbf24', soft: '#fcd34d', glow: 'rgba(245,158,11,0.4)', dim: 'rgba(245,158,11,0.15)', edge: 'rgba(245,158,11,0.30)', shadow: 'rgba(69,26,3,0.6)' },
    mono:    { accent: '#9ca3af', dark: '#71717a', light: '#d1d5db', soft: '#e5e7eb', glow: 'rgba(156,163,175,0.4)', dim: 'rgba(156,163,175,0.15)', edge: 'rgba(156,163,175,0.30)', shadow: 'rgba(24,24,27,0.6)' },
  };

  function applyTheme(t) {
    const cfg = THEMES[t] || THEMES.rose;
    const root = document.documentElement.style;
    root.setProperty('--rl-accent',       cfg.accent);
    root.setProperty('--rl-accent-dark',  cfg.dark);
    root.setProperty('--rl-accent-light', cfg.light);
    root.setProperty('--rl-accent-soft',  cfg.soft);
    root.setProperty('--rl-accent-glow',  cfg.glow);
    root.setProperty('--rl-accent-dim',   cfg.dim);
    root.setProperty('--rl-accent-edge',  cfg.edge);
    root.setProperty('--rl-accent-shadow',cfg.shadow);
  }

  // Apply on load
  try { applyTheme(loadProfile().theme); } catch {}
  // Reapply on every profile change
  window.addEventListener('rl-profile-change', e => { try { applyTheme(e.detail?.theme); } catch {} });
  window.addEventListener('storage', e => { if (e.key === KEY) { try { applyTheme(loadProfile().theme); } catch {} } });
})();
