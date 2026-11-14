import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { PROJECTS, ProjectItem } from '../data/portfolioData';
import { FlowingMenu, FlowingMenuItem } from './FlowingMenu';
import { Magnetic } from './Magnetic';
import { StaggerContainer, FadeInUpItem } from './StaggerFadeInUp';

interface ServicesSectionProps {
  onSelectProject?: (project: ProjectItem) => void;
  onOpenContact?: () => void;
  isDark?: boolean;
}

interface CapabilityItem {
  id: string;
  number: string;
  title: string;
  italicWord: string;
  tag: string;
  summary: string;
  deliverables: string[];
  featuredProjectId: string;
}

const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'fullstack',
    number: '01',
    title: 'Full-Stack Web &',
    italicWord: 'Mobile',
    tag: 'Next.js 15 · React · Ionic + Angular · Express',
    summary:
      'Building full-stack web apps, mobile ordering suites, and multi-team platforms with Prisma/PostgreSQL data modeling, REST/Socket APIs, and payment integrations.',
    deliverables: [
      'Next.js 15, React 18/19 & Ionic/Angular',
      'Prisma ORM & PostgreSQL (Neon/Supabase)',
      'AWS S3 & Socket.io Collaboration APIs',
      'PayMongo Webhooks & Vitest Testing',
    ],
    featuredProjectId: 'repxl',
  },
  {
    id: 'uiux',
    number: '02',
    title: 'Interactive UI/UX &',
    italicWord: 'Motion',
    tag: 'UI/UX Design · GSAP · Framer Motion · Tailwind CSS',
    summary:
      'Turning product requirements into user-friendly interfaces through research-grounded wireframes, responsive component layouts, and GSAP/Framer Motion scroll choreography.',
    deliverables: [
      'UI/UX Prototyping & User Flows',
      'GSAP ScrollTrigger Choreography',
      'Responsive Design Systems',
      'Usability & Accessibility Focus',
    ],
    featuredProjectId: 'lionheart',
  },
  {
    id: 'security',
    number: '03',
    title: 'Access Governance &',
    italicWord: 'Security',
    tag: 'Better Auth · Argon2id · RBAC · Audit Logs',
    summary:
      'Designing multi-role permission systems with deterministic approval routing, conflict-of-interest guards, email-code challenges, and immutable administrator audit histories.',
    deliverables: [
      'Role-Based Access Control (RBAC)',
      'Argon2id Credential Hashing',
      'Transactional Approval Workflows',
      'Account Security & Audit Trails',
    ],
    featuredProjectId: 'permora',
  },
  {
    id: 'vision',
    number: '04',
    title: 'Computer Vision &',
    italicWord: 'Systems',
    tag: 'Python 3.12 · OpenCV · MediaPipe · Java Swing',
    summary:
      'Building computer vision demos running across desktop OpenCV windows and browser Flask WebSocket streams, alongside object-oriented Java Swing desktop applications.',
    deliverables: [
      'OpenCV & MediaPipe Landmarks',
      'Flask + WebSocket Browser Streaming',
      'PyTorch Runtime Integration',
      'Java Swing Desktop Applications',
    ],
    featuredProjectId: 'visionforge',
  },
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  onSelectProject,
  onOpenContact,
  isDark = true,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const menuItems = useMemo<FlowingMenuItem[]>(
    () =>
      CAPABILITIES.map((cap) => {
        const linked =
          PROJECTS.find((p) => p.id === cap.featuredProjectId) || PROJECTS[0];
        return {
          id: cap.id,
          text: cap.title,
          italicWord: cap.italicWord,
          marquee: `${cap.number} · ${cap.title}`,
          meta: cap.tag,
          image: linked.col1Image1,
        };
      }),
    []
  );

  return (
    <section
      id="expertise"
      tabIndex={-1}
      aria-label="Expertise and Capabilities"
      className="bg-transparent py-24 md:py-36 relative focus:outline-none"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Section Header with Staggered Fade-In-Up Text Entrance */}
        <StaggerContainer
          staggerDelay={0.1}
          viewportMargin="-24px 0px -24px 0px"
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 md:mb-16"
        >
          <div className="space-y-3">
            <FadeInUpItem className="flex items-center gap-3 mb-1">
              <span className="w-8 h-px bg-stroke" />
              <span className="text-xs text-muted uppercase tracking-[0.3em]">
                03 / Expertise &amp; Capabilities
              </span>
            </FadeInUpItem>
            <FadeInUpItem
              as="h2"
              className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-text-primary leading-[0.95] max-w-2xl"
            >
              How I bring <span className="font-display italic">ideas</span> to
              life
            </FadeInUpItem>
          </div>

          {onOpenContact && (
            <FadeInUpItem className="self-start md:self-auto">
              <Magnetic strength={0.38}>
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="group relative rounded-full p-[1.5px] transition-transform duration-300 hover:scale-105 cursor-pointer"
                >
                  <span className="absolute inset-0 rounded-full accent-gradient" />
                  <span className="relative inline-flex items-center gap-2 rounded-full bg-bg px-6 py-3 text-xs font-medium text-text-primary whitespace-nowrap shrink-0">
                    <span>Discuss a project</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#89AACC]" />
                  </span>
                </button>
              </Magnetic>
            </FadeInUpItem>
          )}
        </StaggerContainer>

        {/* Interactive FlowingMenu Capabilities Stage with Inline Row Expansion */}
        <motion.div
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.1, margin: '-20px 0px -20px 0px' }}
          transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
          className="border-t border-b border-stroke"
        >
          <FlowingMenu
            items={menuItems}
            speed={52}
            stretch={0.6}
            magnet={0.22}
            followCursor={0.35}
            textColor={isDark ? '#f5f5f5' : '#0d0d11'}
            bgColor="transparent"
            marqueeBgColor={isDark ? '#dce8f5' : '#111622'}
            marqueeTextColor={isDark ? '#0a0d12' : '#f5f5f5'}
            borderColor="hsl(var(--stroke))"
            direction="alternate"
            duration={0.5}
            bandInset={6}
            bandRadius={14}
            carryContent={activeIndex < 0}
            dividers
            dimInactive
            align="left"
            showIndex
            accordionIcon
            imageShape="rounded"
            intro
            activeIndex={activeIndex}
            onItemClick={(_, idx) =>
              setActiveIndex((prev) => (prev === idx ? -1 : idx))
            }
            renderExpanded={(_, idx, isExpanded, panelId) => {
              const cap = CAPABILITIES[idx];
              if (!cap) return null;
              const linkedProject =
                PROJECTS.find((p) => p.id === cap.featuredProjectId) ||
                PROJECTS[0];

              return (
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key={cap.id}
                      id={panelId}
                      role="region"
                      aria-label={`${cap.title} ${cap.italicWord} details`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: 'auto',
                        opacity: 1,
                        transition: {
                          height: {
                            duration: 0.42,
                            ease: [0.22, 1, 0.36, 1],
                          },
                          opacity: {
                            duration: 0.28,
                            delay: 0.06,
                            ease: 'easeOut',
                          },
                        },
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                        transition: {
                          height: {
                            duration: 0.34,
                            ease: [0.22, 1, 0.36, 1],
                          },
                          opacity: {
                            duration: 0.18,
                            ease: 'easeIn',
                          },
                        },
                      }}
                      className="flowing-menu__panel overflow-hidden"
                    >
                      <motion.div
                        initial={{ y: -8 }}
                        animate={{
                          y: 0,
                          transition: {
                            duration: 0.34,
                            ease: [0.22, 1, 0.36, 1],
                          },
                        }}
                        exit={{
                          y: -4,
                          transition: { duration: 0.2, ease: 'easeIn' },
                        }}
                        className="px-4 sm:px-7 pb-8 pt-2 border-t border-stroke/40 bg-surface/25"
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-center pt-5">
                          <div className="lg:col-span-7 space-y-4">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted min-[960px]:hidden">
                              <span>{cap.tag}</span>
                            </div>

                            <p className="text-base sm:text-lg text-muted leading-relaxed max-w-2xl">
                              {cap.summary}
                            </p>

                            <div>
                              <div className="text-xs font-mono text-[#89AACC] mb-2">
                                Core Deliverables
                              </div>
                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:text-sm text-text-primary/90">
                                {cap.deliverables.map((del, dIdx) => (
                                  <React.Fragment key={del}>
                                    {dIdx > 0 && (
                                      <span
                                        className="text-stroke"
                                        aria-hidden="true"
                                      >
                                        ·
                                      </span>
                                    )}
                                    <span>{del}</span>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="lg:col-span-5">
                            <button
                              type="button"
                              aria-label={`Inspect featured case study: ${linkedProject.name} (${linkedProject.year})`}
                              onClick={() => onSelectProject?.(linkedProject)}
                              className="w-full text-left group/card rounded-2xl bg-surface border border-stroke hover:border-[#89AACC]/60 focus-visible:border-[#89AACC] p-4 flex items-center gap-4 cursor-pointer transition-all"
                            >
                              <div className="w-24 h-20 rounded-xl overflow-hidden bg-bg border border-stroke shrink-0 relative">
                                <img
                                  src={linkedProject.col1Image1}
                                  alt={linkedProject.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-[11px] font-mono text-[#89AACC] block">
                                  Featured Proof · {linkedProject.year}
                                </span>
                                <h3 className="text-lg font-display italic text-text-primary truncate">
                                  {linkedProject.name}
                                </h3>
                                <span className="inline-flex items-center gap-1 text-xs text-muted group-hover/card:text-text-primary group-focus-visible/card:text-text-primary transition-colors mt-1">
                                  <span>Inspect Case Study &amp; Code</span>
                                  <ArrowUpRight className="w-3.5 h-3.5 text-[#89AACC]" />
                                </span>
                              </div>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            }}
            ariaLabel="Core Engineering and Design Capabilities"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default ServicesSection;
