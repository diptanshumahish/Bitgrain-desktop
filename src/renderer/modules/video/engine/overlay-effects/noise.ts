const HASH_PRIME_A = 374761393;
const HASH_PRIME_B = 668265263;
const HASH_SHIFT = 13;
const HASH_NORM = 4294967296;

export function hashNoise(seed: number, salt: number): number {
  let value = (Math.trunc(seed) * HASH_PRIME_A + Math.trunc(salt) * HASH_PRIME_B) >>> 0;
  value ^= value >>> HASH_SHIFT;
  value = (value * (value | 1)) >>> 0;
  return value / HASH_NORM;
}

export function signedNoise(seed: number, salt: number): number {
  return hashNoise(seed, salt) * 2 - 1;
}
