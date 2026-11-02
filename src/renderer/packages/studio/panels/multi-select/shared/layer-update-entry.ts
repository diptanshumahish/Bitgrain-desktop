import type { Layer } from "@bitgrain/studio-core/model/studio-types";

export interface LayerUpdateEntry {
  id: string;
  updates: Partial<Layer>;
}
