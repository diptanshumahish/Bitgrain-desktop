import React from "react";
import { X } from "lucide-react";
import type { TemplateDef } from "../../../data/studioTypes";
import type { ActivePreview } from "../../portal/template-preview/template-preview-store";
import { PreviewRender } from "./PreviewRender";
import { PreviewDetails } from "./PreviewDetails";

interface TemplatePreviewSheetProps {
  preview: ActivePreview;
  full: TemplateDef | null;
  onUse: () => void;
  onClose: () => void;
}

export const TemplatePreviewSheet: React.FC<TemplatePreviewSheetProps> = ({ preview, full, onUse, onClose }) => (
  <div className="fixed inset-0 z-[10001] flex items-end justify-center font-editorial md:items-center md:p-6">
    <button
      type="button"
      aria-label="Close preview"
      onClick={onClose}
      className="absolute inset-0 cursor-default bg-zinc-950/60 backdrop-blur-sm"
    />
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${preview.template.name} preview`}
      className="relative max-h-[94vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 pt-14 shadow-2xl md:max-w-[980px] md:rounded-2xl md:p-7 dark:bg-zinc-950"
    >
      <button
        type="button"
        aria-label="Close preview"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
      >
        <X size={18} />
      </button>
      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-center md:gap-8">
        <PreviewRender summary={preview.template} full={preview.locked ? null : full} />
        <PreviewDetails preview={preview} full={full} onUse={onUse} onClose={onClose} />
      </div>
    </div>
  </div>
);
