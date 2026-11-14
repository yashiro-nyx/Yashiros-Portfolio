import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  FolderGit2,
  FileText,
  Mail,
  Github,
  Linkedin,
  Layers,
  Award,
  User,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { PROFILE_DATA, PROJECTS, ProjectItem } from '../data/portfolioData';
import { useSmoothScroll } from './SmoothScrollProvider';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact: () => void;
  onOpenResume: () => void;
  onSelectProject: (project: ProjectItem) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenContact,
  onOpenResume,
  onSelectProject,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, isOpen]);

  const jumpTo = (selector: string) => {
    onClose();
    window.setTimeout(() => {
      scrollTo(selector, { offset: 0, duration: 1.35 });
      const el = document.querySelector<HTMLElement>(selector);
      if (el) {
        const firstInteractive = el.querySelector<HTMLElement>(
          'button:not([disabled]), [role="button"][tabindex="0"], a[href]'
        );
        window.setTimeout(() => {
          (firstInteractive || el).focus({ preventScroll: true });
        }, 320);
      }
    }, 60);
  };

  const quickActions = [
    {
      id: 'work',
      label: 'Jump to 01 / Selected Works',
      category: 'Section',
      icon: FolderGit2,
      action: () => jumpTo('#work'),
    },
    {
      id: 'tech-stack',
      label: 'Jump to 02 / Tech Stack & Ecosystem',
      category: 'Section',
      icon: Layers,
      action: () => jumpTo('#tech-stack'),
    },
    {
      id: 'expertise',
      label: 'Jump to 03 / Expertise & Capabilities',
      category: 'Section',
      icon: Layers,
      action: () => jumpTo('#expertise'),
    },
    {
      id: 'about',
      label: 'Jump to 04 / Career Highlights & Bio',
      category: 'Section',
      icon: User,
      action: () => jumpTo('#about'),
    },
    {
      id: 'explorations',
      label: 'Jump to 05 / Milestones & Highlights',
      category: 'Section',
      icon: Layers,
      action: () => jumpTo('#explorations'),
    },
    {
      id: 'credentials',
      label: 'Jump to 06 / Verified Certificates & Endorsements',
      category: 'Section',
      icon: Award,
      action: () => jumpTo('#credentials'),
    },
    {
      id: 'resume',
      label: 'View / Print Full Resume & CV',
      category: 'Action',
      icon: FileText,
      action: () => {
        onClose();
        onOpenResume();
      },
    },
    {
      id: 'contact',
      label: 'Open Client Project Inquiry Form',
      category: 'Action',
      icon: Mail,
      action: () => {
        onClose();
        onOpenContact();
      },
    },
    {
      id: 'github',
      label: 'GitHub Profile (@yashiro-nyx)',
      category: 'External',
      icon: Github,
      action: () => {
        window.open(
          PROFILE_DATA.socials.github,
          '_blank',
          'noopener,noreferrer'
        );
        onClose();
      },
    },
    {
      id: 'linkedin',
      label: 'LinkedIn Profile (Jervin Paul Romualdo)',
      category: 'External',
      icon: Linkedin,
      action: () => {
        window.open(
          PROFILE_DATA.socials.linkedin,
          '_blank',
          'noopener,noreferrer'
        );
        onClose();
      },
    },
  ];

  const filteredActions = quickActions.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredProjects = PROJECTS.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.techStack.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  const totalItems = filteredActions.length + filteredProjects.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown' && totalItems > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
      } else if (e.key === 'ArrowUp' && totalItems > 0) {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
      } else if (
        e.key === 'Enter' &&
        totalItems > 0 &&
        (document.activeElement?.tagName === 'INPUT' ||
          document.activeElement === document.body)
      ) {
        e.preventDefault();
        if (selectedIndex < filteredActions.length) {
          filteredActions[selectedIndex].action();
        } else {
          const projIdx = selectedIndex - filteredActions.length;
          const proj = filteredProjects[projIdx];
          if (proj) {
            onClose();
            onSelectProject(proj);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    onClose,
    totalItems,
    selectedIndex,
    filteredActions,
    filteredProjects,
    onSelectProject,
  ]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/75 backdrop-blur-md pt-20 sm:pt-28 px-4"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette Quick Jump"
            initial={{ opacity: 0, scale: 0.97, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl rounded-3xl border border-stroke bg-surface text-text-primary shadow-2xl overflow-hidden"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-stroke">
              <Search className="w-4 h-4 text-[#89AACC] shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects, capabilities, stack, or actions..."
                className="w-full bg-transparent text-sm text-text-primary placeholder:text-muted focus:outline-none"
              />
              <button
                type="button"
                onClick={onClose}
                aria-label="Close command palette"
                className="p-1 rounded-lg text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div
              data-lenis-prevent
              className="max-h-[60vh] overflow-y-auto p-2 space-y-4"
            >
              {filteredActions.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[#89AACC]">
                    Navigation &amp; Actions
                  </p>
                  <div className="space-y-0.5">
                    {filteredActions.map((item, idx) => {
                      const Icon = item.icon;
                      const isSelected = selectedIndex === idx;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={item.action}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onFocus={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl text-left text-sm transition-colors cursor-pointer ${
                            isSelected ? 'bg-bg border border-[#89AACC]/50' : 'hover:bg-bg'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-[#89AACC] shrink-0" />
                            <span>{item.label}</span>
                          </div>
                          <span className="text-[11px] font-mono text-muted">
                            {isSelected ? '↵ Enter' : item.category}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {filteredProjects.length > 0 && (
                <div>
                  <p className="px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-[#89AACC]">
                    Case Studies ({filteredProjects.length})
                  </p>
                  <div className="space-y-0.5">
                    {filteredProjects.map((project, pIdx) => {
                      const globalIdx = filteredActions.length + pIdx;
                      const isSelected = selectedIndex === globalIdx;
                      return (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectProject(project);
                          }}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                          onFocus={() => setSelectedIndex(globalIdx)}
                          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-2xl text-left text-sm transition-colors cursor-pointer ${
                            isSelected ? 'bg-bg border border-[#89AACC]/50' : 'hover:bg-bg'
                          }`}
                        >
                          <div>
                            <p className="font-display italic text-lg text-text-primary">
                              {project.name}
                            </p>
                            <p className="text-xs text-muted">
                              {project.subtitle} ·{' '}
                              {project.techStack.slice(0, 3).join(' · ')}
                            </p>
                          </div>
                          <ArrowUpRight className="w-4 h-4 text-[#89AACC] shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-stroke bg-bg flex items-center justify-between text-[11px] font-mono text-muted">
              <span>↑↓ / Tab to navigate · ↵ Enter to select · ESC to close</span>
              <span>@yashiro-nyx</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
