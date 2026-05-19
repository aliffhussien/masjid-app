/* global React */
// TetapanTab.jsx — settings: mosque info (with logo upload), prayer zone, cloud sync, theme picker.
import _logoMark from '../../assets/logo-mark.png';

const { useState, useRef } = React;

const THEMES = [
  { id: 'emerald', name: 'Emerald', color: '#10b981' },
  { id: 'rose',    name: 'Ruby',    color: '#f43f5e' },
  { id: 'blue',    name: 'Sapphire',color: '#3b82f6' },
  { id: 'amber',   name: 'Gold',    color: '#f59e0b' },
  { id: 'mono',    name: 'Steel',   color: '#71717a' },
];

function Section({ title, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)', borderRadius: 24,
      border: '1px solid rgba(255,255,255,0.05)', padding: 20,
      display: 'flex', flexDirection: 'column', gap: 14,
    }}>
      <h3 style={{ margin: 0, fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.3em', textTransform: 'uppercase', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, value, onChange, focused }) {
  const editable = typeof onChange === 'function';
  return (
    <label style={{ display: 'block' }}>
      <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{label}</span>
      {editable ? (
        <input value={value || ''} onChange={(e) => onChange(e.target.value)}
          style={{
            font: 'inherit', width: '100%',
            marginTop: 6, padding: '12px 16px', borderRadius: 16,
            background: 'rgba(0,0,0,0.40)',
            border: `2px solid ${focused ? '#f43f5e' : 'rgba(255,255,255,0.08)'}`,
            fontSize: 14, fontWeight: 700, color: 'white', outline: 'none',
          }} />
      ) : (
        <div style={{
          marginTop: 6, padding: '12px 16px', borderRadius: 16,
          background: 'rgba(0,0,0,0.40)',
          border: `2px solid ${focused ? '#f43f5e' : 'rgba(255,255,255,0.08)'}`,
          fontSize: 14, fontWeight: 700, color: 'white',
        }}>{value}</div>
      )}
    </label>
  );
}

// Compress an image to webp data-url, max 512px on long edge.
function imageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('image decode failed'));
      img.onload = () => {
        const max = 512;
        let w = img.width, h = img.height;
        if (w > h && w > max) { h = h * max / w; w = max; }
        else if (h > max)     { w = w * max / h; h = max; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL('image/webp', 0.92));
        } catch (err) {
          resolve(canvas.toDataURL('image/png'));
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function LogoUploader({ logoUrl, setLogoUrl }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [err,  setErr]  = useState(null);

  const pick = () => inputRef.current?.click();

  const handleFile = async (file) => {
    if (!file) return;
    setErr(null);
    if (!file.type.startsWith('image/')) { setErr('Sila pilih fail gambar.'); return; }
    if (file.size > 6 * 1024 * 1024)     { setErr('Saiz fail maksimum 6MB.'); return; }
    setBusy(true);
    try {
      const dataUrl = await imageToDataUrl(file);
      setLogoUrl(dataUrl);
    } catch (e) {
      setErr('Gagal memproses gambar. Sila cuba fail lain.');
    } finally {
      setBusy(false);
    }
  };

  const onChange = (e) => handleFile(e.target.files?.[0]);
  const onDrop   = (e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); };

  return (
    <div>
      <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Logo Masjid</span>
      <div style={{ marginTop: 8, display: 'flex', gap: 14, alignItems: 'stretch' }}>
        {/* Preview */}
        <img
          src={logoUrl || _logoMark}
          width="88" height="88" alt=""
          style={{
            width: 88, height: 88, borderRadius: 22,
            objectFit: 'cover', background: '#1c0e21',
            border: '2px solid rgba(255,255,255,0.08)',
            flexShrink: 0, display: 'block',
          }}
        />

        {/* Actions */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
          <button onClick={pick} disabled={busy}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#f43f5e'; }}
            onDragLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.10)'; }}
            onDrop={onDrop}
            style={{
              font: 'inherit', cursor: busy ? 'wait' : 'pointer',
              flex: 1, minHeight: 50,
              padding: '12px 14px', borderRadius: 16,
              background: 'rgba(244,63,94,0.10)', color: '#fb7185',
              border: '2px dashed rgba(244,63,94,0.30)',
              fontSize: 11, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'border-color 0.2s ease',
            }}>
            {busy ? 'Memproses…'
                  : logoUrl ? 'Tukar Logo' : 'Muat Naik Logo'}
          </button>
          {logoUrl && (
            <button onClick={() => setLogoUrl(null)}
              style={{
                font: 'inherit', cursor: 'pointer',
                padding: '8px 14px', borderRadius: 12,
                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.08)',
                fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
              }}>Padam · Guna Default</button>
          )}
        </div>
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onChange} />
      </div>
      {err
        ? <p style={{ margin: '8px 0 0 0', fontSize: 10, fontWeight: 700, color: '#fb7185' }}>{err}</p>
        : <p style={{ margin: '8px 0 0 0', fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', lineHeight: 1.4 }}>
            Logo akan muncul di header paparan TV dan di apl admin ini. Saiz maksimum 6MB.
          </p>
      }
    </div>
  );
}

