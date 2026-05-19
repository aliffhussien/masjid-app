import '../../shared/init.js';

import '../../shared/state.js';
import '../../shared/zones.js';
import './Splash.jsx';
import './WizardSteps.jsx';

const { useState } = React;

function SetupApp() {
  const [splashed, setSplashed] = useState(false);
  const [step, setStep] = useState(0);  // 0 welcome 1 search 2 logo 3 finish
  const [mosque, setMosque] = useState(null);
  const [logoUrl, setLogoUrl] = useState(() => {
    try { return window.RL_STATE?.loadProfile().logoUrl || null; } catch { return null; }
  });

  const saveLogo = (url) => {
    setLogoUrl(url);
    try { window.RL_STATE?.saveProfile({ logoUrl: url }); } catch {}
  };

  const goSearch = () => setStep(1);
  const saveMosque = (m) => {
    setMosque(m);
    try {
      window.RL_STATE?.saveProfile({
        mosqueName:    m.name,
        mosqueAddress: m.address,
        zone:          m.zone,
      });
    } catch {}
    setStep(2);
  };

  return (
    <>
      {!splashed && <window.Splash onDone={() => setSplashed(true)} />}
      {splashed && <>
        <window.Wizard.ProgressDots step={step} total={4} />
        {step === 0 && <window.Wizard.Welcome      onStart={goSearch} onManual={goSearch} />}
        {step === 1 && <window.Wizard.MosqueSearch  onSave={saveMosque} />}
        {step === 2 && <window.Wizard.UploadLogo    chosenMosque={mosque} logoUrl={logoUrl} setLogoUrl={saveLogo} onNext={() => setStep(3)} onSkip={() => setStep(3)} />}
        {step === 3 && <window.Wizard.Finish        chosenMosque={mosque} logoUrl={logoUrl} />}
        {/* Hub icon button — top-right, small, only visible after welcome */}
        {step > 0 && step < 3 && (
          <a href="../../index.html" title="Kembali ke Hub" style={{
            position: 'fixed', top: 14, right: 14, zIndex: 10000,
            width: 40, height: 40, borderRadius: 14,
            background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.45)', textDecoration: 'none',
          }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </a>
        )}
      </>}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<SetupApp />);
