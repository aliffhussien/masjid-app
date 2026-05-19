import '../../shared/init.js';
import './pair.js';               // must run before state.js — sets mosqueId from ?mosque= URL param
import '../tv-display/tokens.js';
import '../../shared/state.js';
import '../../shared/zones.js';
import '../../shared/i18n.js';
import '../../shared/solat.js';
import './MosqueIcon.jsx';
import './LivePreview.jsx';
import './Onboarding.jsx';
import './UploadScreen.jsx';
import './SetupTab.jsx';
import './RemoteTab.jsx';
import './KhutbahEditor.jsx';
import './KandunganTab.jsx';
import './TetapanTab.jsx';
import './AdminShell.jsx';

// If opened via pairing QR (?mosque=<id>), pull TV's current profile from Supabase
const _pairId = new URLSearchParams(window.location.search).get('mosque');
if (_pairId) {
  window.RL_STATE?.fetchProfileFromCloud?.(_pairId).catch(() => {});
}

ReactDOM.createRoot(document.getElementById('app')).render(<window.AdminShell />);