function SyncWaktu({ zone }) {
  const [, setProfile] = window.RL_STATE.useProfile();
  const [busy, setBusy] = useState(false);
  const [msg,  setMsg]  = useState(null);
  const [lastSync, setLastSync] = useState(() => {
    try { return window.RL_STATE.loadProfile().prayerTimesSync || null; } catch { return null; }
  });

  const sync = async () => {
    setBusy(true); setMsg(null);
    try {
      if (!window.RL_SOLAT) throw new Error('solat helper missing');
      const times = await window.RL_SOLAT.fetchToday(zone);
      const stamp = new Date().toISOString();
      setProfile({ prayerTimes: times, prayerTimesSync: stamp });
      setLastSync(stamp);
      setMsg({ tone: 'ok', text: 'Waktu solat dikemas kini.' });
    } catch (e) {
      setMsg({ tone: 'err', text: 'Gagal muat. Cuba lagi nanti.' });
    } finally { setBusy(false); setTimeout(() => setMsg(null), 2500); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button onClick={sync} disabled={busy} style={{
        font: 'inherit', cursor: busy ? 'wait' : 'pointer',
        padding: '14px 16px', borderRadius: 18,
        background: '#e11d48', color: 'white', border: 'none',
        fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
        boxShadow: '0 12px 30px rgba(76,5,25,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        {busy ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              width: 14, height: 14, borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.30)', borderTopColor: 'white',
              animation: 'rl-spin 0.7s linear infinite',
            }} />
            <span>Menyinkron...</span>
            <style>{`@keyframes rl-spin { to { transform: rotate(360deg); } }`}</style>
          </span>
        ) : 'Muat Semula Waktu Solat'}
      </button>
      {lastSync && (
        <p style={{ margin: 0, fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.40)', letterSpacing: '0.15em', textAlign: 'center' }}>
          Terakhir disinkron: {new Date(lastSync).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
        </p>
      )}
      {msg && (
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: msg.tone === 'err' ? '#fb7185' : '#34d399', textAlign: 'center' }}>{msg.text}</p>
      )}
    </div>
  );
}

