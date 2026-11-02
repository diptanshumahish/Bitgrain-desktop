import type { TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";

export interface DocumentExportArgs {
  template: TemplateDef;
  pages: TemplatePage[];
  image: string | null;
  scale: number;
  watermark: boolean;
}
