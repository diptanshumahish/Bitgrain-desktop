import React from "react";
import type { DesignKit } from "@bitgrain/studio-core/model/design-kit-types";
import { useBrandKitPro } from "@bitgrain/platform/plans/gate/pro-features/brand-kit-gate";
import { Toggle } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { KitProLock } from "../kit-pro-lock";
import { setKitAutoApply } from "./kit-auto-apply-store";

interface AutoApplyToggleProps {
  kit: DesignKit;
}

const TOGGLE_LABEL = "Use this kit for new designs";

export const AutoApplyToggle: React.FC<AutoApplyToggleProps> = ({ kit }) => {
  const isPro = useBrandKitPro();
  if (!isPro) {
    return (
      <KitProLock
        title={TOGGLE_LABEL}
        detail="Templates and new designs pick up your colors, fonts and logo as they open."
        trigger="kit_auto_apply"
      />
    );
  }
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border-t border-[var(--s-border)]">
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-[12px] font-semibold text-[var(--s-text-muted)]">{TOGGLE_LABEL}</span>
        <span className="text-[11px] leading-snug text-[var(--s-text-subtle)]">
          Templates open in your colors, fonts and logo. One undo brings back the original.
        </span>
      </div>
      <Toggle value={kit.autoApply === true} onChange={(enabled) => setKitAutoApply(kit.id, enabled)} label={TOGGLE_LABEL} />
    </div>
  );
};
