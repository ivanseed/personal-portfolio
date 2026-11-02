import { useCallback, useEffect, useRef } from 'react';
import {
  blockCells,
  blockContains,
  cellAt,
  cellKey,
  cellsBetween,
  connectedGroups,
  decayTrail,
  decorBlocks,
  parseKey,
  type Cell,
} from './grid';

const TRAIL_FADE_MS = 900;
const INTRO_STAGGER_MS = 110;
const INTRO_FADE_MS = 500;

interface Props {
  /** Cell size in CSS pixels. */
  size: number;
  /** Pixel position (within the container) of the card's top-left corner; the grid aligns to it. */
  origin: { x: number; y: number };
  /** Card size in cells. */
  cols: number;
  rows: number;
  pins: ReadonlySet<string>;
  onToggle: (cell: Cell) => void;
  reducedMotion: boolean;
}

interface Palette {
  line: string;
  gradA: string;
  gradB: string;
  glowA: string;
  glowB: string;
}

function readPalette(el: HTMLElement): Palette {
  const css = getComputedStyle(el);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    line: v('--grid-line'),
    gradA: v('--grad-a'),
    gradB: v('--grad-b'),
    glowA: v('--glow-a'),
    glowB: v('--glow-b'),
  };
}

/**
 * Full-bleed canvas grid. Moving the pointer leaves a fading trail of glowing cell borders;
 * clicking an empty cell pins it. Only animates while something is changing.
 */
