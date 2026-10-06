import React, { useEffect, useState } from "react";

type ConversionFormat = "heic" | "raw" | "tiff";

interface Props {
  done: boolean;
  format?: ConversionFormat;
}

const FORMAT_TITLE: Record<ConversionFormat, string> = {
  heic: "Converting HEIC image",
  raw: "Converting RAW image",
  tiff: "Converting TIFF image",
};

const FORMAT_SUB: Record<ConversionFormat, string> = {
  heic: "Decoding Apple format to JPEG",
  raw: "Decoding camera RAW to JPEG",
  tiff: "Decoding TIFF to JPEG",
};

const HIDE_DELAY_MS = 600;
const RAMP_DURATION_MS = 2000;
const RAMP_TARGET_PERCENT = 82;
const FULL_PERCENT = 100;
const EASING_POWER = 3;

export const HeicToast: React.FC<Props> = ({ done, format = "heic" }) => {
  const [rampProgress, setRampProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const progress = done ? FULL_PERCENT : rampProgress;

  useEffect(() => {
    if (done) {
      const hideTimer = setTimeout(() => setVisible(false), HIDE_DELAY_MS);
      return () => clearTimeout(hideTimer);
    }

    let start: number | null = null;
    let raf: number;

    const tick = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const ratio = elapsed / RAMP_DURATION_MS;
      const eased = 1 - Math.pow(1 - Math.min(ratio, 1), EASING_POWER);
      setRampProgress(Math.round(eased * RAMP_TARGET_PERCENT));
      if (elapsed < RAMP_DURATION_MS) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done]);

  if (!visible) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 bg-white border border-zinc-100 rounded-xl px-4 py-3 min-w-[260px] animate-in fade-in slide-in-from-top-2 duration-200 font-editorial">
      <div className="flex items-center gap-2.5">
        {/* Spinning glyph */}
        <span
          className="text-[var(--s-accent)] text-[15px]   leading-none select-none animate-spin [animation-duration:1.5s]"
        >
          ◌
        </span>
        <div>
          <p className="text-[12px] font-semibold text-zinc-800">
            {done ? "Conversion complete" : FORMAT_TITLE[format]}
          </p>
          <p className="text-[10px] text-zinc-400">
            {done ? "Loading your photo…" : FORMAT_SUB[format]}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[var(--s-accent)] rounded-full transition-all"
          style={{
            width: `${progress}%`,
            transitionDuration: done ? "200ms" : "80ms",
          }}
        />
      </div>
    </div>
  );
};
