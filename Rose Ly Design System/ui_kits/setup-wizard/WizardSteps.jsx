/* global React */
// WizardSteps.jsx — the 5-step onboarding flow.
// Steps:  welcome → searching → results → upload-logo → finish

const { useState, useRef, useEffect } = React;

// Shared UI primitives
function Spinner({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'rl-spin 1s linear infinite' }}>
      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      <style>{`@keyframes rl-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

function ProgressDots({ step, total = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 6, position: 'absolute', top: 56, left: '50%', transform: 'translateX(-50%)', zIndex: 50 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{
          width: i === step ? 22 : 6, height: 6, borderRadius: 999,
          background: i <= step ? '#f43f5e' : 'rgba(255,255,255,0.12)',
          boxShadow: i === step ? '0 0 10px rgba(244,63,94,0.6)' : 'none',
          transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        }} />
      ))}
    </div>
  );
}

// — STEP 1: WELCOME —
function Welcome({ onStart, onManual }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: 360, animation: 'rl-fadeUp 600ms cubic-bezier(0.34,1.56,0.64,1)' }}>
      <img src="../../assets/logo-mark.png" width="96" height="96" alt="" style={{ marginBottom: 32, filter: 'drop-shadow(0 12px 32px var(--rl-accent-glow, rgba(244,63,94,0.35)))' }} />
      <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', fontStyle: 'italic', background: 'linear-gradient(90deg,#fff, var(--rl-accent-soft, #fda4af))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Selamat Datang
      </h1>
      <p style={{ margin: '12px 0 36px', fontSize: 12, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)' }}>
        Mari sediakan masjid anda
      </p>

      <button onClick={onStart} style={{
        font: 'inherit', cursor: 'pointer',
        width: '100%', padding: '18px 24px', borderRadius: 22,
        background: 'var(--rl-accent-dark, #e11d48)', color: 'white', border: 'none',
        fontSize: 13, fontWeight: 900, letterSpacing: '0.20em', textTransform: 'uppercase',
        boxShadow: '0 16px 36px var(--rl-accent-shadow, rgba(76,5,25,0.6)), inset 0 1px 0 rgba(255,255,255,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
      onMouseUp={e   => e.currentTarget.style.transform = 'scale(1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
        Cari Masjid Saya
      </button>

      <button onClick={onManual} style={{
        font: 'inherit', cursor: 'pointer', marginTop: 12,
        padding: '12px 16px', background: 'transparent', border: 'none',
        color: 'rgba(255,255,255,0.40)', fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase',
      }}>
        Atau cari secara manual
      </button>
    </div>
  );
}

// — STEP 2: SEARCHING —
function Searching({ message = 'Mendapatkan lokasi anda...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, animation: 'rl-fadeUp 600ms cubic-bezier(0.34,1.56,0.64,1)' }}>
      <div style={{
        position: 'relative', width: 110, height: 110,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(244,63,94,0.10)', borderRadius: '50%',
        border: '2px solid rgba(244,63,94,0.25)',
      }}>
        {/* Pulsing rings */}
        {[0, 0.5, 1].map(d => (
          <div key={d} style={{
            position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid #f43f5e',
            animation: `rl-ping 2s cubic-bezier(0,0,0.2,1) ${d}s infinite`,
          }} />
        ))}
        <div style={{ color: '#fb7185' }}><Spinner size={36} /></div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 16, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.015em' }}>{message}</p>
        <p style={{ margin: '6px 0 0', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Sila tunggu sebentar</p>
      </div>
      <style>{`@keyframes rl-ping { 75%, 100% { transform: scale(1.8); opacity: 0; } }`}</style>
    </div>
  );
}

// — STEP 3: MANUAL ENTRY (replaces fake GPS results) —
// Zone list comes from shared/zones.js → window.RL_ZONES (loaded before this file)

const INPUT_STYLE = {
  width: '100%', padding: '13px 16px', borderRadius: 14,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  color: 'white', fontSize: 13, fontFamily: 'inherit', fontWeight: 700,
  outline: 'none', boxSizing: 'border-box',
  WebkitTapHighlightColor: 'transparent',
};

function ManualEntry({ onSave }) {
  const [name,    setName]    = useState('');
  const [address, setAddress] = useState('');
  const [zone,    setZone]    = useState('WLY01');
  const [err,     setErr]     = useState('');

  const submit = () => {
    if (!name.trim()) { setErr('Sila masukkan nama masjid.'); return; }
    onSave({ name: name.trim().toUpperCase(), address: address.trim(), zone });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 360, gap: 12, animation: 'rl-fadeUp 600ms cubic-bezier(0.34,1.56,0.64,1)' }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#fb7185', letterSpacing: '0.35em', textTransform: 'uppercase' }}>Maklumat Masjid</p>
        <h2 style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em' }}>Tetapkan Masjid Anda</h2>
      </div>

      <div>
        <label style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
          Nama Masjid *
        </label>
        <input
          value={name}
          onChange={e => { setName(e.target.value); setErr(''); }}
          placeholder="cth: MASJID AL-FALAH"
          style={INPUT_STYLE}
        />
      </div>

      <div>
        <label style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
          Alamat
        </label>
        <input
          value={address}
          onChange={e => setAddress(e.target.value)}
          placeholder="cth: Jalan Masjid, Kuala Lumpur"
          style={INPUT_STYLE}
        />
      </div>

      <div>
        <label style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
          Zon Waktu Solat JAKIM
        </label>
        <select
          value={zone}
          onChange={e => setZone(e.target.value)}
          style={{ ...INPUT_STYLE, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}
        >
          {(window.RL_ZONES || []).map(z => (
            <option key={z.code} value={z.code} style={{ background: '#1c0e21', color: 'white' }}>
              {z.code} · {z.label}
            </option>
          ))}
        </select>
      </div>

      {err && <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#fb7185' }}>{err}</p>}

      <button onClick={submit} style={{
        font: 'inherit', cursor: 'pointer', marginTop: 4,
        padding: '16px 20px', borderRadius: 18,
        background: '#e11d48', color: 'white', border: 'none',
        fontSize: 12, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
        boxShadow: '0 12px 30px rgba(76,5,25,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        Simpan &amp; Teruskan
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
      </button>
    </div>
  );
}

// — STEP 4: LOGO UPLOAD —
function imageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode failed'));
      img.onload = () => {
        const max = 512;
        let w = img.width, h = img.height;
        if (w > h && w > max) { h = h * max / w; w = max; }
        else if (h > max)     { w = w * max / h; h = max; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        try { resolve(canvas.toDataURL('image/webp', 0.92)); }
        catch (err) { resolve(canvas.toDataURL('image/png')); }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function UploadLogo({ chosenMosque, logoUrl, setLogoUrl, onNext, onSkip }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState(null);

  const onFile = async (file) => {
    if (!file) return;
    setErr(null);
    if (!file.type.startsWith('image/')) { setErr('Sila pilih fail gambar.'); return; }
    if (file.size > 6 * 1024 * 1024)     { setErr('Saiz fail maksimum 6MB.'); return; }
    setBusy(true);
    try {
      const url = await imageToDataUrl(file);
      setLogoUrl(url);
    } catch (e) { setErr('Gagal memproses gambar.'); }
    finally     { setBusy(false); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 360, width: '100%', gap: 20, animation: 'rl-fadeUp 600ms cubic-bezier(0.34,1.56,0.64,1)' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#fb7185', letterSpacing: '0.35em', textTransform: 'uppercase' }}>Hampir Siap</p>
        <h2 style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em' }}>Logo Masjid</h2>
        <p style={{ margin: '6px 0 0', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.45)', lineHeight: 1.45 }}>
          Muat naik logo untuk dipaparkan di TV dan apl admin. Anda boleh langkau langkah ini.
        </p>
      </div>

      {/* Big circular preview tile */}
      <img
        src={logoUrl || '../../assets/logo-mark.png'}
        width="160" height="160" alt=""
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#fb7185'; }}
        onDragLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(244,63,94,0.30)'; }}
        onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
        style={{
          width: 160, height: 160, borderRadius: 40,
          objectFit: 'cover', background: '#1c0e21',
          border: '2px dashed rgba(244,63,94,0.30)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          transition: 'all 0.3s ease',
          display: 'block',
        }}
      />

      {/* Mosque name confirmation */}
      {chosenMosque && (
        <div style={{ textAlign: 'center', padding: '8px 16px', background: 'rgba(244,63,94,0.10)', borderRadius: 12, border: '1px solid rgba(244,63,94,0.20)' }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.015em', color: 'white' }}>{chosenMosque.name}</p>
        </div>
      )}

      {/* Buttons */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={() => inputRef.current?.click()} disabled={busy} style={{
          font: 'inherit', cursor: busy ? 'wait' : 'pointer',
          padding: '16px 20px', borderRadius: 18,
          background: '#e11d48', color: 'white', border: 'none',
          fontSize: 12, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
          boxShadow: '0 12px 30px rgba(76,5,25,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          {busy ? 'Memproses...' : (logoUrl ? 'Tukar Logo' : 'Pilih Fail')}
        </button>
        <button onClick={onNext} style={{
          font: 'inherit', cursor: 'pointer',
          padding: '14px 20px', borderRadius: 18,
          background: logoUrl ? 'rgba(255,255,255,0.05)' : 'transparent',
          color: logoUrl ? 'white' : 'rgba(255,255,255,0.40)',
          border: '1px solid ' + (logoUrl ? 'rgba(255,255,255,0.10)' : 'transparent'),
          fontSize: 10, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase',
        }}>
          {logoUrl ? 'Teruskan' : 'Langkau · Guna Default'}
        </button>
      </div>

      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => onFile(e.target.files?.[0])} />
      {err && <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#fb7185' }}>{err}</p>}
    </div>
  );
}

// — STEP 5: FINISH —
function Finish({ chosenMosque, logoUrl }) {
  const [tickIdx, setTickIdx] = useState(0);
  const [showCTAs, setShowCTAs] = useState(false);
  const items = ['Maklumat masjid', 'Zon waktu solat', 'Logo & tema', 'Sinkronisasi awan'];
  useEffect(() => {
    const ints = items.map((_, i) => setTimeout(() => setTickIdx(i + 1), 400 * (i + 1)));
    const reveal = setTimeout(() => setShowCTAs(true), 400 * (items.length + 1) + 400);
    // Persist the profile so Hub, Admin, and TV all pick it up
    if (window.RL_STATE) {
      window.RL_STATE.saveProfile({
        mosqueName:    chosenMosque?.name    || 'Masjid Al-Falah',
        mosqueAddress: chosenMosque?.address || '',
        zone:          chosenMosque?.zone    || 'WLY01',
        logoUrl:       logoUrl || null,
        setupComplete: true,
      });
    }
    return () => { ints.forEach(clearTimeout); clearTimeout(reveal); };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 360, width: '100%', gap: 22, animation: 'rl-fadeUp 600ms cubic-bezier(0.34,1.56,0.64,1)' }}>
      {/* Animated success ring */}
      <div style={{
        position: 'relative',
        width: 110, height: 110, borderRadius: '50%',
        background: 'rgba(16,185,129,0.12)', border: '2px solid #10b981',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 60px rgba(16,185,129,0.4)',
        animation: 'rl-pop 700ms cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <svg width="48" height="48" fill="none" stroke="#34d399" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
             style={{ animation: 'rl-check 600ms cubic-bezier(0.4,0,0.2,1) 200ms forwards', strokeDasharray: 60, strokeDashoffset: 60 }}>
          <path d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div style={{ textAlign: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em' }}>Siap Sedia</h2>
        <p style={{ margin: '6px 0 0', fontSize: 10, fontWeight: 700, color: '#fb7185', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          {chosenMosque?.name || 'Masjid Anda'}
        </p>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5 }}>
        {items.map((label, i) => (
          <div key={label} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '8px 12px', borderRadius: 12,
            background: i < tickIdx ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)',
            border: '1px solid ' + (i < tickIdx ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)'),
            transition: 'all 0.4s ease',
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: '50%',
              background: i < tickIdx ? '#10b981' : 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.3s ease', flexShrink: 0,
            }}>
              {i < tickIdx
                ? <svg width="10" height="10" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
                : <Spinner size={10} />
              }
            </span>
            <span style={{ fontSize: 11, fontWeight: 900, color: i < tickIdx ? 'white' : 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Dynamic QR Code for instant phone pairing */}
      {showCTAs && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 20px', borderRadius: 20, width: '100%',
          animation: 'rl-pop 600ms cubic-bezier(0.34,1.56,0.64,1)',
          boxShadow: 'inset 0 0 12px rgba(255,255,255,0.01)',
        }}>
          <p style={{ margin: 0, fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
            Imbas Untuk Kawalan Telefon
          </p>
          <div style={{
            background: 'white', padding: 8, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          }}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=010103&data=${encodeURIComponent(window.location.origin + '/ui_kits/mobile-admin/index.html')}`}
              width="120" height="120"
              alt="QR Code Admin"
              style={{ display: 'block', borderRadius: 6 }}
            />
          </div>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', letterSpacing: '-0.01em' }}>
            Buka kamera telefon & halakan ke kod di atas
          </span>
        </div>
      )}

      {/* Handoff CTAs — slide in once everything's ticked */}
      <div style={{
        width: '100%', display: 'flex', flexDirection: 'column', gap: 8,
        opacity: showCTAs ? 1 : 0,
        transform: showCTAs ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 600ms cubic-bezier(0.34,1.56,0.64,1)',
        pointerEvents: showCTAs ? 'auto' : 'none',
      }}>
        <a href="../tv-display/index.html" style={{
          textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '14px 18px', borderRadius: 18,
          background: '#e11d48', color: 'white',
          fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
          boxShadow: '0 12px 30px rgba(76,5,25,0.5)',
        }}>
          Buka Paparan TV
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
        </a>
        <a href="../mobile-admin/index.html" style={{
          textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 16,
          background: 'rgba(255,255,255,0.05)', color: 'white',
          border: '1px solid rgba(255,255,255,0.10)',
          fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          Buka Apl Admin
        </a>
        <a href="../../index.html" style={{
          textDecoration: 'none', textAlign: 'center',
          padding: '8px 12px',
          color: 'rgba(255,255,255,0.35)',
          fontSize: 9, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase',
        }}>
          ← Kembali ke Hub
        </a>
      </div>

      <style>{`
        @keyframes rl-check { to { stroke-dashoffset: 0; } }
        @keyframes rl-pop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>
    </div>
  );
}

window.Wizard = { Welcome, Searching, ManualEntry, UploadLogo, Finish, ProgressDots };
