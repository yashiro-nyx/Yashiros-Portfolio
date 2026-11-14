import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

const MARQUEE_IMAGES = [
  'https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif',
  'https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif',
  'https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif',
  'https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif',
  'https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif',
  'https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif',
  'https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif',
  'https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif',
  'https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif',
  'https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif',
  'https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif',
  'https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif',
  'https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif',
  'https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif',
  'https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif',
  'https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif',
  'https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif',
  'https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif',
  'https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif',
];

const ROW_1_BASE = MARQUEE_IMAGES.slice(0, 11);
const ROW_2_BASE = MARQUEE_IMAGES.slice(11, 21);

const ROW_1_IMAGES = [...ROW_1_BASE, ...ROW_1_BASE, ...ROW_1_BASE];
const ROW_2_IMAGES = [...ROW_2_BASE, ...ROW_2_BASE, ...ROW_2_BASE];

export const MarqueeSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  // Normalized mouse position [-0.5, 0.5] relative to viewport
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { stiffness: 110, damping: 26, mass: 0.6 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Differential row parallax offsets for depth separation
  const row1ParallaxX = useTransform(smoothMouseX, [-0.5, 0.5], [-18, 18]);
  const row1ParallaxY = useTransform(smoothMouseY, [-0.5, 0.5], [-9, 9]);

  const row2ParallaxX = useTransform(smoothMouseX, [-0.5, 0.5], [22, -22]);
  const row2ParallaxY = useTransform(smoothMouseY, [-0.5, 0.5], [10, -10]);

  // Inner image window pan for subtle 3D depth inside each rounded frame
  const imagePanX = useTransform(smoothMouseX, [-0.5, 0.5], [-8, 8]);
  const imagePanY = useTransform(smoothMouseY, [-0.5, 0.5], [-6, 6]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const sectionTop = sectionRef.current.offsetTop;
      const calculatedOffset =
        (window.scrollY - sectionTop + window.innerHeight) * 0.3;
      setOffset(calculatedOffset);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const xNorm = e.clientX / window.innerWidth - 0.5;
      const yNorm = e.clientY / window.innerHeight - 0.5;
      mouseX.set(xNorm);
      mouseY.set(yNorm);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#0C0C0C] pt-24 sm:pt-32 md:pt-40 pb-10 overflow-hidden"
    >
      <div className="flex flex-col gap-3">
        {/* Row 1: Moves RIGHT on scroll + foreground mouse parallax */}
        <motion.div
          style={{
            x: row1ParallaxX,
            y: row1ParallaxY,
            willChange: 'transform',
          }}
        >
          <div
            className="flex gap-3 justify-center"
            style={{
              transform: `translateX(${offset - 200}px)`,
              willChange: 'transform',
            }}
          >
            {ROW_1_IMAGES.map((src, index) => (
              <div
                key={`row1-${index}`}
                className="w-[420px] h-[270px] shrink-0 rounded-2xl overflow-hidden bg-[#16181D]"
              >
                <motion.img
                  src={src}
                  alt={`Motion showcase ${index + 1}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  style={{
                    x: imagePanX,
                    y: imagePanY,
                    scale: 1.06,
                  }}
                  className="w-[420px] h-[270px] rounded-2xl object-cover block will-change-transform"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Row 2: Moves LEFT on scroll + counter-plane mouse parallax */}
        <motion.div
          style={{
            x: row2ParallaxX,
            y: row2ParallaxY,
            willChange: 'transform',
          }}
        >
          <div
            className="flex gap-3 justify-center"
            style={{
              transform: `translateX(${-(offset - 200)}px)`,
              willChange: 'transform',
            }}
          >
            {ROW_2_IMAGES.map((src, index) => (
              <div
                key={`row2-${index}`}
                className="w-[420px] h-[270px] shrink-0 rounded-2xl overflow-hidden bg-[#16181D]"
              >
                <motion.img
                  src={src}
                  alt={`Motion showcase ${index + 12}`}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  style={{
                    x: imagePanX,
                    y: imagePanY,
                    scale: 1.06,
                  }}
                  className="w-[420px] h-[270px] rounded-2xl object-cover block will-change-transform"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MarqueeSection;
