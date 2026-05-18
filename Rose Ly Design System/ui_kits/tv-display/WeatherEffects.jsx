/* global React */
// WeatherEffects.jsx — animated rain streaks + misty veil + lightning flash.
// Ported 1:1 from rose-ly/web/src/components/tv/WeatherEffects.jsx.
//
// weatherCode follows Open-Meteo's classification:
//   51–55 drizzle (light)
//   61–65 rain
//   80–82 rain showers
//   95–99 thunderstorm (with lightning)

const { useEffect, useRef, useState } = React;

const getRainConfig = (code) => {
  if (code == null) return null;
  if (code >= 95) return { drops: 450, speed: 24, angle: -20, opacity: 0.65, len: 40, veil: 0.10, lightning: true  };
  if (code >= 80) return { drops: 320, speed: 18, angle: -16, opacity: 0.52, len: 30, veil: 0.07, lightning: false };
  if (code >= 61) return { drops: 200, speed: 13, angle: -11, opacity: 0.42, len: 22, veil: 0.04, lightning: false };
  if (code >= 51) return { drops: 100, speed: 8,  angle: -6,  opacity: 0.28, len: 14, veil: 0.02, lightning: false };
  return null;
};

const makeDrops = (cfg, w, h) =>
  Array.from({ length: cfg.drops }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    len:     cfg.len  * (0.7 + Math.random() * 0.6),
    speed:   cfg.speed * (0.6 + Math.random() * 0.8),
    opacity: cfg.opacity * (0.5 + Math.random() * 0.7),
    width:   0.6 + Math.random() * 1.2,
  }));

function WeatherEffects({ weatherCode }) {
  const canvasRef    = useRef(null);
  const animRef      = useRef(null);
  const dropsRef     = useRef([]);
  const configRef    = useRef(null);
  const mountedRef   = useRef(true);
  const lightningRef = useRef(null);
  const flashTimers  = useRef([]);
  const [flashOpacity, setFlashOpacity] = useState(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      flashTimers.current.forEach(clearTimeout);
      flashTimers.current = [];
    };
  }, []);

  // Sync config + re-init drops on weather change
  useEffect(() => {
    const cfg = getRainConfig(weatherCode);
    configRef.current = cfg;
    if (!cfg) { dropsRef.current = []; return; }
    const canvas = canvasRef.current;
    const w = canvas?.width  || window.innerWidth;
    const h = canvas?.height || window.innerHeight;
    dropsRef.current = makeDrops(cfg, w, h);
  }, [weatherCode]);

  // Persistent animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = canvas.offsetWidth  || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
      const cfg = configRef.current;
      if (cfg) dropsRef.current = makeDrops(cfg, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      if (!mountedRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cfg = configRef.current;
      if (cfg && dropsRef.current.length > 0) {
        const rad = (cfg.angle * Math.PI) / 180;
        const dx = Math.sin(rad);
        const dy = Math.cos(rad);

        dropsRef.current.forEach(d => {
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + dx * d.len, d.y + dy * d.len);
          ctx.strokeStyle = `rgba(180,210,240,${d.opacity})`;
          ctx.lineWidth   = d.width;
          ctx.stroke();

          d.x += dx * d.speed * 0.5;
          d.y += dy * d.speed;
          if (d.y > canvas.height + 40) { d.y = -40; d.x = Math.random() * canvas.width; }
          if (d.x > canvas.width  + 40) d.x = -40;
          else if (d.x < -40)           d.x =  canvas.width + 40;
        });
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Lightning scheduler
  useEffect(() => {
    const hasLightning = getRainConfig(weatherCode)?.lightning ?? false;
    if (!hasLightning) {
      clearTimeout(lightningRef.current);
      setFlashOpacity(0);
      return;
    }

    const schedule = () => {
      const delay = 3500 + Math.random() * 8000;
      lightningRef.current = setTimeout(() => {
        if (!mountedRef.current) return;
        setFlashOpacity(0.25);
        const t1 = setTimeout(() => { if (mountedRef.current) setFlashOpacity(0); },    80);
        const t2 = setTimeout(() => { if (mountedRef.current) setFlashOpacity(0.16); }, 160);
        const t3 = setTimeout(() => { if (mountedRef.current) setFlashOpacity(0); },    280);
        flashTimers.current = [t1, t2, t3];
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      clearTimeout(lightningRef.current);
      flashTimers.current.forEach(clearTimeout);
      flashTimers.current = [];
    };
  }, [weatherCode]);

  const config  = getRainConfig(weatherCode);
  const hasRain = config !== null;

  return (
    <>
      {/* Misty veil */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'rgba(140,170,210,1)',
        opacity: hasRain ? (config?.veil ?? 0) : 0,
        transition: 'opacity 2s ease',
      }} />
      {/* Rain streaks */}
      <canvas ref={canvasRef} style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        width: '100%', height: '100%',
        opacity: hasRain ? 1 : 0,
        transition: 'opacity 1s ease',
      }} />
      {/* Lightning */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
        background: 'rgba(200,225,255,1)',
        opacity: flashOpacity,
        transition: flashOpacity > 0 ? 'none' : 'opacity 0.4s ease',
      }} />
    </>
  );
}

window.WeatherEffects = WeatherEffects;
