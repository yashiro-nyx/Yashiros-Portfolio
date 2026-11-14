import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useSmoothScroll } from './SmoothScrollProvider';
import { Magnetic } from './Magnetic';

export const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const checkScroll = () => {
      const heroSection = document.getElementById('home');
      const firstSectionThreshold = heroSection
        ? heroSection.offsetTop + heroSection.offsetHeight - 100
        : window.innerHeight * 0.9;

      const currentY = window.scrollY;
      setIsVisible(currentY > firstSectionThreshold);

      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        setScrollPercent(Math.min(1, Math.max(0, currentY / maxScroll)));
      }
    };

    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, []);

  const handleBackToTop = () => {
    scrollTo('#home', { offset: 0, duration: 1.35 });
    const homeEl = document.getElementById('home');
    if (homeEl) {
      homeEl.focus({ preventScroll: true });
    }
  };

  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - scrollPercent);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="back-to-top-fab"
          initial={{ opacity: 0, y: 24, scale: 0.82, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 24, scale: 0.82, filter: 'blur(6px)' }}
          transition={{
            duration: 0.42,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed bottom-16 right-4 z-40 pointer-events-auto"
        >
          <Magnetic strength={0.35}>
            <motion.button
              type="button"
              onClick={handleBackToTop}
              whileHover={{ y: -3, scale: 1.06 }}
              whileTap={{ scale: 0.93 }}
              aria-label="Scroll back to top"
              title="Back to top"
              className="group relative w-12 h-12 rounded-full bg-surface/90 backdrop-blur-xl border border-stroke hover:border-[#89AACC]/70 shadow-xl shadow-black/25 flex items-center justify-center text-text-primary transition-colors cursor-pointer"
            >
              {/* Subtle Circular Scroll Progress Ring */}
              <svg
                aria-hidden="true"
                className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
                viewBox="0 0 48 48"
              >
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-stroke/40"
                />
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  fill="none"
                  stroke="#89AACC"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-[stroke-dashoffset] duration-150 ease-out"
                />
              </svg>

              <ArrowUp className="w-4 h-4 text-text-primary group-hover:text-[#89AACC] group-hover:-translate-y-0.5 transition-all duration-300" />
            </motion.button>
          </Magnetic>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BackToTopButton;
