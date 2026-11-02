import React, { Suspense } from "react";
import { createPortal } from "react-dom";
import { useModalHost } from "@bitgrain/ui/overlays/modal-host/use-modal-host";
import { onStudioModal, type StudioModalEvent } from "./studio-modal-events";
import {
  AddImageModal,
  AllSizesModal,
  KeyboardShortcutsModal,
  NewDesignModal,
  PatternModal,
  PresentationModal,
  ResizeModal,
  SmartObjectModal,
} from "./lazy-studio-modals";

const STUDIO_HOST_ID = "studio";

export const StudioModalHost: React.FC = () => {
  const [active, close] = useModalHost<StudioModalEvent>(STUDIO_HOST_ID, onStudioModal);
  if (!active) return null;

  return createPortal(
    <Suspense fallback={null}>
      {active.type === "resize" && (
        <ResizeModal
          sourceWidth={active.sourceWidth}
          sourceHeight={active.sourceHeight}
          onApply={active.onApply}
          onClose={close}
        />
      )}
      {active.type === "mockup" && (
        <SmartObjectModal
          template={active.template}
          background={active.background}
          layers={active.layers}
          image={active.image}
          width={active.width}
          height={active.height}
          selectedLayer={active.selectedLayer}
          onAddPage={active.onAddPage}
          onClose={close}
        />
      )}
      {active.type === "new-design" && <NewDesignModal onCreate={active.onCreate} onClose={close} />}
      {active.type === "all-sizes" && <AllSizesModal onPick={active.onPick} onClose={close} />}
      {active.type === "keyboard-shortcuts" && <KeyboardShortcutsModal onClose={close} />}
      {active.type === "pattern" && (
        <PatternModal
          canvasWidth={active.canvasWidth}
          canvasHeight={active.canvasHeight}
          onApply={active.onApply}
          onClose={close}
        />
      )}
      {active.type === "add-image" && <AddImageModal title={active.title} onPick={active.onPick} onClose={close} />}
      {active.type === "present" && (
        <PresentationModal
          pages={active.pages}
          template={active.template}
          startIndex={active.startIndex}
          onClose={close}
        />
      )}
    </Suspense>,
    document.body,
  );
};
