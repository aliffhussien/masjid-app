/* global React */
// MosqueIcon.jsx — one and only logo tile.
// Always uses profile.logoUrl if uploaded; otherwise the default Rose Ly mark.

function MosqueIcon({ size = 40, logoUrl = null }) {
  return (
    <img
      src={logoUrl || '../../assets/logo-mark.png'}
      width={size} height={size} alt=""
      style={{
        width: size, height: size,
        borderRadius: size * 0.28,
        objectFit: 'cover',
        background: '#1c0e21',
        boxShadow: '0 10px 24px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.06)',
        flexShrink: 0, display: 'block',
      }}
    />
  );
}

window.MosqueIcon = MosqueIcon;
