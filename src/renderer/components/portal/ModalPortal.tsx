import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { onModal } from "../../lib/event-bus";
import type { ModalEvent } from "../../lib/event-bus";
import { CropModal } from "../modals/CropModal";
import { ResizeModal } from "../modals/ResizeModal";
import { RisoExportModal } from "../modals/RisoExportModal";
import { ColorStudioModal } from "../modals/ColorStudioModal";
import { ConfirmModal } from "../modals/ConfirmModal";
import { PromptModal } from "../modals/PromptModal";
import { AnimateModal } from "../modals/AnimateModal";
import { ChangelogModal } from "../modals/ChangelogModal";
import { PresentationModal } from "../modals/PresentationModal";
import { PatternModal } from "../modals/pattern/PatternModal";
import { SmartObjectModal } from "../modals/smart-object/SmartObjectModal";
import { BatchProcessor } from "../modals/batch/BatchProcessor";
import { KeyboardShortcutsModal } from "../modals/studio-dialog/KeyboardShortcutsModal";
import { NewDesignModal } from "../modals/studio-dialog/NewDesignModal";
import { MaskAreaModal } from "../../modules/grading/mask-ui/area-modal/MaskAreaModal";
import { HeicToast } from "../HeicToast";

const HEIC_DONE_LINGER_MS = 900;

// Desktop modal host. It wires the feature modals the editors emit (crop,
// mask area, colour studio, riso export, resize, confirm, prompt, shortcuts,
// new design) plus
// the HEIC conversion toast. The web build's payment and auth modals
// (studio-payment, login, settings, free-access, upgrade-prompt,
// post-export-upgrade, ticket, …) have no desktop meaning
// and are simply not rendered — offline, deterministic, no accounts.
type ActiveModal = Exclude<ModalEvent, { type: "heic-status" }> | null;

// The web "add image" flow is an online asset-library picker. On desktop we go
// straight to the native file dialog and hand back a self-contained data URL,
// so every entry point (the studio rail button and the Image/Upload property
// panels' "Replace image") works offline without a modal.
async function pickImageNatively(): Promise<
  { src: string; dims?: { width: number; height: number } } | null
> {
  const picked = await window.bitgrain?.openImage();
  if (!picked) return null;
  const ext = (picked.fileName.split(".").pop() ?? "").toLowerCase();
  const mime =
    ext === "jpg" || ext === "jpeg" ? "image/jpeg"
    : ext === "svg" ? "image/svg+xml"
    : ext === "gif" ? "image/gif"
    : ext === "webp" ? "image/webp"
    : "image/png";
  const blob = new Blob([new Uint8Array(picked.bytes)], { type: mime });
  const src = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
  let dims: { width: number; height: number } | undefined;
  try {
    const bitmap = await createImageBitmap(blob);
    dims = { width: bitmap.width, height: bitmap.height };
  } catch {
    dims = undefined;
  }
  return { src, dims };
}

export const ModalPortal: React.FC = () => {
  const [active, setActive] = useState<ActiveModal>(null);
  const [heicStatus, setHeicStatus] = useState<"converting" | "done" | null>(null);
  const [heicFormat, setHeicFormat] = useState<"heic" | "raw" | "tiff">("heic");

  useEffect(() => {
    return onModal((event) => {
      if (event.type === "heic-status") {
        if (event.format) setHeicFormat(event.format);
        if (event.status === "failed") {
          setHeicStatus(null);
          return;
        }
        setHeicStatus(event.status);
        if (event.status === "done") {
          setTimeout(() => setHeicStatus((current) => (current === "done" ? null : current)), HEIC_DONE_LINGER_MS);
        }
        return;
      }
      if (event.type === "add-image") {
        const onPick = event.onPick;
        void pickImageNatively().then((res) => {
          if (res) onPick(res.src, res.dims);
        });
        return;
      }
      setActive(event);
    });
  }, []);

  const close = () => setActive(null);

  return createPortal(
    <>
      {active?.type === "crop" && <CropModal onClose={close} />}
      {active?.type === "riso-export" && <RisoExportModal onClose={close} />}
      {active?.type === "mask-area" && (
        <MaskAreaModal source={active.source} area={active.area} onApply={active.onApply} onClose={close} />
      )}
      {active?.type === "color-studio" && <ColorStudioModal onClose={close} />}
      {active?.type === "resize" && (
        <ResizeModal
          sourceWidth={active.sourceWidth}
          sourceHeight={active.sourceHeight}
          onApply={active.onApply}
          onClose={close}
        />
      )}
      {active?.type === "confirm" && (
        <ConfirmModal
          title={active.title}
          message={active.message}
          onConfirm={active.onConfirm}
          onCancel={active.onCancel}
          confirmLabel={active.confirmLabel}
          cancelLabel={active.cancelLabel}
          danger={active.danger}
          safeDefault={active.safeDefault}
          onClose={close}
        />
      )}
      {active?.type === "prompt" && (
        <PromptModal
          title={active.title}
          label={active.label}
          notice={active.notice}
          defaultValue={active.defaultValue}
          placeholder={active.placeholder}
          confirmLabel={active.confirmLabel}
          onSubmit={active.onSubmit}
          onClose={close}
        />
      )}
      {active?.type === "animate" && <AnimateModal onClose={close} />}
      {active?.type === "changelog" && <ChangelogModal onClose={close} />}
      {active?.type === "batch" && <BatchProcessor onClose={close} />}
      {active?.type === "keyboard-shortcuts" && <KeyboardShortcutsModal onClose={close} />}
      {active?.type === "new-design" && <NewDesignModal onCreate={active.onCreate} onClose={close} />}
      {active?.type === "pattern" && (
        <PatternModal
          canvasWidth={active.canvasWidth}
          canvasHeight={active.canvasHeight}
          onApply={active.onApply}
          onClose={close}
        />
      )}
      {active?.type === "mockup" && (
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
      {active?.type === "present" && (
        <PresentationModal
          pages={active.pages}
          template={active.template}
          startIndex={active.startIndex}
          onClose={close}
        />
      )}
      {heicStatus && <HeicToast done={heicStatus === "done"} format={heicFormat} />}
    </>,
    document.body,
  );
};
