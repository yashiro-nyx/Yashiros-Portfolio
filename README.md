# Yashiro's Portfolio — Jervin Paul C. Romualdo (`@yashiro-nyx`)

> **Interactive Full-Stack Developer & UI/UX Designer Portfolio**  
> Built with React 19, TypeScript, Vite, Tailwind CSS v4, Three.js, WebGL2 Shaders, GSAP ScrollTrigger, Framer Motion, and Lenis Smooth Scroll.

---

## Overview

**Yashiro's Portfolio** is the interactive engineering and design portfolio of **Jervin Paul C. Romualdo** (`@yashiro-nyx`), a 3rd-year BS in Information Technology student at the **Technological Institute of the Philippines — Quezon City**.

It presents **8 production & capstone software case studies**, **interactive code architecture walkthroughs**, **3D & WebGL visual experiments**, **community event milestones**, and **12 verified cybersecurity, cloud, and software engineering credentials**.

---

## Key Features & Interactive Experiences

- **Interactive 3D Lanyard ID Pass (`Lanyard.tsx`)**: Physics-driven, draggable 3D developer badge with double-sided custom canvas textures, lanyard verlet rope simulation, and click-to-flip verification backplate.
- **Custom WebGL2 Fragment Shaders (`HalftoneWavesShader.tsx`, `LaserFlow.tsx`)**: Real-time procedural halftone wave fields and volumetric laser beam shaders with automatic WebGL context recovery and device-tier adaptive resolution.
- **Tactile Spring-Physics Reveal Animations (`StaggerFadeInUp.tsx`)**: Custom Framer Motion staggered spring pop-in animations (`stiffness: 290, damping: 22, mass: 0.78`) and interactive hover/tap spring physics across project and credential cards.
- **Dual Project Explorer (`ProjectsSection.tsx`)**:
  - **Bento Grid View**: Filterable by *All*, *Full-Stack Web*, *Mobile & IoT*, and *AI & Desktop*, with a 3-slide visual preview carousel on every card.
  - **Hover Index View**: Editorial list view with cursor-tracking floating preview imagery.
  - **Deep Case Study Modal (`ProjectModal.tsx`)**: Full architectural breakdown, user flow steps, database schema inspection, interactive annotated screenshots, and syntax-highlighted production code snippets.
- **Capabilities & Expertise Interactive Suite (`ServicesSection.tsx`)**:
  - **TearTicket Component (`TearTicket.tsx`)**: Interactive perforated boarding-pass style service tickets with sound and tear physics.
  - **Flowing Menu (`FlowingMenu.tsx`)**: Momentum-sensitive marquee menu for exploring core engineering disciplines.
- **ScrollStack Highlights (`AboutSection.tsx` & `ScrollStack.tsx`)**: Sticky-stacked career & education cards detailing Full-Stack & Cloud work, Mobile/Desktop & Computer Vision engineering, Community Operations, and Academic honors.
- **Events & Milestones Parallax Gallery (`ExplorationsSection.tsx`)**: Dual-column vertical parallax gallery over a procedural falling starfield canvas, documenting moments from **AWS Community Day Philippines 2026**, **Philippine Startup Week 2026**, **Student Community Day Mega Manila 2026**, and **Build Nights: KiroVerse Workshop**.
- **Verified Credentials & Endorsements (`CertificationsSection.tsx` & `FolderFloat.tsx`)**: Filterable showcase of 12 industry certifications with full certificate inspection modal and interactive 3D floating folders for collaborator endorsements.
- **Command Palette (`CommandPalette.tsx`)**: Press `⌘K` / `Ctrl+K` (or `?` for keyboard shortcuts) to jump to any section, open case studies, toggle dark/light themes, or trigger the printable resume.
- **Multi-Layer Web Audio Soundscape (`soundscape.ts`)**: Procedural Web Audio API synthesizer generating subtle UI hover/click transients and optional ambient background layers.
- **Printable Resume / CV Modal (`ResumeModal.tsx`)**: Clean, print-optimized curriculum vitae view ready for PDF export.

---

## Featured Case Studies (`08`)

| # | Project | Category | Core Stack | Highlights |
| :- | :--- | :--- | :--- | :--- |
| **01** | **RePXL Camera Marketplace** | Full-Stack Web · E-Commerce | Next.js 15, TypeScript, Prisma, Supabase, PayMongo, Cloudinary | Verified peer-to-peer photography gear marketplace with signed PayMongo webhook checkout and atomic inventory locking |
| **02** | **Permora Governance** | Full-Stack Web · Security & RBAC | Next.js 15, React 19, TypeScript, Prisma, PostgreSQL, Better Auth | Role-based access & request governance platform with Argon2id auth, non-self approval routing, and immutable audit trails |
| **03** | **SyncTayo Workspace** | Full-Stack Web · SaaS | React, TypeScript, Supabase, Tailwind CSS | Real-time collaborative workspace with multi-presence cursors, instant Kanban state sync, and row-level security |
| **04** | **Cookie Fluffs Mobile** | Mobile & IoT · E-Commerce | Ionic, Angular, TypeScript, Capacitor, SCSS | Hybrid mobile bakery ordering app with multi-step box builder, local storage persistence, and real-time order tracker |
| **05** | **LionHeart Photography** | Full-Stack Web · Booking & Media | Next.js, TypeScript, Tailwind CSS, Framer Motion, Cloudinary | Editorial portfolio and automated studio booking platform with conflict-free session scheduling |
| **06** | **SouCul Filipino Souvenirs** | Full-Stack Web · Cultural E-Commerce | PHP, MySQL, JavaScript, Bootstrap, CSS3 | Artisan marketplace connecting regional Filipino craftmakers with story-driven product catalogs and relational checkout |
| **07** | **VisionForge CV Suite** | AI & Desktop · Computer Vision | Python, OpenCV, NumPy, CustomTkinter | Real-time multi-stage image processing workbench with live webcam pipelines, Canny edge detection, and FPS telemetry |
| **08** | **Undouse Hotel System** | AI & Desktop · Hospitality ERP | Java, JavaFX, MySQL, JDBC, CSS | Desktop hospitality management system with room availability matrix, automated billing, and JDBC transaction safety |

