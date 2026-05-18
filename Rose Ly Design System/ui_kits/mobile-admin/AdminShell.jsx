/* global React */
// AdminShell.jsx — header, ambient glow, preview slot, bottom tab nav.

const { useState, useEffect } = React;

// Pull-to-refresh wrapper — touch-only, fires onRefresh when pulled 80px+ at scrollTop=0.
function PullToRefresh({ onRefresh, children }) {
  const ref = React.useRef(null);
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const startY = React.useRef(null);

  const onTouchStart = (e) => {
    const el = ref.current?.querySelector('main');
    if (el && el.scrollTop <= 0) startY.current = e.touches[0].clientY;
  };
  const onTouchMove = (e) => {
    if (startY.current == null || busy) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setPull(Math.min(120, dy * 0.6));
  };
  const onTouchEnd = async () => {
    if (pull >= 80 && !busy) {
      setBusy(true);
      try { await onRefresh?.(); } catch {}
      setTimeout(() => { setBusy(false); setPull(0); }, 400);
    } else {
      setPull(0);
    }
    startY.current = null;
  };

  return (
    <div ref={ref} style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', minHeight: 0 }}
         onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      {pull > 0 && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: pull,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--rl-accent-light, #fb7185)', zIndex: 10, pointerEvents: 'none',
        }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            border: '2px solid currentColor', borderTopColor: 'transparent',
            transform: `rotate(${pull * 4}deg)`,
            animation: busy ? 'rl-spin 0.7s linear infinite' : 'none',
          }} />
        </div>
      )}
      <div style={{ flex: 1, transform: `translateY(${pull}px)`, transition: startY.current ? 'none' : 'transform 0.3s ease', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

const TABS = [
  { id: 'setup',     label: 'Setup',     short: 'Setup',     icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'remote',    label: 'Remote',    short: 'Remote',    icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { id: 'kandungan', label: 'Kandungan', short: 'Kandungan', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { id: 'tetapan',   label: 'Tetapan',   short: 'Tetapan',   icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

function PinGate({ pin, onSuccess }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const press = (num) => {
    if (error || success) return;
    if (code.length < 4) {
      const next = code + num;
      setCode(next);
      if (next.length === 4) {
        if (next === pin) {
          setSuccess(true);
          setTimeout(() => onSuccess(), 400);
        } else {
          setError(true);
          setTimeout(() => {
            setCode('');
            setError(false);
          }, 850);
        }
      }
    }
  };

  const back = () => {
    if (error || success) return;
    setCode(code.slice(0, -1));
  };

  const clear = () => {
    if (error || success) return;
    setCode('');
  };

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 100000,
      background: '#020617',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Outfit", system-ui, sans-serif', padding: 24,
    }}>
      {/* Decorative glows */}
      <div style={{ position: 'absolute', top: -100, width: 300, height: 300, background: error ? '#b91c1c' : success ? '#047857' : 'var(--rl-accent-dark, #e11d48)', borderRadius: '50%', filter: 'blur(150px)', opacity: 0.25, transition: 'background-color 0.3s ease', pointerEvents: 'none' }} />

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        marginBottom: 36, textAlign: 'center',
        transform: error ? 'translateX(0)' : 'none',
        animation: error ? 'rl-shake 0.3s ease-in-out' : 'none',
      }}>
        {/* Glow Ring Logo */}
        <div style={{
          width: 80, height: 80, borderRadius: 24,
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 16,
          animation: success ? 'rl-pulse-success 1.5s infinite' : 'none',
        }}>
          <svg width="42" height="42" fill="none" stroke={error ? '#fb7185' : success ? '#34d399' : '#fb7185'} strokeWidth="2" viewBox="0 0 24 24" style={{ transition: 'stroke 0.3s ease' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: error ? '#fb7185' : success ? '#34d399' : 'white', transition: 'color 0.3s ease' }}>
          {error ? 'PIN SALAH' : success ? 'DIBUKA' : 'PIN DIPERLUKAN'}
        </h2>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.05em' }}>
          Sila masukkan PIN pentadbir 4-digit
        </p>
      </div>

      {/* Dotted pass placeholders */}
      <div style={{
        display: 'flex', gap: 18, marginBottom: 48,
        animation: error ? 'rl-shake 0.3s ease-in-out' : 'none',
      }}>
        {[0, 1, 2, 3].map(i => {
          const filled = code.length > i;
          return (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: '50%',
              border: `2px solid ${error ? '#fb7185' : success ? '#34d399' : filled ? '#fb7185' : 'rgba(255,255,255,0.15)'}`,
              background: error ? '#fb7185' : success ? '#34d399' : filled ? '#fb7185' : 'transparent',
              boxShadow: filled && !error && !success ? '0 0 12px #fb7185' : success ? '0 0 12px #34d399' : 'none',
              transform: filled ? 'scale(1.15)' : 'scale(1)',
              transition: 'all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            }} />
          );
        })}
      </div>

      {/* Numeric Keypad Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 24px',
        maxWidth: 280, width: '100%',
      }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
          <button key={n} onClick={() => press(n)} style={{
            font: 'inherit', cursor: 'pointer',
            height: 64, borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'white', fontSize: 20, fontWeight: 900,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            outline: 'none', transition: 'all 0.1s ease',
            WebkitTapHighlightColor: 'transparent',
          }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.9)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
             onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
             onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.9)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
             onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
            {n}
          </button>
        ))}
        
        {/* Row 4: CLEAR, 0, BACKSPACE */}
        <button onClick={clear} style={{
          font: 'inherit', cursor: 'pointer',
          height: 64, borderRadius: 32,
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 900,
          textTransform: 'uppercase', letterSpacing: '0.15em',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          outline: 'none', WebkitTapHighlightColor: 'transparent',
        }}>Padam</button>

        <button onClick={() => press(0)} style={{
          font: 'inherit', cursor: 'pointer',
          height: 64, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          color: 'white', fontSize: 20, fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
          outline: 'none', transition: 'all 0.1s ease',
          WebkitTapHighlightColor: 'transparent',
        }} onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.9)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
           onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
           onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.9)'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
           onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
          0
        </button>

        <button onClick={back} style={{
          font: 'inherit', cursor: 'pointer',
          height: 64, borderRadius: 32,
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          outline: 'none', WebkitTapHighlightColor: 'transparent',
        }}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
          </svg>
        </button>
      </div>

      {/* Inline styles for keyframe animations */}
      <style>{`
        @keyframes rl-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        @keyframes rl-pulse-success {
          0% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4); }
          70% { box-shadow: 0 0 0 16px rgba(52, 211, 153, 0); }
          100% { box-shadow: 0 0 0 0 rgba(52, 211, 153, 0); }
        }
      `}</style>
    </div>
  );
}

