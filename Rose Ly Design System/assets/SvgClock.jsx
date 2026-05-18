/* global React */
// SvgClock.jsx — animated stroke-dashoffset digital clock.
// Ported from rose-ly/web/src/components/tv/SvgClock.jsx.
// Each digit's strokes animate via CSS keyframes (svgd0..9 / svgd0R..9R)
// defined in colors_and_type.css / index.css.

const { useMemo } = React;
const D = 'clock__digit';

function Digit3({ d, dx }) {
  return (
    <g data-digit={d} transform={dx ? `translate(${dx},0)` : undefined}>
      <polyline className={D} strokeDasharray="53 53" strokeDashoffset="-53" points="1 1,9 1,9 19,1 19,1 1" />
      <polyline className={D} strokeDasharray="19 19" strokeDashoffset="-19" points="9 1,9 19" />
      <polyline className={D} strokeDasharray="43 43" strokeDashoffset="-43" points="1 1,9 1,9 10,1 10,1 19,9 19" />
    </g>
  );
}

function Digit6({ d, dx }) {
  return (
    <g data-digit={d} transform={`translate(${dx},0)`}>
      <polyline className={D} strokeDasharray="53 53" strokeDashoffset="-53" points="1 1,9 1,9 19,1 19,1 1" />
      <polyline className={D} strokeDasharray="19 19" strokeDashoffset="-19" points="9 1,9 19" />
      <polyline className={D} strokeDasharray="43 43" strokeDashoffset="-43" points="1 1,9 1,9 10,1 10,1 19,9 19" />
      <polyline className={D} strokeDasharray="51 51" strokeDashoffset="-51" points="1 1,9 1,9 10,1 10,9 10,9 19,1 19" />
      <polyline className={D} strokeDasharray="45 45" strokeDashoffset="-45" points="1 1,1 10,9 10,9 1,9 19" />
      <polyline className={D} strokeDasharray="43 43" strokeDashoffset="-43" points="9 1,1 1,1 10,9 10,9 19,1 19" />
    </g>
  );
}

function Digit10({ d, dx }) {
  return (
    <g data-digit={d} transform={`translate(${dx},0)`}>
      <polyline className={D} strokeDasharray="53 53" strokeDashoffset="-53" points="1 1,9 1,9 19,1 19,1 1" />
      <polyline className={D} strokeDasharray="19 19" strokeDashoffset="-19" points="9 1,9 19" />
      <polyline className={D} strokeDasharray="43 43" strokeDashoffset="-43" points="1 1,9 1,9 10,1 10,1 19,9 19" />
      <polyline className={D} strokeDasharray="51 51" strokeDashoffset="-51" points="1 1,9 1,9 10,1 10,9 10,9 19,1 19" />
      <polyline className={D} strokeDasharray="45 45" strokeDashoffset="-45" points="1 1,1 10,9 10,9 1,9 19" />
      <polyline className={D} strokeDasharray="43 43" strokeDashoffset="-43" points="9 1,1 1,1 10,9 10,9 19,1 19" />
      <polyline className={D} strokeDasharray="52 52" strokeDashoffset="-52" points="9 1,1 1,1 19,9 19,9 10,1 10" />
      <polyline className={D} strokeDasharray="27 27" strokeDashoffset="-27" points="1 1,9 1,9 19" />
      <polyline className={D} strokeDasharray="61 61" strokeDashoffset="-61" points="9 10,1 10,1 1,9 1,9 19,1 19,1 10" />
      <polyline className={D} strokeDasharray="52 52" strokeDashoffset="-52" points="9 10,1 10,1 1,9 1,9 19,1 19" />
    </g>
  );
}

function SvgClock({ time, className = '' }) {
  const [d0, d1, d2, d3, d4, d5] = useMemo(() => {
    const h = time.getHours(), m = time.getMinutes(), s = time.getSeconds();
    return [
      String(Math.floor(h / 10)),
      String(h % 10),
      String(Math.floor(m / 10)),
      String(m % 10),
      String(Math.floor(s / 10)),
      String(s % 10),
    ];
  }, [time]);

  return (
    <svg
      className={`svg-clock ${className}`}
      viewBox="0 0 80 20"
      role="img"
      aria-label={`${d0}${d1}:${d2}${d3}:${d4}${d5}`}
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <g fill="currentColor">
        <circle cx="25.5" cy="6"  r="1" />
        <circle cx="25.5" cy="14" r="1" />
        <circle cx="54.5" cy="6"  r="1" />
        <circle cx="54.5" cy="14" r="1" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
        <Digit3  d={d0} dx={null} />
        <Digit10 d={d1} dx={12}   />
        <Digit6  d={d2} dx={29}   />
        <Digit10 d={d3} dx={41}   />
        <Digit6  d={d4} dx={58}   />
        <Digit10 d={d5} dx={70}   />
      </g>
    </svg>
  );
}

window.SvgClock = SvgClock;
