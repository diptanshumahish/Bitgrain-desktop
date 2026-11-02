import React from "react";
import type { TemplateSummary } from "../../../../lib/template-cards/template-summary";
import { MasonryGrid } from "../../../masonry/MasonryGrid";
import { templateHeightRatio, templateKey } from "../../../masonry/template-height-ratio";
import { TemplateThumb } from "./TemplateThumb";

const PANEL_COLUMNS = 2;
const PANEL_MIN_COLUMN_WIDTH = 1;

interface StudioThumbGridProps {
  templates: TemplateSummary[];
  selectedId: string;
  isLocked: boolean;
  onSelect: (template: TemplateSummary) => void;
  className?: string;
}

export const StudioThumbGrid: React.FC<StudioThumbGridProps> = ({
  templates,
  selectedId,
  isLocked,
  onSelect,
  className = "",
}) => (
  <MasonryGrid
    items={templates}
    getKey={templateKey}
    getHeightRatio={templateHeightRatio}
    renderItem={(template, index) => (
      <TemplateThumb
        template={template}
        index={index + 1}
        selected={template.id === selectedId}
        locked={isLocked && !template.isFree}
        onClick={() => onSelect(template)}
      />
    )}
    minColumnWidth={PANEL_MIN_COLUMN_WIDTH}
    minColumns={PANEL_COLUMNS}
    maxColumns={PANEL_COLUMNS}
    gap="gap-3"
    className={className}
  />
);
