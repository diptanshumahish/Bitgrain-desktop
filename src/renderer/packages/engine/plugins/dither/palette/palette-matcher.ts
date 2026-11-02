import type { Palette } from "../../../core/types";
import { L_FROM_B, L_FROM_G, L_FROM_R, M_FROM_B, M_FROM_G, M_FROM_R, S_FROM_B, S_FROM_G, S_FROM_R } from "./oklab-matrices";
import { nearestAmong, type PreparedPalette } from "./palette-space";
import { buildRivalPlanes } from "./rival-planes";
import { collectCandidates } from "./cell-decision";
import {
  BIN_SCALE, CELLS_PER_AXIS, CELL_SPANS, CONE_LOOKUP_LIMIT, FINE_OF_BIN, FINE_SPANS, SUBCELLS_PER_AXIS, SUBCELL_BITS, SUBCELL_MASK,
} from "./cone-grid";
import {
  FULL_SEARCH_LIST, SUBCELLS_PER_BLOCK, UNKNOWN_ENTRY,
  appendBlock, appendCandidateList, createCandidateStore, decidedEntry, type CandidateStore,
} from "./candidate-store";

const MAX_TABLE_PALETTE = 1024;
const MAX_CACHED_STORES = 3;
const AXES = 3;
const CELLS_PER_PLANE = CELLS_PER_AXIS * CELLS_PER_AXIS;
const CELL_COUNT = CELLS_PER_PLANE * CELLS_PER_AXIS;
const SUBCELLS_PER_PLANE = SUBCELLS_PER_AXIS * SUBCELLS_PER_AXIS;

export interface PaletteMatcher {
  store: CandidateStore;
  prepared: PreparedPalette;
  planes: Float64Array;
}

const cachedStores = new Map<string, CandidateStore>();
const scratchCandidates = new Uint32Array(MAX_TABLE_PALETTE);
const coneSpan = new Float64Array(AXES * 2);

const storeFor = (palette: Palette): CandidateStore => {
  const key = palette.colors.join(";");
  const cached = cachedStores.get(key);
  if (cached) return cached;
  const store = createCandidateStore(CELL_COUNT, palette.colors.length);
  if (cachedStores.size >= MAX_CACHED_STORES) cachedStores.delete(cachedStores.keys().next().value as string);
  cachedStores.set(key, store);
  return store;
};

const candidatesWithin = (matcher: PaletteMatcher, spans: Float64Array, groups: number[]): number => {
  for (let axis = 0; axis < AXES; axis++) {
    coneSpan[axis] = spans[groups[axis] * 2];
    coneSpan[axis + AXES] = spans[groups[axis] * 2 + 1];
  }
  return collectCandidates(matcher.prepared, matcher.planes, coneSpan, scratchCandidates);
};

const resolveCell = (matcher: PaletteMatcher, cell: number, fines: number[]): number => {
  const count = candidatesWithin(matcher, CELL_SPANS, fines.map((fine) => fine >> SUBCELL_BITS));
  const entry = count === 1 ? decidedEntry(scratchCandidates[0]) : appendBlock(matcher.store);
  matcher.store.table[cell] = entry;
  return entry;
};

const resolveSubcell = (matcher: PaletteMatcher, slot: number, fines: number[]): number => {
  const count = candidatesWithin(matcher, FINE_SPANS, fines);
  const { store } = matcher;
  const entry = count === 1 ? decidedEntry(scratchCandidates[0]) : appendCandidateList(store, scratchCandidates, count);
  store.blocks[slot] = entry;
  return entry;
};

const searchList = (matcher: PaletteMatcher, list: number, long: number, medium: number, short: number): number => {
  const { store } = matcher;
  return nearestAmong(matcher.prepared, store.members, store.starts[list], store.counts[list], long, medium, short);
};

const subcellSlot = (fineLong: number, fineMedium: number, fineShort: number): number =>
  (fineLong & SUBCELL_MASK) * SUBCELLS_PER_PLANE + (fineMedium & SUBCELL_MASK) * SUBCELLS_PER_AXIS + (fineShort & SUBCELL_MASK);

const matchCones = (matcher: PaletteMatcher, long: number, medium: number, short: number): number => {
  const { store } = matcher;
  const fineLong = FINE_OF_BIN[(long * BIN_SCALE) | 0];
  const fineMedium = FINE_OF_BIN[(medium * BIN_SCALE) | 0];
  const fineShort = FINE_OF_BIN[(short * BIN_SCALE) | 0];
  const cell = (fineLong >> SUBCELL_BITS) * CELLS_PER_PLANE + (fineMedium >> SUBCELL_BITS) * CELLS_PER_AXIS + (fineShort >> SUBCELL_BITS);
  let entry = store.table[cell];
  if (entry === UNKNOWN_ENTRY) entry = resolveCell(matcher, cell, [fineLong, fineMedium, fineShort]);
  if (entry < store.firstLinkEntry) return entry - 1;
  const slot = (entry - store.firstLinkEntry) * SUBCELLS_PER_BLOCK + subcellSlot(fineLong, fineMedium, fineShort);
  let subEntry = store.blocks[slot];
  if (subEntry === UNKNOWN_ENTRY) subEntry = resolveSubcell(matcher, slot, [fineLong, fineMedium, fineShort]);
  if (subEntry < store.firstLinkEntry) return subEntry - 1;
  return searchList(matcher, subEntry - store.firstLinkEntry, long, medium, short);
};

export const matchPaletteIndex = (matcher: PaletteMatcher, red: number, green: number, blue: number): number => {
  const long = Math.max(0, L_FROM_R * red + L_FROM_G * green + L_FROM_B * blue);
  const medium = Math.max(0, M_FROM_R * red + M_FROM_G * green + M_FROM_B * blue);
  const short = Math.max(0, S_FROM_R * red + S_FROM_G * green + S_FROM_B * blue);
  const inGrid = long <= CONE_LOOKUP_LIMIT && medium <= CONE_LOOKUP_LIMIT && short <= CONE_LOOKUP_LIMIT;
  if (inGrid && matcher.store.table.length > 0) return matchCones(matcher, long, medium, short);
  return searchList(matcher, FULL_SEARCH_LIST, long, medium, short);
};

export const createPaletteMatcher = (prepared: PreparedPalette, palette: Palette): PaletteMatcher => {
  if (prepared.size > MAX_TABLE_PALETTE) {
    return { prepared, store: createCandidateStore(0, prepared.size), planes: new Float64Array(0) };
  }
  return { prepared, store: storeFor(palette), planes: buildRivalPlanes(prepared.lab, prepared.size) };
};
