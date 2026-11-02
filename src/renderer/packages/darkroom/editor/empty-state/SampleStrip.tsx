import React, { useRef } from "react";
import { EMPTY_STATE_SAMPLES } from "./empty-state-samples";
import { loadSampleImage } from "../upload/load-sample-image";
import { useEdgeFade, EDGE_FADE_CLASS } from "../../toolbar/mobile/use-edge-fade";

export const SampleStrip: React.FC = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  useEdgeFade(scrollerRef);

  return (
    <div className="mt-8 md:mt-7 self-stretch md:self-auto flex flex-col items-center gap-3">
      <p className="text-[13px] text-[var(--s-text-muted)]">no photo handy? start with one of ours</p>
      <div
        ref={scrollerRef}
        data-fade="none"
        className={`-mx-5 px-5 self-stretch flex items-center gap-2 overflow-x-auto no-scrollbar md:mx-0 md:px-0 md:self-auto md:gap-2 md:overflow-visible ${EDGE_FADE_CLASS}`}
      >
        {EMPTY_STATE_SAMPLES.map((sample) => (
          <button
            key={sample.src}
            type="button"
            onClick={() => loadSampleImage(sample.src)}
            aria-label={`Try the sample photo, ${sample.label}`}
            title={sample.label}
            className="shrink-0 w-[84px] md:w-14 aspect-[4/5] rounded-lg md:rounded-md overflow-hidden ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-150 md:hover:-translate-y-1 hover:ring-[var(--s-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 active:scale-95"
          >
            <img src={sample.thumb} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};
