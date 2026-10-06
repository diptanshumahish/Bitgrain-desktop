import React, { useState, useEffect, useRef } from "react";
import { OutputPreview } from "../../OutputPreview";
import type { Preset } from "../../../engine/presets";

const frozenCache = new Map<string, string>();

const PresetCardSkeleton: React.FC = () => (
  <div className="absolute inset-0 skeleton-shimmer" />
);

interface PresetCardProps {
  preset: Preset;
  image: string;
  onApply: () => void;
}

export const PresetCard: React.FC<PresetCardProps> = ({
  preset,
  image,
  onApply,
}) => {
  const [frozenSrc, setFrozenSrc] = useState<string | null>(
    frozenCache.get(preset.name) ?? null,
  );
  const [inView, setInView] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (frozenSrc) return;
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
  }, [frozenSrc]);

  const handleRender = (dataUrl: string) => {
    frozenCache.set(preset.name, dataUrl);
    setFrozenSrc(dataUrl);
  };

  // Cap resolution for thumbnails to avoid huge compute
  const thumbResolution = Math.min(preset.config.resolution, 0.7);

  return (
    <button
      ref={cardRef}
      onClick={onApply}
      className="group flex flex-col rounded-lg overflow-hidden border border-[var(--s-border)] hover:border-[var(--s-accent)] hover: transition-all text-left bg-[var(--s-bg-panel)]"
    >
      <div className="w-full overflow-hidden h-[130px] relative">
        {frozenSrc ? (
          <img
            src={frozenSrc}
            alt={preset.name}
            draggable={false}
            className="w-full h-full object-cover"
          />
        ) : inView ? (
          <>
            <OutputPreview
              image={image}
              resolution={thumbResolution}
              contrast={preset.config.contrast}
              brightness={preset.config.brightness}
              saturation={preset.config.saturation}
              mode={preset.config.modes}
              ditherMethod={preset.config.ditherMethod}
              ditherFactor={preset.config.ditherFactor}
              isColor={preset.config.isColor}
              noise={preset.config.grain}
              hue={preset.config.hue}
              palette={preset.config.palette ?? undefined}
              halftoneCell={preset.config.halftoneCell}
              halftoneAngle={preset.config.halftoneAngle}
              halftoneStyle={preset.config.halftoneStyle}
              halftoneInvert={preset.config.halftoneInvert}
              fgColor="#000000"
              bgColor="#fdf6e3"
              compact
              onRender={handleRender}
            />
            <PresetCardSkeleton />
          </>
        ) : (
          <PresetCardSkeleton />
        )}
      </div>
      <div className="px-2 py-1.5 flex items-center justify-between gap-1 border-t border-[var(--s-border)]">
        <span className="text-[10px] font-semibold text-[var(--s-text)] group-hover:text-[var(--s-accent)] transition-colors truncate leading-none">
          {preset.name}
        </span>
        <span className="text-[9px]   text-[var(--s-text-subtle)] shrink-0 leading-none">
          {preset.tag}
        </span>
      </div>
    </button>
  );
};
