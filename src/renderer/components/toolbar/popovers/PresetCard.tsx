import React, { useState, useEffect, useRef } from "react";
import { OutputPreview } from "../../OutputPreview";
import type { Preset } from "../../../engine/presets";
import { useSignalValue } from "../../../lib/signal";
import { paperColorSignal } from "../../../store/transform-store";

const frozenCache = new Map<string, string>();
const THUMB_RESOLUTION_CAP = 2;
const THUMB_PAPER = "#fdf6e3";
const THUMB_INK = "#000000";

const PresetCardSkeleton: React.FC = () => (
  <div className="absolute inset-0 skeleton-shimmer" />
);

interface PresetCardProps {
  preset: Preset;
  image: string;
  onApply: () => void;
  small?: boolean;
}

export const PresetCard: React.FC<PresetCardProps> = ({
  preset,
  image,
  onApply,
  small = false,
}) => {
  const paperColor = useSignalValue(paperColorSignal);
  const cacheKey = `${preset.name}|${image}|${paperColor ?? "auto"}`;
  const [, setFrozenVersion] = useState(0);
  const frozenSrc = frozenCache.get(cacheKey) ?? null;
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
    frozenCache.set(cacheKey, dataUrl);
    setFrozenVersion((version) => version + 1);
  };

  const thumbResolution = Math.min(preset.config.resolution, THUMB_RESOLUTION_CAP);

  return (
    <button
      ref={cardRef}
      onClick={onApply}
      className="group w-full min-w-0 flex flex-col rounded-lg overflow-hidden border border-[var(--s-border)] hover:border-[var(--s-accent)] hover: transition-all text-left bg-[var(--s-bg-panel)]"
    >
      <div className={`w-full overflow-hidden relative ${small ? "aspect-square" : "h-[130px]"}`}>
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
              halftoneLines={preset.config.halftoneLines}
              halftoneAngle={preset.config.halftoneAngle}
              halftoneStyle={preset.config.halftoneStyle}
              halftoneInvert={preset.config.halftoneInvert}
              halftoneGrit={preset.config.halftoneGrit}
              paperColor={paperColor}
              asciiCharset={preset.config.asciiCharset}
              asciiTone={preset.config.asciiTone}
              asciiDensity={preset.config.asciiDensity}
              asciiEdges={preset.config.asciiEdges}
              asciiEdgeThreshold={preset.config.asciiEdgeThreshold}
              contourLevels={preset.config.contourLevels}
              contourFill={preset.config.contourFill}
              fgColor={THUMB_INK}
              bgColor={paperColor ?? THUMB_PAPER}
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
        <span className="text-[12px] font-semibold text-[var(--s-text)] group-hover:text-[var(--s-accent)] transition-colors truncate leading-none">
          {preset.name}
        </span>
        {!small && (
          <span className="text-[12px] text-[var(--s-text-subtle)] shrink-0 leading-none">
            {preset.tag}
          </span>
        )}
      </div>
    </button>
  );
};
