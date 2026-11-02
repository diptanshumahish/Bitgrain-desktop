import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { EXPORT_PACK_SIZE } from "../../plans/plan-limits";
import { buyExportPack, exportPackCheckoutBusySignal } from "./buy-export-pack";
import { useExportPackOffer } from "./use-export-pack-offer";
import { OrDivider } from "./OrDivider";
import { userSignal } from "../../auth/use-auth";
import { GuestPackEmailForm } from "./guest/GuestPackEmailForm";
import { guestPackFormOpenSignal } from "./guest/guest-pack-state";

interface ExportPackButtonProps {
  trigger: string;
  compact?: boolean;
  leadingDivider?: boolean;
  emphasis?: boolean;
  className?: string;
}

const ROOMY_CLASSES = { row: "px-4 py-3 gap-3", title: "text-[14px]", detail: "text-[12px]", price: "text-[13px] px-2.5 h-7" };
const COMPACT_CLASSES = { row: "px-2.5 py-2 gap-2", title: "text-[11px]", detail: "text-[9px]", price: "text-[11px] px-2 h-6" };

const QUIET_TONE = {
  row: "border border-[var(--s-border)] bg-transparent hover:border-[var(--s-border-strong)] hover:bg-[var(--s-accent-soft)] transition-colors",
  title: "text-[var(--s-text)]",
  detail: "text-[var(--s-text-muted)]",
  price: "bg-[var(--s-accent)] text-[var(--s-accent-text)]",
};
const EMPHASIS_TONE = {
  row: "border border-transparent bg-[var(--s-accent)] hover:opacity-90 transition-opacity",
  title: "text-[var(--s-accent-text)]",
  detail: "text-[var(--s-accent-text)] opacity-75",
  price: "bg-[var(--s-accent-text)] text-[var(--s-accent)]",
};

export const ExportPackButton: React.FC<ExportPackButtonProps> = ({ trigger, compact = false, leadingDivider = true, emphasis = false, className = "" }) => {
  const offer = useExportPackOffer();
  const busy = useSignalValue(exportPackCheckoutBusySignal);
  const signedIn = Boolean(useSignalValue(userSignal));
  const guestFormOpen = useSignalValue(guestPackFormOpenSignal);
  if (!offer.available) return null;
  const sizes = compact ? COMPACT_CLASSES : ROOMY_CLASSES;
  const tone = emphasis ? EMPHASIS_TONE : QUIET_TONE;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {leadingDivider && <OrDivider compact={compact} />}
      <button
        type="button"
        disabled={busy}
        onClick={() => void buyExportPack(trigger)}
        className={`group flex items-center justify-between w-full rounded-lg text-left disabled:opacity-50 disabled:pointer-events-none ${tone.row} ${sizes.row}`}
      >
        <span className="flex flex-col gap-0.5">
          <span className={`font-medium leading-tight ${tone.title} ${sizes.title}`}>
            {busy ? "Opening checkout…" : `Just need a few? ${EXPORT_PACK_SIZE} clean exports`}
          </span>
          <span className={`leading-snug ${tone.detail} ${sizes.detail}`}>
            One payment, no subscription, no watermark
          </span>
        </span>
        <span className={`shrink-0 inline-flex items-center rounded-md font-semibold ${tone.price} ${sizes.price}`}>
          {offer.price}
        </span>
      </button>
      {!signedIn && guestFormOpen && <GuestPackEmailForm trigger={trigger} price={offer.price} />}
    </div>
  );
};
