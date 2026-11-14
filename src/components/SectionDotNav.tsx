import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavSection {
  id: string;
  label: string;
}

const NAV_SECTIONS: NavSection[] = [
  { id: 'hero', label: 'Hero' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Capabilities' },
  { id: 'projects', label: 'Projects' },
  { id: 'code-lab', label: 'Code Lab' },
  { id: 'certifications', label: 'Certs' },
];

export const SectionDotNav: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const viewportCenter = window.scrollY + window.innerHeight * 0.4;

      if (window.scrollY < window.innerHeight * 0.5) {
        setActiveSection('hero');
        return;
      }

      let currentId = 'hero';
      for (const section of NAV_SECTIONS) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          const absTop = rect.top + window.scrollY;
          if (viewportCenter >= absTop) {
            currentId = section.id;
          }
        }
      }
      setActiveSection(currentId);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    if (id === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-3 sm:right-5 md:right-7 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-3.5 rounded-full border border-[#D7E2EA]/25 bg-[#0C0C0C]/80 backdrop-blur-md px-2 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.45)]"
    >
      {NAV_SECTIONS.map((section) => {
        const isActive = activeSection === section.id;
        const isHovered = hoveredSection === section.id;

        return (
          <div key={section.id} className="relative flex items-center">
            {/* Tooltip Label on Hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: 8, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 8, scale: 0.95 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="pointer-events-none absolute right-full mr-3 rounded-lg border border-[#D7E2EA]/25 bg-[#0C0C0C]/95 px-2.5 py-1 text-[11px] font-medium uppercase tracking-widest text-[#D7E2EA] whitespace-nowrap shadow-lg"
                >
                  {section.label}
                </motion.span>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => scrollToSection(section.id)}
              onMouseEnter={() => setHoveredSection(section.id)}
              onMouseLeave={() => setHoveredSection(null)}
              onFocus={() => setHoveredSection(section.id)}
              onBlur={() => setHoveredSection(null)}
              aria-label={`Jump to ${section.label} section`}
              aria-current={isActive ? 'true' : undefined}
              className="relative w-5 h-5 flex items-center justify-center rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D7E2EA]"
            >
              {isActive && (
                <motion.span
                  layoutId="activeSectionDotRing"
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 26,
                  }}
                  className="absolute inset-0 rounded-full border border-[#D7E2EA]"
                  style={{
                    boxShadow: '0 0 10px rgba(182, 0, 168, 0.55)',
                  }}
                />
              )}

              <span
                className={`rounded-full transition-all duration-200 ${
                  isActive
                    ? 'w-2 h-2 bg-[#D7E2EA]'
                    : 'w-1.5 h-1.5 bg-[#D7E2EA]/40 hover:bg-[#D7E2EA]/80'
                }`}
              />
            </button>
          </div>
        );
      })}
    </nav>
  );
};

export default SectionDotNav;
