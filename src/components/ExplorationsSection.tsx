import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ExternalLink, X } from 'lucide-react';
import {
  EXPLORATION_ITEMS,
  ExplorationItem,
  PROFILE_DATA,
} from '../data/portfolioData';
import { Magnetic } from './Magnetic';
import { AmbientAudioToggle } from './AmbientAudioToggle';
import { StaggerContainer, FadeInUpItem } from './StaggerFadeInUp';
import { lenisScrollState } from './SmoothScrollProvider';

gsap.registerPlugin(ScrollTrigger);

interface StarParticle {
  xNorm: number; // 0..1 normalized horizontal position
  yOffset: number; // wrapped vertical pixel coordinate
  depth: number; // 0.25 (far) .. 1.55 (foreground)
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  flickerSpeed: number;
  flickerPhase: number;
  tint: 'white' | 'ice' | 'blue';
  darkCoreStyle: string;
  darkGlowStyle: string;
  lightCoreStyle: string;
  lightGlowStyle: string;
  trailX: number;
  trailY: number;
  hasTrail: boolean;
}

const createStarField = (count: number, height: number): StarParticle[] => {
  const stars: StarParticle[] = [];
  for (let i = 0; i < count; i++) {
    // Deterministic pseudo-random spread for consistent visual rhythm
    const s1 = Math.sin(i * 12.9898 + 1.23) * 43758.5453;
    const s2 = Math.sin(i * 78.233 + 4.56) * 43758.5453;
    const s3 = Math.sin(i * 39.425 + 7.89) * 43758.5453;
    const r1 = s1 - Math.floor(s1);
    const r2 = s2 - Math.floor(s2);
    const r3 = s3 - Math.floor(s3);

    const depth = 0.24 + Math.pow(r3, 1.35) * 1.32;
    const tintRoll = (i % 11) / 11;
    const tint: StarParticle['tint'] =
      tintRoll > 0.72 ? 'ice' : tintRoll > 0.56 ? 'blue' : 'white';

    let darkCoreStyle = 'rgb(245, 245, 245)';
    let darkGlowStyle = 'rgb(137, 170, 204)';
    let lightCoreStyle = 'rgb(24, 34, 48)';
    let lightGlowStyle = 'rgb(53, 114, 176)';

    if (tint === 'ice') {
      darkCoreStyle = 'rgb(137, 170, 204)';
      darkGlowStyle = 'rgb(164, 198, 232)';
      lightCoreStyle = 'rgb(53, 114, 176)';
      lightGlowStyle = 'rgb(78, 133, 191)';
    } else if (tint === 'blue') {
      darkCoreStyle = 'rgb(78, 133, 191)';
      darkGlowStyle = 'rgb(112, 164, 218)';
      lightCoreStyle = 'rgb(38, 86, 140)';
      lightGlowStyle = 'rgb(53, 114, 176)';
    }

    stars.push({
      xNorm: r1,
      yOffset: r2 * Math.max(height, 900),
      depth,
      radius: 0.65 + depth * 1.15,
      baseAlpha: 0.24 + Math.min(0.74, depth * 0.48),
      twinkleSpeed: 1.1 + r1 * 2.2,
      twinklePhase: r2 * Math.PI * 2,
      flickerSpeed: 3.4 + r3 * 4.6,
      flickerPhase: r1 * Math.PI * 2,
      tint,
      darkCoreStyle,
      darkGlowStyle,
      lightCoreStyle,
      lightGlowStyle,
      trailX: 0,
      trailY: 0,
      hasTrail: false,
    });
  }
  return stars;
};

