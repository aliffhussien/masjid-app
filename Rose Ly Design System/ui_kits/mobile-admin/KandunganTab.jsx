/* global React */
// KandunganTab.jsx — slides + ticker editor. Wired to shared profile state.

const { useState } = React;

const LABELS = ['MAKLUMAN', 'INFO', 'BERITA', 'PROMOSI', 'POSTER'];

const DEFAULT_SLIDES = [
  { id: 1, type: 'announcement', label: 'MAKLUMAN', title: 'KEMPEN BERSIH MASJID',
    content: 'Gotong-royong perdana akan diadakan pada hari Sabtu ini jam 8:00 pagi.' },
  { id: 2, type: 'announcement', label: 'INFO',     title: 'Program Tahfiz Al-Quran',
    content: 'Pendaftaran kelas hafazan untuk kanak-kanak dan dewasa kini dibuka.' },
];

function Section({ title, children, collapsible = false, defaultOpen = true, count = null }) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = collapsible ? open : true;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', borderRadius: 22,
      border: '1px solid rgba(255,255,255,0.05)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => collapsible && setOpen(o => !o)}
        style={{
          font: 'inherit', cursor: collapsible ? 'pointer' : 'default',
          padding: '14px 18px', background: 'transparent', border: 'none', textAlign: 'left',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: 'rgba(255,255,255,0.55)',
        }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
          {title}
          {count != null && (
            <span style={{
              fontSize: 9, padding: '2px 8px', borderRadius: 999,
              background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.65)', letterSpacing: '0.1em',
            }}>{count}</span>
          )}
        </span>
        {collapsible && (
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"/>
          </svg>
        )}
      </button>
      {isOpen && (
        <div style={{
          padding: '0 18px 18px',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>{children}</div>
      )}
    </div>
  );
}

// Smart image processor.
//  • Skip-if-good   — if source is already small enough, keep the original bytes (no recompression).
//  • Crop to aspect — center-crop when an aspect is given (e.g. 16:9 for posters).
//  • Resize down    — never upscale.
//  • WebP @ high q  — fallback to JPEG/PNG if WebP unavailable.
function imageToDataUrl(file, opts = {}) {
  const { maxW = 1920, maxH = 1080, aspect = null, quality = 0.95 } = opts;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const img = new Image();
      img.onerror = () => reject(new Error('decode failed'));
      img.onload = () => {
        // ⚡ FAST-PATH: if no aspect-crop needed, file is already small (≤700KB),
        // already at/under the target size, AND already a modern format → keep original bytes.
        const needsCrop  = !!aspect;
        const tooBig     = img.width > maxW || img.height > maxH;
        const fileBigKB  = file.size / 1024;
        const isModern   = /^image\/(webp|jpeg|png)$/.test(file.type);
        if (!needsCrop && !tooBig && fileBigKB <= 700 && isModern) {
          return resolve(dataUrl);
        }

        // Otherwise: process through canvas.
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
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  });
}

