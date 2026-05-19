/* global React */
// MainStage.jsx — center "slide engine".
// Cycles through world-clock + announcement slides.

const { useState, useEffect, useMemo } = React;

function AnalogClockMini({ tz }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const local = new Date(now.toLocaleString('en-US', { timeZone: tz }));
  const s = local.getSeconds();
  const m = local.getMinutes() + s / 60;
  const h = (local.getHours() % 12) + m / 60;
  const handStyle = { stroke: '#fff', strokeWidth: 2, strokeLinecap: 'round' };
  return (
    <svg width="120" height="120" viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 15px 30px rgba(0,0,0,0.6))' }}>
      <circle cx="50" cy="50" r="46" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i * 30 - 90) * Math.PI / 180;
        const x1 = 50 + Math.cos(a) * 40, y1 = 50 + Math.sin(a) * 40;
        const x2 = 50 + Math.cos(a) * 44, y2 = 50 + Math.sin(a) * 44;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />;
      })}
      <line x1="50" y1="50" x2={50 + Math.cos((h * 30 - 90) * Math.PI / 180) * 24}
                              y2={50 + Math.sin((h * 30 - 90) * Math.PI / 180) * 24} {...handStyle} strokeWidth="3" />
      <line x1="50" y1="50" x2={50 + Math.cos((m * 6 - 90) * Math.PI / 180) * 34}
                              y2={50 + Math.sin((m * 6 - 90) * Math.PI / 180) * 34} {...handStyle} />
      <line x1="50" y1="50" x2={50 + Math.cos((s * 6 - 90) * Math.PI / 180) * 36}
                              y2={50 + Math.sin((s * 6 - 90) * Math.PI / 180) * 36} stroke="#f43f5e" strokeWidth="1" strokeLinecap="round" />
      <circle cx="50" cy="50" r="2.5" fill="#f43f5e" />
    </svg>
  );
}

