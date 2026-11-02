import React from "react";
import { resolveAssetUrl } from "@bitgrain/api/api-client";
import { useBrandKitPro } from "@bitgrain/platform/plans/gate/pro-features/brand-kit-gate";
import type { KitLogo } from "@bitgrain/studio-core/model/design-kit-types";
import { useActiveKit } from "../../state/design-kits-store";
import { logoRoleInfo } from "./kit-logo-store";
import { insertKitLogo } from "./insert-kit-logo";

const LogoTile: React.FC<{ logo: KitLogo }> = ({ logo }) => (
  <button
    type="button"
    title={`Add ${logoRoleInfo(logo.role).label.toLowerCase()} logo`}
    onClick={() => insertKitLogo(logo)}
    className={`h-16 rounded-lg border border-[var(--s-border)] flex items-center justify-center overflow-hidden hover:border-[var(--s-text-subtle)] transition-colors ${
      logo.role === "onDark" ? "bg-neutral-900" : "bg-[var(--s-bg-input)]"
    }`}
  >
    <img src={resolveAssetUrl(logo.src) ?? ""} alt={logoRoleInfo(logo.role).label} className="max-w-full max-h-full object-contain p-2" />
  </button>
);

export const KitLogosInsertSection: React.FC = () => {
  const kit = useActiveKit();
  const isPro = useBrandKitPro();
  const logos = kit?.logos ?? [];
  if (!isPro || logos.length === 0) return null;
  return (
    <section aria-label="Logos from your brand kit" className="flex flex-col gap-2 px-3.5 pt-3 pb-1">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-[11.5px] font-semibold text-[var(--s-text)]">Your logos</h3>
        <span className="text-[10.5px] text-[var(--s-text-subtle)] truncate">{kit?.name}</span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {logos.map((logo) => (
          <LogoTile key={logo.id} logo={logo} />
        ))}
      </div>
    </section>
  );
};
