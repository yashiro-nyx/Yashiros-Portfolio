import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Cloud,
  CreditCard,
  Lock,
  ShieldCheck,
  Terminal,
  X,
} from 'lucide-react';
import {
  SiAngular,
  SiCplusplus,
  SiCss,
  SiExpress,
  SiFigma,
  SiFlask,
  SiFramer,
  SiGit,
  SiGithub,
  SiGreensock,
  SiHtml5,
  SiIonic,
  SiJavascript,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiOpencv,
  SiOpenjdk,
  SiPhp,
  SiPostgresql,
  SiPrisma,
  SiPython,
  SiPytorch,
  SiReact,
  SiSocketdotio,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiVite,
  SiVitest,
} from 'react-icons/si';
import { PROJECTS, ProjectItem } from '../data/portfolioData';
import { LogoLoop, LogoLoopItem } from './LogoLoop';
import { StaggerContainer, FadeInUpItem } from './StaggerFadeInUp';

interface TechStackSectionProps {
  onSelectProject: (project: ProjectItem) => void;
  isDark?: boolean;
}

type TechDiscipline =
  | 'Frontend & Motion'
  | 'Backend & Database'
  | 'AI, Vision & Desktop'
  | 'Design, DevOps & Security';

export interface TechDetailItem {
  id: string;
  name: string;
  category: TechDiscipline;
  level: string;
  experience: string;
  usageSummary: string;
  projectIds: string[];
  featured?: boolean;
}

