/* global React */
// WizardSteps.jsx — 4-step onboarding: welcome → search mosque → logo → finish
import _logoMark from '../../assets/logo-mark.png';

const { useState, useRef, useEffect } = React;

// Map Malaysian state names → sensible default JAKIM zone
const STATE_ZONE = {
  'Kuala Lumpur': 'WLY01', 'Putrajaya': 'WLY01', 'Labuan': 'WLY02',
  'Johor': 'JHR02', 'Kedah': 'KDH01', 'Kelantan': 'KLT01',
  'Melaka': 'MLK01', 'Negeri Sembilan': 'NGS01', 'Pahang': 'PHG06',
  'Perak': 'PRK07', 'Perlis': 'PLS01', 'Pulau Pinang': 'PNG01',
  'Penang': 'PNG01', 'Sabah': 'SBH01', 'Sarawak': 'SWK05',
  'Selangor': 'SGR05', 'Terengganu': 'TRG03',
};

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
      <img src={_logoMark} width="96" height="96" alt="" style={{ marginBottom: 32, filter: 'drop-shadow(0 12px 32px var(--rl-accent-glow, rgba(244,63,94,0.35)))' }} />
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

// — STEP 2: MOSQUE SEARCH — live Nominatim + GPS, with manual fallback —
const INPUT_STYLE = {
  width: '100%', padding: '13px 16px', borderRadius: 14,
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.10)',
  color: 'white', fontSize: 13, fontFamily: 'inherit', fontWeight: 700,
  outline: 'none', boxSizing: 'border-box',
  WebkitTapHighlightColor: 'transparent',
};

