/* global React */
// RemoteTab.jsx — phase grid + transport + slide-duration quick-pick + toggles.

const { useState } = React;

const PHASES = [
  { id: 'PRE_AZAN',     label: 'Pre Azan',  emoji: '⏳' },
  { id: 'ANNOUNCEMENT', label: 'Annc 13s',  emoji: '📢' },
  { id: 'AZAN',         label: 'Azan',      emoji: '🕌' },
  { id: 'IQAMAH',       label: 'Iqamah',    emoji: '🙏' },
  { id: 'SOLAT',        label: 'Solat',     emoji: '🤲' },
  { id: 'KHUTBAH',      label: 'Khutbah',   emoji: '📖' },
  { id: 'OFF',          label: 'Reset All', emoji: '🧹' },
];

const TOGGLES = [
  { key: 'enableNews',     label: 'News',        emoji: '📰', desc: 'Berita dalam ticker'  },
  { key: 'showWorldClock', label: 'Jam Dunia',   emoji: '🌍', desc: 'Jam pelbagai negara'  },
  { key: 'enableQuran',    label: 'Audio Quran', emoji: '🎵', desc: 'Bacaan ambient masa idle' },
];

function Section({ title, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)', borderRadius: 24,
      border: '1px solid rgba(255,255,255,0.05)', padding: 20,
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <h3 style={{ margin: 0, fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>{title}</h3>
      {children}
    </div>
  );
}

// Compute the active slide list based on current profile + tokens
function buildSlideList(profile) {
  const tickerItems = window.RL?.tickerItems || [];
  const customSlides = profile.slides || [];
  const today = new Date().toISOString().slice(0, 10);
  const activeCustom = customSlides.filter(s => {
    if (s.active === false) return false;
    if (s.startDate && s.startDate > today) return false;
    if (s.endDate   && s.endDate   < today) return false;
    return true;
  });
  const fallbackSlides = window.RL?.slides || [
    { title: 'Jam Dunia' },
    { title: 'Makluman Masjid' },
  ];
  if (activeCustom.length > 0) {
    return [{ title: 'Jam Dunia' }, ...activeCustom, ...(tickerItems.length ? [{ title: 'Berita Terkini' }] : [])];
  }
  return [...fallbackSlides, ...(tickerItems.length ? [{ title: 'Berita Terkini' }] : [])];
}

function RemoteTab() {
  const [profile, setProfile] = window.RL_STATE.useProfile();

  const phase    = profile.activePhase || 'OFF';
  const setPhase = (val) => setProfile({ activePhase: val });

  const paused    = profile.slidePaused || false;
  const setPaused = (val) => setProfile({ slidePaused: val });

  const duration    = profile.slideDuration || 8;
  const setDuration = (val) => setProfile({ slideDuration: val });

  const toggles = {
    enableNews:     profile.enableNews     ?? true,
    showWorldClock: profile.showWorldClock ?? true,
    enableQuran:    profile.enableQuran    ?? true,
  };
  const setToggles = (val) => {
    const next = typeof val === 'function' ? val(toggles) : val;
    setProfile(next);
  };

  const setDur = (key, val) => setProfile({ [key]: val });
  const dur    = (key, fallback) => Number(profile[key] ?? fallback);

  const activeSlideIdx = profile.activeSlideIdx || 0;
  const slideList      = buildSlideList(profile);
  const safIdx         = Math.min(activeSlideIdx, slideList.length - 1);
  const cur            = slideList[safIdx] || slideList[0];
  const currentSlideTitle = cur
    ? `${safIdx + 1}/${slideList.length} — ${cur.title || (cur.type === 'poster' ? 'Poster' : 'Slaid')}`
    : 'Tiada Slaid';

  const handlePrevSlide = () => {
    const list = buildSlideList(profile);
    const curIdx = profile.activeSlideIdx || 0;
    setProfile({ activeSlideIdx: (curIdx - 1 + list.length) % list.length });
  };

  const handleNextSlide = () => {
    const list = buildSlideList(profile);
    const curIdx = profile.activeSlideIdx || 0;
    setProfile({ activeSlideIdx: (curIdx + 1) % list.length });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Live Status Bar */}
      <div style={{
        background: 'rgba(0,0,0,0.40)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)',
        padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', animation: 'rl-live-pulse 2s infinite', flexShrink: 0 }} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.20)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 2 }}>Paparan TV Sekarang</div>
            <div style={{ fontSize: 13, fontWeight: 900, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentSlideTitle}</div>
          </div>
        </div>
        <div style={{
          padding: '6px 12px', borderRadius: 12, fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
          border: '1px solid', flexShrink: 0,
          background:   paused ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
          color:        paused ? '#fbbf24'              : '#34d399',
          borderColor:  paused ? 'rgba(245,158,11,0.30)' : 'rgba(16,185,129,0.30)',
        }}>{paused ? 'PAUSE' : 'MAIN'}</div>
      </div>

      <Section title="Fasa Solat">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {PHASES.map(p => {
            const active = phase === p.id;
            return (
              <button key={p.id} onClick={() => setPhase(p.id)} style={{
                font: 'inherit', cursor: 'pointer',
                padding: '14px 6px', borderRadius: 16, border: '1px solid',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em',
                background:   active ? '#e11d48' : 'rgba(255,255,255,0.05)',
                color:        active ? 'white' : 'rgba(255,255,255,0.40)',
                borderColor:  active ? '#f43f5e' : 'rgba(255,255,255,0.05)',
                boxShadow:    active ? '0 12px 30px rgba(76,5,25,0.6)' : 'none',
                transition: 'all 0.15s ease',
              }}>
                <span style={{ fontSize: 18 }}>{p.emoji}</span>
                {p.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Kawalan Slaid">
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
          <button onClick={handlePrevSlide} style={{ font:'inherit', cursor: 'pointer', width: 64, height: 64, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', borderRadius: 18, color:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
          </button>

          <button onClick={() => setPaused(p => !p)} style={{
            font: 'inherit', cursor: 'pointer',
            width: 80, height: 80, borderRadius: '50%',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            border: '4px solid',
            background:   paused ? '#f59e0b' : '#e11d48',
            borderColor:  paused ? '#fbbf24' : '#fb7185',
            boxShadow:    paused ? '0 12px 30px rgba(69,26,3,0.5)' : '0 12px 30px rgba(76,5,25,0.6)',
            color: 'white', gap: 2,
          }}>
            {paused
              ? <svg width="30" height="30" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              : <svg width="30" height="30" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>}
            <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {paused ? 'MAIN' : 'JEDA'}
            </span>
          </button>

          <button onClick={handleNextSlide} style={{ font:'inherit', cursor: 'pointer', width: 64, height: 64, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.10)', borderRadius: 18, color:'rgba(255,255,255,0.7)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="26" height="26" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <div>
          <p style={{ margin: '0 0 8px 0', fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.20)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Tempoh Setiap Slaid</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {[5, 8, 12, 20, 30].map(s => (
              <button key={s} onClick={() => setDuration(s)} style={{
                flex: 1, font: 'inherit', cursor: 'pointer',
                padding: '8px 0', borderRadius: 10, border: '1px solid',
                fontSize: 11, fontWeight: 900,
                background:  s === duration ? '#e11d48' : 'rgba(255,255,255,0.05)',
                color:       s === duration ? 'white' : 'rgba(255,255,255,0.5)',
                borderColor: s === duration ? '#f43f5e' : 'rgba(255,255,255,0.08)',
              }}>{s}s</button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Tempoh Fasa Solat">
        {[
          { k: 'preAzanSecs',    label: 'Pra-Azan', fb: 60  },
          { k: 'azanDuration',   label: 'Azan',     fb: 300 },
          { k: 'iqamahDuration', label: 'Iqamah',   fb: 600 },
          { k: 'solatDuration',  label: 'Solat',    fb: 600 },
        ].map(row => {
          const secs = dur(row.k, row.fb);
          // unit pref stored per-row in profile so it persists
          const unitKey = row.k + '_unit';
          const unit = profile[unitKey] || (secs >= 60 ? 'm' : 's');
          const displayVal = unit === 'm' ? Math.max(1, Math.round(secs / 60)) : secs;
          return (
            <div key={row.k} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 14,
              background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ flex: 1, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.75)' }}>{row.label}</span>
              <input type="number" min="1" max="600" step="1"
                value={displayVal}
                onChange={e => {
                  const v = Number(e.target.value) || 0;
                  setDur(row.k, unit === 'm' ? v * 60 : v);
                }}
                style={{
                  font: 'inherit', width: 72, padding: '10px 10px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'white', fontSize: 15, fontWeight: 900, textAlign: 'center', outline: 'none',
                }} />
              <button onClick={() => setProfile({ [unitKey]: unit === 'm' ? 's' : 'm' })}
                style={{
                  font: 'inherit', cursor: 'pointer',
                  padding: '6px 10px', borderRadius: 10,
                  background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.30)',
                  color: '#fda4af',
                  fontSize: 9, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase',
                  minWidth: 56,
                }}>{unit === 'm' ? 'Minit' : 'Saat'}</button>
            </div>
          );
        })}
        <p style={{ margin: '4px 2px 0', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.30)', lineHeight: 1.4 }}>
          Tap unit untuk tukar antara saat ↔ minit. Audio "Menjelang Azan" main automatik bila fasa Pra-Azan bermula.
        </p>
      </Section>

      <Section title="Ciri Paparan">
        {TOGGLES.map(t => {
          const on = toggles[t.key];
          return (
            <div key={t.key} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: 12, borderRadius: 18,
              background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <span style={{ fontSize: 20, filter: on ? 'none' : 'grayscale(0.6)' }}>{t.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.015em', color: on ? 'white' : 'rgba(255,255,255,0.55)' }}>{t.label}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.30)' }}>{t.desc}</div>
              </div>
              <button onClick={() => setToggles(p => ({ ...p, [t.key]: !p[t.key] }))} style={{
                cursor: 'pointer', border: 'none',
                width: 44, height: 26, borderRadius: 999,
                background: on ? '#e11d48' : 'rgba(255,255,255,0.10)',
                position: 'relative', transition: 'background 0.15s ease',
                padding: 0,
              }}>
                <span style={{
                  position: 'absolute', top: 3, [on ? 'right' : 'left']: 3,
                  width: 20, height: 20, borderRadius: '50%',
                  background: on ? 'white' : 'rgba(255,255,255,0.5)',
                  transition: 'all 0.15s ease',
                }} />
              </button>
            </div>
          );
        })}
      </Section>

      {/* Manual sync — broadcasts current full profile to TV */}
      <SyncToTVButton profile={profile} setProfile={setProfile} />

      <style>{`@keyframes rl-live-pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

function SyncToTVButton({ profile, setProfile }) {
  const [state, setState] = useState('idle'); // idle | sending | done

  const push = () => {
    setState('sending');
    // saveProfile({}) re-saves the current profile and broadcasts it
    window.RL_STATE?.saveProfile({});
    setTimeout(() => setState('done'), 600);
    setTimeout(() => setState('idle'), 2200);
  };

  const isCloud = !!window.RL_STATE?.isCloudSynced;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)', borderRadius: 24,
      border: '1px solid rgba(255,255,255,0.05)', padding: '16px 20px',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0, fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          Hantar ke TV
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: isCloud ? '#34d399' : '#f59e0b',
            boxShadow: `0 0 6px ${isCloud ? '#34d399' : '#f59e0b'}`,
          }} />
          <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: isCloud ? '#34d399' : '#fbbf24' }}>
            {isCloud ? 'Broadcast' : 'Lokal'}
          </span>
        </div>
      </div>
      <button onClick={push} style={{
        font: 'inherit', cursor: 'pointer',
        padding: '14px 16px', borderRadius: 16,
        background: state === 'done'
          ? 'rgba(16,185,129,0.20)'
          : state === 'sending'
          ? 'rgba(244,63,94,0.25)'
          : '#e11d48',
        color: 'white', border: 'none',
        fontSize: 12, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        transition: 'background 0.2s ease',
        boxShadow: state === 'idle' ? '0 8px 24px rgba(76,5,25,0.5)' : 'none',
      }}>
        {state === 'done'    ? '✓ Dihantar ke TV'
         : state === 'sending' ? 'Menghantar...'
         : '📡 Push Semua ke TV'}
      </button>
      {!isCloud && (
        <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.30)', lineHeight: 1.4 }}>
          Tiada sambungan Supabase — hanya berfungsi dalam pelayar yang sama.
        </p>
      )}
    </div>
  );
}

window.RemoteTab = RemoteTab;
