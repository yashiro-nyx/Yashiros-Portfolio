import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Matter from 'matter-js';

const { Bodies, Body, Composite, Engine } = Matter;

export type FolderFloatItemInput =
  | string
  | {
      label: string;
      value: string;
      tooltip?: string;
      tooltipTitle?: string;
    };

export interface FolderFloatProps {
  items?: FolderFloatItemInput[];
  label?: string;
  sublabel?: string;
  trigger?: 'hover' | 'click';
  defaultOpen?: boolean;
  closeOnSelect?: boolean;
  physics?: boolean;
  drift?: number;
  activeIndex?: number;
  onSelect?: (value: string, index: number) => void;
  onOpenChange?: (open: boolean) => void;
  folderColor?: string;
  frontColor?: string;
  paperColor?: string;
  itemColor?: string;
  itemTextColor?: string;
  labelColor?: string;
  width?: number;
  height?: number;
  radius?: number;
  spread?: number;
  lift?: number;
  tilt?: number;
  flapAngle?: number;
  restAngle?: number;
  openDuration?: number;
  stagger?: number;
  bounce?: number;
  burst?: number;
  className?: string;
}

const DEFAULT_ITEMS: FolderFloatItemInput[] = [
  'Clean, user-first UI/UX',
  'Detail-oriented delivery',
  'Scalable component systems',
  'Production-grade builds',
];

const PAD = 28;
const CHAR = 6.8;
const GAP = 12;
const ROW = 52;
const DRAG_MIN = 4;
const ZONE_PAD = 8;
const FIXED_STEP_MS = 1000 / 120;
const POCKET_Y = 26;

const jitter = (i: number) => {
  const x = Math.sin(i * 12.9898 + 4.1414) * 43758.5453;
  return x - Math.floor(x);
};

interface PillSize {
  w: number;
  h: number;
}

interface PillPosition {
  x: number;
  y: number;
  r: number;
}

interface LaunchProfile {
  startX: number;
  startY: number;
  vx: number;
  vy: number;
  releaseAt: number;
  launched: boolean;
  solidified: boolean;
  clearedBottom: boolean;
}

const computeLayout = (
  list: Array<{ label: string; value: string }>,
  spread: number,
  lift: number,
  tilt: number,
  sizes: PillSize[]
): PillPosition[] => {
  const rows: Array<{ items: Array<{ i: number; pw: number }>; width: number }> =
    [];
  let row: Array<{ i: number; pw: number }> = [];
  let width = 0;

  list.forEach((item, i) => {
    const pw = sizes[i]?.w ?? PAD + item.label.length * CHAR;
    if (row.length && width + GAP + pw > spread * 2) {
      rows.push({ items: row, width });
      row = [];
      width = 0;
    }
    row.push({ i, pw });
    width += (row.length > 1 ? GAP : 0) + pw;
  });

  if (row.length) rows.push({ items: row, width });

  const pos: PillPosition[] = [];
  rows.forEach((r, ri) => {
    let x = -r.width / 2;
    const shift = (ri % 2 ? 1 : -1) * Math.min(16, spread * 0.1);
    r.items.forEach(({ i, pw }) => {
      const j = jitter(i);
      pos[i] = {
        x: x + pw / 2 + shift + (j - 0.5) * 6,
        y: -lift - ri * ROW - j * 6,
        r: tilt * (j * 2 - 1),
      };
      x += pw + GAP;
    });
  });

  return pos;
};

interface WorldState {
  engine: Matter.Engine | null;
  bodies: Matter.Body[];
  launches: LaunchProfile[];
  phases: number[];
  sizes: PillSize[];
  raf: number;
  last: number;
  accum: number;
  t0: number;
  drag: {
    i: number;
    id: number;
    dx: number;
    dy: number;
    sx: number;
    sy: number;
    moved: boolean;
  } | null;
  zone: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  } | null;
  live: boolean;
}

