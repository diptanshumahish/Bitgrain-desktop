import React, { useRef, useState } from "react";

interface ColorChipProps {
  hex: string;
  selected?: boolean;
  onSelect?: () => void;
  size?: number;
  label?: boolean;
}

export const ColorChip: React.FC<ColorChipProps> = ({ hex, selected, onSelect, size = 30, label = true }) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(0);

  const handle = () => {
    if (onSelect) onSelect();
    navigator.clipboard.writeText(hex).catch(() => {});
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1000);
  };

  return (
    <button onClick={handle} title={`Copy ${hex}`} className="flex flex-col items-center gap-1 group">
      <span
        className={`rounded-lg transition-all ${
          selected
            ? "ring-2 ring-[var(--s-accent)] ring-offset-2 ring-offset-[var(--s-bg-panel)]"
            : "border border-black/10 dark:border-white/15"
        }`}
        style={{ background: hex, width: size, height: size }}
      />
      {label && (
        <span className="font-mono text-[9px] text-[var(--s-text-subtle)] group-hover:text-[var(--s-text)] transition-colors">
          {copied ? "copied" : hex}
        </span>
      )}
    </button>
  );
};
