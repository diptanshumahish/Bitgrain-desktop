import React, { Suspense } from "react";
import { createPortal } from "react-dom";
import { useModalHost } from "@bitgrain/ui/overlays/modal-host/use-modal-host";
import { onDarkroomModal, type DarkroomModalEvent } from "./darkroom-modal-events";
import { useHeicStatus } from "./use-heic-status";
import {
  AnimateModal,
  BatchProcessor,
  ColorStudioModal,
  CropModal,
  HeicToast,
  LoopExportModal,
  MaskAreaModal,
  MetadataCleanerModal,
  RisoExportModal,
  StyleBrowserModal,
} from "./lazy-darkroom-modals";

const DARKROOM_HOST_ID = "darkroom";

export const DarkroomModalHost: React.FC = () => {
  const [active, close] = useModalHost<DarkroomModalEvent>(DARKROOM_HOST_ID, onDarkroomModal);
  const heic = useHeicStatus();
  if (!active && !heic) return null;

  return createPortal(
    <Suspense fallback={null}>
      {active?.type === "crop" && <CropModal onClose={close} />}
      {active?.type === "riso-export" && <RisoExportModal onClose={close} />}
      {active?.type === "animate" && <AnimateModal onClose={close} />}
      {active?.type === "loop-export" && <LoopExportModal onClose={close} />}
      {active?.type === "batch" && <BatchProcessor onClose={close} />}
      {active?.type === "color-studio" && <ColorStudioModal onClose={close} />}
      {active?.type === "metadata-cleaner" && <MetadataCleanerModal onClose={close} />}
      {active?.type === "style-browser" && <StyleBrowserModal target={active.target} onClose={close} />}
      {active?.type === "mask-area" && (
        <MaskAreaModal source={active.source} area={active.area} onApply={active.onApply} onClose={close} />
      )}
      {heic && <HeicToast done={heic.status === "done"} format={heic.format} />}
    </Suspense>,
    document.body,
  );
};
