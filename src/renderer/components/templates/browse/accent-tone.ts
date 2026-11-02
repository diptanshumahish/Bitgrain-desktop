const DARK_ACCENTS = new Set(["bg-accent-purple"]);

export interface AccentTone {
  title: string;
  body: string;
  chip: string;
  isDark: boolean;
}

const LIGHT_TEXT: AccentTone = {
  title: "text-white",
  body: "text-white/60",
  chip: "bg-white/10 text-white/85 hover:bg-white/20",
  isDark: true,
};
const DARK_TEXT: AccentTone = {
  title: "text-zinc-900",
  body: "text-zinc-900/55",
  chip: "bg-zinc-900/[0.08] text-zinc-800 hover:bg-zinc-900/[0.16]",
  isDark: false,
};

export function accentTone(accent: string): AccentTone {
  return DARK_ACCENTS.has(accent) ? LIGHT_TEXT : DARK_TEXT;
}
