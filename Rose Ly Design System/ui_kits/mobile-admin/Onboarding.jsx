/* global React */
// Onboarding.jsx — first-time tooltip walkthrough for Mobile Admin.
// Stores `onboardingDone` in shared profile so it only shows once.

const { useState, useEffect } = React;

const STEPS = [
  {
    emoji: '👀',
    title: 'Pratonton Langsung',
    body: 'Tile di atas menunjukkan apa yang dipaparkan di TV masjid anda — live.',
  },
  {
    emoji: '🎬',
    title: 'Kawalan Cepat',
    body: 'Tab "Remote" — kawal slaid, fasa solat, dan ciri paparan.',
  },
  {
    emoji: '✏️',
    title: 'Edit Kandungan',
    body: 'Tab "Kandungan" — tambah slaid, makluman, dan khutbah Jumaat.',
  },
  {
    emoji: '⚙️',
    title: 'Tetapan Masjid',
    body: 'Tab "Tetapan" — muat naik logo, sync waktu solat, tukar tema.',
  },
];

function Onboarding() {
  const [profile, setProfile] = window.RL_STATE.useProfile();
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  // Show on first ever load (when onboardingDone is undefined)
  useEffect(() => {
    if (profile.onboardingDone) return;
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  const finish = () => {
    setProfile({ onboardingDone: true });
    setVisible(false);
  };
  const cur = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(10,6,16,0.85)', backdropFilter: 'blur(14px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, animation: 'rl-fadeIn 300ms ease',
    }}>
      <div style={{
        width: '100%', maxWidth: 360,
        background: 'linear-gradient(180deg, rgba(40,19,46,0.96), rgba(20,10,26,0.96))',
        border: '1px solid rgba(255,255,255,0.10)', borderRadius: 28,
        padding: 28, textAlign: 'center',
        boxShadow: '0 30px 60px rgba(0,0,0,0.7), 0 0 60px rgba(244,63,94,0.20)',
        animation: 'rl-pop 400ms cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>{cur.emoji}</div>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.025em', color: 'white' }}>
          {cur.title}
        </h2>
        <p style={{ margin: '10px 0 24px', fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
          {cur.body}
        </p>

        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 22 }}>
          {STEPS.map((_, i) => (
            <span key={i} style={{
              width: i === step ? 22 : 6, height: 6, borderRadius: 999,
              background: i <= step ? '#f43f5e' : 'rgba(255,255,255,0.12)',
              transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} style={{
              font: 'inherit', cursor: 'pointer',
              flex: 1, padding: '12px 16px', borderRadius: 14,
              background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)',
              border: '1px solid rgba(255,255,255,0.10)',
              fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
            }}>← Kembali</button>
          )}
          <button onClick={isLast ? finish : () => setStep(s => s + 1)} style={{
            font: 'inherit', cursor: 'pointer',
            flex: 2, padding: '12px 16px', borderRadius: 14,
            background: '#e11d48', color: 'white', border: 'none',
            fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
            boxShadow: '0 10px 24px rgba(76,5,25,0.5)',
          }}>{isLast ? '✓ Selesai' : 'Seterusnya →'}</button>
        </div>

        <button onClick={finish} style={{
          font: 'inherit', cursor: 'pointer', marginTop: 12,
          width: '100%', padding: 8, background: 'transparent', border: 'none',
          color: 'rgba(255,255,255,0.30)',
          fontSize: 9, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase',
        }}>Langkau Tutorial</button>
      </div>

      <style>{`
        @keyframes rl-fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes rl-pop { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}

window.Onboarding = Onboarding;