---

## Tech Stack

### Frontend & UI Engineering
- **Framework**: React 19 + TypeScript 5
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Typography**: *Instrument Serif* (Display), *Inter* (Body), *JetBrains Mono* (Monospace)

### 3D, Shaders & Motion
- **3D & WebGL**: Three.js, `@react-three/fiber`, custom GLSL WebGL2 Fragment Shaders
- **Animation Engines**: GSAP 3 (`ScrollTrigger`), Framer Motion / Motion, Lenis Smooth Scroll
- **2D Physics**: Matter.js & custom Verlet integration

---

## Project Structure

```text
├── public/
│   └── assets/aistudio/          # Project screenshots, event photography, and certification assets
├── src/
│   ├── assets/                   # Core media and fallback asset references
│   ├── components/
│   │   ├── AboutSection.tsx          # Bio, Lanyard 3D ID pass, and ScrollStack career highlights
│   │   ├── CertificationsSection.tsx # 12 verified credentials with spring pop-in & modal viewer
│   │   ├── CodeArchitectureSection.tsx # Interactive syntax-highlighted code samples
│   │   ├── CommandPalette.tsx        # Cmd/Ctrl+K quick navigation palette
│   │   ├── ContactSection.tsx        # Inquiry form, quick links, and footer
│   │   ├── ExplorationsSection.tsx   # Events & milestones parallax gallery + starfield canvas
│   │   ├── FlowingMenu.tsx           # Interactive marquee menu for capabilities
│   │   ├── FolderFloat.tsx           # 3D interactive folder cards for endorsements
│   │   ├── HalftoneWavesShader.tsx   # Custom WebGL2 halftone wave shader background
│   │   ├── HeroSection.tsx           # Hero introduction, live status, and quick actions
│   │   ├── Lanyard.tsx               # Interactive 3D physics developer badge
│   │   ├── LaserFlow.tsx             # Custom WebGL volumetric laser beam effect
│   │   ├── Navbar.tsx                # Floating pill navigation with theme & sound controls
│   │   ├── ProjectModal.tsx          # Deep-dive case study & architecture modal
│   │   ├── ProjectsSection.tsx       # Bento Grid & Hover Index project showcase
│   │   ├── ResumeModal.tsx           # Printable CV / Resume modal
│   │   ├── ScrollStack.tsx           # GSAP-powered sticky card stack
│   │   ├── ServicesSection.tsx       # Capabilities & TearTicket showcase
│   │   ├── StaggerFadeInUp.tsx       # Spring physics reveal & motion primitives
│   │   ├── StatsSection.tsx          # Animated portfolio metrics
│   │   ├── TechMarquee.tsx           # Categorized technology stack showcase
│   │   └── TearTicket.tsx            # Interactive tearable service ticket component
│   ├── data/
│   │   └── portfolioData.ts      # Centralized typed data for projects, certs, events, and bio
│   ├── hooks/
│   │   └── useDeviceTier.ts      # Hardware capability detection for adaptive WebGL/motion quality
│   ├── utils/
│   │   └── soundscape.ts         # Web Audio API procedural sound effects & ambient engine
│   ├── App.tsx                   # Root application layout, Lenis integration, and global modals
│   ├── index.css                 # Tailwind v4 configuration, theme tokens, and custom utilities
│   └── main.tsx                  # React DOM entry point
├── index.html                    # HTML entry point & OpenGraph metadata
├── metadata.json                 # Application metadata
├── package.json                  # Scripts and dependencies
├── tsconfig.json                 # TypeScript configuration
└── vite.config.ts                # Vite configuration
```

---

## Getting Started Locally

### Prerequisites
- **Node.js** `>= 18.x` (Node 20+ recommended)
- **npm** `>= 9.x`

### 1. Clone the repository
```bash
git clone https://github.com/yashiro-nyx/yashiros-portfolio.git
cd yashiros-portfolio
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```
The app will start at `http://localhost:3000`.

### 4. Type-check & build for production
```bash
# Run TypeScript validation
npm run lint

# Build production bundle into /dist
npm run build

# Preview production build locally
npm run preview
```

---

## Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌘K` / `Ctrl + K` | Open Command Palette |
| `?` | Toggle Keyboard Shortcuts Help |
| `Tab` / `Shift + Tab` | Navigate interactive cards and gallery frames |
| `Enter` / `Space` | Inspect focused project, credential, or event post |
| `Esc` | Close active modal or overlay |

---

## Author & Contact

**Jervin Paul C. Romualdo** (`@yashiro-nyx`)  
*BS in Information Technology — Technological Institute of the Philippines (Quezon City)*

- **GitHub**: [@yashiro-nyx](https://github.com/yashiro-nyx)
- **LinkedIn**: [Jervin Paul Romualdo](https://www.linkedin.com/in/jervin-paul-romualdo-464319323/)
- **Instagram**: [@echo.yashiro](https://www.instagram.com/echo.yashiro/)
- **Email**: [jervinpaulromualdo@gmail.com](mailto:jervinpaulromualdo@gmail.com)

---

*Designed & engineered with precision by Jervin Paul C. Romualdo (`@yashiro-nyx`).*
