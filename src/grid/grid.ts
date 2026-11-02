/**
 * Pure grid helpers. Cell coordinates are integers relative to the grid
 * origin, which is aligned to the top-left corner of the main card.
 */

export interface Cell {
  x: number;
  y: number;
}

export interface Block extends Cell {
  w: number;
  h: number;
}

export const cellKey = (c: Cell): string => `${c.x},${c.y}`;

export const parseKey = (key: string): Cell => {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
};

/** Cell containing the pixel (px, py), given the grid origin and cell size. */
export function cellAt(px: number, py: number, originX: number, originY: number, size: number): Cell {
  return {
    x: Math.floor((px - originX) / size),
    y: Math.floor((py - originY) / size),
  };
}

/** Every cell on the straight line from a to b (inclusive), so fast pointer moves leave no gaps. */
export function cellsBetween(a: Cell, b: Cell): Cell[] {
  const cells: Cell[] = [];
  let { x, y } = a;
  const dx = Math.abs(b.x - a.x);
  const dy = -Math.abs(b.y - a.y);
  const sx = a.x < b.x ? 1 : -1;
  const sy = a.y < b.y ? 1 : -1;
  let err = dx + dy;
  for (;;) {
    cells.push({ x, y });
    if (x === b.x && y === b.y) return cells;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

/** Fade every trail cell by elapsed time; removes cells that reach zero. Mutates and returns the map. */
export function decayTrail(trail: Map<string, number>, elapsedMs: number, fadeMs: number): Map<string, number> {
  const step = elapsedMs / fadeMs;
  for (const [key, value] of trail) {
    const next = value - step;
    if (next <= 0) trail.delete(key);
    else trail.set(key, next);
  }
  return trail;
}

export function blockContains(block: Block, c: Cell): boolean {
  return c.x >= block.x && c.x < block.x + block.w && c.y >= block.y && c.y < block.y + block.h;
}

/** Add the cell if absent, remove it if present. Returns a new set. */
export function togglePin(pins: ReadonlySet<string>, c: Cell): Set<string> {
  const next = new Set(pins);
  const key = cellKey(c);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
}

const KEY_PATTERN = /^-?\d+,-?\d+$/;
const MAX_PINS = 500;

/** Parse pins from localStorage. Anything malformed is dropped rather than trusted. */
export function parsePins(raw: string | null): Set<string> {
  if (!raw) return new Set();
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return new Set();
    return new Set(
      value.filter((k): k is string => typeof k === 'string' && KEY_PATTERN.test(k)).slice(0, MAX_PINS),
    );
  } catch {
    return new Set();
  }
}

/**
 * Decorative gradient blocks placed around the card, echoing the reference design.
 * Positions are relative to the card's top-left cell; cols/rows are the card size in cells.
 */
export function decorBlocks(cols: number, rows: number): Block[] {
  return [
    { x: -3, y: -2, w: 3, h: 2 },
    { x: cols + 2, y: 1, w: 2, h: 2 },
    { x: cols, y: 3, w: 2, h: 2 },
    { x: -4, y: rows + 2, w: 2, h: 3 },
    { x: Math.floor(cols / 2), y: rows + 4, w: 3, h: 1 },
  ];
}

export interface CellGroup {
  cells: Cell[];
  /** Bounding box of the group, used to stretch one gradient across all its cells. */
  bounds: Block;
}

/** Split filled cells into groups of edge-adjacent cells (up/down/left/right). */
export function connectedGroups(keys: Iterable<string>): CellGroup[] {
  const remaining = new Set(keys);
  const groups: CellGroup[] = [];
  for (const start of remaining) {
    remaining.delete(start);
    const cells: Cell[] = [];
    const queue = [start];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    while (queue.length > 0) {
      const cell = parseKey(queue.pop()!);
      cells.push(cell);
      minX = Math.min(minX, cell.x);
      minY = Math.min(minY, cell.y);
      maxX = Math.max(maxX, cell.x);
      maxY = Math.max(maxY, cell.y);
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        const key = cellKey({ x: cell.x + dx, y: cell.y + dy });
        if (remaining.delete(key)) queue.push(key);
      }
    }
    groups.push({ cells, bounds: { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 } });
  }
  return groups;
}

/** Every cell covered by a block. */
export function blockCells(block: Block): Cell[] {
  const cells: Cell[] = [];
  for (let y = block.y; y < block.y + block.h; y++) {
    for (let x = block.x; x < block.x + block.w; x++) cells.push({ x, y });
  }
  return cells;
}
