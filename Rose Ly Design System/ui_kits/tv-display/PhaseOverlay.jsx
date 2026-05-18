/* global React */
// PhaseOverlay.jsx — full-screen overlays for prayer-phase transitions.
// Phases: PRE_AZAN, ANNOUNCEMENT, AZAN, IQAMAH, SOLAT, KHUTBAH

function PhaseOverlay({ phase, prayer = 'ASAR', countdown = '00:00:23' }) {
  if (!phase || phase === 'NORMAL') return null;

  const wrapStyle = {
    position: 'absolute', inset: 0, zIndex: 5000,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(40px)',
    textAlign: 'center',
    animation: 'rl-overlay-fade-in 1s cubic-bezier(0.4,0,0.2,1) forwards',
  };

  const styles = {
    PRE_AZAN: (
      <div style={wrapStyle}>
        <h1 style={{ margin: 0, fontSize: 38, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(100,116,139,1)', opacity: 0.8, marginBottom: 30 }}>
          Azan Akan Berkumandang, Sila Senyap
        </h1>
        <p style={{ margin: 0, fontSize: 180, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', color: 'var(--rl-accent, #f43f5e)', filter: 'drop-shadow(0 0 80px var(--rl-accent-glow, rgba(225,29,72,0.4)))', lineHeight: 1 }}>
          {prayer}
        </p>
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontSize: 140, fontWeight: 900, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em', lineHeight: 1, animation: 'rl-pulse 2s infinite' }}>{countdown}</span>
          <div style={{ marginTop: 18, padding: '8px 32px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', color: 'rgba(148,163,184,1)', fontSize: 22, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Sila Bersedia
          </div>
        </div>
      </div>
    ),
    AZAN: (
      <div style={wrapStyle}>
        <div style={{ width: 140, height: 3, background: 'var(--rl-accent, #f43f5e)', marginBottom: 48, boxShadow: '0 0 20px var(--rl-accent, #f43f5e)' }} />
        <h1 style={{ margin: 0, fontSize: 60, fontWeight: 900, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(203,213,225,1)', marginBottom: 32 }}>
          Azan Sedang Berkumandang
        </h1>
        <p style={{ margin: 0, fontSize: 220, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', color: 'var(--rl-accent, #f43f5e)', filter: 'drop-shadow(0 0 100px var(--rl-accent-glow, rgba(225,29,72,0.6)))', lineHeight: 1, marginBottom: 48 }}>
          {prayer}
        </p>
        <div style={{ padding: '20px 60px', borderRadius: 24, border: '2px solid rgba(255,255,255,0.20)', background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', fontSize: 36 }}>
          Waktu Solat Telah Masuk
        </div>
      </div>
    ),
    IQAMAH: (
      <div style={wrapStyle}>
        <h1 style={{ margin: 0, fontSize: 60, fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#f59e0b', marginBottom: 40 }}>
          Persediaan Iqamah
        </h1>
        <span style={{ fontSize: 240, fontWeight: 900, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 40, filter: 'drop-shadow(0 0 60px rgba(245,158,11,0.3))', animation: 'rl-pulse 2s infinite' }}>
          {countdown}
        </span>
        <div style={{ padding: '20px 40px', borderRadius: 32, border: '1px solid rgba(245,158,11,0.30)', background: 'rgba(245,158,11,0.10)', backdropFilter: 'blur(8px)', fontWeight: 900, textTransform: 'uppercase', fontSize: 36, color: 'rgba(254,243,199,1)', letterSpacing: '0.05em' }}>
          Sila penuhkan saf dihadapan dahulu
        </div>
      </div>
    ),
    SOLAT: (
      <div style={wrapStyle}>
        <div style={{ display: 'inline-block', padding: '8px 24px', borderRadius: 999, fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 24, border: '1px solid rgba(255,255,255,0.20)', background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)', color: 'rgba(203,213,225,1)', fontSize: 22 }}>
          Solat Berlangsung
        </div>
        <h2 style={{ margin: 0, fontSize: 200, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', filter: 'drop-shadow(0 0 50px rgba(255,255,255,0.2))', marginBottom: 32, lineHeight: 1 }}>
          {prayer}
        </h2>
        <div style={{ padding: '24px 40px', borderRadius: 40, border: '1px solid var(--rl-accent-edge, rgba(244,63,94,0.30))', background: 'var(--rl-accent-dim, rgba(225,29,72,0.10))', backdropFilter: 'blur(16px)' }}>
          <span style={{ fontSize: 44, fontWeight: 900, textTransform: 'uppercase', color: 'rgba(254,202,202,1)' }}>
            Matikan Bunyi Telefon Bimbit
          </span>
        </div>
      </div>
    ),
    KHUTBAH: (
      <div style={wrapStyle}>
        <h1 style={{ margin: 0, fontSize: 60, fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#c084fc', marginBottom: 32 }}>
          Khutbah Jumaat
        </h1>
        <div style={{
          padding: 64, minWidth: 900, maxWidth: 1100,
          background: 'rgba(0,0,0,0.50)', border: '2px solid rgba(168,85,247,0.20)',
          borderRadius: 40, boxShadow: '0 0 50px rgba(168,85,247,0.1), 0 20px 50px rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: 60, fontWeight: 800, lineHeight: 1.1, textAlign: 'center' }}>
            Fokus &amp; Senyap Semasa Khutbah
          </h2>
        </div>
      </div>
    ),
  };

  return (
    <>
      {styles[phase]}
      <style>{`
        @keyframes rl-overlay-fade-in { from { opacity: 0; filter: blur(10px); } to { opacity: 1; filter: blur(0); } }
        @keyframes rl-pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
      `}</style>
    </>
  );
}

window.PhaseOverlay = PhaseOverlay;
