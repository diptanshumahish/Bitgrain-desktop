export const HALFTONE_TIPS = {
  dotSize: "Space between dot centres, in pixels of your photo. Bigger dots look bolder and more graphic, smaller dots keep more detail.",
  style: "Mono prints with one ink, Colour keeps the colours of your image, CMYK splits it into four overlapping inks like a magazine.",
  contrast: "Pushes darks darker and lights lighter before the dots are made, so the dots read more clearly.",
  angle: "Tilts the rows of dots. 45° is the classic print angle and hides the pattern best.",
  shape: "Round is classic offset print, ellipse makes chained dots, line is an engraved line screen, diamond and square look more graphic.",
  grit: "Roughens dot edges and adds ink specks, like cheap paper and a worn press.",
  sharpness: "How crisp the edge of each dot is. Lower is softer and more like ink on paper.",
  intensity: "How strongly the image drives dot size. Higher makes everything darker and heavier.",
  invert: "Prints ink dots on light paper. Turn it off for light dots on black.",
} as const;

export const STYLE_OPTIONS = [
  { id: "mono", label: "Mono" },
  { id: "color", label: "Colour" },
  { id: "cmyk", label: "CMYK" },
] as const;

export const SHAPE_OPTIONS = [
  { id: "round", label: "Round" },
  { id: "ellipse", label: "Ellipse" },
  { id: "line", label: "Line" },
  { id: "diamond", label: "Diamond" },
  { id: "square", label: "Square" },
] as const;
