import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Keyboard, X, CornerDownLeft, ArrowUpDown, Compass } from 'lucide-react';
import { useSmoothScroll } from './SmoothScrollProvider';

interface SectionTarget {
  id: string;
  number: string;
  label: string;
  shortcut: string;
}

export const PORTFOLIO_SECTIONS: SectionTarget[] = [
  { id: 'home', number: '00', label: 'Hero & Intro', shortcut: 'Alt + 0' },
  { id: 'work', number: '01', label: 'Selected Works', shortcut: 'Alt + 1' },
  { id: 'tech-stack', number: '02', label: 'Tech Stack', shortcut: 'Alt + 2' },
  { id: 'expertise', number: '03', label: 'Expertise', shortcut: 'Alt + 3' },
  { id: 'about', number: '04', label: 'Highlights & Bio', shortcut: 'Alt + 4' },
  { id: 'explorations', number: '05', label: 'Event Gallery', shortcut: 'Alt + 5' },
  { id: 'credentials', number: '06', label: 'Credentials', shortcut: 'Alt + 6' },
  { id: 'contact', number: '07', label: 'Connect & Footer', shortcut: 'Alt + 7' },
];

interface KeyboardNavigationSystemProps {
  onOpenCommand: () => void;
  onOpenContact: () => void;
  onOpenResume: () => void;
  onToggleTheme: () => void;
}

