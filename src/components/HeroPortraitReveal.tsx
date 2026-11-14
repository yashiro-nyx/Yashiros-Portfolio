import React, { useEffect, useRef, useState } from 'react';
import naturalPortraitImg from '../assets/images/natural_portrait_cutout_1794561087535.jpg';

const GRAPHITE_PORTRAIT_SRC =
  '/assets/aistudio/Graphite_Portrait_Cutout_ab45af46.png';

interface HeroPortraitRevealProps {
  isDark: boolean;
}

export const HeroPortraitReveal: React.FC<HeroPortraitRevealProps> = ({
  isDark,
}) => {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const graphiteLayerRef = useRef<HTMLDivElement | null>(null);
  const lensRingRef = useRef<HTMLDivElement | null>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [isLockedGraphite, setIsLockedGraphite] = useState(false);

  const targetRef = useRef({ x: 200, y: 240, r: 0, tiltX: 0, tiltY: 0 });
  const currentRef = useRef({ x: 200, y: 240, r: 0, tiltX: 0, tiltY: 0 });
  const hoveringRef = useRef(false);
  const lockedRef = useRef(false);

  useEffect(() => {
    hoveringRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    lockedRef.current = isLockedGraphite;
  }, [isLockedGraphite]);

  // Smooth spring-like RAF loop for cursor spotlight mask + subtle 3D tilt
  useEffect(() => {
    const stage = stageRef.current;
    const graphiteLayer = graphiteLayerRef.current;
    const lensRing = lensRingRef.current;
    if (!stage || !graphiteLayer) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const rectInit = stage.getBoundingClientRect();
    const initX = rectInit.width * 0.5 || 200;
    const initY = rectInit.height * 0.44 || 240;
    targetRef.current.x = initX;
    targetRef.current.y = initY;
    currentRef.current.x = initX;
    currentRef.current.y = initY;

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      const rect = stage.getBoundingClientRect();
      const maxDim = Math.max(rect.width || 420, rect.height || 560) * 1.35;

      if (lockedRef.current) {
        targetRef.current.r = maxDim;
      } else if (hoveringRef.current) {
        targetRef.current.r = Math.min(rect.width || 400, 380) * 0.44;
      } else {
        targetRef.current.r = 0;
        targetRef.current.tiltX = 0;
        targetRef.current.tiltY = 0;
      }

      const posEase = reducedMotion ? 1 : Math.min(1, dt * 16);
      const radEase = reducedMotion ? 1 : Math.min(1, dt * 11);

      currentRef.current.x +=
        (targetRef.current.x - currentRef.current.x) * posEase;
      currentRef.current.y +=
        (targetRef.current.y - currentRef.current.y) * posEase;
      currentRef.current.r +=
        (targetRef.current.r - currentRef.current.r) * radEase;
      currentRef.current.tiltX +=
        (targetRef.current.tiltX - currentRef.current.tiltX) * posEase;
      currentRef.current.tiltY +=
        (targetRef.current.tiltY - currentRef.current.tiltY) * posEase;

      const { x, y, r, tiltX, tiltY } = currentRef.current;

      if (r < 0.8) {
        graphiteLayer.style.opacity = '0';
        graphiteLayer.style.maskImage = 'none';
        graphiteLayer.style.webkitMaskImage = 'none';
      } else {
        graphiteLayer.style.opacity = '1';
        const innerStop = Math.max(0, r * 0.56);
        const midStop = Math.max(0, r * 0.82);
        const gradientMask = `radial-gradient(circle ${r.toFixed(1)}px at ${x.toFixed(1)}px ${y.toFixed(1)}px, rgba(0,0,0,1) 0px, rgba(0,0,0,0.96) ${innerStop.toFixed(1)}px, rgba(0,0,0,0.45) ${midStop.toFixed(1)}px, rgba(0,0,0,0) ${r.toFixed(1)}px)`;
        graphiteLayer.style.maskImage = gradientMask;
        graphiteLayer.style.webkitMaskImage = gradientMask;
      }

      if (lensRing) {
        const showRing = hoveringRef.current && !lockedRef.current && r > 8;
        lensRing.style.opacity = showRing ? '1' : '0';
        lensRing.style.width = `${(r * 1.85).toFixed(1)}px`;
        lensRing.style.height = `${(r * 1.85).toFixed(1)}px`;
        lensRing.style.transform = `translate3d(${(x - r * 0.925).toFixed(1)}px, ${(y - r * 0.925).toFixed(1)}px, 0)`;
      }

      if (!reducedMotion) {
        stage.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const updatePointer = (clientX: number, clientY: number) => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;
    targetRef.current.x = px;
    targetRef.current.y = py;

    const normX = (px / Math.max(1, rect.width) - 0.5) * 2;
    const normY = (py / Math.max(1, rect.height) - 0.5) * 2;
    targetRef.current.tiltX = -normY * 4;
    targetRef.current.tiltY = normX * 4;
  };

  return (
    <div className="relative w-full max-w-[340px] sm:max-w-[390px] lg:max-w-[430px] mx-auto select-none">
      {/* Ambient studio halo behind frame */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 rounded-[2.5rem] blur-3xl opacity-50 transition-opacity duration-500"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 40%, rgba(137, 170, 204, 0.22), rgba(97, 220, 163, 0.08) 45%, transparent 75%)'
            : 'radial-gradient(circle at 50% 40%, rgba(53, 114, 176, 0.16), rgba(15, 159, 110, 0.06) 45%, transparent 75%)',
        }}
      />

      {/* Interactive Portrait Frame */}
      <div
        ref={stageRef}
        role="button"
        tabIndex={0}
        aria-pressed={isLockedGraphite}
        aria-label="Jervin Paul portrait. Move cursor over the photo to reveal the graphite pencil sketch, or click/press Enter to toggle full graphite view."
        onPointerEnter={(e) => {
          setIsHovered(true);
          updatePointer(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (!isHovered) setIsHovered(true);
          updatePointer(e.clientX, e.clientY);
        }}
        onPointerLeave={() => {
          setIsHovered(false);
        }}
        onClick={(e) => {
          updatePointer(e.clientX, e.clientY);
          setIsLockedGraphite((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsLockedGraphite((prev) => !prev);
          }
        }}
        className="group relative aspect-[3/4] w-full rounded-[2rem] border border-stroke/90 hover:border-[#89AACC]/60 focus-visible:border-[#89AACC] bg-surface/85 backdrop-blur-md overflow-hidden shadow-2xl cursor-crosshair transition-colors duration-300 will-change-transform focus:outline-none"
      >
        {/* Subtle studio radial backdrop inside card */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? 'radial-gradient(circle at 52% 38%, rgba(137, 170, 204, 0.14) 0%, rgba(20, 20, 22, 0.92) 66%, rgba(12, 12, 14, 1) 100%)'
              : 'radial-gradient(circle at 52% 38%, rgba(53, 114, 176, 0.1) 0%, rgba(244, 243, 239, 0.95) 68%, rgba(235, 233, 228, 1) 100%)',
          }}
        />

        {/* Subtle editorial grid lines inside portrait frame */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />

        {/* Layer 1: Default Natural Color Portrait Cutout (masked to transparent alpha silhouette) */}
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
          <div className="w-[94%] aspect-[3/4]">
            <img
              src={naturalPortraitImg}
              alt="Jervin Paul Romualdo natural studio portrait"
              draggable={false}
              className="w-full h-full object-cover object-bottom drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
              style={{
                maskImage: `url(${GRAPHITE_PORTRAIT_SRC})`,
                WebkitMaskImage: `url(${GRAPHITE_PORTRAIT_SRC})`,
                maskSize: '100% 100%',
                WebkitMaskSize: '100% 100%',
                maskPosition: 'center bottom',
                WebkitMaskPosition: 'center bottom',
                maskRepeat: 'no-repeat',
                WebkitMaskRepeat: 'no-repeat',
              }}
            />
          </div>
        </div>

        {/* Layer 2: Graphite Sketch Cutout revealed dynamically inside cursor radial spotlight */}
        <div
          ref={graphiteLayerRef}
          aria-hidden="true"
          className="absolute inset-0 flex items-end justify-center pointer-events-none opacity-0"
        >
          <div className="w-[94%] aspect-[3/4]">
            <img
              src={GRAPHITE_PORTRAIT_SRC}
              alt=""
              draggable={false}
              className="w-full h-full object-cover object-bottom drop-shadow-[0_18px_30px_rgba(0,0,0,0.45)]"
            />
          </div>
        </div>

        {/* Fine cursor sketch-lens indicator ring */}
        <div
          ref={lensRingRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 rounded-full border border-[#89AACC]/45 opacity-0 transition-opacity duration-200"
          style={{
            boxShadow:
              '0 0 24px rgba(137, 170, 204, 0.18), inset 0 0 18px rgba(255, 255, 255, 0.08)',
          }}
        />

        {/* Bottom subtle fade + minimal interactive caption */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

        <div className="pointer-events-none absolute inset-x-5 bottom-4 flex items-center justify-between gap-2 text-[11px] font-mono">
          <span className="text-[#F5F5F5]/90 tracking-wider uppercase">
            {isLockedGraphite
              ? 'Graphite Mode · Locked'
              : isHovered
                ? 'Sketch Reveal Active'
                : 'Hover for Graphite'}
          </span>
          <span className="text-[#89AACC] tracking-wider">
            {isLockedGraphite ? 'Click to reset' : 'Click to lock'}
          </span>
        </div>

        {/* Top corner micro index mark */}
        <div className="pointer-events-none absolute top-4 left-5 right-5 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-muted">
          <span>@yashiro-nyx</span>
          <span className="text-[#89AACC]">00 · PORTRAIT</span>
        </div>
      </div>
    </div>
  );
};

export default HeroPortraitReveal;
