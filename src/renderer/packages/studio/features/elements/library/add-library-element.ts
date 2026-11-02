import { trackEvent } from "@bitgrain/platform/tracker";
import { emitInsertElement } from "../insert/element-insert-events";
import type { ElementCard } from "../element-types";
import { closeElementLibrary, libraryQuerySignal } from "./element-library-store";

export function addLibraryElement(element: ElementCard): void {
  emitInsertElement({ elementId: element.id, drop: null });
  trackEvent("studio", "element_library_pick", {
    details: { element_id: element.id, page: libraryQuerySignal.value.page, searched: libraryQuerySignal.value.search !== "" },
  });
  closeElementLibrary();
}
