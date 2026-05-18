// Shared tokens for the Rose-Ly TV Display kit
window.RL = {
  colors: {
    bg:         '#010103',
    rose500:    '#f43f5e',
    rose600:    '#e11d48',
    rose300:    '#fda4af',
    emerald500: '#10b981',
    emerald600: '#059669',
    amber500:   '#f59e0b',
    purple400:  '#c084fc',
    blue300:    '#93c5fd',
    live:       '#ef4444',
  },
  shadowGlow:  '0 0 40px rgba(225,29,72,0.4)',
  shadowText:  '0 2px 8px rgba(0,0,0,0.6)',
  shadowBig:   '0 4px 15px rgba(0,0,0,0.8)',
  panelBg:     'rgba(0,0,0,0.20)',
  panelBorder: 'rgba(255,255,255,0.05)',

  prayers: [
    { name: 'Imsak',   time: '05:40' },
    { name: 'Subuh',   time: '05:50' },
    { name: 'Syuruk',  time: '07:05' },
    { name: 'Zohor',   time: '13:15' },
    { name: 'Asar',    time: '16:35' },
    { name: 'Maghrib', time: '19:22' },
    { name: 'Isyak',   time: '20:35' },
  ],

  hadiths: [
    { source: 'AMALAN UTAMA',   text: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain.' },
    { source: 'ADAB BERCAKAP',  text: 'Sesiapa yang beriman kepada Allah dan hari akhirat, hendaklah dia berkata baik atau diam.' },
    { source: 'KEBERSIHAN',     text: 'Kebersihan itu adalah sebahagian daripada cabang iman.' },
    { source: 'KELEBIHAN SEDEKAH', text: 'Sedekah itu dapat menghapuskan dosa seumpama air memadamkan api.' },
    { source: 'JAGA SILATURAHIM', text: 'Tidak masuk syurga orang yang memutuskan hubungan kekeluargaan (silaturahim).' },
    { source: 'DOA & BERTAWAKAL', text: 'Apabila kamu memohon sesuatu, mohonlah terus kepada Allah SWT.' },
    { source: 'KEUTAMAAN SELAWAT', text: 'Sesiapa berselawat ke atasku sekali, Allah berselawat ke atasnya sepuluh kali.' },
    { source: 'SENYUMAN',         text: 'Senyuman manis di hadapan saudaramu adalah satu amalan sedekah.' },
    { source: 'SOLAT JEMAAH',    text: 'Solat berjemaah itu melebihkan solat bersendirian sebanyak 27 darjat.' },
    { source: 'AKHLAK MULIA',    text: 'Sebaik-baik di antara kalian adalah yang paling mulia akhlak dan adabnya.' }
  ],

  brandings: [
    { label: 'ENGINEERED BY', value: 'Aliff Hussien' },
    { label: 'POWERED BY',    value: 'Universal Engine v1.0' },
    { label: 'FUELED BY',     value: 'Aliff Intelligence (AI)' },
  ],

  tickerItems: [
    { source: 'MAKLUMAN', title: 'Gotong-royong perdana Sabtu ini, jam 8:00 pagi. Semua jemaah dijemput hadir.' },
    { source: 'BERITA',   title: 'Bank Negara kekal OPR pada 3.00% pada mesyuarat terkini.' },
    { source: 'MAKLUMAN', title: 'Sila pastikan telefon bimbit anda diletakkan dalam mod senyap.' },
    { source: 'BERITA',   title: 'Cuaca panas dijangka berterusan di seluruh Semenanjung minggu ini.' },
    { source: 'MAKLUMAN', title: 'Tabung Jumaat minggu lepas berjumlah RM 1,250.00. Terima kasih.' },
  ],

  worldClocks: [
    { city: 'Kuala Lumpur', country: 'MALAYSIA',   tz: 'Asia/Kuala_Lumpur' }, // UTC+8
    { city: 'Makkah',       country: 'ARAB SAUDI', tz: 'Asia/Riyadh'       }, // UTC+3
    { city: 'Gaza',         country: 'PALESTIN',   tz: 'Asia/Gaza'         }, // UTC+2
    { city: 'London',       country: 'UK',         tz: 'Europe/London'     }, // UTC+0
    { city: 'Jakarta',      country: 'INDONESIA',  tz: 'Asia/Jakarta'      }, // UTC+7
    { city: 'Tokyo',        country: 'JEPUN',      tz: 'Asia/Tokyo'        }, // UTC+9
  ],

  slides: [
    { id: 'world',     type: 'world-clock', title: 'Jam Dunia' },
    { id: 'gotrong',   type: 'announcement', label: 'MAKLUMAN',
      title: 'Kempen Bersih Masjid',
      content: 'Gotong-royong perdana akan diadakan pada hari Sabtu ini jam 8:00 pagi. Semua jemaah dijemput hadir.' },
    { id: 'tahfiz',    type: 'announcement', label: 'INFO',
      title: 'Program Tahfiz Al-Quran',
      content: 'Pendaftaran kelas hafazan untuk kanak-kanak dan dewasa kini dibuka. Hubungi pejabat masjid.' },
  ],
};
