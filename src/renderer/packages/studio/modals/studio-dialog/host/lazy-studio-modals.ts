import { lazy } from "react";

export const ResizeModal = lazy(() =>
  import("../../resize/ResizeModal").then((module) => ({ default: module.ResizeModal })),
);
export const SmartObjectModal = lazy(() =>
  import("../../smart-object/SmartObjectModal").then((module) => ({ default: module.SmartObjectModal })),
);
export const NewDesignModal = lazy(() =>
  import("../NewDesignModal").then((module) => ({ default: module.NewDesignModal })),
);
export const AllSizesModal = lazy(() =>
  import("../all-sizes/AllSizesModal").then((module) => ({ default: module.AllSizesModal })),
);
export const KeyboardShortcutsModal = lazy(() =>
  import("../KeyboardShortcutsModal").then((module) => ({ default: module.KeyboardShortcutsModal })),
);
export const PatternModal = lazy(() =>
  import("../../pattern/PatternModal").then((module) => ({ default: module.PatternModal })),
);
export const AddImageModal = lazy(() =>
  import("../../AddImageModal").then((module) => ({ default: module.AddImageModal })),
);
export const PresentationModal = lazy(() =>
  import("../../PresentationModal").then((module) => ({ default: module.PresentationModal })),
);
