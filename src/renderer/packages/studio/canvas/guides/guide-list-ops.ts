import type { PageGuide } from "@bitgrain/studio-core/model/layout-grid-types";

export const moveGuide = (guides: PageGuide[], guideId: string, position: number): PageGuide[] =>
  guides.map((guide) => (guide.id === guideId ? { id: guide.id, axis: guide.axis, position } : guide));

export const removeGuide = (guides: PageGuide[], guideId: string): PageGuide[] =>
  guides.filter((guide) => guide.id !== guideId);

export const isOverRuler = (clientX: number, clientY: number): boolean =>
  document.elementsFromPoint(clientX, clientY).some((element) => element.hasAttribute("data-canvas-ruler"));