export const FolderFloat: React.FC<FolderFloatProps> = ({
  items = DEFAULT_ITEMS,
  label = 'Trust & Feedback',
  sublabel = '',
  trigger = 'hover',
  defaultOpen = false,
  closeOnSelect = true,
  physics = true,
  drift = 0.5,
  activeIndex = -1,
  onSelect,
  onOpenChange,
  folderColor = '#1b1e25',
  frontColor = '#252a34',
  paperColor = '#89aacc',
  itemColor = '#f5f5f5',
  itemTextColor = '#0d0d11',
  labelColor = '#f5f5f5',
  width = 216,
  height = 152,
  radius = 16,
  spread = 175,
  lift = 28,
  tilt = 7,
  flapAngle = 34,
  restAngle = 16,
  openDuration = 520,
  stagger = 45,
  bounce = 0.3,
  burst = 0,
  className = '',
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const [popped, setPopped] = useState(-1);
  const [live, setLive] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [sizes, setSizes] = useState<PillSize[]>([]);
  const anchorRef = useRef<HTMLDivElement | null>(null);
  const pillRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const world = useRef<WorldState>({
    engine: null,
    bodies: [],
    launches: [],
    phases: [],
    sizes: [],
    raf: 0,
    last: 0,
    accum: 0,
    t0: 0,
    drag: null,
    zone: null,
    live: false,
  });

  const latest = useRef<{
    onSelect?: (value: string, index: number) => void;
    onOpenChange?: (open: boolean) => void;
    drift: number;
    burst: number;
    stagger: number;
    reduce: boolean;
  }>({
    onSelect,
    onOpenChange,
    drift,
    burst,
    stagger,
    reduce: false,
  });
  latest.current = {
    onSelect,
    onOpenChange,
    drift,
    burst,
    stagger,
    reduce: reduceMotion,
  };

  const popTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const list = items.map((item) =>
    typeof item === 'string'
      ? { label: item, value: item, tooltip: undefined, tooltipTitle: undefined }
      : item
  );
  const n = list.length;
  const sub = sublabel || `${n} ${n === 1 ? 'note' : 'notes'}`;
  const pos = computeLayout(list, spread, lift, tilt, sizes);

  const labelsKey = list.map((item) => item.label).join('|');
  useLayoutEffect(() => {
    const measure = () => {
      const next = pillRefs.current
        .slice(0, n)
        .map((el) =>
          el ? { w: el.offsetWidth, h: el.offsetHeight } : null
        );
      if (next.some((s): s is null => s === null)) return;
      const valid = next as PillSize[];
      setSizes((prev) =>
        prev.length === valid.length &&
        prev.every((s, i) => s.w === valid[i].w && s.h === valid[i].h)
          ? prev
          : valid
      );
    };
    measure();
    if (typeof document !== 'undefined') {
      document.fonts?.ready.then(measure);
    }
  }, [n, labelsKey]);

  const stopPhysics = useCallback(() => {
    const w = world.current;
    cancelAnimationFrame(w.raf);
    w.raf = 0;
    if (w.engine) {
      w.bodies.forEach((b, i) => {
        const el = pillRefs.current[i];
        const sz = w.sizes[i];
        if (!el || !sz) return;
        el.style.setProperty('--x', `${b.position.x.toFixed(1)}px`);
        el.style.setProperty(
          '--y',
          `${(b.position.y - sz.h / 2).toFixed(1)}px`
        );
      });
      Composite.clear(w.engine.world, false, true);
      Engine.clear(w.engine);
      w.engine = null;
    }
    w.bodies = [];
    w.launches = [];
    w.phases = [];
    w.drag = null;
    w.live = false;
    setLive(false);
  }, []);

  const posKey = pos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join('|');

  const startPhysics = useCallback(() => {
    const w = world.current;
    if (w.engine || n === 0) return;
    const els = pillRefs.current.slice(0, n);
    if (els.some((el) => !el)) return;

    const engine = Engine.create({ gravity: { x: 0, y: 0 } });
    engine.enableSleeping = false;
    w.engine = engine;
    w.sizes = els.map((el) => ({
      w: el ? el.offsetWidth : 120,
      h: el ? el.offsetHeight : 34,
    }));

    const ys = pos.map((p) => p.y);
    const bPower = Math.max(0, latest.current.burst);
    const staggerSec = Math.max(0, latest.current.stagger) / 1000;
    const maxH = Math.max(...w.sizes.map((s) => s.h));

    const zone = {
      left: -spread - ZONE_PAD,
      right: spread + ZONE_PAD,
      top: Math.min(...ys) - ZONE_PAD - (bPower > 0 ? 32 : 0),
      bottom: -lift + maxH,
    };
    w.zone = zone;
    w.phases = els.map((_, i) => jitter(i) * Math.PI * 2);

    // At 120Hz substeps with frictionAir=0.028, total displacement per unit initial velocity
    // is (STEP / 16.6667) / frictionAir ≈ 0.5 / 0.028 ≈ 17.85px.
    const airDrag = bPower > 0 ? 0.028 : 0.042;
    const travelGain = FIXED_STEP_MS / 16.6667 / airDrag;

    w.launches = els.map((_, i) => {
      const sz = w.sizes[i];
      const startX = (i - (n - 1) / 2) * 14;
      const startY = POCKET_Y + sz.h / 2;
      const targetX = pos[i].x;
      const targetY = pos[i].y + sz.h / 2;
      const dx = targetX - startX;
      const dy = targetY - startY;
      const overshoot = 1 + Math.min(0.24, bPower * 0.12);
      const spreadKick = (jitter(i * 5 + 2) - 0.5) * bPower * 0.9;
      const liftKick = bPower > 0 ? (0.45 + jitter(i * 7 + 3) * 0.45) * bPower : 0;

      return {
        startX,
        startY,
        vx: (dx / travelGain) * overshoot + spreadKick,
        vy: (dy / travelGain) * overshoot - liftKick,
        releaseAt: i * staggerSec,
        launched: false,
        solidified: false,
        clearedBottom: false,
      };
    });

    w.bodies = els.map((_, i) => {
      const { w: bw, h: bh } = w.sizes[i];
      const lp = w.launches[i];

      const el = els[i];
      if (el) {
        el.style.setProperty('--x', `${lp.startX.toFixed(1)}px`);
        el.style.setProperty('--y', `${(lp.startY - bh / 2).toFixed(1)}px`);
      }

      return Bodies.rectangle(lp.startX, lp.startY, bw, bh, {
        chamfer: { radius: Math.min(bh / 2 - 1, 16) },
        restitution: Math.min(0.84, 0.58 + bPower * 0.1),
        friction: 0,
        frictionAir: airDrag,
        inertia: Infinity,
        isSensor: true,
      });
    });

    const T = 80;
    const walls = [
      Bodies.rectangle(
        (zone.left + zone.right) / 2,
        zone.top - T / 2,
        zone.right - zone.left + 2 * T,
        T,
        { isStatic: true }
      ),
      Bodies.rectangle(
        (zone.left + zone.right) / 2,
        zone.bottom + T / 2,
        zone.right - zone.left + 2 * T,
        T,
        { isStatic: true }
      ),
      Bodies.rectangle(
        zone.left - T / 2,
        (zone.top + zone.bottom) / 2,
        T,
        zone.bottom - zone.top + 2 * T,
        { isStatic: true }
      ),
      Bodies.rectangle(
        zone.right + T / 2,
        (zone.top + zone.bottom) / 2,
        T,
        zone.bottom - zone.top + 2 * T,
        { isStatic: true }
      ),
    ];

    Composite.add(engine.world, [...w.bodies, ...walls]);
    w.live = true;
    w.last = 0;
    w.accum = 0;
    w.t0 = performance.now();
    setLive(true);

    const tick = (now: number) => {
      const s = world.current;
      if (!s.engine || !s.zone) return;

      const frameMs = s.last ? Math.min(34, now - s.last) : FIXED_STEP_MS;
      s.last = now;
      s.accum += frameMs;
      const t = (now - s.t0) / 1000;
      const z = s.zone;

      // Launch staggered pills out of the pocket cleanly
      s.bodies.forEach((b, i) => {
        const lp = s.launches[i];
        if (!lp) return;

        if (!lp.launched) {
          if (t >= lp.releaseAt) {
            lp.launched = true;
            Body.setPosition(b, { x: lp.startX, y: lp.startY });
            Body.setVelocity(b, { x: lp.vx, y: lp.vy });
          } else {
            Body.setPosition(b, { x: lp.startX, y: lp.startY });
            Body.setVelocity(b, { x: 0, y: 0 });
          }
          return;
        }

        // Keep pills non-colliding until clear of the bottom wall & folder mouth
        const sz = s.sizes[i];
        if (!lp.clearedBottom && sz && b.position.y <= z.bottom - sz.h / 2 - 2) {
          lp.clearedBottom = true;
        }
        if (!lp.solidified && lp.clearedBottom && t >= lp.releaseAt + 0.14) {
          lp.solidified = true;
          b.isSensor = false;
        }
      });

      // Fixed 120Hz substeps eliminate frame-to-frame micro-stutter on any display refresh rate
      let steps = 0;
      while (s.accum >= FIXED_STEP_MS && steps < 5) {
        const k = latest.current.drift * 0.000048 * Math.min(1, t / 1.8);
        s.bodies.forEach((b, i) => {
          const lp = s.launches[i];
          if (!lp?.launched || (s.drag && s.drag.i === i)) return;
          const ph = s.phases[i] ?? 0;
          Body.applyForce(b, b.position, {
            x: Math.sin(t * 0.9 + ph) * k * b.mass,
            y: Math.cos(t * 1.3 + ph * 1.7) * k * b.mass,
          });
        });

        Engine.update(s.engine, FIXED_STEP_MS);

        // Soft top/side safety guard + hold unlaunched pills pinned in pocket
        s.bodies.forEach((b, i) => {
          const lp = s.launches[i];
          if (lp && !lp.launched) {
            Body.setPosition(b, { x: lp.startX, y: lp.startY });
            Body.setVelocity(b, { x: 0, y: 0 });
          }
        });

        s.accum -= FIXED_STEP_MS;
        steps += 1;
      }

      s.bodies.forEach((b, i) => {
        const el = pillRefs.current[i];
        const sz = s.sizes[i];
        if (!el || !sz) return;
        el.style.setProperty('--x', `${b.position.x.toFixed(1)}px`);
        el.style.setProperty(
          '--y',
          `${(b.position.y - sz.h / 2).toFixed(1)}px`
        );
      });

      s.raf = requestAnimationFrame(tick);
    };
    w.raf = requestAnimationFrame(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, spread, lift, posKey]);

  const set = useCallback(
    (next: boolean) => {
      if (!next) {
        setHoveredIndex(null);
        setDraggingIndex(null);
        stopPhysics();
      } else if (!physics || latest.current.reduce) {
        pos.forEach((p, i) => {
          const el = pillRefs.current[i];
          if (!el) return;
          el.style.setProperty('--x', `${p.x.toFixed(1)}px`);
          el.style.setProperty('--y', `${p.y.toFixed(1)}px`);
        });
      }
      setOpen((prev) => {
        if (prev === next) return prev;
        latest.current.onOpenChange?.(next);
        return next;
      });
    },
    [stopPhysics, pos, physics]
  );

  useLayoutEffect(() => {
    if (!open || !physics || reduceMotion) {
      stopPhysics();
      return undefined;
    }
    startPhysics();
    return undefined;
  }, [open, physics, reduceMotion, startPhysics, stopPhysics]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setReduceMotion(mq.matches);
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(popTimer.current);
      stopPhysics();
    },
    [stopPhysics]
  );

  const pick = (item: { label: string; value: string }, i: number) => {
    latest.current.onSelect?.(item.value, i);
    clearTimeout(popTimer.current);
    setPopped(i);
    popTimer.current = setTimeout(() => setPopped(-1), 320);
    if (closeOnSelect) set(false);
  };

  const pointerAt = (e: React.PointerEvent<HTMLElement>) => {
    const r = anchorRef.current?.getBoundingClientRect();
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : { x: 0, y: 0 };
  };

  const down = (e: React.PointerEvent<HTMLButtonElement>, i: number) => {
    const w = world.current;
    if (!w.live || e.button !== 0) return;
    const b = w.bodies[i];
    if (!b) return;
    const p = pointerAt(e);
    w.drag = {
      i,
      id: e.pointerId,
      dx: b.position.x - p.x,
      dy: b.position.y - p.y,
      sx: e.clientX,
      sy: e.clientY,
      moved: false,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const move = (e: React.PointerEvent<HTMLButtonElement>, i: number) => {
    const w = world.current;
    const d = w.drag;
    if (!d || d.i !== i || d.id !== e.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.sx, e.clientY - d.sy) >= DRAG_MIN) {
      d.moved = true;
      setDraggingIndex(i);
      e.currentTarget.setAttribute('data-drag', '');
    }
    if (!d.moved) return;
    const b = w.bodies[i];
    const sz = w.sizes[i];
    const z = w.zone;
    if (!b || !sz || !z) return;
    const p = pointerAt(e);
    const x = Math.min(
      z.right - sz.w / 2,
      Math.max(z.left + sz.w / 2, p.x + d.dx)
    );
    const y = Math.min(
      z.bottom - sz.h / 2,
      Math.max(z.top + sz.h / 2, p.y + d.dy)
    );
    Body.setVelocity(b, {
      x: (x - b.position.x) * 0.45,
      y: (y - b.position.y) * 0.45,
    });
    Body.setPosition(b, { x, y });
  };

  const up = (
    e: React.PointerEvent<HTMLButtonElement>,
    i: number,
    item: { label: string; value: string }
  ) => {
    const w = world.current;
    const d = w.drag;
    if (!d || d.i !== i || d.id !== e.pointerId) return;
    w.drag = null;
    setDraggingIndex(null);
    e.currentTarget.removeAttribute('data-drag');
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    if (!d.moved && e.type === 'pointerup') pick(item, i);
  };

  const hover = trigger === 'hover';

  return (
    <div
      className={`folder-float${className ? ` ${className}` : ''}`}
      data-open={open ? '' : undefined}
      data-live={live ? '' : undefined}
      data-physics={physics ? '' : undefined}
      data-hovering={hoveredIndex !== null ? '' : undefined}
      data-trigger={trigger}
      onPointerEnter={hover ? () => set(true) : undefined}
      onPointerLeave={
        hover
          ? () => {
              if (!world.current.drag) set(false);
            }
          : undefined
      }
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation();
          set(false);
        }
      }}
      style={
        {
          '--ff-w': `${width}px`,
          '--ff-h': `${height}px`,
          '--ff-r': `${radius}px`,
          '--ff-back': folderColor,
          '--ff-front': frontColor,
          '--ff-paper': paperColor,
          '--ff-item': itemColor,
          '--ff-item-ink': itemTextColor,
          '--ff-label': labelColor,
          '--ff-spread': `${spread}px`,
          '--ff-lift': `${lift}px`,
          '--ff-angle': `${flapAngle}deg`,
          '--ff-rest': `${restAngle}deg`,
          '--ff-open': `${openDuration}ms`,
          '--ff-close': `${Math.round(openDuration * 0.6)}ms`,
          '--ff-stagger': `${stagger}ms`,
          '--ff-n': n,
          '--ff-spring': `cubic-bezier(0.34, ${(1 + bounce * 1.9).toFixed(2)}, 0.64, 1)`,
        } as React.CSSProperties
      }
    >
      <div ref={anchorRef} className="folder-float__items">
        {list.map((item, i) => {
          const p = pos[i] ?? { x: 0, y: -lift, r: 0 };
          const hoverTilt = i % 2 === 0 ? -2.8 : 2.8;
          const showTooltip =
            open &&
            hoveredIndex === i &&
            draggingIndex !== i &&
            Boolean(item.tooltip || item.tooltipTitle);
          return (
            <button
              key={`${item.value}-${i}`}
              ref={(el) => {
                pillRefs.current[i] = el;
              }}
              type="button"
              className="folder-float__item"
              tabIndex={open ? 0 : -1}
              aria-hidden={!open}
              aria-label={
                item.tooltip
                  ? `${item.label} — ${item.tooltip}`
                  : item.label
              }
              style={
                {
                  '--i': i,
                  '--x': `${p.x.toFixed(1)}px`,
                  '--y': `${p.y.toFixed(1)}px`,
                  '--r': `${p.r.toFixed(2)}deg`,
                } as React.CSSProperties
              }
              onPointerEnter={() => {
                if (open) setHoveredIndex(i);
              }}
              onPointerLeave={() => {
                setHoveredIndex((prev) => (prev === i ? null : prev));
              }}
              onFocus={() => {
                if (open) setHoveredIndex(i);
              }}
              onBlur={() => {
                setHoveredIndex((prev) => (prev === i ? null : prev));
              }}
              onPointerDown={(e) => down(e, i)}
              onPointerMove={(e) => move(e, i)}
              onPointerUp={(e) => up(e, i, item)}
              onPointerCancel={(e) => up(e, i, item)}
              onClick={(e) => {
                if (!world.current.live || e.detail === 0) pick(item, i);
              }}
            >
              <AnimatePresence>
                {showTooltip && (
                  <span role="tooltip" className="folder-float__tooltip-anchor">
                    <motion.span
                      className="folder-float__tooltip"
                      initial={
                        reduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: 6, scale: 0.94 }
                      }
                      animate={
                        reduceMotion
                          ? { opacity: 1 }
                          : { opacity: 1, y: 0, scale: 1 }
                      }
                      exit={
                        reduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: 4, scale: 0.96 }
                      }
                      transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                    >
                      {item.tooltipTitle && (
                        <span className="folder-float__tooltip-title">
                          {item.tooltipTitle}
                        </span>
                      )}
                      {item.tooltip && (
                        <span className="folder-float__tooltip-role">
                          {item.tooltip}
                        </span>
                      )}
                      <span
                        className="folder-float__tooltip-caret"
                        aria-hidden="true"
                      />
                    </motion.span>
                  </span>
                )}
              </AnimatePresence>

              <motion.span
                className="folder-float__pill"
                data-selected={activeIndex === i ? '' : undefined}
                data-pop={popped === i ? '' : undefined}
                whileHover={
                  open && !reduceMotion
                    ? {
                        scale: 1.07,
                        rotate: hoverTilt,
                        y: -2,
                      }
                    : undefined
                }
                whileTap={
                  open && !reduceMotion
                    ? {
                        scale: 0.96,
                        rotate: 0,
                      }
                    : undefined
                }
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 22,
                  mass: 0.55,
                }}
              >
                <span className="folder-float__drift">{item.label}</span>
              </motion.span>
            </button>
          );
        })}
      </div>

      <div className="folder-float__folder">
        <span className="folder-float__back" aria-hidden="true" />
        <span className="folder-float__paper" aria-hidden="true" />
        <span className="folder-float__front" aria-hidden="true">
          <span className="folder-float__label">{label}</span>
          <span className="folder-float__sub">{sub}</span>
        </span>
        <button
          type="button"
          className="folder-float__trigger"
          aria-expanded={open}
          aria-label={`${label}, ${sub}`}
          onClick={() => set(!open)}
        />
      </div>
    </div>
  );
};

export default FolderFloat;
