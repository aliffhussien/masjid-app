/* global React */
// PrayerSidebar.jsx — right column: next prayer + countdown + 7-row list.

const { useMemo } = React;

function PrayerSidebar({ time }) {
  // Show ALL times including Imsak (sahur cutoff) and Syuruk (sunrise),
  // but only the 5 actual prayers count toward the "next prayer" countdown.
  const NON_PRAYERS = new Set(['Imsak', 'Syuruk']);

  // Pull live prayer times from shared profile (synced from e-Solat API by
  // the admin app). Fall back to demo times if not set yet.
  const useProf = window.RL_STATE?.useProfile;
  const subscribed = useProf ? useProf() : [null, () => {}];
  const profile = subscribed[0];
  const livePT  = profile?.prayerTimes;

  // Validate a stored time string — rejects "Invalid Date" artefacts
  const isValidTime = (t) => {
    if (!t || typeof t !== 'string') return false;
    const parts = t.split(':');
    if (parts.length < 2) return false;
    const h = parseInt(parts[0], 10), m = parseInt(parts[1], 10);
    return !isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59;
  };

  // If livePT has any invalid values, fall back to default entirely
  const livePTValid = livePT && Object.values(livePT).every(isValidTime);
  const prayers = livePTValid
    ? Object.entries(livePT).map(([name, time]) => ({ name, time }))
    : window.RL.prayers;

  // Compute next prayer + countdown
  const { next, countdown } = useMemo(() => {
    const now = time.getHours() * 60 + time.getMinutes();
    const withMins = prayers
      .filter(p => !NON_PRAYERS.has(p.name))
      .map(p => {
        const parts = (p.time || '').split(':');
        const hh = parseInt(parts[0], 10);
        const mm = parseInt(parts[1], 10);
        if (isNaN(hh) || isNaN(mm)) return null;
        return { ...p, mins: hh * 60 + mm };
      })
      .filter(Boolean);
    if (!withMins.length) return { next: { name: '—' }, countdown: '--:--:--' };
    // Find next upcoming prayer; if all passed, wrap to first one tomorrow
    const upcoming = withMins.find(p => p.mins > now) || withMins[0];

    let targetMins = upcoming.mins - now;
    if (targetMins <= 0) targetMins += 24 * 60;
    const totalSecs = Math.max(0, targetMins * 60 - time.getSeconds());
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return {
      next: upcoming,
      countdown: `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`,
    };
  }, [time]);

  const fmt12 = (t) => {
    if (!t || typeof t !== 'string') return '—';
    try {
      const d = new Date(`1970-01-01T${t}:00`);
      if (isNaN(d.getTime())) return t;
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch { return t; }
  };

  return (
    <aside style={{
      borderRadius: 40,
      background: 'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.30) 100%)',
      backdropFilter: 'blur(2px) saturate(120%)',
      WebkitBackdropFilter: 'blur(2px) saturate(120%)',
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.04)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Header — next prayer + countdown */}
      <div style={{
        padding: '24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center', position: 'relative',
      }}>
        <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.4em', color: 'var(--rl-accent, #f43f5e)', textTransform: 'uppercase', marginBottom: 8, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' }}>
          MENUJU SOLAT
        </span>
        <h3 style={{ margin: 0, fontSize: 44, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}>
          {next.name}
        </h3>
        <p style={{ margin: '4px 0 0 0', fontSize: 38, fontWeight: 900, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.025em', filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.8))' }}>
          {countdown}
        </p>
      </div>

      {/* Body — 7-prayer list */}
      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.6em', color: 'rgba(255,255,255,0.40)', textTransform: 'uppercase' }}>WAKTU SOLAT</span>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px rgba(34,197,94,1)' }} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          {prayers.map(p => {
            const isActive    = p.name === next.name;
            const isReference = NON_PRAYERS.has(p.name);
            return (
              <div key={p.name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 24px', borderRadius: 12, border: '1px solid',
                background:   isActive ? 'var(--rl-accent-dark, #e11d48)' : 'rgba(255,255,255,0.05)',
                borderColor:  isActive ? 'var(--rl-accent-edge, rgba(244,63,94,0.50))' : 'rgba(255,255,255,0.05)',
                transform:    isActive ? 'scale(1.02)' : 'scale(1)',
                boxShadow:    isActive ? '0 0 40px var(--rl-accent-glow, rgba(225,29,72,0.4))' : 'none',
                opacity:      isReference ? 0.55 : (isActive ? 1 : 0.9),
                transition:   'all 0.7s ease',
              }}>
                <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em', textTransform: 'uppercase', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))' }}>{p.name}</span>
                <span style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))', whiteSpace: 'nowrap' }}>
                  {fmt12(p.time)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

window.PrayerSidebar = PrayerSidebar;
