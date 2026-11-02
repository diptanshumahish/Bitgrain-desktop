import React from "react";
import { X } from "lucide-react";
import type { TemplateDef } from "@bitgrain/studio-core/model/studio-types";
import type { ActivePreview } from "../preview-portal/template-preview-store";
import { PreviewRender } from "./PreviewRender";
import { PreviewDetails } from "./PreviewDetails";
import { MODAL_LAYER } from "@bitgrain/ui/overlays/layers/layer-order";

interface TemplatePreviewSheetProps {
  preview: ActivePreview;
  full: TemplateDef | null;
  onUse: () => void;
  onClose: () => void;
}

export const TemplatePreviewSheet: React.FC<TemplatePreviewSheetProps> = ({ preview, full, onUse, onClose }) => (
  <div className={`fixed inset-0 ${MODAL_LAYER} flex items-end justify-center font-display md:items-center md:p-6`}>
    <button
      type="button"
      aria-label="Close preview"
      onClick={onClose}
      className="absolute inset-0 cursor-default bg-ink-soft/55 backdrop-blur-sm dark:bg-black/70"
    />
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${preview.template.name} preview`}
      className="relative grid max-h-[94vh] w-full overflow-y-auto rounded-t-[24px] bg-white md:max-w-[1040px] md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] md:overflow-hidden md:rounded-[24px] dark:bg-night-card"
    >
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-ink-soft/70 backdrop-blur transition-colors hover:bg-ultramarine hover:text-white dark:bg-white/10 dark:text-white/70 dark:hover:bg-apricot dark:hover:text-ultramarine-deep"
      >
        <X size={17} strokeWidth={2.25} />
      </button>
      <div className="flex items-center justify-center bg-apricot bg-[radial-gradient(circle,rgba(58,63,216,0.14)_1px,transparent_1px)] bg-[size:16px_16px] p-6 pt-16 md:p-10 dark:bg-night-band dark:bg-[radial-gradient(circle,rgba(252,228,210,0.08)_1px,transparent_1px)]">
        <PreviewRender summary={preview.template} full={full} />
      </div>
      <div className="p-6 md:max-h-[94vh] md:overflow-y-auto md:p-9 md:pt-14">
        <PreviewDetails preview={preview} full={full} onUse={onUse} onClose={onClose} />
      </div>
    </div>
  </div>
);
