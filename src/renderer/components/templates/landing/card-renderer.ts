import type React from "react";
import type { TemplateSummary } from "../../../lib/template-cards/template-summary";

export type CardVariant = "grid" | "row";

export type RenderTemplateCard = (template: TemplateSummary, variant: CardVariant) => React.ReactNode;
