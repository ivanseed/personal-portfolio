import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { profile } from './content';
import { LinkRow } from './LinkRow';
import { GridCanvas } from './grid/GridCanvas';
import { parsePins, togglePin, type Cell } from './grid/grid';
import { useMediaQuery, useViewportWidth } from './hooks';

const PINS_KEY = 'grid-pins';

const FULL_WIDTH_BELOW = 600;

function layoutFor(viewport: number) {
  // Phones: the card spans the full width, so pick a cell size that divides
  // the viewport exactly and keeps the grid lined up with both screen edges.
  if (viewport < FULL_WIDTH_BELOW) {
    const cols = Math.max(7, Math.round(viewport / 44));
    return { size: viewport / cols, cols };
  }
  const size = viewport >= 900 ? 56 : 48;
  const maxCols = viewport >= 900 ? 10 : 9;
  const cols = Math.max(6, Math.min(maxCols, Math.floor(viewport / size) - 2));
  return { size, cols };
}

function loadPins(): Set<string> {
  try {
    return parsePins(localStorage.getItem(PINS_KEY));
  } catch {
    return new Set();
  }
}

export default function App() {
  const viewport = useViewportWidth();
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const { size, cols } = layoutFor(viewport);

  const mainRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(6);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [pins, setPins] = useState(loadPins);

  // Snap the card height to whole cells, based on its content. The intro and
  // link list are measured separately because the inner wrapper stretches to
  // fill the card (links sit on the bottom grid rows).
  useLayoutEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const parts = [...inner.children] as HTMLElement[];
    const measure = () => {
      const gap = parseFloat(getComputedStyle(inner).rowGap) || 0;
      const content = parts.reduce((sum, el) => sum + el.offsetHeight, 0) + gap * (parts.length - 1);
      setRows(Math.ceil(content / size) + 2);
    };
    measure();
    const observer = new ResizeObserver(measure);
    parts.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [size, cols]);

  // Track where the card sits so the grid lines up with its edges.
  useLayoutEffect(() => {
    const main = mainRef.current;
    const card = cardRef.current;
    if (!main || !card) return;
    // Use bounding rects rather than offsetLeft/Top, which round to whole pixels
    // and would drift from fractional cell sizes on phones.
    const measure = () => {
      const m = main.getBoundingClientRect();
      const c = card.getBoundingClientRect();
      const x = c.left - m.left;
      const y = c.top - m.top;
      setOrigin((prev) => (prev.x === x && prev.y === y ? prev : { x, y }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(main);
    observer.observe(card);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [size, cols, rows]);

  useEffect(() => {
    try {
      localStorage.setItem(PINS_KEY, JSON.stringify([...pins]));
    } catch {
      // Storage may be unavailable (private mode); pins then last for the visit only.
    }
  }, [pins]);

  const onToggle = useCallback((cell: Cell) => setPins((p) => togglePin(p, cell)), []);

  return (
    <main ref={mainRef} className="page" style={{ '--cell': `${size}px` } as React.CSSProperties}>
      <GridCanvas
        size={size}
        origin={origin}
        cols={cols}
        rows={rows}
        pins={pins}
        onToggle={onToggle}
        reducedMotion={reducedMotion}
        compact={viewport < FULL_WIDTH_BELOW}
      />

      <article ref={cardRef} className="card" style={{ width: cols * size, height: rows * size }}>
        <div ref={innerRef} className="card__inner">
          <header className="intro">
            <h1 className="intro__name">{profile.name}</h1>
            <p className="intro__role">
              {profile.role} <span className="intro__at">at</span> {profile.company}
            </p>
            <p className="intro__bio">{profile.bio}</p>
          </header>

          <ul className="links">
            {profile.links.map((link) => (
              <li key={link.label}>
                <LinkRow link={link} />
              </li>
            ))}
          </ul>
        </div>
      </article>
    </main>
  );
}
