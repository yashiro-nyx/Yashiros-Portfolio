import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Shared module-level scroll momentum state so 3D R3F & Galaxy canvases can read
// real-time Lenis spring velocity with zero React re-render overhead.
export const lenisScrollState = {
  scroll: 0,
  velocity: 0,
  progress: 0,
  direction: 1,
};

interface SmoothScrollContextValue {
  scrollTo: (
    target: string | number | HTMLElement,
    options?: { offset?: number; duration?: number }
  ) => void;
}

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  scrollTo: (target) => {
    if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'smooth' });
    } else if (target instanceof HTMLElement) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  },
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

interface SmoothScrollProviderProps {
  children: React.ReactNode;
  paused?: boolean;
}

/**
 * Spring-inspired quartic/exponential out easing curve for programmatic section jumps
 */
const springOutEasing = (t: number): number => {
  return 1 - Math.pow(1 - t, 4);
};

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({
  children,
  paused = false,
}) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.082, // Silky spring-damped momentum interpolation
      smoothWheel: true,
      wheelMultiplier: 1.02,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Keep GSAP ScrollTrigger 100% synchronized with Lenis virtual scroll
    const onLenisScroll = (e: Lenis) => {
      lenisScrollState.scroll = e.scroll;
      lenisScrollState.velocity = e.velocity;
      lenisScrollState.progress = e.progress;
      lenisScrollState.direction = e.direction;
      ScrollTrigger.update();
    };

    lenis.on('scroll', onLenisScroll);

    // Drive Lenis via GSAP's unified requestAnimationFrame ticker
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.off('scroll', onLenisScroll);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Pause/resume Lenis when modals or loading screens are active
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (paused) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [paused]);

  const scrollTo = useCallback(
    (
      target: string | number | HTMLElement,
      options?: { offset?: number; duration?: number }
    ) => {
      const lenis = lenisRef.current;
      const resolvedTarget =
        typeof target === 'string' && !target.startsWith('#')
          ? `#${target}`
          : target;

      if (lenis) {
        // Ensure Lenis is running before programmatic scroll
        lenis.start();
        lenis.scrollTo(resolvedTarget, {
          offset: options?.offset ?? 0,
          duration: options?.duration ?? 1.35,
          easing: springOutEasing,
        });
      } else if (typeof resolvedTarget === 'string') {
        const el = document.querySelector(resolvedTarget);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    []
  );

  return (
    <SmoothScrollContext.Provider value={{ scrollTo }}>
      {children}
    </SmoothScrollContext.Provider>
  );
};

export default SmoothScrollProvider;
