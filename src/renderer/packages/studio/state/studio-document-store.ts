import { signal } from "@bitgrain/core/signal";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";

export const studioPagesSignal = signal<TemplatePage[]>([]);
