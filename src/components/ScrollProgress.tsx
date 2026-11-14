import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export const ScrollProgress: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-white/5 pointer-events-none"
    >
      <motion.div
        className="h-full w-full origin-left"
        style={{
          scaleX,
          background:
            'linear-gradient(90deg, #646973 0%, #B600A8 40%, #7621B0 75%, #D7E2EA 100%)',
          boxShadow: '0 0 10px rgba(182, 0, 168, 0.5)',
          willChange: 'transform',
        }}
      />
    </div>
  );
};

export default ScrollProgress;
