import type { SelectOption } from "../../engine/style-types";

interface Ramp {
  id: string;
  label: string;
  glyphs: string;
}

const GLYPH_RAMPS: readonly Ramp[] = [
  { id: "standard", label: "Standard", glyphs: "@#S08Xx+=-;:. " },
  { id: "classic", label: "Classic", glyphs: "@%#*+=-:. " },
  { id: "ink", label: "Ink", glyphs: "@&$%#?*+~:. " },
  { id: "minimal", label: "Minimal", glyphs: "█▄▀ " },
  { id: "forensic", label: "Forensic", glyphs: "@#*+=-:. " },
  { id: "blocks", label: "Blocks", glyphs: "█▓▒░ " },
  { id: "bars", label: "Bars", glyphs: "█▇▆▅▄▃▂▁ " },
  { id: "quadrants", label: "Quadrants", glyphs: "█▛▙▟▜▚▞▘▝ " },
  { id: "braille", label: "Braille", glyphs: "⣿⣷⣦⣤⣠⣄⡄⠆⠄⠂ " },
  { id: "numeric", label: "Numbers", glyphs: "8069453271. " },
  { id: "binary", label: "Binary", glyphs: "10 " },
  { id: "hacker", label: "Hacker", glyphs: "@#10Xx*+-. " },
  { id: "alpha", label: "Letters", glyphs: "WMBHAXKOQwvcr:. " },
  { id: "dots", label: "Dots", glyphs: "●◕◑◔○∙·. " },
  { id: "geometric", label: "Shapes", glyphs: "█◆◼▲▼◇△▽·. " },
  { id: "math", label: "Maths", glyphs: "#ΣΔΨΩ×÷+·. " },
  { id: "katakana", label: "Katakana", glyphs: "ﾊﾐﾋﾂｳｼﾅﾓﾆｻﾜｵﾘｱﾎﾃﾏｹﾒｰ･ " },
];

export const RAMP_OPTIONS: readonly SelectOption[] = GLYPH_RAMPS.map((ramp) => ({ value: ramp.id, label: ramp.label }));

export const rampGlyphs = (id: string): string =>
  (GLYPH_RAMPS.find((ramp) => ramp.id === id) ?? GLYPH_RAMPS[0]).glyphs;

export const GLYPH_POOLS = {
  block: "█▓▒░ ",
  lines: "▌▍▎▏",
  diagonal: "╳╲⟍\\⋱",
  cross: "╋┼+× ",
  diamond: "⬥◆◇⋄ ",
} as const;

export const MIXED_POOLS: readonly string[] = ["▒░·", "║┃│┊", "╳╲⟍⋱", "╋✚┼+", "◆⬥◇⋄"];
