import { describe, expect, it } from 'vitest';
import { blockContains, cellAt, cellsBetween, decayTrail, parsePins, togglePin } from './grid';

describe('cellAt', () => {
  it('maps pixels to cells relative to the origin', () => {
    expect(cellAt(10, 10, 0, 0, 48)).toEqual({ x: 0, y: 0 });
    expect(cellAt(100, 50, 4, 2, 48)).toEqual({ x: 2, y: 1 });
    expect(cellAt(0, 0, 20, 20, 48)).toEqual({ x: -1, y: -1 });
  });
});

describe('cellsBetween', () => {
  it('returns a single cell when start and end match', () => {
    expect(cellsBetween({ x: 1, y: 1 }, { x: 1, y: 1 })).toEqual([{ x: 1, y: 1 }]);
  });

  it('fills a gap-free line', () => {
    expect(cellsBetween({ x: 0, y: 0 }, { x: 3, y: 0 })).toHaveLength(4);
    const diagonal = cellsBetween({ x: 0, y: 0 }, { x: -2, y: 2 });
    expect(diagonal[0]).toEqual({ x: 0, y: 0 });
    expect(diagonal.at(-1)).toEqual({ x: -2, y: 2 });
  });
});

describe('decayTrail', () => {
  it('fades and removes cells', () => {
    const trail = new Map([
      ['0,0', 1],
      ['1,0', 0.1],
    ]);
    decayTrail(trail, 200, 1000);
    expect(trail.get('0,0')).toBeCloseTo(0.8);
    expect(trail.has('1,0')).toBe(false);
  });
});

describe('togglePin', () => {
  it('adds then removes a cell without mutating the input', () => {
    const empty = new Set<string>();
    const added = togglePin(empty, { x: 2, y: -1 });
    expect(empty.size).toBe(0);
    expect(added.has('2,-1')).toBe(true);
    expect(togglePin(added, { x: 2, y: -1 }).size).toBe(0);
  });
});

describe('parsePins', () => {
  it('accepts valid keys and drops everything else', () => {
    expect(parsePins(JSON.stringify(['1,2', '-3,4', 'bad', 5, '1,2,3']))).toEqual(new Set(['1,2', '-3,4']));
    expect(parsePins('not json')).toEqual(new Set());
    expect(parsePins(JSON.stringify({ a: 1 }))).toEqual(new Set());
    expect(parsePins(null)).toEqual(new Set());
  });
});

describe('blockContains', () => {
  it('checks bounds exclusively on the far edge', () => {
    const block = { x: 0, y: 0, w: 2, h: 2 };
    expect(blockContains(block, { x: 1, y: 1 })).toBe(true);
    expect(blockContains(block, { x: 2, y: 0 })).toBe(false);
  });
});
