const EFFECT_LABELS: Record<string, string> = {
  "print:dither": "dither",
  "print:halftone": "halftone",
  "print:ascii": "ASCII art",
  "print:pixelate": "pixelate",
  "print:scanlines": "scanlines",
  "print:crosshatch": "crosshatch",
  "print:popart": "pop art",
  "print:posterize": "posterize",
  "print:grain": "film grain",
  "print:photocopy": "photocopy",
  "print:misprint": "misprint",
  "print:fold": "paper fold",
  "print:dust": "dust and scratches",
  "text:shadow": "text shadow",
  "text:outline": "outlined type",
  "text:lift": "lifted type",
  "text:glitch": "glitch type",
  "text:glow": "glowing type",
  "text:gradient": "gradient type",
  "layer:drop-shadow": "drop shadow",
  "layer:inner-shadow": "inner shadow",
  "layer:glow": "glow",
  "layer:layer-blur": "blur",
  "layer:background-blur": "background blur",
  "filter:grayscale": "black and white",
  "filter:sepia": "sepia",
  "filter:blur": "blur",
  "filter:invert": "invert",
  "filter:hueRotate": "hue shift",
  "filter:brightness": "tone adjustments",
  "filter:contrast": "tone adjustments",
  "filter:saturation": "tone adjustments",
  "color-grade": "colour grade",
  "torn-edge": "torn paper edge",
  tape: "tape strips",
  shadow: "shadow",
  mask: "masking",
  blend: "blend modes",
  pattern: "repeat pattern",
};

const PRINT_PREFIX = "print:";

export const effectLabels = (effects: string[]): string[] => [
  ...new Set(effects.map((effect) => EFFECT_LABELS[effect]).filter((label): label is string => Boolean(label))),
];

export const printEffectLabels = (effects: string[]): string[] =>
  effectLabels(effects.filter((effect) => effect.startsWith(PRINT_PREFIX)));
