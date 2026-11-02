import React, { useEffect } from "react";
import { X, Check } from "lucide-react";
import { Button } from "@bitgrain/ui/components/Button";
import { useSignalValue } from "@bitgrain/core/signal";
import { themeSignal } from "@bitgrain/ui/theme/global-theme-store";
import { userSignal } from "../../auth/use-auth";
import { emitPlatformModal } from "../platform-modal-events";
import { trackEvent } from "../../tracker";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";
import { useEscapeClose } from "@bitgrain/ui/overlays/use-escape-close";
import { ExportPackButton } from "../../billing/export-pack/ExportPackButton";

interface PostExportUpgradeProps {
  requestedLongEdge: number;
  deliveredLongEdge: number;
  onClose: () => void;
}

const UNLOCKS = [
  "The same export, without the watermark",
  "Full source resolution, no cap",
  "SVG vector, Lottie, 4K video and batch export",
];

export const PostExportUpgrade: React.FC<PostExportUpgradeProps> = ({
  requestedLongEdge,
  deliveredLongEdge,
  onClose,
}) => {
  const dark = useSignalValue(themeSignal) === "dark";
  const user = useSignalValue(userSignal);
  const wasClamped = requestedLongEdge > deliveredLongEdge;

  useEffect(() => {
    trackEvent("payment", "post_export_prompt_shown", {
      details: {
        requested_long_edge: requestedLongEdge,
        delivered_long_edge: deliveredLongEdge,
        was_clamped: wasClamped,
        signed_in: Boolean(user),
      },
    });
  }, [user, requestedLongEdge, deliveredLongEdge, wasClamped]);

  const handleSeePricing = (): void => {
    trackEvent("payment", "modal_opened", { details: { trigger: "post_export" } });
    onClose();
    emitPlatformModal({ type: "studio-payment" });
  };

  const handleDismiss = (): void => {
    trackEvent("payment", "post_export_dismissed", { details: { signed_in: Boolean(user) } });
    onClose();
  };

  useEscapeClose(true, handleDismiss);

  return (
    <div
      className={`fixed inset-0 ${MODAL_LAYER} flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-150`}
      onClick={(e) => e.target === e.currentTarget && handleDismiss()}
    >
      <div
        className={`w-full max-w-[95vw] sm:max-w-sm rounded-md animate-in fade-in slide-in-from-bottom-3 duration-200 font-sans border ${dark ? "bg-[#141414] border-white/10" : "bg-white border-black/5"}`}
      >
        <div className={`flex items-start justify-between px-6 pt-6 pb-4 border-b ${dark ? "border-white/5" : "border-black/5"}`}>
          <div>
            <h2 className={`text-[19px] font-medium leading-tight ${dark ? "text-white" : "text-zinc-900"}`}>
              Your file is downloading
            </h2>
            <p className={`text-[12px] mt-1.5 leading-snug ${dark ? "text-zinc-500" : "text-zinc-500"}`}>
              {wasClamped
                ? `It has a watermark, and we scaled it down to ${deliveredLongEdge}px from ${requestedLongEdge}px.`
                : "It has a watermark on it."}
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={handleDismiss}
            className={`w-8 h-8 shrink-0 flex items-center justify-center rounded-lg transition-all ${dark ? "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300" : "text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"}`}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="px-6 py-5">
          <ul className="flex flex-col gap-2.5">
            {UNLOCKS.map((unlock) => (
              <li key={unlock} className="flex items-start gap-2.5">
                <Check size={14} strokeWidth={2.5} className={`mt-0.5 shrink-0 ${dark ? "text-violet-400" : "text-violet-500"}`} />
                <span className={`text-[13px] leading-snug ${dark ? "text-zinc-300" : "text-zinc-700"}`}>
                  {unlock}
                </span>
              </li>
            ))}
          </ul>

          <Button variant="primary" size="lg" fullWidth className="mt-6" onClick={handleSeePricing}>
            Unlock clean exports
          </Button>

          <ExportPackButton trigger="post_export" className="mt-3" />

          <Button variant="ghost" size="sm" fullWidth className="mt-3" onClick={handleDismiss}>
            Keep the watermark for now
          </Button>

          <a
            href="/pricing"
            target="_blank"
            rel="noopener noreferrer"
            className={`block text-center text-[11px] no-underline transition-colors ${dark ? "text-zinc-500 hover:text-zinc-300" : "text-zinc-400 hover:text-zinc-600"}`}
          >
            Compare plans
          </a>
        </div>
      </div>
    </div>
  );
};
