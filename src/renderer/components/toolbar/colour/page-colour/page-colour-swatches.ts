export interface PageColourSwatch {
  label: string;
  value: string;
  swatchClass: string;
}

export const PAGE_COLOUR_SWATCHES: PageColourSwatch[] = [
  { label: "Cream", value: "#fdf6e3", swatchClass: "bg-[#fdf6e3]" },
  { label: "White", value: "#ffffff", swatchClass: "bg-[#ffffff]" },
  { label: "Newsprint", value: "#ebe6da", swatchClass: "bg-[#ebe6da]" },
  { label: "Kraft", value: "#c8a97e", swatchClass: "bg-[#c8a97e]" },
  { label: "Night", value: "#0e0e12", swatchClass: "bg-[#0e0e12]" },
  { label: "Navy", value: "#16213e", swatchClass: "bg-[#16213e]" },
];

export const CUSTOM_PICKER_FALLBACK = "#fdf6e3";
