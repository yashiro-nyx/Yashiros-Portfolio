import React, { useEffect, useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { lenisScrollState } from './SmoothScrollProvider';

interface ProjectCardParticleOverlayProps {
  isHovered: boolean;
  cursorX: number; // 0 to 100 percentage
  cursorY: number; // 0 to 100 percentage
  accentColor?: string;
}

interface CardParticle {
  homeX: number;
  homeY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseAlpha: number;
  tint: string;
  phase: number;
}

const PARTICLE_COLORS = ['#89AACC', '#A9C7E8', '#4E85BF', '#C4B5FD', '#E2E8F0'];

export const ProjectCardParticleOverlay: React.FC<
  ProjectCardParticleOverlayProps
> = ({ isHovered, cursorX, cursorY }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<CardParticle[]>([]);
  const pointerRef = useRef({
    x: 0.5,
    y: 0.5,
    prevX: 0.5,
    prevY: 0.5,
    vx: 0,
    vy: 0,
    active: false,
  });

  // Framer Motion scroll velocity tracking & spring smoothing
  const { scrollY } = useScroll();
  const rawScrollVelocity = useVelocity(scrollY);
  const smoothScrollVelocity = useSpring(rawScrollVelocity, {
    stiffness: 140,
    damping: 26,
    mass: 0.5,
  });

  // Map scroll speed to subtle overlay glow intensity
  const overlayOpacity = useTransform(
    smoothScrollVelocity,
    [-1800, 0, 1800],
    [0.95, 0.75, 0.95]
  );

  // Sync latest cursor props into ref for zero-lag animation frame reads
  useEffect(() => {
    const normX = cursorX / 100;
    const normY = cursorY / 100;
    pointerRef.current.vx = normX - pointerRef.current.x;
    pointerRef.current.vy = normY - pointerRef.current.y;
    pointerRef.current.prevX = pointerRef.current.x;
    pointerRef.current.prevY = pointerRef.current.y;
    pointerRef.current.x = normX;
    pointerRef.current.y = normY;
    pointerRef.current.active = isHovered;
  }, [isHovered, cursorX, cursorY]);

  // Initialize and resize particle field
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initParticles = (width: number, height: number) => {
      const count = 46;
      const list: CardParticle[] = [];
      for (let i = 0; i < count; i++) {
        const hx = Math.random() * width;
        const hy = Math.random() * height;
        list.push({
          homeX: hx,
          homeY: hy,
          x: hx,
          y: hy,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: 1.2 + Math.random() * 2.1,
          baseAlpha: 0.25 + Math.random() * 0.55,
          tint: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
          phase: Math.random() * Math.PI * 2,
        });
      }
      particlesRef.current = list;
    };

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      initParticles(rect.width, rect.height);
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(canvas);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Framer Motion frame loop synced with both cursor scatter and scroll velocity
  useAnimationFrame((time) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    if (width <= 0 || height <= 0) return;

    ctx.clearRect(0, 0, width, height);

    // Combine Framer Motion scroll velocity with Lenis velocity
    const fmVelocity = smoothScrollVelocity.get();
    const lenisVel = lenisScrollState.velocity * 45;
    const effectiveScrollVel =
      Math.abs(fmVelocity) > Math.abs(lenisVel) ? fmVelocity : lenisVel;
    const clampedScrollSpeed = Math.min(Math.abs(effectiveScrollVel) / 900, 2.6);
    const scrollDirection = effectiveScrollVel >= 0 ? 1 : -1;

    const ptr = pointerRef.current;
    const px = ptr.x * width;
    const py = ptr.y * height;
    const pointerSpeed = Math.hypot(ptr.vx * width, ptr.vy * height);

    // Repulsion radius expands with cursor movement speed and scroll speed
    const scatterRadius =
      (ptr.active ? 115 : 0) +
      Math.min(pointerSpeed * 1.4, 55) +
      clampedScrollSpeed * 28;

    const particles = particlesRef.current;
    const t = time * 0.0015;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Ambient orbital drift + scroll-synced vertical flow
      const driftX = Math.cos(t + p.phase) * (0.28 + clampedScrollSpeed * 0.35);
      const driftY =
        Math.sin(t * 1.1 + p.phase) * 0.28 -
        scrollDirection * clampedScrollSpeed * 1.65;

      p.homeX = (p.homeX + driftX * 0.25 + width) % width;
      p.homeY = (p.homeY + driftY * 0.55 + height) % height;

      // Cursor scatter / repulsion physics when hovering over the card
      if (ptr.active && scatterRadius > 0) {
        const dx = p.x - px;
        const dy = p.y - py;
        const dist = Math.hypot(dx, dy);

        if (dist < scatterRadius && dist > 0.001) {
          const force = Math.pow(1 - dist / scatterRadius, 1.65);
          const nx = dx / dist;
          const ny = dy / dist;
          const impulse = (3.4 + Math.min(pointerSpeed * 0.18, 4.2)) * force;
          p.vx += nx * impulse + ptr.vx * width * 0.06 * force;
          p.vy += ny * impulse + ptr.vy * height * 0.06 * force;
        }
      }

      // Spring restoration toward drifting home position
      const springK = ptr.active ? 0.042 : 0.065;
      p.vx += (p.homeX - p.x) * springK;
      p.vy += (p.homeY - p.y) * springK - scrollDirection * clampedScrollSpeed * 0.18;

      // Damping
      p.vx *= 0.86;
      p.vy *= 0.86;

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around softly if pushed far outside bounds
      if (p.x < -20) p.x = width + 10;
      if (p.x > width + 20) p.x = -10;
      if (p.y < -20) p.y = height + 10;
      if (p.y > height + 20) p.y = -10;

      // Calculate velocity magnitude for dynamic streak & glow
      const speed = Math.hypot(p.vx, p.vy);
      const alphaBoost = ptr.active ? Math.min(speed * 0.08, 0.45) : 0;
      const alpha = Math.min(
        0.92,
        (p.baseAlpha + alphaBoost + clampedScrollSpeed * 0.14) *
          (ptr.active ? 1 : 0.48)
      );

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.tint;
      ctx.strokeStyle = p.tint;

      // Draw motion-stretched particle when scattering or scrolling rapidly
      if (speed > 1.1 || clampedScrollSpeed > 0.35) {
        const angle = Math.atan2(
          p.vy - scrollDirection * clampedScrollSpeed * 1.4,
          p.vx
        );
        const streakLen = Math.min(
          p.size + speed * 2.4 + clampedScrollSpeed * 4.5,
          16
        );
        ctx.translate(p.x, p.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.roundRect(
          -streakLen * 0.5,
          -p.size * 0.5,
          streakLen,
          p.size,
          p.size * 0.5
        );
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // Subtle repulsion shockwave ring around cursor when active
    if (ptr.active) {
      const grad = ctx.createRadialGradient(
        px,
        py,
        4,
        px,
        py,
        scatterRadius * 0.85
      );
      grad.addColorStop(0, 'rgba(137, 170, 204, 0.14)');
      grad.addColorStop(0.55, 'rgba(137, 170, 204, 0.05)');
      grad.addColorStop(1, 'rgba(137, 170, 204, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, scatterRadius * 0.85, 0, Math.PI * 2);
      ctx.fill();
    }

    // Decay pointer frame velocity
    ptr.vx *= 0.7;
    ptr.vy *= 0.7;
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity: overlayOpacity }}
      className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-3xl"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </motion.div>
  );
};
