/* global React */
// NewsTicker.jsx — bottom footer: marquee + brand stripe + edge fades.

const { useState, useEffect } = React;

function NewsTicker({ tickerSpeed = 40 }) {
  const items = window.RL.tickerItems;
  const brandings = window.RL.brandings;
  const [brandIdx, setBrandIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setBrandIdx(i => (i + 1) % brandings.length), 5000);
    return () => clearInterval(t);
  }, [brandings.length]);

  // Duplicate for seamless loop boundary
  const doubled = [...items, ...items].map((it, idx) => ({ ...it, key: idx }));
  const dur = Math.round(4800 / tickerSpeed);

  return (
    <footer style={{
      gridColumn: '1 / -1', borderRadius: 40,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.45) 100%)',
      backdropFilter: 'blur(2px) saturate(120%)',
      WebkitBackdropFilter: 'blur(2px) saturate(120%)',
      border: '1px solid rgba(255,255,255,0.10)',
      display: 'flex', overflow: 'hidden', position: 'relative',
      boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)',
    }}>
      <div style={{ flex: 1, overflow: 'hidden', height: '100%', display: 'flex', alignItems: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: '0 auto 0 0', width: 80, background: 'linear-gradient(to right, rgba(0,0,0,0.2), transparent)', zIndex: 20, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: '0 0 0 auto', width: 80, background: 'linear-gradient(to left, rgba(0,0,0,0.2), transparent)', zIndex: 20, pointerEvents: 'none' }} />

        <div style={{
          display: 'flex', whiteSpace: 'nowrap', alignItems: 'center', gap: 0, height: '100%',
          animation: `rl-marquee ${dur}s linear infinite`,
        }}>
          {doubled.map(item => {
            const isMakluman = item.source === 'MAKLUMAN';
            const badge = isMakluman
              ? { bg: 'rgba(244,63,94,0.25)', fg: '#fda4af', bd: 'rgba(244,63,94,0.40)' }
              : { bg: 'rgba(59,130,246,0.20)', fg: '#93c5fd', bd: 'rgba(59,130,246,0.30)' };
            return (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 14, paddingRight: 48, flexShrink: 0 }}>
                <span style={{
                  padding: '4px 14px', borderRadius: 999, fontSize: 11, fontWeight: 900,
                  textTransform: 'uppercase', letterSpacing: '0.15em',
                  background: badge.bg, color: badge.fg, border: `1px solid ${badge.bd}`,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}>{item.source}</span>
                <p style={{ margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '-0.015em', fontStyle: 'italic', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.6))' }}>
                  {item.title}
                </p>
                <span style={{ color: 'rgba(255,255,255,0.15)', fontWeight: 100, fontSize: 32, userSelect: 'none' }}>·</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{
        width: 200, flexShrink: 0, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(8,8,14,0.97) 0%, rgba(18,18,28,0.95) 100%)',
        borderLeft: '1px solid rgba(255,255,255,0.10)',
      }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: 'var(--rl-accent, #f43f5e)' }} />
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.45em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap' }}>
              {brandings[brandIdx].label}
            </span>
            <span style={{ fontSize: 15, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.015em', lineHeight: 1, whiteSpace: 'nowrap' }}>
              {brandings[brandIdx].value}
            </span>
          </div>
        </div>
      </div>

      <style>{`@keyframes rl-marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }`}</style>
    </footer>
  );
}

window.NewsTicker = NewsTicker;
