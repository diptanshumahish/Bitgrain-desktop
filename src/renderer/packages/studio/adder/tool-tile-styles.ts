export const TOOL_TILE_ICON_SIZE = 16;

export const TOOL_SEGMENT_CLASS =
  "h-12 flex items-center justify-center border-none outline-none cursor-pointer transition-colors shrink-0";

export const TOOL_TILE_CLASS = `${TOOL_SEGMENT_CLASS} w-[54px] flex-col gap-1`;

export const toolTileTone = (active: boolean): string =>
  active
    ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
    : "bg-transparent text-[var(--s-text)] hover:bg-[var(--s-bg-input)]";
