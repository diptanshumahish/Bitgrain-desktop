import React from "react";
import { ArrowRight } from "lucide-react";
import type { TemplateDef } from "@bitgrain/studio-core/model/studio-types";
import { categoryLabel } from "../data/categories";
import { describeTemplateSizeOnly } from "../data/size-names";
import type { ActivePreview } from "../preview-portal/template-preview-store";
import { collectTemplateFonts } from "./collect-template-fonts";
import { PreviewDetailRow } from "./PreviewDetailRow";
import { PreviewFontPills } from "./PreviewFontPills";
import { AppKicker } from "../../../app/shell/app-marine/AppKicker";
import { APP_DISPLAY_CLASS, APP_PRIMARY_BUTTON_CLASS } from "@bitgrain/ui/theme/app-marine-classes";

const SINGLE_PAGE = 1;

interface PreviewDetailsProps {
  preview: ActivePreview;
  full: TemplateDef | null;
  onUse: () => void;
  onClose: () => void;
}

const pageLabel = (count: number): string => (count > SINGLE_PAGE ? `${count} pages` : "1 page");

export const PreviewDetails: React.FC<PreviewDetailsProps> = ({ preview, full, onUse, onClose }) => {
  const { template } = preview;
  const fonts = full ? collectTemplateFonts(full) : [];
  const format = categoryLabel(template.category);

  return (
    <div className="flex h-full flex-col justify-between gap-10">
      <div>
        <AppKicker label={format} />
        <h2 className={`mt-4 text-[clamp(1.9rem,3vw,2.6rem)] ${APP_DISPLAY_CLASS}`}>{template.name}</h2>
        <div className="mt-8">
          <PreviewDetailRow label="Size">{describeTemplateSizeOnly(template, template.category)}</PreviewDetailRow>
          <PreviewDetailRow label="Pages">{pageLabel(template.pageCount)}</PreviewDetailRow>
          {fonts.length > 0 && (
            <PreviewDetailRow label="Fonts">
              <PreviewFontPills fonts={fonts} />
            </PreviewDetailRow>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button type="button" onClick={onUse} className={`group w-full py-3.5 ${APP_PRIMARY_BUTTON_CLASS}`}>
          Use this template
          <ArrowRight size={16} strokeWidth={2.25} className="transition-transform group-hover:translate-x-0.5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl py-3 font-display text-[15px] font-medium text-ink-soft/60 transition-colors hover:bg-ultramarine/5 hover:text-ultramarine dark:text-white/50 dark:hover:bg-white/5 dark:hover:text-apricot"
        >
          Keep browsing
        </button>
      </div>
    </div>
  );
};
