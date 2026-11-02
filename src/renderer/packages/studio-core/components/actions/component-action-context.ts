import type { TemplatePage } from "../../model/studio-types";

export interface ComponentActionContext {
  pages: TemplatePage[];
  activePageId: string;
  selectedIds: string[];
}

interface ComponentActionResult {
  pages: TemplatePage[];
  selectIds?: string[];
  activePageId?: string;
}

interface ComponentActionFailure {
  failure: string;
}

export type ComponentActionOutcome = ComponentActionResult | ComponentActionFailure;

export const isFailure = (outcome: ComponentActionOutcome): outcome is ComponentActionFailure => "failure" in outcome;
