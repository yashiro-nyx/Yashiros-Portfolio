import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { flushSync } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { LoadingScreen } from './components/LoadingScreen';
import { HeroSection } from './components/HeroSection';
import { ProjectsSection } from './components/ProjectsSection';
import { TechStackSection } from './components/TechStackSection';
import { ServicesSection } from './components/ServicesSection';
import { AboutSection } from './components/AboutSection';
import { ExplorationsSection } from './components/ExplorationsSection';
import { CertificationsSection } from './components/CertificationsSection';
import { Footer } from './components/Footer';
import { ContactModal } from './components/ContactModal';
import { ProjectModal } from './components/ProjectModal';
import { ResumeModal } from './components/ResumeModal';
import { CommandPalette } from './components/CommandPalette';
import { CursorParticleTrail } from './components/CursorParticleTrail';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { SectionGlowDivider } from './components/SectionGlowDivider';
import { SmoothScrollProvider } from './components/SmoothScrollProvider';
import { KeyboardNavigationSystem } from './components/KeyboardNavigationSystem';
import { FloatingSoundscapeDock } from './components/AmbientAudioToggle';
import { BackToTopButton } from './components/BackToTopButton';
import { PROJECTS, ProjectItem } from './data/portfolioData';

/**
 * Isolated, GPU-only floating theme telemetry pill.
 * Manages its own visibility timer so showing/hiding it never re-renders <App />.
 */
