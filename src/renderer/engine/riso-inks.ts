export interface RisoInk {
  id: string;
  name: string;
  rgb: [number, number, number];
}

export const RISO_INKS: RisoInk[] = [
  { id: "black", name: "Black", rgb: [37, 37, 37] },
  { id: "fluorescent-pink", name: "Fluoro Pink", rgb: [255, 72, 176] },
  { id: "blue", name: "Blue", rgb: [0, 120, 191] },
  { id: "yellow", name: "Yellow", rgb: [255, 232, 0] },
  { id: "red", name: "Red", rgb: [255, 102, 94] },
  { id: "green", name: "Green", rgb: [0, 169, 92] },
  { id: "purple", name: "Purple", rgb: [118, 75, 160] },
  { id: "teal", name: "Teal", rgb: [0, 131, 138] },
  { id: "orange", name: "Orange", rgb: [255, 108, 47] },
];

export const DEFAULT_RISO_INK_IDS = ["fluorescent-pink", "blue"];
export const MAX_RISO_INKS = 4;

export const getRisoInk = (id: string): RisoInk | undefined =>
  RISO_INKS.find((ink) => ink.id === id);
