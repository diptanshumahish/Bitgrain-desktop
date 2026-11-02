import React from "react";
import { StudioHomeNav } from "../../../hub/studio-home/StudioHomeNav";
import { AppPageHeading } from "../../../../app/shell/app-marine/AppPageHeading";
import { APP_BAND_CLASS } from "@bitgrain/ui/theme/app-marine-classes";
import { APP_TEMPLATES_INNER_CLASS, APP_TEMPLATES_NAV_LABEL } from "./templates-app-classes";

export const TemplatesAppHeader: React.FC = () => (
  <>
    <StudioHomeNav label={APP_TEMPLATES_NAV_LABEL} />
    <header className={APP_BAND_CLASS}>
      <div className={`${APP_TEMPLATES_INNER_CLASS} flex flex-wrap items-end justify-between gap-6 pb-6 pt-6 sm:pb-8 sm:pt-10 lg:pt-12`}>
        <AppPageHeading
          kicker="Template library"
          title="Start from a designer's"
          accent="template"
          lead="Open one in the studio and change the type, colours and texture."
        />
      </div>
    </header>
  </>
);
