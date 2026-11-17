import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Copy,
  FileText,
  ArrowUpRight,
  Award,
  Briefcase,
  GraduationCap,
  ChevronDown,
} from 'lucide-react';
import {
  CERTIFICATIONS,
  EXPERIENCES,
  PROFILE_DATA,
  PROJECTS,
} from '../data/portfolioData';
import { Lanyard } from './Lanyard';
import { Magnetic } from './Magnetic';
import ScrollStack, {
  ScrollStackHandle,
  ScrollStackItem,
} from './ScrollStack';
import {
  StaggerContainer,
  FadeInUpItem,
  fadeInUpVariants,
} from './StaggerFadeInUp';

interface AboutSectionProps {
  onOpenResume: () => void;
  onOpenContact?: () => void;
}

const STATS_DATA = [
  {
    value: '3rd Yr',
    label: 'BSIT Student',
    detail: 'Technological Institute of the Philippines — QC',
    targetSection: '#about',
    expId: 'bsit-tip',
  },
  {
    value: String(PROJECTS.length).padStart(2, '0'),
    label: 'Projects & Contributions',
    detail: 'Web, Mobile (Ionic/Angular), Cloud S3, Vision & Java OOP',
    targetSection: '#work',
  },
  {
    value: String(CERTIFICATIONS.length).padStart(2, '0'),
    label: 'Certifications',
    detail: 'Cybersecurity, ICIP, Cloud DevOps & Full-Stack',
    targetSection: '#credentials',
  },
  {
    value: '05',
    label: 'Live Deployments',
    detail: 'RePXL, Permora, SyncTayo, LionHeart & SouCul',
    targetSection: '#about',
    expId: 'fullstack-systems',
  },
];

