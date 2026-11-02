import React from "react";
import { EMPTY_STATE_SAMPLES } from "./empty-state-samples";
import { loadSampleImage } from "../upload/load-sample-image";

export const SampleStrip: React.FC = () => (
  <div className="mt-7 flex flex-col items-center gap-3">
    <p className="text-[13px] text-[var(--s-text-muted)]">no photo handy? start with one of ours</p>
    <div className="flex items-center gap-1.5 md:gap-2">
      {EMPTY_STATE_SAMPLES.map((sample) => (
        <button
          key={sample.src}
          type="button"
          onClick={() => loadSampleImage(sample.src)}
          aria-label={`Try the sample photo, ${sample.label}`}
          title={sample.label}
          className="w-11 md:w-14 aspect-[4/5] rounded-md overflow-hidden ring-1 ring-black/5 dark:ring-white/10 transition-transform duration-150 hover:-translate-y-1 hover:ring-[var(--s-border-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 active:scale-95"
        >
          <img src={sample.thumb} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
        </button>
      ))}
    </div>
  </div>
);
