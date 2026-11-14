import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  Github,
  ArrowUpRight,
  Code2,
  Layers,
  Check,
  Copy,
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { CODE_SAMPLES, ProjectItem } from '../data/portfolioData';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
  onOpenContact?: () => void;
}

const SLIDE_LABELS = [
  'Primary Interface & Overview',
  'Core Workflow & Module View',
  'System Architecture & Detail Screen',
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  project,
  onClose,
  onOpenContact,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [fitContain, setFitContain] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'code'>('overview');
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const shareTimerRef = useRef<number | null>(null);
  const pointerStartXRef = useRef<number | null>(null);

  const slides = React.useMemo(() => {
    if (!project) return [];
    const raw = [project.col1Image1, project.col1Image2, project.col2Image].filter(
      Boolean
    );
    return Array.from(new Set(raw));
  }, [project]);

  const goPrevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goNextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (project) {
      setActiveIndex(0);
      setFitContain(false);
      setActiveTab('overview');
      setShareCopied(false);
    }
    return () => {
      if (shareTimerRef.current) {
        window.clearTimeout(shareTimerRef.current);
      }
    };
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (activeTab === 'overview' && slides.length > 1) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          goNextSlide();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          goPrevSlide();
        }
      }
    };
    if (project) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose, activeTab, slides.length, goNextSlide, goPrevSlide]);

  if (!project) return null;

  // Match related code sample by project id first, then fallback to name match or first sample
  const matchedSample =
    CODE_SAMPLES.find((s) => s.id === project.id) ||
    CODE_SAMPLES.find((s) =>
      project.name.toLowerCase().includes(s.project.split(' ')[0].toLowerCase())
    ) ||
    CODE_SAMPLES[0];

  const copyTextToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      // Fallback below if iframe clipboard permission is restricted
    }
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
    } finally {
      document.body.removeChild(textarea);
    }
  };

  const handleCopyCode = () => {
    copyTextToClipboard(matchedSample.code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const directProjectUrl = project.liveUrl || project.githubUrl;

  const handleShareProject = () => {
    copyTextToClipboard(directProjectUrl);

    if (shareTimerRef.current) {
      window.clearTimeout(shareTimerRef.current);
    }
    setShareCopied(true);
    shareTimerRef.current = window.setTimeout(() => {
      setShareCopied(false);
    }, 2600);
  };

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6"
        >
          {/* Floating 'Copied!' Toast Notification */}
          <AnimatePresence>
            {shareCopied && (
              <motion.div
                role="status"
                aria-live="polite"
                initial={{ opacity: 0, y: -16, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                onClick={(e) => e.stopPropagation()}
                className="fixed top-6 left-1/2 -translate-x-1/2 z-[120] inline-flex items-center gap-2.5 rounded-full border border-[#89AACC]/60 bg-surface/95 backdrop-blur-xl px-4 py-2 text-xs font-medium text-text-primary shadow-xl max-w-[92vw]"
              >
                <span className="w-5 h-5 rounded-full bg-[#89AACC]/20 text-[#89AACC] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" />
                </span>
                <span className="font-semibold text-text-primary shrink-0">
                  Copied!
                </span>
                <span className="font-mono text-[11px] text-[#89AACC] truncate max-w-[220px] sm:max-w-[320px]">
                  {directProjectUrl}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            data-lenis-prevent
            role="dialog"
            aria-modal="true"
            aria-label={`${project.name} Case Study`}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl rounded-3xl border border-stroke bg-surface text-text-primary p-6 sm:p-10 max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-wider text-[#89AACC]">
                  {project.number} · {project.category} · {project.year}
                </p>
                <h3 className="mt-1 text-3xl sm:text-5xl font-display italic tracking-tight text-text-primary">
                  {project.name}
                </h3>
                <p className="text-xs sm:text-sm text-muted mt-1">
                  {project.subtitle}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Clean Tab Switcher Inside Modal */}
                <div
                  role="tablist"
                  aria-label="Case study view tabs"
                  className="inline-flex items-center p-1 rounded-full bg-bg border border-stroke"
                >
                  <button
                    type="button"
                    role="tab"
                    autoFocus
                    aria-selected={activeTab === 'overview'}
                    onClick={() => setActiveTab('overview')}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                        e.preventDefault();
                        setActiveTab(activeTab === 'overview' ? 'code' : 'overview');
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                      activeTab === 'overview'
                        ? 'bg-text-primary text-bg font-medium'
                        : 'text-muted hover:text-text-primary'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Case Study</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'code'}
                    onClick={() => setActiveTab('code')}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                        e.preventDefault();
                        setActiveTab(activeTab === 'overview' ? 'code' : 'overview');
                      }
                    }}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                      activeTab === 'code'
                        ? 'bg-text-primary text-bg font-medium'
                        : 'text-muted hover:text-text-primary'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Code &amp; Files</span>
                  </button>
                </div>

                {/* Share Direct Project URL Button */}
                <button
                  type="button"
                  onClick={handleShareProject}
                  aria-label={`Share direct link to ${project.name}`}
                  title="Copy direct link to this project"
                  className={`h-10 px-3.5 rounded-full border inline-flex items-center gap-1.5 text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                    shareCopied
                      ? 'border-[#89AACC] bg-[#89AACC]/15 text-[#89AACC]'
                      : 'border-stroke bg-bg text-muted hover:text-text-primary hover:border-[#89AACC]'
                  }`}
                >
                  {shareCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#89AACC]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close project preview"
                  className="w-10 h-10 rounded-full border border-stroke bg-bg flex items-center justify-center text-muted hover:text-text-primary hover:border-[#89AACC] transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {activeTab === 'overview' ? (
              <>
                {/* Horizontal Interactive Screenshot Carousel */}
                <div className="mb-8">
                  <div
                    role="region"
                    aria-roledescription="carousel"
                    aria-label={`${project.name} screenshot carousel`}
                    onPointerDown={(e) => {
                      pointerStartXRef.current = e.clientX;
                    }}
                    onPointerUp={(e) => {
                      if (pointerStartXRef.current === null) return;
                      const deltaX = e.clientX - pointerStartXRef.current;
                      pointerStartXRef.current = null;
                      if (Math.abs(deltaX) > 44) {
                        if (deltaX < 0) goNextSlide();
                        else goPrevSlide();
                      }
                    }}
                    className="group relative w-full h-[250px] sm:h-[390px] rounded-2xl overflow-hidden border border-stroke bg-bg select-none touch-pan-y"
                  >
                    {/* Horizontal Sliding Track */}
                    <motion.div
                      animate={{ x: `-${activeIndex * 100}%` }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 32,
                        mass: 0.85,
                      }}
                      className="flex w-full h-full will-change-transform"
                    >
                      {slides.map((imgUrl, idx) => (
                        <div
                          key={`${imgUrl}-${idx}`}
                          aria-hidden={activeIndex !== idx}
                          className="w-full h-full shrink-0 relative flex items-center justify-center bg-bg overflow-hidden"
                        >
                          <img
                            src={imgUrl}
                            alt={`${project.name} — ${
                              SLIDE_LABELS[idx] || `Screen ${idx + 1}`
                            }`}
                            referrerPolicy="no-referrer"
                            draggable={false}
                            className={`w-full h-full transition-all duration-300 block ${
                              fitContain
                                ? 'object-contain p-2 sm:p-4'
                                : 'object-cover object-top'
                            }`}
                          />
                        </div>
                      ))}
                    </motion.div>

                    {/* Subtle Top & Bottom Gradient Vignette for HUD Legibility */}
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/55 to-transparent"
                    />
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent"
                    />

                    {/* Top HUD Bar: Frame Counter + Caption + Fit Mode Toggle */}
                    <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
                      <div className="inline-flex items-center gap-2 rounded-full bg-black/65 backdrop-blur-md border border-white/15 px-3 py-1 text-[11px] font-mono text-white/90">
                        <span className="text-[#89AACC]">
                          0{activeIndex + 1} / 0{slides.length}
                        </span>
                        <span className="text-white/30">·</span>
                        <span className="truncate max-w-[180px] sm:max-w-[280px]">
                          {SLIDE_LABELS[activeIndex] ||
                            `Screen ${activeIndex + 1}`}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFitContain((prev) => !prev)}
                        aria-label={
                          fitContain
                            ? 'Switch to fill cover mode'
                            : 'Switch to fit full screen mode'
                        }
                        title={
                          fitContain ? 'Fill frame (cover)' : 'Fit full screenshot'
                        }
                        className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-black/65 hover:bg-black/85 backdrop-blur-md border border-white/15 hover:border-[#89AACC]/60 px-2.5 py-1 text-[11px] font-mono text-white/90 transition-colors cursor-pointer"
                      >
                        {fitContain ? (
                          <>
                            <Minimize2 className="w-3 h-3 text-[#89AACC]" />
                            <span className="hidden sm:inline">Fill</span>
                          </>
                        ) : (
                          <>
                            <Maximize2 className="w-3 h-3 text-[#89AACC]" />
                            <span className="hidden sm:inline">Fit Screen</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Left / Right Carousel Arrow Controls */}
                    {slides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={goPrevSlide}
                          aria-label="Previous screenshot"
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/65 hover:bg-black/85 border border-white/15 hover:border-[#89AACC] text-white flex items-center justify-center backdrop-blur-md transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer shadow-lg"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={goNextSlide}
                          aria-label="Next screenshot"
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/65 hover:bg-black/85 border border-white/15 hover:border-[#89AACC] text-white flex items-center justify-center backdrop-blur-md transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 cursor-pointer shadow-lg"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Bottom Segmented Progress Pills */}
                    {slides.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-md border border-white/10">
                        {slides.map((_, idx) => {
                          const isCurrent = activeIndex === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setActiveIndex(idx)}
                              aria-label={`Go to slide ${idx + 1}`}
                              aria-current={isCurrent ? 'true' : undefined}
                              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                                isCurrent
                                  ? 'w-6 bg-[#89AACC]'
                                  : 'w-1.5 bg-white/40 hover:bg-white/70'
                              }`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Synchronized Horizontal Filmstrip Thumbnails */}
                  {slides.length > 1 && (
                    <div
                      role="group"
                      aria-label="Project screenshot thumbnails"
                      className="grid grid-cols-3 gap-3 mt-3"
                    >
                      {slides.map((imgUrl, idx) => {
                        const isCurrent = activeIndex === idx;
                        return (
                          <button
                            key={idx}
                            type="button"
                            aria-label={`Select screenshot ${idx + 1} of ${slides.length}: ${
                              SLIDE_LABELS[idx] || `Screen ${idx + 1}`
                            }`}
                            aria-pressed={isCurrent}
                            onClick={() => setActiveIndex(idx)}
                            className={`group/thumb relative h-16 sm:h-24 rounded-xl overflow-hidden border-2 transition-all cursor-pointer text-left ${
                              isCurrent
                                ? 'border-[#89AACC] opacity-100 shadow-md shadow-[#89AACC]/10'
                                : 'border-stroke/60 opacity-55 hover:opacity-90 hover:border-stroke'
                            }`}
                          >
                            <img
                              src={imgUrl}
                              alt={`${project.name} thumbnail ${idx + 1}`}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover object-top block transition-transform duration-300 group-hover/thumb:scale-105"
                            />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-2.5 py-1.5 flex items-center justify-between">
                              <span className="font-mono text-[10px] text-white/90 truncate">
                                0{idx + 1} ·{' '}
                                {idx === 0
                                  ? 'Overview'
                                  : idx === 1
                                  ? 'Workflow'
                                  : 'System View'}
                              </span>
                              {isCurrent && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#89AACC] shrink-0" />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Context First: Problem Solved & Overview */}
                <div className="py-6 border-t border-stroke grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-[#89AACC] mb-2">
                      The Challenge
                    </p>
                    <p className="text-sm text-text-primary/90 leading-relaxed">
                      {project.problemSolved}
                    </p>
                  </div>

                  <div>
                    <p className="font-mono text-xs uppercase tracking-wider text-[#89AACC] mb-2">
                      The Solution
                    </p>
                    <p className="text-sm text-muted leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                </div>

                {/* Project Stats Section (Role, Duration, Tech Stack) */}
                <div className="py-6 border-t border-stroke">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-muted mb-4">
                    Project Stats
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-6">
                    <div className="sm:col-span-4">
                      <span className="text-xs text-muted block mb-1">Role</span>
                      <span className="text-sm font-medium text-text-primary">
                        {project.role}
                      </span>
                    </div>

                    <div className="sm:col-span-3">
                      <span className="text-xs text-muted block mb-1">
                        Stack / Context
                      </span>
                      <span className="text-sm font-medium text-text-primary">
                        {project.duration}
                      </span>
                    </div>

                    <div className="sm:col-span-5">
                      <span className="text-xs text-muted block mb-1">
                        Tech Stack
                      </span>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-text-primary">
                        {project.techStack.map((tech, idx) => (
                          <React.Fragment key={tech}>
                            <span>{tech}</span>
                            {idx < project.techStack.length - 1 && (
                              <span className="text-muted">·</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Code & Source Files Tab */
              <div className="space-y-6 py-2 min-w-0">
                <div className="rounded-2xl border border-stroke bg-bg overflow-hidden min-w-0">
                  <div className="px-5 py-3.5 border-b border-stroke flex flex-wrap items-center justify-between gap-3 min-w-0">
                    <div className="font-mono text-xs text-muted min-w-0 flex-1 break-words [overflow-wrap:anywhere]">
                      <span className="text-[#89AACC] break-all">
                        {matchedSample.filePath}
                      </span>
                      <span className="mx-2">·</span>
                      <span>{matchedSample.language}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-stroke text-xs text-text-primary cursor-pointer shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#89AACC]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-muted" />
                          <span>Copy Snippet</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-5 text-xs font-mono text-text-primary/90 overflow-x-auto whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed max-w-full">
                    <code>{matchedSample.code}</code>
                  </pre>
                </div>

                <div className="min-w-0">
                  <h4 className="font-mono text-xs uppercase tracking-wider text-muted mb-3">
                    Key Source Files in Repository
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {project.keyFiles.map((fileItem) => {
                      const segments = fileItem.split('/');
                      return (
                        <a
                          key={fileItem}
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={fileItem}
                          className="rounded-2xl border border-stroke bg-bg hover:border-[#89AACC] p-4 transition-colors flex flex-col justify-between gap-2 min-w-0 overflow-hidden"
                        >
                          <code className="font-mono text-xs text-text-primary block leading-relaxed break-words [overflow-wrap:anywhere]">
                            {segments.map((seg, i) => (
                              <React.Fragment key={i}>
                                {seg}
                                {i < segments.length - 1 && (
                                  <>
                                    /
                                    <wbr />
                                  </>
                                )}
                              </React.Fragment>
                            ))}
                          </code>
                          <span className="text-[11px] text-[#89AACC] shrink-0">
                            Inspect on GitHub ↗
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-4 border-t border-stroke">
              <div className="flex flex-wrap items-center gap-2.5">
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-text-primary text-bg hover:opacity-90 px-5 py-2.5 text-xs font-medium inline-flex items-center gap-1.5 transition-opacity"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Live Site</span>
                  </a>
                )}

                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-bg border border-stroke hover:border-[#89AACC] text-text-primary px-5 py-2.5 text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                </a>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenContact?.();
                }}
                className="rounded-full bg-bg border border-stroke hover:border-[#89AACC] text-[#89AACC] px-5 py-2.5 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Inquire About Similar Project</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProjectModal;
