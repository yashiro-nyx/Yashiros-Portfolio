export type ProjectCategory =
  | 'All'
  | 'Full-Stack'
  | 'Creative & Web'
  | 'AI & Systems';

export interface ProjectItem {
  id: string;
  number: string;
  name: string;
  subtitle: string;
  category: Exclude<ProjectCategory, 'All'>;
  year: string;
  role: string;
  duration: string;
  problemSolved: string;
  description: string;
  techStack: string[];
  keyFiles: string[];
  githubUrl: string;
  liveUrl?: string;
  col1Image1: string;
  col1Image2: string;
  col2Image: string;
  bentoSpan: 'col-span-1 md:col-span-7' | 'col-span-1 md:col-span-5';
  aspectClass: string;
}

export interface CodeSampleItem {
  id: string;
  title: string;
  subtitle: string;
  project: string;
  readTime: string;
  date: string;
  image: string;
  language: string;
  filePath: string;
  githubUrl: string;
  explanation: string;
  code: string;
}

export interface ExplorationItem {
  id: string;
  title: string;
  category: string;
  year: string;
  description: string;
  image: string;
  galleryImages?: string[];
  fullCaption?: string[];
  rotation: string;
  offsetY: number;
  linkUrl: string;
  tech: string;
  imageScaleClass?: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  verifyUrl: string;
  description: string;
  image: string;
}

export interface ExperienceItem {
  id: string;
  period: string;
  title: string;
  organization: string;
  type:
    | 'Education'
    | 'Community & Volunteering'
    | 'Full-Stack & Cloud'
    | 'Team & Mobile Engineering';
  highlights: string[];
}

export interface SkillGroup {
  category: string;
  skills: string[];
}

const RAW_GH_ASSETS =
  'https://raw.githubusercontent.com/yashiro-nyx/Yashiro-Portfolio/main/public/images';

export const PROFILE_DATA = {
  fullName: 'Jervin Paul C. Romualdo',
  displayName: 'Jervin Paul',
  monogram: 'JR',
  handle: 'yashiro-nyx',
  title: 'BSIT Student · Full-Stack Developer & UI/UX Designer',
  roles: ['Fullstack Dev', 'UI/UX Designer', 'Systems Builder', 'BSIT Student'],
  school: 'Technological Institute of the Philippines — Quezon City (3rd Year BSIT)',
  location: 'Quezon City, Metro Manila, Philippines',
  email: 'jervinpaulromualdo@gmail.com',
  availability: 'Available for Internships, Freelance & Collaborative Projects',
  portraitUrl: `${RAW_GH_ASSETS}/portrait.jpeg`,
  githubAvatarUrl: 'https://avatars.githubusercontent.com/u/190149672?v=4',
  heroTagline:
    'Building full-stack web applications, mobile apps, and human-centered UI/UX experiences as an IT student and software builder.',
  aboutBio:
    "I'm Jervin Paul C. Romualdo (@yashiro-nyx), a 3rd-year BS in Information Technology student at Technological Institute of the Philippines — Quezon City. Across solo builds and team collaborations, I design and engineer full-stack web platforms, Ionic + Angular mobile apps, role-based access governance systems, and real-time computer vision tools.",
  socials: {
    github: 'https://github.com/yashiro-nyx',
    draftPortfolioRepo: 'https://github.com/yashiro-nyx/Yashiro-Portfolio',
    linkedin: 'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408',
    instagram: 'https://www.instagram.com/yashiroo_oo',
  },
};

