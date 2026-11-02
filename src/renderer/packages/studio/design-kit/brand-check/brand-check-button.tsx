import React from "react";
import { CircleCheck, CircleAlert, Lock } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { emitPopover } from "@bitgrain/ui/overlays/popover-events";
import { openBrandKitUpgrade, useBrandKitPro } from "@bitgrain/platform/plans/gate/pro-features/brand-kit-gate";
import { studioPagesSignal } from "../../state/studio-document-store";
import { useActiveKit } from "../../state/design-kits-store";
import { scanBrand } from "./scan-brand";
import { BrandCheckPopover } from "./brand-check-popover";

const BUTTON_CLASS =
  "flex items-center gap-1.5 px-2 h-7 rounded-md border-none cursor-pointer text-[12px] font-medium bg-transparent transition-colors hover:bg-[var(--s-bg-input)]";

const openBrandCheck = (event: React.MouseEvent<HTMLButtonElement>): void => {
  emitPopover({
    type: "tool-dropdown",
    anchorRect: event.currentTarget.getBoundingClientRect(),
    preferBelow: true,
    content: <BrandCheckPopover />,
  });
};

const LockedBrandCheck: React.FC = () => (
  <button
    type="button"
    title="Brand check is part of Pro"
    onClick={() => openBrandKitUpgrade("brand_check")}
    className={`${BUTTON_CLASS} text-[var(--s-text-subtle)] hover:text-[var(--s-text)]`}
  >
    <Lock size={12} strokeWidth={1.75} />
    <span className="hidden xl:inline">On brand</span>
  </button>
);

const BrandCheckStatus: React.FC = () => {
  const pages = useSignalValue(studioPagesSignal);
  const kit = useActiveKit();
  const { offBrandLayerCount } = scanBrand(pages, kit);
  const onBrand = offBrandLayerCount === 0;
  const label = onBrand ? "On brand" : `${offBrandLayerCount} off brand`;
  return (
    <button
      type="button"
      title={onBrand ? "Everything matches your kit" : "See what doesn't match your kit"}
      onClick={openBrandCheck}
      className={`${BUTTON_CLASS} ${onBrand ? "text-[var(--s-text-muted)] hover:text-[var(--s-text)]" : "text-[var(--s-text)]"}`}
    >
      {onBrand ? <CircleCheck size={13} strokeWidth={1.75} /> : <CircleAlert size={13} strokeWidth={1.75} className="text-amber-500" />}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
};

export const BrandCheckButton: React.FC = () => {
  const isPro = useBrandKitPro();
  const kit = useActiveKit();
  if (!kit) return null;
  return isPro ? <BrandCheckStatus /> : <LockedBrandCheck />;
};
