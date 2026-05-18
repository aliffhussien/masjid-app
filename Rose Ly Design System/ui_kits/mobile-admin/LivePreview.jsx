/* global React */
// LivePreview.jsx — real TV-display preview, embedded as a scaled iframe.
// Shares localStorage with the admin so logo / name / khutbah changes
// propagate live via the 'storage' event.

const { useRef, useEffect, useState } = React;

function LivePreview() {
  const wrapRef = useRef(null);
  const [scale, setScale] = useState(0.2);

  useEffect(() => {
    const update = () => {
      const w = wrapRef.current?.offsetWidth;
      if (w && w > 0) setScale(w / 1920);
    };
    update();
    let ro;
    if (window.ResizeObserver && wrapRef.current) {
      ro = new ResizeObserver(update);
      ro.observe(wrapRef.current);
    }
    window.addEventListener('resize', update);
    return () => { ro?.disconnect(); window.removeEventListener('resize', update); };
  }, []);

  return (
    <div ref={wrapRef} style={{
      position: 'relative',
      width: '100%', aspectRatio: '16 / 9',
      borderRadius: 16, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.10)',
      background: '#010103',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
    }}>
      {/* The real TV display — scaled down */}
      <iframe
        src="../tv-display/index.html"
        title="Paparan TV"
        loading="lazy"
        style={{
          width: 1920, height: 1080, border: 0,
          transformOrigin: '0 0', transform: `scale(${scale})`,
          pointerEvents: 'none',
          background: '#010103',
        }}
      />

      {/* LIVE indicator pill */}
      <div style={{
        position: 'absolute', top: 8, right: 8,
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '3px 8px', borderRadius: 999,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.10)',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: '#ef4444',
          boxShadow: '0 0 8px #ef4444', animation: 'rl-live-pulse 2s infinite',
        }} />
        <span style={{
          fontSize: 7, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.75)',
        }}>LIVE</span>
      </div>

      <style>{`@keyframes rl-live-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

window.LivePreview = LivePreview;
