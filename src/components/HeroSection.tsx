import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { LetterGlitch } from './LetterGlitch';
import { HeroPortraitReveal } from './HeroPortraitReveal';
import { Magnetic } from './Magnetic';
import { useSmoothScroll } from './SmoothScrollProvider';
import { PROFILE_DATA } from '../data/portfolioData';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  onOpenContact: () => void;
  onOpenResume: () => void;
  onOpenCommand: () => void;
  isDark: boolean;
  onToggleTheme: (e?: React.MouseEvent<HTMLElement>) => void;
}

const ROLES = PROFILE_DATA.roles;

const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'work', label: 'Work', href: '#work' },
  { id: 'tech-stack', label: 'Tech Stack', href: '#tech-stack' },
  { id: 'expertise', label: 'Expertise', href: '#expertise' },
  { id: 'about', label: 'Highlights', href: '#about' },
  { id: 'explorations', label: 'Gallery', href: '#explorations' },
  { id: 'credentials', label: 'Credentials', href: '#credentials' },
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenContact,
  onOpenResume,
  onOpenCommand,
  isDark,
  onToggleTheme,
}) => {
  const [roleIndex, setRoleIndex] = useState(0);
  const [activeNav, setActiveNav] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollTo } = useSmoothScroll();

  // Cycle roles every 2s
  useEffect(() => {
    const interval = window.setInterval(() => {
      setRoleIndex((prev) => (prev + 1) % ROLES.length);
    }, 2000);
    return () => window.clearInterval(interval);
  }, []);

  // Track scrollY for navbar shadow and active section
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 100);

      const sections = [
        'home',
        'work',
        'tech-stack',
        'expertise',
        'about',
        'explorations',
        'credentials',
        'contact',
      ];
      const currentPos = window.scrollY + 280;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (currentPos >= top && currentPos < top + height) {
            setActiveNav(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // GSAP Entrance + Scroll Pass-Through into Next Section
  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.name-reveal',
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.2, delay: 0.1 }
      ).fromTo(
        '.blur-in',
        { opacity: 0, filter: 'blur(10px)', y: 20 },
        {
          opacity: 1,
          filter: 'blur(0px)',
          y: 0,
          duration: 1,
          stagger: 0.1,
        },
        0.3
      );

      // Smooth Scroll Pass-Through Transition into 01 / Selected Works
      const passTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.45,
        },
      });

      passTl
        .to(
          '.hero-glitch-stage',
          {
            yPercent: 20,
            scale: 1.06,
            opacity: 0.18,
            ease: 'none',
          },
          0
        )
        .to(
          '.hero-center-stage',
          {
            y: -76,
            scale: 0.94,
            opacity: 0,
            filter: 'blur(6px)',
            ease: 'power1.in',
          },
          0
        )
        .fromTo(
          '.hero-passthrough-beam',
          { scaleX: 0.15, opacity: 0 },
          { scaleX: 1, opacity: 1, ease: 'power2.out' },
          0.15
        );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navLinkRefs = useRef<Array<HTMLAnchorElement | null>>([]);

  // Close mobile menu on Escape or viewport resize to desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [mobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setActiveNav(id);
    setMobileMenuOpen(false);
    scrollTo(`#${id}`, { offset: 0, duration: 1.35 });

    window.setTimeout(() => {
      const sectionEl = document.getElementById(id);
      if (!sectionEl) return;
      const firstInteractive = sectionEl.querySelector<HTMLElement>(
        'button:not([disabled]), [role="button"][tabindex="0"], a[href], input:not([disabled])'
      );
      if (firstInteractive && id !== 'home') {
        firstInteractive.focus({ preventScroll: true });
      } else {
        sectionEl.focus({ preventScroll: true });
      }
    }, 350);
  };

  const activeNavItem =
    NAV_ITEMS.find((item) => item.id === activeNav) || NAV_ITEMS[0];

  return (
    <>
      {/* Mobile Menu Backdrop Scrim */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-nav-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Floating Navbar (fixed, floats at top center) */}
      <header className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-3.5 sm:pt-4 lg:pt-6 px-3.5 sm:px-4 pointer-events-none">
        <nav
          aria-label="Primary Navigation"
          className={`pointer-events-auto flex items-center justify-between lg:justify-start w-full max-w-[460px] lg:w-auto lg:max-w-full rounded-full backdrop-blur-md border border-stroke bg-surface/95 px-2.5 py-2 lg:px-2 lg:py-2 transition-all duration-300 ${
            scrolled || mobileMenuOpen
              ? 'shadow-lg shadow-black/20 dark:shadow-black/50'
              : ''
          }`}
        >
          {/* Left Group: Logo + Mobile Active Section Indicator */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* 1. Logo: 9x9 circle with accent gradient border and orbital star emblem */}
            <Magnetic strength={0.35} className="shrink-0">
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('home');
                }}
                onMouseEnter={() => setLogoHovered(true)}
                onMouseLeave={() => setLogoHovered(false)}
                title="Jervin Paul C. Romualdo — Home"
                aria-label="Jervin Paul C. Romualdo Home"
                className={`w-9 h-9 rounded-full p-[1.5px] transition-transform duration-300 hover:scale-110 flex items-center justify-center shrink-0 ${
                  logoHovered ? 'accent-gradient-reverse' : 'accent-gradient'
                }`}
              >
                <span className="w-full h-full rounded-full bg-[#0a0a0c] flex items-center justify-center overflow-hidden p-1">
                  <img
                    src="/assets/aistudio/Orbital_Rift_Star_Emblem_85bf5aba.png"
                    alt="Jervin Paul emblem"
                    className="w-full h-full object-contain scale-125 pointer-events-none select-none"
                  />
                </span>
              </a>
            </Magnetic>

            {/* Mobile/Tablet Brand & Active Section Pill */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex lg:hidden items-center gap-2 text-left py-1 px-1 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <span className="text-xs font-medium text-text-primary tracking-tight">
                Yashiro
              </span>
              <span className="text-stroke">·</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#89AACC]">
                {activeNavItem.label}
              </span>
            </button>
          </div>

          {/* 2. Desktop Divider */}
          <div className="w-px h-5 bg-stroke mx-1 hidden lg:block shrink-0" />

          {/* 3. Desktop Nav Links (hidden on mobile/tablet, shown on lg+) */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map((item, idx) => {
              const isActive = activeNav === item.id;
              return (
                <Magnetic key={item.id} strength={0.28} className="shrink-0">
                  <a
                    ref={(el) => {
                      navLinkRefs.current[idx] = el;
                    }}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === ' ') {
                        e.preventDefault();
                        scrollToSection(item.id);
                      } else if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        const nextIdx = (idx + 1) % NAV_ITEMS.length;
                        navLinkRefs.current[nextIdx]?.focus();
                      } else if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        const prevIdx =
                          (idx - 1 + NAV_ITEMS.length) % NAV_ITEMS.length;
                        navLinkRefs.current[prevIdx]?.focus();
                      }
                    }}
                    className={`block text-xs sm:text-sm rounded-full px-3.5 py-2 transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'text-text-primary bg-stroke/60 font-medium'
                        : 'text-muted hover:text-text-primary hover:bg-stroke/40'
                    }`}
                  >
                    {item.label}
                  </a>
                </Magnetic>
              );
            })}

            <Magnetic strength={0.28} className="shrink-0">
              <button
                type="button"
                onClick={onOpenResume}
                className="text-xs sm:text-sm rounded-full px-3.5 py-2 text-muted hover:text-text-primary hover:bg-stroke/40 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Resume
              </button>
            </Magnetic>
          </div>

          {/* 4. Desktop Divider */}
          <div className="w-px h-5 bg-stroke mx-1 hidden lg:block shrink-0" />

          {/* Right Controls: Theme Toggle + Desktop "Say hi" + Mobile Hamburger Button */}
          <div className="flex items-center gap-1.5 lg:gap-0 shrink-0">
            {/* 5. Theme Toggle Button */}
            <Magnetic strength={0.35} className="shrink-0 lg:mr-1">
              <motion.button
                type="button"
                data-theme-toggle="true"
                onClick={(e) => onToggleTheme(e)}
                whileTap={{ scale: 0.92 }}
                aria-label={
                  isDark
                    ? 'Switch to high-contrast light theme'
                    : 'Switch to default dark theme'
                }
                title={
                  isDark
                    ? 'Switch to High-Contrast Light Theme'
                    : 'Switch to Default Dark Theme'
                }
                className="group relative inline-flex items-center gap-1.5 rounded-full border border-stroke bg-bg/90 hover:border-[#89AACC]/60 px-2.5 py-1.5 text-xs text-text-primary transition-colors cursor-pointer shrink-0 overflow-hidden"
              >
                {/* Animated sliding track indicator */}
                <motion.span
                  layout
                  transition={{
                    type: 'spring',
                    stiffness: 420,
                    damping: 28,
                  }}
                  className="relative w-5 h-5 rounded-full flex items-center justify-center bg-surface border border-stroke shadow-xs"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isDark ? (
                      <motion.span
                        key="dark-moon"
                        initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 22,
                        }}
                        className="flex items-center justify-center text-[#89AACC]"
                      >
                        <Moon className="w-3.5 h-3.5" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="light-sun"
                        initial={{ rotate: 90, scale: 0.4, opacity: 0 }}
                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                        exit={{ rotate: -90, scale: 0.4, opacity: 0 }}
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 22,
                        }}
                        className="flex items-center justify-center text-[#3572B0]"
                      >
                        <Sun className="w-3.5 h-3.5" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.span>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={isDark ? 'label-dark' : 'label-light'}
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -8, opacity: 0 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="hidden xl:inline-block font-mono text-[10px] uppercase tracking-wider text-muted group-hover:text-text-primary pr-1"
                  >
                    {isDark ? 'Dark' : 'Light'}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </Magnetic>

            {/* 6. Desktop "Say hi" button with accent gradient border behind on hover */}
            <Magnetic strength={0.35} className="hidden lg:inline-block shrink-0">
              <button
                type="button"
                onClick={onOpenContact}
                className="group relative text-xs sm:text-sm rounded-full cursor-pointer whitespace-nowrap shrink-0"
              >
                <span
                  className="absolute -inset-[2px] rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  aria-hidden="true"
                />
                <span className="relative inline-flex items-center gap-1 bg-surface rounded-full backdrop-blur-md px-4 py-2 text-text-primary border border-stroke group-hover:border-transparent transition-colors">
                  <span>Say hi</span>
                  <span className="text-[#89AACC] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                    ↗
                  </span>
                </span>
              </button>
            </Magnetic>

            {/* 7. Mobile/Tablet Hamburger Menu Trigger Button (< lg) */}
            <motion.button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              whileTap={{ scale: 0.92 }}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              aria-label={
                mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
              }
              className={`lg:hidden relative inline-flex items-center gap-2 h-9 px-3 rounded-full border transition-colors cursor-pointer shrink-0 ${
                mobileMenuOpen
                  ? 'border-[#89AACC] bg-bg text-text-primary shadow-sm shadow-[#89AACC]/20'
                  : 'border-stroke bg-bg/90 text-text-primary hover:border-[#89AACC]/60'
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                {mobileMenuOpen ? 'Close' : 'Menu'}
              </span>
              <span className="relative w-4 h-3 flex flex-col justify-between items-center">
                <motion.span
                  animate={
                    mobileMenuOpen
                      ? { rotate: 45, y: 5.25 }
                      : { rotate: 0, y: 0 }
                  }
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                  className="w-4 h-[1.5px] rounded-full bg-current origin-center"
                />
                <motion.span
                  animate={
                    mobileMenuOpen
                      ? { opacity: 0, scaleX: 0.3 }
                      : { opacity: 1, scaleX: 1 }
                  }
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className="w-3 h-[1.5px] rounded-full bg-[#89AACC] self-end"
                />
                <motion.span
                  animate={
                    mobileMenuOpen
                      ? { rotate: -45, y: -5.25 }
                      : { rotate: 0, y: 0 }
                  }
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                  className="w-4 h-[1.5px] rounded-full bg-current origin-center"
                />
              </span>
            </motion.button>
          </div>
        </nav>

        {/* Mobile Hamburger Dropdown Drawer (< lg) */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-navigation-drawer"
              role="dialog"
              aria-label="Mobile Navigation Menu"
              initial={{ opacity: 0, y: -14, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.97 }}
              transition={{
                type: 'spring',
                stiffness: 360,
                damping: 28,
                mass: 0.75,
              }}
              className="pointer-events-auto lg:hidden w-full max-w-[460px] mt-2.5 rounded-3xl border border-stroke bg-surface/95 backdrop-blur-xl shadow-2xl overflow-hidden p-4"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-2.5 pb-3 mb-2 border-b border-stroke/70">
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
                  Collection &apos;26 · Navigation
                </span>
                <span className="font-mono text-[10px] text-[#89AACC]">
                  @{PROFILE_DATA.handle}
                </span>
              </div>

              {/* Navigation Links List */}
              <div className="grid grid-cols-1 gap-1">
                {NAV_ITEMS.map((item, idx) => {
                  const isActive = activeNav === item.id;
                  return (
                    <motion.a
                      key={item.id}
                      href={item.href}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: idx * 0.035,
                        type: 'spring',
                        stiffness: 340,
                        damping: 26,
                      }}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={(e) => {
                        e.preventDefault();
                        scrollToSection(item.id);
                      }}
                      className={`group flex items-center justify-between rounded-2xl px-3.5 py-2.5 transition-colors ${
                        isActive
                          ? 'bg-stroke/70 text-text-primary border border-[#89AACC]/40'
                          : 'text-muted hover:text-text-primary hover:bg-stroke/40 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`font-mono text-[11px] tabular-nums ${
                            isActive
                              ? 'text-[#89AACC]'
                              : 'text-muted/70 group-hover:text-[#89AACC]'
                          }`}
                        >
                          0{idx + 1}
                        </span>
                        <span
                          className={`text-sm ${
                            isActive
                              ? 'font-display italic text-base text-text-primary'
                              : 'font-normal'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>

                      <span
                        className={`text-xs transition-transform duration-200 ${
                          isActive
                            ? 'text-[#89AACC] translate-x-0'
                            : 'text-muted/50 group-hover:text-text-primary group-hover:translate-x-0.5'
                        }`}
                      >
                        {isActive ? '●' : '↗'}
                      </span>
                    </motion.a>
                  );
                })}
              </div>

              {/* Drawer Actions: Resume, Command Palette & Say Hi */}
              <div className="mt-3 pt-3 border-t border-stroke/70 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenResume();
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-2xl border border-stroke bg-bg/80 hover:border-[#89AACC]/60 px-3 py-2.5 text-xs font-medium text-text-primary transition-colors cursor-pointer"
                  >
                    <span>Resume / CV</span>
                    <span className="text-[#89AACC]">↗</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenCommand();
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-2xl border border-stroke bg-bg/80 hover:border-[#89AACC]/60 px-3 py-2.5 text-xs font-mono text-muted hover:text-text-primary transition-colors cursor-pointer"
                  >
                    <span>⌘K Jump</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenContact();
                  }}
                  className="group relative w-full rounded-2xl p-[1.5px] cursor-pointer overflow-hidden"
                >
                  <span
                    className="absolute inset-0 rounded-2xl accent-gradient"
                    aria-hidden="true"
                  />
                  <span className="relative flex items-center justify-center gap-2 rounded-[14px] bg-surface px-4 py-2.5 text-xs font-medium text-text-primary">
                    <span>Say hi — Start a conversation</span>
                    <span className="text-[#89AACC]">↗</span>
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Section 2: Hero */}
      <section
        id="home"
        ref={heroRef}
        tabIndex={-1}
        aria-label="Hero and Introduction"
        className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden px-6 pt-28 pb-24 focus:outline-none"
      >
        {/* Interactive WebGL2 LetterGlitch Header Backdrop */}
        <div
          className="hero-glitch-stage absolute inset-0 z-[1] will-change-transform"
          style={{ width: '100%', height: '100%' }}
        >
          <LetterGlitch
            glitchColors={
              isDark ? ['#ffffff', '#61dca3'] : ['#18181b', '#0f9f6e']
            }
            glitchAmount={0.5}
            speed={1}
            flow={0.5}
            clickEffect="tear"
            baseColor={isDark ? '#ffffff' : '#18181b'}
            fontSize={14}
            spacing={0.6}
            density={0.9}
            baseOpacity={0.16}
            smooth
            edgeFade={0.08}
            centerFade={0.44}
            interactive
            cursorRadius={140}
            intro
            lightMode={!isDark}
          />
        </div>

        {/* Seamless Bottom Pass-Through Curtain + Horizon Scanline into Next Section */}
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-bg via-bg/80 to-transparent pointer-events-none z-[2]" />
        <div
          aria-hidden="true"
          className="hero-passthrough-beam absolute bottom-0 inset-x-0 h-[2px] pointer-events-none z-[3] origin-center"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(97, 220, 163, 0.45) 25%, rgba(255, 255, 255, 0.9) 50%, rgba(137, 170, 204, 0.55) 75%, transparent 100%)',
            boxShadow: '0 0 24px rgba(97, 220, 163, 0.45)',
          }}
        />

        {/* Hero Content (2-column split on desktop: Intro Left + Interactive Portrait Reveal Right, z-10) */}
        <div className="hero-center-stage relative z-10 max-w-[1240px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center will-change-transform">
          {/* Left Column: Intro Typography, CTAs & Verified Socials */}
          <div className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
            {/* Eyebrow */}
            <p className="blur-in text-xs text-muted uppercase tracking-[0.3em] mb-5">
              COLLECTION &apos;26 · @YASHIRO-NYX
            </p>

            {/* Name */}
            <h1 className="name-reveal text-5xl sm:text-6xl md:text-7xl xl:text-[5.5rem] font-display italic leading-[0.92] tracking-tight text-text-primary mb-5">
              Jervin Paul Romualdo
            </h1>

            {/* Role line */}
            <p className="blur-in text-lg sm:text-xl md:text-2xl text-muted font-light mb-5">
              A{' '}
              <span
                key={roleIndex}
                className="font-display italic text-2xl sm:text-3xl md:text-4xl text-text-primary animate-role-fade-in inline-block px-1"
              >
                {ROLES[roleIndex]}
              </span>{' '}
              based in Manila, PH.
            </p>

            {/* Description */}
            <p className="blur-in text-sm md:text-base text-muted max-w-lg mb-9 leading-relaxed">
              {PROFILE_DATA.heroTagline}
            </p>

            {/* CTA Buttons with Magnetic Hover Springs */}
            <div className="blur-in inline-flex flex-wrap items-center justify-center lg:justify-start gap-3.5 mb-8">
              {/* "See Works": Solid button -> Hover: bg-bg text-text-primary with accent gradient border ring */}
              <Magnetic strength={0.4}>
                <a
                  href="#work"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('work');
                  }}
                  className="group relative inline-block rounded-full p-[2px] transition-transform duration-300 hover:scale-105"
                >
                  <span className="absolute inset-0 rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative block rounded-full bg-text-primary text-bg group-hover:bg-bg group-hover:text-text-primary text-sm font-medium px-6 sm:px-7 py-3.5 transition-colors duration-300 whitespace-nowrap">
                    See Works
                  </span>
                </a>
              </Magnetic>

              {/* "Explore Tech Stack" Button */}
              <Magnetic strength={0.4}>
                <a
                  href="#tech-stack"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('tech-stack');
                  }}
                  className="group relative inline-block rounded-full p-[2px] transition-transform duration-300 hover:scale-105"
                >
                  <span className="absolute inset-0 rounded-full bg-stroke group-hover:opacity-0 transition-opacity duration-300" />
                  <span className="absolute inset-0 rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative block rounded-full bg-surface text-text-primary text-sm font-medium px-6 sm:px-7 py-3.5 transition-colors duration-300 whitespace-nowrap">
                    Explore Tech Stack
                  </span>
                </a>
              </Magnetic>

              {/* "Reach out...": Outlined button */}
              <Magnetic strength={0.4}>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="group relative rounded-full p-[2px] transition-transform duration-300 hover:scale-105 cursor-pointer"
                >
                  <span className="absolute inset-0 rounded-full bg-stroke group-hover:opacity-0 transition-opacity duration-300" />
                  <span className="absolute inset-0 rounded-full accent-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative block rounded-full bg-bg text-text-primary text-sm font-medium px-6 sm:px-7 py-3.5 transition-colors duration-300 whitespace-nowrap">
                    Reach out...
                  </span>
                </button>
              </Magnetic>
            </div>

            {/* Quick Verified Profile Bar */}
            <div className="blur-in flex flex-wrap items-center justify-center lg:justify-start gap-x-5 gap-y-2 text-xs text-muted">
              <Magnetic strength={0.25}>
                <a
                  href={PROFILE_DATA.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text-primary transition-colors inline-block py-1"
                >
                  GitHub ↗
                </a>
              </Magnetic>
              <span aria-hidden="true">·</span>
              <Magnetic strength={0.25}>
                <a
                  href={PROFILE_DATA.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text-primary transition-colors inline-block py-1"
                >
                  LinkedIn ↗
                </a>
              </Magnetic>
              <span aria-hidden="true">·</span>
              <Magnetic strength={0.25}>
                <a
                  href={PROFILE_DATA.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-text-primary transition-colors inline-block py-1"
                >
                  Instagram ↗
                </a>
              </Magnetic>
              <span aria-hidden="true">·</span>
              <Magnetic strength={0.25}>
                <button
                  type="button"
                  onClick={onOpenCommand}
                  className="hover:text-text-primary transition-colors font-mono cursor-pointer py-1"
                >
                  ⌘K Quick Jump
                </button>
              </Magnetic>
            </div>
          </div>

          {/* Right Column: Interactive Natural-to-Graphite Cursor Reveal Portrait */}
          <div className="blur-in lg:col-span-5 flex justify-center lg:justify-end">
            <HeroPortraitReveal isDark={isDark} />
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <span className="text-[10px] text-muted uppercase tracking-[0.25em]">
            SCROLL
          </span>
          <div className="w-px h-10 bg-stroke overflow-hidden relative">
            <div className="w-full h-1/2 accent-gradient animate-scroll-down" />
          </div>
        </div>
      </section>
    </>
  );
};