function AdminShell() {
  const [active, setActive] = useState('remote');
  const [profile, setProfile] = window.RL_STATE.useProfile();
  const [installPrompt, setInstallPrompt] = useState(null);
  
  // PIN Code authentication state
  const hasPin = profile.adminPin && profile.adminPin.length === 4;
  const [authenticated, setAuthenticated] = useState(!hasPin);

  useEffect(() => {
    if (!hasPin) {
      setAuthenticated(true);
    }
  }, [hasPin]);

  useEffect(() => {
    const handlePrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handlePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handlePrompt);
  }, []);

  const triggerInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const updateLogo = (url) => setProfile({ logoUrl: url });

  const Tab = active === 'setup'     ? window.SetupTab
            : active === 'remote'    ? window.RemoteTab
            : active === 'kandungan' ? window.KandunganTab
            : window.TetapanTab;
  const activeTab = TABS.find(t => t.id === active);

  if (hasPin && !authenticated) {
    return <PinGate pin={profile.adminPin} onSuccess={() => setAuthenticated(true)} />;
  }

  return (
    <div style={{
      position: 'relative', minHeight: '100%', height: '100%',
      background: '#020617', color: 'white',
      fontFamily: '"Outfit", system-ui, sans-serif',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Ambient glow blobs */}
      {window.Onboarding && <window.Onboarding />}
      <div style={{ position: 'absolute', top: -180, right: -120, width: 380, height: 380, background: 'var(--rl-accent-dark, #e11d48)', borderRadius: '50%', filter: 'blur(180px)', opacity: 0.18, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -180, left: -120, width: 380, height: 380, background: '#4a2349', borderRadius: '50%', filter: 'blur(180px)', opacity: 0.35, pointerEvents: 'none' }} />

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(40px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <window.MosqueIcon size={40} logoUrl={profile.logoUrl} />
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.015em', lineHeight: 1 }}>{profile.mosqueName}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{activeTab?.label}</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {installPrompt && (
            <button onClick={triggerInstall} style={{
              font: 'inherit', cursor: 'pointer',
              padding: '8px 12px', borderRadius: 12,
              background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.30)', color: '#fb7185',
              fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 0 15px rgba(244,63,94,0.2)',
            }}>
              ⚡ Pasang Apl
            </button>
          )}
          <a href="../../index.html" style={{
            textDecoration: 'none',
            padding: '8px 12px', borderRadius: 12,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)',
            fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.18em',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>← Hub</a>
        </div>
      </header>

      {/* Live Preview tile (always shown at top) */}
      <div style={{ padding: '16px 20px 0', position: 'relative', zIndex: 5 }}>
        <window.LivePreview />
      </div>

      {/* Tab content */}
      <PullToRefresh onRefresh={async () => {
        try {
          if (!window.RL_SOLAT) return;
          const times = await window.RL_SOLAT.fetchToday(profile.zone || 'WLY01');
          setProfile({ prayerTimes: times, prayerTimesSync: new Date().toISOString() });
        } catch {}
      }}>
        <main style={{
          flex: 1, overflowY: 'auto', padding: 20,
          paddingBottom: 'calc(110px + env(safe-area-inset-bottom))',
          position: 'relative', zIndex: 5,
        }}>
        <Tab logoUrl={profile.logoUrl} setLogoUrl={updateLogo} mosqueName={profile.mosqueName} mosqueAddress={profile.mosqueAddress} zone={profile.zone} />
      </main>
      </PullToRefresh>

      {/* Bottom tab nav */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '12px 16px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
        display: 'flex', justifyContent: 'space-around', zIndex: 50,
      }}>
        {TABS.map(t => {
          const isOn = t.id === active;
          return (
            <button key={t.id} onClick={() => setActive(t.id)} style={{
              font: 'inherit', cursor: 'pointer', background: 'none', border: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: 0,
              color: isOn ? 'var(--rl-accent-light, #fb7185)' : 'rgba(255,255,255,0.20)',
              transition: 'color 0.15s ease',
            }}>
              <div style={{
                padding: 10, borderRadius: 14,
                background: isOn ? 'var(--rl-accent-dim, rgba(244,63,94,0.15))' : 'transparent',
                border: isOn ? '1px solid var(--rl-accent-edge, rgba(244,63,94,0.20))' : '1px solid transparent',
              }}>
                <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={t.icon} />
                </svg>
              </div>
              <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{t.short}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

window.AdminShell = AdminShell;
