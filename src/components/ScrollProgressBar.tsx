import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export const ScrollProgressBar: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[9995] h-[3px] bg-white/5 pointer-events-none"
    >
      <motion.div
        style={{
          scaleX,
          boxShadow: '0 0 10px rgba(137, 170, 204, 0.55)',
        }}
        className="h-full w-full accent-gradient origin-left"
      />
    </div>
  );
};

export default ScrollProgressBar;
