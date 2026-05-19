/* global React */
// SetupTab.jsx — mosque identity summary + sync status + quick navigation.

const { useState, useEffect, useRef } = React;

// ── In-app QR scanner ────────────────────────────────────────────────────────
// Needed because iPhone PWA storage is isolated from Safari — the only way to
// pair is to scan the TV QR from INSIDE the installed app.
function QRScanner({ onPaired, onClose }) {
  const [status, setStatus] = useState('idle'); // idle | scanning | error
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => () => stopCamera(), []);

  const stopCamera = () => {
    if (rafRef.current)  cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  const applyQR = (raw) => {
    try {
      const url = new URL(raw);
      const id  = url.searchParams.get('mosque');
      if (!id || id.length < 8) return false;
      const KEY    = 'rl-profile-v1';
      const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
      const inc    = { mosqueId: id };
      const map    = { n: 'mosqueName', a: 'mosqueAddress', z: 'zone', t: 'theme' };
      Object.entries(map).forEach(([k, field]) => {
        const v = url.searchParams.get(k);
        if (v) inc[field] = decodeURIComponent(v);
      });
      if (url.searchParams.get('s') === '1') inc.setupComplete = true;
      localStorage.setItem(KEY, JSON.stringify({ ...stored, ...inc }));
      window.RL_STATE?.saveProfile({});
      window.RL_STATE?.setupChannel(id);
      return inc.mosqueName || 'Masjid';
    } catch { return false; }
  };

  const handleDetected = (raw) => {
    stopCamera();
    const name = applyQR(raw);
    if (name) { onPaired(name); }
    else      { setStatus('error'); }
  };

  // Decode a DOM image element using BarcodeDetector
  const decodeImage = async (imgEl) => {
    if (!('BarcodeDetector' in window)) return null;
    try {
      const codes = await new BarcodeDetector({ formats: ['qr_code'] }).detect(imgEl);
      return codes[0]?.rawValue || null;
    } catch { return null; }
  };

  // Start live camera scanning (getUserMedia + BarcodeDetector)
  const startCamera = async () => {
    if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
      // Fallback: file input
      document.getElementById('rl-qr-file').click();
      return;
    }
    setStatus('scanning');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();
      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      const tick = async () => {
        if (!streamRef.current) return;
        try {
          const codes = await detector.detect(video);
          if (codes.length) { handleDetected(codes[0].rawValue); return; }
        } catch {}
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch {
      setStatus('error');
      document.getElementById('rl-qr-file').click(); // fall back to photo
    }
  };

  // File input fallback — works on all iOS when BarcodeDetector available
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('scanning');
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      const raw = await decodeImage(img);
      URL.revokeObjectURL(img.src);
      if (raw) handleDetected(raw);
      else     setStatus('error');
    };
  };

  const OVERLAY = { position: 'fixed', inset: 0, zIndex: 99999, background: '#020617', display: 'flex', flexDirection: 'column', fontFamily: '"Outfit", system-ui, sans-serif' };

  if (status === 'scanning') {
    return (
      <div style={OVERLAY}>
        <video ref={videoRef} playsInline muted style={{ flex: 1, width: '100%', objectFit: 'cover', background: '#000' }} />
        {/* Viewfinder overlay */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ width: 220, height: 220, border: '3px solid #f43f5e', borderRadius: 20, boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)' }} />
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 24px 40px', textAlign: 'center', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
          <p style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Halakan ke QR di skrin TV</p>
          <button onClick={() => { stopCamera(); onClose(); }} style={{ font: 'inherit', cursor: 'pointer', padding: '12px 32px', borderRadius: 14, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontSize: 13, fontWeight: 900 }}>Batal</button>
        </div>
      </div>
    );
  }

  return (
    <div style={OVERLAY}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 32, textAlign: 'center' }}>
        <div style={{ fontSize: 64 }}>📷</div>
        <div>
          <p style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Imbas QR Dari TV</p>
          <p style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.50)', lineHeight: 1.5 }}>
            Tap logo masjid di skrin TV<br/>untuk paparkan QR kod
          </p>
        </div>

        {status === 'error' && (
          <div style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.30)', borderRadius: 16, padding: '12px 16px' }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#fb7185' }}>QR tidak dikesan. Pastikan QR kelihatan jelas dan cuba lagi.</p>
          </div>
        )}

        <button onClick={startCamera} style={{ font: 'inherit', cursor: 'pointer', width: '100%', maxWidth: 280, padding: '16px 20px', borderRadius: 18, background: '#e11d48', color: 'white', border: 'none', fontSize: 14, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', boxShadow: '0 12px 30px rgba(76,5,25,0.5)' }}>
          Buka Kamera
        </button>

        <input id="rl-qr-file" type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFile} />

        <button onClick={onClose} style={{ font: 'inherit', cursor: 'pointer', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Batal</button>
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
