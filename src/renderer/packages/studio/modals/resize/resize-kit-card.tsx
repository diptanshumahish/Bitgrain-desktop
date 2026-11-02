import React from "react";
import { Disc3, LayoutGrid, type LucideIcon } from "lucide-react";
import type { ResizeKit } from "@bitgrain/studio-core/resize-formats/resize-kits";
import { ProLockBadge } from "./pro-lock-badge";

const KIT_ICON_SIZE = 18;

const KIT_ICONS: Record<string, LucideIcon> = {
  "social-kit": LayoutGrid,
  "release-kit": Disc3,
};

interface ResizeKitCardProps {
  kit: ResizeKit;
  isLocked: boolean;
  onPick: (kit: ResizeKit) => void;
}

export const ResizeKitCard: React.FC<ResizeKitCardProps> = ({ kit, isLocked, onPick }) => {
  const KitIcon = KIT_ICONS[kit.id] ?? LayoutGrid;
  return (
    <button
      type="button"
      onClick={() => onPick(kit)}
      className="flex items-center gap-3 rounded-lg border border-[var(--s-border)] p-3 text-left transition-colors hover:border-[var(--s-border-strong)] hover:bg-[var(--s-bg-input)]"
    >
      <KitIcon size={KIT_ICON_SIZE} strokeWidth={1.75} className="shrink-0 text-[var(--s-accent)]" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[12.5px] font-medium">{kit.label}</span>
        <span className="text-[11px] leading-snug text-[var(--s-text-muted)]">{kit.detail}</span>
      </span>
      {isLocked && <ProLockBadge />}
    </button>
  );
};