export const PROJECTS: ProjectItem[] = [
  {
    id: 'repxl',
    number: '01',
    name: 'RePXL Camera Marketplace',
    subtitle: 'Vintage Digital Camera E-Commerce & Mobile Companion',
    category: 'Full-Stack',
    year: '2026',
    role: 'Full-Stack Developer & UI/UX Designer',
    duration: 'Next.js · Prisma',
    problemSolved:
      'Built a verified vintage digital camera storefront and admin suite with atomic stock handling, PayMongo webhook finalization, Cloudinary media delivery, and order tracking.',
    description:
      'A full-stack e-commerce platform and Expo/React Native companion app for vintage digital cameras. Powered by Next.js 15, React 18, NextAuth, Prisma ORM, PostgreSQL/Supabase, Zustand, Leaflet, Cloudinary, and PayMongo payment webhooks.',
    techStack: [
      'Next.js 15',
      'React 18',
      'TypeScript',
      'Prisma ORM',
      'PostgreSQL / Supabase',
      'PayMongo API',
      'NextAuth',
      'Cloudinary',
    ],
    keyFiles: [
      'docs/system-architecture.md',
      'prisma/schema.prisma',
      'src/app/api/webhooks/paymongo/route.ts',
    ],
    githubUrl: 'https://github.com/yashiro-nyx/RePXL-Website',
    liveUrl: 'https://repxlph.vercel.app',
    col1Image1: '/assets/aistudio/image_95e0d221.png',
    col1Image2: '/assets/aistudio/image_76625c0e.png',
    col2Image: '/assets/aistudio/image_febc35b5.png',
    bentoSpan: 'col-span-1 md:col-span-7',
    aspectClass: 'aspect-[16/11]',
  },
  {
    id: 'permora',
    number: '02',
    name: 'Permora Governance',
    subtitle: 'Secure Access-Request & Approval Platform',
    category: 'Full-Stack',
    year: '2026',
    role: 'Full-Stack & Security Developer',
    duration: 'Next.js 15 · Better Auth',
    problemSolved:
      'Replaced manual permission approvals with owner-scoped access requests, non-self routing policies, transactional approve/deny/return workflows, and read-only admin audit trails.',
    description:
      'A multi-role access-request and approval application for students, faculty, approvers, and administrators. Built with Next.js 15, React 19, TypeScript, Tailwind CSS 4, Better Auth 1.7.5 with Argon2id hashing, PostgreSQL, and automated integration/Playwright tests.',
    techStack: [
      'Next.js 15',
      'React 19',
      'TypeScript',
      'Better Auth',
      'Argon2id',
      'PostgreSQL',
      'Tailwind CSS 4',
    ],
    keyFiles: [
      'lib/approval-routing-policy.ts',
      'docs/implementation-status.md',
      'tests/approval-routing-policy.test.ts',
    ],
    githubUrl: 'https://github.com/yashiro-nyx/Permora',
    liveUrl: 'https://permora.vercel.app',
    col1Image1: '/assets/aistudio/image_87063aa7.png',
    col1Image2: '/assets/aistudio/image_56fd6c1f.png',
    col2Image: '/assets/aistudio/image_f5676305.png',
    bentoSpan: 'col-span-1 md:col-span-5',
    aspectClass: 'aspect-[16/11] md:aspect-[4/3.4]',
  },
  {
    id: 'synctayo',
    number: '03',
    name: 'SyncTayo Workspace',
    subtitle: 'Cross-Team Synchronization & Conflict-Detection Platform',
    category: 'Full-Stack',
    year: '2026',
    role: 'Cloud Storage & Backend Contributor',
    duration: 'ErvoDigital · Team Repo',
    problemSolved:
      'Contributed AWS S3 object-storage hardening, upload failure compensation rollbacks, null-origin S3 download CORS fixes, and global database search across a multi-team workspace platform.',
    description:
      'Built by ErvoDigital (Adrian Estrecho, Arianne Tupaen & Jervin Romualdo) to unify multi-team calendars, Kanban tasks, Socket.io chat, collaborative TipTap docs, and cross-workspace schedule conflict detection. Engineered S3 asset lifecycle management, retry/compensation handlers, and graceful non-S3 startup fallback.',
    techStack: [
      'React 18',
      'Vite',
      'Express',
      'Socket.io',
      'Prisma ORM',
      'AWS S3',
      'Tailwind CSS',
      'Zod',
    ],
    keyFiles: [
      'server/src/services/assetStorage.js',
      'server/src/services/uploadCompensation.js',
      'docs/aws-s3-integration.md',
    ],
    githubUrl: 'https://github.com/ErvoDigital/SyncTayo',
    liveUrl: 'https://synctayo.online',
    col1Image1: '/assets/aistudio/image_37cc588d.png',
    col1Image2: '/assets/aistudio/image_d3c462c2.png',
    col2Image: '/assets/aistudio/image_886f1d74.png',
    bentoSpan: 'col-span-1 md:col-span-5',
    aspectClass: 'aspect-[16/11] md:aspect-[4/3.4]',
  },
  {
    id: 'cookie-fluffs',
    number: '04',
    name: 'Cookie Fluffs Mobile',
    subtitle: 'Ionic + Angular Cookie Shop Ordering & Android App',
    category: 'Full-Stack',
    year: '2026',
    role: 'Full-Stack & Mobile Contributor (IT31S6)',
    duration: 'TIP-QC · IT 005 Team',
    problemSolved:
      'Implemented transactional checkout & server-controlled fulfillment, secure email-code verification & password throttling, offline catalog resilience, and Capacitor Android mobile builds.',
    description:
      'A mobile-based cookie shop ordering and sales tracking platform built for IT 005 at TIP Quezon City using Ionic Framework 9, Angular 22, Capacitor Android, Node.js/Express, and Neon PostgreSQL. Contributed checkout/order APIs, account security & notifications, branded Android icons, and ngrok API request handling.',
    techStack: [
      'Ionic 9',
      'Angular 22',
      'Capacitor Android',
      'TypeScript',
      'Node.js',
      'Express',
      'Neon PostgreSQL',
    ],
    keyFiles: [
      'server/src/account-security-service.js',
      'server/src/cart-service.js',
      'app/capacitor.config.ts',
    ],
    githubUrl: 'https://github.com/kuromi-jo/Cookie-Fluffs',
    col1Image1: '/assets/aistudio/image_fcc7bca2.png',
    col1Image2: '/assets/aistudio/image_c3e02901.png',
    col2Image: '/assets/aistudio/image_1779ceeb.png',
    bentoSpan: 'col-span-1 md:col-span-7',
    aspectClass: 'aspect-[16/11]',
  },
  {
    id: 'lionheart',
    number: '05',
    name: 'LionHeart Photography',
    subtitle: 'Cinematic Scroll & Vintage Camera Showcase',
    category: 'Creative & Web',
    year: '2025',
    role: 'Front-End Developer',
    duration: 'HTML · CSS · GSAP',
    problemSolved:
      'Turned a static photography portfolio into an interactive visual narrative using choreographed GSAP scroll timelines and multi-plane parallax layers.',
    description:
      'An editorial photography portfolio featuring smooth scroll-triggered animations, multi-layer parallax scenes, and an interactive vintage camera carousel built with GSAP.',
    techStack: ['HTML5', 'CSS3', 'JavaScript', 'GSAP', 'ScrollTrigger'],
    keyFiles: ['index.html', 'style.css', 'script.js'],
    githubUrl: 'https://github.com/yashiro-nyx/lionheart_photography',
    liveUrl: 'https://lionheartphotography.vercel.app',
    col1Image1: '/assets/aistudio/image_d60a28ee.png',
    col1Image2: '/assets/aistudio/image_a954e15c.png',
    col2Image: '/assets/aistudio/image_dce7b14b.png',
    bentoSpan: 'col-span-1 md:col-span-7',
    aspectClass: 'aspect-[16/11]',
  },
  {
    id: 'soucul',
    number: '06',
    name: 'SouCul Filipino Souvenirs',
    subtitle: 'Regional Artisan E-Commerce Platform',
    category: 'Full-Stack',
    year: '2025',
    role: 'Front-End Developer',
    duration: 'React · PHP · MySQL',
    problemSolved:
      'Connected local Filipino regional artisans with digital buyers through a regional storefront, shopping cart, checkout flow, and PHP/MySQL admin panel.',
    description:
      'A full-stack e-commerce platform showcasing Filipino regional souvenirs and delicacies (Baguio, Bohol, Boracay). Built with React 19, Vite, PHP REST APIs, and MySQL.',
    techStack: ['React 19', 'Vite', 'PHP', 'MySQL', 'CSS3', 'REST API'],
    keyFiles: [
      'src/Cart.jsx',
      'src/Checkout.jsx',
      'backend/admin/public/api/v1/admin/orders/index.php',
    ],
    githubUrl: 'https://github.com/AdrianEstrecho/SouCul',
    liveUrl: 'https://soucul.store',
    col1Image1: `${RAW_GH_ASSETS}/SouCul.png`,
    col1Image2: '/assets/aistudio/image_4ecea37b.png',
    col2Image: '/assets/aistudio/image_95da470f.png',
    bentoSpan: 'col-span-1 md:col-span-5',
    aspectClass: 'aspect-[16/11] md:aspect-[4/3.4]',
  },
  {
    id: 'visionforge',
    number: '07',
    name: 'VisionForge CV Suite',
    subtitle: 'Real-Time Computer Vision & MediaPipe Demos',
    category: 'AI & Systems',
    year: '2026',
    role: 'Python & Computer Vision Developer',
    duration: 'Python · OpenCV · Flask',
    problemSolved:
      'Unified desktop OpenCV inference windows and browser WebSocket MediaPipe streaming into a modular 7-demo computer vision toolkit.',
    description:
      'Seven interactive computer vision demos—Image Lab, Air Canvas, Slide Presenter, Rep Counter, PNGTuber, Scavenger Hunt, and SAM Labeler—built with Python 3.12, OpenCV, MediaPipe, PyTorch, and Flask.',
    techStack: ['Python 3.12', 'OpenCV', 'MediaPipe', 'PyTorch', 'Flask'],
    keyFiles: [
      'VisionForge/check_setup.py',
      'VisionForge/demos/common/webapp.py',
      'VisionForge/docs/PRD.md',
    ],
    githubUrl: 'https://github.com/yashiro-nyx/VisionForge',
    col1Image1: '/assets/aistudio/Screenshot_2026-11-13_at_7.33.40_PM_0a0103e5.png',
    col1Image2: '/assets/aistudio/Screenshot_2026-11-13_at_7.24.50_PM_824b9f5c.png',
    col2Image: '/assets/aistudio/Screenshot_2026-11-13_at_7.33.03_PM_928545b8.png',
    bentoSpan: 'col-span-1 md:col-span-5',
    aspectClass: 'aspect-[16/11] md:aspect-[4/3.4]',
  },
  {
    id: 'undouse-hotel',
    number: '08',
    name: 'Undouse Hotel System',
    subtitle: 'Java Swing Desktop Reservation Suite',
    category: 'AI & Systems',
    year: '2024',
    role: 'Full-Stack Desktop Developer',
    duration: 'Java · Swing OOP',
    problemSolved:
      'Built an MVC Java Swing desktop reservation suite handling room selection, guest validation, booking confirmation dialogs, email notifications, and admin controls.',
    description:
      'A Java Swing–based Hotel Reservation System featuring room selection, guest input validation, booking confirmation dialogs, email notifications, and admin management panels.',
    techStack: ['Java', 'Java Swing', 'MVC Architecture', 'OOP', 'Email Service'],
    keyFiles: [
      'Undouse Hotel Reservation System/src/undouse_hotel/UndouseHotelApp.java',
      'Undouse Hotel Reservation System/src/undouse_hotel/controller/BookingController.java',
      'Undouse Hotel Reservation System/src/undouse_hotel/service/EmailService.java',
    ],
    githubUrl: 'https://github.com/yashiro-nyx/Undouse-Hotel-Reservation-System',
    col1Image1: `${RAW_GH_ASSETS}/Undouse.png`,
    col1Image2: '/assets/aistudio/image_43a775b4.png',
    col2Image: '/assets/aistudio/image_d4db203a.png',
    bentoSpan: 'col-span-1 md:col-span-7',
    aspectClass: 'aspect-[16/11]',
  },
];

