/**
 * Deterministic pseudo-randomness. The same (seed, salt) always yields the same
 * value, so records derived from an API row never change between renders.
 */
export function seededInt(seed: number, salt: number): number {
  let h = Math.imul(seed + 1, 0x9e3779b1) ^ Math.imul(salt + 1, 0x85ebca6b);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return h >>> 0;
}

export function pick<T>(list: readonly T[], seed: number, salt: number): T {
  return list[seededInt(seed, salt) % list.length];
}

export const round2 = (value: number): number => Math.round(value * 100) / 100;
