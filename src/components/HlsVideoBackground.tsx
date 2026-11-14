import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { lenisScrollState } from './SmoothScrollProvider';

interface HlsVideoBackgroundProps {
  src?: string;
  flipped?: boolean;
  overlayClassName?: string;
}

const DEFAULT_HLS_SRC =
  'https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8';

interface GalaxyStar {
  // Orbital parameters in galactic plane
  baseRadius: number;
  angle: number;
  orbitalSpeed: number;
  elevationY: number;
  // Interactive spring displacement in screen space
  dx: number;
  dy: number;
  vx: number;
  vy: number;
  // Visual properties
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
  rgb: string;
  isCoreDust: boolean;
  hasDiffractionSpike: boolean;
  // Last projected screen coordinates
  screenX: number;
  screenY: number;
}

interface NebulaCloud {
  radius: number;
  angle: number;
  speed: number;
  size: number;
  color: string;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  active: boolean;
}

export const HlsVideoBackground: React.FC<HlsVideoBackgroundProps> = ({
  src = DEFAULT_HLS_SRC,
  flipped = false,
  overlayClassName = 'bg-black/15',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  // 1. Initialize HLS Video Stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    const handleCanPlay = () => setVideoReady(true);
    video.addEventListener('canplay', handleCanPlay);

    if (Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: false });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video
          .play()
          .then(() => setVideoReady(true))
          .catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) hls?.destroy();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', () => {
        video
          .play()
          .then(() => setVideoReady(true))
          .catch(() => {});
      });
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      if (hls) hls.destroy();
    };
  }, [src]);

  // 2. Interactive 3D Logarithmic Spiral Galaxy + Touch/Pointer Star Physics
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    const setCanvasSize = () => {
      if (!canvas || !container) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Curated celestial palette matching the portfolio's #89AACC -> #4E85BF design system
    const starPalette = [
      { hex: '#FFFFFF', rgb: '255, 255, 255' },
      { hex: '#E6F2FF', rgb: '230, 242, 255' },
      { hex: '#B8D4F2', rgb: '184, 212, 242' },
      { hex: '#89AACC', rgb: '137, 170, 204' },
      { hex: '#5E97D1', rgb: '94, 151, 209' },
      { hex: '#4E85BF', rgb: '78, 133, 191' },
      { hex: '#C7D2FE', rgb: '199, 210, 254' },
    ];

    const maxGalacticRadius = Math.max(width, height) * 0.62;
    const spiralArms = 4;
    const totalStars = 720;
    const stars: GalaxyStar[] = [];

    for (let i = 0; i < totalStars; i++) {
      const isSpiralStar = i < 560;
      const armIndex = i % spiralArms;
      // Concentrate more stars toward the glowing core
      const distFactor = Math.pow(Math.random(), 1.35);
      const baseRadius = isSpiralStar
        ? 12 + distFactor * maxGalacticRadius
        : Math.random() * maxGalacticRadius * 1.25;

      // Logarithmic spiral arm angle + natural Gaussian-like scatter
      const spiralTwist = distFactor * 5.2;
      const armSpread = (Math.random() - 0.5) * (0.45 + distFactor * 0.75);
      const angle = isSpiralStar
        ? (armIndex * (Math.PI * 2)) / spiralArms + spiralTwist + armSpread
        : Math.random() * Math.PI * 2;

      // Differential Keplerian-like rotation (inner stars orbit faster)
      const orbitalSpeed =
        (0.00045 + (1 - distFactor) * 0.0014) * (flipped ? -1 : 1);

      // Vertical thickness of the 3D galactic disc
      const elevationY =
        (Math.random() - 0.5) * (18 + (1 - distFactor) * 55);

      const colorEntry =
        distFactor < 0.18
          ? starPalette[0]
          : starPalette[i % starPalette.length];

      const size =
        Math.random() < 0.05
          ? Math.random() * 2.4 + 1.8
          : Math.random() * 1.5 + 0.45;

      stars.push({
        baseRadius,
        angle,
        orbitalSpeed,
        elevationY,
        dx: 0,
        dy: 0,
        vx: 0,
        vy: 0,
        size,
        baseAlpha: Math.random() * 0.65 + 0.3,
        twinkleSpeed: Math.random() * 0.035 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        color: colorEntry.hex,
        rgb: colorEntry.rgb,
        isCoreDust: distFactor < 0.25,
        hasDiffractionSpike: size > 2.45,
        screenX: 0,
        screenY: 0,
      });
    }

    // Volumetric Nebula Clouds orbiting along the spiral arms
    const nebulaClouds: NebulaCloud[] = [];
    const nebulaColors = [
      'rgba(137, 170, 204, 0.065)',
      'rgba(78, 133, 191, 0.055)',
      'rgba(165, 196, 232, 0.05)',
      'rgba(56, 102, 168, 0.06)',
    ];
    for (let i = 0; i < 28; i++) {
      const armIndex = i % spiralArms;
      const distFactor = (i / 28) * 0.85 + 0.05;
      nebulaClouds.push({
        radius: distFactor * maxGalacticRadius * 0.78,
        angle:
          (armIndex * (Math.PI * 2)) / spiralArms +
          distFactor * 4.8 +
          (Math.random() - 0.5) * 0.4,
        speed: (0.0004 + (1 - distFactor) * 0.0007) * (flipped ? -1 : 1),
        size: 90 + Math.random() * 140,
        color: nebulaColors[i % nebulaColors.length],
      });
    }

    // Interactive Pointer / Touch State
    const pointer = {
      x: width / 2,
      y: height / 2,
      prevX: width / 2,
      prevY: height / 2,
      vx: 0,
      vy: 0,
      normX: 0,
      normY: 0,
      smoothNormX: 0,
      smoothNormY: 0,
      active: false,
    };

    const shockwaves: Shockwave[] = [];

    const shootingStar: ShootingStar = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      length: 110,
      alpha: 0,
      active: false,
    };

    const updatePointerFromClient = (clientX: number, clientY: number) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      // Check if cursor/touch is near or within this section's viewport bounds
      const isInsideVertical =
        clientY >= rect.top - 120 && clientY <= rect.bottom + 120;

      if (!isInsideVertical) {
        pointer.active = false;
        return;
      }

      const localX = clientX - rect.left;
      // Account for scale-y-[-1] when flipped so touch coordinates match the visual stars!
      const rawLocalY = clientY - rect.top;
      const localY = flipped ? rect.height - rawLocalY : rawLocalY;

      pointer.vx = localX - pointer.x;
      pointer.vy = localY - pointer.y;
      pointer.prevX = pointer.x;
      pointer.prevY = pointer.y;
      pointer.x = localX;
      pointer.y = localY;
      pointer.normX = (localX / Math.max(rect.width, 1)) * 2 - 1;
      pointer.normY = (localY / Math.max(rect.height, 1)) * 2 - 1;
      pointer.active = true;
    };

    const handlePointerMove = (e: PointerEvent) => {
      updatePointerFromClient(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updatePointerFromClient(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const triggerShockwave = (clientX: number, clientY: number) => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (clientY < rect.top || clientY > rect.bottom) return;

      const localX = clientX - rect.left;
      const rawLocalY = clientY - rect.top;
      const localY = flipped ? rect.height - rawLocalY : rawLocalY;

      shockwaves.push({
        x: localX,
        y: localY,
        radius: 8,
        maxRadius: 280,
        alpha: 0.75,
      });

      // Scatter stars radially outward on click/tap
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const distX = s.screenX - localX;
        const distY = s.screenY - localY;
        const dist = Math.hypot(distX, distY);
        if (dist < 240 && dist > 1) {
          const force = ((240 - dist) / 240) * 14;
          s.vx += (distX / dist) * force;
          s.vy += (distY / dist) * force;
        }
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      updatePointerFromClient(e.clientX, e.clientY);
      triggerShockwave(e.clientX, e.clientY);
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('blur', handlePointerLeave);

    let time = 0;

    const render = () => {
      time += 1;

      // Smoothly interpolate 3D camera tilt from pointer position
      const targetX = pointer.active ? pointer.normX : Math.sin(time * 0.004) * 0.15;
      const targetY = pointer.active ? pointer.normY : Math.cos(time * 0.003) * 0.1;
      pointer.smoothNormX += (targetX - pointer.smoothNormX) * 0.05;
      pointer.smoothNormY += (targetY - pointer.smoothNormY) * 0.05;

      // Decay pointer velocity
      pointer.vx *= 0.85;
      pointer.vy *= 0.85;

      // Detect active theme dynamically each frame for instant, zero-remount theme transitions
      const isDark = document.documentElement.classList.contains('dark');

      // 1. Background Fill (Deep Cosmic Space in Dark Mode, Warm Alabaster Astrolabe in High-Contrast Light Mode)
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = isDark ? '#06070B' : '#F7F6F2';
      ctx.fillRect(0, 0, width, height);

      // Couple 3D Galaxy orientation and orbital speed to Lenis spring scroll velocity
      const clampedScrollVel = Math.max(
        -16,
        Math.min(16, lenisScrollState.velocity)
      );
      const scrollOrbitBoost = 1 + Math.abs(clampedScrollVel) * 0.22;

      // Galaxy Center with subtle pointer + scroll momentum parallax shift
      const centerX = width * 0.5 + pointer.smoothNormX * 28;
      const centerY =
        height * 0.44 + pointer.smoothNormY * 18 - clampedScrollVel * 0.8;

      // 3D Disc Orientation Angles
      const discTiltX = Math.max(
        0.22,
        Math.min(
          0.72,
          0.44 + pointer.smoothNormY * 0.12 + clampedScrollVel * 0.004
        )
      ); // Vertical compression factor
      const discRotateZ = -0.22 + pointer.smoothNormX * 0.08;
      const cosRot = Math.cos(discRotateZ);
      const sinRot = Math.sin(discRotateZ);

      // 2. Ambient Nebula Backdrop
      const ambientGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        Math.max(width, height) * 0.7
      );
      if (isDark) {
        ambientGrad.addColorStop(0, 'rgba(137, 170, 204, 0.28)');
        ambientGrad.addColorStop(0.28, 'rgba(78, 133, 191, 0.15)');
        ambientGrad.addColorStop(0.6, 'rgba(22, 42, 74, 0.07)');
        ambientGrad.addColorStop(1, 'rgba(6, 7, 11, 0)');
      } else {
        ambientGrad.addColorStop(0, 'rgba(78, 133, 191, 0.20)');
        ambientGrad.addColorStop(0.32, 'rgba(137, 170, 204, 0.12)');
        ambientGrad.addColorStop(0.65, 'rgba(184, 212, 242, 0.06)');
        ambientGrad.addColorStop(1, 'rgba(247, 246, 242, 0)');
      }
      ctx.fillStyle = ambientGrad;
      ctx.fillRect(0, 0, width, height);

      // Switch to additive blending in dark mode, or normal source-over in high-contrast light mode
      ctx.globalCompositeOperation = isDark ? 'lighter' : 'source-over';

      // 3. Swirling Spiral Nebula Clouds
      for (let i = 0; i < nebulaClouds.length; i++) {
        const cloud = nebulaClouds[i];
        cloud.angle += cloud.speed * scrollOrbitBoost;

        const flatX = Math.cos(cloud.angle) * cloud.radius;
        const flatY = Math.sin(cloud.angle) * cloud.radius * discTiltX;

        const cx = centerX + flatX * cosRot - flatY * sinRot;
        const cy = centerY + flatX * sinRot + flatY * cosRot;

        const cloudGrad = ctx.createRadialGradient(
          cx,
          cy,
          0,
          cx,
          cy,
          cloud.size
        );
        cloudGrad.addColorStop(
          0,
          isDark ? cloud.color : 'rgba(53, 114, 176, 0.045)'
        );
        cloudGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = cloudGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, cloud.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Luminous Galactic Nucleus & Tilted Accretion Core
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(discRotateZ);
      ctx.scale(1.8, discTiltX * 1.15);

      const coreRadius = Math.min(width, height) * 0.28;
      const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreRadius);
      if (isDark) {
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.72)');
        coreGrad.addColorStop(0.12, 'rgba(220, 238, 255, 0.45)');
        coreGrad.addColorStop(0.35, 'rgba(137, 170, 204, 0.22)');
        coreGrad.addColorStop(0.65, 'rgba(78, 133, 191, 0.08)');
        coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      } else {
        coreGrad.addColorStop(0, 'rgba(53, 114, 176, 0.24)');
        coreGrad.addColorStop(0.2, 'rgba(78, 133, 191, 0.15)');
        coreGrad.addColorStop(0.5, 'rgba(137, 170, 204, 0.07)');
        coreGrad.addColorStop(1, 'rgba(247, 246, 242, 0)');
      }

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 5. Interactive Starfield & Spiral Arms with Touch/Cursor Physics
      const interactionRadius = 155;
      const pointerSpeed = Math.hypot(pointer.vx, pointer.vy);
      const nearbyInteractiveStars: GalaxyStar[] = [];

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.angle += s.orbitalSpeed * scrollOrbitBoost;

        // 3D Galactic Disc Projection
        const flatX = Math.cos(s.angle) * s.baseRadius;
        const flatY =
          Math.sin(s.angle) * s.baseRadius * discTiltX +
          s.elevationY * (1 - discTiltX);

        const baseScreenX = centerX + flatX * cosRot - flatY * sinRot;
        const baseScreenY = centerY + flatX * sinRot + flatY * cosRot;

        // Interactive Cursor / Touch Force (Swirl + Gentle Repulsion + Drag Wake)
        if (pointer.active) {
          const curX = baseScreenX + s.dx;
          const curY = baseScreenY + s.dy;
          const distX = curX - pointer.x;
          const distY = curY - pointer.y;
          const dist = Math.hypot(distX, distY);

          if (dist < interactionRadius && dist > 0.5) {
            const influence = Math.pow(1 - dist / interactionRadius, 1.6);
            const nx = distX / dist;
            const ny = distY / dist;
            // Tangential swirl vector (-ny, nx) + radial push (nx, ny)
            const pushStrength = 1.35;
            const swirlStrength = 0.95;

            s.vx +=
              (nx * pushStrength - ny * swirlStrength) * influence +
              pointer.vx * 0.045 * influence;
            s.vy +=
              (ny * pushStrength + nx * swirlStrength) * influence +
              pointer.vy * 0.045 * influence;

            if (dist < 110 && nearbyInteractiveStars.length < 18) {
              nearbyInteractiveStars.push(s);
            }
          }
        }

        // Elastic Spring Return Physics
        const springK = 0.055;
        const damping = 0.86;
        s.vx += -s.dx * springK;
        s.vy += -s.dy * springK;
        s.vx *= damping;
        s.vy *= damping;
        s.dx += s.vx;
        s.dy += s.vy;

        const finalX = baseScreenX + s.dx;
        const finalY = baseScreenY + s.dy;
        s.screenX = finalX;
        s.screenY = finalY;

        // Skip off-screen stars for performance
        if (
          finalX < -20 ||
          finalX > width + 20 ||
          finalY < -20 ||
          finalY > height + 20
        ) {
          continue;
        }

        const displacementMag = Math.hypot(s.dx, s.dy);
        const energyBoost = Math.min(displacementMag / 25, 1) * 0.45;
        const twinkle =
          0.65 + 0.35 * Math.sin(time * s.twinkleSpeed + s.twinklePhase);
        const alpha = Math.min(1, s.baseAlpha * twinkle + energyBoost);
        const drawSize = s.size + energyBoost * 0.9;

        // In High-Contrast Light Mode, render deep celestial ink & cobalt stars for crisp visibility
        const starRgb = isDark
          ? s.rgb
          : s.isCoreDust
            ? '30, 58, 95'
            : '43, 88, 145';
        const effectiveAlpha = isDark ? alpha : alpha * 0.72;

        // Draw Star Core
        ctx.fillStyle = `rgba(${starRgb}, ${effectiveAlpha})`;
        ctx.beginPath();
        ctx.arc(finalX, finalY, drawSize, 0, Math.PI * 2);
        ctx.fill();

        // Soft Outer Halo on Brighter or Touched Stars
        if (drawSize > 1.6 || energyBoost > 0.15) {
          ctx.fillStyle = `rgba(${starRgb}, ${effectiveAlpha * 0.22})`;
          ctx.beginPath();
          ctx.arc(finalX, finalY, drawSize * 3.1, 0, Math.PI * 2);
          ctx.fill();
        }

        // Astrophotography 4-Point Diffraction Spikes on Feature Stars
        if (s.hasDiffractionSpike) {
          const spikeLen = drawSize * 5.2;
          ctx.strokeStyle = `rgba(${starRgb}, ${effectiveAlpha * 0.38})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(finalX - spikeLen, finalY);
          ctx.lineTo(finalX + spikeLen, finalY);
          ctx.moveTo(finalX, finalY - spikeLen);
          ctx.lineTo(finalX, finalY + spikeLen);
          ctx.stroke();
        }
      }

      // 6. Interactive Constellation Filaments & Pointer Halo when touching/moving
      if (pointer.active) {
        const pointerGlow = ctx.createRadialGradient(
          pointer.x,
          pointer.y,
          0,
          pointer.x,
          pointer.y,
          140
        );
        pointerGlow.addColorStop(
          0,
          isDark
            ? `rgba(137, 170, 204, ${0.14 + Math.min(pointerSpeed * 0.005, 0.12)})`
            : `rgba(53, 114, 176, ${0.12 + Math.min(pointerSpeed * 0.004, 0.1)})`
        );
        pointerGlow.addColorStop(0.5, 'rgba(78, 133, 191, 0.05)');
        pointerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = pointerGlow;
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 140, 0, Math.PI * 2);
        ctx.fill();

        // Connect touched stars with delicate constellation lines
        ctx.lineWidth = 0.65;
        for (let i = 0; i < nearbyInteractiveStars.length; i++) {
          const a = nearbyInteractiveStars[i];
          const distToPointer = Math.hypot(
            a.screenX - pointer.x,
            a.screenY - pointer.y
          );
          const lineAlpha = (1 - distToPointer / 110) * 0.28;
          ctx.strokeStyle = isDark
            ? `rgba(137, 170, 204, ${lineAlpha})`
            : `rgba(43, 88, 145, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(pointer.x, pointer.y);
          ctx.lineTo(a.screenX, a.screenY);
          ctx.stroke();
        }
      }

      // 7. Expanding Click/Tap Supernova Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += (sw.maxRadius - sw.radius) * 0.08 + 2.5;
        sw.alpha *= 0.93;

        if (sw.alpha < 0.02) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = isDark
          ? `rgba(184, 212, 242, ${sw.alpha})`
          : `rgba(53, 114, 176, ${sw.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 8. Occasional Shooting Star / Comet
      if (!shootingStar.active && Math.random() < 0.007) {
        shootingStar.active = true;
        shootingStar.x = Math.random() * width * 0.8 + width * 0.1;
        shootingStar.y = Math.random() * height * 0.35;
        const angle = Math.PI * 0.2 + (Math.random() - 0.5) * 0.25;
        const speed = 11 + Math.random() * 5;
        shootingStar.vx = Math.cos(angle) * speed;
        shootingStar.vy = Math.sin(angle) * speed;
        shootingStar.alpha = 0.95;
      }

      if (shootingStar.active) {
        shootingStar.x += shootingStar.vx;
        shootingStar.y += shootingStar.vy;
        shootingStar.alpha *= 0.96;

        const tailX =
          shootingStar.x -
          (shootingStar.vx / 14) * shootingStar.length;
        const tailY =
          shootingStar.y -
          (shootingStar.vy / 14) * shootingStar.length;

        const cometGrad = ctx.createLinearGradient(
          shootingStar.x,
          shootingStar.y,
          tailX,
          tailY
        );
        if (isDark) {
          cometGrad.addColorStop(
            0,
            `rgba(255, 255, 255, ${shootingStar.alpha})`
          );
          cometGrad.addColorStop(
            0.3,
            `rgba(137, 170, 204, ${shootingStar.alpha * 0.6})`
          );
          cometGrad.addColorStop(1, 'rgba(78, 133, 191, 0)');
        } else {
          cometGrad.addColorStop(
            0,
            `rgba(30, 58, 95, ${shootingStar.alpha * 0.85})`
          );
          cometGrad.addColorStop(
            0.3,
            `rgba(53, 114, 176, ${shootingStar.alpha * 0.5})`
          );
          cometGrad.addColorStop(1, 'rgba(78, 133, 191, 0)');
        }

        ctx.strokeStyle = cometGrad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(shootingStar.x, shootingStar.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        if (
          shootingStar.alpha < 0.04 ||
          shootingStar.x > width + 150 ||
          shootingStar.y > height + 150
        ) {
          shootingStar.active = false;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('blur', handlePointerLeave);
    };
  }, [flipped]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${
        flipped ? 'scale-y-[-1]' : ''
      }`}
    >
      {/* Interactive 60fps 3D Logarithmic Spiral Galaxy & Starfield Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover block"
      />

      {/* HLS Video Stream Layer (Softly blended with the interactive galaxy) */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        crossOrigin="anonymous"
        className={`absolute inset-0 w-full h-full object-cover mix-blend-screen transition-opacity duration-700 ${
          videoReady ? 'opacity-10 dark:opacity-55' : 'opacity-0'
        }`}
      />

      {/* Contrast Scrim Overlay */}
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </div>
  );
};
