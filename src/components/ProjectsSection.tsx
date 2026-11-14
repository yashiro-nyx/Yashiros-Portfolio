import React, { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  ArrowUpRight,
  ExternalLink,
  Github,
  LayoutGrid,
  List,
} from 'lucide-react';
import {
  PROJECTS,
  ProjectCategory,
  ProjectItem,
} from '../data/portfolioData';
import { AmbientAudioToggle } from './AmbientAudioToggle';
import {
  StaggerContainer,
  FadeInUpItem,
  createPopInTransition,
  HOVER_SPRING_CONFIG,
  POP_IN_SPRING_CONFIG,
} from './StaggerFadeInUp';

interface ProjectsSectionProps {
  onSelectProject: (project: ProjectItem) => void;
}

const CATEGORIES: ProjectCategory[] = [
  'All',
  'Full-Stack',
  'Creative & Web',
  'AI & Systems',
];

interface BentoProjectCardProps {
  project: ProjectItem;
  idx: number;
  spanClass: string;
  isKeyboardFocused: boolean;
  cardRef: (el: HTMLElement | null) => void;
  onSelectProject: (project: ProjectItem) => void;
  onFocusProject: (project: ProjectItem) => void;
  onBlurProject: (project: ProjectItem) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
}

const TILT_SPRING_CONFIG = { stiffness: 260, damping: 24, mass: 0.65 };

