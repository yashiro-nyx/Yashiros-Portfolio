import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  ArrowUpRight,
  Award,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  LayoutGrid,
  List,
  Pause,
  Play,
  ShieldCheck,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  CERTIFICATIONS,
  CertificationItem,
  TESTIMONIALS,
} from '../data/portfolioData';
import { FolderFloat, FolderFloatItemInput } from './FolderFloat';
import {
  StaggerContainer,
  FadeInUpItem,
  createPopInTransition,
  HOVER_SPRING_CONFIG,
  POP_IN_SPRING_CONFIG,
} from './StaggerFadeInUp';

interface CertificationsSectionProps {
  isDark?: boolean;
}

type CredentialCategory =
  | 'All Credentials'
  | 'Security & ICIP'
  | 'Web & Cloud'
  | 'Core IT & Career';

const CREDENTIAL_CATEGORIES: CredentialCategory[] = [
  'All Credentials',
  'Security & ICIP',
  'Web & Cloud',
  'Core IT & Career',
];

const FEATURED_CREDENTIAL_IDS = [
  'cert11',
  'cert1',
  'cert9',
  'cert10',
  'cert8',
  'badge1',
];

const getCredentialCategory = (
  cert: CertificationItem
): Exclude<CredentialCategory, 'All Credentials'> => {
  const issuer = cert.issuer.toLowerCase();
  const title = cert.title.toLowerCase();
  if (
    issuer.includes('blackstride') ||
    issuer.includes('opswat') ||
    title.includes('cyber') ||
    title.includes('infrastructure')
  ) {
    return 'Security & ICIP';
  }
  if (
    issuer.includes('upskilltechph') ||
    title.includes('web') ||
    title.includes('cloud') ||
    title.includes('devops')
  ) {
    return 'Web & Cloud';
  }
  return 'Core IT & Career';
};

const getCredentialFocus = (cert: CertificationItem): string => {
  switch (cert.id) {
    case 'cert11':
      return 'OT/IT Convergence · Critical Infrastructure';
    case 'cert1':
      return 'Threat Landscapes · Defense Fundamentals';
    case 'cert9':
      return 'Full-Stack Web · Modern Frameworks';
    case 'cert10':
      return 'Cloud Deployment · CI/CD Pipelines';
    case 'cert8':
      return 'Git Collaboration · Engineering Workflow';
    case 'badge1':
      return 'Security Operations · Verified Badge';
    case 'cert7':
      return 'Logic & Algorithms · Core Coding';
    case 'cert2':
      return 'Emerging Tech · Industry Standards';
    case 'cert3':
      return 'Accredited Tech · Self-Directed Mastery';
    default:
      return 'Applied IT · Verified Technical Training';
  }
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const TILT_SPRING_CONFIG = { stiffness: 260, damping: 24, mass: 0.65 };
const ENDORSEMENT_AUTO_MS = 5500;

interface TiltCertificateCardProps {
  cert: CertificationItem;
  globalIndex: number;
  idx: number;
  variant: 'flagship' | 'standard';
  isFailed: boolean;
  onImageError: (id: string) => void;
  onSelect: (cert: CertificationItem) => void;
  cardRef: (el: HTMLButtonElement | null) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>) => void;
}

