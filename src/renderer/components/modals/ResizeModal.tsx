import React, { useState } from "react";
import { X, Check, BookOpen, Disc3 } from "lucide-react";
import { useSignalValue } from "../../lib/signal";
import { themeSignal } from "../../store/global-theme-store";
import { RELEASE_KIT_FORMAT_IDS, RESIZE_FORMATS } from "../../utils/studio-resize";

interface ResizeModalProps {
  sourceWidth: number;
  sourceHeight: number;
  onApply: (formatIds: string[]) => void;
  onClose: () => void;
}

const PREVIEW_BOX = 40;

export const ResizeModal: React.FC<ResizeModalProps> = ({ sourceWidth, sourceHeight, onApply, onClose }) => {
  const dark = useSignalValue(themeSignal) === "dark";
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string): void => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectReleaseKit = (): void => {
    setSelected(new Set(RELEASE_KIT_FORMAT_IDS));
  };

  const apply = (): void => {
    if (selected.size === 0) return;
    onApply([...selected]);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className={`w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl border animate-in fade-in slide-in-from-bottom-3 duration-200 font-sans ${dark ? "bg-[#141414] border-white/10" : "bg-white border-black/5"}`}>
        <div className={`flex items-start justify-between px-6 pt-5 pb-4 border-b ${dark ? "border-white/5" : "border-black/5"}`}>
          <div>
            <h2 className={`text-[18px] font-medium ${dark ? "text-white" : "text-zinc-900"}`}>resize to formats</h2>
            <p className={`text-[12px] mt-1 ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
              pick sizes, we lay your design out in each. predictable, no AI.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/docs/04-studio/02-pages-and-frames"
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-1.5 px-2 h-7 rounded-md text-[11px] font-medium no-underline transition-colors ${dark ? "text-zinc-500 hover:bg-zinc-800 hover:text-white" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"}`}
            >
              <BookOpen size={12} /> Guide
            </a>
            <button onClick={onClose} className={`w-8 h-8 flex items-center justify-center rounded-lg ${dark ? "text-zinc-500 hover:bg-zinc-800" : "text-zinc-400 hover:bg-zinc-100"}`}>
              <X size={16} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="px-5 pt-5">
          <button
            onClick={selectReleaseKit}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${dark ? "border-white/10 hover:border-white/20" : "border-zinc-200 hover:border-zinc-300"}`}
          >
            <Disc3 size={18} strokeWidth={1.75} className="text-violet-500 shrink-0" />
            <span className="flex-1 min-w-0">
              <span className={`block text-[12px] leading-tight ${dark ? "text-zinc-200" : "text-zinc-800"}`}>release kit</span>
              <span className={`block text-[10px] ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                spotify, apple and amazon covers, canvas, story and a tour poster in one go
              </span>
            </span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 p-5">
          {RESIZE_FORMATS.map((format) => {
            const isOn = selected.has(format.id);
            const isCurrent = format.width === sourceWidth && format.height === sourceHeight;
            const ratio = format.width / format.height;
            const w = ratio >= 1 ? PREVIEW_BOX : PREVIEW_BOX * ratio;
            const h = ratio >= 1 ? PREVIEW_BOX / ratio : PREVIEW_BOX;
            return (
              <button
                key={format.id}
                onClick={() => toggle(format.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${
                  isOn
                    ? "border-violet-500 bg-violet-500/10"
                    : dark ? "border-white/10 hover:border-white/20" : "border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <span className="w-10 h-10 flex items-center justify-center shrink-0">
                  <span
                    className={`block rounded-[3px] ${isOn ? "bg-violet-500" : dark ? "bg-zinc-700" : "bg-zinc-300"}`}
                    style={{ width: w, height: h }}
                  />
                </span>
                <span className="flex-1 min-w-0">
                  <span className={`block text-[12px] leading-tight ${dark ? "text-zinc-200" : "text-zinc-800"}`}>
                    {format.label}{isCurrent ? " (current)" : ""}
                  </span>
                  <span className={`block text-[10px] ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                    {format.width} × {format.height}
                  </span>
                </span>
                {isOn && <Check size={14} strokeWidth={2.5} className="text-violet-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className={`px-5 pb-5 pt-1`}>
          <button
            onClick={apply}
            disabled={selected.size === 0}
            className={`w-full py-3 rounded-xl text-[13px] font-medium transition-all ${
              selected.size === 0
                ? dark ? "bg-white/5 text-zinc-600" : "bg-zinc-100 text-zinc-400"
                : dark ? "bg-white text-zinc-900 hover:bg-zinc-100" : "bg-zinc-900 text-white hover:bg-zinc-800"
            }`}
          >
            {selected.size === 0 ? "select a size" : `create ${selected.size} new ${selected.size === 1 ? "size" : "sizes"}`}
          </button>
          <p className={`text-[11px] mt-3 text-center ${dark ? "text-zinc-600" : "text-zinc-400"}`}>
            each becomes a new editable page, your original stays untouched.
          </p>
        </div>
      </div>
    </div>
  );
};
