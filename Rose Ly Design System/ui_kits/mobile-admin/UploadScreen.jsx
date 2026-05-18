/* global React */
// UploadScreen.jsx — full-screen dedicated upload journey.
// Step 1: pick file (drop zone)
// Step 2: preview + label picker
// Step 3: save → returns to KandunganTab

const { useState, useRef } = React;

const LABELS = ['POSTER', 'MAKLUMAN', 'INFO', 'BERITA', 'PROMOSI'];

function imageToDataUrl(file, opts = {}) {
  const { maxW = 1920, maxH = 1080, aspect = 16/9, quality = 0.98 } = opts;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode failed'));
      img.onload = () => {
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        if (aspect && img.width / img.height > aspect) {
          sw = Math.round(img.height * aspect);
          sx = Math.round((img.width - sw) / 2);
        } else if (aspect) {
          sh = Math.round(img.width / aspect);
          sy = Math.round((img.height - sh) / 2);
        }
        let dw = sw, dh = sh;
        if (dw > maxW) { dh = Math.round(dh * maxW / dw); dw = maxW; }
        if (dh > maxH) { dw = Math.round(dw * maxH / dh); dh = maxH; }
        const c = document.createElement('canvas');
        c.width = dw; c.height = dh;
        const ctx = c.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);
        try {
          const url = c.toDataURL('image/webp', quality);
          if (url.startsWith('data:image/webp')) return resolve(url);
          resolve(c.toDataURL('image/jpeg', quality));
        } catch (err) {
          resolve(c.toDataURL('image/png'));
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function UploadScreen({ onClose, onSave }) {
  const [step, setStep]   = useState(1);
  const [imgUrl, setImg]  = useState(null);
  const [label, setLabel] = useState('POSTER');
  const [title, setTitle] = useState('');
  const [busy, setBusy]   = useState(false);
  const [err, setErr]     = useState(null);
  const inputRef = useRef(null);

  const onFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('Sila pilih fail gambar.'); return; }
    if (file.size > 12 * 1024 * 1024)    { setErr('Saiz fail maksimum 12MB.'); return; }
    setErr(null); setBusy(true);
    try {
      const url = await imageToDataUrl(file);
      setImg(url);
      setStep(2);
    } catch (e) {
      setErr('Gagal proses gambar.');
    } finally { setBusy(false); }
  };

  const save = () => {
    onSave({
      type: 'poster',
      label,
      title: title.trim(),
      content: '',
      bgUrl: imgUrl,
      active: true,
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'linear-gradient(180deg, rgba(40,19,46,0.97), rgba(10,6,16,0.99))',
      backdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      animation: 'rl-upload-in 280ms cubic-bezier(0.22,1,0.36,1)',
    }}>
      {/* Header */}
      <header style={{
        padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <button onClick={onClose} style={{
          font: 'inherit', cursor: 'pointer', background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)',
          padding: '6px 14px', borderRadius: 999,
          fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
          Tutup
        </button>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2].map(n => (
            <span key={n} style={{
              width: n === step ? 20 : 6, height: 6, borderRadius: 999,
              background: n <= step ? 'var(--rl-accent, #f43f5e)' : 'rgba(255,255,255,0.12)',
              transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          ))}
        </div>
        <div style={{ width: 80 }} />
      </header>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column' }}>
        {step === 1 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 20 }}>
            <div>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 900, letterSpacing: '0.35em', color: 'var(--rl-accent-light, #fb7185)', textTransform: 'uppercase' }}>Langkah 1 dari 2</p>
              <h1 style={{ margin: '8px 0 4px', fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em' }}>Pilih Gambar</h1>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.50)' }}>
                Gambar akan dipaparkan penuh di TV masjid.
              </p>
            </div>
            <label
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--rl-accent, #f43f5e)'; }}
              onDragLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files?.[0]); }}
              style={{
                cursor: 'pointer', width: '100%', maxWidth: 320,
                aspectRatio: '16 / 9', borderRadius: 24,
                background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(255,255,255,0.15)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
                color: 'rgba(255,255,255,0.55)', transition: 'all 0.2s ease',
              }}>
              {busy ? (
                <>
                  <div style={{ width: 32, height: 32, border: '3px solid var(--rl-accent-dim, rgba(244,63,94,0.3))', borderTopColor: 'var(--rl-accent, #f43f5e)', borderRadius: '50%', animation: 'rl-spin 0.7s linear infinite' }} />
                  <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Memproses…</span>
                </>
              ) : (
                <>
                  <svg width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--rl-accent-light, #fb7185)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"/>
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Tap atau Drop Fail</span>
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>JPG · PNG · WEBP · Max 12MB</span>
                </>
              )}
              <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => onFile(e.target.files?.[0])} />
            </label>
            {err && <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'var(--rl-accent-light, #fb7185)' }}>{err}</p>}
          </div>
        )}

        {step === 2 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 900, letterSpacing: '0.35em', color: 'var(--rl-accent-light, #fb7185)', textTransform: 'uppercase' }}>Langkah 2 dari 2</p>
              <h1 style={{ margin: '8px 0 0', fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em' }}>Periksa &amp; Simpan</h1>
            </div>

            {/* Preview */}
            <div style={{
              width: '100%', aspectRatio: '16 / 9', borderRadius: 18, overflow: 'hidden',
              background: '#000', position: 'relative',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}>
              <img src={imgUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{
                position: 'absolute', top: 8, left: 8,
                padding: '3px 10px', borderRadius: 999,
                background: 'var(--rl-accent-dim, rgba(244,63,94,0.25))', color: 'var(--rl-accent-light, #fda4af)',
                border: '1px solid var(--rl-accent-edge, rgba(244,63,94,0.40))',
                fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
              }}>{label}</div>
            </div>

            {/* Title (optional) */}
            <label style={{ display: 'block' }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Tajuk (pilihan)</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Biarkan kosong untuk poster murni"
                style={{
                  font: 'inherit', width: '100%', marginTop: 6,
                  padding: '12px 14px', borderRadius: 14,
                  background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white', fontSize: 13, fontWeight: 700, outline: 'none',
                }} />
            </label>

            {/* Label picker */}
            <div>
              <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Label</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {LABELS.map(l => (
                  <button key={l} onClick={() => setLabel(l)} style={{
                    font: 'inherit', cursor: 'pointer',
                    padding: '8px 14px', borderRadius: 999,
                    background: l === label ? 'var(--rl-accent-dim, rgba(244,63,94,0.20))' : 'rgba(255,255,255,0.04)',
                    border: '1px solid ' + (l === label ? 'var(--rl-accent-edge, rgba(244,63,94,0.40))' : 'rgba(255,255,255,0.08)'),
                    color: l === label ? 'white' : 'rgba(255,255,255,0.55)',
                    fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase',
                  }}>{l}</button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={() => { setImg(null); setStep(1); }} style={{
                font: 'inherit', cursor: 'pointer',
                padding: '14px 16px', borderRadius: 16,
                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(255,255,255,0.10)',
                fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
              }}>← Tukar Gambar</button>
              <button onClick={save} style={{
                flex: 1, font: 'inherit', cursor: 'pointer',
                padding: '14px 16px', borderRadius: 16,
                background: 'var(--rl-accent-dark, #e11d48)', color: 'white', border: 'none',
                fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
                boxShadow: '0 12px 30px var(--rl-accent-shadow, rgba(76,5,25,0.5))',
              }}>✓ Simpan Slaid</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes rl-upload-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rl-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

window.UploadScreen = UploadScreen;
