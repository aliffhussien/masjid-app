import React from 'react';
import ReactDOM from 'react-dom/client';

window.React = React;
window.ReactDOM = ReactDOM;

// — A.R.C REACTOR CORE TRADEMARK SIGNATURE —
try {
  // 1. Beautiful Dev Console Trademark
  console.log(
    '%c🕌 ROSE-LY SYSTEMS %c© ALIFF HUSSIEN',
    'color: #e11d48; font-size: 16px; font-weight: 900; font-family: monospace; text-shadow: 0 2px 4px rgba(0,0,0,0.2);',
    'color: #888; font-size: 10px; font-weight: bold; margin-left: 6px;'
  );

  // 2. Silent Canary Domain Watchdog (100% Safe, No Headaches)
  if (typeof window !== 'undefined' && window.addEventListener) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const allowed = ['localhost', '127.0.0.1', 'vercel.app', 'github.io'];
        const host = window.location.hostname.toLowerCase();
        const isStolen = !allowed.some(domain => host === domain || host.endsWith('.' + domain));
        if (isStolen) {
          const wm = document.createElement('div');
          wm.id = 'rl-arc-reactor-core';
          wm.style.cssText = 'position:fixed;bottom:6px;right:6px;font-size:7px;font-weight:900;letter-spacing:0.1em;opacity:0.12;color:rgba(255,255,255,0.7);z-index:999999;font-family:monospace;pointer-events:none;text-transform:uppercase;';
          wm.innerText = 'A.R.C REACTOR ENGINE · BY ALIFF HUSSIEN';
          document.body.appendChild(wm);
        }
      }, 8000);
    });
  }
} catch (e) {}