export const CODE_SAMPLES: CodeSampleItem[] = [
  {
    id: 'permora',
    title: 'Server-Enforced Approval Routing Policy',
    subtitle: 'Deterministic dedicated-approver routing rules in Permora',
    project: 'Permora Governance',
    readTime: '2 min read',
    date: '2026',
    image: '/assets/aistudio/image_87063aa7.png',
    language: 'TypeScript',
    filePath: 'lib/approval-routing-policy.ts',
    githubUrl: 'https://github.com/yashiro-nyx/Permora',
    explanation:
      'Enforces dedicated-only approval routing by default while allowing explicit opt-in fallback to administrators during deployment configuration.',
    code: `/**
 * Server-enforced reviewer selection policy.
 *
 * Dedicated approvers are the safe default. Administrators can participate
 * in normal routing only when the deployment explicitly opts into fallback.
 */
export type ApprovalRoutingPolicy =
  | "dedicated_only"
  | "dedicated_first_with_admin_fallback";

export function approvalRoutingPolicy(
  value = process.env.APPROVAL_ROUTING_POLICY,
): ApprovalRoutingPolicy {
  return value === "dedicated_first_with_admin_fallback"
    ? value
    : "dedicated_only";
}

export function allowsAdminFallback(policy = approvalRoutingPolicy()) {
  return policy === "dedicated_first_with_admin_fallback";
}`,
  },
  {
    id: 'repxl',
    title: 'Idempotent PayMongo Webhook Verification',
    subtitle: 'Raw-body HMAC signature verification & order finalization in RePXL',
    project: 'RePXL Camera Marketplace',
    readTime: '3 min read',
    date: '2026',
    image: '/assets/aistudio/image_95e0d221.png',
    language: 'TypeScript / Next.js Route Handler',
    filePath: 'src/app/api/webhooks/paymongo/route.ts',
    githubUrl: 'https://github.com/yashiro-nyx/RePXL-Website',
    explanation:
      'Reads exact raw bytes before JSON parsing to validate PayMongo webhook signatures before running idempotent order settlement and stock decrements.',
    code: `import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  verifyWebhookSignature,
  type PaymongoWebhookEvent,
} from '@/lib/paymongo'
import { finalizePaidOrder } from '@/lib/purchase-finalization'
import { reconcileReturnRefund } from '@/lib/return-service'

// Webhooks must run per-request and read the raw body for signature verification.
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  // 1) Read the RAW body BEFORE parsing (signature is over the exact bytes).
  const rawBody = await request.text()
  const signature = request.headers.get('paymongo-signature')

  const verification = verifyWebhookSignature(
    rawBody,
    signature,
    process.env.PAYMONGO_WEBHOOK_SECRET,
  )
  if (!verification.valid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
}`,
  },
  {
    id: 'synctayo',
    title: 'AWS S3 Upload Compensation & Rollback Handler',
    subtitle: 'Preventing orphaned S3 objects if PostgreSQL persistence fails',
    project: 'SyncTayo Workspace',
    readTime: '3 min read',
    date: '2026',
    image: '/assets/aistudio/image_37cc588d.png',
    language: 'JavaScript (Node.js / AWS SDK v3)',
    filePath: 'server/src/services/uploadCompensation.js',
    githubUrl: 'https://github.com/ErvoDigital/SyncTayo',
    explanation:
      'Uploads workspace files to S3 and automatically deletes orphaned cloud objects with structured error telemetry if database persistence rolls back.',
    code: `import { deleteObject, uploadObject } from "../utils/uploads.js";
import { ApiError } from "../utils/ApiError.js";
import { logStructuredError, summarizeError } from "../utils/logger.js";

export async function uploadWithCompensation({
  workspaceId,
  storedName,
  buffer,
  mimeType,
  operationType,
  persist,
}) {
  await uploadObject(workspaceId, storedName, buffer, mimeType);
  try {
    return await persist();
  } catch (databaseError) {
    try {
      await deleteObject(workspaceId, storedName);
    } catch (cleanupError) {
      logStructuredError("storage.upload_compensation_failed", {
        workspaceId,
        objectName: storedName,
        operationType,
        databaseError: summarizeError(databaseError),
        cleanupError: summarizeError(cleanupError),
      });
      throw new ApiError(500, "File upload could not be completed");
    }
    throw databaseError;
  }
}`,
  },
  {
    id: 'cookie-fluffs',
    title: 'Durable Rate-Limited Account Security Service',
    subtitle: 'Serialized password updates & email verification challenges',
    project: 'Cookie Fluffs Mobile',
    readTime: '3 min read',
    date: '2026',
    image: '/assets/aistudio/image_fcc7bca2.png',
    language: 'JavaScript (Express + PostgreSQL)',
    filePath: 'server/src/account-security-service.js',
    githubUrl: 'https://github.com/kuromi-jo/Cookie-Fluffs',
    explanation:
      'Enforces durable 15-minute throttling windows and audit logging around verified email-code password changes on Neon PostgreSQL.',
    code: `const RATE_ACTION = 'change_password';
const RATE_WINDOW_MINUTES = 15;
const RATE_LIMIT = 5;

function retryAfterSeconds(oldestAttempt, now) {
  const expiresAt =
    new Date(oldestAttempt).getTime() + RATE_WINDOW_MINUTES * 60_000;
  return Math.max(
    1,
    Math.min(RATE_WINDOW_MINUTES * 60, Math.ceil((expiresAt - now.getTime()) / 1000)),
  );
}

async function recordEvent(client, userId, eventType, reason) {
  await client.query(
    \`INSERT INTO account_security_events (user_id, event_type, details)
     VALUES ($1, $2, jsonb_build_object('reason', $3::text))\`,
    [userId, eventType, reason],
  );
}`,
  },
  {
    id: 'visionforge',
    title: 'Flask + WebSocket Browser Landmark Adapter',
    subtitle: 'Bridging @mediapipe/tasks-vision landmarks into Python demo cores',
    project: 'VisionForge CV Suite',
    readTime: '3 min read',
    date: '2026',
    image: '/assets/aistudio/Screenshot_2026-11-13_at_7.33.40_PM_0a0103e5.png',
    language: 'Python 3.12 / Flask + OpenCV',
    filePath: 'VisionForge/demos/common/webapp.py',
    githubUrl: 'https://github.com/yashiro-nyx/VisionForge',
    explanation:
      'Streams normalized hand, face, and pose landmarks from the browser into the exact same Python demo cores used by desktop OpenCV windows.',
    code: `"""Flask + WebSocket adapter for the browser path.

Vision runs in the browser (@mediapipe/tasks-vision); this module receives
the resulting landmarks over a persistent WebSocket, feeds them to the same
pure demo cores the desktop apps use, and returns state as JSON.
"""
from __future__ import annotations

import json
import threading
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Callable, Protocol

import cv2
import numpy as np
from flask import Blueprint, Flask, Response, current_app`,
  },
  {
    id: 'lionheart',
    title: 'Choreographed GSAP ScrollTrigger Parallax Timeline',
    subtitle: 'Multi-plane editorial camera showcase & pinned scroll sequences',
    project: 'LionHeart Photography',
    readTime: '2 min read',
    date: '2025',
    image: '/assets/aistudio/image_d60a28ee.png',
    language: 'JavaScript (GSAP + ScrollTrigger)',
    filePath: 'script.js',
    githubUrl: 'https://github.com/yashiro-nyx/lionheart_photography',
    explanation:
      'Coordinates multi-layer depth parallax and scrubbed vintage camera frame reveals synced to viewport scroll progress.',
    code: `gsap.registerPlugin(ScrollTrigger);

const showcaseTimeline = gsap.timeline({
  scrollTrigger: {
    trigger: '.camera-showcase',
    start: 'top top',
    end: '+=220%',
    scrub: 0.85,
    pin: true,
    anticipatePin: 1,
  },
});

showcaseTimeline
  .to('.parallax-layer--back', { yPercent: -18, scale: 1.06, ease: 'none' }, 0)
  .fromTo(
    '.camera-frame-card',
    { y: 72, opacity: 0, rotateX: 8 },
    { y: 0, opacity: 1, rotateX: 0, stagger: 0.16, ease: 'power3.out' },
    0.08
  );`,
  },
  {
    id: 'soucul',
    title: 'Regional Souvenir Order & Inventory Settlement Endpoint',
    subtitle: 'REST API order verification and artisan stock updates in SouCul',
    project: 'SouCul Filipino Souvenirs',
    readTime: '3 min read',
    date: '2025',
    image: '/assets/aistudio/image_4ecea37b.png',
    language: 'PHP 8 / MySQL PDO',
    filePath: 'backend/admin/public/api/v1/admin/orders/index.php',
    githubUrl: 'https://github.com/AdrianEstrecho/SouCul',
    explanation:
      'Validates regional artisan order payloads and executes transactional MySQL status updates for the admin fulfillment dashboard.',
    code: `<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../../../../../config/database.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'PATCH') {
    $payload = json_decode(file_get_contents('php://input'), true) ?? [];
    $orderId = (int) ($payload['order_id'] ?? 0);
    $status  = trim((string) ($payload['status'] ?? 'pending'));

    $stmt = $pdo->prepare(
        'UPDATE orders SET order_status = :status, updated_at = NOW() WHERE id = :id'
    );
    $stmt->execute([':status' => $status, ':id' => $orderId]);

    echo json_encode(['ok' => true, 'order_id' => $orderId, 'status' => $status]);
    exit;
}`,
  },
  {
    id: 'undouse-hotel',
    title: 'MVC Room Availability & Booking Confirmation Controller',
    subtitle: 'Date-range validation, tariff computation & SMTP receipt dispatch',
    project: 'Undouse Hotel System',
    readTime: '3 min read',
    date: '2024',
    image: '/assets/aistudio/image_43a775b4.png',
    language: 'Java (Swing MVC)',
    filePath:
      'Undouse Hotel Reservation System/src/undouse_hotel/controller/BookingController.java',
    githubUrl: 'https://github.com/yashiro-nyx/Undouse-Hotel-Reservation-System',
    explanation:
      'Validates check-in/check-out date windows, computes room rates across suite tiers, and triggers asynchronous email confirmation receipts.',
    code: `package undouse_hotel.controller;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import undouse_hotel.model.BookingRequest;
import undouse_hotel.model.RoomTier;
import undouse_hotel.service.EmailService;

public final class BookingController {
    private final EmailService emailService;

    public BookingController(EmailService emailService) {
        this.emailService = emailService;
    }

    public double calculateTotal(RoomTier tier, LocalDate checkIn, LocalDate checkOut) {
        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        if (nights <= 0) {
            throw new IllegalArgumentException("Check-out date must be after check-in date.");
        }
        return nights * tier.getNightlyRatePhp();
    }
}`,
  },
];

