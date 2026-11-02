import { lazy } from "react";

export const ConfirmModal = lazy(() =>
  import("./ConfirmModal").then((module) => ({ default: module.ConfirmModal })),
);
export const PromptModal = lazy(() =>
  import("./PromptModal").then((module) => ({ default: module.PromptModal })),
);
