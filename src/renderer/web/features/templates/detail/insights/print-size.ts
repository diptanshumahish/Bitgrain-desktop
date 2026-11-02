const PRINT_CATEGORIES = new Set([
  "poster",
  "invitation",
  "certificate",
  "resume",
  "letterhead",
  "menu",
  "business-card",
  "flyer",
  "book-cover",
  "planner",
  "packaging",
  "business-docs",
  "signage",
  "ticket",
  "greeting",
  "recipe-card",
  "id-card",
  "grade-card",
  "grand-opening",
]);

const PRINT_DPI = 300;
const CM_PER_INCH = 2.54;
const ONE_DECIMAL = 10;

export interface PixelSize {
  width: number;
  height: number;
}

const roundOne = (value: number): number => Math.round(value * ONE_DECIMAL) / ONE_DECIMAL;

export const isPrintCategory = (category: string): boolean => PRINT_CATEGORIES.has(category);

export const printSizeLabel = (exportSize: PixelSize): string => {
  const widthInches = exportSize.width / PRINT_DPI;
  const heightInches = exportSize.height / PRINT_DPI;
  const inches = `${roundOne(widthInches)} × ${roundOne(heightInches)} in`;
  const centimetres = `${roundOne(widthInches * CM_PER_INCH)} × ${roundOne(heightInches * CM_PER_INCH)} cm`;
  return `About ${inches} (${centimetres}) at ${PRINT_DPI} dpi`;
};
