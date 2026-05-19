/* global React */
// SetupTab.jsx — mosque identity summary + sync status + quick navigation.

const { useState, useEffect } = React;

function SetupTab() {
  const [profile, setProfile] = window.RL_STATE.useProfile();
  const [syncMsg, setSyncMsg] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const isCloudEnabled = !!window.RL_STATE?.isCloudSynced;
  const pairCode = (profile.mosqueId || '').replace(/-/g, '').slice(0, 6).toUpperCase();

  // Count real stats from profile
  const slideCount  = (profile.slides  || []).length;
  const noticeCount = (profile.notices || []).length;
  const zone        = profile.zone || 'WLY01';
  const zoneMeta    = (window.RL_ZONES || []).find(z => z.code === zone);

  const syncNow = async () => {
    setSyncing(true); setSyncMsg(null);
    try {
      if (!window.RL_SOLAT) throw new Error('solat helper not loaded');
      const times = await window.RL_SOLAT.fetchToday(zone);
      setProfile({ prayerTimes: times, prayerTimesSync: new Date().toISOString() });
      setSyncMsg({ ok: true, text: 'Waktu solat dikemas kini.' });
    } catch {
      setSyncMsg({ ok: false, text: 'Gagal. Semak sambungan internet.' });
    }
    setSyncing(false);
    setTimeout(() => setSyncMsg(null), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Identity card */}
      <div style={{
        background: 'rgba(255,255,255,0.05)', borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.05)', padding: 24,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center',
      }}>
        <window.MosqueIcon size={84} logoUrl={profile.logoUrl} />
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-0.03em' }}>
            {profile.mosqueName || '—'}
          </h2>
          <p style={{ margin: '5px 0 0', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.1em' }}>
            {profile.mosqueAddress || ''}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            {zone}{zoneMeta ? ` · ${zoneMeta.label}` : ''}
          </p>
        </div>
        <a href="../../ui_kits/setup-wizard/index.html" style={{
          textDecoration: 'none', display: 'block', width: '100%',
          padding: '13px 16px', borderRadius: 18, marginTop: 4,
          background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.60)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: 10, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase',
          textAlign: 'center',
        }}>Kemaskini Maklumat Masjid</a>
      </div>

      {/* Stats */}
      <div style={{
        background: 'rgba(255,255,255,0.05)', borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.05)', padding: '14px 18px',
      }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          Kandungan
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { l: 'Slaid', v: slideCount  || 0 },
            { l: 'Notis', v: noticeCount || 0 },
            { l: 'Zon',   v: zone },
          ].map(s => (
            <div key={s.l} style={{ background: 'rgba(0,0,0,0.30)', padding: '14px 0', borderRadius: 14, textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ margin: 0, fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.20)', letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 4 }}>{s.l}</p>
              <p style={{ margin: 0, fontSize: typeof s.v === 'number' ? 22 : 14, fontWeight: 900 }}>{s.v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sync status + prayer time button */}
      <div style={{
        background: 'rgba(255,255,255,0.05)', borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.05)', padding: '16px 18px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', textTransform: 'uppercase' }}>
            Status Penyegerakan
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: isCloudEnabled ? '#34d399' : '#f59e0b',
              boxShadow: `0 0 8px ${isCloudEnabled ? '#34d399' : '#f59e0b'}`,
            }} />
            <span style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: isCloudEnabled ? '#34d399' : '#fbbf24' }}>
              {isCloudEnabled ? 'Awan Aktif' : 'Lokal Sahaja'}
            </span>
          </div>
        </div>

        {!isCloudEnabled && (
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
            Supabase tidak dikonfigurasi. Perubahan hanya disegerakkan dalam pelayar yang sama. Untuk kawalan merentas peranti, sambungkan melalui QR kod TV.
          </p>
        )}

        {/* Pairing code */}
        {pairCode && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 14, background: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.30)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Kod Sambung TV</span>
            <span style={{ fontSize: 16, fontWeight: 900, letterSpacing: '0.4em', color: 'var(--rl-accent-light, #fb7185)', fontVariantNumeric: 'tabular-nums' }}>{pairCode}</span>
          </div>
        )}

        {/* Sync prayer times */}
        <button onClick={syncNow} disabled={syncing} style={{
          font: 'inherit', cursor: syncing ? 'wait' : 'pointer',
          padding: '13px 16px', borderRadius: 16,
          background: 'rgba(244,63,94,0.12)', color: '#fb7185',
          border: '1px solid rgba(244,63,94,0.25)',
          fontSize: 11, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          {syncing ? 'Menyegerak...' : '↻ Muat Semula Waktu Solat'}
        </button>
        {syncMsg && (
          <p style={{ margin: 0, fontSize: 10, fontWeight: 700, textAlign: 'center', color: syncMsg.ok ? '#34d399' : '#fb7185' }}>
            {syncMsg.text}
          </p>
        )}
        {profile.prayerTimesSync && (
          <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textAlign: 'center', letterSpacing: '0.1em' }}>
            Terakhir: {new Date(profile.prayerTimesSync).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>

    </div>
  );
}

window.SetupTab = SetupTab;
