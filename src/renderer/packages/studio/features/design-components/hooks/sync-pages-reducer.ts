import type { SetStateAction } from "react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { syncComponents } from "@bitgrain/studio-core/components/core/sync-components";

export const syncPagesReducer = (prev: TemplatePage[], update: SetStateAction<TemplatePage[]>): TemplatePage[] =>
  syncComponents(prev, typeof update === "function" ? update(prev) : update);
