/* global React */
// LivePreview.jsx — lightweight TV status card.
// Previously used a full 1920×1080 iframe (WebGL sky + weather canvas + all
// animations running at full res on the phone GPU) — caused overheating and
// crashes on budget devices. Now reads the same shared state and renders a
// plain HTML status card: zero canvas, zero WebGL, zero extra network requests.

const { useEffect, useState } = React;

const PHASE_LABELS = {
  NORMAL:     { label: 'Biasa',    color: '#34d399' },
  PRE_AZAN:   { label: 'Pra-Azan', color: '#f59e0b' },
  AZAN:       { label: 'Azan',     color: '#f43f5e' },
  IQAMAH:     { label: 'Iqamah',   color: '#f59e0b' },
  SOLAT:      { label: 'Solat',    color: '#c084fc' },
  KHUTBAH:    { label: 'Khutbah',  color: '#c084fc' },
  ANNOUNCEMENT:{ label: 'Makluman',color: '#60a5fa' },
  OFF:        { label: 'Biasa',    color: '#34d399' },
};

function LivePreview() {
  const [profile] = window.RL_STATE?.useProfile?.() || [{}];
  const [time, setTime] = useState(new Date());

  // Single 1-second interval — negligible CPU cost
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const phase      = profile.activePhase && profile.activePhase !== 'OFF' ? profile.activePhase : 'NORMAL';
  const paused     = profile.slidePaused || false;
  const idx        = profile.activeSlideIdx || 0;
  const slides     = profile.slides || [];
  const curSlide   = slides[idx];

  const ph     = PHASE_LABELS[phase] || PHASE_LABELS.NORMAL;
  const timeStr = time.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit' });
  const zone    = profile.zone || 'WLY01';

  // Derive a human label for the current slide
  const slideLabel = (() => {
    if (phase !== 'NORMAL') return ph.label;
    if (curSlide) return curSlide.title || (curSlide.type === 'poster' ? 'Poster' : 'Slaid');
    if (idx === 0) return 'Jam Dunia';
    return `Slaid ${idx + 1}`;
  })();

  const totalSlides = slides.length || 1;

  return (
    <div style={{
      borderRadius: 18,
      background: 'rgba(0,0,0,0.45)',
      border: '1px solid rgba(255,255,255,0.07)',
      overflow: 'hidden',
    }}>
      {/* Accent top bar — colour reflects current phase */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, #e11d48 0%, ${ph.color} 100%)`,
        transition: 'background 0.5s ease',
      }} />

      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* TV icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>📺</div>

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0, fontSize: 13, fontWeight: 900,
            textTransform: 'uppercase', letterSpacing: '-0.01em',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            color: 'white',
          }}>{slideLabel}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{
              fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
              padding: '2px 7px', borderRadius: 999,
              background: `${ph.color}22`, color: ph.color,
              border: `1px solid ${ph.color}44`,
            }}>{ph.label}</span>
            {paused && (
              <span style={{
                fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
                padding: '2px 7px', borderRadius: 999,
                background: 'rgba(245,158,11,0.15)', color: '#fbbf24',
                border: '1px solid rgba(245,158,11,0.30)',
              }}>JEDA</span>
            )}
            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.30)' }}>
              {zone}
            </span>
          </div>
        </div>

        {/* Time */}
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <p style={{
            margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: '-0.04em',
            fontVariantNumeric: 'tabular-nums', color: 'white', lineHeight: 1,
          }}>{timeStr}</p>
          {/* LIVE dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 5, justifyContent: 'flex-end' }}>
            <span style={{
              width: 5, height: 5, borderRadius: '50%', background: '#ef4444',
              boxShadow: '0 0 6px #ef4444', animation: 'rl-live-pulse 2s infinite',
            }} />
            <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.50)' }}>
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Slide progress bar — only shown in NORMAL phase */}
      {phase === 'NORMAL' && slides.length > 1 && (
        <div style={{ padding: '0 14px 12px', display: 'flex', gap: 3 }}>
          {slides.slice(0, Math.min(slides.length, 10)).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 3, borderRadius: 99,
              background: i === idx
                ? 'var(--rl-accent, #f43f5e)'
                : 'rgba(255,255,255,0.10)',
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>
      )}

      <style>{`@keyframes rl-live-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}

window.LivePreview = LivePreview;
