import React, { useEffect, useState } from "react";
import { X, BookOpen } from "lucide-react";
import { useSignalValue } from "../../lib/signal";
import { imageSignal } from "../../store/image-store";
import { extractImagePalette } from "../../utils/extract-image-palette";
import { ColorChip } from "./color-studio/ColorChip";
import { ColorWheel } from "./color-studio/ColorWheel";
import { HarmonyRows } from "./color-studio/HarmonyRows";
import { BrandBoard } from "./color-studio/BrandBoard";

const COUNTS = [4, 6, 8, 12];

export const ColorStudioModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const imageUrl = useSignalValue(imageSignal);
  const [count, setCount] = useState(8);
  const [palette, setPalette] = useState<string[]>([]);
  const [baseHex, setBaseHex] = useState<string | null>(null);
  const [tab, setTab] = useState<"harmony" | "brand">("harmony");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!imageUrl) return;
    let cancelled = false;
    extractImagePalette(imageUrl, count).then((c) => {
      if (!cancelled) setPalette(c);
    });
    return () => {
      cancelled = true;
    };
  }, [imageUrl, count]);

  const base = baseHex && palette.includes(baseHex) ? baseHex : palette[0] ?? null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[rgba(10,12,18,0.5)] backdrop-blur-[3px] animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-[860px] max-h-[88vh] rounded-2xl bg-[var(--s-bg-panel)] border border-[var(--s-border)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 font-editorial"
      >
        <div className="flex items-center justify-between px-5 h-12 border-b border-[var(--s-border)] shrink-0">
          <span className="text-[14px] font-semibold text-[var(--s-text)]">Color studio</span>
          <div className="flex items-center gap-2">
            <a
              href="/docs/05-studio-advanced/06-color-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2 h-7 rounded-md text-[11px] font-medium text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors no-underline"
            >
              <BookOpen size={12} /> Guide
            </a>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] transition-colors"
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>
        </div>

        {!imageUrl ? (
          <div className="p-12 text-center text-[13px] text-[var(--s-text-muted)]">
            Upload an image to extract its colors.
          </div>
        ) : (
          <div className="flex flex-col md:flex-row min-h-0 flex-1">
            <div className="md:w-[300px] shrink-0 border-b md:border-b-0 md:border-r border-[var(--s-border)] p-5 flex flex-col gap-4 overflow-y-auto no-scrollbar">
              <div className="flex gap-1">
                {COUNTS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setCount(n)}
                    className={`flex-1 py-1 rounded-md text-[10px] font-semibold tabular-nums transition-all ${
                      count === n
                        ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                        : "bg-[var(--s-bg-input)] text-[var(--s-text-subtle)] hover:bg-[var(--s-bg-input-hover)]"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {palette.length === 0 ? (
                  <span className="text-[10.5px] text-[var(--s-text-subtle)] py-3">Reading colors...</span>
                ) : (
                  palette.map((hex) => (
                    <ColorChip key={hex} hex={hex} size={34} selected={hex === base} onSelect={() => setBaseHex(hex)} />
                  ))
                )}
              </div>

              {palette.length > 0 && <ColorWheel colors={palette} base={base} />}

              <p className="text-[10px] text-[var(--s-text-subtle)] text-center leading-relaxed">
                Click a swatch to set the base color and copy its hex.
              </p>
            </div>

            <div className="flex-1 min-w-0 flex flex-col min-h-0">
              <div className="flex gap-1 p-3 border-b border-[var(--s-border)] shrink-0">
                <button
                  onClick={() => setTab("harmony")}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    tab === "harmony"
                      ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                      : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)]"
                  }`}
                >
                  Harmonies
                </button>
                <button
                  onClick={() => setTab("brand")}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                    tab === "brand"
                      ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]"
                      : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)]"
                  }`}
                >
                  Brand board
                </button>
              </div>

              <div className="p-5 overflow-y-auto no-scrollbar flex-1 min-h-0">
                {base && tab === "harmony" && <HarmonyRows base={base} />}
                {tab === "brand" && <BrandBoard palette={palette} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
