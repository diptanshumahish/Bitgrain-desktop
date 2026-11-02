import type { DesignFormat } from "./new-design-formats";
import type { SafeZoneSpec } from "./safe-zone-types";

const PRINT_SAFE_MARGIN_PX = 38;
const BOOK_SAFE_MARGIN_PX = 75;

const printSafeArea = (width: number, height: number, margin: number): SafeZoneSpec[] => [
  { label: "Print safe margin", x: margin, y: margin, width: width - margin * 2, height: height - margin * 2 },
];

const printFormat = (id: string, label: string, detail: string, width: number, height: number, margin = PRINT_SAFE_MARGIN_PX): DesignFormat => ({
  id,
  label,
  detail,
  width,
  height,
  safeZones: printSafeArea(width, height, margin),
});

export const PRINT_SIZES: DesignFormat[] = [
  printFormat("a4", "A4", "210 × 297 mm at 300 dpi", 2480, 3508),
  printFormat("a5", "A5", "148 × 210 mm at 300 dpi", 1748, 2480),
  printFormat("a3", "A3", "297 × 420 mm at 300 dpi", 3508, 4961),
  printFormat("us-letter", "US Letter", "8.5 × 11 in at 300 dpi", 2550, 3300),
  printFormat("business-card", "Business card", "3.5 × 2 in at 300 dpi", 1050, 600),
  printFormat("postcard", "Postcard", "6 × 4 in at 300 dpi", 1800, 1200),
  printFormat("poster-18x24", "Poster", "18 × 24 in at 150 dpi", 2700, 3600),
  printFormat("book-cover", "Book cover", "6 × 9 in at 300 dpi", 1800, 2700, BOOK_SAFE_MARGIN_PX),
];
