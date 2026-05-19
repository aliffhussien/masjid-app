/* global React */
// SetupTab.jsx — mosque identity summary + sync status + quick navigation.

const { useState, useEffect, useRef } = React;

// ── TV Pairing screen ─────────────────────────────────────────────────────────
// Primary: PIN from TV (tap logo → shows 4-digit PIN → type here → instant sync)
// Fallback: photo of QR using phone camera
function QRScanner({ onPaired, onClose }) {
  const [mode,    setMode]    = useState('pin'); // pin | photo
  const [pin,     setPin]     = useState('');
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

  // PIN submit — sends via Supabase broadcast to TV, TV responds with profile
  const submitPin = async () => {
    if (pin.length !== 4) { setErr('PIN mestilah 4 digit'); return; }
    if (!window.RL_STATE?.isCloudSynced) {
      setErr('Supabase tidak tersambung. Guna kaedah Foto QR.');
      return;
    }
    setFinding(true); setErr('');
    const prof = await window.RL_STATE?.findMosqueByPin(pin);
    setFinding(false);
    if (prof) { applyProfile(prof); }
    else      { setErr('PIN tidak dijumpai atau TV tiada sambungan. Cuba foto QR.'); }
  };

  // Photo of QR — decode using BarcodeDetector
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFinding(true); setErr('');
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise(r => { img.onload = r; img.onerror = r; });
      if ('BarcodeDetector' in window) {
        const codes = await new BarcodeDetector({ formats: ['qr_code'] }).detect(img);
        URL.revokeObjectURL(img.src);
        if (codes.length) {
          const url = new URL(codes[0].rawValue);
          const id  = url.searchParams.get('mosque');
          if (id) {
            const inc = { mosqueId: id };
            const map = { n: 'mosqueName', a: 'mosqueAddress', z: 'zone', t: 'theme' };
            Object.entries(map).forEach(([k, f]) => {
              const v = url.searchParams.get(k);
              if (v) inc[f] = decodeURIComponent(v);
            });
            if (url.searchParams.get('s') === '1') inc.setupComplete = true;
            setFinding(false);
            applyProfile(inc);
            return;
          }
        }
      }
      setFinding(false);
      setErr('QR tidak dikesan dalam gambar. Cuba ambil gambar lebih dekat.');
    } catch {
      setFinding(false);
      setErr('Gagal membaca gambar. Cuba lagi.');
    }
  };

  const S = { position: 'fixed', inset: 0, zIndex: 99999, background: '#020617', display: 'flex', flexDirection: 'column', fontFamily: '"Outfit", system-ui, sans-serif', color: 'white' };
  const numBtn = (d) => (
    <button key={d} onClick={() => { if (pin.length < 4) { setPin(p => p + d); setErr(''); } }} style={{ font: 'inherit', cursor: 'pointer', height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 22, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{d}</button>
  );

  return (
    <div style={S}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 24px 16px', gap: 16, overflowY: 'auto' }}>

        {/* Tab switcher */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.06)', borderRadius: 16, padding: 4, gap: 4 }}>
          {[['pin','🔢 PIN TV'],['photo','📷 Foto QR']].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setErr(''); setPin(''); }} style={{
              flex: 1, font: 'inherit', cursor: 'pointer',
              padding: '10px 0', borderRadius: 12, border: 'none',
              background: mode === m ? 'rgba(244,63,94,0.25)' : 'transparent',
              color: mode === m ? '#fda4af' : 'rgba(255,255,255,0.45)',
              fontSize: 12, fontWeight: 900, letterSpacing: '0.1em',
            }}>{label}</button>
          ))}
        </div>

        {mode === 'pin' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, flex: 1, justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: '#fb7185', letterSpacing: '0.2em', textTransform: 'uppercase' }}>PIN Dari TV</p>
              <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.40)', lineHeight: 1.5 }}>Tap logo masjid di TV → lihat 4-digit PIN → taip di sini</p>
            </div>
            {/* PIN dots */}
            <div style={{ display: 'flex', gap: 16 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${pin.length > i ? '#f43f5e' : 'rgba(255,255,255,0.20)'}`, background: pin.length > i ? '#f43f5e' : 'transparent', transition: 'all 0.15s ease', boxShadow: pin.length > i ? '0 0 10px #f43f5e' : 'none' }} />
              ))}
            </div>
            {/* Numpad */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 20px', maxWidth: 240, width: '100%' }}>
              {[1,2,3,4,5,6,7,8,9].map(numBtn)}
              <button onClick={() => setPin('')} style={{ font: 'inherit', cursor: 'pointer', height: 64, borderRadius: 32, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Padam</button>
              {numBtn(0)}
              <button onClick={() => setPin(p => p.slice(0,-1))} style={{ font: 'inherit', cursor: 'pointer', height: 64, borderRadius: 32, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" /></svg>
              </button>
            </div>
            <button onClick={submitPin} disabled={pin.length !== 4 || finding} style={{ font: 'inherit', cursor: pin.length === 4 ? 'pointer' : 'default', width: '100%', maxWidth: 240, padding: '16px 0', borderRadius: 18, background: pin.length === 4 ? '#e11d48' : 'rgba(255,255,255,0.08)', color: 'white', border: 'none', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: pin.length === 4 ? 1 : 0.5, boxShadow: pin.length === 4 ? '0 8px 24px rgba(76,5,25,0.5)' : 'none' }}>
              {finding ? 'Mencari TV...' : 'Sambung'}
            </button>
          </div>
        )}

        {mode === 'photo' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, flex: 1, justifyContent: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 56 }}>📷</div>
            <div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: 'white' }}>Ambil Gambar QR TV</p>
              <p style={{ margin: '8px 0 0', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>Tap logo masjid di TV → QR muncul → ambil gambar skrin TV dengan telefon ini</p>
            </div>
            <button onClick={() => document.getElementById('rl-qr-file').click()} disabled={finding} style={{ font: 'inherit', cursor: 'pointer', width: '100%', maxWidth: 260, padding: '16px 0', borderRadius: 18, background: '#e11d48', color: 'white', border: 'none', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: '0 8px 24px rgba(76,5,25,0.5)' }}>
              {finding ? 'Memproses...' : 'Buka Kamera'}
            </button>
            <input id="rl-qr-file" type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFile} />
          </div>
        )}

        {err && <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#fb7185', textAlign: 'center', lineHeight: 1.5, padding: '0 8px' }}>{err}</p>}
      </div>

      <div style={{ padding: '16px 24px 40px' }}>
        <button onClick={onClose} style={{ font: 'inherit', cursor: 'pointer', width: '100%', padding: '13px 0', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.50)', fontSize: 12, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Batal</button>
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
            <span style={{ fontSize: 16 }}>📷</span>
            Imbas QR Dari TV
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
