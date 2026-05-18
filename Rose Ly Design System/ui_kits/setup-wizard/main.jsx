import '../../shared/init.js';

import '../../shared/state.js';
import './Splash.jsx';
import './WizardSteps.jsx';

function SetupApp() {
  const [splashed, setSplashed] = useState(false);
  const [step, setStep] = useState(0);  // 0 welcome 1 searching 2 results 3 upload 4 finish
  const [mosque, setMosque] = useState(null);
  const [logoUrl, setLogoUrl] = useState(() => {
    try { return window.RL_STATE?.loadProfile().logoUrl || null; } catch { return null; }
  });

  const saveLogo = (url) => {
    setLogoUrl(url);
    try { window.RL_STATE?.saveProfile({ logoUrl: url }); } catch {}
  };

  // GPS search → after 1.8s show results
  const startSearch = () => {
    setStep(1);
    setTimeout(() => setStep(2), 1800);
  };
  const pickMosque = (m) => {
    setMosque(m);
    try {
      window.RL_STATE?.saveProfile({
        mosqueName:    m.name,
        mosqueAddress: m.address,
        zone:          m.zone,
      });
    } catch {}
    setStep(3);
  };

  return (
    <>
      {/* Floating hub link — always available */}
      <a href="../../index.html" style={{
        position: 'fixed', top: 16, left: 16, zIndex: 10000,
        padding: '6px 12px', borderRadius: 999,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)',
        color: 'rgba(255,255,255,0.6)', textDecoration: 'none',
        border: '1px solid rgba(255,255,255,0.10)',
        fontSize: 9, fontWeight: 900, letterSpacing: '0.25em', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>← Hub</a>

      {!splashed && <window.Splash onDone={() => setSplashed(true)} />}
      {splashed && <>
        <window.Wizard.ProgressDots step={step} total={5} />
        {step === 0 && <window.Wizard.Welcome   onStart={startSearch} onManual={startSearch} />}
        {step === 1 && <window.Wizard.Searching />}
        {step === 2 && <window.Wizard.Results   onPick={pickMosque} onManual={() => setStep(2)} />}
        {step === 3 && <window.Wizard.UploadLogo chosenMosque={mosque} logoUrl={logoUrl} setLogoUrl={saveLogo} onNext={() => setStep(4)} onSkip={() => setStep(4)} />}
        {step === 4 && <window.Wizard.Finish    chosenMosque={mosque} logoUrl={logoUrl} />}
      </>}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<SetupApp />);
