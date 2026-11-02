import React from "react";
import { Film, Pause } from "lucide-react";
import { LAYER_MOTIONS } from "./layer-motions";
import { TimelinePlayhead } from "./TimelinePlayhead";

const SECOND_MARKS = ["0s", "1s", "2s", "3s", "4s", "5s"];
const KEY_DIAMOND = "absolute top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 rounded-[1px] bg-ultramarine";

export const AnimationTimeline: React.FC = () => (
  <div className="flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white text-left text-ink-soft shadow-[0_40px_80px_-30px_rgba(20,18,90,0.55)]">
    <div className="flex h-11 shrink-0 items-center justify-between border-b border-stone px-4">
      <span className="flex items-center gap-2 text-[12px] text-ink-soft/70">
        <Pause size={13} className="text-ink-soft/50" />
        Timeline, 5.0s loop
      </span>
      <span className="flex items-center gap-1.5 rounded-lg bg-ultramarine px-3 py-1.5 text-[12px] font-medium text-white">
        <Film size={13} />
        Export MP4
      </span>
    </div>
    <div className="flex flex-1 flex-col gap-2.5 px-4 py-4">
      <div className="ml-28 flex justify-between text-[10px] text-ink-soft/40">
        {SECOND_MARKS.map((mark) => (
          <span key={mark}>{mark}</span>
        ))}
      </div>
      <div className="relative flex flex-col gap-2.5">
        {LAYER_MOTIONS.map((motion) => (
          <div key={motion.rowId} className="flex items-center gap-3">
            <span className="w-25 shrink-0 truncate text-[11.5px] text-ink-soft/70">{motion.label}</span>
            <span className="relative h-6 flex-1 rounded bg-stone/50">
              <span className={`absolute inset-y-1 rounded bg-ultramarine/20 ring-1 ring-ultramarine/60 ${motion.barClass}`}>
                <span className={`${KEY_DIAMOND} -left-1`} />
                <span className={`${KEY_DIAMOND} -right-1`} />
              </span>
            </span>
          </div>
        ))}
        <span className="pointer-events-none absolute inset-y-0 left-28 right-0">
          <TimelinePlayhead />
        </span>
      </div>
    </div>
    <div className="flex h-10 shrink-0 items-center gap-4 border-t border-stone px-4 text-[11px] text-ink-soft/55">
      <span>MP4, GIF or WebM</span>
      <span>Up to 4K, 60 fps</span>
      <span className="ml-auto">Rendered in your browser</span>
    </div>
  </div>
);
