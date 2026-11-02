import React, { Suspense } from "react";
import { createPortal } from "react-dom";
import { useModalHost } from "../overlays/modal-host/use-modal-host";
import { onDialog, type DialogEvent } from "./dialog-events";
import { ConfirmModal, PromptModal } from "./lazy-dialogs";

const DIALOG_HOST_ID = "dialog";

export const DialogHost: React.FC = () => {
  const [active, close] = useModalHost<DialogEvent>(DIALOG_HOST_ID, onDialog);
  if (!active) return null;

  return createPortal(
    <Suspense fallback={null}>
      {active.type === "confirm" && (
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
      {active.type === "prompt" && (
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
    </Suspense>,
    document.body,
  );
};
