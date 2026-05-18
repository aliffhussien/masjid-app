/* global React */
// JumaatBanner.jsx — full-width banner across the top of the dashboard on Fridays.

function JumaatBanner() {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      padding: '14px 32px', zIndex: 12,
      background: 'linear-gradient(180deg, rgba(168,85,247,0.30) 0%, rgba(168,85,247,0.05) 100%)',
      borderBottom: '1px solid rgba(168,85,247,0.20)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18,
      filter: 'drop-shadow(0 4px 20px rgba(168,85,247,0.25))',
    }}>
      <span style={{ width: 40, height: 1, background: 'rgba(192,132,252,0.5)' }} />
      <span style={{
        fontSize: 11, fontWeight: 900, letterSpacing: '0.5em', textTransform: 'uppercase',
        color: '#c084fc',
        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.7))',
      }}>Hari Ini · Jumaat Mubarak</span>
      <span style={{ width: 40, height: 1, background: 'rgba(192,132,252,0.5)' }} />
    </div>
  );
}

window.JumaatBanner = JumaatBanner;
