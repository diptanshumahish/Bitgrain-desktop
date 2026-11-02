import React, { useEffect, useRef, useState } from "react";
import { OutputPreview } from "../../preview/OutputPreview";
import { LUTS } from "@bitgrain/engine/color/luts";
import { X } from "lucide-react";
import { Popover } from "@bitgrain/ui/controls/toolbar/Popover";
import { useSignalValue } from "@bitgrain/core/signal";
import { previewThumbSignal } from "../../state/preview-thumb-store";


interface LUTCardProps {
  lutId: string;
  name: string;
  image: string;
  active: boolean;
  onApply: () => void;
}

const LUTCard: React.FC<LUTCardProps> = ({
  lutId,
  name,
  image,
  active,
  onApply,
}) => {
  const [inView, setInView] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" },
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={cardRef}
      onClick={onApply}
      className={`group flex flex-col rounded-lg overflow-hidden border transition-all text-left bg-[var(--s-bg-panel)] ${
        active
          ? "border-[var(--s-accent)] ring-1 ring-[var(--s-accent-soft)]"
          : "border-[var(--s-border)] hover:border-[var(--s-accent)]"
      }`}
    >
      <div className="w-full overflow-hidden h-[110px] relative">
        {inView ? (
          <OutputPreview
            image={image}
            resolution={0.7}
            contrast={1.0}
            brightness={1.0}
            saturation={1.0}
            mode={["lut"]}
            lutId={lutId}
            isColor={true}
            fgColor="#000000"
            bgColor="#ffffff"
            compact
          />
        ) : (
          <div className="absolute inset-0 skeleton-shimmer" />
        )}
      </div>
      <div className="px-2 py-1.5 border-t border-[var(--s-border)]">
        <span
          className={`block text-[12px] font-semibold transition-colors truncate leading-tight ${active ? "text-[var(--s-accent)]" : "text-[var(--s-text)] group-hover:text-[var(--s-accent)]"}`}
        >
          {name}
        </span>
      </div>
    </button>
  );
};

interface LUTPopoverProps {
  activeLutId: string | null;
  onSelectLUT: (id: string | null) => void;
  onClose: () => void;
  static?: boolean;
}

export const LUTPopover: React.FC<LUTPopoverProps> = ({
  activeLutId,
  onSelectLUT,
  onClose,
  static: isStatic,
}) => {
  const thumb = useSignalValue(previewThumbSignal);
  return (
    <Popover
      onClose={onClose}
      className="w-[660px] left-1/2 -translate-x-1/2 max-w-[calc(100vw-32px)]"
      static={isStatic}
    >
      <div className={isStatic ? "" : "overflow-y-auto max-h-[min(540px,calc(100vh-120px))]"}>
        <div className="p-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[12px] font-semibold text-[var(--s-text)]">Film grade</p>
              <p className="text-[12px] text-[var(--s-text-subtle)] mt-0.5">
                Colour looks from classic film stocks. A grade takes the place of your effect. Free exports carry a watermark.
              </p>
            </div>
            {activeLutId && (
              <button
                onClick={() => {
                  onSelectLUT(null);
                  onClose();
                }}
                className="flex items-center gap-1 text-[12px] text-red-500 hover:text-red-600 transition-colors px-2 py-1 rounded-md hover:bg-red-400/10"
              >
                <X size={11} strokeWidth={2} /> Remove grade
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {LUTS.map((lut) => (
              <LUTCard
                key={`${lut.id}-${thumb.id}`}
                lutId={lut.id}
                name={lut.name}
                image={thumb.src}
                active={activeLutId === lut.id}
                onApply={() => onSelectLUT(lut.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </Popover>
  );
};
