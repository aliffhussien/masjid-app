/* global React */
// KhutbahStage.jsx — replaces MainStage during Khutbah.
// Rotates through khutbah slides (Arabic + Malay) on a purple-themed panel.
// Reads slides from RL_STATE.khutbahSlides; falls back to a built-in sample.

const { useState, useEffect } = React;

const FALLBACK_SLIDES = [
  { ms: 'Bertakwalah kepada Allah di mana sahaja anda berada.',
    ar: 'اِتَّقِ اللَّهَ حَيْثُمَا كُنْتَ' },
  { ms: 'Sesungguhnya yang paling baik di antara kalian adalah yang paling baik akhlaknya.',
    ar: 'إِنَّ مِنْ خِيَارِكُمْ أَحْسَنَكُمْ أَخْلَاقًا' },
  { ms: 'Solat berjamaah lebih baik dari solat sendirian sebanyak 27 darjat.',
    ar: 'صَلَاةُ الْجَمَاعَةِ أَفْضَلُ مِنْ صَلَاةِ الْفَذِّ بِسَبْعٍ وَعِشْرِينَ دَرَجَةً' },
  { ms: 'Senyummu di hadapan saudaramu adalah sedekah.',
    ar: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ صَدَقَةٌ' },
];

function KhutbahStage() {
  // Pull from RL_STATE if any custom khutbah slides were entered in admin
  const useProf = window.RL_STATE?.useProfile;
  const subscribed = useProf ? useProf() : [null, () => {}];
  const profile = subscribed[0];
  const customSlides = (profile?.khutbahSlides || []).filter(s => s.ar || s.ms);
  const slides = customSlides.length > 0 ? customSlides : FALLBACK_SLIDES;
  const title  = profile?.khutbahTitle || 'Khutbah Jumaat';

  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 10000);
    return () => clearInterval(t);
  }, [slides.length]);
  const safeIdx = idx % slides.length;
  const slide   = slides[safeIdx];

  return (
    <main style={{
      borderRadius: 40,
      background: 'linear-gradient(180deg, rgba(45,15,65,0.55) 0%, rgba(20,10,40,0.40) 100%)',
      backdropFilter: 'blur(4px) saturate(120%)',
      WebkitBackdropFilter: 'blur(4px) saturate(120%)',
      border: '1px solid rgba(168,85,247,0.25)',
      boxShadow: '0 0 60px rgba(168,85,247,0.18), 0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 64, textAlign: 'center',
    }}>
      <div style={{
        fontSize: 14, fontWeight: 900, letterSpacing: '0.5em', textTransform: 'uppercase',
        color: '#c084fc', marginBottom: 32,
        filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9))',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span style={{ width: 60, height: 1, background: 'rgba(192,132,252,0.5)' }} />
        {title}
        <span style={{ width: 60, height: 1, background: 'rgba(192,132,252,0.5)' }} />
      </div>

      <div key={safeIdx} style={{
        animation: 'rl-khutbah-in 800ms cubic-bezier(0.34,1.56,0.64,1)',
        maxWidth: 1000,
      }}>
        <p style={{
          margin: 0, fontFamily: 'Cairo, Outfit, sans-serif',
          fontSize: 52, fontWeight: 700, direction: 'rtl', lineHeight: 1.4,
          color: 'white',
          filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.9))',
        }}>{slide.ar}</p>

        <div style={{ margin: '36px auto 32px', width: 80, height: 1, background: 'rgba(192,132,252,0.3)' }} />

        <p style={{
          margin: 0, fontSize: 32, fontWeight: 700, fontStyle: 'italic',
          lineHeight: 1.3, letterSpacing: '-0.015em',
          color: 'rgba(255,255,255,0.85)',
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.9))',
        }}>{slide.ms}</p>
      </div>

      {/* Slide indicator */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 8,
      }}>
        {slides.map((_, i) => (
          <span key={i} style={{
            width: i === safeIdx ? 28 : 6, height: 6, borderRadius: 999,
            background: i === safeIdx ? '#c084fc' : 'rgba(255,255,255,0.15)',
            transition: 'all 0.5s cubic-bezier(0.34,1.56,0.64,1)',
            boxShadow: i === safeIdx ? '0 0 8px rgba(192,132,252,0.6)' : 'none',
          }} />
        ))}
      </div>

      <style>{`
        @keyframes rl-khutbah-in {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

window.KhutbahStage = KhutbahStage;
