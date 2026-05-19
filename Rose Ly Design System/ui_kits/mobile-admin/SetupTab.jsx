/* global React */
// SetupTab.jsx — mosque identity summary + sync status + quick navigation.

const { useState, useEffect, useRef } = React;

// ── TV Pairing screen ─────────────────────────────────────────────────────────
// Admin taps TV logo → TV shows 6-char static code → type it here → paired.
// Code is permanent (derived from mosqueId) — works even after TV restarts.
function QRScanner({ onPaired, onClose }) {
  const [code,    setCode]    = useState('');
  const [finding, setFinding] = useState(false);
  const [err,     setErr]     = useState('');

  const applyProfile = (prof) => {
    const KEY    = 'rl-profile-v1';
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
    localStorage.setItem(KEY, JSON.stringify({ ...stored, ...prof }));
    window.RL_STATE?.saveProfile({});
    window.RL_STATE?.setupChannel(prof.mosqueId);
    onPaired(prof.mosqueName || 'Masjid');
  };

  const submit = async () => {
    const c = code.trim().toUpperCase();
    if (c.length < 6) { setErr('Masukkan 6 aksara kod dari TV'); return; }
    if (!window.RL_STATE?.isCloudSynced) {
      setErr('Supabase tidak aktif — pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY ditetapkan dalam .env');
      return;
    }
    setFinding(true); setErr('');
    const prof = await window.RL_STATE?.findMosqueByCode(c);
    setFinding(false);
    if (prof) { applyProfile(prof); }
    else      { setErr('Kod tidak dijumpai. Pastikan TV hidup dan bersambung internet.'); }
  };

  const S = {
    position: 'fixed', inset: 0, zIndex: 99999,
    background: '#020617', display: 'flex', flexDirection: 'column',
    fontFamily: '"Outfit", system-ui, sans-serif', color: 'white',
  };

  return (
    <div style={S}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, padding: '32px 24px', textAlign: 'center' }}>

        <div>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: '#fb7185', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Sambung ke TV</p>
          <p style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Masuk Kod TV</p>
          <p style={{ margin: '10px 0 0', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
            Tap logo masjid di skrin TV<br/>→ lihat kod 6 aksara → taip di sini
          </p>
        </div>

        <input
          value={code}
          onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-F0-9]/g, '').slice(0, 6)); setErr(''); }}
          placeholder="e.g. 850D86"
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          style={{
            font: 'inherit', width: '100%', maxWidth: 280,
            padding: '18px 20px', borderRadius: 18,
            background: 'rgba(255,255,255,0.06)',
            border: `2px solid ${code.length === 6 ? '#f43f5e' : 'rgba(255,255,255,0.12)'}`,
            color: 'white', fontSize: 28, fontWeight: 900,
            letterSpacing: '0.35em', textAlign: 'center', outline: 'none',
            textTransform: 'uppercase',
          }}
        />

        {err && (
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#fb7185', lineHeight: 1.5, maxWidth: 280 }}>{err}</p>
        )}

        <button
          onClick={submit}
          disabled={code.length < 6 || finding}
          style={{
            font: 'inherit', cursor: code.length === 6 ? 'pointer' : 'default',
            width: '100%', maxWidth: 280, padding: '16px 0', borderRadius: 18,
            background: code.length === 6 ? '#e11d48' : 'rgba(255,255,255,0.08)',
            color: 'white', border: 'none',
            fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
            opacity: code.length === 6 ? 1 : 0.4,
            boxShadow: code.length === 6 ? '0 8px 24px rgba(76,5,25,0.5)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          {finding ? 'Mencari TV...' : 'Sambung'}
        </button>
      </div>

      <div style={{ padding: '16px 24px 40px' }}>
        <button onClick={onClose} style={{ font: 'inherit', cursor: 'pointer', width: '100%', padding: '13px 0', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Batal</button>
      </div>
    </div>
  );
}

function SetupTab() {
  const [profile, setProfile] = window.RL_STATE.useProfile();
  const [syncMsg, setSyncMsg] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [pairedName, setPairedName] = useState(null);

  const isCloudEnabled = !!window.RL_STATE?.isCloudSynced;
  const pairCode = (profile.mosqueId || '').replace(/-/g, '').slice(0, 6).toUpperCase();

  // Count real stats from profile
  const slideCount  = (profile.slides  || []).length;
  const noticeCount = (profile.notices || []).length;
  const zone        = profile.zone || 'WLY01';
  const zoneMeta    = (window.RL_ZONES || []).find(z => z.code === zone);

  const syncNow = async () => {
    setSyncing(true); setSyncMsg(null);
    try {
      if (!window.RL_SOLAT) throw new Error('solat helper not loaded');
      const times = await window.RL_SOLAT.fetchToday(zone);
      setProfile({ prayerTimes: times, prayerTimesSync: new Date().toISOString() });
      setSyncMsg({ ok: true, text: 'Waktu solat dikemas kini.' });
    } catch {
      setSyncMsg({ ok: false, text: 'Gagal. Semak sambungan internet.' });
    }
    setSyncing(false);
    setTimeout(() => setSyncMsg(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Identity card */}
      <div style={{
        background: 'rgba(255,255,255,0.05)', borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.05)', padding: 24,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center',
      }}>
        <window.MosqueIcon size={84} logoUrl={profile.logoUrl} />
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em' }}>
            {profile.mosqueName || '—'}
          </h2>
          <p style={{ margin: '5px 0 0', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.1em' }}>
            {profile.mosqueAddress || ''}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {zone}{zoneMeta ? ` · ${zoneMeta.label}` : ''}
          </p>
        </div>
        <a href="../../ui_kits/setup-wizard/index.html" style={{
          textDecoration: 'none', display: 'block', width: '100%',
          padding: '13px 16px', borderRadius: 18, marginTop: 4,
          background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.60)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: 10, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase',
          textAlign: 'center',
        }}>Kemaskini Maklumat Masjid</a>
      </div>

      {/* Stats */}
      <div style={{
        background: 'rgba(255,255,255,0.05)', borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.05)', padding: '14px 18px',
      }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          Kandungan
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { l: 'Slaid', v: slideCount  || 0 },
            { l: 'Notis', v: noticeCount || 0 },
            { l: 'Zon',   v: zone },
          ].map(s => (
            <div key={s.l} style={{ background: 'rgba(0,0,0,0.30)', padding: '14px 0', borderRadius: 14, textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ margin: 0, fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.20)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 4 }}>{s.l}</p>
              <p style={{ margin: 0, fontSize: typeof s.v === 'number' ? 22 : 14, fontWeight: 900 }}>{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pair with TV ─────────────────────────────────────────────────── */}
      <div style={{
        background: 'rgba(244,63,94,0.08)', borderRadius: 22,
        border: '1px solid rgba(244,63,94,0.20)', padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <h3 style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#fb7185', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          Sambung ke TV
        </h3>
        {pairedName ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(16,185,129,0.15)', borderRadius: 14, border: '1px solid rgba(16,185,129,0.30)' }}>
            <span style={{ fontSize: 18 }}>✓</span>
            <span style={{ fontSize: 12, fontWeight: 900, color: '#34d399' }}>Tersambung ke {pairedName}</span>
          </div>
        ) : (
          <button onClick={() => setScanning(true)} style={{
            font: 'inherit', cursor: 'pointer',
            padding: '14px 16px', borderRadius: 16,
            background: '#e11d48', color: 'white', border: 'none',
            fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: '0 8px 24px rgba(76,5,25,0.4)',
          }}>
            <span style={{ fontSize: 16 }}>🔢</span>
            Masuk Kod TV
          </button>
        )}
        <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
          Tap logo masjid di TV → QR muncul → imbas dari sini untuk pair
        </p>
      </div>

      {scanning && (
        <QRScanner
          onPaired={name => { setScanning(false); setPairedName(name); }}
          onClose={() => setScanning(false)}
        />
      )}

      {/* Sync status + prayer time button */}
      <div style={{
        background: 'rgba(255,255,255,0.05)', borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.05)', padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            Status Penyegerakan
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: isCloudEnabled ? '#34d399' : '#f59e0b',
              boxShadow: `0 0 8px ${isCloudEnabled ? '#34d399' : '#f59e0b'}`,
            }} />
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: isCloudEnabled ? '#34d399' : '#fbbf24' }}>
              {isCloudEnabled ? 'Awan Aktif' : 'Lokal Sahaja'}
            </span>
          </div>
        </div>

        {!isCloudEnabled && (
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
            Supabase tidak dikonfigurasi. Perubahan hanya disegerakkan dalam pelayar yang sama. Untuk kawalan merentas peranti, sambungkan melalui QR kod TV.
          </p>
        )}

        {/* Pairing code */}
        {pairCode && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 14, background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Kod Sambung TV</span>
            <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.4em', color: 'var(--rl-accent-light, #fb7185)', fontVariantNumeric: 'tabular-nums' }}>{pairCode}</span>
          </div>
        )}

        {/* Sync prayer times */}
        <button onClick={syncNow} disabled={syncing} style={{
          font: 'inherit', cursor: syncing ? 'wait' : 'pointer',
          padding: '13px 16px', borderRadius: 16,
          background: 'rgba(244,63,94,0.12)', color: '#fb7185',
          border: '1px solid rgba(244,63,94,0.25)',
          fontSize: 11, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {syncing ? 'Menyegerak...' : '↻ Muat Semula Waktu Solat'}
        </button>
        {syncMsg && (
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textAlign: 'center', color: syncMsg.ok ? '#34d399' : '#fb7185' }}>
            {syncMsg.text}
          </p>
        )}
        {profile.prayerTimesSync && (
          <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textAlign: 'center', letterSpacing: '0.1em' }}>
            Terakhir: {new Date(profile.prayerTimesSync).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

    </div>
  );
}

window.SetupTab = SetupTab;
