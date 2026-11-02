import React, { useEffect } from "react";
import { Check, X } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { userSignal } from "../../auth/use-auth";
import { trackEvent } from "../../tracker";
import { UPGRADE_COPY, UPGRADE_PERKS, type UpgradeFeature } from "./upgrade-copy";
import { openPlansInNewTab } from "./upgrade-actions";
import { Button } from "@bitgrain/ui/components/Button";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";
import { useEscapeClose } from "@bitgrain/ui/overlays/use-escape-close";
import { ExportPackButton } from "../../billing/export-pack/ExportPackButton";

interface UpgradePromptModalProps {
  feature: UpgradeFeature;
  onClose: () => void;
}

export const UpgradePromptModal: React.FC<UpgradePromptModalProps> = ({ feature, onClose }) => {
  const user = useSignalValue(userSignal);
  const copy = UPGRADE_COPY[feature];

  useEffect(() => {
    trackEvent("payment", "upgrade_prompt_shown", { details: { feature, signed_in: Boolean(user) } });
  }, [user, feature]);

  useEscapeClose(true, onClose);

  return (
    <div
      className={`fixed inset-0 ${MODAL_LAYER} flex items-center justify-center p-4 bg-[rgba(10,12,18,0.45)] backdrop-blur-[3px] animate-in fade-in duration-150`}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="upgrade-title" className="relative w-full max-w-[400px] rounded-2xl bg-[var(--s-bg-panel)] border border-[var(--s-border)] font-editorial">
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center rounded-lg text-[var(--s-text-subtle)] hover:text-[var(--s-text)]">
          <X size={16} strokeWidth={2} />
        </button>
        <div className="px-6 pt-6 pb-5 flex flex-col gap-4">
          <div className="pr-10">
            <h2 id="upgrade-title" className="text-[18px] font-semibold text-[var(--s-text)] leading-tight">{copy.title}</h2>
            <p className="mt-1.5 text-[13px] leading-snug text-[var(--s-text-muted)]">{copy.detail}</p>
          </div>
          <ul className="flex flex-col gap-2">
            {UPGRADE_PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-2 text-[13px] text-[var(--s-text)]">
                <Check size={14} strokeWidth={2.5} className="mt-0.5 shrink-0 text-[var(--s-accent)]" />
                {perk}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2">
            <Button variant="primary" size="lg" fullWidth onClick={() => openPlansInNewTab(feature)}>
              See plans in a new tab
            </Button>
            {feature === "watermark" && <ExportPackButton trigger="upgrade_prompt" className="mb-1" />}
            <Button variant="ghost" size="lg" fullWidth onClick={onClose}>
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