function LangPicker() {
  const [profile, setProfile] = window.RL_STATE.useProfile();
  const lang = profile.language || 'ms';
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[
        { id: 'ms', label: 'Bahasa Melayu' },
        { id: 'en', label: 'English' },
      ].map(o => (
        <button key={o.id} onClick={() => setProfile({ language: o.id })} style={{
          font: 'inherit', cursor: 'pointer',
          flex: 1, padding: '12px 10px', borderRadius: 14,
          background: lang === o.id ? 'var(--rl-accent-dim, rgba(244,63,94,0.15))' : 'rgba(0,0,0,0.30)',
          border: '2px solid ' + (lang === o.id ? 'var(--rl-accent, #f43f5e)' : 'rgba(255,255,255,0.08)'),
          color: lang === o.id ? 'white' : 'rgba(255,255,255,0.55)',
          fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function BackupRestore() {
  const [, setProfile] = window.RL_STATE.useProfile();
  const [msg, setMsg] = useState(null);
  const inputRef = React.useRef(null);
  const ts = (msg, tone='ok') => { setMsg({ msg, tone }); setTimeout(() => setMsg(null), 2500); };

  const exportData = () => {
    try {
      const data = window.RL_STATE.loadProfile();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rose-ly-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      ts('Backup dimuat turun.');
    } catch (e) { ts('Gagal eksport.', 'err'); }
  };

  const importData = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || typeof data !== 'object') throw new Error('invalid');
        setProfile(data);
        ts('Backup dipulihkan.');
      } catch (err) { ts('Fail tidak sah.', 'err'); }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button onClick={exportData} style={{
        font: 'inherit', cursor: 'pointer',
        padding: '12px 14px', borderRadius: 14,
        background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.08)',
        fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
        Eksport Backup
      </button>
      <button onClick={() => inputRef.current?.click()} style={{
        font: 'inherit', cursor: 'pointer',
        padding: '12px 14px', borderRadius: 14,
        background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.08)',
        fontSize: 11, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12"/></svg>
        Pulih Dari Fail
      </button>
      <input ref={inputRef} type="file" accept="application/json,.json" style={{ display: 'none' }}
        onChange={e => importData(e.target.files?.[0])} />
      {msg && (
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: msg.tone === 'err' ? '#fb7185' : '#34d399', textAlign: 'center' }}>{msg.msg}</p>
      )}
    </div>
  );
}

function TetapanTab({ logoUrl, setLogoUrl, mosqueName, mosqueAddress, zone }) {
  const [profile, setProfile] = window.RL_STATE.useProfile();
  const theme = profile.theme || 'rose';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      <Section title="Maklumat Masjid">
        <LogoUploader logoUrl={logoUrl} setLogoUrl={setLogoUrl} />
        <Field label="Nama Masjid"     value={mosqueName}    onChange={(v) => setProfile({ mosqueName: v })}    focused />
        <Field label="Alamat / Lokasi" value={mosqueAddress} onChange={(v) => setProfile({ mosqueAddress: v })} />
      </Section>

      <Section title="PIN Keselamatan">
        <Field label="PIN Pentadbir (4-Digit)" value={profile.adminPin || ''} onChange={(v) => {
          if (/^\d{0,4}$/.test(v)) setProfile({ adminPin: v });
        }} />
        <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.40)', lineHeight: 1.5 }}>
          Kosongkan PIN jika tidak mahu menggunakan kunci keselamatan. Jika PIN ditetapkan, panel Mobile Admin akan dikunci secara automatik untuk menghalang suntingan tanpa kebenaran.
        </p>
      </Section>

      <Section title="Zon Waktu Solat">
        <label style={{ display: 'block' }}>
          <span style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.30)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Zon JAKIM</span>
          <select
            value={profile.zone || 'WLY01'}
            onChange={e => setProfile({ zone: e.target.value })}
            style={{
              font: 'inherit', width: '100%',
              marginTop: 6, padding: '12px 16px', borderRadius: 16,
              background: 'rgba(0,0,0,0.40)',
              border: '2px solid rgba(255,255,255,0.08)',
              fontSize: 13, fontWeight: 700, color: 'white', outline: 'none',
              cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none',
            }}
          >
            {(window.RL_ZONES || []).map(z => (
              <option key={z.code} value={z.code} style={{ background: '#1c0e21', color: 'white' }}>
                {z.code} · {z.label}
              </option>
            ))}
          </select>
        </label>
        <SyncWaktu zone={profile.zone || 'WLY01'} />
      </Section>

      <Section title="Bahasa / Language">
        <LangPicker />
      </Section>

      <Section title="Backup &amp; Pulih">
        <BackupRestore />
      </Section>

      <Section title="Warna Tema">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {THEMES.map(t => {
            const active = theme === t.id;
            return (
              <button key={t.id} onClick={() => setProfile({ theme: t.id })} style={{
                font: 'inherit', cursor: 'pointer',
                padding: 10, borderRadius: 14,
                background: 'rgba(0,0,0,0.30)', border: `2px solid ${active ? t.color : 'rgba(255,255,255,0.08)'}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', background: t.color, boxShadow: active ? `0 0 14px ${t.color}` : 'none' }} />
                <span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: active ? 'white' : 'rgba(255,255,255,0.4)' }}>{t.name}</span>
              </button>
            );
          })}
        </div>
      </Section>

    </div>
  );
}

window.TetapanTab = TetapanTab;
