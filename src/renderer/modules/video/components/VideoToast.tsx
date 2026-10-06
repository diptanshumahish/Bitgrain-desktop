import React, { useEffect, useState } from "react";
import { useSignalValue } from "../../../lib/signal";
import { videoToastSignal, clearToast } from "../utils/video-toast";

const VISIBLE_MS = 2600;

// Renders the transient message emitted by keyboard and palette edits. Sits
// above the timeline rather than over the preview, so it never covers the frame
// the user is judging.
export const VideoToast: React.FC = () => {
  const toast = useSignalValue(videoToastSignal);
  const [shown, setShown] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) {
      setShown(null);
      return;
    }
    setShown(toast.message);
    const id = setTimeout(clearToast, VISIBLE_MS);
    return () => clearTimeout(id);
    // The nonce is what makes a repeat of the same message re-trigger.
  }, [toast?.nonce, toast?.message, toast]);

  if (!toast || !shown) return null;

  return (
    <div
      role="status"
      className="pointer-events-none absolute bottom-[92px] left-1/2 z-[90] -translate-x-1/2 rounded-md border border-[var(--s-border)] bg-[var(--s-bg-panel)]/95 px-3 py-1.5 text-[11px] text-[var(--s-text)] shadow-lg backdrop-blur-sm"
    >
      {shown}
    </div>
  );
};