const TECH_ITEMS: TechDetailItem[] = [
  // Frontend & Motion
  {
    id: 'react',
    name: 'React (18 & 19)',
    category: 'Frontend & Motion',
    level: 'Core Stack',
    experience: 'Web & Multi-Team Apps',
    usageSummary:
      'Component architecture, state management, and interactive UI systems across Permora (React 19), SouCul (React 19), RePXL (React 18), and SyncTayo (React 18).',
    projectIds: ['repxl', 'permora', 'synctayo', 'soucul'],
    featured: true,
  },
  {
    id: 'nextjs',
    name: 'Next.js 15',
    category: 'Frontend & Motion',
    level: 'Core Stack',
    experience: 'Full-Stack App Router',
    usageSummary:
      'Route handlers, server-rendered interfaces, and API workflows powering RePXL Camera Marketplace and Permora Governance.',
    projectIds: ['repxl', 'permora'],
    featured: true,
  },
  {
    id: 'ionic-angular',
    name: 'Ionic 9 & Angular 22',
    category: 'Frontend & Motion',
    level: 'Mobile Hybrid',
    experience: 'Capacitor Android',
    usageSummary:
      'Standalone signal-based Angular components, Ionic mobile views, offline catalog fallback, and Capacitor Android packaging in Cookie Fluffs.',
    projectIds: ['cookie-fluffs'],
    featured: true,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'Frontend & Motion',
    level: 'Core Stack',
    experience: 'Type-Safe Engineering',
    usageSummary:
      'Strict contracts for approval routing policies, PayMongo webhook payloads, and Ionic + Angular mobile views.',
    projectIds: ['repxl', 'permora', 'cookie-fluffs'],
    featured: true,
  },
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    category: 'Frontend & Motion',
    level: 'Core Stack',
    experience: 'Responsive UI Systems',
    usageSummary:
      'Utility-first styling and responsive layouts across RePXL, Permora (Tailwind 4), and SyncTayo.',
    projectIds: ['repxl', 'permora', 'synctayo'],
  },
  {
    id: 'gsap',
    name: 'GSAP & ScrollTrigger',
    category: 'Frontend & Motion',
    level: 'Motion Web',
    experience: 'Scroll Choreography',
    usageSummary:
      'Scroll-triggered animations, multi-layer parallax scenes, and vintage camera showcase transitions in LionHeart Photography.',
    projectIds: ['lionheart'],
  },
  {
    id: 'framer',
    name: 'Framer Motion',
    category: 'Frontend & Motion',
    level: 'UI Motion',
    experience: 'Transitions & Carousels',
    usageSummary:
      'Spring transitions, hover reveals, and interactive UI motion across RePXL and portfolio builds.',
    projectIds: ['repxl'],
  },
  {
    id: 'html-css-js',
    name: 'HTML5 · CSS3 · ES6+',
    category: 'Frontend & Motion',
    level: 'Core Foundation',
    experience: 'Web Fundamentals',
    usageSummary:
      'Semantic markup, canvas gameplay (Flappy Bird X Kiro), and DOM engineering across LionHeart and SouCul.',
    projectIds: ['lionheart', 'soucul'],
  },

  // Backend & Database
  {
    id: 'postgresql',
    name: 'PostgreSQL (Neon & Supabase)',
    category: 'Backend & Database',
    level: 'Core Database',
    experience: 'ACID & Cloud Postgres',
    usageSummary:
      'Transactional order checkout, access request audit trails, and camera inventory records powered by Supabase and Neon PostgreSQL.',
    projectIds: ['repxl', 'permora', 'cookie-fluffs'],
    featured: true,
  },
  {
    id: 'prisma',
    name: 'Prisma ORM',
    category: 'Backend & Database',
    level: 'Core Stack',
    experience: 'Schema & Migrations',
    usageSummary:
      'Relational schema modeling, database seeding, and cross-workspace queries across RePXL and SyncTayo.',
    projectIds: ['repxl', 'synctayo'],
    featured: true,
  },
  {
    id: 'nodejs-express',
    name: 'Node.js & Express',
    category: 'Backend & Database',
    level: 'REST APIs',
    experience: 'Team Backends',
    usageSummary:
      'Express REST APIs handling transactional cookie orders, verification notifications, and S3 asset routes in Cookie Fluffs and SyncTayo.',
    projectIds: ['synctayo', 'cookie-fluffs'],
    featured: true,
  },
  {
    id: 'aws-s3',
    name: 'AWS S3 & Cloud Storage',
    category: 'Backend & Database',
    level: 'Cloud Infrastructure',
    experience: 'SyncTayo Storage PRs',
    usageSummary:
      'AWS SDK v3 presigned uploads, upload failure compensation cleanup, null-origin CORS download fixes, and storage lifecycle hardening in SyncTayo.',
    projectIds: ['synctayo'],
  },
  {
    id: 'socketio',
    name: 'Socket.io & Collaboration',
    category: 'Backend & Database',
    level: 'Real-Time Sync',
    experience: 'Workspace Events',
    usageSummary:
      'Real-time team messaging, task updates, and collaborative workspace notifications inside SyncTayo.',
    projectIds: ['synctayo'],
  },
  {
    id: 'better-auth',
    name: 'Better Auth & NextAuth',
    category: 'Backend & Database',
    level: 'Authentication & RBAC',
    experience: 'Argon2id & Sessions',
    usageSummary:
      'Argon2id credential hashing and revocable sessions in Permora (Better Auth 1.7.5), plus NextAuth session guards in RePXL.',
    projectIds: ['permora', 'repxl'],
  },
  {
    id: 'paymongo',
    name: 'PayMongo API',
    category: 'Backend & Database',
    level: 'Payment Gateway',
    experience: 'Signed Webhooks',
    usageSummary:
      'Raw-body HMAC webhook signature verification and idempotent order finalization in RePXL Camera Marketplace.',
    projectIds: ['repxl'],
  },
  {
    id: 'php-mysql',
    name: 'PHP, MySQL & Oracle DB',
    category: 'Backend & Database',
    level: 'Relational & REST',
    experience: 'Academic & Web Builds',
    usageSummary:
      'PHP/MySQL storefront and admin APIs for SouCul Filipino Souvenirs alongside Oracle DB coursework at TIP-QC.',
    projectIds: ['soucul'],
  },

  // AI, Vision & Desktop
  {
    id: 'python',
    name: 'Python 3.12',
    category: 'AI, Vision & Desktop',
    level: 'Core Language',
    experience: 'CV & Tooling',
    usageSummary:
      'Modular computer vision pipelines, dependency verification, and browser stream servers in VisionForge.',
    projectIds: ['visionforge'],
    featured: true,
  },
  {
    id: 'opencv-mediapipe',
    name: 'OpenCV & MediaPipe',
    category: 'AI, Vision & Desktop',
    level: 'Computer Vision',
    experience: '7 Interactive Demos',
    usageSummary:
      'Hand, face, and pose landmark detection powering Air Canvas, Slide Presenter, Rep Counter, and PNGTuber demos.',
    projectIds: ['visionforge'],
    featured: true,
  },
  {
    id: 'pytorch-flask',
    name: 'PyTorch & Flask',
    category: 'AI, Vision & Desktop',
    level: 'AI & WebSocket Server',
    experience: 'Desktop + Web Path',
    usageSummary:
      'CPU/CUDA vision pipelines paired with Flask + WebSocket adapters bridging @mediapipe/tasks-vision browser demos.',
    projectIds: ['visionforge'],
  },
  {
    id: 'java-swing',
    name: 'Java & Swing GUI',
    category: 'AI, Vision & Desktop',
    level: 'Desktop Suite',
    experience: 'MVC & OOP',
    usageSummary:
      'MVC-structured Java Swing hotel reservation system with room selection, guest validation, and email notifications in Undouse Hotel.',
    projectIds: ['undouse-hotel'],
  },

  // Design, DevOps & Security
  {
    id: 'figma',
    name: 'UI/UX Design & Prototyping',
    category: 'Design, DevOps & Security',
    level: 'Product & Interface Design',
    experience: 'Storefronts, Portals & Mobile',
    usageSummary:
      'User research, wireframing, and clean storefront, governance portal, and mobile ordering interfaces across web and Android builds.',
    projectIds: ['repxl', 'permora', 'cookie-fluffs', 'lionheart', 'soucul'],
    featured: true,
  },
  {
    id: 'git-vercel',
    name: 'Git · GitHub · Vercel',
    category: 'Design, DevOps & Security',
    level: 'Collaboration & Hosting',
    experience: 'PR Workflows & Deploys',
    usageSummary:
      'Multi-contributor pull requests across SyncTayo and Cookie Fluffs, plus Vercel deployments for RePXL, Permora, and LionHeart.',
    projectIds: ['repxl', 'permora', 'synctayo', 'cookie-fluffs', 'lionheart'],
    featured: true,
  },
  {
    id: 'vitest',
    name: 'Vitest & Playwright',
    category: 'Design, DevOps & Security',
    level: 'Automated Testing',
    experience: 'Integration & E2E',
    usageSummary:
      'Unit, integration, and end-to-end verification tests across RePXL (Vitest), Permora (Playwright/tsx), and Cookie Fluffs.',
    projectIds: ['repxl', 'permora', 'cookie-fluffs'],
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity & ICIP',
    category: 'Design, DevOps & Security',
    level: 'Certified Credentials',
    experience: 'BlackStride & OPSWAT',
    usageSummary:
      'Security fundamentals, OT/IT critical infrastructure awareness, and defensive auth/throttling applied in Permora and Cookie Fluffs.',
    projectIds: ['permora', 'cookie-fluffs'],
  },
];

