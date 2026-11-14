import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export const ScrollToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the hero section (100vh)
      const heroThreshold = window.innerHeight * 0.9;
      setIsVisible(window.scrollY > heroThreshold);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-[#D7E2EA]/80 bg-[#0C0C0C]/85 backdrop-blur-md text-[#D7E2EA] flex items-center justify-center shadow-[0_8px_24px_rgba(0,0,0,0.5)] hover:bg-[#D7E2EA] hover:text-[#0C0C0C] hover:scale-105 active:scale-95 transition-colors duration-200 cursor-pointer group"
        >
          <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default ScrollToTopButton;