export const KeyboardNavigationSystem: React.FC<KeyboardNavigationSystemProps> = ({
  onOpenCommand,
  onOpenContact,
  onOpenResume,
  onToggleTheme,
}) => {
  const { scrollTo } = useSmoothScroll();
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [focusedSummary, setFocusedSummary] = useState<string>('Ready');
  const [currentSectionId, setCurrentSectionId] = useState<string>('home');

  const jumpToSectionAndFocus = useCallback(
    (sectionId: string) => {
      const sectionEl = document.getElementById(sectionId);
      if (!sectionEl) return;

      setCurrentSectionId(sectionId);
      scrollTo(`#${sectionId}`, { offset: 0, duration: 1.15 });

      // Focus the first interactive element inside the section or the section itself
      window.setTimeout(() => {
        const firstInteractive = sectionEl.querySelector<HTMLElement>(
          'button:not([disabled]), a[href], [role="button"][tabindex="0"], input:not([disabled]), [tabindex="0"]'
        );
        if (firstInteractive) {
          firstInteractive.focus({ preventScroll: true });
        } else {
          sectionEl.focus({ preventScroll: true });
        }
      }, 320);
    },
    [scrollTo]
  );

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 300;
      for (const sec of PORTFOLIO_SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setCurrentSectionId(sec.id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Detect keyboard navigation vs mouse usage and handle global section hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInputFocused =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (
        e.key === 'Tab' ||
        e.key === 'ArrowDown' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'Enter'
      ) {
        setIsKeyboardMode(true);
      }

      if (isInputFocused) return;

      // '?' opens Keyboard Shortcuts Help Modal
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setIsHelpOpen((prev) => !prev);
        return;
      }

      if (e.key === 'Escape' && isHelpOpen) {
        setIsHelpOpen(false);
        return;
      }

      // Alt + 0..7 jumps directly to section and focuses first interactive control
      if (e.altKey && !e.metaKey && !e.ctrlKey) {
        const num = parseInt(e.key, 10);
        if (!Number.isNaN(num) && num >= 0 && num < PORTFOLIO_SECTIONS.length) {
          e.preventDefault();
          setIsKeyboardMode(true);
          jumpToSectionAndFocus(PORTFOLIO_SECTIONS[num].id);
          return;
        }
      }

      // '[' and ']' cycle through previous / next portfolio sections
      if (e.key === ']' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsKeyboardMode(true);
        const curIdx = PORTFOLIO_SECTIONS.findIndex(
          (s) => s.id === currentSectionId
        );
        const nextIdx = (curIdx + 1) % PORTFOLIO_SECTIONS.length;
        jumpToSectionAndFocus(PORTFOLIO_SECTIONS[nextIdx].id);
      } else if (e.key === '[' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setIsKeyboardMode(true);
        const curIdx = PORTFOLIO_SECTIONS.findIndex(
          (s) => s.id === currentSectionId
        );
        const prevIdx =
          (curIdx - 1 + PORTFOLIO_SECTIONS.length) % PORTFOLIO_SECTIONS.length;
        jumpToSectionAndFocus(PORTFOLIO_SECTIONS[prevIdx].id);
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || target === document.body) return;

      const ariaLabel = target.getAttribute('aria-label');
      const text = target.textContent?.trim().replace(/\s+/g, ' ').slice(0, 42);
      const label = ariaLabel
        ? ariaLabel.slice(0, 46)
        : text || target.tagName.toLowerCase();
      setFocusedSummary(label);

      // Update current section if focus moved inside a section
      const parentSection = target.closest('section[id], footer[id]');
      if (parentSection && parentSection.id) {
        setCurrentSectionId(parentSection.id);
      }
    };

    const handlePointerDown = () => {
      setIsKeyboardMode(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('mousedown', handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('mousedown', handlePointerDown);
    };
  }, [currentSectionId, isHelpOpen, jumpToSectionAndFocus]);

  const activeSectionObj =
    PORTFOLIO_SECTIONS.find((s) => s.id === currentSectionId) ||
    PORTFOLIO_SECTIONS[0];

  return (
    <>
      {/* 1. Accessible Skip-to-Section Bar (Desktop keyboard-only, completely hidden until focused via Tab) */}
      <div
        role="region"
        aria-label="Skip to portfolio sections"
        className="hidden lg:flex fixed top-3 left-3 right-3 z-[130] pointer-events-none justify-center"
      >
        <div className="pointer-events-none focus-within:pointer-events-auto flex flex-wrap items-center justify-center gap-1.5 rounded-full bg-surface/95 backdrop-blur-xl border border-[#89AACC] px-3 py-2 shadow-2xl -translate-y-[220%] opacity-0 focus-within:translate-y-0 focus-within:opacity-100 transition-all duration-300">
          <span className="font-mono text-[11px] uppercase tracking-wider text-[#89AACC] px-2">
            Quick Jump (Tab + Enter):
          </span>
          {PORTFOLIO_SECTIONS.slice(1).map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => jumpToSectionAndFocus(sec.id)}
              className="px-3 py-1 rounded-full text-xs font-mono bg-bg border border-stroke hover:border-[#89AACC] text-text-primary transition-colors cursor-pointer"
            >
              {sec.number} {sec.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="px-3 py-1 rounded-full text-xs font-mono bg-[#89AACC] text-[#0a0a0a] font-medium cursor-pointer"
          >
            All Shortcuts (?)
          </button>
        </div>
      </div>

      {/* 2. Floating Keyboard Navigation HUD (Bottom-Left, Desktop only) */}
      <div className="hidden lg:flex fixed bottom-4 left-4 z-40 items-center gap-2 pointer-events-none">
        <AnimatePresence mode="wait">
          {isKeyboardMode ? (
            <motion.div
              key="hud-expanded"
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto flex flex-wrap items-center gap-2.5 rounded-2xl bg-surface/95 backdrop-blur-xl border border-[#89AACC]/60 px-3.5 py-2 shadow-2xl text-xs"
            >
              <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#89AACC]">
                <Keyboard className="w-3.5 h-3.5" />
                <span>
                  {activeSectionObj.number} · {activeSectionObj.label}
                </span>
              </span>

              <span className="hidden sm:inline-block text-stroke">|</span>

              <span className="hidden md:inline-block font-mono text-[11px] text-muted max-w-[200px] truncate">
                Focus: <strong className="text-text-primary font-normal">{focusedSummary}</strong>
              </span>

              <span className="hidden sm:inline-block text-stroke">|</span>

              <div className="hidden sm:flex items-center gap-1.5 font-mono text-[10px] text-muted">
                <kbd className="px-1.5 py-0.5 rounded bg-bg border border-stroke text-text-primary">
                  Tab
                </kbd>
                <span>Next</span>
                <kbd className="px-1.5 py-0.5 rounded bg-bg border border-stroke text-text-primary">
                  ↵ Enter
                </kbd>
                <span>Select</span>
                <kbd className="px-1.5 py-0.5 rounded bg-bg border border-stroke text-text-primary">
                  [ / ]
                </kbd>
                <span>Section</span>
              </div>

              <button
                type="button"
                onClick={() => setIsHelpOpen(true)}
                aria-label="Open keyboard navigation guide"
                className="ml-1 px-2.5 py-1 rounded-full bg-bg border border-stroke hover:border-[#89AACC] font-mono text-[10px] text-[#89AACC] transition-colors cursor-pointer"
              >
                ? Guide
              </button>
            </motion.div>
          ) : (
            <motion.button
              key="hud-compact"
              type="button"
              onClick={() => {
                setIsKeyboardMode(true);
                setIsHelpOpen(true);
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              aria-label="Open keyboard navigation shortcuts (Press ? or Tab)"
              title="Keyboard Navigation System (Press Tab or ?)"
              className="pointer-events-auto group inline-flex items-center gap-2 rounded-full bg-surface/85 backdrop-blur-md border border-stroke hover:border-[#89AACC] px-3 py-1.5 text-[11px] font-mono text-muted hover:text-text-primary shadow-lg transition-all cursor-pointer"
            >
              <Keyboard className="w-3.5 h-3.5 text-[#89AACC]" />
              <span className="hidden sm:inline">Keyboard Nav</span>
              <kbd className="px-1.5 py-0.2 rounded bg-bg border border-stroke text-[10px] text-text-primary">
                Tab / ?
              </kbd>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Full Keyboard Navigation & Section Jump Modal */}
      <AnimatePresence>
        {isHelpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsHelpOpen(false)}
            className="fixed inset-0 z-[125] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <motion.div
              data-lenis-prevent
              role="dialog"
              aria-modal="true"
              aria-label="Keyboard Navigation and Shortcuts"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl rounded-3xl border border-stroke bg-surface p-6 sm:p-8 text-text-primary shadow-2xl max-h-[88vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-stroke">
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-[#89AACC] inline-flex items-center gap-1.5">
                    <Keyboard className="w-3.5 h-3.5" />
                    <span>Accessibility &amp; Keyboard Navigation</span>
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-display italic text-text-primary mt-1">
                    Navigate every section with Tab &amp; Enter
                  </h3>
                </div>
                <button
                  type="button"
                  autoFocus
                  onClick={() => setIsHelpOpen(false)}
                  aria-label="Close keyboard shortcuts modal"
                  className="w-9 h-9 rounded-full border border-stroke bg-bg flex items-center justify-center text-muted hover:text-text-primary hover:border-[#89AACC] transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Section Direct Jump Grid (Tab + Enter operable) */}
              <div className="py-5 border-b border-stroke">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-muted inline-flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-[#89AACC]" />
                    <span>Instant Section Jump (Tab + Enter or Shortcut)</span>
                  </span>
                  <span className="font-mono text-[11px] text-[#89AACC]">
                    Auto-focuses section controls
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {PORTFOLIO_SECTIONS.map((sec) => {
                    const isCurrent = currentSectionId === sec.id;
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => {
                          setIsHelpOpen(false);
                          jumpToSectionAndFocus(sec.id);
                        }}
                        className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border text-left transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-bg border-[#89AACC] text-text-primary'
                            : 'bg-bg/60 border-stroke hover:border-[#89AACC]/60 text-muted hover:text-text-primary'
                        }`}
                      >
                        <span className="text-xs font-medium">
                          <span className="font-mono text-[#89AACC] mr-2">
                            {sec.number}
                          </span>
                          {sec.label}
                        </span>
                        <kbd className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface border border-stroke text-text-primary">
                          {sec.shortcut}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Core Keyboard Controls */}
              <div className="py-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-[#89AACC] mb-3 inline-flex items-center gap-1.5">
                    <CornerDownLeft className="w-3.5 h-3.5" />
                    <span>Element &amp; Card Interaction</span>
                  </h4>
                  <ul className="space-y-2.5 text-xs text-muted">
                    <li className="flex items-center justify-between gap-2">
                      <span>Move focus forward / back</span>
                      <kbd className="font-mono px-2 py-0.5 rounded bg-bg border border-stroke text-text-primary">
                        Tab / ⇧ Tab
                      </kbd>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                      <span>Open Project / Activate Control</span>
                      <kbd className="font-mono px-2 py-0.5 rounded bg-bg border border-stroke text-text-primary">
                        Enter / Space
                      </kbd>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                      <span>Cycle Cards / Filter Tabs / 3D Orbit</span>
                      <kbd className="font-mono px-2 py-0.5 rounded bg-bg border border-stroke text-text-primary">
                        ← ↑ ↓ →
                      </kbd>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                      <span>Close Active Modal / Lightbox</span>
                      <kbd className="font-mono px-2 py-0.5 rounded bg-bg border border-stroke text-text-primary">
                        Esc
                      </kbd>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-mono text-xs uppercase tracking-wider text-[#89AACC] mb-3 inline-flex items-center gap-1.5">
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    <span>Global Portfolio Actions</span>
                  </h4>
                  <ul className="space-y-2.5 text-xs text-muted">
                    <li className="flex items-center justify-between gap-2">
                      <span>Previous / Next Section</span>
                      <kbd className="font-mono px-2 py-0.5 rounded bg-bg border border-stroke text-text-primary">
                        [ or ]
                      </kbd>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                      <span>Command Palette Search</span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsHelpOpen(false);
                          onOpenCommand();
                        }}
                        className="font-mono px-2 py-0.5 rounded bg-bg border border-stroke hover:border-[#89AACC] text-text-primary cursor-pointer"
                      >
                        ⌘K / Ctrl+K ↗
                      </button>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                      <span>Switch Dark / Light Theme</span>
                      <button
                        type="button"
                        onClick={onToggleTheme}
                        className="font-mono px-2 py-0.5 rounded bg-bg border border-stroke hover:border-[#89AACC] text-text-primary cursor-pointer"
                      >
                        Toggle Theme ↗
                      </button>
                    </li>
                    <li className="flex items-center justify-between gap-2">
                      <span>Open Inquiry / Printable CV</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setIsHelpOpen(false);
                            onOpenContact();
                          }}
                          className="font-mono px-2 py-0.5 rounded bg-bg border border-stroke hover:border-[#89AACC] text-text-primary cursor-pointer"
                        >
                          Inquire
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsHelpOpen(false);
                            onOpenResume();
                          }}
                          className="font-mono px-2 py-0.5 rounded bg-bg border border-stroke hover:border-[#89AACC] text-text-primary cursor-pointer"
                        >
                          CV
                        </button>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-stroke flex items-center justify-between text-[11px] font-mono text-muted">
                <span>Press ESC or Enter on Close to dismiss</span>
                <span>WCAG 2.1 AA Keyboard Operable</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default KeyboardNavigationSystem;
