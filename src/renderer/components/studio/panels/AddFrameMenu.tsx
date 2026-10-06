import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { RESIZE_FORMATS } from "../../../utils/studio-resize";

interface AddFrameMenuProps {
  onAdd: (width: number, height: number, name?: string) => void;
  currentWidth?: number;
  currentHeight?: number;
  // Rendered as a full-width dashed button (panel) or a compact one (empty state).
  variant?: "panel" | "cta";
  label?: string;
}

// A frame-size picker: same-as-current, common presets, or a custom W×H. Opens a
// small popover from an "Add frame" button.
export function AddFrameMenu({
  onAdd,
  currentWidth,
  currentHeight,
  variant = "panel",
  label = "Add frame",
}: AddFrameMenuProps) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const [w, setW] = useState(currentWidth ?? 1080);
  const [h, setH] = useState(currentHeight ?? 1080);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
        setCustom(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (width: number, height: number, name?: string) => {
    onAdd(width, height, name);
    setOpen(false);
    setCustom(false);
  };

  const triggerClass =
    variant === "cta"
      ? "flex items-center gap-1.5 rounded-lg bg-[var(--s-text)] px-4 py-2.5 text-[13px] font-semibold text-[var(--s-bg-panel)] transition-opacity hover:opacity-90"
      : "flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[var(--s-border)] py-2 text-[11px] font-medium text-[var(--s-text-muted)] transition-colors hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]";

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} className={triggerClass}>
        <Plus size={variant === "cta" ? 15 : 12} strokeWidth={2} />
        {label}
      </button>

      {open && (
        <div
          className={`absolute z-[200] w-56 overflow-hidden rounded-xl border border-[var(--s-border)] bg-[var(--s-bg-panel)] p-1 shadow-xl ${
            variant === "cta" ? "left-1/2 top-full mt-2 -translate-x-1/2" : "bottom-full left-0 mb-2"
          }`}
        >
          {!custom ? (
            <>
              {currentWidth && currentHeight && (
                <button
                  type="button"
                  onClick={() => pick(currentWidth, currentHeight)}
                  className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[12px] text-[var(--s-text)] transition-colors hover:bg-[var(--s-bg-input)]"
                >
                  <span>Same as current</span>
                  <span className="text-[10px] tabular-nums text-[var(--s-text-muted)]">
                    {currentWidth}×{currentHeight}
                  </span>
                </button>
              )}
              <div className="my-1 h-px bg-[var(--s-border)]" />
              {RESIZE_FORMATS.map((format) => (
                <button
                  key={format.id}
                  type="button"
                  onClick={() => pick(format.width, format.height, format.label)}
                  className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[12px] text-[var(--s-text)] transition-colors hover:bg-[var(--s-bg-input)]"
                >
                  <span className="capitalize">{format.label}</span>
                  <span className="text-[10px] tabular-nums text-[var(--s-text-muted)]">
                    {format.width}×{format.height}
                  </span>
                </button>
              ))}
              <div className="my-1 h-px bg-[var(--s-border)]" />
              <button
                type="button"
                onClick={() => setCustom(true)}
                className="w-full rounded-md px-2.5 py-1.5 text-left text-[12px] font-medium text-[var(--s-accent)] transition-colors hover:bg-[var(--s-bg-input)]"
              >
                Custom size…
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 p-1.5">
              <div className="flex items-center gap-2">
                <label className="flex flex-1 flex-col gap-1">
                  <span className="text-[10px] text-[var(--s-text-muted)]">Width</span>
                  <input
                    type="number"
                    min={50}
                    value={w}
                    onChange={(e) => setW(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-md border border-[var(--s-border)] bg-[var(--s-bg-input)] px-2 py-1.5 text-[12px] text-[var(--s-text)] outline-none focus:border-[var(--s-accent)]"
                  />
                </label>
                <span className="mt-4 text-[var(--s-text-muted)]">×</span>
                <label className="flex flex-1 flex-col gap-1">
                  <span className="text-[10px] text-[var(--s-text-muted)]">Height</span>
                  <input
                    type="number"
                    min={50}
                    value={h}
                    onChange={(e) => setH(parseInt(e.target.value, 10) || 0)}
                    className="w-full rounded-md border border-[var(--s-border)] bg-[var(--s-bg-input)] px-2 py-1.5 text-[12px] text-[var(--s-text)] outline-none focus:border-[var(--s-accent)]"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => w >= 50 && h >= 50 && pick(w, h)}
                className="rounded-md bg-[var(--s-text)] px-3 py-1.5 text-[12px] font-semibold text-[var(--s-bg-panel)] transition-opacity hover:opacity-90"
              >
                Add {w}×{h}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
