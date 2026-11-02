import { createButton } from "./button/create-button";
import type { ButtonTheme } from "./button/button-theme";

type Variant = "primary" | "secondary" | "ghost" | "destructive";

const BUTTON_THEME: ButtonTheme<Variant> = {
  base: "inline-flex items-center justify-center gap-2 font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-[var(--s-text)]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--s-bg-panel)] disabled:opacity-50 disabled:pointer-events-none select-none whitespace-nowrap",
  shapeBox: "rounded-lg active:scale-[0.98]",
  sizeText: {
    xs: "h-7 px-2.5 text-[12px]",
    sm: "h-8 px-3 text-[12px]",
    md: "h-9 px-3.5 text-[13px]",
    lg: "h-11 px-5 text-[14px]",
  },
  sizeLink: {
    xs: "text-[12px]",
    sm: "text-[12px]",
    md: "text-[13px]",
    lg: "text-[14px]",
  },
  variants: {
    primary: "bg-[var(--s-text)] text-[var(--s-bg-panel)] hover:opacity-95",
    secondary: "bg-[var(--s-bg-input)] text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)]",
    ghost: "text-[var(--s-text-muted)] bg-transparent hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]",
    destructive: "bg-red-600 text-white hover:bg-red-500",
    link: "text-[var(--s-text-muted)] bg-transparent hover:text-[var(--s-text)] underline underline-offset-4 decoration-dotted hover:decoration-solid",
  },
};

export const Button = createButton(BUTTON_THEME, "secondary");