export function GridCanvas({ size, origin, cols, rows, pins, onToggle, reducedMotion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mutable render state lives in refs so pointer events never trigger React renders.
  const trail = useRef(new Map<string, number>());
  const lastCell = useRef<Cell | null>(null);
  const frame = useRef(0);
  const lastTime = useRef(0);
  const introStart = useRef<number | null>(null);
  const draw = useRef<(now: number) => void>(() => {});

  /** Schedule one frame unless one is already pending. */
  const request = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame((t) => draw.current(t));
  }, []);

  const decor = decorBlocks(cols, rows);
  const isDecor = (c: Cell) => decor.some((b) => blockContains(b, c));

  // Latest props for the draw loop, updated after each render.
  const props = useRef({ size, origin, decor, pins, reducedMotion });
  useEffect(() => {
    props.current = { size, origin, decor, pins, reducedMotion };
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let palette = readPalette(container);
    let width = 0;
    let height = 0;

    /**
     * Paint filled cells. Touching cells share one gradient stretched across
     * their bounding box, so a cluster reads as a single shape.
     */
    const paintFilled = (alphas: Map<string, number>, s: number, ox: number, oy: number) => {
      for (const { cells, bounds } of connectedGroups(alphas.keys())) {
        const x = ox + bounds.x * s;
        const y = oy + bounds.y * s;
        const g = ctx.createLinearGradient(x, y + bounds.h * s, x + bounds.w * s, y);
        g.addColorStop(0, palette.gradA);
        g.addColorStop(1, palette.gradB);
        ctx.fillStyle = g;
        for (const c of cells) {
          ctx.globalAlpha = alphas.get(cellKey(c))!;
          ctx.fillRect(ox + c.x * s, oy + c.y * s, s, s);
        }
      }
      ctx.globalAlpha = 1;
    };

    /** Hover trail: cell borders light up with a soft glow, then fade. */
    const paintGlow = (s: number, ox: number, oy: number) => {
      if (trail.current.size === 0) return;
      const g = ctx.createLinearGradient(0, height, width, 0);
      g.addColorStop(0, palette.glowA);
      g.addColorStop(1, palette.glowB);
      ctx.save();
      ctx.strokeStyle = g;
      // Layered strokes, widest and faintest first, give a soft glow with a crisp line on top.
      // (Canvas shadowBlur smears into a haze when many cells overlap.)
      for (const [width, opacity] of [
        [9, 0.05],
        [6, 0.08],
        [3.5, 0.14],
        [1.25, 0.9],
      ]) {
        ctx.lineWidth = width;
        for (const [key, value] of trail.current) {
          const c = parseKey(key);
          // Ease out so cells linger, then drop away.
          ctx.globalAlpha = value * value * opacity;
          ctx.strokeRect(ox + c.x * s + 0.5, oy + c.y * s + 0.5, s, s);
        }
      }
      ctx.restore();
    };

    draw.current = (now: number) => {
      frame.current = 0;
      const { size: s, origin: o, decor: blocks, pins: pinned, reducedMotion: still } = props.current;
      // rAF timestamps can be slightly earlier than a performance.now() taken by a
      // synchronous redraw, so clamp to avoid negative time "un-fading" the trail.
      const elapsed = lastTime.current ? Math.max(0, Math.min(now - lastTime.current, 100)) : 16;
      lastTime.current = now;
      if (introStart.current === null) introStart.current = now;

      decayTrail(trail.current, elapsed, TRAIL_FADE_MS);
      ctx.clearRect(0, 0, width, height);

      // Grid lines aligned to the card origin.
      const ox = o.x - Math.ceil(o.x / s) * s;
      const oy = o.y - Math.ceil(o.y / s) * s;
      ctx.globalAlpha = 1;
      ctx.strokeStyle = palette.line;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = ox; x <= width; x += s) {
        ctx.moveTo(Math.round(x) + 0.5, 0);
        ctx.lineTo(Math.round(x) + 0.5, height);
      }
      for (let y = oy; y <= height; y += s) {
        ctx.moveTo(0, Math.round(y) + 0.5);
        ctx.lineTo(width, Math.round(y) + 0.5);
      }
      ctx.stroke();

      // Collect every filled cell with its opacity; where sources overlap the strongest wins.
      const alphas = new Map<string, number>();
      const fill = (key: string, alpha: number) => {
        if (alpha > 0.02) alphas.set(key, Math.max(alpha, alphas.get(key) ?? 0));
      };

      // Decorative blocks fade in one after another on first load.
      let introRunning = false;
      blocks.forEach((b, i) => {
        const t = still ? 1 : (now - introStart.current! - i * INTRO_STAGGER_MS) / INTRO_FADE_MS;
        const alpha = Math.max(0, Math.min(1, t));
        if (alpha < 1) introRunning = true;
        for (const c of blockCells(b)) fill(cellKey(c), alpha);
      });
      for (const key of pinned) fill(key, 1);

      paintFilled(alphas, s, o.x, o.y);
      paintGlow(s, o.x, o.y);

      if (trail.current.size > 0 || introRunning) {
        frame.current = requestAnimationFrame(draw.current);
      } else {
        lastTime.current = 0;
      }
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = container.clientWidth;
      height = container.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Resizing clears the canvas, so repaint now rather than leaving a blank frame.
      cancelAnimationFrame(frame.current);
      draw.current(performance.now());
    };

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    const scheme = window.matchMedia('(prefers-color-scheme: dark)');
    const onScheme = () => {
      palette = readPalette(container);
      request();
    };
    scheme.addEventListener('change', onScheme);

    const onMove = (e: PointerEvent) => {
      const { size: s, origin: o, reducedMotion: still } = props.current;
      if (still) return;
      const rect = container.getBoundingClientRect();
      const cell = cellAt(e.clientX - rect.left, e.clientY - rect.top, o.x, o.y, s);
      const from = lastCell.current ?? cell;
      for (const c of cellsBetween(from, cell)) trail.current.set(cellKey(c), 1);
      lastCell.current = cell;
      request();
    };
    const onLeave = () => {
      lastCell.current = null;
    };
    container.addEventListener('pointermove', onMove);
    container.addEventListener('pointerleave', onLeave);

    resize();

    return () => {
      observer.disconnect();
      scheme.removeEventListener('change', onScheme);
      container.removeEventListener('pointermove', onMove);
      container.removeEventListener('pointerleave', onLeave);
      cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [request]);

  // Repaint straight away when layout or pins change, so the grid never lags behind the card.
  useEffect(() => {
    cancelAnimationFrame(frame.current);
    draw.current(performance.now());
  }, [size, origin.x, origin.y, cols, rows, pins, reducedMotion]);

  const onClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cell = cellAt(e.clientX - rect.left, e.clientY - rect.top, origin.x, origin.y, size);
    if (!isDecor(cell)) onToggle(cell);
  };

  return <canvas ref={canvasRef} className="grid-canvas" aria-hidden="true" onClick={onClick} />;
}
