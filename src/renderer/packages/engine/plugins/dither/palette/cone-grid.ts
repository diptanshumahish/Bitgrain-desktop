export const CELLS_PER_AXIS = 128;
export const SUBCELL_BITS = 2;
export const SUBCELLS_PER_AXIS = 1 << SUBCELL_BITS;
export const SUBCELL_MASK = SUBCELLS_PER_AXIS - 1;
export const CONE_LOOKUP_LIMIT = 1.36;

const CONE_GRID_LIMIT = 1.4;
const BIN_COUNT = 1 << 14;
const FINE_PER_AXIS = CELLS_PER_AXIS * SUBCELLS_PER_AXIS;
const FINE_SCALE = FINE_PER_AXIS / Math.sqrt(CONE_GRID_LIMIT);

export const BIN_SCALE = BIN_COUNT / CONE_GRID_LIMIT;

const binLow = (bin: number): number => bin / BIN_SCALE;

const fineOf = (bin: number): number => Math.min(FINE_PER_AXIS - 1, Math.floor(Math.sqrt(binLow(bin)) * FINE_SCALE));

const buildFineOfBin = (): Uint16Array => Uint16Array.from({ length: BIN_COUNT }, (_, bin) => fineOf(bin));

export const FINE_OF_BIN = buildFineOfBin();

const spanOf = (groupOf: (fine: number) => number, groupCount: number): Float64Array => {
  const span = new Float64Array(groupCount * 2).fill(Number.NaN);
  for (let bin = 0; bin < BIN_COUNT; bin++) {
    const group = groupOf(FINE_OF_BIN[bin]);
    if (Number.isNaN(span[group * 2])) span[group * 2] = binLow(bin);
    span[group * 2 + 1] = binLow(bin + 1);
  }
  return span;
};

export const CELL_SPANS = spanOf((fine) => fine >> SUBCELL_BITS, CELLS_PER_AXIS);
export const FINE_SPANS = spanOf((fine) => fine, FINE_PER_AXIS);
