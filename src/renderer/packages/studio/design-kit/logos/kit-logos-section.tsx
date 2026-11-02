import React from "react";
import type { DesignKit } from "@bitgrain/studio-core/model/design-kit-types";
import { useBrandKitPro } from "@bitgrain/platform/plans/gate/pro-features/brand-kit-gate";
import { KitProLock } from "../kit-pro-lock";
import { KIT_LOGO_ROLES } from "./kit-logo-store";
import { KitLogoSlot } from "./kit-logo-slot";

interface KitLogosSectionProps {
  kit: DesignKit;
}

export const KitLogosSection: React.FC<KitLogosSectionProps> = ({ kit }) => {
  const isPro = useBrandKitPro();
  if (!isPro) {
    return (
      <KitProLock
        title="Logos"
        detail="Keep your logo, mark and light version in the kit and drop them into any design in one click."
        trigger="kit_logos"
      />
    );
  }
  return (
    <div className="flex flex-col gap-1.5 px-3 py-2.5 border-t border-[var(--s-border)]">
      <span className="text-[12px] font-semibold text-[var(--s-text-muted)]">Logos</span>
      {KIT_LOGO_ROLES.map(({ role }) => (
        <KitLogoSlot key={role} kitId={kit.id} role={role} logo={kit.logos?.find((logo) => logo.role === role)} />
      ))}
    </div>
  );
};
