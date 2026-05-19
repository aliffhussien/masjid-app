import '../../shared/init.js';

// Import core shared utilities and state (they assign themselves to window)
import '../../shared/state.js';
import '../../shared/solat.js';
import '../../shared/news.js';

// Import local page tokens
import './tokens.js';

// Import components (they assign themselves to window)
import './Sky.jsx';
import './WeatherEffects.jsx';
import '../../assets/SvgClock.jsx';
import './TVHeader.jsx';
import './PrayerSidebar.jsx';
import './MainStage.jsx';
import './NewsTicker.jsx';
import './PhaseOverlay.jsx';

// Now define and render the TVApp component
const { useState: reactUseState, useEffect: reactUseEffect, useRef: reactUseRef } = React;

function TVApp() {
  const [time, setTime] = reactUseState(new Date());
  const [slideIdx, setSlideIdx] = reactUseState(0);
  const [phase, setPhase] = reactUseState('NORMAL');
  const [weatherCode, setWeatherCode] = reactUseState(0);
  const [countdown, setCountdown] = reactUseState('');
  const phaseStartRef = reactUseRef(null);

  // Live profile sync
  const [liveProfile] = window.RL_STATE?.useProfile() || [{}];

  reactUseEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  
  // Dynamic slide advancement driven by Remote control
  reactUseEffect(() => {
    if (liveProfile.slidePaused) return;
    const dur = (liveProfile.slideDuration || 8) * 1000;
    const t = setInterval(() => {
      setSlideIdx(i => {
        const tickerItems = window.RL?.tickerItems || [];
        const customSlides = liveProfile.slides || [];
        // Determine active custom slides
        const today = new Date().toISOString().slice(0, 10);
        const activeCustom = customSlides.filter(s => {
          if (s.active === false) return false;
          if (s.startDate && s.startDate > today) return false;
          if (s.endDate   && s.endDate   < today) return false;
          return true;
        });
        const slidesCount = activeCustom.length > 0
          ? 1 + activeCustom.length + (tickerItems.length ? 1 : 0) // World Clock + Custom Slides + News Slide
          : window.RL.slides.length + (tickerItems.length ? 1 : 0);
        const nextIdx = (i + 1) % Math.max(1, slidesCount);
        // Save the active slide index to state so that the Remote dashboard updates in real-time!
        window.RL_STATE?.saveProfile({ activeSlideIdx: nextIdx });
        return nextIdx;
      });
    }, dur);
    return () => clearInterval(t);
  }, [liveProfile.slidePaused, liveProfile.slideDuration, liveProfile.slides]);

  // Direct remote control slide trigger
  reactUseEffect(() => {
    if (liveProfile.activeSlideIdx !== undefined && liveProfile.activeSlideIdx !== null) {
      setSlideIdx(liveProfile.activeSlideIdx);
    }
  }, [liveProfile.activeSlideIdx]);

  // Remote control phase sync
  reactUseEffect(() => {
    if (liveProfile.activePhase) {
      setPhase(liveProfile.activePhase === 'OFF' ? 'NORMAL' : liveProfile.activePhase);
    }
  }, [liveProfile.activePhase]);

  // Real-time phase countdown — tracks elapsed since phase began
  reactUseEffect(() => {
    phaseStartRef.current = Date.now();
  }, [phase]);

  reactUseEffect(() => {
    const COUNTDOWN_PHASES = ['PRE_AZAN', 'IQAMAH'];
    if (!COUNTDOWN_PHASES.includes(phase)) { setCountdown(''); return; }

    const getDurationMs = () => {
      const p = window.RL_STATE?.loadProfile() || {};
      if (phase === 'PRE_AZAN') return (p.preAzanSecs ?? 60) * 1000;
      if (phase === 'IQAMAH')   return (p.iqamahDuration ?? 600) * 1000;
      return 0;
    };
    const tick = () => {
      const elapsed = Date.now() - (phaseStartRef.current || Date.now());
      const remMs   = Math.max(0, getDurationMs() - elapsed);
      const remSecs = Math.floor(remMs / 1000);
      const m = Math.floor(remSecs / 60);
      const s = remSecs % 60;
      setCountdown(`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Real-time GPS-synced Live weather fetching
  reactUseEffect(() => {
    let active = true;
    const fetchWeather = async () => {
      try {
        let lat = 3.1390;
        let lon = 101.6869;
        const gps = liveProfile.gps;
        if (gps) {
          const parts = gps.split(',');
          if (parts.length === 2) {
            const parsedLat = parseFloat(parts[0].trim());
            const parsedLon = parseFloat(parts[1].trim());
            if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
              lat = parsedLat;
              lon = parsedLon;
            }
          }
        }
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code&timezone=auto`);
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        if (active) {
          setWeatherCode(data.current.weather_code);
        }
      } catch (err) {
        console.warn('Weather fetch in main.jsx failed:', err);
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000); // refresh every 30 minutes
    return () => { active = false; clearInterval(interval); };
  }, [liveProfile.gps]);

  const hr = time.getHours();
  const skyPhase = hr < 6 || hr >= 19 ? 'night' : hr >= 17 ? 'sunset' : 'day';

  // Auto-play prayer phase sequence for demo — uses durations from profile
  const profileNow = window.RL_STATE?.loadProfile() || {};
  const AUDIO_LEN_SECS = 13; // Menjelang_Azan.mp3 length

  // Quran ambient — fades in/out smoothly, only during NORMAL
  const fadeAudio = (el, targetVol, ms = 800) => {
    if (!el) return;
    const start = el.volume;
    const t0 = performance.now();
    const step = () => {
      const t = Math.min(1, (performance.now() - t0) / ms);
      el.volume = start + (targetVol - start) * t;
      if (t < 1) requestAnimationFrame(step);
      else if (targetVol === 0) { el.pause(); }
    };
    if (targetVol > 0 && el.paused) {
      el.volume = 0;
      el.play().catch(()=>{});
    }
    requestAnimationFrame(step);
  };
  const stopAllAudio = () => {
    try { const a = document.getElementById('rl-preazan-audio'); if (a) { a.pause(); a.currentTime = 0; } } catch {}
  };
  // Auto-control Quran ambient based on phase + profile toggle
  reactUseEffect(() => {
    const a = document.getElementById('rl-quran-audio');
    if (!a) return;
    const enabled  = liveProfile.enableQuran === true;
    const surah    = liveProfile.quranSurah || 1;
    const reciter  = liveProfile.quranReciter || 'ar.alafasy';
    const vol      = (liveProfile.quranVolume ?? 30) / 100;
    const wantSrc  = `https://server8.mp3quran.net/afs/${String(surah).padStart(3,'0')}.mp3`;
    if (!a.src.endsWith(`/${String(surah).padStart(3,'0')}.mp3`)) { a.src = wantSrc; }
    if (enabled && phase === 'NORMAL') {
      fadeAudio(a, vol, 1500);
    } else {
      fadeAudio(a, 0, 600);
    }
  }, [phase, liveProfile.enableQuran, liveProfile.quranSurah, liveProfile.quranReciter, liveProfile.quranVolume]);

  // Continuous play — advance to next surah on end (114 total in Quran)
  reactUseEffect(() => {
    const a = document.getElementById('rl-quran-audio');
    if (!a) return;
    const onEnd = () => {
      const p = window.RL_STATE?.loadProfile() || {};
      const cur = p.quranSurah || 1;
      const next = cur >= 114 ? 1 : cur + 1;
      window.RL_STATE?.saveProfile({ quranSurah: next });
    };
    a.addEventListener('ended', onEnd);
    return () => a.removeEventListener('ended', onEnd);
  }, []);

  const playSequence = () => {
    const p = window.RL_STATE?.loadProfile() || {};
    const preAzanSecs = p.preAzanSecs ?? 60;
    const seq = [
      ['PRE_AZAN', preAzanSecs * 1000],
      ['AZAN',     (p.azanDuration   ?? 300) * 1000],  // default 5 min
      ['IQAMAH',   (p.iqamahDuration ?? 600) * 1000],  // default 10 min
      ['SOLAT',    (p.solatDuration  ?? 600) * 1000],  // default 10 min
      ['NORMAL',   0],
    ];
    let i = 0;
    const audioTimer = { id: null };
    const tick = () => {
      if (i >= seq.length) return;
      const [ph, dur] = seq[i++];
      setPhase(ph);
      // Audio plays in the LAST 13s of PRE_AZAN — so it ends exactly when AZAN starts
      if (ph === 'PRE_AZAN') {
        const delay = Math.max(0, (preAzanSecs - AUDIO_LEN_SECS) * 1000);
        audioTimer.id = setTimeout(() => {
          try {
            const a = document.getElementById('rl-preazan-audio');
            if (a) { a.currentTime = 0; a.play().catch(()=>{}); }
          } catch {}
        }, delay);
      } else {
        if (audioTimer.id) clearTimeout(audioTimer.id);
        stopAllAudio();
      }
      if (dur > 0) setTimeout(tick, dur);
    };
    tick();
  };

  const overlayPrayer = (() => {
    const now = hr * 60 + time.getMinutes();
    const upc = window.RL.prayers.find(p => {
      const [hh, mm] = p.time.split(':').map(Number);
      return hh * 60 + mm > now;
    }) || window.RL.prayers[0];
    return upc.name.toUpperCase();
  })();

  return (
    <>
      <window.Sky time={time} weatherCode={weatherCode} />
      <window.WeatherEffects weatherCode={weatherCode} />

      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'grid',
        gridTemplateColumns: '1fr 420px',
        gridTemplateRows: '130px 1fr 80px',
        padding: 48, gap: 20,
        filter: ['PRE_AZAN', 'AZAN', 'IQAMAH', 'SOLAT', 'KHUTBAH'].includes(phase) ? 'blur(4px)' : 'none',
        transition: 'filter 0.7s ease',
      }}>
        <window.TVHeader time={time} />
        <window.MainStage time={time} slideIdx={slideIdx} onSlideChange={setSlideIdx} />
        <window.PrayerSidebar time={time} />
        <window.NewsTicker />
      </div>

      <style>{`#stage main, #stage main *, #stage button { pointer-events: auto; }`}</style>
      <window.PhaseOverlay phase={phase} prayer={overlayPrayer} countdown={countdown} />
      {/* Demo controls — visible if URL contains 'demo' */}
      {window.location.search.toLowerCase().includes('demo') && (
        <div style={{
          position: 'fixed', right: 20, bottom: 20, zIndex: 100000,
          display: 'flex', flexDirection: 'column', gap: 6,
          padding: 14, borderRadius: 20,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', textAlign: 'center', marginBottom: 4 }}>Demo · Fasa Solat</div>
          <button onClick={playSequence}
            style={{
              font: 'inherit', cursor: 'pointer', padding: '8px 14px', borderRadius: 12,
              background: '#e11d48', color: 'white', border: 'none',
              fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase',
              boxShadow: '0 8px 20px rgba(76,5,25,0.5)',
            }}>▶ Main Urutan</button>
          {['NORMAL','PRE_AZAN','AZAN','IQAMAH','SOLAT','KHUTBAH'].map(p => (
            <button key={p} onClick={() => setPhase(p)}
              style={{
                font: 'inherit', cursor: 'pointer', padding: '6px 12px', borderRadius: 10,
                background: p === phase ? 'rgba(244,63,94,0.20)' : 'rgba(255,255,255,0.05)',
                border: '1px solid ' + (p === phase ? 'rgba(244,63,94,0.40)' : 'rgba(255,255,255,0.08)'),
                color: p === phase ? '#fda4af' : 'rgba(255,255,255,0.55)',
                fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
                textAlign: 'left', minWidth: 110,
              }}>{p.replace('_','-')}</button>
          ))}
        </div>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<TVApp />);
