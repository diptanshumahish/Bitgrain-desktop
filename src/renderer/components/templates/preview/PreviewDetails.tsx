import React from "react";
import { ArrowRight } from "lucide-react";
import type { TemplateDef } from "../../../data/studioTypes";
import { categoryLabel } from "../../../data/templates/categories";
import { describeTemplateSize } from "../../../data/templates/size-names";
import type { ActivePreview } from "../../portal/template-preview/template-preview-store";
import { collectTemplateFonts } from "./collect-template-fonts";

const SINGLE_PAGE = 1;

interface PreviewDetailsProps {
  preview: ActivePreview;
  full: TemplateDef | null;
  onUse: () => void;
  onClose: () => void;
}

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-baseline justify-between gap-4 border-t border-zinc-200 py-2.5 text-[13px] dark:border-zinc-800">
    <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
    <span className="text-right font-medium text-zinc-900 dark:text-zinc-100">{value}</span>
  </div>
);

const pageLabel = (count: number): string => (count > SINGLE_PAGE ? `${count} pages` : "1 page");

export const PreviewDetails: React.FC<PreviewDetailsProps> = ({ preview, full, onUse, onClose }) => {
  const { template, locked } = preview;
  const fonts = full ? collectTemplateFonts(full) : [];
  const format = categoryLabel(template.category);

  return (
    <div className="flex flex-col">
      <p className="text-[12px] font-semibold text-zinc-500 dark:text-zinc-400">{format}</p>
      <h2 className="mt-1 text-[22px] font-bold leading-tight text-zinc-900 dark:text-zinc-50">{template.name}</h2>
      {locked && (
        <p className="mt-3 text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          This one comes free with an account. Sign up free and it opens straight in the studio.
        </p>
      )}
      <div className="mt-5">
        <DetailRow label="Size" value={describeTemplateSize(template, template.category, format)} />
        <DetailRow label="Pages" value={pageLabel(template.pageCount)} />
        {fonts.length > 0 && <DetailRow label="Fonts" value={fonts.join(", ")} />}
      </div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onUse}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-[14px] font-semibold text-white transition-all hover:bg-zinc-700 active:scale-[0.98] dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Use this template
          <ArrowRight size={15} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl px-5 py-3 text-[14px] font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
        >
          Keep browsing
        </button>
      </div>
    </div>
  );
};