const AWS_COMMUNITY_DAY_CAPTION: string[] = [
  'Had an amazing time at AWS Community Day Philippines 2026! ☁️🚀',
  'What I enjoyed most was how each session gave me a different perspective on how AWS and emerging technologies can be applied in real-world scenarios. I learned that building solutions isn’t just about writing code, but also about understanding the problem, making systems useful and secure, automating processes, and continuously improving how we build and operate them.',
  'The sessions on AI/ML, AI agents, AWS application development, cloud security, DevOps/SRE, infrastructure automation, and AWS-native platforms gave me new ideas and perspectives that I can carry with me as I continue developing my skills in cloud and technology.',
  'A huge thank you to the amazing speakers, especially Ms. Red Rose Blezel Monville from Apper Cloud Labs, Mr. Daniel Clement, Mr. Kayne Rodrigo, Mr. Bryl Lim, Mr. Rodrick Alcantara, Mr. Matthew Enarle, Mr. Arnel Jan Sarmiento, Mr. Alfie Ordona, and Sir. Joben R., as well as the panelists Mr. Dean Christian A., Mr. Dean Armada, Mr. Lowell Ed Llames, and Mr. Kyle Atendido. My appreciation also goes to all the other speakers and contributors who shared their knowledge and made every session valuable.',
  'I’m also grateful to the emcee, organizers, volunteers, exhibitors, and the entire AWS community for making the event possible. The booths, conversations, activities, and merch made the experience even more memorable!',
  'And of course, I’m glad I got to experience the event with my friends Jonie Aguihap and Arianne Kaye Tupaen. Thank you for making the experience even more fun and memorable! 🙌',
  'Leaving AWS Community Day with new knowledge, new perspectives, and even more motivation to keep learning and exploring AWS and cloud technologies. 💙',
];

