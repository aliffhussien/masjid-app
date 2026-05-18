/* global React, pdfjsLib */
// KhutbahEditor.jsx — manage Khutbah Jumaat slides for the TV display.
// Supports manual entry + PDF upload (e.g. JAKIM e-Khutbah).
// Saved to RL_STATE.khutbahSlides; the Friday TV display reads from there.

const { useState, useRef } = React;
const PDFJS_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.min.mjs';
const PDFJS_WORKER_URL = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.mjs';

let pdfjsPromise = null;
function loadPdfJs() {
  if (pdfjsPromise) return pdfjsPromise;
  pdfjsPromise = import(/* @vite-ignore */ PDFJS_URL).then(mod => {
    mod.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
    return mod;
  });
  return pdfjsPromise;
}

// Detect Arabic characters (U+0600 – U+06FF + presentation forms)
const ARABIC_RE = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;
const isArabic = (s) => ARABIC_RE.test(s);

/**
 * Smart parser: turns raw PDF text into candidate slide pairs (ar + ms).
 * Strategy: walk paragraphs; when we see an Arabic line, take it as `ar`
 * and capture the next non-empty Latin paragraph as `ms`. Also detect a
 * likely title (first ALL-CAPS or "KHUTBAH" line).
 */
function parseToSlides(rawText) {
  const lines = rawText
    .split(/\n+/)
    .map(l => l.replace(/\s+/g, ' ').trim())
    .filter(l => l.length > 2 && l.length < 600);

  let title = null;
  const slides = [];
  let pendingAr = null;

  for (const line of lines) {
    // Title heuristic: short ALL-CAPS line near the top, or starts with "KHUTBAH"
    if (!title && (
      /^KHUTBAH/i.test(line) ||
      (line.length < 80 && line === line.toUpperCase() && /[A-Z]/.test(line))
    )) {
      title = line;
      continue;
    }
    if (isArabic(line)) {
      // If we already had pending Arabic, push it without translation
      if (pendingAr) slides.push({ ar: pendingAr, ms: '' });
      pendingAr = line;
    } else {
      if (pendingAr && line.length > 16) {
        slides.push({ ar: pendingAr, ms: line });
        pendingAr = null;
      } else if (!pendingAr && line.length > 60) {
        // Standalone Malay paragraph — useful as a teaching slide
        slides.push({ ar: '', ms: line });
      }
    }
  }
  if (pendingAr) slides.push({ ar: pendingAr, ms: '' });
  return { title, slides: slides.slice(0, 8) };
}

async function extractPdfText(file) {
  const pdfjs = await loadPdfJs();
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buf }).promise;
  let all = '';
  const pages = Math.min(pdf.numPages, 6); // first 6 pages is enough for any khutbah
  for (let i = 1; i <= pages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    // Group items by approximate Y so we get line breaks roughly right
    let lastY = null;
    let line = '';
    const lines = [];
    for (const it of tc.items) {
      const y = Math.round(it.transform[5]);
      if (lastY !== null && Math.abs(y - lastY) > 4) {
        if (line.trim()) lines.push(line.trim());
        line = '';
      }
      line += (line && !it.str.startsWith(' ') ? ' ' : '') + it.str;
      lastY = y;
    }
    if (line.trim()) lines.push(line.trim());
    all += lines.join('\n') + '\n';
  }
  return all;
}

