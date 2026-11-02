const ROUND_CONSTANTS = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

export const INITIAL_STATE: readonly number[] = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
];

export const BLOCK_BYTES = 64;
const SCHEDULE_WORDS = 64;
const BLOCK_WORDS = 16;

const rotateRight = (value: number, bits: number): number => (value >>> bits) | (value << (32 - bits));

const fillSchedule = (schedule: Uint32Array, view: DataView, offset: number): void => {
  for (let index = 0; index < BLOCK_WORDS; index += 1) schedule[index] = view.getUint32(offset + index * 4);
  for (let index = BLOCK_WORDS; index < SCHEDULE_WORDS; index += 1) {
    const early = schedule[index - 15];
    const late = schedule[index - 2];
    const sigmaZero = rotateRight(early, 7) ^ rotateRight(early, 18) ^ (early >>> 3);
    const sigmaOne = rotateRight(late, 17) ^ rotateRight(late, 19) ^ (late >>> 10);
    schedule[index] = (schedule[index - 16] + sigmaZero + schedule[index - 7] + sigmaOne) | 0;
  }
};

export const compressBlock = (state: Uint32Array, schedule: Uint32Array, view: DataView, offset: number): void => {
  fillSchedule(schedule, view, offset);
  let [a, b, c, d, e, f, g, h] = state;
  for (let index = 0; index < SCHEDULE_WORDS; index += 1) {
    const sumOne = rotateRight(e, 6) ^ rotateRight(e, 11) ^ rotateRight(e, 25);
    const choose = (e & f) ^ (~e & g);
    const first = (h + sumOne + choose + ROUND_CONSTANTS[index] + schedule[index]) | 0;
    const sumZero = rotateRight(a, 2) ^ rotateRight(a, 13) ^ rotateRight(a, 22);
    const majority = (a & b) ^ (a & c) ^ (b & c);
    const second = (sumZero + majority) | 0;
    [h, g, f, e, d, c, b, a] = [g, f, e, (d + first) | 0, c, b, a, (first + second) | 0];
  }
  const rounds = [a, b, c, d, e, f, g, h];
  rounds.forEach((value, index) => {
    state[index] = (state[index] + value) | 0;
  });
};
