import React from "react";
import { Download } from "lucide-react";

const ICON_SIZE = 14;
const ICON_STROKE = 2;

type DownloadButtonTone = "primary" | "quiet";

const TONE_CLASSES: Record<DownloadButtonTone, string> = {
  primary: "bg-[var(--s-accent)] text-[var(--s-accent-text)] hover:opacity-90 transition-opacity",
  quiet: "border border-[var(--s-border)] text-[var(--s-text)] hover:border-[var(--s-border-strong)] hover:bg-[var(--s-accent-soft)] transition-colors",
};

const LABEL_WEIGHT: Record<DownloadButtonTone, string> = {
  primary: "font-semibold",
  quiet: "font-medium",
};

interface DownloadButtonProps {
  label: string;
  sizeLabel: string;
  tone: DownloadButtonTone;
  onClick: () => void;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({ label, sizeLabel, tone, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center justify-between gap-3 h-10 px-4 rounded-lg ${TONE_CLASSES[tone]}`}
  >
    <span className={`flex items-center gap-2 text-[13px] ${LABEL_WEIGHT[tone]}`}>
      <Download size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      {label}
    </span>
    <span className="text-[12px] font-medium opacity-75 tabular-nums">{sizeLabel}</span>
  </button>
);