const BentoProjectCard: React.FC<BentoProjectCardProps> = ({
  project,
  idx,
  spanClass,
  isKeyboardFocused,
  cardRef,
  onSelectProject,
  onFocusProject,
  onBlurProject,
  onKeyDown,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [5.5, -5.5]),
    TILT_SPRING_CONFIG
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-5.5, 5.5]),
    TILT_SPRING_CONFIG
  );
  const spotSpringX = useSpring(spotX, TILT_SPRING_CONFIG);
  const spotSpringY = useSpring(spotY, TILT_SPRING_CONFIG);

  const spotlightBackground = useMotionTemplate`radial-gradient(440px circle at ${spotSpringX}% ${spotSpringY}%, rgba(137, 170, 204, 0.2), transparent 68%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    mouseX.set(relX / rect.width - 0.5);
    mouseY.set(relY / rect.height - 0.5);
    spotX.set((relX / rect.width) * 100);
    spotY.set((relY / rect.height) * 100);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    spotX.set(50);
    spotY.set(50);
  };

  const staggerDelay = (idx % 2) * 0.085 + Math.min(idx * 0.025, 0.12);

  return (
    <motion.article
      ref={cardRef}
      tabIndex={0}
      role="button"
      aria-label={`${project.name} — ${project.category} (${project.year}). ${project.role}. Press Enter to inspect case study and source code, or Tab to access Live and GitHub links.`}
      initial={{ opacity: 0, y: 34, scale: 0.92, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      whileHover={{ y: -6, scale: 1.014, transition: HOVER_SPRING_CONFIG }}
      whileTap={{ scale: 0.985, transition: HOVER_SPRING_CONFIG }}
      viewport={{ once: false, amount: 0.12, margin: '-20px 0px -20px 0px' }}
      transition={createPopInTransition(staggerDelay)}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={(e) => {
        onFocusProject(project);
        if (e.target === e.currentTarget) {
          e.currentTarget.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          onBlurProject(project);
        }
      }}
      onKeyDown={onKeyDown}
      onClick={() => onSelectProject(project)}
      style={{
        transformPerspective: 1100,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`${spanClass} group relative rounded-3xl bg-surface border transition-colors overflow-hidden cursor-pointer flex flex-col justify-between shadow-2xl will-change-transform ${
        isKeyboardFocused
          ? 'border-[#89AACC] ring-2 ring-[#89AACC]/50'
          : 'border-stroke hover:border-[#89AACC]/60'
      }`}
    >
      {/* Dynamic Framer Motion 3D Specular Spotlight */}
      <motion.div
        aria-hidden="true"
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className="pointer-events-none absolute inset-0 z-20"
        style={{ background: spotlightBackground }}
      />

      {/* Visual Container */}
      <div className="relative w-full aspect-[16/10] overflow-hidden bg-bg">
        <img
          src={project.col1Image1}
          alt={project.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 group-focus-visible:scale-105"
        />
        {/* Measured top dark scrim for crisp overlay legibility in both light and dark themes */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
        {/* Subtle bottom seam blending photo into card surface without washing out the image */}
        <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-surface/70 to-transparent pointer-events-none" />

        {/* Top Meta Strip */}
        <div className="absolute top-4 inset-x-5 flex items-center justify-between text-xs font-mono text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] z-10">
          <span>
            {project.number} · {project.category} · {project.year}
          </span>
          <div className="flex items-center gap-2">
            {isKeyboardFocused && (
              <span className="px-2 py-0.5 rounded-full bg-black/80 border border-[#89AACC] text-[10px] text-[#c8e0f8]">
                ↵ Enter to Inspect
              </span>
            )}
            {project.liveUrl && (
              <span className="text-[#cde3fa] font-medium">
                Live Production ↗
              </span>
            )}
          </div>
        </div>

        {/* Hover & Keyboard Focus Center Action Pill */}
        <div
          className={`absolute inset-0 bg-black/45 backdrop-blur-[3px] transition-all duration-300 flex items-center justify-center p-6 z-10 ${
            isKeyboardFocused
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <div
            className={`p-[1.5px] rounded-full accent-gradient-animated shadow-2xl transform transition-transform duration-300 ${
              isKeyboardFocused
                ? 'translate-y-0'
                : 'translate-y-2 group-hover:translate-y-0'
            }`}
          >
            <div className="bg-bg text-text-primary rounded-full px-6 py-2.5 text-xs sm:text-sm font-medium flex items-center gap-2 whitespace-nowrap">
              <span>Inspect Case Study &amp; Code</span>
              <span className="font-mono text-[11px] text-[#89AACC]">
                ↵ Enter
              </span>
              <ArrowUpRight className="w-4 h-4 text-[#89AACC]" />
            </div>
          </div>
        </div>
      </div>

      {/* Clean Info & Tech Stack Footer with Staggered Fade-In-Up Text */}
      <StaggerContainer
        staggerDelay={0.07}
        viewportMargin="-16px 0px -16px 0px"
        className="p-6 sm:p-7 flex flex-col justify-between flex-1 bg-surface relative z-10"
      >
        <div>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <FadeInUpItem
                as="p"
                subtle
                className="text-xs font-mono text-[#89AACC] mb-1"
              >
                {project.role} · {project.duration}
              </FadeInUpItem>
              <FadeInUpItem
                as="h3"
                subtle
                className="text-2xl sm:text-3xl font-display italic text-text-primary group-hover:text-[#89AACC] group-focus-visible:text-[#89AACC] transition-colors"
              >
                {project.name}
              </FadeInUpItem>
            </div>

            <FadeInUpItem subtle className="flex items-center gap-2 shrink-0">
              <div
                className="flex items-center gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Open ${project.name} Live Site`}
                    aria-label={`Open ${project.name} live deployment in a new tab`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-bg border border-stroke hover:border-[#89AACC] focus-visible:border-[#89AACC] text-xs text-text-primary transition-colors whitespace-nowrap"
                  >
                    <span>Live</span>
                    <ExternalLink className="w-3 h-3 text-[#89AACC]" />
                  </a>
                )}
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`View ${project.name} Source on GitHub`}
                  aria-label={`View ${project.name} source code on GitHub`}
                  className="w-8 h-8 rounded-full bg-bg border border-stroke hover:border-[#89AACC] focus-visible:border-[#89AACC] flex items-center justify-center text-muted hover:text-text-primary transition-colors"
                >
                  <Github className="w-3.5 h-3.5" />
                </a>
              </div>
            </FadeInUpItem>
          </div>

          <FadeInUpItem
            as="p"
            subtle
            className="text-xs sm:text-sm text-muted line-clamp-2 mb-4 leading-relaxed"
          >
            {project.problemSolved}
          </FadeInUpItem>
        </div>

        {/* Full Tech Stack Line */}
        <FadeInUpItem
          subtle
          className="pt-3.5 border-t border-stroke flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-mono text-text-primary/80"
        >
          {project.techStack.map((tech, tIdx) => (
            <React.Fragment key={tech}>
              {tIdx > 0 && (
                <span className="text-muted" aria-hidden="true">
                  ·
                </span>
              )}
              <span>{tech}</span>
            </React.Fragment>
          ))}
        </FadeInUpItem>
      </StaggerContainer>
    </motion.article>
  );
};

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  onSelectProject,
}) => {
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>('All');
  const [viewMode, setViewMode] = useState<'bento' | 'index'>('bento');
  const [hoveredProject, setHoveredProject] = useState<ProjectItem>(PROJECTS[0]);
  const [focusedProjectId, setFocusedProjectId] = useState<string>('');

  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const indexRowRefs = useRef<Array<HTMLDivElement | null>>([]);
  const categoryBtnRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const viewBtnRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const filteredProjects =
    activeCategory === 'All'
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeCategory);

  const handleCategoryKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (idx + 1) % CATEGORIES.length;
      setActiveCategory(CATEGORIES[nextIdx]);
      categoryBtnRefs.current[nextIdx]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (idx - 1 + CATEGORIES.length) % CATEGORIES.length;
      setActiveCategory(CATEGORIES[prevIdx]);
      categoryBtnRefs.current[prevIdx]?.focus();
    }
  };

  const handleViewSwitchKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    if (
      e.key === 'ArrowRight' ||
      e.key === 'ArrowLeft' ||
      e.key === 'ArrowDown' ||
      e.key === 'ArrowUp'
    ) {
      e.preventDefault();
      const nextIdx = idx === 0 ? 1 : 0;
      setViewMode(nextIdx === 0 ? 'bento' : 'index');
      viewBtnRefs.current[nextIdx]?.focus();
    }
  };

  const handleProjectKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    project: ProjectItem,
    idx: number,
    mode: 'bento' | 'index'
  ) => {
    if (e.target !== e.currentTarget) {
      // Let inner anchor links (Live / GitHub) handle their own Enter key naturally
      return;
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectProject(project);
      return;
    }

    const refs = mode === 'bento' ? cardRefs.current : indexRowRefs.current;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (idx + 1) % filteredProjects.length;
      refs[nextIdx]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx =
        (idx - 1 + filteredProjects.length) % filteredProjects.length;
      refs[prevIdx]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      refs[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      refs[filteredProjects.length - 1]?.focus();
    }
  };

  return (
    <section
      id="work"
      tabIndex={-1}
      aria-label="Selected Works and Case Studies"
      className="bg-transparent py-24 md:py-32 relative focus:outline-none"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Header with Staggered Fade-In-Up Text Entrance (elevated stacking context for Soundscape popover) */}
        <StaggerContainer
          staggerDelay={0.1}
          viewportMargin="-24px 0px -24px 0px"
          className="relative z-30 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-14 md:mb-18"
        >
          <div className="space-y-3">
            <FadeInUpItem className="flex items-center gap-3 mb-1">
              <span className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted uppercase tracking-[0.3em]">
                01 / Selected Works &amp; Highlights
              </span>
            </FadeInUpItem>
            <FadeInUpItem
              as="h2"
              className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-text-primary leading-[0.95]"
            >
              Featured <span className="font-display italic">case studies</span>
            </FadeInUpItem>
            <FadeInUpItem
              as="p"
              className="text-sm md:text-base text-muted max-w-xl"
            >
              Use{' '}
              <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-surface border border-stroke text-text-primary">
                Tab
              </kbd>{' '}
              or{' '}
              <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-surface border border-stroke text-text-primary">
                ← →
              </kbd>{' '}
              to navigate projects and press{' '}
              <kbd className="font-mono text-xs px-1.5 py-0.5 rounded bg-surface border border-stroke text-text-primary">
                Enter
              </kbd>{' '}
              to inspect full architecture, problem statements, and source code.
            </FadeInUpItem>
          </div>

          {/* Filter & View Switcher Controls */}
          <FadeInUpItem className="relative z-30 flex flex-wrap items-center gap-3">
            <div
              role="group"
              aria-label="Filter projects by category"
              className="inline-flex flex-wrap items-center gap-1 p-1.5 rounded-full bg-surface border border-stroke"
            >
              {CATEGORIES.map((category, idx) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    ref={(el) => {
                      categoryBtnRefs.current[idx] = el;
                    }}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveCategory(category)}
                    onKeyDown={(e) => handleCategoryKeyDown(e, idx)}
                    className={`px-4 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-text-primary text-bg font-medium'
                        : 'text-muted hover:text-text-primary'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <AmbientAudioToggle compact />

            <div
              role="group"
              aria-label="Switch project layout view"
              className="inline-flex items-center p-1.5 rounded-full bg-surface border border-stroke"
            >
              <button
                ref={(el) => {
                  viewBtnRefs.current[0] = el;
                }}
                type="button"
                aria-pressed={viewMode === 'bento'}
                onClick={() => setViewMode('bento')}
                onKeyDown={(e) => handleViewSwitchKeyDown(e, 0)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                  viewMode === 'bento'
                    ? 'bg-text-primary text-bg font-medium'
                    : 'text-muted hover:text-text-primary'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Bento Grid</span>
              </button>
              <button
                ref={(el) => {
                  viewBtnRefs.current[1] = el;
                }}
                type="button"
                aria-pressed={viewMode === 'index'}
                onClick={() => setViewMode('index')}
                onKeyDown={(e) => handleViewSwitchKeyDown(e, 1)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                  viewMode === 'index'
                    ? 'bg-text-primary text-bg font-medium'
                    : 'text-muted hover:text-text-primary'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Hover Index</span>
              </button>
            </div>
          </FadeInUpItem>
        </StaggerContainer>

        {/* MODE 1: Interactive Bento Showcase */}
        {viewMode === 'bento' ? (
          <div
            role="list"
            aria-label="Featured project cards"
            className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8"
          >
            {filteredProjects.map((project, idx) => {
              const patternIndex = idx % 4;
              const spanClass =
                patternIndex === 0 || patternIndex === 3
                  ? 'col-span-1 md:col-span-7'
                  : 'col-span-1 md:col-span-5';

              return (
                <BentoProjectCard
                  key={project.id}
                  project={project}
                  idx={idx}
                  spanClass={spanClass}
                  isKeyboardFocused={focusedProjectId === project.id}
                  cardRef={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  onSelectProject={onSelectProject}
                  onFocusProject={(p) => {
                    setFocusedProjectId(p.id);
                    setHoveredProject(p);
                  }}
                  onBlurProject={(p) => {
                    setFocusedProjectId((prev) => (prev === p.id ? '' : prev));
                  }}
                  onKeyDown={(e) =>
                    handleProjectKeyDown(e, project, idx, 'bento')
                  }
                />
              );
            })}
          </div>
        ) : (
          /* MODE 2: Interactive Hover & Keyboard-Focus Preview Index */
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div
              role="list"
              aria-label="Project index list"
              className="lg:col-span-7 border-t border-stroke"
            >
              {filteredProjects.map((project, idx) => {
                const isHovered = hoveredProject.id === project.id;
                return (
                  <motion.div
                    key={project.id}
                    ref={(el) => {
                      indexRowRefs.current[idx] = el;
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${project.number} ${project.name} (${project.year}). Press Enter to inspect case study, or Tab to open Live or GitHub links.`}
                    initial={{ opacity: 0, y: 22, scale: 0.96, filter: 'blur(6px)' }}
                    whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    viewport={{ once: false, amount: 0.15, margin: '-16px 0px -16px 0px' }}
                    transition={createPopInTransition((idx % 4) * 0.055)}
                    onMouseEnter={() => setHoveredProject(project)}
                    onFocusCapture={() => setHoveredProject(project)}
                    onKeyDown={(e) =>
                      handleProjectKeyDown(e, project, idx, 'index')
                    }
                    onClick={() => onSelectProject(project)}
                    className="group border-b border-stroke py-6 sm:py-8 px-3 rounded-xl flex items-center justify-between gap-4 cursor-pointer transition-colors focus-visible:bg-surface/60"
                  >
                    <div className="flex items-baseline gap-5">
                      <span className="font-mono text-xs text-muted group-hover:text-[#89AACC] group-focus-visible:text-[#89AACC] transition-colors">
                        {project.number}
                      </span>
                      <div>
                        <h3
                          className={`text-3xl sm:text-4xl font-display italic transition-all duration-300 ${
                            isHovered
                              ? 'text-text-primary translate-x-2'
                              : 'text-muted group-hover:text-text-primary'
                          }`}
                        >
                          {project.name}
                        </h3>
                        <p className="text-xs font-mono text-muted mt-1.5">
                          {project.techStack.join(' · ')}
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-2.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="hidden sm:inline-block text-xs font-mono text-muted mr-1">
                        {project.year}
                      </span>
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${project.name} live deployment`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-surface border border-stroke hover:border-[#89AACC] text-xs text-text-primary transition-colors"
                        >
                          <span>Live</span>
                          <ExternalLink className="w-3 h-3 text-[#89AACC]" />
                        </a>
                      )}
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${project.name} GitHub repository`}
                        className="w-9 h-9 rounded-full bg-surface border border-stroke hover:border-[#89AACC] flex items-center justify-center text-muted hover:text-text-primary transition-colors"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                      <span
                        onClick={() => onSelectProject(project)}
                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${
                          isHovered
                            ? 'bg-text-primary text-bg border-text-primary scale-105'
                            : 'border-stroke text-muted'
                        }`}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <AnimatePresence mode="wait">
                <motion.div
                  key={hoveredProject.id}
                  tabIndex={0}
                  role="button"
                  aria-label={`Open full case study for ${hoveredProject.name}`}
                  initial={{ opacity: 0, y: 16, scale: 0.94, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -12, scale: 0.96, filter: 'blur(4px)' }}
                  transition={POP_IN_SPRING_CONFIG}
                  onClick={() => onSelectProject(hoveredProject)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectProject(hoveredProject);
                    }
                  }}
                  className="rounded-3xl bg-surface border border-stroke overflow-hidden cursor-pointer shadow-2xl"
                >
                  <div className="aspect-[16/10] w-full overflow-hidden bg-bg">
                    <img
                      src={hoveredProject.col1Image1}
                      alt={hoveredProject.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between text-xs font-mono text-[#89AACC] mb-2">
                      <span>{hoveredProject.role}</span>
                      <span>{hoveredProject.duration}</span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed mb-4">
                      {hoveredProject.problemSolved}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-primary">
                      <span>Press Enter or click to open full case study</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#89AACC]" />
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
