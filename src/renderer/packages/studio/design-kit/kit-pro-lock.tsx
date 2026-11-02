import React from "react";
import { Lock } from "lucide-react";
import { openBrandKitUpgrade } from "@bitgrain/platform/plans/gate/pro-features/brand-kit-gate";

interface KitProLockProps {
  title: string;
  detail: string;
  trigger: string;
}

const KitProBadge: React.FC = () => (
  <span className="inline-flex items-center gap-1 h-[18px] px-1.5 rounded-md bg-[var(--s-bg-input)] text-[11px] font-medium text-[var(--s-text-muted)]">
    <Lock size={10} strokeWidth={2} />
    Pro
  </span>
);

export const KitProLock: React.FC<KitProLockProps> = ({ title, detail, trigger }) => (
  <button
    type="button"
    onClick={() => openBrandKitUpgrade(trigger)}
    className="w-full flex items-start gap-2 text-left px-3 py-2.5 border-t border-[var(--s-border)] hover:bg-[var(--s-bg-input)] transition-colors"
  >
    <span className="flex-1 min-w-0 flex flex-col gap-0.5">
      <span className="text-[12px] font-semibold text-[var(--s-text-muted)]">{title}</span>
      <span className="text-[11px] leading-snug text-[var(--s-text-subtle)]">{detail}</span>
    </span>
    <KitProBadge />
  </button>
);