function MosqueSearch({ onSave }) {
  const [query,      setQuery]      = useState('');
  const [results,    setResults]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [status,     setStatus]     = useState('');   // info / error message
  const [showManual, setShowManual] = useState(false);
  const [manName,    setManName]    = useState('');
  const [manAddr,    setManAddr]    = useState('');
  const [zone,       setZone]       = useState('WLY01');
  const [manErr,     setManErr]     = useState('');
  const debounce = useRef(null);

  // ── text search ──────────────────────────────────────────────
  const onQueryChange = (val) => {
    setQuery(val);
    clearTimeout(debounce.current);
    if (!val.trim() || val.length < 2) { setResults([]); return; }
    debounce.current = setTimeout(() => doTextSearch(val), 500);
  };

  const doTextSearch = async (q) => {
    setLoading(true); setStatus('');
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ' masjid')}&countrycodes=my&format=json&limit=8&addressdetails=1`;
      const res  = await fetch(url, { headers: { 'Accept-Language': 'ms,en' } });
      const data = await res.json();
      const hits = data.filter(r =>
        (r.display_name || '').toLowerCase().includes('masjid') ||
        (r.display_name || '').toLowerCase().includes('surau')  ||
        (r.name         || '').toLowerCase().includes('masjid') ||
        r.type === 'place_of_worship'
      );
      setResults(hits.slice(0, 6));
      if (!hits.length) setStatus('Tiada hasil — cuba kata kunci lain atau guna GPS.');
    } catch { setStatus('Gagal sambung. Semak internet anda.'); }
    setLoading(false);
  };

  // ── GPS search ───────────────────────────────────────────────
  const doGPS = () => {
    if (!navigator.geolocation) { setStatus('GPS tidak disokong oleh peranti ini.'); return; }
    setLoading(true); setResults([]); setStatus('Mendapatkan lokasi GPS…');
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude: lat, longitude: lon } = coords;
      try {
        // Nearby mosques via Overpass
        const oq  = `[out:json][timeout:12];(node["amenity"="place_of_worship"]["religion"="muslim"](around:4000,${lat},${lon});way["amenity"="place_of_worship"]["religion"="muslim"](around:4000,${lat},${lon}););out center 10;`;
        const [oRes, rRes] = await Promise.all([
          fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(oq)}`),
          fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=8`),
        ]);
        const [oData, rData] = await Promise.all([oRes.json(), rRes.json()]);
        const state    = rData?.address?.state || '';
        const defZone  = STATE_ZONE[state] || 'WLY01';
        setZone(defZone);
        const hits = (oData.elements || [])
          .filter(e => e.tags?.name)
          .map(e => ({
            name:         e.tags.name,
            display_name: [e.tags['addr:street'], e.tags['addr:city'] || e.tags['addr:town'], state].filter(Boolean).join(', '),
            _zone:        defZone,
          }));
        setResults(hits.slice(0, 8));
        setStatus(hits.length ? `${hits.length} masjid dijumpai berdekatan` : 'Tiada masjid berdekatan — cuba cari nama atau masuk manual.');
      } catch { setStatus('Gagal mendapat data. Cuba cari nama masjid di atas.'); }
      setLoading(false);
    }, () => {
      setLoading(false);
      setStatus('GPS ditolak. Cari menggunakan nama masjid di atas.');
    }, { timeout: 10000 });
  };

  const pickResult = (r) => {
    const addr = (r.display_name || '').split(',').slice(0, 3).join(', ').trim();
    onSave({
      name:    (r.name || r.display_name || '').toUpperCase().split(',')[0].trim() || 'MASJID',
      address: addr,
      zone:    r._zone || zone,
    });
  };

  const submitManual = () => {
    if (!manName.trim()) { setManErr('Sila masukkan nama masjid.'); return; }
    onSave({ name: manName.trim().toUpperCase(), address: manAddr.trim(), zone });
  };

  if (showManual) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 360, gap: 12, animation: 'rl-fadeUp 500ms ease' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#fb7185', letterSpacing: '0.35em', textTransform: 'uppercase' }}>Masuk Manual</p>
          <h2 style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em' }}>Maklumat Masjid</h2>
        </div>
        <input value={manName} onChange={e => { setManName(e.target.value); setManErr(''); }} placeholder="Nama Masjid *" style={INPUT_STYLE} />
        <input value={manAddr} onChange={e => setManAddr(e.target.value)} placeholder="Alamat (pilihan)" style={INPUT_STYLE} />
        <select value={zone} onChange={e => setZone(e.target.value)} style={{ ...INPUT_STYLE, cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none' }}>
          {(window.RL_ZONES || []).map(z => (
            <option key={z.code} value={z.code} style={{ background: '#1c0e21' }}>{z.code} · {z.label}</option>
          ))}
        </select>
        {manErr && <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#fb7185' }}>{manErr}</p>}
        <button onClick={submitManual} style={{ font: 'inherit', cursor: 'pointer', padding: '16px 20px', borderRadius: 18, background: '#e11d48', color: 'white', border: 'none', fontSize: 12, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', boxShadow: '0 12px 30px rgba(76,5,25,0.5)' }}>
          Simpan &amp; Teruskan
        </button>
        <button onClick={() => setShowManual(false)} style={{ font: 'inherit', cursor: 'pointer', background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          ← Kembali Cari
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 360, gap: 12, animation: 'rl-fadeUp 500ms ease' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 900, color: '#fb7185', letterSpacing: '0.35em', textTransform: 'uppercase' }}>Cari Masjid</p>
        <h2 style={{ margin: '6px 0 0', fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em' }}>Pilih Masjid Anda</h2>
      </div>

      {/* Search bar + GPS */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder="Nama masjid atau kawasan..."
            style={{ ...INPUT_STYLE, paddingRight: loading ? 40 : 16 }}
            autoComplete="off"
          />
          {loading && (
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#fb7185' }}>
              <Spinner size={16} />
            </span>
          )}
        </div>
        <button onClick={doGPS} title="Cari menggunakan GPS" style={{
          font: 'inherit', cursor: 'pointer', flexShrink: 0,
          width: 48, borderRadius: 14, border: '1px solid rgba(244,63,94,0.30)',
          background: 'rgba(244,63,94,0.10)', color: '#fb7185', fontSize: 20,
        }}>📍</button>
      </div>

      {/* Status message */}
      {status && !results.length && (
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.40)', textAlign: 'center' }}>{status}</p>
      )}
      {status && results.length > 0 && (
        <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: '#34d399', textAlign: 'center', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{status}</p>
      )}

      {/* Results list */}
      {results.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
          {results.map((r, i) => {
            const label = r.name || (r.display_name || '').split(',')[0];
            const sub   = (r.display_name || '').split(',').slice(1, 3).join(',').trim();
            return (
              <button key={i} onClick={() => pickResult(r)} style={{
                font: 'inherit', cursor: 'pointer', textAlign: 'left',
                padding: '12px 14px', borderRadius: 14,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 12,
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.12)'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.30)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>🕌</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</p>
                  {sub && <p style={{ margin: '2px 0 0', fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub}</p>}
                </div>
                <svg width="14" height="14" fill="none" stroke="#fb7185" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
              </button>
            );
          })}
        </div>
      )}

      {/* Manual fallback */}
      <button onClick={() => setShowManual(true)} style={{
        font: 'inherit', cursor: 'pointer', background: 'none', border: 'none', marginTop: 4,
        color: 'rgba(255,255,255,0.30)', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
      }}>
        Tak jumpa? Masuk secara manual →
      </button>
      <style>{`@keyframes rl-fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
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
        src={logoUrl || _logoMark}
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

      {/* Pairing QR — includes mosqueId so phone joins the correct Supabase channel */}
      {showCTAs && (() => {
        const mosqueId = window.RL_STATE?.loadProfile()?.mosqueId || '';
        const pairCode = mosqueId.replace(/-/g, '').slice(0, 6).toUpperCase();
        const adminUrl = `${window.location.origin}/ui_kits/mobile-admin/index.html${mosqueId ? '?mosque=' + mosqueId : ''}`;
        return (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.22)',
            padding: '18px 20px', borderRadius: 22, width: '100%',
            animation: 'rl-pop 600ms cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <p style={{ margin: 0, fontSize: 8, fontWeight: 900, color: '#34d399', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
              Sambung Telefon Admin
            </p>
            <div style={{
              background: 'white', padding: 10, borderRadius: 16,
              boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
            }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&color=010103&data=${encodeURIComponent(adminUrl)}`}
                width="160" height="160" alt="QR Code Admin"
                style={{ display: 'block', borderRadius: 8 }}
              />
            </div>
            {pairCode && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Kod sambung</p>
                <p style={{ margin: '5px 0 0', fontSize: 24, fontWeight: 900, letterSpacing: '0.5em', color: '#34d399', fontVariantNumeric: 'tabular-nums' }}>{pairCode}</p>
              </div>
            )}
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.30)', textAlign: 'center' }}>
              Imbas dengan kamera telefon — admin terus tersambung ke TV ini
            </span>
          </div>
        );
      })()}

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

window.Wizard = { Welcome, MosqueSearch, UploadLogo, Finish, ProgressDots };
