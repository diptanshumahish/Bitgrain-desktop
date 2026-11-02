import { SUBCELLS_PER_AXIS } from "./cone-grid";

export const SUBCELLS_PER_BLOCK = SUBCELLS_PER_AXIS * SUBCELLS_PER_AXIS * SUBCELLS_PER_AXIS;
export const UNKNOWN_ENTRY = 0;
const FULL_SEARCH_BLOCK = 0;
export const FULL_SEARCH_LIST = 0;

const MAX_ENTRY = 0xffff;
const INITIAL_MEMBER_CAPACITY = 1 << 16;
const INITIAL_BLOCK_CAPACITY = 1 << 10;
const GROWTH_FACTOR = 2;

export interface CandidateStore {
  table: Uint16Array;
  blocks: Uint16Array;
  blockCount: number;
  firstLinkEntry: number;
  members: Uint32Array;
  starts: Int32Array;
  counts: Uint32Array;
  listCount: number;
  memberCount: number;
}

const fullSearchBlock = (firstLinkEntry: number): Uint16Array =>
  new Uint16Array(INITIAL_BLOCK_CAPACITY * SUBCELLS_PER_BLOCK).fill(firstLinkEntry + FULL_SEARCH_LIST, 0, SUBCELLS_PER_BLOCK);

export const createCandidateStore = (cellCount: number, paletteSize: number): CandidateStore => {
  const firstLinkEntry = paletteSize + 1;
  const linkCapacity = Math.max(1, MAX_ENTRY - firstLinkEntry + 1);
  const members = new Uint32Array(Math.max(INITIAL_MEMBER_CAPACITY, paletteSize));
  for (let index = 0; index < paletteSize; index++) members[index] = index;
  const counts = new Uint32Array(linkCapacity);
  counts[FULL_SEARCH_LIST] = paletteSize;
  return {
    table: new Uint16Array(cellCount), blocks: fullSearchBlock(firstLinkEntry), blockCount: 1, firstLinkEntry,
    members, starts: new Int32Array(linkCapacity), counts, listCount: 1, memberCount: paletteSize,
  };
};

export const decidedEntry = (index: number): number => index + 1;

const grown = (source: Uint32Array | Uint16Array, needed: number): Uint32Array | Uint16Array => {
  if (needed <= source.length) return source;
  const larger = source instanceof Uint32Array
    ? new Uint32Array(Math.max(source.length * GROWTH_FACTOR, needed))
    : new Uint16Array(Math.max(source.length * GROWTH_FACTOR, needed));
  larger.set(source);
  return larger;
};

export const appendCandidateList = (store: CandidateStore, candidates: Uint32Array, count: number): number => {
  if (store.listCount >= store.counts.length) return store.firstLinkEntry + FULL_SEARCH_LIST;
  store.members = grown(store.members, store.memberCount + count) as Uint32Array;
  store.members.set(candidates.subarray(0, count), store.memberCount);
  store.starts[store.listCount] = store.memberCount;
  store.counts[store.listCount] = count;
  store.memberCount += count;
  store.listCount += 1;
  return store.firstLinkEntry + store.listCount - 1;
};

export const appendBlock = (store: CandidateStore): number => {
  if (store.blockCount >= store.counts.length) return store.firstLinkEntry + FULL_SEARCH_BLOCK;
  store.blocks = grown(store.blocks, (store.blockCount + 1) * SUBCELLS_PER_BLOCK) as Uint16Array;
  store.blockCount += 1;
  return store.firstLinkEntry + store.blockCount - 1;
};
