import React from "react";
import {
  ArrowLeftToLine,
  FoldHorizontal,
  ArrowRightToLine,
  ArrowUpToLine,
  UnfoldVertical,
  ArrowDownToLine,
} from "lucide-react";

interface AlignRowProps {
  onAlign: (alignment: string) => void;
}

const ICON_SIZE = 16;
const ICON_STROKE = 1.5;

const HORIZONTAL_ALIGNMENTS = [
  { value: "left", title: "Align left", icon: ArrowLeftToLine },
  { value: "center", title: "Align center", icon: FoldHorizontal },
  { value: "right", title: "Align right", icon: ArrowRightToLine },
];

const VERTICAL_ALIGNMENTS = [
  { value: "top", title: "Align top", icon: ArrowUpToLine },
  { value: "bottom", title: "Align bottom", icon: ArrowDownToLine },
  { value: "middle", title: "Align middle", icon: UnfoldVertical },
];

const AlignButton: React.FC<{
  value: string;
  title: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  onAlign: (alignment: string) => void;
}> = ({ value, title, icon: Icon, onAlign }) => (
  <button
    type="button"
    title={title}
    onClick={() => onAlign(value)}
    className="w-8 h-8 flex items-center justify-center rounded-md text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors"
  >
    <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
  </button>
);

export const AlignRow: React.FC<AlignRowProps> = ({ onAlign }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-1">
      {HORIZONTAL_ALIGNMENTS.map((item) => (
        <AlignButton key={item.value} onAlign={onAlign} {...item} />
      ))}
    </div>
    <div className="flex items-center gap-1">
      {VERTICAL_ALIGNMENTS.map((item) => (
        <AlignButton key={item.value} onAlign={onAlign} {...item} />
      ))}
    </div>
  </div>
);
