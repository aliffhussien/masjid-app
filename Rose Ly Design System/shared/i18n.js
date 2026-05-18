/* Rose Ly — i18n strings + helper.
 * Source of truth: window.RL_STATE.profile.language ('ms' | 'en')
 * Usage:  const t = window.RL_I18N.t;  t('settings')
 */
(function () {
  const STRINGS = {
    // — Tabs —
    setup:        { ms: 'Setup',      en: 'Setup' },
    remote:       { ms: 'Remote',     en: 'Remote' },
    kandungan:    { ms: 'Kandungan',  en: 'Content' },
    tetapan:      { ms: 'Tetapan',    en: 'Settings' },

    // — Sections —
    mosqueInfo:   { ms: 'Maklumat Masjid',    en: 'Mosque Info' },
    prayerZone:   { ms: 'Zon Waktu Solat',    en: 'Prayer Zone' },
    backup:       { ms: 'Backup & Pulih',     en: 'Backup & Restore' },
    themeColor:   { ms: 'Warna Tema',         en: 'Theme Color' },
    language:     { ms: 'Bahasa',             en: 'Language' },
    slideList:    { ms: 'Senarai Slaid',      en: 'Slide List' },
    khutbah:      { ms: 'Khutbah Jumaat',     en: 'Friday Sermon' },
    ticker:       { ms: 'Makluman Ticker',    en: 'Ticker Notices' },
    phaseDur:     { ms: 'Tempoh Fasa Solat',  en: 'Prayer Phase Duration' },
    features:     { ms: 'Ciri Paparan',       en: 'Display Features' },
    slideCtrl:    { ms: 'Kawalan Slaid',      en: 'Slide Controls' },
    prayerPhase:  { ms: 'Fasa Solat',         en: 'Prayer Phase' },

    // — Buttons —
    refreshPrayer:{ ms: 'Muat Semula Waktu Solat', en: 'Refresh Prayer Times' },
    syncing:      { ms: 'Menyinkron…',        en: 'Syncing…' },
    exportBackup: { ms: 'Eksport Backup',     en: 'Export Backup' },
    restoreFile:  { ms: 'Pulih Dari Fail',    en: 'Restore From File' },
    addNew:       { ms: 'Tambah Slaid Baru',  en: 'Add New Slide' },
    fromTemplate: { ms: 'Tambah dari Template', en: 'Add from Template' },
    close:        { ms: 'Tutup',              en: 'Close' },
    cancel:       { ms: 'Batal',              en: 'Cancel' },
    save:         { ms: 'Simpan',             en: 'Save' },
    delete:       { ms: 'Padam',              en: 'Delete' },
    duplicate:    { ms: 'Salin',              en: 'Duplicate' },
    pause:        { ms: 'Jeda',               en: 'Pause' },
    active:       { ms: 'Aktif',              en: 'Active' },
    selectAll:    { ms: 'Pilih Semua',        en: 'Select All' },

    // — Field labels —
    mosqueName:   { ms: 'Nama Masjid',        en: 'Mosque Name' },
    mosqueAddress:{ ms: 'Alamat / Lokasi',    en: 'Address / Location' },
    zone:         { ms: 'Zon',                en: 'Zone' },

    // — Status —
    noContent:    { ms: 'Tiada paparan buat masa ini.', en: 'No content right now.' },
    saved:        { ms: 'Tersimpan',          en: 'Saved' },
    noSlides:     { ms: 'Belum ada slaid',    en: 'No slides yet' },
    noNotices:    { ms: 'Tiada Makluman',     en: 'No notices' },
  };

  function t(key) {
    const lang = (window.RL_STATE?.loadProfile()?.language) || 'ms';
    const entry = STRINGS[key];
    if (!entry) return key;
    return entry[lang] || entry.ms || key;
  }

  // React hook — re-renders when language changes
  function useT() {
    const R = window.React;
    if (!R) return t;
    const [, force] = R.useState(0);
    R.useEffect(() => {
      const onChange = () => force(n => n + 1);
      window.addEventListener('rl-profile-change', onChange);
      return () => window.removeEventListener('rl-profile-change', onChange);
    }, []);
    return t;
  }

  window.RL_I18N = { t, useT, STRINGS };
})();
