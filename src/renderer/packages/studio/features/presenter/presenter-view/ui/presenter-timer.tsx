import React, { useEffect, useRef } from "react";
import { RotateCcw } from "lucide-react";
import { formatElapsed } from "./format-elapsed";

interface PresenterTimerProps {
  startedAt: number;
}

const TICK_MS = 500;

export const PresenterTimer: React.FC<PresenterTimerProps> = ({ startedAt }) => {
  const startRef = useRef(startedAt);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (startedAt) startRef.current = startedAt;
  }, [startedAt]);

  useEffect(() => {
    if (!startRef.current) startRef.current = Date.now();
    const tick = (): void => {
      if (labelRef.current) labelRef.current.textContent = formatElapsed(Date.now() - startRef.current);
    };
    tick();
    const timer = window.setInterval(tick, TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  const reset = (): void => {
    startRef.current = Date.now();
    if (labelRef.current) labelRef.current.textContent = formatElapsed(0);
  };

  return (
    <div className="flex items-center gap-2">
      <span ref={labelRef} aria-label="Time elapsed" className="text-[22px] font-medium tabular-nums text-white" />
      <button
        type="button"
        onClick={reset}
        aria-label="Restart timer"
        className="w-7 h-7 flex items-center justify-center rounded-md bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
      >
        <RotateCcw size={13} strokeWidth={1.75} />
      </button>
    </div>
  );
};
