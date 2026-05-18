/* global React */
// SetupTab.jsx — stub view (the real setup is a multi-step wizard).

function SetupTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{
        background: 'rgba(255,255,255,0.05)', borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.05)', padding: 24,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center',
      }}>
        <window.MosqueIcon size={84} />
        <div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.04em' }}>Setup Selesai</h2>
          <p style={{ margin: '6px 0 0 0', fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            Masjid Al-Falah · WLY01
          </p>
        </div>
        <button style={{
          font: 'inherit', cursor: 'pointer', width: '100%', marginTop: 8,
          padding: '14px 16px', borderRadius: 18,
          background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
          border: '1px solid rgba(255,255,255,0.05)',
          fontSize: 10, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase',
        }}>Cari Masjid Lain</button>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.05)', borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.05)', padding: 20,
      }}>
        <h3 style={{ margin: 0, fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', textTransform: 'uppercase', paddingBottom: 14, marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          Statistik
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[{ l: 'Slaid', v: 3 }, { l: 'Notis', v: 3 }, { l: 'Hadith', v: 100 }].map(s => (
            <div key={s.l} style={{ background: 'rgba(0,0,0,0.30)', padding: '14px 0', borderRadius: 14, textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ margin: 0, fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.20)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 4 }}>{s.l}</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.SetupTab = SetupTab;