const DISCIPLINES: TechDiscipline[] = [
  'Frontend & Motion',
  'Backend & Database',
  'AI, Vision & Desktop',
  'Design, DevOps & Security',
];

const FILTER_TABS = [
  'Core Stack',
  'Frontend & Motion',
  'Backend & Database',
  'AI, Vision & Desktop',
  'Design, DevOps & Security',
  'All Tools',
] as const;

const renderTechBrandIcon = (id: string, className = 'w-5 h-5') => {
  switch (id) {
    case 'react':
      return <SiReact className={className} />;
    case 'nextjs':
      return <SiNextdotjs className={className} />;
    case 'ionic-angular':
      return <SiAngular className={className} />;
    case 'typescript':
      return <SiTypescript className={className} />;
    case 'tailwind':
      return <SiTailwindcss className={className} />;
    case 'gsap':
      return <SiGreensock className={className} />;
    case 'framer':
      return <SiFramer className={className} />;
    case 'html-css-js':
      return <SiHtml5 className={className} />;
    case 'postgresql':
      return <SiPostgresql className={className} />;
    case 'prisma':
      return <SiPrisma className={className} />;
    case 'nodejs-express':
      return <SiNodedotjs className={className} />;
    case 'aws-s3':
      return <Cloud className={className} />;
    case 'socketio':
      return <SiSocketdotio className={className} />;
    case 'better-auth':
      return <Lock className={className} />;
    case 'paymongo':
      return <CreditCard className={className} />;
    case 'php-mysql':
      return <SiPhp className={className} />;
    case 'python':
      return <SiPython className={className} />;
    case 'opencv-mediapipe':
      return <SiOpencv className={className} />;
    case 'pytorch-flask':
      return <SiPytorch className={className} />;
    case 'java-swing':
      return <SiOpenjdk className={className} />;
    case 'figma':
      return <SiFigma className={className} />;
    case 'git-vercel':
      return <SiVercel className={className} />;
    case 'vitest':
      return <SiVitest className={className} />;
    case 'cybersecurity':
      return <ShieldCheck className={className} />;
    default:
      return <Terminal className={className} />;
  }
};

