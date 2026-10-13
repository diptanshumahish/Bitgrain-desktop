import React from "react";

const FRAME_SOURCES = ["/art/train-sm.webp", "/art/wind-sm.webp", "/art/dusk-sm.webp"];
const SPROCKET_CLASS =
  "h-1 w-full opacity-30 bg-[repeating-linear-gradient(90deg,var(--s-text)_0_5px,transparent_5px_11px)]";

export const VideoPreview: React.FC = () => (
  <div className="absolute inset-0 flex flex-col justify-center gap-2 px-4">
    <div className="rounded-md bg-black/60 px-1.5 py-1">
      <div className={SPROCKET_CLASS} />
      <div className="my-1 grid grid-cols-3 gap-1">
        {FRAME_SOURCES.map((source) => (
          <img key={source} src={source} alt="" className="aspect-video w-full rounded-[2px] object-cover" />
        ))}
      </div>
      <div className={SPROCKET_CLASS} />
    </div>
    <div className="relative h-1 rounded-full bg-[var(--s-border)]">
      <div className="absolute inset-y-0 left-0 w-[38%] rounded-full bg-[var(--s-accent)] transition-[width] duration-700 ease-out group-hover:w-[72%]" />
      <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--s-accent)] bg-white left-[38%] transition-[left] duration-700 ease-out group-hover:left-[72%]" />
    </div>
  </div>
);
