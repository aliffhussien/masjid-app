import '../../shared/init.js';
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

ReactDOM.createRoot(document.getElementById('app')).render(<window.AdminShell />);
