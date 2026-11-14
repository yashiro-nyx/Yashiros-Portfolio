import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  Check,
  ExternalLink,
  Mail,
  MapPin,
  GraduationCap,
} from 'lucide-react';
import {
  PROFILE_DATA,
  EXPERIENCES,
  PROJECTS,
  SKILL_GROUPS,
  CERTIFICATIONS,
} from '../data/portfolioData';
import { downloadResumePdf } from '../utils/generateResumePdf';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({ isOpen, onClose }) => {
  const [pdfSaved, setPdfSaved] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handlePrint = () => {
    // 1. Always generate & download a vector PDF so it works inside sandboxed iframes and offline
    downloadResumePdf();
    setPdfSaved(true);
    window.setTimeout(() => setPdfSaved(false), 2600);

    // 2. Also invoke native browser print dialog when running in an unsandboxed tab
    window.setTimeout(() => {
      try {
        window.print();
      } catch {
        // Ignore if sandboxed iframe blocks window.print()
      }
    }, 120);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="printable-resume-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6"
        >
          <motion.div
            id="printable-resume-sheet"
            data-lenis-prevent
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 12 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl rounded-3xl border border-stroke bg-surface p-6 sm:p-10 text-text-primary max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Top Action Bar */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-stroke">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#89AACC]">
                  Curriculum Vitae · Interactive Resume
                </span>
                <h2 className="text-3xl sm:text-5xl font-display italic tracking-tight mt-1">
                  {PROFILE_DATA.fullName}
                </h2>
                <p className="text-sm sm:text-base text-muted mt-0.5">
                  {PROFILE_DATA.title}
                </p>
              </div>

              <div data-print-hide className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="rounded-full bg-text-primary text-bg hover:opacity-90 px-5 py-2.5 text-xs font-medium inline-flex items-center gap-2 transition-all cursor-pointer"
                >
                  {pdfSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>PDF Saved ✓</span>
                    </>
                  ) : (
                    <>
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print / Save PDF</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close resume"
                  className="w-10 h-10 rounded-full border border-stroke bg-bg flex items-center justify-center text-muted hover:text-text-primary hover:border-[#89AACC] transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contact & Links Strip */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4 border-b border-stroke text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#89AACC]" />
                <span>{PROFILE_DATA.school}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#89AACC]" />
                <span>{PROFILE_DATA.location}</span>
              </span>
              <a
                href={`mailto:${PROFILE_DATA.email}`}
                className="inline-flex items-center gap-1.5 hover:text-text-primary"
              >
                <Mail className="w-3.5 h-3.5 text-[#89AACC]" />
                <span>{PROFILE_DATA.email}</span>
              </a>
              <a
                href={PROFILE_DATA.socials.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-text-primary"
              >
                <span>GitHub (@yashiro-nyx)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href={PROFILE_DATA.socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-text-primary"
              >
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Summary */}
            <div className="py-5 border-b border-stroke">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#89AACC] mb-2">
                Professional Summary
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {PROFILE_DATA.aboutBio}
              </p>
            </div>

            {/* Experience & Education */}
            <div className="py-5 border-b border-stroke">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#89AACC] mb-4">
                Education &amp; Engineering Highlights
              </h3>
              <div className="space-y-4">
                {EXPERIENCES.map((exp) => (
                  <div key={exp.id} className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm sm:text-base font-medium text-text-primary">
                        {exp.title}{' '}
                        <span className="text-muted font-normal">
                          · {exp.organization}
                        </span>
                      </h4>
                      <span className="font-mono text-xs text-muted tabular-nums">
                        {exp.period}
                      </span>
                    </div>
                    <ul className="mt-1 space-y-1">
                      {exp.highlights.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-xs sm:text-sm text-muted leading-relaxed flex items-start gap-2"
                        >
                          <span className="text-[#89AACC]">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured Projects */}
            <div className="py-5 border-b border-stroke">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#89AACC] mb-4">
                Selected Engineering &amp; Design Projects
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROJECTS.map((proj) => (
                  <div
                    key={proj.id}
                    className="rounded-2xl border border-stroke bg-bg p-4 flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-base font-display italic text-text-primary">
                          {proj.name}
                        </h4>
                        <span className="font-mono text-[11px] text-muted">
                          {proj.year}
                        </span>
                      </div>
                      <p className="text-xs text-[#89AACC] mt-0.5">
                        {proj.role}
                      </p>
                      <p className="text-xs text-muted mt-2 leading-relaxed">
                        {proj.problemSolved}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-stroke flex items-center justify-between text-[11px] font-mono text-muted">
                      <span>{proj.techStack.slice(0, 3).join(' · ')}</span>
                      {proj.liveUrl ? (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-[#89AACC]"
                        >
                          Live Demo ↗
                        </a>
                      ) : (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-[#89AACC]"
                        >
                          GitHub ↗
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Skills & Certifications */}
            <div className="py-5 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-[#89AACC] mb-3">
                  Technical Skills
                </h3>
                <div className="space-y-3">
                  {SKILL_GROUPS.map((group) => (
                    <div key={group.category}>
                      <span className="font-mono text-xs text-muted block">
                        {group.category}
                      </span>
                      <p className="text-xs sm:text-sm text-text-primary mt-0.5">
                        {group.skills.join(' · ')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-mono text-xs uppercase tracking-widest text-[#89AACC] mb-3">
                  Verified Certifications ({CERTIFICATIONS.length})
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-muted">
                  {CERTIFICATIONS.map((c) => (
                    <li key={c.id} className="truncate">
                      • <span className="text-text-primary">{c.title}</span> (
                      {c.issuer})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResumeModal;
