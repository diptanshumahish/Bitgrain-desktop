import React from "react";
import type { TemplateCategory } from "../../data/categories";
import { StudioHomeNav } from "../../../hub/studio-home/StudioHomeNav";
import { APP_BAND_CLASS } from "@bitgrain/ui/theme/app-marine-classes";
import { FormatHeroIntro } from "../marine/FormatHeroIntro";
import { APP_TEMPLATES_INNER_CLASS, APP_TEMPLATES_NAV_LABEL } from "./templates-app-classes";

interface FormatAppHeaderProps {
  category: TemplateCategory;
}

export const FormatAppHeader: React.FC<FormatAppHeaderProps> = ({ category }) => (
  <>
    <StudioHomeNav label={APP_TEMPLATES_NAV_LABEL} />
    <header className={APP_BAND_CLASS}>
      <div className={`${APP_TEMPLATES_INNER_CLASS} pb-6 pt-8 lg:pt-10`}>
        <FormatHeroIntro category={category} />
      </div>
    </header>
  </>
);