function KhutbahSlideRow({ slide, i, onChange, onDelete }) {
  return (
    <div style={{
      background: 'rgba(0,0,0,0.30)', borderRadius: 16, padding: 12,
      border: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
        <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(192,132,252,0.85)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>Slaid #{i + 1}</span>
        <button onClick={onDelete} style={{ marginLeft: 'auto', font: 'inherit', cursor: 'pointer', background: 'none', border: 'none', color: 'rgba(255,255,255,0.30)', padding: 2 }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <input value={slide.ar} placeholder="Ayat / Hadith (Arab)" dir="rtl"
        onChange={(e) => onChange({ ...slide, ar: e.target.value })}
        style={{
          font: 'inherit', fontFamily: 'Cairo, Outfit, sans-serif',
          padding: '10px 14px', borderRadius: 12,
          background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.08)',
          color: 'white', fontSize: 14, fontWeight: 700,
        }} />
      <textarea value={slide.ms} placeholder="Terjemahan / Mesej (BM)" rows={2}
        onChange={(e) => onChange({ ...slide, ms: e.target.value })}
        style={{
          font: 'inherit', resize: 'vertical',
          padding: '10px 14px', borderRadius: 12,
          background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.08)',
          color: 'white', fontSize: 12, fontWeight: 600,
        }} />
    </div>
  );
}

function KhutbahEditor({ slides, setSlides, title, setTitle }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [msg,  setMsg]  = useState(null);

  const onPdf = async (file) => {
    if (!file) return;
    setMsg(null);
    if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
      setMsg({ tone: 'err', text: 'Sila pilih fail PDF.' }); return;
    }
    setBusy(true);
    try {
      const text = await extractPdfText(file);
      const { title: t, slides: parsed } = parseToSlides(text);
      if (parsed.length === 0) {
        setMsg({ tone: 'err', text: 'Tiada teks ditemui. Cuba PDF lain.' });
      } else {
        if (t) setTitle(t);
        setSlides(parsed);
        setMsg({ tone: 'ok', text: `Diekstrak ${parsed.length} slaid daripada PDF.` });
      }
    } catch (e) {
      console.error(e);
      setMsg({ tone: 'err', text: 'Gagal membaca PDF. Cuba lain.' });
    } finally {
      setBusy(false);
    }
  };

  const updateSlide = (i, next) => {
    const copy = slides.slice();
    copy[i] = next;
    setSlides(copy);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Title */}
      <label style={{ display: 'block' }}>
        <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Tajuk Khutbah</span>
        <input value={title || ''} placeholder="cth. Khutbah Jumaat — Kepentingan Akhlak"
          onChange={(e) => setTitle(e.target.value)}
          style={{
            font: 'inherit', width: '100%', marginTop: 6,
            padding: '12px 14px', borderRadius: 14,
            background: 'rgba(0,0,0,0.40)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'white', fontSize: 13, fontWeight: 700,
          }} />
      </label>

      {/* PDF upload */}
      <div>
        <button onClick={() => fileRef.current?.click()} disabled={busy}
          style={{
            font: 'inherit', cursor: busy ? 'wait' : 'pointer', width: '100%',
            padding: '14px 16px', borderRadius: 16,
            background: 'rgba(168,85,247,0.12)', color: '#c084fc',
            border: '2px dashed rgba(168,85,247,0.35)',
            fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"/></svg>
          {busy ? 'Membaca PDF...' : 'Muat Naik PDF Khutbah'}
        </button>
        <input ref={fileRef} type="file" accept="application/pdf,.pdf" style={{ display: 'none' }}
          onChange={(e) => onPdf(e.target.files?.[0])} />
        <p style={{ margin: '6px 2px 0', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', lineHeight: 1.45, letterSpacing: '0.04em' }}>
          Sokongan: PDF JAKIM e-Khutbah, atau apa-apa teks khutbah. Sistem akan ekstrak ayat Arab & terjemahan secara automatik.
        </p>
        {msg && (
          <p style={{
            margin: '6px 2px 0', fontSize: 10, fontWeight: 700,
            color: msg.tone === 'err' ? '#fb7185' : '#34d399',
          }}>{msg.text}</p>
        )}
      </div>

      {/* Slides */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slides.length === 0 && (
          <div style={{
            padding: 20, textAlign: 'center', borderRadius: 14,
            background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.35)',
          }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>Belum ada slaid khutbah.</p>
            <p style={{ margin: '4px 0 0', fontSize: 9, fontWeight: 700 }}>Muat naik PDF atau tambah secara manual.</p>
          </div>
        )}
        {slides.map((s, i) => (
          <KhutbahSlideRow key={i} slide={s} i={i}
            onChange={(next) => updateSlide(i, next)}
            onDelete={() => setSlides(slides.filter((_, j) => j !== i))} />
        ))}
      </div>

      <button onClick={() => setSlides([...slides, { ar: '', ms: '' }])}
        style={{
          font: 'inherit', cursor: 'pointer',
          padding: '12px 16px', borderRadius: 14,
          background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
        }}>+ Tambah Slaid Manual</button>
    </div>
  );
}

window.KhutbahEditor = KhutbahEditor;
