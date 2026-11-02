import type { RulerColors } from "./ruler-paint";

const FALLBACK_COLORS: RulerColors = {
  background: "#ffffff",
  tick: "#c4c4c4",
  text: "#8a8a8a",
  highlight: "#0d99ff",
};

const readVar = (styles: CSSStyleDeclaration, name: string, fallback: string): string =>
  styles.getPropertyValue(name).trim() || fallback;

export const readRulerColors = (element: HTMLElement): RulerColors => {
  const styles = getComputedStyle(element);
  return {
    background: readVar(styles, "--s-bg-panel", FALLBACK_COLORS.background),
    tick: readVar(styles, "--s-border", FALLBACK_COLORS.tick),
    text: readVar(styles, "--s-text-subtle", FALLBACK_COLORS.text),
    highlight: readVar(styles, "--s-accent", FALLBACK_COLORS.highlight),
  };
};