export const TechStackSection: React.FC<TechStackSectionProps> = ({
  onSelectProject,
  isDark = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Core Stack');
  const [inspectedTech, setInspectedTech] = useState<TechDetailItem | null>(
    null
  );
  const [mousePos, setMousePos] = useState<{ x: number; y: number; id: string }>({
    x: 0,
    y: 0,
    id: '',
  });

  const categoryRefs = React.useRef<Array<HTMLButtonElement | null>>([]);
  const techCardRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const techLogos = useMemo<LogoLoopItem[]>(() => {
    const monoHighContrast = isDark ? '#ffffff' : '#0d0d11';
    return [
      { node: <SiReact />, title: 'React (18 & 19)', href: 'https://react.dev', hoverColor: '#61dafb' },
      { node: <SiNextdotjs />, title: 'Next.js 15', href: 'https://nextjs.org', hoverColor: monoHighContrast },
      { node: <SiAngular />, title: 'Angular 22', href: 'https://angular.dev', hoverColor: '#dd0031' },
      { node: <SiIonic />, title: 'Ionic 9', href: 'https://ionicframework.com', hoverColor: '#3880ff' },
      { node: <SiTypescript />, title: 'TypeScript', href: 'https://www.typescriptlang.org', hoverColor: '#3178c6' },
      { node: <SiJavascript />, title: 'JavaScript', href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', hoverColor: '#f7df1e' },
      { node: <SiTailwindcss />, title: 'Tailwind CSS', href: 'https://tailwindcss.com', hoverColor: '#38bdf8' },
      { node: <SiGreensock />, title: 'GSAP', href: 'https://gsap.com', hoverColor: '#88ce02' },
      { node: <SiFramer />, title: 'Framer Motion', href: 'https://motion.dev', hoverColor: '#60a5fa' },
      { node: <SiVite />, title: 'Vite', href: 'https://vite.dev', hoverColor: '#646cff' },
      { node: <SiHtml5 />, title: 'HTML5', href: 'https://developer.mozilla.org/en-US/docs/Web/HTML', hoverColor: '#e34f26' },
      { node: <SiCss />, title: 'CSS3', href: 'https://developer.mozilla.org/en-US/docs/Web/CSS', hoverColor: '#38bdf8' },
      { node: <SiNodedotjs />, title: 'Node.js', href: 'https://nodejs.org', hoverColor: '#5fa04e' },
      { node: <SiExpress />, title: 'Express', href: 'https://expressjs.com', hoverColor: monoHighContrast },
      { node: <SiSocketdotio />, title: 'Socket.io', href: 'https://socket.io', hoverColor: monoHighContrast },
      { node: <SiPostgresql />, title: 'PostgreSQL', href: 'https://www.postgresql.org', hoverColor: '#60a5fa' },
      { node: <SiSupabase />, title: 'Supabase', href: 'https://supabase.com', hoverColor: '#3ecf8e' },
      { node: <SiPrisma />, title: 'Prisma ORM', href: 'https://www.prisma.io', hoverColor: '#818cf8' },
      { node: <SiPhp />, title: 'PHP', href: 'https://www.php.net', hoverColor: '#8993be' },
      { node: <SiMysql />, title: 'MySQL', href: 'https://www.mysql.com', hoverColor: '#4ea1d3' },
      { node: <SiPython />, title: 'Python 3.12', href: 'https://www.python.org', hoverColor: '#4b8bbe' },
      { node: <SiOpencv />, title: 'OpenCV', href: 'https://opencv.org', hoverColor: '#8b5cf6' },
      { node: <SiPytorch />, title: 'PyTorch', href: 'https://pytorch.org', hoverColor: '#ee4c2c' },
      { node: <SiFlask />, title: 'Flask', href: 'https://flask.palletsprojects.com', hoverColor: monoHighContrast },
      { node: <SiOpenjdk />, title: 'Java', href: 'https://openjdk.org', hoverColor: '#f89820' },
      { node: <SiCplusplus />, title: 'C++', href: 'https://isocpp.org', hoverColor: '#4b9cd3' },
      { node: <SiFigma />, title: 'Figma', href: 'https://www.figma.com', hoverColor: '#f24e1e' },
      { node: <SiGit />, title: 'Git', href: 'https://git-scm.com', hoverColor: '#f05032' },
      { node: <SiGithub />, title: 'GitHub', href: 'https://github.com/yashiro-nyx', hoverColor: monoHighContrast },
      { node: <SiVercel />, title: 'Vercel', href: 'https://vercel.com', hoverColor: monoHighContrast },
      { node: <SiVitest />, title: 'Vitest', href: 'https://vitest.dev', hoverColor: '#6e9f18' },
    ];
  }, [isDark]);

  const visibleList = useMemo(() => {
    if (selectedCategory === 'Core Stack') {
      return TECH_ITEMS.filter((item) => item.featured);
    }
    if (selectedCategory === 'All Tools') {
      return TECH_ITEMS;
    }
    return TECH_ITEMS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  // Keyboard navigation inside the Technology Inspector Modal (Esc, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!inspectedTech) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInspectedTech(null);
      } else if (e.key === 'ArrowRight') {
        const idx = visibleList.findIndex((i) => i.id === inspectedTech.id);
        const nextIdx = (idx + 1) % visibleList.length;
        setInspectedTech(visibleList[nextIdx]);
      } else if (e.key === 'ArrowLeft') {
        const idx = visibleList.findIndex((i) => i.id === inspectedTech.id);
        const prevIdx = (idx - 1 + visibleList.length) % visibleList.length;
        setInspectedTech(visibleList[prevIdx]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inspectedTech, visibleList]);

  const handleCardMouseMove = (
    e: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      id,
    });
  };

  const handleCategoryKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number
  ) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (idx + 1) % FILTER_TABS.length;
      setSelectedCategory(FILTER_TABS[nextIdx]);
      categoryRefs.current[nextIdx]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (idx - 1 + FILTER_TABS.length) % FILTER_TABS.length;
      setSelectedCategory(FILTER_TABS[prevIdx]);
      categoryRefs.current[prevIdx]?.focus();
    }
  };

  const handleTechCardKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    tech: TechDetailItem,
    idx: number
  ) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setInspectedTech(tech);
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIdx = (idx + 1) % visibleList.length;
      techCardRefs.current[nextIdx]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIdx = (idx - 1 + visibleList.length) % visibleList.length;
      techCardRefs.current[prevIdx]?.focus();
    }
  };

  const renderTechCard = (tech: TechDetailItem, idx: number) => {
    const isHovered = mousePos.id === tech.id;
    const isOpen = inspectedTech?.id === tech.id;
    const usedInProjects = PROJECTS.filter((p) =>
      tech.projectIds.includes(p.id)
    );

    return (
      <motion.button
        key={tech.id}
        ref={(el) => {
          techCardRefs.current[idx] = el;
        }}
        type="button"
        aria-label={`${tech.name} (${tech.level}, ${tech.experience}) — used in ${tech.projectIds.length} projects. Click or press Enter to inspect details.`}
        initial={{ opacity: 0, y: 20, scale: 0.985 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.12, margin: '-20px 0px -20px 0px' }}
        transition={{ duration: 0.45, delay: (idx % 3) * 0.05, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setInspectedTech(tech)}
        onKeyDown={(e) => handleTechCardKeyDown(e, tech, idx)}
        onMouseMove={(e) => handleCardMouseMove(e, tech.id)}
        onMouseLeave={() => setMousePos({ x: 0, y: 0, id: '' })}
        className={`group relative text-left p-6 sm:p-7 rounded-3xl border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between min-h-[210px] ${
          isOpen
            ? 'bg-surface border-[#89AACC] shadow-xl shadow-[#89AACC]/10'
            : 'bg-surface/75 hover:bg-surface border-stroke hover:border-[#89AACC]/60'
        }`}
      >
        {/* Hover-only radial cursor spotlight glow (never hijacks clicked state) */}
        {isHovered && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-px transition-opacity duration-300"
            style={{
              background: `radial-gradient(260px circle at ${mousePos.x}px ${mousePos.y}px, rgba(137, 170, 204, 0.16), transparent 75%)`,
            }}
          />
        )}

        <div>
          <div className="relative z-10 flex items-start justify-between gap-3 mb-5">
            <span className="w-11 h-11 rounded-2xl bg-bg/90 border border-stroke group-hover:border-[#89AACC]/50 text-text-primary group-hover:text-[#89AACC] flex items-center justify-center transition-colors duration-300 shrink-0">
              {renderTechBrandIcon(tech.id, 'w-5 h-5')}
            </span>

            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-muted group-hover:text-[#89AACC] transition-colors pt-1">
              <span>Inspect</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>

          <div className="relative z-10 mb-4">
            <div className="text-[11px] font-mono text-[#89AACC] mb-1">
              {tech.level} · {tech.experience}
            </div>
            <h3 className="text-xl sm:text-2xl font-display italic text-text-primary group-hover:text-[#89AACC] group-focus-visible:text-[#89AACC] transition-colors leading-snug mb-2">
              {tech.name}
            </h3>
            <p className="text-xs sm:text-sm text-muted line-clamp-2 leading-relaxed">
              {tech.usageSummary}
            </p>
          </div>
        </div>

        {/* Footer proof line directly inside the card */}
        <div className="relative z-10 pt-3.5 border-t border-stroke/80 flex items-center justify-between gap-2 text-[11px] font-mono text-muted">
          <span className="truncate">
            {usedInProjects.map((p) => p.name.split(' ')[0]).join(' · ')}
          </span>
          <span className="text-text-primary/80 shrink-0">
            {tech.projectIds.length}{' '}
            {tech.projectIds.length === 1 ? 'project' : 'projects'}
          </span>
        </div>
      </motion.button>
    );
  };

  const matchedModalProjects = inspectedTech
    ? PROJECTS.filter((p) => inspectedTech.projectIds.includes(p.id))
    : [];

  return (
    <section
      id="tech-stack"
      tabIndex={-1}
      aria-label="Tech Stack and Ecosystem"
      className="bg-transparent py-24 md:py-36 relative overflow-x-clip focus:outline-none"
    >
      {/* Interactive Verified Programming Languages & Tools Logo Loop */}
      <motion.div
        initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="border-t border-b border-stroke bg-surface/20 py-5 mb-20"
      >
        <LogoLoop
          logos={techLogos}
          speed={80}
          direction="left"
          logoHeight={36}
          gap={56}
          hoverSpeed={0}
          scaleOnHover
          fadeOut
          fadeOutWidth={0.12}
          labels="hover"
          muted={0.42}
          draggable
          intro
          className="text-text-primary"
          ariaLabel="Verified programming languages and tools used in projects"
        />
      </motion.div>

      <div className="max-w-[1240px] mx-auto px-6 md:px-12 lg:px-16">
        {/* Clean Full-Width Editorial Header */}
        <StaggerContainer
          staggerDelay={0.1}
          viewportMargin="-24px 0px -24px 0px"
          className="mb-10 space-y-4"
        >
          <FadeInUpItem className="flex items-center gap-3">
            <span className="w-8 h-px bg-stroke" />
            <span className="text-xs text-muted uppercase tracking-[0.3em]">
              02 / Tech Stack &amp; Ecosystem
            </span>
          </FadeInUpItem>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <FadeInUpItem
              as="h2"
              className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-text-primary leading-[0.95]"
            >
              Tools &amp; <span className="font-display italic">technologies</span>{' '}
              I build with
            </FadeInUpItem>

            <FadeInUpItem
              as="p"
              className="text-sm text-muted max-w-md leading-relaxed"
            >
              Browse each discipline below and click any technology card to
              inspect full architectural context and verified projects right in
              place.
            </FadeInUpItem>
          </div>
        </StaggerContainer>

        {/* Clean Discipline Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16, filter: 'blur(5px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.56, ease: [0.22, 1, 0.36, 1] }}
          role="group"
          aria-label="Filter technologies by category"
          className="flex flex-wrap items-center gap-2 pb-8 mb-10 border-b border-stroke"
        >
          {FILTER_TABS.map((category, idx) => {
            const isActive = selectedCategory === category;
            const count =
              category === 'Core Stack'
                ? TECH_ITEMS.filter((i) => i.featured).length
                : category === 'All Tools'
                  ? TECH_ITEMS.length
                  : TECH_ITEMS.filter((i) => i.category === category).length;

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
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap border ${
                  isActive
                    ? 'bg-text-primary text-bg border-text-primary font-medium'
                    : 'bg-surface/60 text-muted border-stroke hover:text-text-primary hover:border-[#89AACC]/50'
                }`}
              >
                <span>{category}</span>
                <span
                  className={`font-mono text-[10px] ${
                    isActive ? 'text-bg/70' : 'text-muted/80'
                  }`}
                >
                  {String(count).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </motion.div>

        {/* Spacious 3-Column Technology Cards Grid (each card reads cleanly in-place) */}
        {selectedCategory === 'All Tools' ? (
          <div
            className="space-y-14"
            role="list"
            aria-label="All technologies grouped by discipline"
          >
            {DISCIPLINES.map((discipline) => {
              const items = TECH_ITEMS.filter((i) => i.category === discipline);
              return (
                <div key={discipline} className="space-y-5">
                  <div className="flex items-center justify-between border-b border-stroke/70 pb-3">
                    <h4 className="text-xs sm:text-sm font-mono uppercase tracking-[0.22em] text-text-primary">
                      {discipline}
                    </h4>
                    <span className="text-xs font-mono text-muted">
                      {String(items.length).padStart(2, '0')} Tools
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {items.map((tech) => {
                      const globalIdx = TECH_ITEMS.findIndex(
                        (t) => t.id === tech.id
                      );
                      return renderTechCard(tech, globalIdx);
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            role="list"
            aria-label={`${selectedCategory} technology stack items`}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
          >
            {visibleList.map((tech, idx) => renderTechCard(tech, idx))}
          </div>
        )}
      </div>

      {/* In-Viewport Technology Inspector Modal (opens on click — no scrolling back up needed) */}
      <AnimatePresence>
        {inspectedTech && (
          <motion.div
            key="tech-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-label={`${inspectedTech.name} details and verified projects`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6"
            onClick={() => setInspectedTech(null)}
          >
            <motion.div
              key={inspectedTech.id}
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full rounded-3xl bg-surface border border-stroke p-6 sm:p-9 shadow-2xl overflow-hidden max-h-[88vh] overflow-y-auto"
            >
              {/* Top Accent Strip */}
              <div className="absolute top-0 inset-x-0 h-[3px] accent-gradient" />

              {/* Top Controls Row */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="w-12 h-12 rounded-2xl bg-bg border border-[#89AACC]/40 text-[#89AACC] flex items-center justify-center shrink-0">
                    {renderTechBrandIcon(inspectedTech.id, 'w-6 h-6')}
                  </span>
                  <div>
                    <div className="text-xs font-mono text-[#89AACC]">
                      {inspectedTech.category}
                    </div>
                    <div className="text-xs font-mono text-muted">
                      {inspectedTech.level} · {inspectedTech.experience}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous technology"
                    onClick={() => {
                      const idx = visibleList.findIndex(
                        (i) => i.id === inspectedTech.id
                      );
                      const prevIdx =
                        (idx - 1 + visibleList.length) % visibleList.length;
                      setInspectedTech(visibleList[prevIdx]);
                    }}
                    className="w-9 h-9 rounded-full bg-bg border border-stroke hover:border-[#89AACC] text-muted hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Next technology"
                    onClick={() => {
                      const idx = visibleList.findIndex(
                        (i) => i.id === inspectedTech.id
                      );
                      const nextIdx = (idx + 1) % visibleList.length;
                      setInspectedTech(visibleList[nextIdx]);
                    }}
                    className="w-9 h-9 rounded-full bg-bg border border-stroke hover:border-[#89AACC] text-muted hover:text-text-primary flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    autoFocus
                    aria-label="Close technology inspector"
                    onClick={() => setInspectedTech(null)}
                    className="w-9 h-9 rounded-full bg-bg border border-stroke hover:border-[#89AACC] text-text-primary flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-3xl sm:text-4xl font-display italic text-text-primary mb-3">
                {inspectedTech.name}
              </h3>

              <p className="text-sm sm:text-base text-muted leading-relaxed mb-7">
                {inspectedTech.usageSummary}
              </p>

              {/* Verified Projects Using This Technology */}
              <div className="border-t border-stroke pt-6">
                <div className="text-xs font-mono uppercase tracking-[0.2em] text-muted mb-4">
                  Verified Projects Using {inspectedTech.name} (
                  {matchedModalProjects.length})
                </div>

                <div className="space-y-3">
                  {matchedModalProjects.map((proj) => (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => {
                        setInspectedTech(null);
                        onSelectProject(proj);
                      }}
                      className="w-full text-left group/proj rounded-2xl bg-bg border border-stroke hover:border-[#89AACC] focus-visible:border-[#89AACC] p-4 flex items-center gap-4 cursor-pointer transition-all"
                    >
                      <img
                        src={proj.col1Image1}
                        alt={proj.name}
                        referrerPolicy="no-referrer"
                        className="w-16 h-12 rounded-xl object-cover border border-stroke shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] font-mono text-[#89AACC]">
                          {proj.number} · {proj.year} · {proj.role}
                        </div>
                        <div className="text-lg font-display italic text-text-primary truncate group-hover/proj:text-[#89AACC] transition-colors">
                          {proj.name}
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-muted group-hover/proj:text-[#89AACC] group-hover/proj:translate-x-0.5 group-hover/proj:-translate-y-0.5 transition-all shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default TechStackSection;