const TiltCertificateCard: React.FC<TiltCertificateCardProps> = ({
  cert,
  globalIndex,
  idx,
  variant,
  isFailed,
  onImageError,
  onSelect,
  cardRef,
  onKeyDown,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spotX = useMotionValue(50);
  const spotY = useMotionValue(50);

  const rotateX = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [4.5, -4.5]),
    TILT_SPRING_CONFIG
  );
  const rotateY = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-4.5, 4.5]),
    TILT_SPRING_CONFIG
  );
  const spotSpringX = useSpring(spotX, TILT_SPRING_CONFIG);
  const spotSpringY = useSpring(spotY, TILT_SPRING_CONFIG);

  const spotlightBackground = useMotionTemplate`radial-gradient(360px circle at ${spotSpringX}% ${spotSpringY}%, rgba(137, 170, 204, 0.16), transparent 70%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    mouseX.set(relX / rect.width - 0.5);
    mouseY.set(relY / rect.height - 0.5);
    spotX.set((relX / rect.width) * 100);
    spotY.set((relY / rect.height) * 100);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
    spotX.set(50);
    spotY.set(50);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setIsHovered(false);
    }
  };

  const categoryLabel = getCredentialCategory(cert);
  const focusLabel = getCredentialFocus(cert);
  const staggerDelay =
    variant === 'flagship'
      ? (idx % 2) * 0.085
      : (Math.max(0, idx - 2) % 3) * 0.075 + 0.04;

  return (
    <motion.div
      role="listitem"
      initial={{ opacity: 0, y: 32, scale: 0.92, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: false, amount: 0.12, margin: '-20px 0px -20px 0px' }}
      whileHover={{ y: -6, scale: 1.015, transition: HOVER_SPRING_CONFIG }}
      whileTap={{ scale: 0.985, transition: HOVER_SPRING_CONFIG }}
      transition={createPopInTransition(staggerDelay)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onFocus={() => setIsHovered(true)}
      onBlur={handleBlur}
      style={{
        perspective: 1100,
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`group relative rounded-3xl ${
        variant === 'flagship' ? 'lg:col-span-6' : 'lg:col-span-4'
      }`}
    >
      <button
        ref={cardRef}
        type="button"
        aria-label={`Inspect certificate ${globalIndex + 1} of ${CERTIFICATIONS.length}: ${cert.title} issued by ${cert.issuer} on ${cert.issueDate}`}
        onClick={() => onSelect(cert)}
        onKeyDown={onKeyDown}
        className={`relative w-full h-full text-left rounded-3xl bg-surface/80 hover:bg-surface border border-stroke group-hover:border-[#89AACC]/60 focus-visible:border-[#89AACC] transition-colors duration-300 overflow-hidden cursor-pointer ${
          variant === 'flagship'
            ? 'p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center'
            : 'p-5 flex flex-col justify-between'
        }`}
      >
        {/* Dynamic Specular Cursor Sheen */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            background: spotlightBackground,
            opacity: isHovered ? 1 : 0,
          }}
        />

        {/* Certificate Artwork Frame */}
        <div
          className={`relative z-10 w-full rounded-xl bg-bg border border-stroke overflow-hidden ${
            variant === 'flagship'
              ? 'md:col-span-5 aspect-[16/11]'
              : 'aspect-[16/10] mb-5'
          }`}
        >
          {!isFailed ? (
            <img
              src={cert.image}
              alt={`${cert.title} certificate issued by ${cert.issuer}`}
              referrerPolicy="no-referrer"
              loading="lazy"
              onError={() => onImageError(cert.id)}
              className="w-full h-full object-cover group-hover:scale-[1.04] group-focus-visible:scale-[1.04] transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-surface to-bg">
              <Award className="w-7 h-7 text-[#89AACC] mb-2" />
              <span className="text-xs font-mono text-text-primary">
                {cert.issuer}
              </span>
              <span className="text-[11px] text-muted mt-0.5 line-clamp-1">
                {cert.title}
              </span>
            </div>
          )}

          <span
            aria-hidden="true"
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-bg/85 backdrop-blur-md border border-stroke/80 text-text-primary opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-hover:border-[#89AACC] group-hover:text-[#89AACC] flex items-center justify-center transition-all duration-300"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Metadata & Narrative Body */}
        <div
          className={`relative z-10 flex flex-col justify-between h-full ${
            variant === 'flagship' ? 'md:col-span-7 py-1' : 'px-1'
          }`}
        >
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#89AACC] tabular-nums mb-2">
              <span>{String(globalIndex + 1).padStart(2, '0')}</span>
              <span aria-hidden="true" className="text-muted">
                ·
              </span>
              <span className="truncate">{cert.issuer}</span>
            </div>

            <h3
              className={`font-display italic text-text-primary group-hover:text-[#89AACC] group-focus-visible:text-[#89AACC] transition-colors leading-snug mb-2 ${
                variant === 'flagship'
                  ? 'text-xl sm:text-2xl line-clamp-2'
                  : 'text-xl line-clamp-2'
              }`}
            >
              {cert.title}
            </h3>

            <p
              className={`text-xs sm:text-sm text-muted leading-relaxed mb-4 ${
                variant === 'flagship' ? 'line-clamp-3' : 'line-clamp-2'
              }`}
            >
              {cert.description}
            </p>
          </div>

          <div className="pt-3 border-t border-stroke/80 flex items-center justify-between gap-2 text-[11px] font-mono text-muted">
            <span className="truncate">
              {variant === 'flagship' ? focusLabel : categoryLabel}
            </span>
            <span className="text-text-primary/80 group-hover:text-[#89AACC] transition-colors shrink-0">
              Inspect ↵
            </span>
          </div>
        </div>
      </button>

      {/* Subtle Hover / Focus Reveal Mini-Tooltip showing Issue Date + Verify Link */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            key={`${cert.id}-verify-reveal`}
            role="group"
            aria-label={`Verification details for ${cert.title}`}
            initial={{ opacity: 0, y: 10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={POP_IN_SPRING_CONFIG}
            style={{ transform: 'translateZ(26px)' }}
            className={`absolute bottom-3.5 z-30 rounded-2xl bg-bg/95 backdrop-blur-xl border border-[#89AACC]/45 shadow-2xl px-3.5 py-2.5 flex items-center justify-between gap-3 ${
              variant === 'flagship'
                ? 'inset-x-3.5 md:left-auto md:right-4 md:w-[calc(58.333%-1.25rem)]'
                : 'inset-x-3.5'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0 text-[11px] font-mono">
              <Calendar className="w-3.5 h-3.5 text-[#89AACC] shrink-0" />
              <span className="text-text-primary truncate">
                {cert.issueDate}
              </span>
            </div>

            <a
              href={cert.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              aria-label={`Verify ${cert.title} certificate from ${cert.issuer} in a new tab`}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-text-primary text-bg hover:bg-[#89AACC] hover:text-[#0a0a0a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#89AACC] text-[11px] font-medium transition-colors whitespace-nowrap shrink-0"
            >
              <span>Verify</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  isDark = true,
}) => {
  const certCardRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const categoryRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const endorsementDeckRef = useRef<HTMLDivElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);
  const progressValueRef = useRef(0);
  const isDeckInView = useInView(endorsementDeckRef, { amount: 0.2 });

  const [selectedCategory, setSelectedCategory] =
    useState<CredentialCategory>('All Credentials');
  const [viewMode, setViewMode] = useState<'gallery' | 'archive'>('gallery');
  const [showAllInDefault, setShowAllInDefault] = useState(false);
  const [lightboxCert, setLightboxCert] = useState<CertificationItem | null>(
    null
  );
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
  const [isDeckInteracting, setIsDeckInteracting] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredCertificates = useMemo(() => {
    if (selectedCategory === 'All Credentials') {
      return CERTIFICATIONS;
    }
    return CERTIFICATIONS.filter(
      (cert) => getCredentialCategory(cert) === selectedCategory
    );
  }, [selectedCategory]);

  const displayedCertificates = useMemo(() => {
    if (
      viewMode === 'gallery' &&
      selectedCategory === 'All Credentials' &&
      !showAllInDefault
    ) {
      return FEATURED_CREDENTIAL_IDS.map((id) =>
        filteredCertificates.find((c) => c.id === id)
      ).filter((c): c is CertificationItem => Boolean(c));
    }
    return filteredCertificates;
  }, [filteredCertificates, selectedCategory, showAllInDefault, viewMode]);

  const uniqueIssuers = useMemo(() => {
    return Array.from(new Set(CERTIFICATIONS.map((c) => c.issuer)));
  }, []);

  const folderItems = useMemo<FolderFloatItemInput[]>(
    () =>
      TESTIMONIALS.map((t) => ({
        label: t.folderNote,
        value: t.id,
        tooltipTitle: t.name,
        tooltip: t.role,
      })),
    []
  );

  const activeTestimonial = TESTIMONIALS[activeQuoteIdx] ?? TESTIMONIALS[0];

  const selectQuote = useCallback(
    (nextIndex: number) => {
      if (nextIndex === activeQuoteIdx) return;
      const len = TESTIMONIALS.length;
      const forwardSteps = (nextIndex - activeQuoteIdx + len) % len;
      setSlideDirection(forwardSteps <= len / 2 ? 1 : -1);
      progressValueRef.current = 0;
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = 'scaleX(0)';
      }
      setActiveQuoteIdx(nextIndex);
    },
    [activeQuoteIdx]
  );

  const stepQuote = useCallback((delta: 1 | -1) => {
    setSlideDirection(delta);
    progressValueRef.current = 0;
    if (progressBarRef.current) {
      progressBarRef.current.style.transform = 'scaleX(0)';
    }
    setActiveQuoteIdx(
      (prev) => (prev + delta + TESTIMONIALS.length) % TESTIMONIALS.length
    );
  }, []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setPrefersReducedMotion(mq.matches);
    syncPreference();
    mq.addEventListener('change', syncPreference);
    return () => mq.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    const shouldAutoAdvance =
      isAutoPlayEnabled &&
      isDeckInView &&
      !isDeckInteracting &&
      !lightboxCert &&
      !prefersReducedMotion &&
      TESTIMONIALS.length > 1;

    if (!shouldAutoAdvance) return;

    let rafId = 0;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 120);
      lastTime = now;

      progressValueRef.current += dt / ENDORSEMENT_AUTO_MS;

      if (progressValueRef.current >= 1) {
        progressValueRef.current = 0;
        if (progressBarRef.current) {
          progressBarRef.current.style.transform = 'scaleX(0)';
        }
        setSlideDirection(1);
        setActiveQuoteIdx((prev) => (prev + 1) % TESTIMONIALS.length);
        return;
      }

      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${progressValueRef.current})`;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [
    activeQuoteIdx,
    isAutoPlayEnabled,
    isDeckInView,
    isDeckInteracting,
    lightboxCert,
    prefersReducedMotion,
  ]);

  const markImageFailed = (id: string) => {
    setFailedImages((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
  };

  useEffect(() => {
    setIsZoomed(false);
  }, [lightboxCert?.id]);

  // Keyboard support for Certificate Lightbox (Escape to close, ArrowLeft/ArrowRight to cycle)
  useEffect(() => {
    if (!lightboxCert) return;
    const activePool =
      filteredCertificates.length > 0 ? filteredCertificates : CERTIFICATIONS;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxCert(null);
      } else if (e.key === 'ArrowRight') {
        const curIdx = activePool.findIndex((c) => c.id === lightboxCert.id);
        const safeIdx = curIdx === -1 ? 0 : curIdx;
        const nextIdx = (safeIdx + 1) % activePool.length;
        setLightboxCert(activePool[nextIdx]);
      } else if (e.key === 'ArrowLeft') {
        const curIdx = activePool.findIndex((c) => c.id === lightboxCert.id);
        const safeIdx = curIdx === -1 ? 0 : curIdx;
        const prevIdx = (safeIdx - 1 + activePool.length) % activePool.length;
        setLightboxCert(activePool[prevIdx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxCert, filteredCertificates]);

  const handleCategoryKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (idx + 1) % CREDENTIAL_CATEGORIES.length;
      setSelectedCategory(CREDENTIAL_CATEGORIES[nextIdx]);
      categoryRefs.current[nextIdx]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx =
        (idx - 1 + CREDENTIAL_CATEGORIES.length) % CREDENTIAL_CATEGORIES.length;
      setSelectedCategory(CREDENTIAL_CATEGORIES[prevIdx]);
      categoryRefs.current[prevIdx]?.focus();
    }
  };

  const cycleLightbox = (direction: 'prev' | 'next') => {
    if (!lightboxCert) return;
    const activePool =
      filteredCertificates.length > 0 ? filteredCertificates : CERTIFICATIONS;
    const curIdx = activePool.findIndex((c) => c.id === lightboxCert.id);
    const safeIdx = curIdx === -1 ? 0 : curIdx;
    const nextIdx =
      direction === 'next'
        ? (safeIdx + 1) % activePool.length
        : (safeIdx - 1 + activePool.length) % activePool.length;
    setLightboxCert(activePool[nextIdx]);
  };

  const lightboxPool =
    filteredCertificates.length > 0 ? filteredCertificates : CERTIFICATIONS;
  const lightboxIndex = lightboxCert
    ? Math.max(
        0,
        lightboxPool.findIndex((c) => c.id === lightboxCert.id)
      )
    : 0;

  // Split gallery items into flagship spotlight pair (top 2 when >= 4 items) + remaining 3-col cards
  const useFlagshipPair =
    viewMode === 'gallery' && displayedCertificates.length >= 4;
  const flagshipItems = useFlagshipPair
    ? displayedCertificates.slice(0, 2)
    : [];
  const gridItems = useFlagshipPair
    ? displayedCertificates.slice(2)
    : displayedCertificates;

  return (
    <section
      id="credentials"
      tabIndex={-1}
      aria-label="Verified Certificates and Trust Endorsements"
      className="bg-transparent py-24 md:py-36 relative overflow-x-clip focus:outline-none"
    >
      <div className="max-w-[1240px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Editorial Section Header + Authority Summary */}
        <StaggerContainer
          staggerDelay={0.09}
          viewportMargin="-30px 0px -30px 0px"
          className="mb-10 space-y-5"
        >
          <FadeInUpItem className="flex items-center gap-3">
            <span className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">
              06 · Credentials
            </span>
          </FadeInUpItem>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <FadeInUpItem
              as="h2"
              className="text-4xl sm:text-6xl font-light tracking-tight text-text-primary leading-[0.95] max-w-2xl"
            >
              Verified <span className="font-display italic">certificates</span>{' '}
              &amp; trust
            </FadeInUpItem>

            <FadeInUpItem
              as="p"
              className="text-sm text-muted max-w-md leading-relaxed"
            >
              {CERTIFICATIONS.length} industry-verified credentials across{' '}
              {uniqueIssuers.length} organizations covering critical
              infrastructure protection, cybersecurity, cloud, and full-stack
              engineering.
            </FadeInUpItem>
          </div>

          {/* Clean Unboxed Issuer Provenance Line */}
          <FadeInUpItem className="pt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
            <span className="font-mono text-[#89AACC] inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Issuing Authorities:
            </span>
            {uniqueIssuers.map((issuer, idx) => (
              <React.Fragment key={issuer}>
                <span className="text-text-primary/85">{issuer}</span>
                {idx < uniqueIssuers.length - 1 && (
                  <span aria-hidden="true" className="text-stroke">
                    ·
                  </span>
                )}
              </React.Fragment>
            ))}
          </FadeInUpItem>
        </StaggerContainer>

        {/* Interactive Filter Controls + Gallery / Archive View Switch */}
        <motion.div
          initial={{ opacity: 0, y: 18, filter: 'blur(5px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 'some', margin: '-20px 0px -20px 0px' }}
          transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 mb-10 border-b border-stroke"
        >
          <div
            role="group"
            aria-label="Filter certificates by discipline"
            className="flex flex-wrap items-center gap-2"
          >
            {CREDENTIAL_CATEGORIES.map((category, idx) => {
              const isActive = selectedCategory === category;
              const count =
                category === 'All Credentials'
                  ? CERTIFICATIONS.length
                  : CERTIFICATIONS.filter(
                      (c) => getCredentialCategory(c) === category
                    ).length;

              return (
                <button
                  key={category}
                  ref={(el) => {
                    categoryRefs.current[idx] = el;
                  }}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelectedCategory(category)}
                  onKeyDown={(e) => handleCategoryKeyDown(e, idx)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap shrink-0 border ${
                    isActive
                      ? 'bg-text-primary text-bg border-text-primary font-medium'
                      : 'bg-surface/60 text-muted border-stroke hover:text-text-primary hover:border-[#89AACC]/50'
                  }`}
                >
                  <span>{category}</span>
                  <span
                    className={`font-mono text-[10px] tabular-nums ${
                      isActive ? 'text-bg/70' : 'text-muted/80'
                    }`}
                  >
                    {String(count).padStart(2, '0')}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
            <span className="text-xs font-mono text-muted tabular-nums">
              {String(displayedCertificates.length).padStart(2, '0')} /{' '}
              {String(filteredCertificates.length).padStart(2, '0')} shown
            </span>

            <div
              role="group"
              aria-label="Toggle credentials display mode"
              className="inline-flex items-center p-1 rounded-full bg-surface border border-stroke"
            >
              <button
                type="button"
                aria-pressed={viewMode === 'gallery'}
                onClick={() => setViewMode('gallery')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  viewMode === 'gallery'
                    ? 'bg-text-primary text-bg font-medium'
                    : 'text-muted hover:text-text-primary'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Gallery</span>
              </button>
              <button
                type="button"
                aria-pressed={viewMode === 'archive'}
                onClick={() => setViewMode('archive')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  viewMode === 'archive'
                    ? 'bg-text-primary text-bg font-medium'
                    : 'text-muted hover:text-text-primary'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Ledger</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Credentials Showcase: Editorial Bento Gallery OR Crisp Verification Ledger */}
        {viewMode === 'gallery' ? (
          <>
            <div
              role="list"
              aria-label="Verified certificates gallery"
              className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-10"
            >
              {flagshipItems.map((cert, idx) => {
                const globalIndex = CERTIFICATIONS.findIndex(
                  (item) => item.id === cert.id
                );
                return (
                  <TiltCertificateCard
                    key={cert.id}
                    cert={cert}
                    globalIndex={globalIndex}
                    idx={idx}
                    variant="flagship"
                    isFailed={Boolean(failedImages[cert.id])}
                    onImageError={markImageFailed}
                    onSelect={setLightboxCert}
                    cardRef={(el) => {
                      certCardRefs.current[idx] = el;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        const nextIdx =
                          (idx + 1) % displayedCertificates.length;
                        certCardRefs.current[nextIdx]?.focus();
                      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prevIdx =
                          (idx - 1 + displayedCertificates.length) %
                          displayedCertificates.length;
                        certCardRefs.current[prevIdx]?.focus();
                      }
                    }}
                  />
                );
              })}

              {gridItems.map((cert, subIdx) => {
                const idx = flagshipItems.length + subIdx;
                const globalIndex = CERTIFICATIONS.findIndex(
                  (item) => item.id === cert.id
                );
                return (
                  <TiltCertificateCard
                    key={cert.id}
                    cert={cert}
                    globalIndex={globalIndex}
                    idx={idx}
                    variant="standard"
                    isFailed={Boolean(failedImages[cert.id])}
                    onImageError={markImageFailed}
                    onSelect={setLightboxCert}
                    cardRef={(el) => {
                      certCardRefs.current[idx] = el;
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        e.preventDefault();
                        const nextIdx =
                          (idx + 1) % displayedCertificates.length;
                        certCardRefs.current[nextIdx]?.focus();
                      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        e.preventDefault();
                        const prevIdx =
                          (idx - 1 + displayedCertificates.length) %
                          displayedCertificates.length;
                        certCardRefs.current[prevIdx]?.focus();
                      }
                    }}
                  />
                );
              })}
            </div>

            {selectedCategory === 'All Credentials' &&
              CERTIFICATIONS.length > 6 && (
                <div className="flex justify-center mb-24">
                  <button
                    type="button"
                    onClick={() => setShowAllInDefault((prev) => !prev)}
                    className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-surface hover:bg-surface/90 border border-stroke hover:border-[#89AACC] text-xs sm:text-sm font-medium text-text-primary transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>
                      {showAllInDefault
                        ? 'Collapse to 06 featured credentials'
                        : `View all ${CERTIFICATIONS.length} verified credentials`}
                    </span>
                    {showAllInDefault ? (
                      <ChevronUp className="w-4 h-4 text-[#89AACC]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#89AACC]" />
                    )}
                  </button>
                </div>
              )}

            {selectedCategory !== 'All Credentials' && (
              <div className="mb-20" />
            )}
          </>
        ) : (
          /* Crisp Verification Ledger View */
          <motion.div
            initial={{ opacity: 0, y: 22, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.08, margin: '-20px 0px -20px 0px' }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl bg-surface/75 border border-stroke overflow-hidden mb-24"
          >
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 border-b border-stroke text-[11px] font-mono uppercase tracking-[0.2em] text-muted">
              <div className="col-span-1">No.</div>
              <div className="col-span-4">Certificate</div>
              <div className="col-span-2">Issuer</div>
              <div className="col-span-2">Record</div>
              <div className="col-span-3 text-right">Actions</div>
            </div>

            <div role="list" className="divide-y divide-stroke/70">
              {filteredCertificates.map((cert, rowIdx) => {
                const globalIndex = CERTIFICATIONS.findIndex(
                  (item) => item.id === cert.id
                );
                return (
                  <motion.div
                    key={cert.id}
                    role="listitem"
                    initial={{ opacity: 0, y: 18, scale: 0.97, filter: 'blur(5px)' }}
                    whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    viewport={{ once: false, amount: 'some', margin: '-16px 0px -16px 0px' }}
                    transition={createPopInTransition(Math.min(rowIdx * 0.04, 0.22))}
                    className="px-6 py-4 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center hover:bg-bg/70 transition-colors group"
                  >
                    <div className="md:col-span-1 text-xs font-mono text-[#89AACC] tabular-nums">
                      {String(globalIndex + 1).padStart(2, '0')}
                    </div>

                    <button
                      type="button"
                      onClick={() => setLightboxCert(cert)}
                      className="md:col-span-4 flex items-center gap-3.5 min-w-0 text-left cursor-pointer"
                    >
                      <div className="w-14 h-10 rounded-lg bg-bg border border-stroke overflow-hidden shrink-0">
                        {!failedImages[cert.id] ? (
                          <img
                            src={cert.image}
                            alt={cert.title}
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            onError={() => markImageFailed(cert.id)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Award className="w-4 h-4 text-[#89AACC]" />
                          </div>
                        )}
                      </div>
                      <span className="text-base sm:text-lg font-display italic text-text-primary group-hover:text-[#89AACC] transition-colors truncate">
                        {cert.title}
                      </span>
                    </button>

                    <div className="md:col-span-2 text-xs font-mono text-text-primary/85 truncate">
                      {cert.issuer}
                    </div>

                    <div className="md:col-span-2 text-xs font-mono text-muted tabular-nums">
                      {cert.issueDate}
                    </div>

                    <div className="md:col-span-3 flex items-center md:justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setLightboxCert(cert)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-bg border border-stroke hover:border-[#89AACC] text-xs font-mono text-text-primary transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={cert.verifyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-text-primary text-bg hover:bg-[#89AACC] hover:text-[#0a0a0a] text-xs font-medium transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Verify</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Interactive Trusted By Clients, Teammates & Partners Section */}
        <StaggerContainer
          staggerDelay={0.1}
          viewportMargin="-30px 0px -30px 0px"
          className="border-t border-stroke pt-16 md:pt-20"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <FadeInUpItem
                as="span"
                className="text-xs font-mono uppercase tracking-[0.25em] text-muted block mb-2"
              >
                Clients, Teammates &amp; Collaborators
              </FadeInUpItem>
              <FadeInUpItem
                as="h3"
                className="text-3xl sm:text-5xl font-light tracking-tight text-text-primary leading-[1.02]"
              >
                Trusted by{' '}
                <span className="font-display italic">
                  clients, teammates &amp; more
                </span>
              </FadeInUpItem>
            </div>

            <FadeInUpItem className="text-xs font-mono text-muted max-w-xs md:text-right">
              Explore the interactive dossier or let the carousel cycle through
              perspectives from teammates, leads, and clients.
            </FadeInUpItem>
          </div>

          {/* Separated Open Layout: Interactive Folder (Left) & Unboxed Message Carousel (Right) */}
          <motion.div
            ref={endorsementDeckRef}
            initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: false, amount: 0.12, margin: '-20px 0px -20px 0px' }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setIsDeckInteracting(true)}
            onMouseLeave={() => setIsDeckInteracting(false)}
            onFocus={() => setIsDeckInteracting(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                setIsDeckInteracting(false);
              }
            }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center pt-4"
          >
            {/* Left Side: Pure Interactive Folder (No Box / No Card) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative py-6">
              {/* Soft studio ambient glow behind folder */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-75"
                style={{
                  background:
                    'radial-gradient(circle at 50% 60%, rgba(137, 170, 204, 0.14), transparent 62%)',
                }}
              />

              <div className="relative z-10 flex flex-col items-center justify-end pt-28 pb-5">
                <FolderFloat
                  items={folderItems}
                  label="Trust & Feedback"
                  sublabel={`${TESTIMONIALS.length} perspectives`}
                  trigger="hover"
                  closeOnSelect={false}
                  physics
                  drift={0.75}
                  burst={1.65}
                  activeIndex={activeQuoteIdx}
                  onSelect={(_, index) => selectQuote(index)}
                  folderColor={isDark ? '#0f0f10' : '#ebe9e4'}
                  frontColor={isDark ? '#141414' : '#ffffff'}
                  paperColor={isDark ? '#dce8f5' : '#3572b0'}
                  itemColor={isDark ? '#141414' : '#ffffff'}
                  itemTextColor={isDark ? '#f5f5f5' : '#0d0d11'}
                  labelColor={isDark ? '#f5f5f5' : '#0d0d11'}
                  width={228}
                  height={160}
                  radius={18}
                  spread={195}
                  lift={34}
                  tilt={12}
                  flapAngle={44}
                  restAngle={16}
                  openDuration={420}
                  stagger={45}
                  bounce={0.55}
                />
              </div>

              <p className="relative z-10 text-[11px] font-mono text-muted/90 text-center">
                Hover folder · drag or click floating notes
              </p>
            </div>

            {/* Right Side: Unboxed Editorial Message Carousel (No Box / No Card) */}
            <blockquote
              aria-live="polite"
              aria-roledescription="carousel"
              aria-label="Collaborator and client endorsements"
              className="lg:col-span-7 flex flex-col justify-between relative"
            >
              {/* Top Meta & Carousel Controls Row */}
              <div className="pb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 text-xs font-mono min-w-0">
                  <span className="text-muted tabular-nums shrink-0">
                    {String(activeQuoteIdx + 1).padStart(2, '0')} /{' '}
                    {String(TESTIMONIALS.length).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true" className="text-stroke">
                    ·
                  </span>
                  <span className="text-[#89AACC] font-medium truncate">
                    {activeTestimonial.relationship}
                  </span>
                  <span aria-hidden="true" className="text-stroke hidden sm:inline">
                    ·
                  </span>
                  <span className="text-muted truncate hidden sm:inline">
                    {activeTestimonial.folderNote}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsAutoPlayEnabled((prev) => !prev)}
                    aria-pressed={!isAutoPlayEnabled}
                    aria-label={
                      isAutoPlayEnabled
                        ? 'Pause automatic endorsement rotation'
                        : 'Resume automatic endorsement rotation'
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-stroke/80 hover:border-[#89AACC] text-[11px] font-mono text-muted hover:text-text-primary transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isAutoPlayEnabled && !isDeckInteracting ? (
                      <>
                        <Pause className="w-3 h-3 text-[#89AACC]" />
                        <span>Auto</span>
                      </>
                    ) : isAutoPlayEnabled && isDeckInteracting ? (
                      <>
                        <Pause className="w-3 h-3 text-[#89AACC]" />
                        <span>Hold</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 text-[#89AACC]" />
                        <span>Paused</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      aria-label="Previous endorsement message"
                      onClick={() => stepQuote(-1)}
                      className="w-8 h-8 rounded-full border border-stroke/80 hover:border-[#89AACC] flex items-center justify-center text-text-primary transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Next endorsement message"
                      onClick={() => stepQuote(1)}
                      className="w-8 h-8 rounded-full border border-stroke/80 hover:border-[#89AACC] flex items-center justify-center text-text-primary transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Clean 2px Hairline Auto-Advance Progress Track */}
              <div
                aria-hidden="true"
                className="h-[2px] w-full bg-stroke/40 overflow-hidden mb-7 sm:mb-8"
              >
                <div
                  ref={progressBarRef}
                  style={{ transform: 'scaleX(0)' }}
                  className="h-full w-full bg-gradient-to-r from-[#4E85BF] via-[#89AACC] to-[#DCEBFF] origin-left will-change-transform"
                />
              </div>

              {/* Editorial Quote Carousel Slide Stage */}
              <div className="min-h-[215px] flex flex-col justify-between gap-8 overflow-hidden">
                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.div
                    key={activeTestimonial.id}
                    custom={slideDirection}
                    initial={{
                      opacity: 0,
                      x: slideDirection * 28,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: slideDirection * -24,
                    }}
                    transition={{
                      duration: 0.36,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="space-y-3"
                  >
                    <span
                      aria-hidden="true"
                      className="block text-4xl font-display italic text-[#89AACC]/65 leading-none select-none"
                    >
                      &ldquo;
                    </span>
                    <p className="text-xl sm:text-2xl md:text-[28px] font-display italic text-text-primary leading-[1.4]">
                      {activeTestimonial.quote}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <AnimatePresence mode="wait" custom={slideDirection}>
                  <motion.footer
                    key={`footer-${activeTestimonial.id}`}
                    custom={slideDirection}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-10 h-10 rounded-full border border-[#89AACC]/45 text-[#89AACC] font-mono text-xs font-medium flex items-center justify-center shrink-0">
                        {getInitials(activeTestimonial.name)}
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm sm:text-base font-medium text-text-primary truncate">
                          {activeTestimonial.name}
                        </div>
                        <div className="text-xs text-muted truncate">
                          {activeTestimonial.role}
                        </div>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#89AACC] shrink-0">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Endorsement</span>
                    </span>
                  </motion.footer>
                </AnimatePresence>
              </div>
            </blockquote>
          </motion.div>
        </StaggerContainer>
      </div>

      {/* Full-Screen Certificate Lightbox Modal with Zoom + Pool Navigation */}
      <AnimatePresence>
        {lightboxCert && (
          <motion.div
            key="cert-lightbox-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label={lightboxCert.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
            onClick={() => setLightboxCert(null)}
          >
            <motion.div
              key={lightboxCert.id}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-w-3xl w-full bg-surface border border-stroke rounded-3xl overflow-y-auto shadow-2xl max-h-[92vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Controls Bar */}
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-stroke">
                <div className="flex items-center gap-2 text-xs font-mono tabular-nums min-w-0">
                  <span className="text-[#89AACC] shrink-0">
                    {String(lightboxIndex + 1).padStart(2, '0')} /{' '}
                    {String(lightboxPool.length).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true" className="text-muted">
                    ·
                  </span>
                  <span className="text-muted truncate">
                    {lightboxCert.issuer}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    aria-label={
                      isZoomed ? 'Reset certificate zoom' : 'Zoom certificate'
                    }
                    aria-pressed={isZoomed}
                    onClick={() => setIsZoomed((prev) => !prev)}
                    className="w-9 h-9 rounded-full bg-bg border border-stroke text-muted hover:text-text-primary hover:border-[#89AACC] flex items-center justify-center cursor-pointer transition-colors"
                  >
                    {isZoomed ? (
                      <ZoomOut className="w-4 h-4" />
                    ) : (
                      <ZoomIn className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label="Previous certificate"
                    onClick={() => cycleLightbox('prev')}
                    className="w-9 h-9 rounded-full bg-bg border border-stroke text-muted hover:text-text-primary hover:border-[#89AACC] flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next certificate"
                    onClick={() => cycleLightbox('next')}
                    className="w-9 h-9 rounded-full bg-bg border border-stroke text-muted hover:text-text-primary hover:border-[#89AACC] flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    autoFocus
                    onClick={() => setLightboxCert(null)}
                    aria-label="Close certificate preview"
                    className="w-9 h-9 rounded-full bg-bg border border-stroke text-text-primary hover:border-[#89AACC] flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Certificate Preview Stage (supports click-to-zoom) */}
              <div className="aspect-[16/10] max-h-[48vh] w-full bg-bg p-4 sm:p-6 flex items-center justify-center overflow-auto shrink-0">
                {!failedImages[lightboxCert.id] ? (
                  <img
                    src={lightboxCert.image}
                    alt={`${lightboxCert.title} issued by ${lightboxCert.issuer}`}
                    referrerPolicy="no-referrer"
                    onError={() => markImageFailed(lightboxCert.id)}
                    onClick={() => setIsZoomed((prev) => !prev)}
                    className={`rounded-xl transition-transform duration-300 ${
                      isZoomed
                        ? 'scale-150 cursor-zoom-out object-contain max-h-full max-w-full'
                        : 'max-h-full max-w-full object-contain cursor-zoom-in'
                    }`}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <Award className="w-10 h-10 text-[#89AACC] mb-3" />
                    <span className="text-sm font-mono text-text-primary">
                      {lightboxCert.issuer}
                    </span>
                    <span className="text-xs text-muted mt-1">
                      Preview image unavailable offline
                    </span>
                  </div>
                )}
              </div>

              {/* Metadata + Quick Certificate Switcher Strip */}
              <div className="p-6 sm:p-8 border-t border-stroke space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-mono text-[#89AACC] mb-1">
                      {getCredentialCategory(lightboxCert)} ·{' '}
                      {lightboxCert.issueDate}
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-display italic text-text-primary mb-2">
                      {lightboxCert.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {lightboxCert.description}
                    </p>
                  </div>

                  <a
                    href={lightboxCert.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-text-primary text-bg hover:bg-[#89AACC] hover:text-[#0a0a0a] text-xs font-medium transition-colors whitespace-nowrap shrink-0 self-start"
                  >
                    <span>Verify Certificate</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Quick Index Bar */}
                <div className="pt-4 border-t border-stroke/80 flex items-center gap-1.5 overflow-x-auto pb-1">
                  {lightboxPool.map((item, i) => {
                    const isCurrent = item.id === lightboxCert.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setLightboxCert(item)}
                        aria-label={`Jump to certificate ${i + 1}: ${item.title}`}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-mono tabular-nums transition-colors cursor-pointer shrink-0 border ${
                          isCurrent
                            ? 'bg-text-primary text-bg border-text-primary font-medium'
                            : 'bg-bg text-muted border-stroke hover:text-text-primary hover:border-[#89AACC]/60'
                        }`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