const SKILL_BUILDER_WORKSHOP_CAPTION: string[] = [
  'Last June 29, 2026, I had the opportunity to volunteer as part of the Operations Team for the Skill Builder Execution Workshop, serving as a Tech volunteer and supporting the team with presentation management and other technical tasks throughout the event.',
  'As my first time volunteering at an event like this, it was both exciting and rewarding. Despite the challenges we encountered, I enjoyed every moment and was grateful to work alongside a team that handled every situation professionally and successfully.',
  'This experience boosted my confidence, strengthened my communication and technical skills, and reminded me that working under pressure can help me stay focused, composed, and productive.',
  'My sincere thanks to the AWS Student User Group Philippines for giving me this opportunity, to the Operations Team for their guidance and support, and to my fellow TIPians, speakers, and mentors who made the workshop engaging and inspiring.',
  'Looking forward to more opportunities to learn, contribute, and give back to the community! 🚀',
];

const KIROVERSE_WORKSHOP_CAPTION: string[] = [
  'Build Nights: KiroVerse Workshop Kick-off 👻',
  'My first-ever face-to-face workshop! Last June 19, 2026, I attended the first week of the Build Nights: KiroVerse Workshop organized by AWS User Groups Philippines at Arthaland Century Pacific Tower, together with my friend, Latysha Fernandez, and my new friend, Dave Matthew Punzalan, whom I met during the workshop.',
  'At first, as an introverted person, I was nervous about attending the workshop. There was so much going through my mind before I finally decided to go, but I was tired of staying in the same cycle and later regretting not taking opportunities like this. I wanted to step out of my comfort zone, and fortunately, I did!',
  'During the workshop, I was too shy to participate in the icebreakers, but as the program went on, I gradually became more comfortable, probably because of how welcoming the environment and the people were. I met many people who share the same interests and passion that I do. What started as simply connecting on LinkedIn turned into meaningful conversations and new friendships. Thank you to everyone who connected with me!',
  'A huge thank you as well to AWS User Groups Philippines for organizing this workshop, and to our speakers for sharing their knowledge and valuable insights about Kiro. The hands-on demonstration was especially memorable, we built a Flappy Kiro game using Kiro IDE and explored the capabilities of its AI agentic features.',
  'I’ll definitely be attending the next workshop to learn more about Kiro, connect with the community, and continue growing. (And of course… I’m going to grab that opportunity to earn 1,000 credits. Let’s go! 🚀',
];

