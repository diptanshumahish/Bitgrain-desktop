export const wrapClassFor = (compact: boolean | undefined, disabled: boolean | undefined): string => {
  const surface = disabled
    ? "bg-transparent opacity-35"
    : "bg-[var(--s-bg-input)] hover:bg-[var(--s-bg-input-hover)]";
  if (compact) {
    return `inline-flex items-center gap-0.5 rounded-md h-[21px] px-1.5 min-w-[42px] transition-colors duration-100 ${surface}`;
  }
  return `flex items-center gap-2 rounded-md h-[28px] px-2 transition-all duration-100 ${surface}`;
};

export const valueClassFor = (compact: boolean | undefined): string =>
  compact
    ? "text-[12px] text-[var(--s-text)] font-medium [font-variant-numeric:tabular-nums]"
    : "flex-1 text-[12px] text-[var(--s-text)] font-medium";

export const inputClassFor = (compact: boolean | undefined): string =>
  compact
    ? "bg-transparent border-none outline-none text-[12px] text-[var(--s-text)] [font-variant-numeric:tabular-nums] w-[30px] min-w-0"
    : "flex-1 bg-transparent border-none outline-none text-[12px] text-[var(--s-text)] w-0 min-w-[3rem]";

export const LABEL_CLASS = "text-[12px] text-[var(--s-text-subtle)] shrink-0 select-none font-medium pr-1";
export const SUFFIX_CLASS = "text-[12px] text-[var(--s-text-subtle)] shrink-0";
export const FOCUS_RING_CLASS = "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--s-accent)] rounded-sm";
