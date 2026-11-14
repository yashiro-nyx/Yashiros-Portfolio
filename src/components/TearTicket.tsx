import React, {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import {
  motion,
  useMotionTemplate,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';

const DEFAULT_CONFETTI_COLORS = [
  '#89AACC',
  '#4E85BF',
  '#61DCA3',
  '#DCEBFF',
  '#FFFFFF',
];

type ConfettiShape = 'rect' | 'ribbon' | 'diamond' | 'sparkle';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  shape: ConfettiShape;
  rot: number;
  rotSpeed: number;
  flip: number;
  flipSpeed: number;
  wobble: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  age: number;
  life: number;
  gravityScale: number;
  drag: number;
}

const TILT_SPRING = { stiffness: 220, damping: 24, mass: 0.6 };
const GRAVITY = 2400;
const ART_INSET = 10;
const ART_SPAN = 0.72;
const RETRACT = 0.17;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const rad = (deg: number) => (deg * Math.PI) / 180;
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const noise = (seed: number) => {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const f = (n: number) => n.toFixed(2);

interface BridgePoint {
  y0: number;
  y1: number;
  mid: number;
  pts: Array<[number, number]>;
  x: number;
  y: number;
}

interface EndPoint {
  x: number;
  y: number;
  v: number;
}

interface TicketGeometry {
  vertical: boolean;
  cross: number;
  seamPos: number;
  body: string;
  stub: string;
  bridges: BridgePoint[];
  ends: EndPoint[];
  bodyOutline: string;
  stubOutline: string;
  seamGuide: string;
  reticlePath: string;
}

const buildGeometry = (
  W: number,
  H: number,
  S: number,
  R: number,
  holes: number,
  hole: number,
  notch: number,
  rough: number,
  vertical: boolean
): TicketGeometry => {
  const main = vertical ? H : W;
  const cross = vertical ? W : H;
  const x = main - S;
  const hr = hole / 2;
  const n = Math.max(1, Math.round(holes));
  const span = cross - 2 * notch;
  const bridge = Math.max(2, (span - n * hole) / (n + 1));
  const random = noise(n * 7919 + Math.round(cross));
  const at = (u: number, v: number) =>
    vertical ? { x: v, y: u } : { x: u, y: v };
  const pt = (u: number, v: number) =>
    vertical ? `${f(v)},${f(u)}` : `${f(u)},${f(v)}`;
  const arc = (r: number, sweep: number, u: number, v: number) =>
    `A${f(r)},${f(r)} 0 0 ${vertical ? 1 - sweep : sweep} ${pt(u, v)}`;
  const bridges: BridgePoint[] = [];
  for (let i = 0; i <= n; i += 1) {
    const y0 = notch + i * (bridge + hole);
    const y1 = y0 + bridge;
    const steps = Math.max(2, Math.round(bridge / 2.2));
    const pts: Array<[number, number]> = [];
    for (let k = 1; k < steps; k += 1) {
      pts.push([
        x + (random() - 0.5) * 2 * rough,
        y0 + (bridge * k) / steps,
      ]);
    }
    bridges.push({
      y0,
      y1,
      mid: (y0 + y1) / 2,
      pts,
      ...at(x, (y0 + y1) / 2),
    });
  }
  let body = `M${pt(R, 0)}L${pt(x - notch, 0)}${arc(notch, 0, x, notch)}`;
  bridges.forEach((b, i) => {
    b.pts.forEach((p) => {
      body += `L${pt(p[0], p[1])}`;
    });
    body += `L${pt(x, b.y1)}`;
    if (i < n) body += arc(hr, 0, x, b.y1 + hole);
  });
  body += `${arc(notch, 0, x - notch, cross)}L${pt(R, cross)}${arc(
    R,
    1,
    0,
    cross - R
  )}L${pt(0, R)}${arc(R, 1, R, 0)}Z`;

  let stub = `M${pt(x + notch, 0)}L${pt(main - R, 0)}${arc(
    R,
    1,
    main,
    R
  )}L${pt(main, cross - R)}${arc(R, 1, main - R, cross)}L${pt(
    x + notch,
    cross
  )}${arc(notch, 0, x, cross - notch)}`;
  for (let i = n; i >= 0; i -= 1) {
    const b = bridges[i];
    for (let k = b.pts.length - 1; k >= 0; k -= 1) {
      stub += `L${pt(b.pts[k][0], b.pts[k][1])}`;
    }
    stub += `L${pt(x, b.y0)}`;
    if (i > 0) stub += arc(hr, 0, x, b.y0 - hole);
  }
  stub += `${arc(notch, 0, x + notch, 0)}Z`;

  const ends: EndPoint[] = [
    { ...at(x, notch), v: notch },
    { ...at(x, cross - notch), v: cross - notch },
  ];
  const bodyOutline = `M${pt(x, cross - notch)}${arc(
    notch,
    0,
    x - notch,
    cross
  )}L${pt(R, cross)}${arc(R, 1, 0, cross - R)}L${pt(0, R)}${arc(
    R,
    1,
    R,
    0
  )}L${pt(x - notch, 0)}${arc(notch, 0, x, notch)}`;
  const stubOutline = `M${pt(x, notch)}${arc(
    notch,
    0,
    x + notch,
    0
  )}L${pt(main - R, 0)}${arc(R, 1, main, R)}L${pt(main, cross - R)}${arc(
    R,
    1,
    main - R,
    cross
  )}L${pt(x + notch, cross)}${arc(notch, 0, x, cross - notch)}`;

  // Precision CAD registration reticles & laser-scored seam guide SVG paths
  const seamGuide = `M${pt(x, notch + 4)}L${pt(x, cross - notch - 4)}`;
  const pad = 12;
  const arm = 7;
  const reticlePath = vertical
    ? `M${f(pad)},${f(pad + arm)}V${f(pad)}H${f(pad + arm)}M${f(
        W - pad - arm
      )},${f(pad)}H${f(W - pad)}V${f(pad + arm)}M${f(pad)},${f(
        x - pad - arm
      )}V${f(x - pad)}H${f(pad + arm)}`
    : `M${f(pad)},${f(pad + arm)}V${f(pad)}H${f(pad + arm)}M${f(
        x - pad - arm
      )},${f(pad)}H${f(x - pad)}V${f(pad + arm)}M${f(pad)},${f(
        H - pad - arm
      )}V${f(H - pad)}H${f(pad + arm)}M${f(x - pad - arm)},${f(H - pad)}H${f(
        x - pad
      )}V${f(H - pad - arm)}`;

  return {
    vertical,
    cross,
    seamPos: x,
    body,
    stub,
    bridges,
    ends,
    bodyOutline,
    stubOutline,
    seamGuide,
    reticlePath,
  };
};

export interface TearTicketProps {
  children?: React.ReactNode;
  stub?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  scrim?: boolean;
  imageRadius?: number;
  orientation?: 'horizontal' | 'vertical';
  torn?: boolean;
  defaultTorn?: boolean;
  onTear?: () => void;
  width?: number;
  height?: number;
  stubSize?: number;
  radius?: number;
  holes?: number;
  holeSize?: number;
  notch?: number;
  roughness?: number;
  tearAngle?: number;
  stretch?: number;
  resistance?: number;
  rotate?: number;
  tilt?: boolean;
  tiltMax?: number;
  tiltReach?: number;
  parallax?: number;
  perspective?: number;
  background?: string;
  color?: string;
  accentColor?: string;
  border?: boolean;
  borderColor?: string;
  borderWidth?: number;
  stubBackground?: string;
  recenter?: boolean;
  confetti?: boolean;
  confettiColors?: string[];
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
}

export default function TearTicket({
  children = null,
  stub = null,
  image = '',
  imageAlt = '',
  scrim = true,
  imageRadius = 10,
  orientation = 'horizontal',
  torn,
  defaultTorn = false,
  onTear,
  width = 460,
  height = 250,
  stubSize = 150,
  radius = 16,
  holes = 12,
  holeSize = 6,
  notch = 3,
  roughness = 0,
  tearAngle = 30,
  stretch = 30,
  resistance = 0.45,
  rotate = 4,
  tilt = true,
  tiltMax = 9,
  tiltReach = 260,
  parallax = 6,
  perspective = 1000,
  background = '#0f1218',
  color = '#f5f5f5',
  accentColor = '#89AACC',
  border = true,
  borderColor = '',
  borderWidth = 1,
  stubBackground = '',
  recenter = true,
  confetti = true,
  confettiColors = DEFAULT_CONFETTI_COLORS,
  disabled = false,
  ariaLabel = 'Tear off the stub to start collaboration',
  className = '',
}: TearTicketProps) {
  const reduce = useReducedMotion();
  const controlled = torn !== undefined;
  const [inner, setInner] = useState(defaultTorn);
  const used = controlled ? torn : inner;
  const [grabbing, setGrabbing] = useState(false);
  const [instant, setInstant] = useState(Boolean(used));
  const [fit, setFit] = useState(1);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const stubRef = useRef<HTMLDivElement | null>(null);
  const fibres = useRef<Array<SVGPathElement | null>>([]);
  const vertical = orientation === 'vertical';
  const geo = useMemo(
    () =>
      buildGeometry(
        width,
        height,
        stubSize,
        radius,
        holes,
        holeSize,
        notch,
        roughness,
        vertical
      ),
    [width, height, stubSize, radius, holes, holeSize, notch, roughness, vertical]
  );

  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiParticlesRef = useRef<ConfettiParticle[]>([]);
  const confettiRafRef = useRef<number>(0);
  const confettiLastRef = useRef<number>(0);

  const cfg = useRef({
    geo,
    tearAngle,
    stretch,
    resistance,
    height,
    width,
    notch,
    reduce: Boolean(reduce),
    onTear,
    controlled,
    confetti,
    confettiColors,
  });
  cfg.current = {
    geo,
    tearAngle,
    stretch,
    resistance,
    height,
    width,
    notch,
    reduce: Boolean(reduce),
    onTear,
    controlled,
    confetti,
    confettiColors,
  };

  const sim = useRef({
    raf: 0,
    last: 0,
    phase: 'idle' as 'idle' | 'held' | 'free' | 'drop' | 'return',
    id: null as number | null,
    sign: 1,
    hinge: { x: 0, y: 0 },
    hingeV: 0,
    grab: { x: 0, y: 0 },
    start: { x: 0, y: 0 },
    point: { x: 0, y: 0 },
    a0: 0,
    theta: 0,
    thetaV: 0,
    sx: 0,
    sy: 0,
    vx: 0,
    vy: 0,
    spin: 0,
    pvx: 0,
    pvy: 0,
    pt: 0,
    fade: 1,
    age: 0,
    bx: 0,
    bv: 0,
    snapped: [] as boolean[],
    snapAt: [] as number[],
    span: [] as number[],
  });

  const gradId = useId();
  const tiltX = useSpring(0, TILT_SPRING);
  const tiltY = useSpring(0, TILT_SPRING);
  const plane = useMotionTemplate`perspective(${perspective}px) rotate(${rotate}deg) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  const depth = tiltMax > 0 ? parallax / tiltMax : 0;
  const artX = useTransform(tiltY, (v) => -v * depth);
  const artY = useTransform(tiltX, (v) => v * depth);
  const art = useMotionTemplate`translate(${artX}px, ${artY}px)`;
  const inkX = useTransform(tiltY, (v) => v * depth * 0.22);
  const inkY = useTransform(tiltX, (v) => -v * depth * 0.22);
  const ink = useMotionTemplate`translate(${inkX}px, ${inkY}px)`;
  const sheenX = useTransform(tiltY, [-tiltMax, tiltMax], [15, 85]);
  const sheenY = useTransform(tiltX, [-tiltMax, tiltMax], [85, 15]);
  const sheenBg = useMotionTemplate`radial-gradient(280px circle at ${sheenX}% ${sheenY}%, rgba(137, 170, 204, 0.22), rgba(97, 220, 163, 0.08) 38%, transparent 72%)`;

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const measure = () => setFit(Math.min(1, el.clientWidth / width) || 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  const paint = (now: number) => {
    const s = sim.current;
    const c = cfg.current;
    const stubEl = stubRef.current;
    const bodyEl = bodyRef.current;
    if (stubEl) {
      stubEl.style.transform = `translate(${s.sx.toFixed(2)}px, ${s.sy.toFixed(
        2
      )}px) rotate(${((s.theta * s.sign * 180) / Math.PI).toFixed(3)}deg)`;
      stubEl.style.opacity = s.fade.toFixed(3);
    }
    const up = c.geo.vertical;
    if (bodyEl) {
      bodyEl.style.transform = `translate${up ? 'Y' : 'X'}(${s.bx.toFixed(
        2
      )}px)`;
    }
    const cos = Math.cos(s.theta * s.sign);
    const sin = Math.sin(s.theta * s.sign);
    const lx = up ? 1.6 : 0;
    const ly = up ? 0 : 1.6;
    let busy = false;
    c.geo.bridges.forEach((b, i) => {
      const dx = b.x - s.hinge.x;
      const dy = b.y - s.hinge.y;
      const tx = s.hinge.x + dx * cos - dy * sin + s.sx;
      const ty = s.hinge.y + dx * sin + dy * cos + s.sy;
      const ox = b.x + (up ? 0 : s.bx);
      const oy = b.y + (up ? s.bx : 0);
      const gx = tx - ox;
      const gy = ty - oy;
      const gap = Math.hypot(gx, gy);
      const near = fibres.current[i * 2];
      const far = fibres.current[i * 2 + 1];
      if (!near || !far) return;
      const live = s.phase !== 'idle' && !c.reduce;
      if (!s.snapped[i]) {
        if (!live || gap < 0.35) {
          near.style.opacity = '0';
          far.style.opacity = '0';
          return;
        }
        const k = clamp(gap / c.stretch, 0, 1);
        const sag = gap * 0.18;
        const w = (1.7 - 1.15 * k).toFixed(2);
        const sx = (up ? sag : 0) + gx / 2;
        const sy = (up ? 0 : sag) + gy / 2;
        near.setAttribute(
          'd',
          `M${f(ox - lx)},${f(oy - ly)}Q${f(ox - lx + sx)},${f(
            oy - ly + sy
          )} ${f(tx - lx)},${f(ty - ly)}`
        );
        far.setAttribute(
          'd',
          `M${f(ox + lx)},${f(oy + ly)}Q${f(ox + lx + gx - sx)},${f(
            oy + ly + gy - sy
          )} ${f(tx + lx)},${f(ty + ly)}`
        );
        near.style.strokeWidth = w;
        far.style.strokeWidth = w;
        near.style.opacity = '1';
        far.style.opacity = '1';
        s.span[i] = gap;
        return;
      }
      const t = (now - s.snapAt[i]) / 1000 / RETRACT;
      if (!live || t >= 1 || !s.snapAt[i]) {
        near.style.opacity = '0';
        far.style.opacity = '0';
        return;
      }
      busy = true;
      const left = (1 - t) * (1 - t);
      const len = (s.span[i] || c.stretch) * 0.5 * left;
      const ux = gap > 0.01 ? gx / gap : 1;
      const uy = gap > 0.01 ? gy / gap : 0;
      near.setAttribute(
        'd',
        `M${f(ox)},${f(oy)}L${f(ox + ux * len)},${f(oy + uy * len)}`
      );
      far.setAttribute(
        'd',
        `M${f(tx)},${f(ty)}L${f(tx - ux * len)},${f(ty - uy * len)}`
      );
      near.style.strokeWidth = '0.9';
      far.style.strokeWidth = '0.9';
      near.style.opacity = left.toFixed(2);
      far.style.opacity = left.toFixed(2);
    });
    return busy;
  };

  const stepConfetti = (now: number) => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) {
      confettiRafRef.current = 0;
      confettiParticlesRef.current = [];
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      confettiRafRef.current = 0;
      confettiParticlesRef.current = [];
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetW = Math.round(vw * dpr);
    const targetH = Math.round(vh * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const dt = clamp((now - confettiLastRef.current) / 1000, 0.001, 0.035);
    confettiLastRef.current = now;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, vw, vh);

    const particles = confettiParticlesRef.current;
    const alive: ConfettiParticle[] = [];

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];
      p.age += dt;
      if (p.age >= p.life || p.y > vh + 60) continue;

      const dragFactor = Math.exp(-p.drag * dt);
      p.vx *= dragFactor;
      p.vy = p.vy * dragFactor + 760 * p.gravityScale * dt;
      p.wobble += p.wobbleSpeed * dt;
      p.rot += p.rotSpeed * dt;
      p.flip += p.flipSpeed * dt;

      p.x += (p.vx + Math.cos(p.wobble) * p.wobbleAmp) * dt;
      p.y += p.vy * dt;

      const progress = p.age / p.life;
      const alpha =
        progress < 0.65
          ? 1
          : clamp(1 - (progress - 0.65) / 0.35, 0, 1);

      const scaleY = Math.cos(p.flip);
      const absScale = Math.abs(scaleY);

      ctx.save();
      ctx.globalAlpha = alpha * (0.45 + 0.55 * absScale);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect' || p.shape === 'ribbon') {
        const drawnH = Math.max(1.2, p.h * scaleY);
        ctx.fillRect(-p.w / 2, -drawnH / 2, p.w, drawnH);
      } else if (p.shape === 'diamond') {
        const s = p.w * 0.65;
        ctx.beginPath();
        ctx.moveTo(0, -s);
        ctx.lineTo(s * (0.45 + 0.55 * absScale), 0);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * (0.45 + 0.55 * absScale), 0);
        ctx.closePath();
        ctx.fill();
      } else {
        const r = p.w * (0.7 + 0.3 * Math.sin(p.flip * 1.4));
        const innerR = r * 0.28;
        ctx.beginPath();
        for (let k = 0; k < 8; k += 1) {
          const radLen = k % 2 === 0 ? r : innerR;
          const angle = (k * Math.PI) / 4;
          const px = Math.cos(angle) * radLen;
          const py = Math.sin(angle) * radLen;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
      alive.push(p);
    }

    confettiParticlesRef.current = alive;
    if (alive.length > 0) {
      confettiRafRef.current = requestAnimationFrame(stepConfetti);
    } else {
      ctx.clearRect(0, 0, vw, vh);
      confettiRafRef.current = 0;
    }
  };

  const spawnConfetti = () => {
    const c = cfg.current;
    if (!c.confetti || c.reduce || !confettiCanvasRef.current) return;

    const palette =
      c.confettiColors && c.confettiColors.length > 0
        ? c.confettiColors
        : DEFAULT_CONFETTI_COLORS;

    const rect = stageRef.current?.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let originX = vw * 0.5;
    let originY = vh * 0.55;
    let spreadX = 24;
    let spreadY = 70;

    if (rect && rect.width > 0 && rect.height > 0) {
      if (c.geo.vertical) {
        originX = rect.left + rect.width * 0.5;
        originY = rect.top + rect.height * (c.geo.seamPos / c.height);
        spreadX = rect.width * 0.35;
        spreadY = 14;
      } else {
        originX = rect.left + rect.width * (c.geo.seamPos / c.width);
        originY = rect.top + rect.height * 0.5;
        spreadX = 14;
        spreadY = rect.height * 0.36;
      }
    }

    const shapes: ConfettiShape[] = [
      'rect',
      'rect',
      'ribbon',
      'diamond',
      'sparkle',
    ];
    const next: ConfettiParticle[] = [];
    const total = 74;

    for (let i = 0; i < total; i += 1) {
      const isSparkle = i >= total - 18;
      const shape: ConfettiShape = isSparkle
        ? i % 2 === 0
          ? 'sparkle'
          : 'diamond'
        : shapes[Math.floor(Math.random() * shapes.length)];

      // Fan upward and outward around the torn seam so particles burst visibly over the modal
      const baseAngle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI * 0.92);
      const speed = isSparkle
        ? 220 + Math.random() * 440
        : 360 + Math.random() * 680;

      const w =
        shape === 'ribbon'
          ? 11 + Math.random() * 6
          : shape === 'sparkle'
            ? 5 + Math.random() * 4
            : 6 + Math.random() * 5;
      const h =
        shape === 'ribbon' ? 3.5 + Math.random() * 2 : 4.5 + Math.random() * 4;

      next.push({
        x: originX + (Math.random() - 0.5) * spreadX * 2,
        y: originY + (Math.random() - 0.5) * spreadY * 2,
        vx: Math.cos(baseAngle) * speed + (Math.random() - 0.5) * 90,
        vy: Math.sin(baseAngle) * speed - Math.random() * 140,
        w,
        h,
        color: palette[Math.floor(Math.random() * palette.length)],
        shape,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 11,
        flip: Math.random() * Math.PI * 2,
        flipSpeed: (Math.random() > 0.5 ? 1 : -1) * (6 + Math.random() * 10),
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 3 + Math.random() * 4,
        wobbleAmp: 22 + Math.random() * 45,
        age: 0,
        life: 1.45 + Math.random() * 1.1,
        gravityScale: isSparkle ? 0.62 : 0.85 + Math.random() * 0.35,
        drag: 1.4 + Math.random() * 1.1,
      });
    }

    confettiParticlesRef.current = confettiParticlesRef.current.concat(next);
    if (!confettiRafRef.current) {
      confettiLastRef.current = performance.now();
      confettiRafRef.current = requestAnimationFrame(stepConfetti);
    }
  };

  const finish = () => {
    const c = cfg.current;
    if (stubRef.current) stubRef.current.style.visibility = 'hidden';
    if (!c.controlled) setInner(true);
    c.onTear?.();
    spawnConfetti();
  };

  const step = (now: number) => {
    const s = sim.current;
    const c = cfg.current;
    const dt = clamp((now - s.last) / 1000, 0.001, 0.034);
    s.last = now;
    const limit = rad(c.tearAngle);
    if (s.phase === 'held') {
      const count = c.geo.bridges.length;
      let intact = 0;
      for (let i = 0; i < count; i += 1) if (!s.snapped[i]) intact += 1;
      const hold = count ? intact / count : 0;
      const follow = 0.92 * (1 - clamp(c.resistance, 0, 0.95) * hold);
      const a = Math.atan2(s.point.y - s.hinge.y, s.point.x - s.hinge.x);
      const want = clamp(wrap(a - s.a0) * s.sign * follow, 0, limit + 0.1);
      s.theta += (want - s.theta) * (1 - Math.exp(-dt / 0.035));
      const up = c.geo.vertical;
      const away = clamp(
        ((up ? s.point.y - s.start.y : s.point.x - s.start.x) || 0) * 0.05,
        -2,
        4
      );
      const side = clamp(
        ((up ? s.point.x - s.start.x : s.point.y - s.start.y) || 0) * 0.05,
        -3,
        3
      );
      const px = up ? side : away;
      const py = up ? away : side;
      s.sx += (px - s.sx) * (1 - Math.exp(-dt / 0.05));
      s.sy += (py - s.sy) * (1 - Math.exp(-dt / 0.05));
      const slack = Math.hypot(s.sx, s.sy);
      let left = 0;
      c.geo.bridges.forEach((b, i) => {
        if (s.snapped[i]) return;
        const d = Math.abs(b.mid - s.hingeV);
        if (
          2 * d * Math.sin(s.theta / 2) + slack > c.stretch ||
          s.theta >= limit
        ) {
          s.snapped[i] = true;
          s.snapAt[i] = now;
          s.bv -= 560 / c.geo.bridges.length;
        } else left += 1;
      });
      if (left === 0) {
        s.phase = 'free';
        s.bv -= 150;
      }
    } else if (s.phase === 'free') {
      const cos = Math.cos(s.theta * s.sign);
      const sin = Math.sin(s.theta * s.sign);
      const gx = s.grab.x - s.hinge.x;
      const gy = s.grab.y - s.hinge.y;
      const wx = s.point.x - s.hinge.x - (gx * cos - gy * sin);
      const wy = s.point.y - s.hinge.y - (gx * sin + gy * cos);
      s.sx += (wx - s.sx) * (1 - Math.exp(-dt / 0.045));
      s.sy += (wy - s.sy) * (1 - Math.exp(-dt / 0.045));
      const hang = limit * 0.55 + clamp(s.pvx * 0.0009 * s.sign, -0.3, 0.3);
      s.theta += (hang - s.theta) * (1 - Math.exp(-dt / 0.12));
    } else if (s.phase === 'drop') {
      s.age += dt;
      s.vy += GRAVITY * dt;
      s.sx += s.vx * dt;
      s.sy += s.vy * dt;
      s.theta += s.spin * dt;
      if (s.age > 0.16) s.fade = clamp(1 - (s.age - 0.16) / 0.42, 0, 1);
      if (s.fade <= 0) {
        s.phase = 'idle';
        finish();
      }
    } else if (s.phase === 'return') {
      s.thetaV += (-300 * s.theta - 24 * s.thetaV) * dt;
      s.theta += s.thetaV * dt;
      s.sx += (0 - s.sx) * (1 - Math.exp(-dt / 0.07));
      s.sy += (0 - s.sy) * (1 - Math.exp(-dt / 0.07));
      if (
        Math.abs(s.theta) < 0.0008 &&
        Math.abs(s.thetaV) < 0.01 &&
        Math.hypot(s.sx, s.sy) < 0.05
      ) {
        s.theta = 0;
        s.thetaV = 0;
        s.sx = 0;
        s.sy = 0;
        s.phase = 'idle';
      }
    }
    s.bv += (-520 * s.bx - 30 * s.bv) * dt;
    s.bx += s.bv * dt;
    const busy = paint(now);
    const moving = Math.abs(s.bx) > 0.02 || Math.abs(s.bv) > 0.5;
    if (s.phase !== 'idle' || moving || busy) {
      s.raf = requestAnimationFrame(step);
    } else {
      s.bx = 0;
      s.bv = 0;
      paint(now);
      s.raf = 0;
    }
  };

  const run = () => {
    const s = sim.current;
    if (s.raf) return;
    s.last = performance.now();
    s.raf = requestAnimationFrame(step);
  };

  const reset = () => {
    const s = sim.current;
    cancelAnimationFrame(s.raf);
    Object.assign(s, {
      raf: 0,
      phase: 'idle',
      id: null,
      theta: 0,
      thetaV: 0,
      sx: 0,
      sy: 0,
      fade: 1,
      age: 0,
      bx: 0,
      bv: 0,
    });
    s.snapped = [];
    s.snapAt = [];
    s.span = [];
    if (stubRef.current) stubRef.current.style.visibility = '';
    paint(performance.now());
  };

  useEffect(() => {
    if (used) {
      const s = sim.current;
      if (s.phase === 'idle' && stubRef.current) {
        stubRef.current.style.visibility = 'hidden';
      }
      return;
    }
    setInstant(false);
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [used]);

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo]);

  useEffect(() => {
    const s = sim.current;
    return () => {
      cancelAnimationFrame(s.raf);
      cancelAnimationFrame(confettiRafRef.current);
      confettiRafRef.current = 0;
      confettiParticlesRef.current = [];
    };
  }, []);

  const local = (e: React.PointerEvent<HTMLDivElement>) => {
    const stageEl = stageRef.current;
    if (!stageEl) return { x: 0, y: 0 };
    const r = stageEl.getBoundingClientRect();
    const k = r.width / width || 1;
    return { x: (e.clientX - r.left) / k, y: (e.clientY - r.top) / k };
  };

  const tearNow = () => {
    const s = sim.current;
    cancelAnimationFrame(s.raf);
    s.raf = 0;
    s.phase = 'idle';
    setInstant(true);
    finish();
  };

  const onStubDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    if (
      disabled ||
      used ||
      e.button !== 0 ||
      s.id !== null ||
      s.phase === 'drop'
    ) {
      return;
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const p = local(e);
    s.id = e.pointerId;
    s.start = p;
    s.point = p;
    s.pt = performance.now();
    s.pvx = 0;
    s.pvy = 0;
    if (s.theta < 0.01) {
      const far = (geo.vertical ? p.x : p.y) < geo.cross / 2;
      const end = geo.ends[far ? 1 : 0];
      s.sign = (far ? 1 : -1) * (geo.vertical ? -1 : 1);
      s.hinge = { x: end.x, y: end.y };
      s.hingeV = end.v;
      if (stubRef.current) {
        stubRef.current.style.transformOrigin = `${s.hinge.x}px ${s.hinge.y}px`;
      }
    }
    const cos = Math.cos(-s.theta * s.sign);
    const sin = Math.sin(-s.theta * s.sign);
    const ux = p.x - s.sx - s.hinge.x;
    const uy = p.y - s.sy - s.hinge.y;
    s.grab = {
      x: s.hinge.x + ux * cos - uy * sin,
      y: s.hinge.y + ux * sin + uy * cos,
    };
    s.a0 =
      Math.atan2(s.grab.y - s.hinge.y, s.grab.x - s.hinge.x) -
      (s.theta * s.sign) / 0.92;
    s.phase = 'held';
    s.thetaV = 0;
    tiltX.set(0);
    tiltY.set(0);
    setGrabbing(true);
    run();
  };

  const onStubMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    if (s.id !== e.pointerId) return;
    const p = local(e);
    const now = performance.now();
    const dt = Math.max(0.004, (now - s.pt) / 1000);
    s.pvx += ((p.x - s.point.x) / dt - s.pvx) * 0.35;
    s.pvy += ((p.y - s.point.y) / dt - s.pvy) * 0.35;
    s.pt = now;
    s.point = p;
    if (cfg.current.reduce && Math.hypot(p.x - s.start.x, p.y - s.start.y) > 28) {
      s.id = null;
      setGrabbing(false);
      tearNow();
    }
  };

  const onStubUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = sim.current;
    if (s.id !== e.pointerId) return;
    s.id = null;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    setGrabbing(false);
    if (s.phase === 'free') {
      const still = performance.now() - s.pt > 80;
      s.vx = still ? 0 : clamp(s.pvx, -1600, 1600);
      s.vy = still ? 0 : clamp(s.pvy, -1600, 1200);
      s.spin = clamp(s.vx * 0.004, -6, 6) + 1.2 * s.sign;
      s.age = 0;
      s.phase = 'drop';
    } else if (s.phase === 'held') {
      s.phase = 'return';
    }
    run();
  };

  const onStubKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || used || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    if (!e.repeat) tearNow();
  };

  useEffect(() => {
    if (!tilt || reduce || disabled) return undefined;
    const move = (e: PointerEvent) => {
      const el = rootRef.current;
      if (!el || e.pointerType === 'touch' || sim.current.id !== null) return;
      const r = el.getBoundingClientRect();
      const nx = clamp(
        (e.clientX - (r.left + r.width / 2)) / (r.width / 2 + tiltReach),
        -1,
        1
      );
      const ny = clamp(
        (e.clientY - (r.top + r.height / 2)) / (r.height / 2 + tiltReach),
        -1,
        1
      );
      tiltY.set(nx * tiltMax);
      tiltX.set(-ny * tiltMax);
    };
    window.addEventListener('pointermove', move);
    return () => window.removeEventListener('pointermove', move);
  }, [tilt, reduce, disabled, tiltMax, tiltReach, tiltX, tiltY]);

  const ticketStyle: React.CSSProperties & Record<string, string | number> = {
    '--tt-w': `${width}px`,
    '--tt-h': `${height}px`,
    '--tt-stub': `${stubSize}px`,
    '--tt-bg': background,
    '--tt-stub-bg': stubBackground || background,
    '--tt-ink': color,
    '--tt-accent': accentColor,
    '--tt-edge': borderColor || `color-mix(in srgb, ${accentColor} 32%, transparent)`,
    '--tt-edge-w': borderWidth,
    '--tt-parallax': `${parallax}px`,
    '--tt-body-w': `${vertical ? width : width - stubSize}px`,
    '--tt-body-h': `${vertical ? height - stubSize : height}px`,
    '--tt-inset': `${ART_INSET}px`,
    '--tt-span': ART_SPAN,
    '--tt-art-radius': `${imageRadius}px`,
    '--tt-fit': fit,
    height: `${height * fit}px`,
  };

  return (
    <div
      ref={rootRef}
      className={`tear-ticket${className ? ` ${className}` : ''}`}
      data-used={used ? '' : undefined}
      data-orientation={orientation}
      data-shift={used && recenter ? (vertical ? 'y' : 'x') : undefined}
      data-instant={instant ? '' : undefined}
      data-grabbing={grabbing ? '' : undefined}
      data-disabled={disabled ? '' : undefined}
      style={ticketStyle}
    >
      <div ref={stageRef} className="tear-ticket__stage">
        <motion.div className="tear-ticket__plane" style={{ transform: plane }}>
          <div ref={bodyRef} className="tear-ticket__piece">
            <div
              className="tear-ticket__paper"
              style={{ clipPath: `path('${geo.body}')` }}
            >
              {image ? (
                <div className="tear-ticket__art">
                  <motion.img
                    className="tear-ticket__image"
                    src={image}
                    alt={imageAlt}
                    referrerPolicy="no-referrer"
                    draggable={false}
                    style={reduce ? undefined : { transform: art }}
                  />
                  {scrim ? <div className="tear-ticket__scrim" /> : null}
                  {!reduce && tilt ? (
                    <motion.div
                      className="tear-ticket__sheen"
                      style={{ background: sheenBg }}
                    />
                  ) : null}
                </div>
              ) : null}
              <motion.div
                className="tear-ticket__content"
                style={reduce ? undefined : { transform: ink }}
              >
                {children}
              </motion.div>
            </div>
            {border ? (
              <svg
                className="tear-ticket__edge"
                viewBox={`0 0 ${width} ${height}`}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={accentColor} stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#ffffff" stopOpacity="0.24" />
                    <stop offset="100%" stopColor="#4E85BF" stopOpacity="0.45" />
                  </linearGradient>
                </defs>
                <path d={geo.bodyOutline} stroke={`url(#${gradId})`} />
                <path
                  d={geo.reticlePath}
                  className="tear-ticket__reticles"
                />
                <path
                  d={geo.seamGuide}
                  className="tear-ticket__perf-seam"
                />
              </svg>
            ) : null}
          </div>
          <svg className="tear-ticket__fibres" aria-hidden="true">
            {geo.bridges.map((_, i) => (
              <g key={i}>
                <path
                  ref={(el) => {
                    fibres.current[i * 2] = el;
                  }}
                />
                <path
                  ref={(el) => {
                    fibres.current[i * 2 + 1] = el;
                  }}
                />
              </g>
            ))}
          </svg>
          <div
            ref={stubRef}
            className="tear-ticket__piece tear-ticket__piece--stub"
            role="button"
            tabIndex={disabled || used ? -1 : 0}
            aria-label={ariaLabel}
            aria-hidden={used || undefined}
            aria-disabled={disabled || undefined}
            onPointerDown={onStubDown}
            onPointerMove={onStubMove}
            onPointerUp={onStubUp}
            onPointerCancel={onStubUp}
            onLostPointerCapture={onStubUp}
            onKeyDown={onStubKey}
            onDragStart={(e) => e.preventDefault()}
          >
            <div
              className="tear-ticket__paper tear-ticket__paper--stub"
              style={{ clipPath: `path('${geo.stub}')` }}
            >
              {!reduce && tilt ? (
                <motion.div
                  className="tear-ticket__sheen"
                  style={{ background: sheenBg }}
                />
              ) : null}
              <div className="tear-ticket__stub">{stub}</div>
            </div>
            {border ? (
              <svg
                className="tear-ticket__edge"
                viewBox={`0 0 ${width} ${height}`}
                aria-hidden="true"
              >
                <path d={geo.stubOutline} stroke={`url(#${gradId})`} />
              </svg>
            ) : null}
          </div>
        </motion.div>
      </div>
      <span className="tear-ticket__sr" role="status">
        {used ? 'Ticket torn — opening direct collaboration inquiry' : ''}
      </span>
      {confetti && !reduce && typeof document !== 'undefined'
        ? createPortal(
            <canvas
              ref={confettiCanvasRef}
              aria-hidden="true"
              className="fixed inset-0 w-full h-full pointer-events-none z-[130]"
            />,
            document.body
          )
        : null}
    </div>
  );
}
