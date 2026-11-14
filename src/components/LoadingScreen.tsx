import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

const ROTATING_WORDS = ['Design', 'Create', 'Inspire'];

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [count, setCount] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const wordInterval = window.setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 900);

    return () => window.clearInterval(wordInterval);
  }, []);

  useEffect(() => {
    let rafId: number;
    let timeoutId: number;
    const duration = 2700;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth cubic ease-out curve for the counter
      const eased = 1 - Math.pow(1 - progress, 2.2);
      const nextCount = Math.round(eased * 100);
      setCount(nextCount);

      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setCount(100);
        timeoutId = window.setTimeout(() => {
          setExiting(true);
          window.setTimeout(onComplete, 450);
        }, 400);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: exiting ? 0 : 1, y: exiting ? -24 : 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[9999] bg-bg flex flex-col justify-between p-6 md:p-12 select-none overflow-hidden"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex items-center gap-3"
        >
          <span className="text-xs text-muted uppercase tracking-[0.3em]">
            Portfolio
          </span>
          <span className="text-xs text-stroke">·</span>
          <span className="text-xs text-text-primary/70 font-mono">
            Jervin Paul C. Romualdo
          </span>
        </motion.div>

        <motion.button
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          onClick={onComplete}
          className="text-xs text-muted hover:text-text-primary uppercase tracking-[0.2em] transition-colors cursor-pointer"
        >
          Skip ↗
        </motion.button>
      </div>

      {/* Center Rotating Words */}
      <div className="flex-1 flex items-center justify-center relative">
        <AnimatePresence mode="wait">
          <motion.span
            key={ROTATING_WORDS[wordIndex]}
            initial={{ y: 20, opacity: 0, filter: 'blur(6px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: -20, opacity: 0, filter: 'blur(6px)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-4xl md:text-6xl lg:text-7xl font-display italic text-text-primary/80 tracking-tight"
          >
            {ROTATING_WORDS[wordIndex]}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Bottom Counter & Progress Bar */}
      <div className="relative">
        <div className="flex items-end justify-between pb-6">
          <div className="hidden sm:block text-xs text-muted uppercase tracking-[0.25em]">
            Loading Interactive Experience
          </div>
          <div className="ml-auto text-6xl md:text-8xl lg:text-9xl font-display text-text-primary tabular-nums leading-none tracking-tight">
            {String(count).padStart(3, '0')}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-[3px] bg-stroke/50 overflow-hidden rounded-full">
          <div
            className="h-full w-full accent-gradient origin-left transition-transform duration-75 ease-out"
            style={{
              transform: `scaleX(${count / 100})`,
              boxShadow: '0 0 8px rgba(137, 170, 204, 0.35)',
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};