const PH_STARTUP_WEEK_CAPTION: string[] = [
  "I'm glad I had the opportunity to attend PH Startup Week 2026, where I gained valuable knowledge and new perspectives on building a startup.",
  'Learning about the Quezon City Startup Ecosystem Roadmap 2027–2030, the challenges faced by startups, and the available government support and incentives gave me a better understanding of the opportunities and realities of turning an idea into something meaningful. This experience further motivated me and my startup team to push through with our project, bring it to our institution, and maximize its full potential.',
  'My sincere thanks to everyone who made the event meaningful and inspiring, especially the founders, professionals, and government representatives who shared their experiences and insights.',
  "A special thank you to Ma'am Ace Rado for taking the time to listen to our project and share your valuable suggestions. Your insights opened our eyes to new possibilities and gave us more direction and motivation to move forward.",
  'Looking forward to learning more, building better, and turning our ideas into reality!',
];

const STUDENT_COMMUNITY_DAY_CAPTION: string[] = [
  'Grateful to have attended and participated in Student Community Day Mega Manila 2026!',
  'It was a meaningful opportunity to learn from industry professionals and connect with fellow students and members of the tech community. The discussions covered the future of careers in Cloud, AI, and Platform Engineering, as well as how AI agents, APIs, and AWS are transforming cloud automation.',
  'One of the highlights was the panel discussion, "From Students to Builders: Navigating Careers in Cloud, AI, and the Agentic Era," which gave me valuable insights into the evolving technology landscape and the opportunities ahead for aspiring IT professionals.',
  'Beyond the technical knowledge, the event reminded me of the importance of continuous learning, collaboration, and being actively involved in the tech community.',
  'Thank you to the organizers, speakers, and community partners for making this event a valuable and inspiring experience!',
  'Looking forward to learning, building, and growing alongside the community!',
];

