/* global React */
// Sky.jsx — Real WebGL "RealitySky" shader, ported 1:1 from
// rose-ly/web/src/components/tv/RealitySky.jsx.
// Renders hyper-realistic sky + sea with sun/moon orbit synced to local time,
// volumetric clouds, twinkling star field, shooting stars, sea glitter.
//
// Tunable props:
//   starDensity (default 0.08)
//   starSize    (default 1.2)
//   weatherCode (Open-Meteo code, ≥51 enables rain darkening)

const { useEffect, useRef, memo } = React;

const getRainIntensity = (code) => {
  if (code == null || code < 51) return 0.0;
  if (code >= 95) return 1.0;
  if (code >= 80) return 0.8;
  if (code >= 61) return 0.55;
  return 0.3;
};

const Sky = memo(function Sky({ time, starDensity = 0.08, starSize = 1.2, weatherCode = null }) {
  const canvasRef      = useRef(null);
  const timeRef        = useRef(time);
  const weatherCodeRef = useRef(weatherCode);
  const stateRef       = useRef({ currentS: 0 });

  useEffect(() => { timeRef.current = time; },                 [time]);
  useEffect(() => { weatherCodeRef.current = weatherCode; },   [weatherCode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: false, antialias: true, stencil: false, depth: false });
    if (!gl) {
      console.warn('Sky: WebGL not available — falling back to solid background');
      return;
    }

    const vs = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`;
    const fs = `
      precision highp float;
      uniform vec2 uR;
      uniform float uT, uS, uStD, uStS, uRain;
      #define PI 3.14159265359

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
        return v;
      }
      float waveH(vec2 p, float t) {
        float h = 0.06*sin(p.x*0.4+t*0.7+p.y*0.2) + 0.04*sin(p.y*0.6-t*1.1+p.x*0.3) + 0.02*fbm(p*2.5+t*0.4);
        return h;
      }
      vec3 waveNorm(vec2 p, float t) {
        float e = 0.05;
        return normalize(vec3(waveH(p,t)-waveH(p+vec2(e,0),t), 0.15, waveH(p,t)-waveH(p+vec2(0,e),t)));
      }
      vec3 sCol(vec3 c0, vec3 c1, vec3 c2, vec3 c3) {
        float raw = uS*4.0; int si = int(floor(raw)); float bl = fract(raw);
        if (si==0) return mix(c0,c1,bl);
        if (si==1) return mix(c1,c2,bl);
        if (si==2) return mix(c2,c3,bl);
        return mix(c3,c0,bl);
      }
      vec3 starField(vec2 uv, float scale) {
        vec2 p = uv * scale;
        vec2 id = floor(p);
        vec2 f  = fract(p) - 0.5;
        vec3 res = vec3(0.0);
        for (int y=-1; y<=1; y++) {
          for (int x=-1; x<=1; x++) {
            vec2 offs = vec2(float(x), float(y));
            float h = hash(id + offs);
            if (h < (1.0 - uStD)) continue;
            vec2 p_star = offs + vec2(hash(id+offs+45.6), hash(id+offs+78.9)) * 0.5 - 0.25;
            vec2 rel = f - p_star;
            float d = length(rel);
            float mag        = pow(hash(id+offs+7.77), 1.8);
            float brightness = mix(3.5, 0.15, mag) * uStS;
            float breathe = noise(vec2(uT*0.08+h*53.1, h*29.7));
            float rhythm  = noise(vec2(uT*0.70+h*17.3, h*83.2));
            float scint   = noise(vec2(uT*4.50+h*7.10, h*113.0));
            float scint2  = noise(vec2(uT*9.20+h*3.30, h*67.40));
            float organic = breathe*0.38 + rhythm*0.30 + scint*0.18 + scint2*0.14;
            float hBoost  = 1.0 + smoothstep(0.30, 0.0, uv.y+0.1) * 2.0;
            float tAmp    = mix(0.05, 0.88, mag) * hBoost;
            float twinkle = clamp(organic*(1.0+tAmp*1.6) + (1.0-tAmp)*0.4, 0.04, 1.9);
            float novaS = hash(id+offs+floor(uT*0.05));
            if (novaS > 0.995) brightness *= (1.0 + sin(uT*4.0)*0.4);
            float dimS    = hash(id+offs+floor(uT*0.07));
            float dimP    = fract(uT*0.07 + h*3.1);
            float dim     = (dimS > 0.96) ? smoothstep(0.0,0.15,dimP)*smoothstep(0.4,0.15,dimP) : 0.0;
            twinkle      *= (1.0 - dim*0.9);
            float baseSharp = mix(900.0, 3500.0, mag);
            float sharpness = baseSharp * max(0.2, 1.0-(twinkle-0.8)*mix(0.0, 0.45, 1.0-mag));
            float star  = brightness * exp(-d*d * sharpness);
            float bloom = mix(0.35, 0.0, mag) * exp(-d*d * 150.0) * uStS;
            vec3 star_col = vec3(1.00, 0.98, 0.88);
            float temp = hash(id+offs+33.3);
            if      (temp < 0.12) star_col = vec3(0.55, 0.65, 1.00);
            else if (temp < 0.35) star_col = vec3(0.85, 0.92, 1.00);
            else if (temp < 0.65) star_col = vec3(1.00, 0.98, 0.88);
            else if (temp < 0.85) star_col = vec3(1.00, 0.90, 0.68);
            else                  star_col = vec3(1.00, 0.74, 0.48);
            float chromAmp = mix(0.02, 0.32, mag) * hBoost;
            float rShift   = (scint  - 0.5) * chromAmp;
            float bShift   = (scint2 - 0.5) * chromAmp;
            star_col = clamp(star_col + vec3(rShift, 0.0, bShift), 0.0, 1.5);
            float flash_h = hash(id+offs+floor(uT/10.0));
            float flash   = (flash_h>0.98) ? smoothstep(0.0,0.5,fract(uT/10.0))*smoothstep(1.0,0.5,fract(uT/10.0))*2.5 : 0.0;
            float spikes = 0.0;
            if (h > 0.99) {
              spikes += max(0.0, 1.0-abs(rel.x*160.0)) * exp(-abs(rel.y)*12.0);
              spikes += max(0.0, 1.0-abs(rel.y*160.0)) * exp(-abs(rel.x)*12.0);
              spikes *= 0.12 * (1.0-mag);
            }
            float m = (star+bloom+spikes) * twinkle * smoothstep(0.02, 0.32, uv.y+0.05);
            m += flash * star * 0.4;
            res += star_col * clamp(m, 0.0, 2.5);
          }
        }
        return res;
      }
      float shootingStar(vec2 uv, float t) {
        float res = 0.0;
        for (float i=0.0; i<3.0; i++) {
          float h = hash(vec2(i, 456.78));
          float startT = fract(t*(0.02+h*0.03)+h)*12.0;
          if (startT > 1.2) continue;
          vec2 dir = vec2(cos(PI*(1.1+h*0.4)), sin(PI*(1.1+h*0.4)));
          vec2 p = vec2(h*3.0-1.5, 0.8+h*0.2) + dir*startT*(1.8+h*2.5);
          float d = length(uv-p);
          float fade = smoothstep(0.0,0.1,startT)*smoothstep(1.2,0.8,startT);
          res += smoothstep(0.002, 0.0, d)*1.8*fade;
          res += smoothstep(0.1, 0.0, d)*pow(max(0.0,dot(normalize(uv-p),-dir)),180.0)*1.5*fade;
        }
        return res;
      }
      void main() {
        vec2 uv = (gl_FragCoord.xy - uR*0.5) / uR.y;
        float s  = uS;
        vec3 ro  = vec3(0.0, 1.6, 4.0);
        vec3 rd  = normalize(vec3(uv.x, uv.y - mix(0.12,0.08,s), -1.6));
        vec3 sT = sCol(vec3(0.01,0.03,0.12), vec3(0.05,0.35,0.75), vec3(0.35,0.08,0.02), vec3(0.01,0.01,0.04));
        vec3 sH = sCol(vec3(0.95,0.45,0.25), vec3(0.45,0.65,0.95), vec3(1.0,0.35,0.05),  vec3(0.04,0.06,0.12));
        vec3 fC = sCol(vec3(0.35,0.15,0.08), vec3(0.65,0.75,1.0),  vec3(0.45,0.15,0.04), vec3(0.02,0.02,0.06));
        float sA      = PI - (uS*2.0*PI);
        vec3 sunDir   = normalize(vec3( cos(sA)*0.8,  sin(sA)*0.3-0.05, -1.0));
        vec3 moonDir  = normalize(vec3(-cos(sA)*0.8, -sin(sA)*0.2+0.02, -1.0));
        float horizonY = -0.06 + noise(vec2(rd.x*5.0, uT*0.2))*0.003;
        float clearFactor = 1.0 - uRain * 0.97;
        vec3 col;
        if (rd.y < horizonY) {
          float d  = -ro.y / rd.y;
          vec2  wp = ro.xz + rd.xz * d;
          vec3  n  = waveNorm(wp, uT);
          vec3  refl = reflect(rd, n);
          float hFactR = smoothstep(-0.1, 0.6, refl.y);
          vec3 rCol = mix(fC, mix(sH, sT, pow(clamp(refl.y+0.1,0.0,1.0),0.5)), hFactR);
          float starI = (smoothstep(0.5,0.85,s)+(1.0-smoothstep(-0.05,0.35,s))) * (1.0-uRain);
          if (starI > 0.01) {
            rCol += starField(refl.xy, 60.0) * starI * 0.8;
            rCol += vec3(0.8,0.7,0.6) * shootingStar(refl.xy,uT) * starI * 0.8;
          }
          float rSd = max(dot(refl,sunDir), 0.0);
          vec3 sunSpecCol = sCol(vec3(1.0,0.6,0.2),vec3(1.0,0.95,0.8),vec3(1.0,0.3,0.05),vec3(0.2,0.2,0.3));
          rCol += sunSpecCol * (pow(rSd,400.0)*15.0+pow(rSd,12.0)*0.4) * smoothstep(-0.2,0.1,sunDir.y) * clearFactor;
          float rMd = max(dot(refl,moonDir), 0.0);
          rCol += vec3(0.5,0.7,1.0)*(pow(rMd,300.0)*8.0+pow(rMd,8.0)*0.3) * smoothstep(-0.2,0.1,moonDir.y) * clearFactor;
          float fres = pow(1.0-max(dot(n,-rd),0.0), 4.0);
          col = mix(fC*0.15, rCol, 0.04+fres*0.9);
          col = mix(col, fC, 1.0-exp(-d*0.065));
        } else {
          float hFact = smoothstep(horizonY, 0.35, rd.y);
          col = mix(fC, mix(sH, sT, pow(clamp(rd.y+0.1,0.0,1.0),0.45)), hFact);
          float cloud_uv_y  = rd.y + 0.32;
          float c1          = fbm(vec2(rd.x*2.8/cloud_uv_y, 1.0/cloud_uv_y) + uT*0.012);
          float cloudThresh = mix(0.42, 0.18, uRain);
          float clouds      = smoothstep(cloudThresh, cloudThresh+0.42, c1);
          vec3  cloudCol    = mix(mix(vec3(1.0,0.98,0.95),sH,0.45), vec3(0.38,0.42,0.52), uRain);
          col = mix(col, cloudCol, clouds * hFact * mix(0.28, 0.95, uRain));
          float starI = (smoothstep(0.5,0.85,s)+(1.0-smoothstep(-0.05,0.35,s))) * (1.0-uRain);
          if (starI > 0.01) {
            col += starField(rd.xy, 60.0) * starI;
            col += vec3(1.0,0.9,0.8) * shootingStar(rd.xy,uT) * starI;
          }
          float sd       = max(dot(rd,sunDir), 0.0);
          float sunPower = smoothstep(-0.18,0.12,sunDir.y) * clearFactor;
          vec3 sunFinalCol = sCol(vec3(1.0,0.8,0.5),vec3(1.0,0.98,0.9),vec3(1.0,0.4,0.1),vec3(0.3,0.3,0.4));
          col += sunFinalCol * (pow(sd,2500.0)*15.0+pow(sd,128.0)*1.8) * sunPower;
          float md        = max(dot(rd,moonDir), 0.0);
          float moonPower = smoothstep(-0.18,0.12,moonDir.y) * clearFactor;
          col += vec3(0.9,0.95,1.0) * smoothstep(0.9985,0.9998,md) * 6.0 * moonPower;
          col += vec3(0.4,0.6,1.0)  * pow(md,48.0) * 0.8 * moonPower;
        }
        col = mix(col, vec3(0.05, 0.07, 0.10), uRain * 0.62);
        float seamDist = abs(rd.y - horizonY);
        float seamFog  = smoothstep(0.04, 0.0, seamDist) * 0.97;
        float wideFog  = (1.0 - smoothstep(-0.12, 0.22, seamDist)) * 0.55;
        col = mix(col, fC, max(seamFog, wideFog));
        vec3 hGlow = sCol(vec3(0.60,0.30,0.18), vec3(0.82,0.90,1.0), vec3(0.68,0.28,0.10), vec3(0.18,0.20,0.32));
        col += hGlow * smoothstep(0.05, 0.0, seamDist) * 0.28;
        float dither = (hash(gl_FragCoord.xy)-0.5)/255.0;
        gl_FragColor = vec4(pow(clamp(col+dither,0.0,1.0), vec3(0.95)), 1.0);
      }
    `;

    const mkS = (t, src) => {
      const sh = gl.createShader(t);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error('Sky shader compile error:', gl.getShaderInfoLog(sh));
        gl.deleteShader(sh); return null;
      }
      return sh;
    };
    const vsS = mkS(gl.VERTEX_SHADER, vs);
    const fsS = mkS(gl.FRAGMENT_SHADER, fs);
    if (!vsS || !fsS) return;
    const prog = gl.createProgram();
    gl.attachShader(prog, vsS); gl.attachShader(prog, fsS); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('Sky program link error:', gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog); return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const ap = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(ap);
    gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);

    const U = {
      uR:    gl.getUniformLocation(prog, 'uR'),
      uT:    gl.getUniformLocation(prog, 'uT'),
      uS:    gl.getUniformLocation(prog, 'uS'),
      uStD:  gl.getUniformLocation(prog, 'uStD'),
      uStS:  gl.getUniformLocation(prog, 'uStS'),
      uRain: gl.getUniformLocation(prog, 'uRain'),
    };
    let anim;
    const t0 = performance.now();
    
    // Performance guardian metrics to track and auto-optimize cheap TV boxes
    const frameTimes = [];
    let lastT = t0;
    let dprScale = 1.0;

    let w = 1920;
    let h = 1080;

    const render = (now) => {
      const delta = now - lastT;
      lastT = now;
      if (delta > 0) {
        frameTimes.push(delta);
        if (frameTimes.length > 60) {
          frameTimes.shift();
          const avg = frameTimes.reduce((a,b)=>a+b, 0) / frameTimes.length;
          // If rendering time exceeds 30ms (i.e. < 33 FPS), drop rendering resolution to preserve a butter-smooth 60 FPS
          if (avg > 30.0 && dprScale > 0.5) {
            dprScale = 0.55; // 3.3x fragment reduction
          }
        }
      }

      const totalT = (now - t0) / 1000;
      const d = timeRef.current || new Date();
      const mins = d.getHours()*60 + d.getMinutes() + d.getSeconds()/60;
      let tS;
      if      (mins >= 360  && mins < 800)  tS = (mins-360)/440*0.25;
      else if (mins >= 800  && mins < 1140) tS = 0.25+(mins-800)/340*0.25;
      else if (mins >= 1140 && mins < 1260) tS = 0.5+(mins-1140)/120*0.25;
      else { const p = mins>=1260 ? (mins-1260)/540 : (mins+180)/540; tS = 0.75+p*0.25; }

      let diff = tS - stateRef.current.currentS;
      if (diff >  0.5) stateRef.current.currentS += 1.0;
      if (diff < -0.5) stateRef.current.currentS -= 1.0;
      stateRef.current.currentS += (tS - stateRef.current.currentS) * 0.02;
      const safeS = ((stateRef.current.currentS % 1.0) + 1.0) % 1.0;

      const dpr  = Math.min(window.devicePixelRatio || 1, 1.5) * dprScale;
      const maxW = 1920;
      w = canvas.clientWidth  * dpr;
      h = canvas.clientHeight * dpr;
      if (w > maxW) { h = (maxW/w)*h; w = maxW; }

      if (canvas.width !== Math.floor(w) || canvas.height !== Math.floor(h)) {
        canvas.width  = Math.floor(w);
        canvas.height = Math.floor(h);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      const rainIntensity = getRainIntensity(weatherCodeRef.current);
      gl.useProgram(prog);
      gl.uniform2f(U.uR,    canvas.width, canvas.height);
      gl.uniform1f(U.uT,    totalT);
      gl.uniform1f(U.uS,    safeS);
      gl.uniform1f(U.uStD,  starDensity);
      gl.uniform1f(U.uStS,  starSize);
      gl.uniform1f(U.uRain, rainIntensity);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      anim = requestAnimationFrame(render);
    };
    render(t0);

    return () => {
      cancelAnimationFrame(anim);
      gl.deleteBuffer(buf);
      gl.detachShader(prog, vsS);
      gl.detachShader(prog, fsS);
      gl.deleteShader(vsS);
      gl.deleteShader(fsS);
      gl.deleteProgram(prog);
    };
  }, [starDensity, starSize]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: '#010103', zIndex: 0 }}
    />
  );
});

window.Sky = Sky;