const ThemeModePill = memo(function ThemeModePill({
  isDark,
}: {
  isDark: boolean;
}) {
  const isFirstRender = useRef(true);
  const [visibleKey, setVisibleKey] = useState<number | null>(null);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const id = Date.now();
    setVisibleKey(id);
    const timer = window.setTimeout(() => {
      setVisibleKey((prev) => (prev === id ? null : prev));
    }, 680);
    return () => window.clearTimeout(timer);
  }, [isDark]);

  return (
    <AnimatePresence>
      {visibleKey !== null && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[140] pointer-events-none flex justify-center">
          <motion.div
            key={visibleKey}
            initial={{ opacity: 0, y: -10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              backgroundColor: isDark ? '#0e1117' : '#ffffff',
              borderColor: isDark
                ? 'rgba(137, 170, 204, 0.42)'
                : 'rgba(53, 114, 176, 0.35)',
              color: isDark ? '#f5f5f5' : '#0d0d11',
            }}
            className="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 shadow-lg will-change-transform"
          >
            <span
              className="flex items-center justify-center w-4 h-4 rounded-full"
              style={{
                backgroundColor: isDark
                  ? 'rgba(137, 170, 204, 0.16)'
                  : 'rgba(53, 114, 176, 0.12)',
                color: isDark ? '#89AACC' : '#3572B0',
              }}
            >
              {isDark ? (
                <Moon className="w-2.5 h-2.5" />
              ) : (
                <Sun className="w-2.5 h-2.5" />
              )}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
              {isDark
                ? 'Obsidian Rift · Dark Mode'
                : 'Solar Ivory · Light Mode'}
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

const sectionContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.04,
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const dividerItemVariants = {
  hidden: {
    opacity: 0,
    y: 16,
    scale: 0.985,
    filter: 'blur(10px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
    transitionEnd: {
      filter: 'none',
      transform: 'none',
    },
  },
};

const sectionItemVariants = {
  hidden: {
    opacity: 0,
    y: 26,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.82,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
    transitionEnd: {
      filter: 'none',
      transform: 'none',
    },
  },
};

export function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(true);
  const cleanupTimerRef = useRef<number | null>(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(
    () => {
      if (typeof window === 'undefined') return null;
      const projectId = new URLSearchParams(window.location.search).get(
        'project'
      );
      if (!projectId) return null;
      return PROJECTS.find((p) => p.id === projectId) || null;
    }
  );

  const handleOpenContact = useCallback(() => setIsContactOpen(true), []);
  const handleCloseContact = useCallback(() => setIsContactOpen(false), []);
  const handleOpenResume = useCallback(() => setIsResumeOpen(true), []);
  const handleCloseResume = useCallback(() => setIsResumeOpen(false), []);
  const handleOpenCommand = useCallback(() => setIsCommandOpen(true), []);
  const handleCloseCommand = useCallback(() => setIsCommandOpen(false), []);
  const handleSelectProject = useCallback(
    (project: ProjectItem | null) => setSelectedProject(project),
    []
  );

  // Sync URL ?project=<id> and document title for SEO & direct case-study links
  useEffect(() => {
    const defaultTitle =
      "Yashiro's Portfolio — Jervin Paul C. Romualdo | Full-Stack Developer & UI/UX Designer";
    const url = new URL(window.location.href);

    if (selectedProject) {
      document.title = `${selectedProject.name} — Case Study | Yashiro's Portfolio`;
      if (url.searchParams.get('project') !== selectedProject.id) {
        url.searchParams.set('project', selectedProject.id);
        window.history.replaceState({}, '', url.toString());
      }
    } else {
      document.title = defaultTitle;
      if (url.searchParams.has('project')) {
        url.searchParams.delete('project');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [selectedProject]);

  // Handle browser back/forward navigation for ?project=<id>
  useEffect(() => {
    const handlePopState = () => {
      const projectId = new URLSearchParams(window.location.search).get(
        'project'
      );
      const found = projectId
        ? PROJECTS.find((p) => p.id === projectId) || null
        : null;
      setSelectedProject(found);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync `.dark` class on <html> for Tailwind v4 @custom-variant dark and CSS variables
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const handleToggleTheme = useCallback(
    (e?: React.MouseEvent<HTMLElement>) => {
      const nextDark = !isDark;
      const root = document.documentElement;

      // Determine exact button origin for the circular GPU clip-path reveal
      let x = typeof window !== 'undefined' ? window.innerWidth / 2 : 600;
      let y = 36;

      const targetEl =
        e?.currentTarget ||
        (typeof document !== 'undefined'
          ? (document.querySelector(
              '[data-theme-toggle="true"]'
            ) as HTMLElement | null)
          : null);

      if (targetEl && typeof targetEl.getBoundingClientRect === 'function') {
        const rect = targetEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
        }
      }

      const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 900;
      const maxRadius = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y));

      if (cleanupTimerRef.current) {
        window.clearTimeout(cleanupTimerRef.current);
      }

      const applyTheme = () => {
        if (nextDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        setIsDark(nextDark);
      };

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const docWithVT = document as Document & {
        startViewTransition?: (cb: () => void) => {
          ready: Promise<void>;
          finished: Promise<void>;
        };
      };

      if (
        !prefersReducedMotion &&
        typeof docWithVT.startViewTransition === 'function'
      ) {
        // Freeze per-element CSS transitions so the browser captures two static GPU textures in <1ms
        root.classList.add('vt-switching');

        try {
          const transition = docWithVT.startViewTransition(() => {
            flushSync(() => {
              applyTheme();
            });
          });

          transition.ready
            .then(() => {
              root.animate(
                {
                  clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${Math.ceil(maxRadius)}px at ${x}px ${y}px)`,
                  ],
                },
                {
                  duration: 520,
                  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
                  pseudoElement: '::view-transition-new(root)',
                }
              );
            })
            .catch(() => {
              // Ignore aborted view transitions if rapidly clicked
            });

          transition.finished
            .finally(() => {
              root.classList.remove('vt-switching');
            })
            .catch(() => {});
        } catch {
          root.classList.remove('vt-switching');
          applyTheme();
        }
      } else {
        root.classList.add('vt-fallback');
        applyTheme();
        cleanupTimerRef.current = window.setTimeout(() => {
          root.classList.remove('vt-fallback');
        }, 420);
      }
    },
    [isDark]
  );

  // Global Cmd+K / Ctrl+K shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isScrollPaused =
    isLoading ||
    isContactOpen ||
    isResumeOpen ||
    isCommandOpen ||
    !!selectedProject;

  return (
    <SmoothScrollProvider paused={isScrollPaused}>
      <div className="min-h-screen w-full bg-bg text-text-primary font-body relative overflow-x-clip">
        {/* Lightweight GPU-Composited Mode Indicator Pill */}
        <ThemeModePill isDark={isDark} />

        {/* Top Animated Scroll Progress Bar */}
        <ScrollProgressBar />

        {/* Global Keyboard Navigation System (Skip-to-Section bar, Focus HUD & Shortcuts) */}
        <KeyboardNavigationSystem
          onOpenCommand={handleOpenCommand}
          onOpenContact={handleOpenContact}
          onOpenResume={handleOpenResume}
          onToggleTheme={handleToggleTheme}
        />

        {/* Global Multi-Layer Ambient Soundscape Controller Dock */}
        <FloatingSoundscapeDock />

        {/* Floating Back to Top Action Button (appears after scrolling past Hero section) */}
        <BackToTopButton />

        {/* Subtle Desktop Custom Cursor Ring & Framer Motion Particle Trail */}
        <CursorParticleTrail />

        {/* Section 1: Loading Screen */}
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

        {/* Section 2: Hero + Floating Navbar */}
        <HeroSection
          onOpenContact={handleOpenContact}
          onOpenResume={handleOpenResume}
          onOpenCommand={handleOpenCommand}
          isDark={isDark}
          onToggleTheme={handleToggleTheme}
        />

        {/* Main Interactive Sections wrapped in Framer Motion whileInView staggered entrance containers */}
        <main className="relative">
          <div className="relative z-10">
            {/* 01 / Selected Works (3D Perspective Tilt Bento + Hover Index) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.08, margin: '-60px' }}
              variants={sectionContainerVariants}
            >
              <motion.div variants={dividerItemVariants}>
                <SectionGlowDivider label="01 · Works" />
              </motion.div>
              <motion.div variants={sectionItemVariants}>
                <ProjectsSection onSelectProject={handleSelectProject} />
              </motion.div>
            </motion.div>

            {/* 02 / Tech Stack & Interactive Ecosystem */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.08, margin: '-60px' }}
              variants={sectionContainerVariants}
            >
              <motion.div variants={dividerItemVariants}>
                <SectionGlowDivider label="02 · Stack" />
              </motion.div>
              <motion.div variants={sectionItemVariants}>
                <TechStackSection
                  onSelectProject={handleSelectProject}
                  isDark={isDark}
                />
              </motion.div>
            </motion.div>

            {/* 03 / Expertise & Capabilities (Tactile Editorial Accordion) */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.08, margin: '-60px' }}
              variants={sectionContainerVariants}
            >
              <motion.div variants={dividerItemVariants}>
                <SectionGlowDivider label="03 · Expertise" />
              </motion.div>
              <motion.div variants={sectionItemVariants}>
                <ServicesSection
                  onSelectProject={handleSelectProject}
                  onOpenContact={handleOpenContact}
                  isDark={isDark}
                />
              </motion.div>
            </motion.div>

            {/* 04 / Career Highlights, Experience & Interactive 3D Stage */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.08, margin: '-60px' }}
              variants={sectionContainerVariants}
            >
              <motion.div variants={dividerItemVariants}>
                <SectionGlowDivider label="04 · Highlights" />
              </motion.div>
              <motion.div variants={sectionItemVariants}>
                <AboutSection
                  onOpenResume={handleOpenResume}
                  onOpenContact={handleOpenContact}
                />
              </motion.div>
            </motion.div>

            {/* 05 / Tech Events Gallery (Sticky Center + Falling Starfield + 2-Column Parallax Gallery + Lightbox) */}
            <div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2, margin: '-40px' }}
                variants={dividerItemVariants}
              >
                <SectionGlowDivider label="05 · Gallery" />
              </motion.div>
              <ExplorationsSection />
            </div>

            {/* 06 / Verified Credentials Filmstrip & Endorsements */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.08, margin: '-60px' }}
              variants={sectionContainerVariants}
            >
              <motion.div variants={dividerItemVariants}>
                <SectionGlowDivider label="06 · Credentials" />
              </motion.div>
              <motion.div variants={sectionItemVariants}>
                <CertificationsSection isDark={isDark} />
              </motion.div>
            </motion.div>
          </div>
        </main>

        {/* 07 / Contact & Footer (Flipped HLS Video + GSAP Marquee) */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.08, margin: '-50px' }}
          variants={sectionContainerVariants}
        >
          <motion.div variants={dividerItemVariants}>
            <SectionGlowDivider label="07 · Connect" />
          </motion.div>
          <motion.div variants={sectionItemVariants}>
            <Footer
              onOpenContact={handleOpenContact}
              onOpenResume={handleOpenResume}
            />
          </motion.div>
        </motion.div>

        {/* Interactive Modals */}
        <ContactModal isOpen={isContactOpen} onClose={handleCloseContact} />

        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onOpenContact={handleOpenContact}
        />

        <ResumeModal isOpen={isResumeOpen} onClose={handleCloseResume} />

        <CommandPalette
          isOpen={isCommandOpen}
          onClose={handleCloseCommand}
          onOpenContact={handleOpenContact}
          onOpenResume={handleOpenResume}
          onSelectProject={handleSelectProject}
        />
      </div>
    </SmoothScrollProvider>
  );
}

export default App;