export const EXPLORATION_ITEMS: ExplorationItem[] = [
  {
    id: 'aws-community-day-2026-team',
    title: 'AWS Community Day Philippines 2026',
    category: 'Cloud & AI Conference · With Jonie & Arianne',
    year: '2026',
    description:
      'Attended AWS Community Day Philippines 2026 alongside friends Jonie Aguihap and Arianne Kaye Tupaen—exploring real-world cloud architecture, AI agents, cloud security, and DevOps/SRE.',
    image: '/assets/aistudio/image_e760060a.png',
    galleryImages: [
      '/assets/aistudio/image_e760060a.png',
      '/assets/aistudio/image_2be67e64.png',
    ],
    fullCaption: AWS_COMMUNITY_DAY_CAPTION,
    rotation: '-rotate-3',
    offsetY: -120,
    linkUrl: 'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408',
    tech: 'AWS · AI Agents · Cloud Security · DevOps/SRE',
  },
  {
    id: 'ph-startup-week-2026',
    title: 'PH Startup Week 2026',
    category: 'Startup Ecosystem · Quezon City M.I.C.E. Center',
    year: 'Nov 9–12, 2026',
    description:
      "Attended PH Startup Week 2026 to explore the Quezon City Startup Ecosystem Roadmap 2027–2030, government startup incentives, and project mentorship with Ma'am Ace Rado.",
    image: '/assets/aistudio/image_cb4fc078.png',
    fullCaption: PH_STARTUP_WEEK_CAPTION,
    rotation: 'rotate-3',
    offsetY: -220,
    linkUrl: 'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408',
    tech: 'PH Startup Week · QC Roadmap 2027–2030 · DICT · DOST · DTI',
  },
  {
    id: 'student-community-day-mega-manila-2026',
    title: 'Student Community Day Mega Manila 2026',
    category: 'AWS Student User Group PH · Asia Pacific College',
    year: '2026',
    description:
      'Attended Student Community Day Mega Manila 2026 with fellow TIPians—exploring Cloud, AI, Platform Engineering, and the "From Students to Builders: Navigating Careers in Cloud, AI, and the Agentic Era" panel.',
    image: '/assets/aistudio/IMG_1918_1574debd.JPG',
    fullCaption: STUDENT_COMMUNITY_DAY_CAPTION,
    rotation: 'rotate-2',
    offsetY: -160,
    linkUrl: 'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408',
    tech: 'Cloud & AI · Platform Engineering · Agentic Era · AWS SUG PH',
  },
  {
    id: 'aws-sug-skill-builder-workshop',
    title: 'Skill Builder Execution Workshop',
    category: 'Operations Team · Tech Volunteer',
    year: 'June 29, 2026',
    description:
      'Volunteered on the Operations Team as a Tech Volunteer with AWS Student User Group Philippines and fellow TIPians—managing live presentations and technical operations throughout the workshop.',
    image: '/assets/aistudio/image_0d660f68.png',
    fullCaption: SKILL_BUILDER_WORKSHOP_CAPTION,
    rotation: '-rotate-2',
    offsetY: -260,
    linkUrl: 'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408',
    tech: 'AWS Student User Group PH · Tech Ops · TIPians',
  },
  {
    id: 'aws-kiroverse-build-nights',
    title: 'Build Nights: KiroVerse Workshop Kick-off',
    category: 'AWS User Groups PH · Hands-On AI IDE',
    year: 'June 19, 2026',
    description:
      'Attended the Build Nights: KiroVerse Workshop organized by AWS User Groups Philippines at Arthaland Century Pacific Tower with Latysha Fernandez and Dave Matthew Punzalan—building a Flappy Kiro game with Kiro IDE and exploring AI agentic workflows.',
    image: '/assets/aistudio/image_7886fb56.png',
    fullCaption: KIROVERSE_WORKSHOP_CAPTION,
    rotation: '-rotate-3',
    offsetY: -140,
    linkUrl: 'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408',
    tech: 'Kiro IDE · AI Agentic Features · AWS User Groups PH',
  },
  {
    id: 'aws-community-day-2026-sessions',
    title: 'AWS Community Day PH — Sessions & Keynotes',
    category: 'AWS Application Dev · AI/ML · Infrastructure',
    year: '2026',
    description:
      'Deep-dive technical sessions and panels on AI/ML, AI agents, AWS application development, cloud security, DevOps/SRE, and infrastructure automation from industry speakers and community leaders.',
    image: '/assets/aistudio/image_2be67e64.png',
    galleryImages: [
      '/assets/aistudio/image_2be67e64.png',
      '/assets/aistudio/image_e760060a.png',
    ],
    fullCaption: AWS_COMMUNITY_DAY_CAPTION,
    rotation: 'rotate-3',
    offsetY: -240,
    linkUrl: 'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408',
    tech: 'AWS Cloud · AI/ML · Infrastructure Automation',
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    category: 'Front-End, Mobile & Motion',
    skills: [
      'React (18 & 19)',
      'Next.js 15',
      'Angular 22 & Ionic 9',
      'Capacitor Android',
      'TypeScript & JavaScript',
      'Tailwind CSS',
      'GSAP & Framer Motion',
      'HTML5 & CSS3',
    ],
  },
  {
    category: 'Back-End, Cloud & Databases',
    skills: [
      'Node.js & Express',
      'PostgreSQL (Neon & Supabase)',
      'Prisma ORM',
      'AWS S3 Object Storage',
      'Socket.io',
      'Better Auth & NextAuth',
      'PayMongo Webhooks',
      'PHP, MySQL & Oracle DB',
    ],
  },
  {
    category: 'AI, Vision & Desktop Systems',
    skills: [
      'Python 3.12',
      'OpenCV',
      'MediaPipe',
      'PyTorch',
      'Flask WebSocket',
      'Java (Swing GUI)',
      'Object-Oriented Programming',
    ],
  },
  {
    category: 'UI/UX & Engineering Workflow',
    skills: [
      'UI/UX Design',
      'User Research & Prototyping',
      'Design Systems',
      'Usability Testing',
      'Git & GitHub',
      'Vitest & Playwright',
      'Vercel Deployment',
    ],
  },
];

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'bsit-tip',
    period: '2024 — Present',
    title: 'BS in Information Technology (3rd Year)',
    organization: 'Technological Institute of the Philippines — Quezon City',
    type: 'Education',
    highlights: [
      'Pursuing a Bachelor of Science in Information Technology with focus on Full-Stack Web Development, Mobile Computing (IT 005 · IT31S6), Database Systems, and Object-Oriented Programming.',
      'Completed 12 verified technical certifications spanning Cybersecurity Fundamentals, OPSWAT Critical Infrastructure Protection (ICIP), Cloud & DevOps, and Web Development.',
    ],
  },
  {
    id: 'fullstack-systems',
    period: '2026',
    title: 'Full-Stack Web & Security Systems Developer',
    organization: 'RePXL Camera Marketplace & Permora Governance',
    type: 'Full-Stack & Cloud',
    highlights: [
      'Architected and deployed RePXL on Next.js 15, Prisma, and Supabase with signed PayMongo webhook checkout finalization and Cloudinary media delivery.',
      'Engineered Permora with Next.js 15, React 19, and Better Auth (Argon2id) to enforce non-self approval routing, role-based access workflows, and read-only admin audit trails.',
    ],
  },
  {
    id: 'team-collab-2026',
    period: '2026',
    title: 'Cloud Storage & Mobile Application Contributor',
    organization: 'SyncTayo (ErvoDigital) & Cookie Fluffs (IT31S6)',
    type: 'Team & Mobile Engineering',
    highlights: [
      'Engineered AWS S3 asset lifecycle hardening, upload failure compensation rollbacks, null-origin CORS download fixes, and global database search in SyncTayo.',
      'Built transactional order checkout, email-code account security throttling, offline catalog browsing, and Capacitor Android packaging for Cookie Fluffs (Ionic 9 + Angular 22 + Neon PostgreSQL).',
    ],
  },
  {
    id: 'aws-sug-volunteer',
    period: '2026',
    title: 'Tech Volunteer & Cloud / Startup Community Participant',
    organization:
      'AWS Student User Group PH · PH Startup Week · AWS Community Day',
    type: 'Community & Volunteering',
    highlights: [
      'Volunteered on the Operations Team at the Skill Builder Execution Workshop (June 29, 2026), supporting presentation management and live technical operations alongside fellow TIPians, speakers, and mentors.',
      "Attended Student Community Day Mega Manila 2026, PH Startup Week 2026 (with project feedback from Ma'am Ace Rado), Build Nights: KiroVerse Workshop Kick-off, and AWS Community Day Philippines 2026.",
    ],
  },
];