export const AboutSection: React.FC<AboutSectionProps> = ({
  onOpenResume,
  onOpenContact,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeExpIdx, setActiveExpIdx] = useState(0);
  const scrollStackRef = useRef<ScrollStackHandle | null>(null);
  const stackStageRef = useRef<HTMLDivElement | null>(null);
  const statRefs = React.useRef<Array<HTMLDivElement | null>>([]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PROFILE_DATA.email);
    setCopiedEmail(true);
    window.setTimeout(() => setCopiedEmail(false), 2000);
  };

  const focusStackCard = (idx: number) => {
    setActiveExpIdx(idx);
    scrollStackRef.current?.scrollToCard(idx);
  };

  const handleStatActivate = (stat: (typeof STATS_DATA)[number]) => {
    if (stat.expId) {
      const idx = EXPERIENCES.findIndex((e) => e.id === stat.expId);
      if (idx !== -1) {
        stackStageRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        window.setTimeout(() => {
          focusStackCard(idx);
        }, 280);
        return;
      }
    }
    if (stat.targetSection) {
      const el = document.querySelector<HTMLElement>(stat.targetSection);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        const firstInteractive = el.querySelector<HTMLElement>(
          'button:not([disabled]), [role="button"][tabindex="0"], a[href]'
        );
        window.setTimeout(() => {
          (firstInteractive || el).focus({ preventScroll: true });
        }, 350);
      }
    }
  };

  const getExpIcon = (type: string) => {
    if (type === 'Education') {
      return <GraduationCap className="w-4 h-4 text-[#89AACC]" />;
    }
    if (type === 'Full-Stack & Cloud' || type === 'Team & Mobile Engineering') {
      return <Briefcase className="w-4 h-4 text-[#89AACC]" />;
    }
    return <Award className="w-4 h-4 text-[#89AACC]" />;
  };

  return (
    <section
      id="about"
      tabIndex={-1}
      aria-label="About and Career Highlights"
      className="bg-transparent py-24 md:py-32 relative focus:outline-none"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-12 lg:px-16">
        {/* 4-Column Animated Milestone Strip with Staggered Fade-In-Up */}
        <StaggerContainer
          staggerDelay={0.09}
          viewportMargin="-24px 0px -24px 0px"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-20"
        >
          {STATS_DATA.map((stat, idx) => (
            <motion.div
              key={stat.label}
              variants={fadeInUpVariants}
              ref={(el) => {
                statRefs.current[idx] = el;
              }}
              tabIndex={0}
              role="button"
              aria-label={`${stat.value} ${stat.label}: ${stat.detail}. Press Enter to inspect.`}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.25 }}
              onClick={() => handleStatActivate(stat)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStatActivate(stat);
                } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  statRefs.current[(idx + 1) % STATS_DATA.length]?.focus();
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  statRefs.current[
                    (idx - 1 + STATS_DATA.length) % STATS_DATA.length
                  ]?.focus();
                }
              }}
              className="group bg-surface border border-stroke hover:border-[#89AACC]/60 focus-visible:border-[#89AACC] rounded-3xl p-6 sm:p-7 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-muted mb-2">
                <span>0{idx + 1} · HIGHLIGHT</span>
                <span className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 text-[#89AACC] transition-opacity">
                  ↵ Enter
                </span>
              </div>
              <div className="text-4xl sm:text-5xl md:text-6xl font-display italic text-text-primary tabular-nums leading-none mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-text-primary mb-1">
                {stat.label}
              </div>
              <p className="text-xs text-muted leading-relaxed">
                {stat.detail}
              </p>
              <div className="mt-4 h-[2px] w-10 accent-gradient group-hover:w-full group-focus-visible:w-full transition-all duration-500" />
            </motion.div>
          ))}
        </StaggerContainer>

        {/* Top 2-Column Split: Left-Aligned Bio & Actions (Left) + Interactive Black 3D Lanyard (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16 md:mb-20">
          {/* Left Column: Text & Actions */}
          <StaggerContainer
            staggerDelay={0.09}
            viewportMargin="-24px 0px -24px 0px"
            className="lg:col-span-6 space-y-6 text-left"
          >
            <FadeInUpItem className="flex items-center gap-3">
              <span className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted uppercase tracking-[0.3em]">
                04 / About &amp; Career Highlights
              </span>
            </FadeInUpItem>

            <FadeInUpItem
              as="h2"
              className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-text-primary leading-[0.98]"
            >
              Crafting systems with{' '}
              <span className="font-display italic">clarity</span> &amp;{' '}
              <span className="font-display italic">motion</span>
            </FadeInUpItem>

            <FadeInUpItem
              as="p"
              className="text-sm sm:text-base text-muted leading-relaxed max-w-xl"
            >
              {PROFILE_DATA.aboutBio}
            </FadeInUpItem>

            <FadeInUpItem className="flex flex-wrap items-center gap-3 pt-2">
              <Magnetic strength={0.35}>
                <button
                  type="button"
                  onClick={onOpenResume}
                  className="inline-flex items-center gap-2 rounded-full bg-text-primary text-bg px-5 py-2.5 text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Printable Resume / CV</span>
                </button>
              </Magnetic>

              <Magnetic strength={0.3}>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-2 rounded-full bg-surface border border-stroke hover:border-[#89AACC] px-4 py-2.5 text-xs text-text-primary transition-colors cursor-pointer"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#89AACC]" />
                      <span>Email Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-muted" />
                      <span>{PROFILE_DATA.email}</span>
                    </>
                  )}
                </button>
              </Magnetic>

              {onOpenContact && (
                <Magnetic strength={0.35}>
                  <button
                    type="button"
                    onClick={onOpenContact}
                    className="inline-flex items-center gap-1.5 rounded-full bg-surface border border-stroke hover:border-[#89AACC] px-4 py-2.5 text-xs text-[#89AACC] transition-colors cursor-pointer"
                  >
                    <span>Inquire</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </Magnetic>
              )}
            </FadeInUpItem>
          </StaggerContainer>

          {/* Right Column: Interactive Black 3D Lanyard Pass */}
          <motion.div
            initial={{ opacity: 0, y: 26, scale: 0.985 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.15, margin: '-20px 0px -20px 0px' }}
            transition={{ duration: 0.64, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 relative"
          >
            <div className="w-full h-[460px] sm:h-[540px] lg:h-[580px] relative">
              <Lanyard
                frontImage="/assets/aistudio/Graphite_Portrait_Cutout_ab45af46.png"
                backImage="/assets/aistudio/Orbital_Rift_Star_Emblem_85bf5aba.png"
                imageFit="cover"
                backImageFit="contain"
                cardColor="#0e0e11"
                orientation="portrait"
                finish="glossy"
                cornerRadius={0.3}
                size={0.62}
                anchor="center"
                strapLength={0.5}
                strapColor="#111111"
                strapWidth={0.65}
                metal="silver"
                gravity={1}
                damping={0.5}
                elasticity={0.5}
                breeze={0.5}
                interactive
                intro
              />
              <span className="pointer-events-none absolute bottom-2 right-3 text-[11px] font-mono text-muted/80">
                Drag or click pass to flip · @{PROFILE_DATA.handle}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Full-Width Interactive ScrollStack Deck */}
        <div ref={stackStageRef} className="w-full flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stroke/60 mb-4"
          >
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#89AACC]">
              Education, Engineering &amp; Project Highlights
            </span>

            <div className="flex items-center gap-3">
              <div
                className="flex items-center gap-1.5"
                role="tablist"
                aria-label="Jump to career highlight card"
              >
                {EXPERIENCES.map((exp, idx) => {
                  const isActive = activeExpIdx === idx;
                  return (
                    <button
                      key={exp.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Jump to ${exp.title}`}
                      onClick={() => focusStackCard(idx)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono tabular-nums transition-colors cursor-pointer border ${
                        isActive
                          ? 'bg-text-primary text-bg border-text-primary'
                          : 'bg-surface/60 text-muted border-stroke hover:border-[#89AACC]/60 hover:text-text-primary'
                      }`}
                    >
                      0{idx + 1}
                    </button>
                  );
                })}
              </div>
              <span className="text-xs font-mono text-muted tabular-nums">
                2024 — Present
              </span>
            </div>
          </motion.div>

          <div className="w-full h-[540px] sm:h-[580px]">
            <ScrollStack
              ref={scrollStackRef}
              itemDistance={90}
              itemStackDistance={24}
              stackPosition="10%"
              itemScale={0.045}
              baseScale={0.84}
              dimAmount={0.2}
              blurAmount={0}
              tiltAmount={0}
              rotationAmount={0}
              holdDistance={180}
              smoothScroll
              snap={false}
              onActiveIndexChange={setActiveExpIdx}
            >
              {EXPERIENCES.map((item, idx) => {
                const isActive = activeExpIdx === idx;
                return (
                  <ScrollStackItem
                    key={item.id}
                    itemClassName={`cursor-pointer ${
                      isActive
                        ? 'border-[#89AACC]/60'
                        : 'hover:border-[#89AACC]/40'
                    }`}
                  >
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`${item.title} at ${item.organization} (${item.period}). Click or press Enter to focus card.`}
                      onClick={() => focusStackCard(idx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          focusStackCard(idx);
                        }
                      }}
                      className="flex-1 flex flex-col justify-between focus:outline-none"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                          <div className="inline-flex items-center gap-2 text-xs font-mono text-[#89AACC]">
                            {getExpIcon(item.type)}
                            <span>{item.type}</span>
                            <span className="text-muted">·</span>
                            <span className="text-text-primary/90">
                              {item.organization}
                            </span>
                          </div>
                          <span className="font-mono text-xs text-muted tabular-nums">
                            {item.period}
                          </span>
                        </div>

                        <h3 className="text-2xl sm:text-4xl font-display italic text-text-primary leading-tight mb-5">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-t border-stroke/70 pt-5">
                        <ul className="space-y-2 text-xs sm:text-sm text-muted leading-relaxed max-w-3xl">
                          {item.highlights.map((hl) => (
                            <li key={hl} className="flex items-start gap-2.5">
                              <span className="text-[#89AACC] mt-0.5">—</span>
                              <span>{hl}</span>
                            </li>
                          ))}
                        </ul>

                        <div className="shrink-0 flex items-center gap-3 text-[11px] font-mono text-muted">
                          <span className="text-[#89AACC] tabular-nums">
                            0{idx + 1} / 0{EXPERIENCES.length}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            {idx < EXPERIENCES.length - 1 ? (
                              <>
                                <span>Scroll to stack</span>
                                <ChevronDown className="w-3 h-3 text-[#89AACC]" />
                              </>
                            ) : (
                              <span>End of timeline</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </ScrollStackItem>
                );
              })}
            </ScrollStack>
          </div>
        </div>
      </div>
    </section>
  );
};
