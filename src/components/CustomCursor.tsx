import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

type CursorVariant = 'default' | 'interactive' | 'project';

export const CustomCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [variant, setVariant] = useState<CursorVariant>('default');

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Outer trailing ring with smooth spring lag
  const ringX = useSpring(mouseX, {
    stiffness: 180,
    damping: 24,
    mass: 0.6,
  });
  const ringY = useSpring(mouseY, {
    stiffness: 180,
    damping: 24,
    mass: 0.6,
  });

  // Inner dot with snappy response
  const dotX = useSpring(mouseX, {
    stiffness: 650,
    damping: 35,
    mass: 0.2,
  });
  const dotY = useSpring(mouseY, {
    stiffness: 650,
    damping: 35,
    mass: 0.2,
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)');
    if (mediaQuery.matches) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const projectEl = target.closest('[data-cursor="project"]');
      const interactiveEl = target.closest(
        'a, button, input, textarea, select, [role="button"], [data-cursor="interactive"]'
      );

      if (projectEl && !interactiveEl) {
        setVariant('project');
      } else if (interactiveEl) {
        setVariant('interactive');
      } else {
        setVariant('default');
      }
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, mouseX, mouseY]);

  if (isTouchDevice) return null;

  const ringSize =
    variant === 'project' ? 84 : variant === 'interactive' ? 56 : 34;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      {/* Smooth lagging outer circle */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          willChange: 'transform',
        }}
        animate={{
          width: ringSize,
          height: ringSize,
          scale: isPressed ? 0.86 : 1,
          opacity: isVisible ? 1 : 0,
          backgroundColor:
            variant === 'project'
              ? 'rgba(182, 0, 168, 0.28)'
              : variant === 'interactive'
                ? 'rgba(215, 226, 234, 0.16)'
                : 'rgba(215, 226, 234, 0)',
          borderColor:
            variant === 'project'
              ? 'rgba(255, 255, 255, 0.9)'
              : variant === 'interactive'
                ? 'rgba(215, 226, 234, 0.95)'
                : 'rgba(215, 226, 234, 0.55)',
        }}
        transition={{
          width: { type: 'spring', stiffness: 260, damping: 24 },
          height: { type: 'spring', stiffness: 260, damping: 24 },
          scale: { duration: 0.15 },
          opacity: { duration: 0.2 },
          backgroundColor: { duration: 0.2 },
          borderColor: { duration: 0.2 },
        }}
        className={`fixed top-0 left-0 rounded-full border flex items-center justify-center ${
          variant === 'project'
            ? 'backdrop-blur-md shadow-[0_0_24px_rgba(182,0,168,0.45)]'
            : 'mix-blend-difference'
        }`}
      >
        <motion.span
          initial={false}
          animate={{
            opacity: variant === 'project' ? 1 : 0,
            scale: variant === 'project' ? 1 : 0.6,
          }}
          transition={{ duration: 0.18 }}
          className="text-[11px] font-semibold uppercase tracking-widest text-white select-none"
        >
          View
        </motion.span>
      </motion.div>

      {/* Precision inner dot */}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          willChange: 'transform',
        }}
        animate={{
          width: variant === 'default' ? 6 : 0,
          height: variant === 'default' ? 6 : 0,
          opacity: isVisible && variant === 'default' ? 1 : 0,
        }}
        transition={{ duration: 0.15 }}
        className="fixed top-0 left-0 rounded-full bg-[#D7E2EA] mix-blend-difference"
      />
    </div>
  );
};

export default CustomCursor;
