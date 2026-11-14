import React from 'react';

const CONTOUR_PATHS: string[] = (() => {
  const centers: [number, number, number][] = [
    [260, 250, 1],
    [1180, 190, 0.8],
    [900, 760, 1.15],
  ];
  const paths: string[] = [];
  centers.forEach(([cx, cy, scale], idx) => {
    for (let ring = 1; ring <= 7; ring++) {
      const baseR = ring * 46 * scale;
      let d = '';
      for (let step = 0; step <= 64; step++) {
        const angle = (step / 64) * Math.PI * 2;
        const r =
          baseR *
          (1 +
            0.16 * Math.sin(angle * 3 + idx * 2 + ring * 0.35) +
            0.08 * Math.cos(angle * 5 - idx));
        const x = (cx + Math.cos(angle) * r * 1.25).toFixed(1);
        const y = (cy + Math.sin(angle) * r).toFixed(1);
        d += `${step ? 'L' : 'M'}${x} ${y}`;
      }
      paths.push(d + 'Z');
    }
  });
  return paths;
})();

export const Contours: React.FC = () => (
  <svg
    className="contours"
    viewBox="0 0 1440 900"
    preserveAspectRatio="xMidYMid slice"
    aria-hidden="true"
  >
    {CONTOUR_PATHS.map((d, i) => (
      <path key={i} d={d} />
    ))}
  </svg>
);

interface SectionHeadProps {
  title: string;
  label?: string;
  sub?: string;
}

export const SectionHead: React.FC<SectionHeadProps> = ({
  title,
  label,
  sub,
}) => (
  <div className="sec-head">
    <h2 className="cond sec-title">{title}</h2>
    {(label || sub) && (
      <div className="sec-meta">
        {label && <p className="hud-label">{label}</p>}
        {sub && <p className="sec-sub">{sub}</p>}
      </div>
    )}
  </div>
);

export const ArrowUpRightIcon: React.FC<{ className?: string }> = ({
  className = 'w-3.5 h-3.5',
}) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export default Contours;
