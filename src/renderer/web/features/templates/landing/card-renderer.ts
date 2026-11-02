import type React from "react";
import type { TemplateSummary } from "@bitgrain/platform/templates/cards/template-summary";

export type CardVariant = "grid" | "row";

export type RenderTemplateCard = (template: TemplateSummary, variant: CardVariant) => React.ReactNode;
