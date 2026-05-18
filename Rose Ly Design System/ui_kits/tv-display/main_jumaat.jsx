import '../../shared/init.js';

import '../../shared/state.js';
import '../../shared/solat.js';
import './tokens.js';
import './Sky.jsx';
import './WeatherEffects.jsx';
import '../../assets/SvgClock.jsx';
import './TVHeader.jsx';
import './PrayerSidebar.jsx';
import './NewsTicker.jsx';
import './JumaatBanner.jsx';
import './KhutbahStage.jsx';

const { useState: reactUseState, useEffect: reactUseEffect } = React;

function JumaatApp() {
  const [time, setTime] = reactUseState(new Date());
  reactUseEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  return (
    <>
      <window.Sky time={time} weatherCode={63} />
      <window.WeatherEffects weatherCode={63} />
      <window.JumaatBanner />

      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'grid',
        gridTemplateColumns: '1fr 420px',
        gridTemplateRows: '130px 1fr 80px',
        padding: '88px 48px 48px',
        gap: 20,
        pointerEvents: 'none',
      }}>
        <window.TVHeader time={time} />
        <window.KhutbahStage />
        <window.PrayerSidebar time={time} />
        <window.NewsTicker />
      </div>

      <style>{`#stage main, #stage main *, #stage button { pointer-events: auto; }`}</style>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<JumaatApp />);
