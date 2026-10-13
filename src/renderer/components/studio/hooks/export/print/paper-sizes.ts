export interface PaperSize {
  name: string;
  widthMm: number;
  heightMm: number;
}

export const MM_PER_INCH = 25.4;
export const PRINT_DPI = 300;

const fromInches = (name: string, widthInches: number, heightInches: number): PaperSize => ({
  name,
  widthMm: widthInches * MM_PER_INCH,
  heightMm: heightInches * MM_PER_INCH,
});

export const PAPER_SIZES: readonly PaperSize[] = [
  { name: "A2", widthMm: 420, heightMm: 594 },
  { name: "A3", widthMm: 297, heightMm: 420 },
  { name: "A4", widthMm: 210, heightMm: 297 },
  { name: "A5", widthMm: 148, heightMm: 210 },
  { name: "A6", widthMm: 105, heightMm: 148 },
  { name: "DL", widthMm: 99, heightMm: 210 },
  fromInches("US Letter", 8.5, 11),
  fromInches("US Legal", 8.5, 14),
  fromInches("Tabloid", 11, 17),
  fromInches("Business card", 3.5, 2),
  { name: "EU business card", widthMm: 85, heightMm: 55 },
  fromInches("Postcard", 6, 4),
  fromInches("5x7 card", 7, 5),
];
