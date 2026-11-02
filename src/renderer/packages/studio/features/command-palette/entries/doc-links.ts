import { signal } from "@bitgrain/core/signal";

export interface DocLink {
  folder: string;
  file: string;
}

export const docLinksSignal = signal<DocLink[]>([]);

export const registerDocLinks = (links: DocLink[]): void => {
  docLinksSignal.value = links;
};