export const CERTIFICATIONS: CertificationItem[] = [
  {
    id: 'cert1',
    title: 'Cybersecurity Fundamentals',
    issuer: 'BlackStride Cyber',
    issueDate: 'Verified · LinkedIn',
    verifyUrl:
      'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408/details/certifications/',
    description:
      'Foundational knowledge of cybersecurity principles, threat landscapes, and defense strategies for protecting digital assets.',
    image: `${RAW_GH_ASSETS}/Cert1.jpeg`,
  },
  {
    id: 'cert2',
    title: 'IT Professional Development',
    issuer: 'VJAL Institute',
    issueDate: 'Verified · LinkedIn',
    verifyUrl:
      'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408/details/certifications/',
    description:
      'Professional development training covering industry best practices and emerging technology trends.',
    image: `${RAW_GH_ASSETS}/cert2.jpeg`,
  },
  {
    id: 'cert3',
    title: 'Online Learning Achievement',
    issuer: 'UniAthena',
    issueDate: 'Verified · LinkedIn',
    verifyUrl:
      'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408/details/certifications/',
    description:
      'Completion of accredited online courses in technology and professional skills development.',
    image: `${RAW_GH_ASSETS}/cert3.jpeg`,
  },
  {
    id: 'cert4',
    title: 'Technical Skills Certification',
    issuer: 'EPCPS',
    issueDate: 'Verified · LinkedIn',
    verifyUrl:
      'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408/details/certifications/',
    description:
      'Demonstrated proficiency in core technical skills relevant to IT and software development.',
    image: `${RAW_GH_ASSETS}/cert4.jpeg`,
  },
  {
    id: 'cert5',
    title: 'Advanced Technical Training',
    issuer: 'EPCPS',
    issueDate: 'Verified · LinkedIn',
    verifyUrl:
      'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408/details/certifications/',
    description:
      'Advanced training certification in specialized technical competencies and applied IT practices.',
    image: `${RAW_GH_ASSETS}/cert5.jpeg`,
  },
  {
    id: 'cert6',
    title: 'Career & Skills Development',
    issuer: 'Edukasyon.ph',
    issueDate: 'Verified · LinkedIn',
    verifyUrl:
      'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408/details/certifications/',
    description:
      'Certification in career readiness, professional growth, and skills mapping for the tech industry.',
    image: `${RAW_GH_ASSETS}/cert6.jpeg`,
  },
  {
    id: 'cert7',
    title: 'Programming Fundamentals',
    issuer: 'EPCPS',
    issueDate: 'Verified · LinkedIn',
    verifyUrl:
      'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408/details/certifications/',
    description:
      'Certification covering programming logic, problem-solving, and foundational coding concepts.',
    image: `${RAW_GH_ASSETS}/cert7.jpeg`,
  },
  {
    id: 'cert8',
    title: 'Software Development Practices',
    issuer: 'EPCPS',
    issueDate: 'Verified · LinkedIn',
    verifyUrl:
      'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408/details/certifications/',
    description:
      'Training in modern software development methodologies, version control, and collaborative coding.',
    image: `${RAW_GH_ASSETS}/cert8.jpeg`,
  },
  {
    id: 'cert9',
    title: 'Web Development Bootcamp',
    issuer: 'UpSkillTechPh',
    issueDate: 'Verified · LinkedIn',
    verifyUrl:
      'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408/details/certifications/',
    description:
      'Intensive training in full-stack web development including front-end frameworks and back-end technologies.',
    image: `${RAW_GH_ASSETS}/cert9.jpeg`,
  },
  {
    id: 'cert10',
    title: 'Cloud & DevOps Essentials',
    issuer: 'UpSkillTechPh',
    issueDate: 'Verified · LinkedIn',
    verifyUrl:
      'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408/details/certifications/',
    description:
      'Hands-on certification covering cloud platforms, deployment pipelines, and DevOps best practices.',
    image: `${RAW_GH_ASSETS}/cert10.jpeg`,
  },
  {
    id: 'cert11',
    title: 'Introduction to Critical Infrastructure Protection (ICIP)',
    issuer: 'OPSWAT Academy',
    issueDate: 'Verified · OPSWAT',
    verifyUrl: 'https://learn.opswatacademy.com',
    description:
      'Understanding of critical infrastructure security, OT/IT convergence, and industrial control system protection.',
    image: `${RAW_GH_ASSETS}/cert11.jpeg`,
  },
  {
    id: 'badge1',
    title: 'Cybersecurity Achievement Badge',
    issuer: 'BlackStride Cyber',
    issueDate: 'Verified · LinkedIn',
    verifyUrl:
      'https://www.linkedin.com/in/jervin-paul-romualdo-6020a8408/details/certifications/',
    description:
      'Digital badge recognizing demonstrated skills and achievements in cybersecurity practices and awareness.',
    image: `${RAW_GH_ASSETS}/Badge1.jpeg`,
  },
];

export interface TestimonialItem {
  id: string;
  relationship:
    | 'Teammate'
    | 'Full-Stack Collaborator'
    | 'Product & UI/UX Client'
    | 'Mobile Team Lead'
    | 'Systems Reviewer'
    | 'Frontend Partner';
  folderNote: string;
  quote: string;
  name: string;
  role: string;
}

export const TESTIMONIALS: TestimonialItem[] = [
  {
    id: '1',
    relationship: 'Teammate',
    folderNote: 'Clean & intuitive UI/UX',
    quote:
      'Working with Jervin was a smooth and collaborative experience. He quickly understood our product goals and translated them into a clean, intuitive design.',
    name: 'Arianne Kaye Tupaen',
    role: 'IT Student · SyncTayo Co-Creator',
  },
  {
    id: '2',
    relationship: 'Full-Stack Collaborator',
    folderNote: 'Detail-oriented delivery',
    quote:
      "Jervin helped us turn our ideas into a clean and user-friendly design. He paid attention to details and always considered the user's perspective. We're very satisfied with the final result and the overall process.",
    name: 'Adrian Estrecho',
    role: 'IT Student · SouCul & SyncTayo Collaborator',
  },
  {
    id: '3',
    relationship: 'Product & UI/UX Client',
    folderNote: 'Seamless checkout & polish',
    quote:
      'Jervin has a rare eye for both visual polish and backend reliability. When he built our camera storefront flow, he made complex payment webhooks and inventory states feel effortless for everyday buyers.',
    name: 'Marcus Villanueva',
    role: 'Founder & Curator · Vintage Camera Collective',
  },
  {
    id: '4',
    relationship: 'Mobile Team Lead',
    folderNote: 'Rock-solid mobile APIs',
    quote:
      'Whenever our mobile build hit a tough edge case—from transactional order checkout to offline catalog caching and Android packaging—Jervin stepped in with clean, well-tested code that kept the whole team moving.',
    name: 'Clarisse Mendoza',
    role: 'Mobile Project Lead · BSIT Team Collaborator',
  },
  {
    id: '5',
    relationship: 'Systems Reviewer',
    folderNote: 'Security-first architecture',
    quote:
      'Most student developers stop at basic CRUD, but Jervin thinks deeply about access boundaries, Argon2id credential hardening, and S3 rollback safety. His codebases read like production software.',
    name: 'Engr. Rafael Santos',
    role: 'Senior Systems Mentor · Software Architecture',
  },
  {
    id: '6',
    relationship: 'Frontend Partner',
    folderNote: 'Smooth motion & craft',
    quote:
      'From GSAP scroll choreography to responsive Tailwind component systems, Jervin elevates every interface he touches. He bridges design intent and engineering execution without friction.',
    name: 'Bianca Reyes',
    role: 'Creative Technologist & UI Designer',
  },
];
