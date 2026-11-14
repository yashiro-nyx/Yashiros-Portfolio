import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion';

interface TrailParticle {
  id: number;
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  size: number;
  color: string;
}

const TRAIL_COLORS = ['#FFFFFF', '#DCEBFF', '#89AACC', '#4E85BF'];

export const CursorParticleTrail: React.FC = () => {
  const [particles, setParticles] = useState<TrailParticle[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const lastPosRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const idCounterRef = useRef<number>(0);

  // Framer Motion spring values for the custom cursor ring & core dot
  const rawX = useMotionValue(-100);
  const rawY = useMotionValue(-100);

  const ringX = useSpring(rawX, { stiffness: 260, damping: 24, mass: 0.45 });
  const ringY = useSpring(rawY, { stiffness: 260, damping: 24, mass: 0.45 });

  const dotX = useSpring(rawX, { stiffness: 650, damping: 32, mass: 0.2 });
  const dotY = useSpring(rawY, { stiffness: 650, damping: 32, mass: 0.2 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      rawX.set(clientX);
      rawY.set(clientY);

      if (!isVisible) {
        setIsVisible(true);
      }

      const dx = clientX - lastPosRef.current.x;
      const dy = clientY - lastPosRef.current.y;
      const dist = Math.hypot(dx, dy);

      // Spawn a subtle trail particle when cursor travels at least 14px
      if (dist >= 14) {
        lastPosRef.current = { x: clientX, y: clientY };
        const id = ++idCounterRef.current;

        const angle = Math.atan2(dy, dx) + Math.PI + (Math.random() - 0.5) * 1.1;
        const driftDist = 10 + Math.random() * 16;

        const newParticle: TrailParticle = {
          id,
          x: clientX + (Math.random() - 0.5) * 6,
          y: clientY + (Math.random() - 0.5) * 6,
          driftX: Math.cos(angle) * driftDist,
          driftY: Math.sin(angle) * driftDist,
          size: Math.random() * 3.5 + 2,
          color: TRAIL_COLORS[id % TRAIL_COLORS.length],
        };

        setParticles((prev) => [...prev.slice(-18), newParticle]);

        window.setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== id));
        }, 620);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible, rawX, rawY]);

  return (
    <div className="hidden lg:block fixed inset-0 pointer-events-none z-[9990] overflow-hidden select-none">
      {/* Subtle Framer Motion Particle Trail */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{
              opacity: 0.75,
              scale: 1,
              x: p.x - p.size / 2,
              y: p.y - p.size / 2,
            }}
            animate={{
              opacity: 0,
              scale: 0.15,
              x: p.x + p.driftX - p.size / 2,
              y: p.y + p.driftY - p.size / 2,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 8px ${p.color}`,
            }}
            className="fixed top-0 left-0 rounded-full mix-blend-screen"
          />
        ))}
      </AnimatePresence>

      {/* Spring-Following Outer Cursor Ring */}
      <motion.div
        style={{
          x: ringX,
          y: ringY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 1 : 0,
        }}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#89AACC]/45 mix-blend-screen transition-opacity duration-300"
      />

      {/* Crisp Spring-Following Center Dot */}
      <motion.div
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          opacity: isVisible ? 0.9 : 0,
        }}
        className="fixed top-0 left-0 w-1.5 h-1.5 rounded-full bg-[#89AACC] shadow-[0_0_8px_#89AACC] mix-blend-screen transition-opacity duration-300"
      />
    </div>
  );
};

export default CursorParticleTrail;
