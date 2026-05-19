/* global React */
// TVHeader.jsx — top bar: logo + identity, hadith rotation, weather widget, Hijri/Gregorian date, clock.
import _logoMark from '../../assets/logo-mark.png';

const { useState, useEffect } = React;

// Official JAKIM-aligned Hijri date using Umm al-Qura calendar (same basis as Malaysia's official Islamic calendar)
const HIJRI_MONTHS = ['Muharram','Safar','Rabiulawal','Rabiulakhir','Jamadilawal','Jamadilakhir','Rejab','Syaaban','Ramadan','Syawal','Zulkaedah','Zulhijah'];
function computeHijri(date) {
  try {
    const parts = new Intl.DateTimeFormat('en-u-ca-islamic-umalqura', {
      day: 'numeric', month: 'numeric', year: 'numeric',
    }).formatToParts(date);
    const d = parts.find(p => p.type === 'day')?.value || '';
    const m = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10) - 1;
    const y = parts.find(p => p.type === 'year')?.value || '';
    return `${d} ${HIJRI_MONTHS[m] || ''} ${y} H`;
  } catch { return ''; }
}

function TVHeader({ time, mosqueName, mosqueAddress, logoUrl }) {
  // Subscribe to shared profile for live updates from the admin app.
  // Always call the hook (rules-of-hooks); fall back to defaults if state.js missing.
  const useProf = window.RL_STATE?.useProfile;
  const subscribed = useProf ? useProf() : [null, () => {}];
  const profile = subscribed[0];
  const name    = mosqueName    ?? profile?.mosqueName    ?? 'Masjid Al-Falah';
  const address = mosqueAddress ?? profile?.mosqueAddress ?? 'Kampung Baru, Kuala Lumpur';
  const logo    = logoUrl       ?? profile?.logoUrl       ?? null;
  const [hadithIdx,  setHadithIdx]  = useState(0);
  const [weatherIdx, setWeatherIdx] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const hadiths = window.RL.hadiths;

  useEffect(() => {
    const h = setInterval(() => setHadithIdx(i => (i + 1) % hadiths.length), 8000);
    const w = setInterval(() => setWeatherIdx(i => (i + 1) % 3), 6000);
    return () => { clearInterval(h); clearInterval(w); };
  }, [hadiths.length]);

  useEffect(() => {
    let active = true;
    const fetchWeather = async () => {
      try {
        let lat = 3.1390;
        let lon = 101.6869;
        if (profile?.gps) {
          const parts = profile.gps.split(',');
          if (parts.length === 2) {
            const parsedLat = parseFloat(parts[0].trim());
            const parsedLon = parseFloat(parts[1].trim());
            if (!isNaN(parsedLat) && !isNaN(parsedLon)) {
              lat = parsedLat;
              lon = parsedLon;
            }
          }
        }
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
        if (!res.ok) throw new Error('API failed');
        const data = await res.json();
        if (!active) return;

        const mapWeather = (code) => {
          if (code === 0) return { icon: '☀️', desc: 'Cerah' };
          if (code >= 1 && code <= 3) return { icon: '⛅', desc: 'Berawan' };
          if (code === 45 || code === 48) return { icon: '🌫️', desc: 'Kabut' };
          if (code >= 51 && code <= 55) return { icon: '🌦️', desc: 'Gerimis' };
          if (code >= 61 && code <= 65) return { icon: '🌧️', desc: 'Hujan' };
          if (code >= 80 && code <= 82) return { icon: '🌧️', desc: 'Hujan Lebat' };
          if (code >= 95) return { icon: '⛈️', desc: 'Ribut Petir' };
          return { icon: '⛅', desc: 'Berawan' };
        };

        const currentMap = mapWeather(data.current.weather_code);
        const d1Map = mapWeather(data.daily.weather_code[1]);
        const d2Map = mapWeather(data.daily.weather_code[2]);

        setWeatherData([
          { label: 'SEKARANG: LIVE', temp: `${Math.round(data.current.temperature_2m)}°C`, icon: currentMap.icon, desc: currentMap.desc },
          { label: 'ESOK: RAMALAN', temp: `${Math.round(data.daily.temperature_2m_min[1])}° – ${Math.round(data.daily.temperature_2m_max[1])}°`, icon: d1Map.icon, desc: d1Map.desc },
          { label: 'LUSA: RAMALAN', temp: `${Math.round(data.daily.temperature_2m_min[2])}° – ${Math.round(data.daily.temperature_2m_max[2])}°`, icon: d2Map.icon, desc: d2Map.desc },
        ]);
      } catch (err) {
        console.warn('Weather API failed, using fallbacks:', err);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => { active = false; clearInterval(interval); };
  }, [profile?.gps]);

  const weather = (weatherData || [
    { label: 'LIVE: KUALA LUMPUR', temp: '32°C',      icon: '⛅',  desc: 'Berawan' },
    { label: 'ESOK: RAMALAN',     temp: '26° – 31°', icon: '🌦️', desc: 'Gerimis' },
    { label: 'LUSA: RAMALAN',     temp: '28° – 33°', icon: '☀️',  desc: 'Cerah'   },
  ])[weatherIdx];
  const months = ['JANUARI','FEBRUARI','MAC','APRIL','MEI','JUN','JULAI','OGOS','SEPTEMBER','OKTOBER','NOVEMBER','DISEMBER'];
  const hijri = computeHijri(time);
  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const [clockTime, ampm] = timeStr.split(' ');

  const h = hadiths[hadithIdx];

  return (
    <header style={{
      gridColumn: '1 / -1',
      borderRadius: 40,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.25) 100%)',
      backdropFilter: 'blur(2px) saturate(120%)',
      WebkitBackdropFilter: 'blur(2px) saturate(120%)',
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', gap: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Top dark gradient — protects everything in this header from sun/moon glare */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.30), transparent 60%)', pointerEvents: 'none', borderRadius: 40 }} />

      {/* — Left: logo + name — */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 1, position: 'relative', width: 360, minWidth: 0 }}>
        <div style={{ width: 4, height: 48, borderRadius: 999, background: '#e11d48', boxShadow: '0 0 12px rgba(225,29,72,0.9)' }} />
        <img
          src={logo || _logoMark}
          width="64" height="64" alt="Masjid Logo"
          onClick={() => window.location.href = '../../index.html'}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          style={{
            width: 64, height: 64, borderRadius: 18,
            objectFit: 'cover', background: '#1c0e21',
            boxShadow: '0 10px 24px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)',
            flexShrink: 0, display: 'block', cursor: 'pointer',
            transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <h1 style={{
            margin: 0, fontWeight: 900, letterSpacing: '-0.025em', lineHeight: 1, textTransform: 'uppercase',
            fontStyle: 'italic', fontSize: 26, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            background: 'linear-gradient(90deg,#fff 55%,#fda4af 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.85))',
          }}>{name}</h1>
          <p style={{
            margin: '6px 0 0 0', fontWeight: 700, fontSize: 10, color: '#f43f5e',
            letterSpacing: '0.18em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 6,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))',
          }}>
            <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--rl-accent, #f43f5e)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{address}</span>
          </p>
        </div>
      </div>

      {/* — Middle: hadith — */}
      <div style={{
        flex: 1, padding: '0 20px', height: 76, minWidth: 200,
        borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', overflow: 'hidden', position: 'relative',
      }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(244,63,94,0.85)', marginBottom: 8, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
          {h.source}
        </span>
        <p style={{
          margin: 0, fontSize: 20, fontWeight: 700, fontStyle: 'italic',
          letterSpacing: '-0.015em', lineHeight: 1.2, width: '100%',
          filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.9))',
          display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
          overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{h.text}</p>
      </div>

      {/* — Right: weather + clock — */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0, justifyContent: 'flex-end', position: 'relative' }}>
        <div style={{ position: 'relative', width: 140, height: 60, overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 10 }} key={weatherIdx}>
          <span style={{ fontSize: 30, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.8))' }}>{weather.icon}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.50)', textTransform: 'uppercase', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}>{weather.label}</div>
            <div style={{ fontSize: 20, fontWeight: 900, lineHeight: 1, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.9))' }}>{weather.temp}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--rl-accent-light, #fb7185)', textTransform: 'uppercase', marginTop: 2, letterSpacing: '0.08em', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}>{weather.desc}</div>
          </div>
        </div>

        <div style={{ width: 1, height: 64, background: 'rgba(255,255,255,0.12)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--rl-accent-light, #fb7185)', letterSpacing: '-0.015em', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.9))', lineHeight: 1, marginBottom: 4, whiteSpace: 'nowrap' }}>{hijri}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase', letterSpacing: '0.15em', whiteSpace: 'nowrap', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))' }}>
              {time.getDate()} {months[time.getMonth()]} {time.getFullYear()}
            </span>
          </div>
          <div style={{ width: 170, height: 42, display: 'flex', alignItems: 'center', color: 'var(--rl-accent-light, #fb7185)', filter: 'drop-shadow(0 4px 12px rgba(251,113,133,0.4))' }}>
            <window.SvgClock time={time} />
          </div>
        </div>
      </div>

      <style>{`@keyframes rl-shimmer { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }`}</style>
    </header>
  );
}

window.TVHeader = TVHeader;