export const ExplorationsSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const leftColRef = useRef<HTMLDivElement | null>(null);
  const rightColRef = useRef<HTMLDivElement | null>(null);
  const starCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const scrollVelocityRef = useRef<number>(0);
  const springFallVelRef = useRef<number>(18);
  const springFallAccelRef = useRef<number>(0);
  const pointerTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const pointerSmoothRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [lightboxItem, setLightboxItem] = useState<ExplorationItem | null>(
    null
  );
  const [activePhotoUrl, setActivePhotoUrl] = useState<string>('');

  useEffect(() => {
    if (lightboxItem) {
      setActivePhotoUrl(lightboxItem.image);
    }
  }, [lightboxItem]);

  // Pre-decode gallery images off the main thread so scrolling into view never stutters
  useEffect(() => {
    EXPLORATION_ITEMS.forEach((item) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = item.image;
      if (typeof img.decode === 'function') {
        img.decode().catch(() => {});
      }
    });
  }, []);

  const leftItems = EXPLORATION_ITEMS.filter((_, idx) => idx % 2 === 0);
  const rightItems = EXPLORATION_ITEMS.filter((_, idx) => idx % 2 === 1);

  // Keyboard support for Event Lightbox (Escape to close, ArrowLeft/ArrowRight to cycle)
  useEffect(() => {
    if (!lightboxItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxItem(null);
      } else if (e.key === 'ArrowRight') {
        const curIdx = EXPLORATION_ITEMS.findIndex(
          (i) => i.id === lightboxItem.id
        );
        const nextIdx = (curIdx + 1) % EXPLORATION_ITEMS.length;
        setLightboxItem(EXPLORATION_ITEMS[nextIdx]);
      } else if (e.key === 'ArrowLeft') {
        const curIdx = EXPLORATION_ITEMS.findIndex(
          (i) => i.id === lightboxItem.id
        );
        const prevIdx =
          (curIdx - 1 + EXPLORATION_ITEMS.length) % EXPLORATION_ITEMS.length;
        setLightboxItem(EXPLORATION_ITEMS[prevIdx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxItem]);

  // GSAP ScrollTrigger parallax columns + scroll velocity sync
  useEffect(() => {
    const section = sectionRef.current;
    const leftCol = leftColRef.current;
    const rightCol = rightColRef.current;

    if (!section || !leftCol || !rightCol) return;

    const ctx = gsap.context(() => {
      // Track ScrollTrigger scroll velocity for spring-physics falling starfield sync
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          // ScrollTrigger velocity is px/sec; positive when scrolling down
          const v = self.getVelocity();
          scrollVelocityRef.current = Math.max(-4800, Math.min(4800, v));
        },
      });

      // Layer 2 Parallax Columns movement (GPU-promoted 3D translation)
      gsap.fromTo(
        leftCol,
        { y: 120, force3D: true },
        {
          y: -260,
          force3D: true,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            fastScrollEnd: true,
          },
        }
      );

      gsap.fromTo(
        rightCol,
        { y: 260, force3D: true },
        {
          y: -380,
          force3D: true,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            fastScrollEnd: true,
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  // Scroll-synced Falling Starfield Canvas Renderer (zero per-frame gradient allocations + visibility gated)
  useEffect(() => {
    const canvas = starCanvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;

    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let width = canvas.clientWidth || window.innerWidth;
    let height = canvas.clientHeight || window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let isSectionVisible = false;
    let isDark = document.documentElement.classList.contains('dark');
    let rafId = 0;

    const resize = () => {
      width = canvas.clientWidth || window.innerWidth;
      height = canvas.clientHeight || window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx2d.lineCap = 'round';
    };
    resize();

    // Observe theme class changes without querying DOM every animation frame
    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.classList.contains('dark');
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const onPointerMove = (e: PointerEvent) => {
      if (!isSectionVisible || reducedMotion || width === 0 || height === 0)
        return;
      pointerTargetRef.current.x = (e.clientX / width - 0.5) * 2;
      pointerTargetRef.current.y = (e.clientY / height - 0.5) * 2;
    };

    const onPointerLeave = () => {
      pointerTargetRef.current.x = 0;
      pointerTargetRef.current.y = 0;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    const stars = createStarField(160, height);
    let prevScrollPos = lenisScrollState.scroll || window.scrollY;
    let lastTime = performance.now();

    const drawFrame = (now: number) => {
      rafId = 0;
      if (!isSectionVisible) return;

      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // Measure live scroll velocity from Lenis, frame scroll delta, and GSAP ScrollTrigger
      const currentScrollPos =
        lenisScrollState.scroll > 0 ? lenisScrollState.scroll : window.scrollY;
      const rawScrollDelta = currentScrollPos - prevScrollPos;
      prevScrollPos = currentScrollPos;

      const deltaVel = rawScrollDelta / dt;
      const lenisVelPx = lenisScrollState.velocity * 60;
      const measuredScrollVel =
        Math.abs(lenisVelPx) > 3
          ? lenisVelPx
          : Math.abs(deltaVel) > 3
            ? deltaVel
            : scrollVelocityRef.current;

      // Decay ScrollTrigger fallback when user stops scrolling
      scrollVelocityRef.current *= Math.pow(0.05, dt);

      const clampedScrollVel = Math.max(
        -4800,
        Math.min(4800, measuredScrollVel)
      );

      // Progressive acceleration curve: faster scrolling accelerates stars into warp streaks
      const baseIdleFallVel = reducedMotion ? 0 : 20;
      const scrollSignDir = clampedScrollVel >= 0 ? 1 : -1;
      const absScrollSpeed = Math.abs(clampedScrollVel);
      const nonlinearBoost =
        absScrollSpeed > 1
          ? scrollSignDir * Math.pow(absScrollSpeed * 0.022, 1.38) * 18
          : 0;
      const targetFallVelocity = reducedMotion
        ? 0
        : baseIdleFallVel + clampedScrollVel * 0.72 + nonlinearBoost;

      // Second-order damped spring physics integration (sub-stepped for refresh-rate stability)
      const stiffness = 135;
      const damping = 21;
      const subSteps = 2;
      const subDt = dt / subSteps;

      for (let s = 0; s < subSteps; s++) {
        const springForce =
          (targetFallVelocity - springFallVelRef.current) * stiffness;
        const dampingForce = -springFallAccelRef.current * damping;
        springFallAccelRef.current += (springForce + dampingForce) * subDt;
        springFallVelRef.current += springFallAccelRef.current * subDt;
      }

      // Subtle mouse/pointer parallax interpolation
      pointerSmoothRef.current.x +=
        (pointerTargetRef.current.x - pointerSmoothRef.current.x) *
        Math.min(1, dt * 5.5);
      pointerSmoothRef.current.y +=
        (pointerTargetRef.current.y - pointerSmoothRef.current.y) *
        Math.min(1, dt * 5.5);

      const vel = springFallVelRef.current;
      const absVel = Math.abs(vel);

      ctx2d.globalAlpha = 1;
      if (isDark) {
        ctx2d.fillStyle = '#000000';
        ctx2d.fillRect(0, 0, width, height);
      } else {
        ctx2d.clearRect(0, 0, width, height);
      }

      const timeSec = now * 0.001;
      const streakFactor = reducedMotion
        ? 0
        : Math.min(128, Math.max(0, (absVel - 12) * 0.042));
      const scrollSign = vel >= -10 ? 1 : -1;
      const pad = 64;
      const wrapH = height + pad * 2;
      const trailChase = Math.min(1, dt * 13);

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        if (!reducedMotion) {
          star.yOffset -= vel * dt * star.depth;
        }

        // Seamless vertical wrap
        star.yOffset = ((star.yOffset % wrapH) + wrapH) % wrapH;
        const baseY = star.yOffset - pad;

        // Subtle pointer + radial warp depth parallax
        const centerOffset = star.xNorm - 0.5;
        const warpSpread = reducedMotion
          ? 0
          : centerOffset * Math.min(42, absVel * 0.011) * star.depth;
        const pointerParallaxX = reducedMotion
          ? 0
          : -pointerSmoothRef.current.x * 16 * star.depth;
        const pointerParallaxY = reducedMotion
          ? 0
          : -pointerSmoothRef.current.y * 12 * star.depth;

        const x =
          (((star.xNorm * width + warpSpread + pointerParallaxX) % width) +
            width) %
          width;
        const y = baseY + pointerParallaxY;

        // Track trailing inertia anchor & guard against screen-edge wrap jumps
        if (
          !star.hasTrail ||
          reducedMotion ||
          Math.abs(x - star.trailX) > width * 0.35 ||
          Math.abs(y - star.trailY) > height * 0.35
        ) {
          star.trailX = x;
          star.trailY = y;
          star.hasTrail = true;
        } else {
          star.trailX += (x - star.trailX) * trailChase;
          star.trailY += (y - star.trailY) * trailChase;
        }

        // Dual-harmonic sine wave modulation for subtle organic twinkle & shimmer
        const primarySine = Math.sin(
          timeSec * star.twinkleSpeed + star.twinklePhase
        );
        const flickerSine = Math.sin(
          timeSec * star.flickerSpeed + star.flickerPhase
        );
        const twinkle = reducedMotion
          ? 1
          : Math.max(
              0.28,
              Math.min(1.08, 0.66 + 0.25 * primarySine + 0.14 * flickerSine)
            );
        const alpha = Math.min(0.98, star.baseAlpha * twinkle);
        const dynamicRadius = reducedMotion
          ? star.radius
          : star.radius * (0.88 + 0.18 * twinkle);

        const coreStyle = isDark ? star.darkCoreStyle : star.lightCoreStyle;
        const glowStyle = isDark ? star.darkGlowStyle : star.lightGlowStyle;

        // Combine lagged inertia trail vector with scroll-velocity streak boost
        const inertiaDx = star.trailX - x;
        const inertiaDy = star.trailY - y;
        const scrollStreakY = scrollSign * streakFactor * star.depth;
        const radialTiltX =
          reducedMotion || absVel < 15
            ? 0
            : -centerOffset * Math.min(18, absVel * 0.0055) * star.depth;

        const tailX = x + inertiaDx * 1.45 + radialTiltX;
        const tailY = y + inertiaDy * 1.65 + scrollStreakY;
        const dx = tailX - x;
        const dy = tailY - y;
        const tailLenSq = dx * dx + dy * dy;

        if (tailLenSq > 2.56 && !reducedMotion) {
          const midX = x + dx * 0.52;
          const midY = y + dy * 0.52;

          // Fast zero-allocation outer glow streak
          ctx2d.strokeStyle = glowStyle;
          ctx2d.globalAlpha = alpha * 0.22;
          ctx2d.lineWidth = Math.max(1.6, star.radius * 2.2);
          ctx2d.beginPath();
          ctx2d.moveTo(x, y);
          ctx2d.lineTo(tailX, tailY);
          ctx2d.stroke();

          // Fast zero-allocation hot-core streak (head to mid)
          ctx2d.strokeStyle = coreStyle;
          ctx2d.globalAlpha = Math.min(1, alpha * 0.78);
          ctx2d.lineWidth = Math.max(0.85, star.radius * 0.95);
          ctx2d.beginPath();
          ctx2d.moveTo(x, y);
          ctx2d.lineTo(midX, midY);
          ctx2d.stroke();
        }

        // Core star pinpoint with subtle twinkle radius pulse
        ctx2d.fillStyle = coreStyle;
        ctx2d.globalAlpha = alpha;
        ctx2d.beginPath();
        ctx2d.arc(x, y, dynamicRadius, 0, Math.PI * 2);
        ctx2d.fill();

        // Soft halo on brightest foreground stars
        if (star.depth > 1.2) {
          ctx2d.fillStyle = glowStyle;
          ctx2d.globalAlpha = isDark ? alpha * 0.24 : alpha * 0.15;
          ctx2d.beginPath();
          ctx2d.arc(x, y, dynamicRadius * 2.6, 0, Math.PI * 2);
          ctx2d.fill();
        }
      }

      ctx2d.globalAlpha = 1;

      if (!reducedMotion && isSectionVisible) {
        rafId = window.requestAnimationFrame(drawFrame);
      }
    };

    const startLoop = () => {
      if (!rafId && isSectionVisible) {
        lastTime = performance.now();
        prevScrollPos = lenisScrollState.scroll || window.scrollY;
        rafId = window.requestAnimationFrame(drawFrame);
      }
    };

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isSectionVisible = entry.isIntersecting;
        if (isSectionVisible) {
          startLoop();
        } else if (rafId) {
          window.cancelAnimationFrame(rafId);
          rafId = 0;
        }
      },
      { rootMargin: '250px 0px 250px 0px' }
    );
    visibilityObserver.observe(section);

    window.addEventListener('resize', resize);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      visibilityObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  const cardRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleCardKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    globalIdx: number
  ) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (globalIdx + 1) % EXPLORATION_ITEMS.length;
      cardRefs.current[nextIdx]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx =
        (globalIdx - 1 + EXPLORATION_ITEMS.length) % EXPLORATION_ITEMS.length;
      cardRefs.current[prevIdx]?.focus();
    }
  };

  return (
    <section
      id="explorations"
      ref={sectionRef}
      tabIndex={-1}
      aria-label="Milestones and Visual Archive"
      className="relative min-h-[280vh] md:min-h-[320vh] bg-transparent dark:bg-black focus:outline-none"
    >
      {/* Layer 0: Sticky Scroll-Synced Falling Starfield Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-transparent dark:bg-black">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          <canvas
            ref={starCanvasRef}
            aria-hidden="true"
            className="w-full h-full block"
          />
        </div>
      </div>

      {/* Seamless top & bottom edge fades blending pitch black into default page background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-36 z-[1] bg-gradient-to-b from-bg via-bg/65 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-36 z-[1] bg-gradient-to-t from-bg via-bg/65 to-transparent"
      />

      {/* Layer 1: Sticky Center Copy (z-10, strictly bounded within #explorations) */}
      <div className="sticky top-0 z-10 h-screen w-full flex flex-col items-center justify-center px-6 text-center pointer-events-none">
        <StaggerContainer
          once
          staggerDelay={0.09}
          viewportMargin="-24px 0px -24px 0px"
          className="pointer-events-auto max-w-lg mx-auto flex flex-col items-center bg-surface/95 backdrop-blur-md p-7 sm:p-10 rounded-3xl border border-stroke shadow-2xl transform-gpu"
        >
          <FadeInUpItem className="flex items-center gap-3 mb-4">
            <span className="w-6 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">
              Events &amp; Milestones Gallery
            </span>
            <span className="w-6 h-px bg-stroke" />
          </FadeInUpItem>

          <FadeInUpItem
            as="h2"
            className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-text-primary mb-4"
          >
            Events &amp; <span className="font-display italic">milestones</span>
          </FadeInUpItem>

          <FadeInUpItem
            as="p"
            className="text-xs sm:text-sm text-muted max-w-md mb-5 leading-relaxed"
          >
            Moments from <strong>AWS Community Day Philippines 2026</strong>,{' '}
            <strong>PH Startup Week 2026</strong>,{' '}
            <strong>Student Community Day Mega Manila 2026</strong>,{' '}
            <strong>Build Nights: KiroVerse Workshop</strong>, and volunteering
            on the Operations Team at the{' '}
            <strong>Skill Builder Execution Workshop</strong>. Scroll or use{' '}
            <kbd className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-surface border border-stroke text-text-primary">
              Tab
            </kbd>{' '}
            and{' '}
            <kbd className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-surface border border-stroke text-text-primary">
              Enter
            </kbd>{' '}
            to read the full post and inspect photos.
          </FadeInUpItem>

          <FadeInUpItem className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#89AACC] mb-6">
            {EXPLORATION_ITEMS.length.toString().padStart(2, '0')} Featured Frames · 2024 — 2026
          </FadeInUpItem>

          <FadeInUpItem className="flex flex-wrap items-center justify-center gap-3">
            <AmbientAudioToggle />

            <Magnetic strength={0.38}>
              <a
                href={PROFILE_DATA.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-block rounded-full p-[1.5px] transition-transform duration-300 hover:scale-105"
              >
                <span className="absolute inset-0 rounded-full accent-gradient" />
                <span className="relative inline-flex items-center gap-2 rounded-full bg-surface px-5 py-2 text-xs font-medium text-text-primary">
                  <span>GitHub @yashiro-nyx</span>
                  <span>↗</span>
                </span>
              </a>
            </Magnetic>

            <Magnetic strength={0.35}>
              <a
                href={PROFILE_DATA.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-stroke hover:border-[#89AACC] px-4 py-2 text-xs text-muted hover:text-text-primary transition-colors"
              >
                <span>LinkedIn</span>
                <span>↗</span>
              </a>
            </Magnetic>
          </FadeInUpItem>
        </StaggerContainer>
      </div>

      {/* Layer 2: Parallax Event Photo Columns (z-20, absolute & clipped to #explorations bounds) */}
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden flex justify-center">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 grid grid-cols-2 gap-6 sm:gap-16 md:gap-40 lg:gap-72 pt-[25vh] pb-[25vh]">
          {/* Left Column */}
          <div
            ref={leftColRef}
            style={{ willChange: 'transform' }}
            className="flex flex-col items-start gap-28 md:gap-44 transform-gpu"
          >
            {leftItems.map((item, idx) => {
              const globalIdx = idx * 2;
              return (
                <motion.button
                  key={item.id}
                  ref={(el) => {
                    cardRefs.current[globalIdx] = el;
                  }}
                  type="button"
                  initial={{ opacity: 0, scale: 0.94, y: 24 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{
                    once: true,
                    amount: 0.12,
                    margin: '60px 0px 60px 0px',
                  }}
                  transition={{
                    duration: 0.55,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  aria-label={`${item.title} (${item.category}, ${item.year}). Press Enter to open full-screen preview.`}
                  onClick={() => setLightboxItem(item)}
                  onFocus={(e) => {
                    e.currentTarget.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    });
                  }}
                  onKeyDown={(e) => handleCardKeyDown(e, globalIdx)}
                  className={`pointer-events-auto group relative w-full aspect-square max-w-[260px] sm:max-w-[320px] rounded-3xl bg-surface border border-stroke hover:border-[#89AACC]/60 focus-visible:border-[#89AACC] overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105 focus-visible:scale-105 hover:rotate-0 focus-visible:rotate-0 cursor-pointer text-left transform-gpu ${item.rotation}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    decoding="async"
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      item.imageScaleClass ??
                      'group-hover:scale-110 group-focus-visible:scale-110'
                    }`}
                  />
                  <div className="absolute inset-0 halftone-overlay opacity-15 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/95 via-[#141414]/35 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-[#89AACC] mb-1">
                      {item.category} · {item.year}
                    </span>
                    <h3 className="text-base sm:text-xl font-display italic text-[#F5F5F5] leading-tight">
                      {item.title}
                    </h3>
                    <span className="inline-block mt-2 text-[11px] text-[#A1A1AA] group-hover:text-[#F5F5F5] group-focus-visible:text-[#89AACC] transition-colors">
                      Press Enter or click to inspect ↗
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Right Column */}
          <div
            ref={rightColRef}
            style={{ willChange: 'transform' }}
            className="flex flex-col items-end gap-28 md:gap-44 pt-36 md:pt-56 transform-gpu"
          >
            {rightItems.map((item, idx) => {
              const globalIdx = idx * 2 + 1;
              return (
                <motion.button
                  key={item.id}
                  ref={(el) => {
                    cardRefs.current[globalIdx] = el;
                  }}
                  type="button"
                  initial={{ opacity: 0, scale: 0.94, y: 24 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{
                    once: true,
                    amount: 0.12,
                    margin: '60px 0px 60px 0px',
                  }}
                  transition={{
                    duration: 0.55,
                    delay: 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  aria-label={`${item.title} (${item.category}, ${item.year}). Press Enter to open full-screen preview.`}
                  onClick={() => setLightboxItem(item)}
                  onFocus={(e) => {
                    e.currentTarget.scrollIntoView({
                      behavior: 'smooth',
                      block: 'center',
                    });
                  }}
                  onKeyDown={(e) => handleCardKeyDown(e, globalIdx)}
                  className={`pointer-events-auto group relative w-full aspect-square max-w-[260px] sm:max-w-[320px] rounded-3xl bg-surface border border-stroke hover:border-[#89AACC]/60 focus-visible:border-[#89AACC] overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105 focus-visible:scale-105 hover:rotate-0 focus-visible:rotate-0 cursor-pointer text-left transform-gpu ${item.rotation}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    decoding="async"
                    className={`w-full h-full object-cover transition-transform duration-700 ${
                      item.imageScaleClass ??
                      'group-hover:scale-110 group-focus-visible:scale-110'
                    }`}
                  />
                  <div className="absolute inset-0 halftone-overlay opacity-15 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/95 via-[#141414]/35 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
                    <span className="block text-[10px] font-mono uppercase tracking-wider text-[#89AACC] mb-1">
                      {item.category} · {item.year}
                    </span>
                    <h3 className="text-base sm:text-xl font-display italic text-[#F5F5F5] leading-tight">
                      {item.title}
                    </h3>
                    <span className="inline-block mt-2 text-[11px] text-[#A1A1AA] group-hover:text-[#F5F5F5] group-focus-visible:text-[#89AACC] transition-colors">
                      Press Enter or click to inspect ↗
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lightbox Modal on Card Click / Enter */}
      {lightboxItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxItem.title}
          className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
          onClick={() => setLightboxItem(null)}
        >
          <div
            data-lenis-prevent
            className="relative max-w-3xl w-full max-h-[90vh] overflow-y-auto bg-surface border border-stroke rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              autoFocus
              onClick={() => setLightboxItem(null)}
              aria-label="Close Lightbox"
              className="sticky top-4 float-right mr-4 mt-4 z-20 w-10 h-10 rounded-full bg-bg/90 border border-stroke text-text-primary hover:border-[#89AACC] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="aspect-[16/10] w-full bg-bg overflow-hidden clear-both">
              <img
                src={activePhotoUrl || lightboxItem.image}
                alt={lightboxItem.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>

            {lightboxItem.galleryImages && lightboxItem.galleryImages.length > 1 && (
              <div className="px-6 sm:px-8 pt-4 flex items-center gap-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-muted">
                  Event Photos:
                </span>
                <div className="flex items-center gap-2">
                  {lightboxItem.galleryImages.map((imgUrl, i) => {
                    const isSelected = (activePhotoUrl || lightboxItem.image) === imgUrl;
                    return (
                      <button
                        key={imgUrl}
                        type="button"
                        onClick={() => setActivePhotoUrl(imgUrl)}
                        aria-label={`View event photo ${i + 1}`}
                        className={`w-16 h-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#89AACC] opacity-100 scale-105'
                            : 'border-stroke opacity-60 hover:opacity-95'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt={`${lightboxItem.title} photo ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-[#89AACC] mb-1">
                    {lightboxItem.category} · {lightboxItem.year} ·{' '}
                    {lightboxItem.tech}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-display italic text-text-primary mb-2">
                    {lightboxItem.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted max-w-xl leading-relaxed">
                    {lightboxItem.description}
                  </p>
                </div>

                <a
                  href={lightboxItem.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-text-primary text-bg text-xs font-medium hover:opacity-90 transition-opacity shrink-0 whitespace-nowrap self-start"
                >
                  <span>
                    {lightboxItem.fullCaption ? 'View on LinkedIn' : 'View Related Work'}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {lightboxItem.fullCaption && lightboxItem.fullCaption.length > 0 && (
                <div className="pt-5 border-t border-stroke space-y-3">
                  <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#89AACC]">
                    LinkedIn Post Caption · {lightboxItem.title}
                  </div>
                  <div className="space-y-3 text-xs sm:text-sm text-text-primary/90 leading-relaxed">
                    {lightboxItem.fullCaption.map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