function WorldClockSlide({ time }) {
  const cities = window.RL.worldClocks;
  return (
    <div style={{ width: '100%', height: '100%', padding: 40, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Localized text-protection halos behind each clock row */}
      <div style={{
        position: 'absolute', inset: '20% 8%',
        background: 'radial-gradient(ellipse 60% 50% at center, rgba(0,0,0,0.55), rgba(0,0,0,0.20) 60%, transparent 100%)',
        pointerEvents: 'none', filter: 'blur(20px)',
      }} />
      <h2 style={{ fontSize: 12, fontWeight: 900, letterSpacing: '1em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 48, position: 'relative', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.95)) drop-shadow(0 0 12px rgba(0,0,0,0.7))' }}>
        Global Islamic Time
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', columnGap: '6vw', rowGap: '4vh', justifyItems: 'center', position: 'relative' }}>
        {cities.map((loc, i) => {
          const t = new Date(time.toLocaleString('en-US', { timeZone: loc.tz }));
          const time12 = t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          const time24 = t.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
              {/* per-clock text halo */}
              <div style={{
                position: 'absolute', inset: '60% -10% -10% -10%',
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.65), rgba(0,0,0,0.30) 50%, transparent 100%)',
                pointerEvents: 'none', filter: 'blur(8px)',
              }} />
              <div style={{ marginBottom: 16, position: 'relative' }}><AnalogClockMini tz={loc.tz} /></div>
              <span style={{ position: 'relative', fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.2em', marginBottom: 4, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,1)) drop-shadow(0 0 10px rgba(0,0,0,0.8))' }}>{time24} HRS</span>
              <p style={{ position: 'relative', margin: 0, fontSize: 26, fontWeight: 900, color: '#fb7185', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', filter: 'drop-shadow(0 2px 10px rgba(0,0,0,1)) drop-shadow(0 0 12px rgba(0,0,0,0.8))' }}>{time12}</p>
              <p style={{ position: 'relative', margin: '4px 0 0 0', fontSize: 20, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.02em', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,1)) drop-shadow(0 0 14px rgba(0,0,0,0.9))' }}>{loc.city}</p>
              <p style={{ position: 'relative', margin: '4px 0 0 0', fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,1)) drop-shadow(0 0 10px rgba(0,0,0,0.8))' }}>{loc.country}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NewsSlide({ items = [] }) {
  return (
    <div style={{ width: '100%', height: '100%', padding: '64px 48px 48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: '8%', borderRadius: 32,
        background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.55), rgba(0,0,0,0.20) 60%, transparent 100%)',
        pointerEvents: 'none', filter: 'blur(20px)',
      }} />
      <h2 style={{ position: 'relative', fontSize: 14, fontWeight: 900, letterSpacing: '0.6em', color: 'var(--rl-accent-light, #fb7185)', textTransform: 'uppercase', marginBottom: 28, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9))', flexShrink: 0 }}>
        Berita Terkini
      </h2>
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 1300 }}>
        {items.map((n, i) => {
          const isMakluman = n.source === 'MAKLUMAN';
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 22,
              padding: '14px 22px', borderRadius: 22,
              background: 'rgba(0,0,0,0.40)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(4px)',
            }}>
              <span style={{
                fontSize: 11, fontWeight: 900, letterSpacing: '0.3em', textTransform: 'uppercase',
                padding: '5px 12px', borderRadius: 999,
                background: isMakluman ? 'var(--rl-accent-dim, rgba(244,63,94,0.25))' : 'rgba(59,130,246,0.20)',
                color: isMakluman ? 'var(--rl-accent-light, #fda4af)' : '#93c5fd',
                border: '1px solid', borderColor: isMakluman ? 'var(--rl-accent-edge, rgba(244,63,94,0.40))' : 'rgba(59,130,246,0.30)',
                flexShrink: 0, minWidth: 110, textAlign: 'center', alignSelf: 'center',
              }}>{n.source}</span>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.35, color: 'white', flex: 1, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.9))', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {n.title}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnnouncementSlide({ slide }) {
  const hasText     = !!(slide.title || slide.content);
  const isPoster    = slide.type === 'poster';
  const isImageOnly = (slide.bgUrl && !hasText) || isPoster;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Background image — never overflows because parent is inset:0 inside the rounded panel */}
      {slide.bgUrl && (
        <img src={slide.bgUrl} alt=""
             style={{
               position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
               width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center',
               margin: 'auto', display: 'block',
               opacity: isImageOnly ? 1 : 0.18,
             }} />
      )}
      {/* Dark radial scrim — ensures text is readable against any sky background */}
      {!isImageOnly && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 80% 70% at 50% 55%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.20) 60%, transparent 100%)',
        }} />
      )}
      {/* Text overlay */}
      {!isImageOnly && (
        <div style={{
          position: 'relative', zIndex: 1,
          width: '100%', height: '100%',
          padding: 48, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        }}>
          {slide.label && (
            <span style={{
              display: 'inline-block', padding: '6px 22px', borderRadius: 999,
              fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em',
              background: 'rgba(225,29,72,0.25)', color: '#fda4af', border: '1px solid rgba(244,63,94,0.40)',
              marginBottom: 32,
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}>{slide.label}</span>
          )}
          <div style={{ maxWidth: 760 }}>
            {slide.title && (
              <h2 style={{
                margin: 0, fontSize: 76, fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '-0.04em', lineHeight: 1,
                textShadow: '0 2px 4px rgba(0,0,0,1), 0 8px 32px rgba(0,0,0,0.9), 0 20px 60px rgba(0,0,0,0.7)',
                marginBottom: slide.content ? 28 : 0,
              }}>{slide.title}</h2>
            )}
            {slide.content && (
              <p style={{
                margin: 0, fontSize: 26, fontWeight: 700, color: 'rgba(255,255,255,0.92)',
                lineHeight: 1.4, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto',
                textShadow: '0 2px 8px rgba(0,0,0,1), 0 4px 20px rgba(0,0,0,0.9)',
              }}>{slide.content}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DonationSlide({ slide }) {
  const useProf = window.RL_STATE?.useProfile;
  const subscribed = useProf ? useProf() : [null, () => {}];
  const profile = subscribed[0];
  
  const collected = profile?.donationCollected ?? 3450;
  const target = profile?.donationTarget ?? 5000;
  const qrUrl = profile?.donationQrUrl || null;
  const pct = Math.min(100, Math.max(0, Math.round((collected / target) * 100)));
  
  const formattedCollected = new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }).format(collected);
  const formattedTarget = new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0 }).format(target);

  return (
    <div style={{ width: '100%', height: '100%', padding: '50px 48px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: '8%', borderRadius: 32,
        background: 'radial-gradient(ellipse at center, rgba(52,211,153,0.08), rgba(0,0,0,0.15) 60%, transparent 100%)',
        pointerEvents: 'none', filter: 'blur(20px)',
      }} />
      
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 280px', gap: 40, width: '100%', maxWidth: 1100, position: 'relative', zIndex: 1
      }}>
        {/* Left Column: Progress & Campaign Details */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'left' }}>
          <span style={{
            alignSelf: 'flex-start', padding: '6px 20px', borderRadius: 999,
            fontSize: 12, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.25em',
            background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.30)',
            marginBottom: 20, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))'
          }}>
            Kutipan Kebajikan
          </span>
          
          <h2 style={{
            margin: 0, fontSize: 56, fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '-0.04em', lineHeight: 1.1,
            filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.7))',
            marginBottom: 16
          }}>{slide.title || 'Tabung Pembangunan Masjid'}</h2>
          
          <p style={{
            margin: '0 0 32px 0', fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.70)',
            lineHeight: 1.45, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))'
          }}>{slide.content || 'Sumbangan anda untuk fasa menaik taraf sistem audio dan dewan solat utama.'}</p>
          
          {/* Progress bar container */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 900, color: '#34d399', fontVariantNumeric: 'tabular-nums', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>{formattedCollected}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>terkumpul</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>sasaran</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: 'rgba(255,255,255,0.8)', fontVariantNumeric: 'tabular-nums' }}>{formattedTarget}</span>
              </div>
            </div>
            
            {/* Progress track */}
            <div style={{
              width: '100%', height: 20, borderRadius: 999, background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', position: 'relative',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)'
            }}>
              {/* Progress fill */}
              <div style={{
                width: `${pct}%`, height: '100%', borderRadius: 999,
                background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
                boxShadow: '0 0 20px rgba(52,211,153,0.5), inset 0 1px 0 rgba(255,255,255,0.3)',
                transition: 'width 1.2s cubic-bezier(0.22, 1, 0.36, 1)'
              }} />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <span>Peratusan: {pct}%</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                  background: '#ef4444', animation: 'rl-pulse 1.8s infinite'
                }} /> Infaq Jumaat Terbuka
              </span>
            </div>
          </div>
        </div>
        
        {/* Right Column: Scan QR to Donate */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: 24, borderRadius: 28,
          background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(10px)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          position: 'relative', overflow: 'hidden'
        }}>
          <span style={{
            fontSize: 10, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.5)', marginBottom: 16
          }}>
            IMBAS UNTUK INFAQ
          </span>
          
          {/* Faux QR Code container */}
          <div style={{
            width: 180, height: 180, borderRadius: 18, background: 'white',
            padding: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.6)', position: 'relative'
          }}>
            {qrUrl ? (
              <img src={qrUrl} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              // Stylized premium gradient SVG QR Code mock
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" style={{ display: 'block' }}>
                <rect width="100" height="100" fill="#fff" rx="10"/>
                {/* QR Pattern */}
                <rect x="10" y="10" width="24" height="24" fill="#000" rx="3"/>
                <rect x="14" y="14" width="16" height="16" fill="#fff" rx="1"/>
                <rect x="17" y="17" width="10" height="10" fill="#000" rx="1"/>
                
                <rect x="66" y="10" width="24" height="24" fill="#000" rx="3"/>
                <rect x="70" y="14" width="16" height="16" fill="#fff" rx="1"/>
                <rect x="73" y="17" width="10" height="10" fill="#000" rx="1"/>
                
                <rect x="10" y="66" width="24" height="24" fill="#000" rx="3"/>
                <rect x="14" y="70" width="16" height="16" fill="#fff" rx="1"/>
                <rect x="17" y="73" width="10" height="10" fill="#000" rx="1"/>
                
                {/* Random bits */}
                <path d="M42 10h6v6h-6zM54 10h6v6h-6zM42 22h6v6h-6zM54 22h6v6h-6zM10 42h6v6h-6zM22 42h6v6h-6zM34 42h6v6h-6zM10 54h6v6h-6zM22 54h6v6h-6zM34 54h6v6h-6zM42 34h6v6h-6zM54 34h6v6h-6zM66 42h6v6h-6zM78 42h6v6h-6zM66 54h6v6h-6zM78 54h6v6h-6zM42 46h6v6h-6zM54 46h6v6h-6zM42 58h6v6h-6zM54 58h6v6h-6zM66 66h6v6h-6zM78 66h6v6h-6zM66 78h6v6h-6zM78 78h6v6h-6z" fill="#000"/>
                {/* Pulsing heart/logo overlay at center */}
                <rect x="40" y="40" width="20" height="20" rx="4" fill="#f43f5e" />
                <path d="M50 46.5c-.5-.7-1.3-1.1-2.1-1.1-1.4 0-2.4 1.1-2.4 2.4 0 1.9 2.5 4.2 4.5 4.2s4.5-2.3 4.5-4.2c0-1.3-1-2.4-2.4-2.4-.8 0-1.6.4-2.1 1.1z" fill="#fff"/>
              </svg>
            )}
            
            {/* Holographic scanner line overlay */}
            <div style={{
              position: 'absolute', left: 4, right: 4, height: 2, background: 'rgba(52,211,153,0.8)',
              boxShadow: '0 0 12px rgba(52,211,153,0.9)',
              animation: 'rl-scan 3.5s linear infinite'
            }} />
          </div>
          
          <span style={{
            fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: '#34d399', marginTop: 16, display: 'flex', alignItems: 'center', gap: 6,
            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.5))'
          }}>
            ❤️ Terima Kasih
          </span>
        </div>
      </div>
      
      <style>{`
        @keyframes rl-scan {
          0%, 100% { top: 12px; opacity: 0.3; }
          50% { top: 168px; opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function MainStage({ time, slideIdx = 0, onSlideChange }) {
  // Pull slides from shared profile if any have been authored in admin;
  // otherwise fall back to the demo slides shipped in tokens.js.
  const useProf = window.RL_STATE?.useProfile;
  const subscribed = useProf ? useProf() : [null, () => {}];
  const profile = subscribed[0];
  const customSlides = profile?.slides;

  const slides = useMemo(() => {
    const newsItems = window.RL?.tickerItems || [];
    const newsSlide = newsItems.length > 0
      ? [{ id: 'news', type: 'news', title: 'Berita Terkini', items: newsItems.slice(0, 3) }]
      : [];
    if (Array.isArray(customSlides) && customSlides.length > 0) {
      // Filter by active flag + date range
      const today = new Date().toISOString().slice(0, 10);
      const active = customSlides.filter(s => {
        if (s.active === false) return false;
        if (s.startDate && s.startDate > today) return false;
        if (s.endDate   && s.endDate   < today) return false;
        return true;
      });
      if (active.length === 0) return [...window.RL.slides, ...newsSlide];
      return [{ id: 'world', type: 'world-clock', title: 'Jam Dunia' }, ...active, ...newsSlide];
    }
    return [...window.RL.slides, ...newsSlide];
  }, [customSlides]);

  const safeIdx = Math.min(slideIdx, Math.max(slides.length - 1, 0));
  const current = slides[safeIdx] || slides[0];
  if (!current) return null;

  // Stats: bump impression count when a real slide displays
  React.useEffect(() => {
    if (!current || current.type === 'world-clock' || !current.id) return;
    const key = '__rl_lastBump_' + current.id;
    const now = Date.now();
    if (window[key] && now - window[key] < 2000) return;
    window[key] = now;
    try {
      const prof = window.RL_STATE?.loadProfile() || {};
      const stats = prof.slideStats || {};
      stats[current.id] = (stats[current.id] || 0) + 1;
      window.RL_STATE?.saveProfile({ slideStats: stats });
    } catch {}
  }, [current?.id]);

  return (
    <main style={{
      borderRadius: 40,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.20) 100%)',
      backdropFilter: 'blur(2px) saturate(120%)',
      WebkitBackdropFilter: 'blur(2px) saturate(120%)',
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Slide dots */}
      <div style={{
        position: 'absolute', top: 20, left: 0, right: 0,
        display: 'flex', justifyContent: 'center', gap: 8, zIndex: 10, pointerEvents: 'auto',
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => onSlideChange?.(i)}
            style={{
              width: i === safeIdx ? 28 : 6, height: 6, borderRadius: 999,
              background: i === safeIdx ? 'var(--rl-accent, #f43f5e)' : 'rgba(255,255,255,0.15)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.5s ease',
            }}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {current.type === 'world-clock'
        ? <WorldClockSlide time={time} />
        : current.type === 'news'
        ? <NewsSlide items={current.items} />
        : current.type === 'donation'
        ? <DonationSlide slide={current} />
        : <AnnouncementSlide slide={current} />}
    </main>
  );
}

window.MainStage = MainStage;
