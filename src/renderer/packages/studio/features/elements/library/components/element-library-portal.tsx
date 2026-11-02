import React, { Suspense, lazy, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSignalValue } from "@bitgrain/core/signal";
import { trackEvent } from "@bitgrain/platform/tracker";
import { onOpenElementLibrary } from "../element-library-events";
import { closeElementLibrary, libraryOpenSignal, openElementLibrary } from "../element-library-store";
import type { LibraryOpenRequest } from "../element-library-types";

const ESCAPE_KEY = "Escape";

const ElementLibraryModal = lazy(() =>
  import("./element-library-modal").then((module) => ({ default: module.ElementLibraryModal })),
);

const handleOpenRequest = (request: LibraryOpenRequest): void => {
  openElementLibrary(request);
  trackEvent("studio", "element_library_opened", { details: { collection: request.collectionId ?? "", searched: !!request.search } });
};

const closeOnEscape = (event: KeyboardEvent): void => {
  if (event.key !== ESCAPE_KEY) return;
  event.stopPropagation();
  closeElementLibrary();
};

export const ElementLibraryPortal: React.FC = () => {
  const isOpen = useSignalValue(libraryOpenSignal);

  useEffect(() => onOpenElementLibrary(handleOpenRequest), []);

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("keydown", closeOnEscape, true);
    return () => window.removeEventListener("keydown", closeOnEscape, true);
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <Suspense fallback={null}>
      <ElementLibraryModal />
    </Suspense>,
    document.body,
  );
};
