import React, { useMemo } from "react";
import type { TemplateSummary } from "../../lib/template-cards/template-summary";
import { useTemplateFeed } from "../templates/grid/use-template-feed";
import { useTemplateActions } from "../../hooks/useTemplateActions";
import { MasonryGrid } from "../masonry/MasonryGrid";
import { templateHeightRatio } from "../masonry/template-height-ratio";
import { TemplateCard } from "../templates/browse/TemplateCard";
import { HubFormatLinks } from "./HubFormatLinks";
import { HubBrowseAll } from "./HubBrowseAll";
import { pickHubTemplates } from "./pick-hub-templates";

const GRID_MIN_COLUMN_WIDTH = 230;
const GRID_MIN_COLUMNS = 2;
const GRID_MAX_COLUMNS = 8;

export const HubTemplatesSection: React.FC = () => {
  const feed = useTemplateFeed();
  const { isLocked, isNew, handleOpen } = useTemplateActions("hub");
  const picks = useMemo(() => pickHubTemplates(feed.templates), [feed.templates]);

  const renderCard = (template: TemplateSummary): React.ReactNode => (
    <TemplateCard
      template={template}
      locked={isLocked(template)}
      isNew={isNew(template)}
      onOpen={() => handleOpen(template)}
    />
  );

  return (
    <section className="mt-14 md:mt-16">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 font-editorial text-xl font-semibold text-[var(--s-text)]">Start from a template</h2>
        <HubFormatLinks />
      </div>
      <div className="relative max-h-[640px] overflow-hidden md:max-h-[900px]">
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
        <HubBrowseAll total={feed.total} />
      </div>
    </section>
  );
};
