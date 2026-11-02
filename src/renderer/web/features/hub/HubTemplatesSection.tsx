import React, { useMemo } from "react";
import type { TemplateSummary } from "@bitgrain/platform/templates/cards/template-summary";
import { useTemplateFeed } from "../templates/grid/use-template-feed";
import { useTemplateActions } from "../templates/use-template-actions";
import { MasonryGrid } from "@bitgrain/ui/masonry/MasonryGrid";
import { templateHeightRatio } from "@bitgrain/platform/templates/cards/template-height-ratio";
import { TemplateCard } from "../templates/browse/TemplateCard";
import { HubFormatLinks } from "./HubFormatLinks";
import { HubBrowseAll } from "./HubBrowseAll";
import { pickHubTemplates } from "./pick-hub-templates";
import { AppKicker } from "../../app/shell/app-marine/AppKicker";
import { APP_SECTION_TITLE_CLASS, APP_SERIF_ACCENT_CLASS } from "@bitgrain/ui/theme/app-marine-classes";

const GRID_MIN_COLUMN_WIDTH = 230;
const GRID_MIN_COLUMNS = 2;
const GRID_MAX_COLUMNS = 8;

export const HubTemplatesSection: React.FC = () => {
  const feed = useTemplateFeed();
  const { isNew, handleOpen } = useTemplateActions("hub");
  const picks = useMemo(() => pickHubTemplates(feed.templates), [feed.templates]);

  const renderCard = (template: TemplateSummary): React.ReactNode => (
    <TemplateCard
      template={template}
      isNew={isNew(template)}
      onOpen={() => handleOpen(template)}
    />
  );

  return (
    <section className="px-6 pb-6 pt-12 md:px-8 md:pt-16">
      <div className="mx-auto max-w-6xl">
        <AppKicker label="Templates" />
        <h2 className={`mb-6 mt-4 ${APP_SECTION_TITLE_CLASS}`}>
          Start from a designer's <span className={APP_SERIF_ACCENT_CLASS}>template</span>
        </h2>
        <HubFormatLinks />
      </div>
      <div className="relative mx-auto mt-2 max-h-[640px] max-w-6xl overflow-hidden md:max-h-[900px]">
        <MasonryGrid
          items={picks}
          getKey={(template) => template.id}
          getHeightRatio={templateHeightRatio}
          renderItem={renderCard}
          minColumnWidth={GRID_MIN_COLUMN_WIDTH}
          minColumns={GRID_MIN_COLUMNS}
          maxColumns={GRID_MAX_COLUMNS}
          gap="gap-3"
        />
        <HubBrowseAll />
      </div>
    </section>
  );
};
