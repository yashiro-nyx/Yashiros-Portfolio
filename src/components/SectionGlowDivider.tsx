import React from 'react';
import { motion, Variants } from 'framer-motion';

interface SectionGlowDividerProps {
  label?: string;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

const dividerWrapperVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 12,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.85,
      ease: EASE_OUT_EXPO,
      staggerChildren: 0.08,
    },
    transitionEnd: {
      filter: 'none',
      transform: 'none',
    },
  },
};

export const SectionGlowDivider: React.FC<SectionGlowDividerProps> = ({
  label,
}) => {
  return (
    <motion.div
      aria-hidden="true"
      variants={dividerWrapperVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.35, margin: '-36px 0px -36px 0px' }}
      className="relative w-full py-4 flex items-center justify-center overflow-visible select-none pointer-events-none z-10"
    >
      <div className="relative w-full max-w-[1240px] mx-auto px-6 md:px-12 lg:px-16 flex items-center justify-center">
        {/* Soft Ambient Glow Aura (Expands & De-blurs on Scroll) */}
        <motion.div
          initial={{ scaleX: 0.15, opacity: 0, filter: 'blur(16px)' }}
          whileInView={{ scaleX: 1, opacity: 0.8, filter: 'blur(8px)' }}
          viewport={{ once: false, margin: '-36px' }}
          transition={{ duration: 1.15, ease: EASE_OUT_EXPO }}
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(78, 133, 191, 0.45) 25%, rgba(137, 170, 204, 0.88) 50%, rgba(78, 133, 191, 0.45) 75%, transparent 100%)',
          }}
          className="absolute inset-x-6 h-[6px] origin-center"
        />

        {/* Crisp Tapered Core Line with Blur-Reveal */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0, filter: 'blur(8px)' }}
          whileInView={{ scaleX: 1, opacity: 1, filter: 'blur(0px)' }}
          viewport={{ once: false, margin: '-36px' }}
          transition={{ duration: 0.95, ease: EASE_OUT_EXPO }}
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(137, 170, 204, 0.25) 15%, #89AACC 50%, rgba(78, 133, 191, 0.25) 85%, transparent 100%)',
            boxShadow: '0 0 12px rgba(137, 170, 204, 0.45)',
          }}
          className="relative w-full h-px origin-center overflow-hidden"
        >
          {/* Subtle Traveling Shimmer Pulse */}
          <motion.div
            animate={{ x: ['-100%', '200%'] }}
            transition={{
              duration: 3.8,
              ease: 'easeInOut',
              repeat: Infinity,
              repeatDelay: 1.2,
            }}
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.9) 50%, transparent 100%)',
            }}
            className="w-1/3 h-full"
          />
        </motion.div>

        {/* Optional Center Luminous Node / Label with Blur-Reveal */}
        {label ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.86, y: 6, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, margin: '-36px' }}
            transition={{
              duration: 0.72,
              delay: 0.14,
              ease: EASE_OUT_EXPO,
            }}
            className="relative z-10 inline-flex items-center gap-2 px-3.5 py-0.5 rounded-full bg-bg/95 backdrop-blur-md border border-[#89AACC]/30 text-[10px] font-mono uppercase tracking-[0.28em] text-[#89AACC] shadow-[0_0_18px_rgba(137,170,204,0.22)]"
          >
            <span className="w-1 h-1 rounded-full bg-[#89AACC] shadow-[0_0_6px_#89AACC]" />
            <span>{label}</span>
            <span className="w-1 h-1 rounded-full bg-[#89AACC] shadow-[0_0_6px_#89AACC]" />
          </motion.span>
        ) : (
          <motion.span
            initial={{ opacity: 0, scale: 0, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            viewport={{ once: false, margin: '-36px' }}
            transition={{ duration: 0.55, delay: 0.2, ease: EASE_OUT_EXPO }}
            className="relative z-10 w-1.5 h-1.5 rounded-full bg-[#DCEBFF] shadow-[0_0_10px_#89AACC]"
          />
        )}
      </div>
    </motion.div>
  );
};

export default SectionGlowDivider;