function SlidePreview({ slide }) {
  const hasText  = !!(slide.title || slide.content);
  const isPoster = slide.type === 'poster' || (slide.bgUrl && !hasText);
  const isDonation = slide.type === 'donation';

  return (
    <div style={{
      width: '100%', aspectRatio: '16/9',
      borderRadius: 14, overflow: 'hidden', position: 'relative',
      background: 'linear-gradient(180deg, #1a1432 0%, #0a1a2e 40%, #050b1a 100%)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
    }}>
      {/* Faux sky */}
      <div style={{ position: 'absolute', top: '-20%', right: '5%', width: '40%', height: '60%', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,180,140,0.30), transparent 60%)', filter: 'blur(20px)' }} />
      {/* Glass panel */}
      <div style={{
        position: 'absolute', inset: '8%',
        background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 10, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      }}>
        {isPoster ? (
          slide.bgUrl ? (
            <img src={slide.bgUrl} alt=""
                 style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.30)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
              <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Belum ada gambar</span>
            </div>
          )
        ) : isDonation ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 50px', gap: 10, width: '100%', padding: '4% 6%', height: '100%', alignItems: 'center', textAlign: 'left' }}>
            <div style={{ minWidth: 0 }}>
              <span style={{ display: 'inline-block', padding: '1px 5px', borderRadius: 999, fontSize: 5, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(52,211,153,0.2)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', marginBottom: 4 }}>Kutipan Kebajikan</span>
              <div style={{ fontSize: 9, fontWeight: 900, color: 'white', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{slide.title || 'Tabung Pembangunan'}</div>
              <div style={{ fontSize: 5, color: 'rgba(255,255,255,0.5)', marginTop: 2, height: 12, overflow: 'hidden', textOverflow: 'ellipsis' }}>{slide.content || 'Sumbangan anda untuk dewan solat utama.'}</div>
              
              {/* Mini progress track */}
              <div style={{ width: '100%', height: 4, borderRadius: 999, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', marginTop: 4, overflow: 'hidden' }}>
                <div style={{ width: '69%', height: '100%', background: '#10b981' }} />
              </div>
              <div style={{ fontSize: 5, fontWeight: 700, color: '#34d399', marginTop: 2 }}>RM 3,450 / RM 5,000 (69%)</div>
            </div>
            
            <div style={{ width: 44, height: 44, borderRadius: 6, background: 'white', padding: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {/* Mini simulated QR code */}
              <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
                <rect width="24" height="24" fill="#fff" rx="2"/>
                <rect x="2" y="2" width="6" height="6" fill="#000"/>
                <rect x="16" y="2" width="6" height="6" fill="#000"/>
                <rect x="2" y="16" width="6" height="6" fill="#000"/>
                <rect x="10" y="10" width="4" height="4" fill="#f43f5e" rx="1"/>
                <path d="M10 2h4v4h-4zM2 10h4v4H2zM18 10h4v4h-4zM10 18h4v4h-4z" fill="#000"/>
              </svg>
            </div>
          </div>
        ) : (
          <>
            {slide.bgUrl && (
              <img src={slide.bgUrl} alt=""
                   style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.18 }} />
            )}
            <div style={{ position: 'relative', zIndex: 1, padding: '6%' }}>
              {slide.label && (
                <span style={{
                  display: 'inline-block', padding: '2px 8px', borderRadius: 999,
                  fontSize: 6, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em',
                  background: 'rgba(244,63,94,0.25)', color: '#fda4af',
                  border: '1px solid rgba(244,63,94,0.40)', marginBottom: 6,
                }}>{slide.label}</span>
              )}
              <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: '-0.025em', textTransform: 'uppercase', lineHeight: 1.1, color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
                {slide.title || '(Tanpa Tajuk)'}
              </div>
              {slide.content && (
                <div style={{ fontSize: 7, color: 'rgba(255,255,255,0.65)', fontWeight: 700, marginTop: 4, lineHeight: 1.3, maxHeight: 30, overflow: 'hidden' }}>
                  {slide.content}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {/* Mode pill */}
      <div style={{
        position: 'absolute', top: 6, left: 6,
        padding: '2px 7px', borderRadius: 999,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        fontSize: 6, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
        color: isPoster ? '#c084fc' : isDonation ? '#34d399' : '#fda4af',
      }}>{isPoster ? 'Mod Poster' : isDonation ? 'Mod Infaq' : 'Mod Teks'}</div>
    </div>
  );
}

function dateInput(value, onChange, placeholder) {
  return (
    <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value || null)}
      style={{
        font: 'inherit', flex: 1, padding: '8px 10px', borderRadius: 10,
        background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.08)',
        color: value ? 'white' : 'rgba(255,255,255,0.40)', fontSize: 11, fontWeight: 700, outline: 'none',
      }} />
  );
}

function slideStatus(slide) {
  const today = new Date().toISOString().slice(0, 10);
  if (slide.active === false) return { label: 'JEDA', color: '#fbbf24', bg: 'rgba(245,158,11,0.15)', bd: 'rgba(245,158,11,0.30)' };
  if (slide.startDate && slide.startDate > today) return { label: 'AKAN DATANG', color: '#93c5fd', bg: 'rgba(59,130,246,0.15)', bd: 'rgba(59,130,246,0.30)' };
  if (slide.endDate   && slide.endDate   < today) return { label: 'TAMAT',       color: 'rgba(255,255,255,0.40)', bg: 'rgba(255,255,255,0.05)', bd: 'rgba(255,255,255,0.10)' };
  return { label: 'AKTIF', color: '#34d399', bg: 'rgba(16,185,129,0.15)', bd: 'rgba(16,185,129,0.30)' };
}

function SlideEditor({ slide, onSave, onCancel, onAutoSave }) {
  const [draft, setDraft] = useState({ ...slide });
  const [busy, setBusy] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  // Subscribe to profile so image library updates live
  const [profile, setProfile] = window.RL_STATE.useProfile();
  const imageLib = profile.imageLibrary || [];

  // Auto-save (debounced 600ms) — flash "Tersimpan ✓" pill
  React.useEffect(() => {
    if (JSON.stringify(draft) === JSON.stringify(slide)) return;
    const t = setTimeout(() => {
      onAutoSave?.(draft);
      setSavedAt(Date.now());
    }, 600);
    return () => clearTimeout(t);
  }, [draft]);

  const onPic = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const isPoster = draft.type === 'poster';
      const url = await imageToDataUrl(file, {
        aspect:  isPoster ? 16 / 9 : null,
        maxW:    1920,
        maxH:    1080,
        quality: isPoster ? 0.98 : 0.95,
      });
      setDraft(d => ({ ...d, bgUrl: url }));
      // Save to image library (live via setProfile)
      const lib = profile.imageLibrary || [];
      if (!lib.includes(url)) {
        setProfile({ imageLibrary: [url, ...lib].slice(0, 12) });
      }
    } catch (e) {} finally { setBusy(false); }
  };

  // (imageLib already declared above)

  const isPoster = draft.type === 'poster';
  const isDonation = draft.type === 'donation';
  const isAnnouncement = draft.type === 'announcement' || (!isPoster && !isDonation);
  const showSaved = savedAt && (Date.now() - savedAt < 2200);

  return (
    <div style={{ background: 'rgba(244,63,94,0.08)', border: '2px solid rgba(244,63,94,0.30)', borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 9, fontWeight: 900, color: '#fb7185', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Slaid #{draft.id}</span>
          {showSaved && (
            <span style={{ fontSize: 9, fontWeight: 900, color: '#34d399', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4, animation: 'rl-fade 300ms ease' }}>
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>
              Tersimpan
            </span>
          )}
        </div>
        <button onClick={onCancel} style={{
          font: 'inherit', cursor: 'pointer',
          padding: '6px 12px', borderRadius: 999,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
          color: 'rgba(255,255,255,0.7)',
          fontSize: 10, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
          Selesai
        </button>
      </div>

      {/* Mode toggle — replaces the "Jenis" dropdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
        <button onClick={() => setDraft(d => ({ ...d, type: 'announcement' }))} style={{
          font: 'inherit', cursor: 'pointer',
          padding: '12px 4px', borderRadius: 14,
          background: isAnnouncement ? 'rgba(244,63,94,0.20)' : 'rgba(255,255,255,0.04)',
          border: '2px solid ' + (isAnnouncement ? '#f43f5e' : 'rgba(255,255,255,0.08)'),
          color: isAnnouncement ? 'white' : 'rgba(255,255,255,0.45)',
          fontSize: 10, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <span style={{ fontSize: 18 }}>📝</span>
          Teks
        </button>
        <button onClick={() => setDraft(d => ({ ...d, type: 'donation' }))} style={{
          font: 'inherit', cursor: 'pointer',
          padding: '12px 4px', borderRadius: 14,
          background: isDonation ? 'rgba(16,185,129,0.20)' : 'rgba(255,255,255,0.04)',
          border: '2px solid ' + (isDonation ? '#10b981' : 'rgba(255,255,255,0.08)'),
          color: isDonation ? 'white' : 'rgba(255,255,255,0.45)',
          fontSize: 10, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <span style={{ fontSize: 18 }}>💰</span>
          Infaq
        </button>
        <button onClick={() => setDraft(d => ({ ...d, type: 'poster' }))} style={{
          font: 'inherit', cursor: 'pointer',
          padding: '12px 4px', borderRadius: 14,
          background: isPoster ? 'rgba(168,85,247,0.20)' : 'rgba(255,255,255,0.04)',
          border: '2px solid ' + (isPoster ? '#a855f7' : 'rgba(255,255,255,0.08)'),
          color: isPoster ? 'white' : 'rgba(255,255,255,0.45)',
          fontSize: 10, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <span style={{ fontSize: 18 }}>🖼️</span>
          Gambar
        </button>
      </div>

      {/* Live preview */}
      <div>
        <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Pratonton</span>
        <div style={{ marginTop: 4 }}><SlidePreview slide={draft} /></div>
      </div>

      {/* Label only */}
      <label style={{ display: 'block' }}>
        <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Label</span>
        <select value={draft.label} onChange={e => setDraft(d => ({...d, label: e.target.value}))}
          style={{ font: 'inherit', width: '100%', marginTop: 4, padding: '10px 12px', borderRadius: 12, background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 12, fontWeight: 700 }}>
          {LABELS.map(l => <option key={l} value={l} style={{background:'#1c0e21'}}>{l}</option>)}
        </select>
      </label>

      {!isPoster && (
        <>
          <label style={{ display: 'block' }}>
            <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Tajuk</span>
            <input value={draft.title || ''} onChange={e => setDraft(d => ({...d, title: e.target.value}))}
              style={{ font: 'inherit', width: '100%', marginTop: 4, padding: '10px 12px', borderRadius: 12, background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 13, fontWeight: 700, outline: 'none' }} />
          </label>
          <label style={{ display: 'block' }}>
            <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Kandungan</span>
            <textarea value={draft.content || ''} onChange={e => setDraft(d => ({...d, content: e.target.value}))} rows={3}
              style={{ font: 'inherit', width: '100%', marginTop: 4, padding: '10px 12px', borderRadius: 12, background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 12, fontWeight: 600, outline: 'none', resize: 'vertical' }} />
          </label>
        </>
      )}

      <label style={{ display: 'block' }}>
        <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
          Gambar {isPoster ? '(diperlukan)' : '(pilihan)'}
        </span>
        <div style={{ marginTop: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
          {draft.bgUrl && <img src={draft.bgUrl} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} alt="" />}
          <label style={{ flex: 1, padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.15)', cursor: 'pointer', textAlign: 'center', fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
            {busy ? 'Memproses...' : (draft.bgUrl ? '✓ Tukar Gambar' : 'Pilih Fail')}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => onPic(e.target.files?.[0])} />
          </label>
          {draft.bgUrl && (
            <button onClick={() => setDraft(d => ({ ...d, bgUrl: null }))} style={{ font: 'inherit', cursor: 'pointer', padding: '8px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.40)' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          )}
        </div>
      </label>

      {/* Image library — reuse previously uploaded images */}
      {imageLib.length > 0 && (
        <div>
          <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Pustaka Gambar</span>
          <div style={{ marginTop: 4, display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {imageLib.map((url, i) => (
              <button key={i} onClick={() => setDraft(d => ({ ...d, bgUrl: url }))}
                style={{
                  font: 'inherit', cursor: 'pointer', flexShrink: 0,
                  width: 56, height: 56, padding: 0, borderRadius: 10,
                  background: 'transparent',
                  border: '2px solid ' + (draft.bgUrl === url ? '#f43f5e' : 'rgba(255,255,255,0.10)'),
                  overflow: 'hidden',
                }}>
                <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Schedule */}
      <div>
        <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Tarikh Aktif (pilihan)</span>
        <div style={{ marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}>
          {dateInput(draft.startDate, (v) => setDraft(d => ({ ...d, startDate: v })), 'Mula')}
          <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.30)' }}>→</span>
          {dateInput(draft.endDate, (v) => setDraft(d => ({ ...d, endDate: v })), 'Tamat')}
        </div>
      </div>

      {/* Active toggle */}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(0,0,0,0.30)', borderRadius: 12 }}>
        <input type="checkbox" checked={draft.active !== false} onChange={e => setDraft(d => ({ ...d, active: e.target.checked }))}
          style={{ width: 16, height: 16, accentColor: '#f43f5e' }} />
        <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.75)' }}>Slaid Aktif (papar di TV)</span>
      </label>

      <style>{`@keyframes rl-fade { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}
function SlideRow({ s, index, onEdit, onDelete, onReorder, selected, onToggleSelect, inBulk }) {
  const isPoster = s.type === 'poster';
  const isDonation = s.type === 'donation';
  const labelColor = isPoster ? '#c084fc' : isDonation ? '#34d399' : (s.label === 'MAKLUMAN' ? '#fda4af' : '#93c5fd');
  const labelBg    = isPoster ? 'rgba(168,85,247,0.20)' : isDonation ? 'rgba(52,211,153,0.15)' : (s.label === 'MAKLUMAN' ? 'rgba(244,63,94,0.25)' : 'rgba(59,130,246,0.20)');
  const labelBd    = isPoster ? 'rgba(168,85,247,0.30)' : isDonation ? 'rgba(52,211,153,0.30)' : (s.label === 'MAKLUMAN' ? 'rgba(244,63,94,0.40)' : 'rgba(59,130,246,0.30)');
  const status     = slideStatus(s);
  // Swipe-to-delete state
  const [dx, setDx] = useState(0);
  const startX = React.useRef(null);
  const startY = React.useRef(null);
  const locked = React.useRef(null); // 'h' | 'v' once direction is locked

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    locked.current = null;
  };
  const onTouchMove = (e) => {
    if (startX.current == null) return;
    const ax = e.touches[0].clientX - startX.current;
    const ay = e.touches[0].clientY - startY.current;
    if (!locked.current) {
      if (Math.abs(ax) > 8 || Math.abs(ay) > 8) {
        locked.current = Math.abs(ax) > Math.abs(ay) ? 'h' : 'v';
      }
    }
    if (locked.current === 'h') {
      e.preventDefault?.();
      setDx(Math.min(0, ax)); // only allow leftward
    }
  };
  const onTouchEnd = () => {
    if (locked.current === 'h' && dx < -90) {
      onDelete();
    }
    setDx(0); startX.current = null; locked.current = null;
  };

  // HTML5 drag (desktop)
  const onDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };
  const onDragOver = (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const onDrop = (e) => {
    e.preventDefault();
    const from = Number(e.dataTransfer.getData('text/plain'));
    if (!isNaN(from) && from !== index) onReorder(from, index);
  };

  return (
    <div style={{ position: 'relative' }}
         onDragOver={onDragOver} onDrop={onDrop}>
      {/* Swipe-delete background */}
      {dx < 0 && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 18,
          background: 'linear-gradient(90deg, transparent 40%, #e11d48)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          paddingRight: 20, color: 'white',
          fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          {dx < -90 ? '↻ Lepas untuk Padam' : '← Sapu'}
        </div>
      )}

      <div
        draggable
        onDragStart={onDragStart}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={() => { if (inBulk) onToggleSelect(); }}
        style={{
          background: selected ? 'rgba(244,63,94,0.15)' : 'rgba(0,0,0,0.30)', borderRadius: 18, padding: 12,
          border: '1px solid ' + (selected ? 'rgba(244,63,94,0.45)' : 'rgba(255,255,255,0.05)'),
          display: 'flex', gap: 10, alignItems: 'center',
          opacity: status.label === 'TAMAT' || status.label === 'JEDA' ? 0.55 : 1,
          transform: `translateX(${dx}px)`,
          transition: dx === 0 ? 'all 0.25s ease' : 'none',
          touchAction: 'pan-y', cursor: inBulk ? 'pointer' : 'grab',
        }}>
        {/* Selection checkbox */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
          style={{
            font: 'inherit', cursor: 'pointer', flexShrink: 0,
            width: 22, height: 22, borderRadius: 6, padding: 0,
            background: selected ? '#e11d48' : 'rgba(0,0,0,0.40)',
            border: '1.5px solid ' + (selected ? '#fb7185' : 'rgba(255,255,255,0.20)'),
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          }}>
          {selected && (
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M5 13l4 4L19 7"/>
            </svg>
          )}
        </button>
        {/* Drag handle */}
        <div style={{
          width: 24, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'rgba(255,255,255,0.35)', cursor: 'grab',
        }}>
          <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9"  cy="6"  r="1.5"/><circle cx="15" cy="6"  r="1.5"/>
            <circle cx="9"  cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/>
            <circle cx="9"  cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/>
          </svg>
        </div>

        {s.bgUrl ? (
          <img src={s.bgUrl} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{
            width: 52, height: 52, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg,#1e1330,#0e0818)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.30)',
          }}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', padding: '2px 7px', borderRadius: 999, background: labelBg, color: labelColor, border: '1px solid', borderColor: labelBd }}>{s.label}</span>
            <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', padding: '2px 7px', borderRadius: 999, background: status.bg, color: status.color, border: '1px solid', borderColor: status.bd }}>{status.label}</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.015em', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.title || (isPoster ? 'Poster' : '(tanpa tajuk)')}</div>
          {s.updatedAt && Date.now() - s.updatedAt < 60000 && (
            <span style={{ fontSize: 8, fontWeight: 900, color: 'var(--rl-accent-light, #fb7185)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              ✦ Baru Dikemaskini
            </span>
          )}
          {(() => {
            const stats = (window.RL_STATE?.loadProfile() || {}).slideStats || {};
            const count = stats[s.id] || 0;
            return count > 0 ? (
              <div style={{ fontSize: 9, color: 'rgba(253,164,175,0.7)', fontWeight: 700, marginTop: 2, letterSpacing: '0.1em' }}>
                👁 {count} tayangan
              </div>
            ) : null;
          })()}
          {(s.startDate || s.endDate) && (
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.40)', fontWeight: 700, marginTop: 2 }}>
              📅 {s.startDate || '∞'} → {s.endDate || '∞'}
            </div>
          )}
        </div>
        <button onClick={onEdit} style={{ font: 'inherit', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)', borderRadius: 10, padding: '6px 10px', fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Edit</button>
      </div>
    </div>
  );
}
const TEMPLATES = [
  { id: 'gotong',  emoji: '🧹', name: 'Gotong-Royong',
    seed: { type: 'announcement', label: 'MAKLUMAN', title: 'GOTONG-ROYONG MASJID',
            content: 'Gotong-royong perdana akan diadakan Sabtu ini jam 8:00 pagi. Sila bawa peralatan masing-masing.' } },
  { id: 'ramadan', emoji: '🌙', name: 'Bulan Ramadan',
    seed: { type: 'announcement', label: 'INFO', title: 'SELAMAT MENYAMBUT RAMADAN',
            content: 'Marilah kita meningkatkan amal ibadah di bulan yang penuh keberkatan ini.' } },
  { id: 'tabung',  emoji: '💰', name: 'Tabung Masjid',
    seed: { type: 'donation', label: 'INFO', title: 'TABUNG INFAQ MASJID',
            content: 'Sumbangan anda untuk fasa menaik taraf dewan solat utama dan kebajikan jemaah.' } },
  { id: 'jumaat',  emoji: '🕌', name: 'Solat Jumaat',
    seed: { type: 'announcement', label: 'MAKLUMAN', title: 'SOLAT JUMAAT',
            content: 'Khatib bertugas minggu ini: Ustaz Ahmad bin Abdullah. Sila datang awal untuk dapat saf hadapan.' } },
  { id: 'raya',    emoji: '🎉', name: 'Hari Raya',
    seed: { type: 'announcement', label: 'INFO', title: 'SELAMAT HARI RAYA AIDILFITRI',
            content: 'Maaf zahir & batin. Solat Sunat Aidilfitri pukul 8:00 pagi.' } },
  { id: 'kelas',   emoji: '📖', name: 'Kelas Agama',
    seed: { type: 'announcement', label: 'INFO', title: 'KELAS PENGAJIAN MINGGUAN',
            content: 'Kelas tafsir Al-Quran setiap Rabu selepas Maghrib. Semua jemaah dijemput hadir.' } },
];
function TemplatePicker({ onPick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <p style={{ margin: 0, fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
        Atau mulakan dengan template
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {TEMPLATES.map(t => (
          <button key={t.id} onClick={() => onPick(t.seed)} style={{
            font: 'inherit', cursor: 'pointer',
            padding: '14px 12px', borderRadius: 16,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'white', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 20, lineHeight: 1, flexShrink: 0 }}>{t.emoji}</span>
            <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.05em', textTransform: 'uppercase', lineHeight: 1.2 }}>{t.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SmallEmpty({ emoji, title, body }) {
  return (
    <div style={{
      padding: 18, borderRadius: 16,
      background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center',
    }}>
      <div style={{ fontSize: 32, lineHeight: 1, opacity: 0.7 }}>{emoji}</div>
      <h4 style={{ margin: 0, fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.015em' }}>{title}</h4>
      <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.40)', lineHeight: 1.45, maxWidth: 260 }}>{body}</p>
    </div>
  );
}

function EmptyState({ onAdd, onPickTemplate }) {
  return (
    <div style={{
      padding: 20, borderRadius: 18,
      background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.10)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.30)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fb7185',
      }}>
        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-5 7h6m-6 4h6"/></svg>
      </div>
      <div>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.015em' }}>Belum ada slaid</h4>
        <p style={{ margin: '6px 0 0', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4, maxWidth: 280 }}>
          Mulakan dengan slaid pertama anda — pilih template di bawah atau buat dari kosong.
        </p>
      </div>
      <button onClick={onAdd} style={{
        font: 'inherit', cursor: 'pointer', width: '100%',
        padding: '12px 16px', borderRadius: 14,
        background: 'var(--rl-accent-dark, #e11d48)', color: 'white', border: 'none',
        fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
        boxShadow: '0 12px 30px var(--rl-accent-shadow, rgba(76,5,25,0.5))',
      }}>+ Buat Slaid Kosong</button>
      <TemplatePicker onPick={onPickTemplate} />
    </div>
  );
}

function AddFab({ onAddBlank, onTemplate, onAddNotice, onOpenUpload }) {
  const [open, setOpen] = useState(false);
  const fileRef = React.useRef(null);
  return (
    <>
      {/* Bottom-right floating action button — appears above the tab bar */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Tambah"
        style={{
          position: 'fixed', left: 20, bottom: 100, zIndex: 60,
          width: 56, height: 56, borderRadius: '50%',
          background: '#e11d48',
          border: '1px solid rgba(255,255,255,0.10)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 14px 30px rgba(76,5,25,0.7), 0 0 0 1px rgba(244,63,94,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
          transform: open ? 'rotate(45deg) scale(1.05)' : 'rotate(0) scale(1)',
          transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1)',
          font: 'inherit', color: 'white',
        }}>
        <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/>
        </svg>
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 55,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
          animation: 'fadeIn 200ms ease',
        }}>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes sheetUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          `}</style>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed', left: 14, right: 14, bottom: 120,
              padding: 14, borderRadius: 24,
              background: 'linear-gradient(180deg, rgba(40,19,46,0.96), rgba(20,10,26,0.96))',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
              display: 'flex', flexDirection: 'column', gap: 8,
              animation: 'sheetUp 280ms cubic-bezier(0.34,1.56,0.64,1)',
            }}>
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.40)' }}>Tambah Kandungan</span>
            </div>

            {[
              { icon: '📝', title: 'Slaid Kosong',  sub: 'Bermula dari helaian kosong', on: onAddBlank,   color: 'var(--rl-accent-light, #fb7185)' },
              { icon: '🧹', title: 'Dari Template', sub: 'Pilih dari 6 template siap',  on: onTemplate,   color: '#c084fc' },
              { icon: '📢', title: 'Makluman',      sub: 'Tambah teks dalam ticker',     on: onAddNotice,  color: '#93c5fd' },
            ].map(item => (
              <button key={item.title}
                onClick={() => { item.on(); setOpen(false); }}
                style={{
                  font: 'inherit', cursor: 'pointer',
                  padding: '14px 14px', borderRadius: 16,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                <span style={{ fontSize: 24 }}>{item.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.015em' }}>{item.title}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{item.sub}</div>
                </div>
                <svg width="14" height="14" fill="none" stroke={item.color} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
              </button>
            ))}

            {/* Upload uses native label trigger — most reliable cross-browser */}
            <button onClick={() => { setOpen(false); onOpenUpload?.(); }}
              style={{
                font: 'inherit', cursor: 'pointer',
                padding: '14px 14px', borderRadius: 16,
                background: 'rgba(52,211,153,0.10)',
                border: '1px solid rgba(52,211,153,0.30)',
                color: 'white', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
              <span style={{ fontSize: 24 }}>🖼️</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.015em' }}>Upload Gambar</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Buka skrin upload penuh</div>
              </div>
              <svg width="14" height="14" fill="none" stroke="#34d399" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
            </button>

            <button onClick={() => setOpen(false)} style={{
              font: 'inherit', cursor: 'pointer', marginTop: 2,
              padding: '12px', borderRadius: 14,
              background: 'transparent', color: 'rgba(255,255,255,0.45)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>Tutup</button>
          </div>
        </div>
      )}
    </>
  );
}

function NoticeRow({ text, i, onDelete }) {
  const [dx, setDx] = useState(0);
  const startX = React.useRef(null);
  const startY = React.useRef(null);
  const locked = React.useRef(null);

  const onTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    locked.current = null;
  };
  const onTouchMove = (e) => {
    if (startX.current == null) return;
    const ax = e.touches[0].clientX - startX.current;
    const ay = e.touches[0].clientY - startY.current;
    if (!locked.current && (Math.abs(ax) > 8 || Math.abs(ay) > 8)) {
      locked.current = Math.abs(ax) > Math.abs(ay) ? 'h' : 'v';
    }
    if (locked.current === 'h') setDx(Math.min(0, ax));
  };
  const onTouchEnd = () => {
    if (locked.current === 'h' && dx < -90) onDelete();
    setDx(0); startX.current = null; locked.current = null;
  };

  return (
    <div style={{ position: 'relative' }}>
      {dx < 0 && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 14,
          background: 'linear-gradient(90deg, transparent 40%, #e11d48)',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          paddingRight: 20, color: 'white',
          fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>
          {dx < -90 ? '↻ Lepas untuk Padam' : '← Sapu'}
        </div>
      )}
      <div
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        style={{
          background: 'rgba(0,0,0,0.30)', borderRadius: 14, padding: 12,
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex', alignItems: 'center', gap: 10,
          transform: `translateX(${dx}px)`,
          transition: dx === 0 ? 'transform 0.25s ease' : 'none',
          touchAction: 'pan-y',
        }}>
        <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.20)', letterSpacing: '0.2em', flexShrink: 0 }}>#{i + 1}</span>
        <p style={{ margin: 0, flex: 1, fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.80)', lineHeight: 1.4 }}>{text}</p>
        <button onClick={onDelete} style={{ font: 'inherit', cursor: 'pointer', background: 'none', border: 'none', color: 'rgba(255,255,255,0.30)', padding: 4 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
    </div>
  );
}

function btnSm(bg = 'rgba(255,255,255,0.08)', color = 'white') {
  return {
    font: 'inherit', cursor: 'pointer',
    padding: '6px 12px', borderRadius: 10,
    background: bg, color, border: '1px solid rgba(255,255,255,0.10)',
    fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase',
  };
}

function KandunganTab() {
  const [profile, setProfile] = window.RL_STATE.useProfile();
  const slides = profile.slides || DEFAULT_SLIDES;
  const notices = profile.notices || [
    'Selamat Datang ke Masjid Al-Falah.',
    'Sila pastikan telefon bimbit anda diletakkan dalam mod senyap.',
  ];

  const [editingId, setEditingId] = useState(null);
  const [newNotice, setNewNotice] = useState('');
  const [toast, setToast] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const showToast = (msg, undo = null) => {
    setToast({ msg, undo, t: Date.now() });
    setTimeout(() => setToast(t => t && t.msg === msg ? null : t), 4000);
  };
  const inBulk = selected.size > 0;
  const toggleSelect = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };
  const selectAll  = () => setSelected(new Set(slides.map(s => s.id)));
  const clearSel   = () => setSelected(new Set());

  const khutbahSlides = profile.khutbahSlides || [];
  const khutbahTitle  = profile.khutbahTitle  || '';
  const setKhutbahSlides = (s) => setProfile({ khutbahSlides: s });
  const setKhutbahTitle  = (t) => setProfile({ khutbahTitle: t });

  const saveSlides = (next) => setProfile({ slides: next });
  const nextId = () => (Math.max(0, ...slides.map(s => s.id || 0)) || 0) + 1;

  const updateSlide = (next) => {
    saveSlides(slides.map(s => s.id === next.id ? { ...next, updatedAt: Date.now() } : s));
  };
  const closeEditor = () => {
    showToast('Slaid disimpan ✓');
    setEditingId(null);
  };
  const deleteSlide = (id) => {
    if (!confirm('Padam slaid ini?')) return;
    const prev = slides;
    saveSlides(slides.filter(s => s.id !== id));
    showToast('Slaid dipadam', () => saveSlides(prev));
  };
  const bulkDelete = () => {
    if (!confirm(`Padam ${selected.size} slaid?`)) return;
    const prev = slides;
    const n = selected.size;
    saveSlides(slides.filter(s => !selected.has(s.id)));
    showToast(`${n} slaid dipadam`, () => saveSlides(prev));
    clearSel();
  };
  const bulkToggle = (active) => {
    saveSlides(slides.map(s => selected.has(s.id) ? { ...s, active } : s));
    showToast(active ? 'Slaid diaktifkan ✓' : 'Slaid dijeda ✓');
    clearSel();
  };
  const bulkDuplicate = () => {
    let id = nextId();
    const dupes = slides.filter(s => selected.has(s.id))
      .map(s => ({ ...s, id: id++, title: (s.title || '') + ' (Salinan)' }));
    saveSlides([...slides, ...dupes]);
    showToast(`${dupes.length} salinan dibuat ✓`);
    clearSel();
  };
  const move = (from, to) => {
    if (from === to || from < 0 || to < 0 || from >= slides.length || to >= slides.length) return;
    const next = slides.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    saveSlides(next);
  };
  const addSlide = () => {
    const newSlide = {
      id: nextId(),
      type: 'announcement', label: 'INFO',
      title: '', content: '', active: true,
    };
    saveSlides([...slides, newSlide]);
    setEditingId(newSlide.id);
  };
  const addFromTemplate = (seed) => {
    const newSlide = { ...seed, id: nextId(), active: true };
    saveSlides([...slides, newSlide]);
    setEditingId(newSlide.id);
  };

  const addNotice = () => {
    const text = newNotice.trim();
    if (!text) return;
    setProfile({ notices: [...notices, text] });
    setNewNotice('');
  };
  const deleteNotice = (i) => {
    const prev = notices;
    setProfile({ notices: notices.filter((_, j) => j !== i) });
    showToast('Makluman dipadam', () => setProfile({ notices: prev }));
  };
  const [search, setSearch] = useState('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const filteredSlides = search.trim()
    ? slides.filter(s => (s.title + ' ' + (s.content || '') + ' ' + (s.label || '')).toLowerCase().includes(search.toLowerCase()))
    : slides;
  const [noticeFocus, setNoticeFocus] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
      {/* Floating Add button — only on this tab */}
      <AddFab
        onAddBlank={addSlide}
        onTemplate={() => { setShowTemplates(true); setTimeout(() => document.getElementById('rl-templates')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60); }}
        onAddNotice={() => { setNoticeFocus(true); setTimeout(() => document.getElementById('rl-newnotice')?.focus(), 100); }}
        onOpenUpload={() => setUploadOpen(true)}
      />
      {uploadOpen && window.UploadScreen && (
        <window.UploadScreen
          onClose={() => setUploadOpen(false)}
          onSave={(seed) => {
            const newSlide = { ...seed, id: nextId() };
            saveSlides([...slides, newSlide]);
            if (seed.bgUrl) {
              const lib = profile.imageLibrary || [];
              if (!lib.includes(seed.bgUrl)) setProfile({ imageLibrary: [seed.bgUrl, ...lib].slice(0, 12) });
            }
            showToast('Poster ditambah ✓');
          }}
        />
      )}
      <Section title="Senarai Slaid" count={slides.length}>
        {/* Search */}
        {slides.length > 3 && (
          <div style={{ position: 'relative' }}>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari slaid..."
              style={{
                font: 'inherit', width: '100%', padding: '10px 36px 10px 36px', borderRadius: 14,
                background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'white', fontSize: 12, fontWeight: 600, outline: 'none',
              }} />
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.35)', pointerEvents: 'none' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            {search && (
              <button onClick={() => setSearch('')} style={{
                font: 'inherit', cursor: 'pointer', position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)', padding: 4, borderRadius: 999,
                width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            )}
          </div>
        )}
        {selected.size > 0 && (
          <div style={{
            display: 'flex', gap: 6, padding: 10, borderRadius: 14,
            background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.30)',
            alignItems: 'center', flexWrap: 'wrap',
          }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: '#fda4af', letterSpacing: '0.2em', textTransform: 'uppercase', marginRight: 4 }}>
              {selected.size} dipilih
            </span>
            <button onClick={bulkDuplicate} style={btnSm()}>Salin</button>
            <button onClick={() => bulkToggle(true)}  style={btnSm()}>Aktif</button>
            <button onClick={() => bulkToggle(false)} style={btnSm()}>Jeda</button>
            <button onClick={bulkDelete} style={btnSm('#e11d48')}>Padam</button>
            <button onClick={clearSel} style={{ marginLeft: 'auto', ...btnSm('transparent','rgba(255,255,255,0.40)') }}>Batal</button>
          </div>
        )}
        {selected.size === 0 && slides.length > 0 && (
          <button onClick={selectAll} style={{
            font: 'inherit', cursor: 'pointer', alignSelf: 'flex-start',
            padding: '4px 10px', borderRadius: 8,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.50)',
            fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
          }}>Pilih Semua</button>
        )}
        {slides.length === 0 ? (
          <EmptyState onAdd={addSlide} onPickTemplate={addFromTemplate} />
        ) : (
          <>
            {filteredSlides.map((s, i) =>
              editingId === s.id
                ? <SlideEditor key={s.id} slide={s}
                    onAutoSave={updateSlide}
                    onCancel={closeEditor} />
                : <SlideRow key={s.id} s={s} index={slides.indexOf(s)}
                    selected={selected.has(s.id)}
                    onToggleSelect={() => toggleSelect(s.id)}
                    inBulk={inBulk}
                    onEdit={() => setEditingId(s.id)}
                    onDelete={() => deleteSlide(s.id)}
                    onReorder={move} />
            )}
            {search && filteredSlides.length === 0 && (
              <p style={{ margin: 0, padding: 14, textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 700 }}>
                Tiada slaid sepadan dengan "{search}"
              </p>
            )}
            <button onClick={addSlide} style={{
              font: 'inherit', cursor: 'pointer',
              padding: 14, borderRadius: 18,
              background: 'rgba(244,63,94,0.10)', color: '#fb7185',
              border: '2px dashed rgba(244,63,94,0.30)',
              fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
              Tambah Slaid Baru
            </button>
            <details id="rl-templates" open={showTemplates} style={{ marginTop: 4 }}>
              <summary style={{
                cursor: 'pointer', listStyle: 'none',
                padding: '8px 12px', borderRadius: 12,
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.55)', textAlign: 'center',
              }}>
                + Tambah dari Template
              </summary>
              <div style={{ marginTop: 10 }}>
                <TemplatePicker onPick={addFromTemplate} />
              </div>
            </details>
          </>
        )}
      </Section>

      <Section title="Khutbah Jumaat" collapsible defaultOpen={false} count={khutbahSlides.length || null}>
        <window.KhutbahEditor
          slides={khutbahSlides} setSlides={setKhutbahSlides}
          title={khutbahTitle}  setTitle={setKhutbahTitle}
        />
        {khutbahSlides.length === 0 && !khutbahTitle && (
          <SmallEmpty emoji="📖" title="Tiada Khutbah"
            body="Muat naik PDF khutbah JAKIM atau taip secara manual. Akan dipaparkan setiap Jumaat." />
        )}
      </Section>

      <Section title="Makluman Ticker" count={notices.length}>
        {notices.length === 0 ? (
          <SmallEmpty emoji="📢" title="Tiada Makluman"
            body="Makluman akan bergerak di footer TV. Tambah di bawah untuk mula." />
        ) : (
          notices.map((n, i) => (
            <NoticeRow key={i} text={n} i={i} onDelete={() => deleteNotice(i)} />
          ))
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          <input id="rl-newnotice" value={newNotice} onChange={e => setNewNotice(e.target.value)} placeholder="Tambah makluman baru..."
            onKeyDown={e => { if (e.key === 'Enter') addNotice(); }}
            style={{ font: 'inherit', flex: 1, padding: '10px 14px', borderRadius: 14, background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.08)', color: 'white', fontSize: 12, fontWeight: 600, outline: 'none' }} />
          <button onClick={addNotice} disabled={!newNotice.trim()}
            style={{ font: 'inherit', cursor: 'pointer', padding: '10px 14px', borderRadius: 14, background: 'var(--rl-accent-dark, #e11d48)', color: 'white', border: 'none', fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', opacity: newNotice.trim() ? 1 : 0.4 }}>
            Tambah
          </button>
        </div>
      </Section>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 110, left: '50%', transform: 'translateX(-50%)',
          padding: toast.undo ? '8px 8px 8px 16px' : '10px 20px', borderRadius: 999,
          background: toast.undo ? 'rgba(20,10,26,0.95)' : 'rgba(16,185,129,0.95)', color: 'white',
          fontSize: 11, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
          boxShadow: '0 16px 36px rgba(0,0,0,0.5)',
          border: toast.undo ? '1px solid rgba(255,255,255,0.10)' : 'none',
          animation: 'rl-toast 300ms cubic-bezier(0.34,1.56,0.64,1)',
          zIndex: 70, whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span>{toast.msg}</span>
          {toast.undo && (
            <button onClick={() => { toast.undo(); setToast(null); }} style={{
              font: 'inherit', cursor: 'pointer',
              padding: '6px 14px', borderRadius: 999,
              background: 'var(--rl-accent-dark, #e11d48)', color: 'white', border: 'none',
              fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>↶ Undo</button>
          )}
        </div>
      )}
      <style>{`@keyframes rl-toast { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
    </div>
  );
}

window.KandunganTab = KandunganTab;
