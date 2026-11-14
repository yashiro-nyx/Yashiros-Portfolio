import React from 'react';
import { motion, Transition, Variants } from 'framer-motion';

export const EASE_OUT_EXPO: [number, number, number, number] = [
  0.22, 1, 0.36, 1,
];

export const POP_IN_SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 290,
  damping: 22,
  mass: 0.78,
};

export const HOVER_SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 24,
  mass: 0.6,
};

export const createPopInTransition = (staggerDelay = 0): Transition => ({
  ...POP_IN_SPRING_CONFIG,
  delay: staggerDelay,
  opacity: {
    duration: 0.38,
    delay: staggerDelay,
    ease: EASE_OUT_EXPO,
  },
  filter: {
    duration: 0.44,
    delay: staggerDelay,
    ease: EASE_OUT_EXPO,
  },
});

export const createStaggerContainer = (
  staggerChildren = 0.09,
  delayChildren = 0.03
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren,
    },
  },
});

export const fadeInUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 22,
    scale: 0.985,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.68,
      ease: EASE_OUT_EXPO,
    },
    transitionEnd: {
      filter: 'none',
      transform: 'none',
    },
  },
};

export const fadeInUpSubtleVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    filter: 'blur(5px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.56,
      ease: EASE_OUT_EXPO,
    },
    transitionEnd: {
      filter: 'none',
      transform: 'none',
    },
  },
};

interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
  viewportMargin?: string;
  once?: boolean;
}

export const StaggerContainer: React.FC<StaggerContainerProps> = ({
  children,
  className = '',
  staggerDelay = 0.09,
  delayChildren = 0.03,
  viewportMargin = '-24px 0px -24px 0px',
  once = true,
}) => {
  return (
    <motion.div
      variants={createStaggerContainer(staggerDelay, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: 'some', margin: viewportMargin }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface FadeInUpItemProps {
  children: React.ReactNode;
  className?: string;
  subtle?: boolean;
  as?: 'div' | 'p' | 'h2' | 'h3' | 'h4' | 'span' | 'li' | 'blockquote';
}

export const FadeInUpItem: React.FC<FadeInUpItemProps> = ({
  children,
  className = '',
  subtle = false,
  as = 'div',
}) => {
  const Component = motion[as] as typeof motion.div;
  return (
    <Component
      variants={subtle ? fadeInUpSubtleVariants : fadeInUpVariants}
      className={className}
    >
      {children}
    </Component>
  );
};
