import React, { Suspense, lazy, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSignalValue } from "../../../lib/signal";
import { userSignal } from "../../../hooks/useAuth";
import { isTemplateLocked } from "../../../lib/template-cards/is-template-locked";
import { onTemplatePreview, type TemplatePreviewRequest } from "./template-preview-events";
import {
  activePreviewSignal,
  closeTemplatePreview,
  openTemplatePreview,
  previewFullTemplateSignal,
} from "./template-preview-store";
import { useStartTemplate } from "../../templates/preview/use-start-template";

const ESCAPE_KEY = "Escape";

const TemplatePreviewSheet = lazy(() =>
  import("../../templates/preview/TemplatePreviewSheet").then((module) => ({ default: module.TemplatePreviewSheet })),
);

const handlePreviewRequest = (request: TemplatePreviewRequest): void => {
  openTemplatePreview({ ...request, locked: isTemplateLocked(request.template, !!userSignal.value) });
};

const closeOnEscape = (event: KeyboardEvent): void => {
  if (event.key === ESCAPE_KEY) closeTemplatePreview();
};

export const TemplatePreviewPortal: React.FC = () => {
  const preview = useSignalValue(activePreviewSignal);
  const full = useSignalValue(previewFullTemplateSignal);
  const startTemplate = useStartTemplate();
  const isOpen = preview !== null;

  useEffect(() => onTemplatePreview(handlePreviewRequest), []);

  useEffect(() => {
    if (!isOpen) return;
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  if (!preview) return null;

  return createPortal(
    <Suspense fallback={null}>
      <TemplatePreviewSheet
        preview={preview}
        full={full}
        onUse={() => startTemplate(preview)}
        onClose={closeTemplatePreview}
      />
    </Suspense>,
    document.body,
  );
};
