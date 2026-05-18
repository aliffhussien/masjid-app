/* global React */
// Splash.jsx — modern intro animation that plays when the wizard first loads.
// Aubergine gradient backdrop, particle field, logo dramatically fades + scales in,
// wordmark types in, tagline reveals, then exits via fade-up. Hands control back via onDone().

const { useState, useEffect, useMemo } = React;

function Splash({ onDone }) {
  const [phase, setPhase] = useState(0); // 0 idle → 1 logo → 2 word → 3 tagline → 4 exit

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1),  100),  // logo in
      setTimeout(() => setPhase(2), 1100),  // wordmark in
      setTimeout(() => setPhase(3), 1800),  // tagline in
      setTimeout(() => setPhase(4), 3400),  // start exit
      setTimeout(() => onDone?.(),  4100),  // hand off
    ];
    return () => timers.forEach(clearTimeout);
  }, [onDone]);

  // Deterministic particle field
  const particles = useMemo(() => {
    let s = 7;
    const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
    return Array.from({ length: 36 }).map((_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      size: rand() * 2 + 0.6,
      delay: rand() * 4,
      duration: 5 + rand() * 6,
      opacity: rand() * 0.5 + 0.2,
    }));
  }, []);

  const visible = phase < 4;
  const wrapOpacity = visible ? 1 : 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at center top, #4a2349 0%, #28132e 35%, #14091a 70%, #0a0610 100%)',
      overflow: 'hidden',
      opacity: wrapOpacity,
      transform: phase >= 4 ? 'scale(1.06)' : 'scale(1)',
      transition: 'opacity 700ms cubic-bezier(0.6,0,0.3,1), transform 1000ms cubic-bezier(0.6,0,0.3,1)',
      pointerEvents: visible ? 'auto' : 'none',
    }}>
      {/* Ambient orbs — themed */}
      <div style={{
        position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
        width: 800, height: 800, borderRadius: '50%',
        background: 'radial-gradient(circle, var(--rl-accent-dim, rgba(244,63,94,0.25)) 0%, transparent 60%)',
        filter: 'blur(60px)', pointerEvents: 'none',
        animation: 'splash-pulse 6s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', left: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,37,74,0.20) 0%, transparent 65%)',
        filter: 'blur(80px)', pointerEvents: 'none',
        animation: 'splash-pulse 8s ease-in-out infinite 1s',
      }} />

      {/* Particle field */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          background: 'white', borderRadius: '50%',
          opacity: p.opacity * (phase >= 1 ? 1 : 0),
          boxShadow: p.size > 1.8 ? '0 0 6px rgba(255,255,255,0.6)' : 'none',
          animation: `splash-float ${p.duration}s ease-in-out ${p.delay}s infinite`,
          transition: 'opacity 1200ms ease',
        }} />
      ))}

      {/* Concentric rings — radiate out behind the logo */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
        {[280, 420, 560].map((d, i) => (
          <div key={d} style={{
            position: 'absolute', width: d, height: d, borderRadius: '50%',
            border: '1px solid rgba(244,63,94,0.18)',
            opacity: phase >= 1 ? 0.7 - i * 0.18 : 0,
            transform: phase >= 1 ? 'scale(1)' : 'scale(0.4)',
            transition: `opacity 1400ms cubic-bezier(0.4,0,0.2,1) ${i * 120}ms, transform 1600ms cubic-bezier(0.34,1.56,0.64,1) ${i * 120}ms`,
            animation: phase >= 2 ? `splash-ringPulse 4s ease-in-out ${i * 0.4}s infinite` : 'none',
          }} />
        ))}
      </div>

      {/* The logo — fades in with scale + soft rotate */}
      <div style={{
        position: 'relative', width: 180, height: 180,
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1
          ? 'scale(1) rotate(0deg)'
          : 'scale(0.55) rotate(-12deg)',
        transition: 'opacity 900ms cubic-bezier(0.34,1.56,0.64,1), transform 1100ms cubic-bezier(0.34,1.56,0.64,1)',
        filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6)) drop-shadow(0 0 80px rgba(244,63,94,0.35))',
        overflow: 'hidden', borderRadius: 44,
      }}>
        <img src="../../assets/logo-mark.png" width="180" height="180" alt="Rose Ly"
             style={{ display: 'block' }} />
        {/* Glint sweep — clipped to the logo's rounded square */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.30) 50%, transparent 70%)',
          transform: phase >= 2 ? 'translateX(120%)' : 'translateX(-120%)',
          transition: 'transform 1400ms cubic-bezier(0.4,0,0.2,1) 200ms',
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Wordmark */}
      <div style={{
        marginTop: 36,
        opacity: phase >= 2 ? 1 : 0,
        transform: phase >= 2 ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 700ms cubic-bezier(0.4,0,0.2,1), transform 800ms cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 900, fontSize: 52, letterSpacing: '-0.04em',
        textTransform: 'uppercase', fontStyle: 'italic',
        background: 'linear-gradient(90deg, #ffffff 0%, #fda4af 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 4px 20px rgba(244,63,94,0.3))',
      }}>
        Rose Ly
      </div>

      {/* Tagline */}
      <div style={{
        marginTop: 14,
        opacity: phase >= 3 ? 1 : 0,
        transform: phase >= 3 ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 600ms ease, transform 700ms cubic-bezier(0.34,1.56,0.64,1)',
        fontFamily: 'Outfit, sans-serif',
        fontWeight: 900, fontSize: 11, letterSpacing: '0.45em',
        textTransform: 'uppercase', color: '#fda4af',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ width: 24, height: 1, background: 'rgba(253,164,175,0.5)' }} />
        Sistem Paparan Masjid Pintar
        <span style={{ width: 24, height: 1, background: 'rgba(253,164,175,0.5)' }} />
      </div>

      <style>{`
        @keyframes splash-pulse {
          0%, 100% { opacity: 1;    transform: translateX(-50%) scale(1); }
          50%      { opacity: 0.65; transform: translateX(-50%) scale(1.08); }
        }
        @keyframes splash-float {
          0%, 100% { transform: translateY(0)   scale(1);   opacity: var(--o, 0.4); }
          50%      { transform: translateY(-14px) scale(1.4); opacity: 1; }
        }
        @keyframes splash-ringPulse {
          0%, 100% { transform: scale(1);    opacity: var(--o, 0.4); }
          50%      { transform: scale(1.06); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

window.Splash = Splash;
