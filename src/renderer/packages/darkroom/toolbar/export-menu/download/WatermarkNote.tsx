import React from "react";
import { emitPlatformModal } from "@bitgrain/platform/modals/platform-modal-events";

interface WatermarkNoteProps {
  onClose: () => void;
}

const openUpgrade = (onClose: () => void): void => {
  emitPlatformModal({ type: "upgrade-prompt", feature: "watermark" });
  onClose();
};

export const WatermarkNote: React.FC<WatermarkNoteProps> = ({ onClose }) => (
  <p className="m-0 text-[12px] leading-snug text-[var(--s-text-subtle)]">
    Free downloads carry a watermark across the image.{" "}
    <button
      type="button"
      onClick={() => openUpgrade(onClose)}
      className="font-medium text-[var(--s-text)] underline underline-offset-2 decoration-[var(--s-border)] hover:decoration-[var(--s-text)] transition-colors"
    >
      Unlimited clean exports with Pro
    </button>
  </p>
);
