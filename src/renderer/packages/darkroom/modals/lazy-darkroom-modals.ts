import { lazy } from "react";

export const CropModal = lazy(() =>
  import("./components/CropModal").then((module) => ({ default: module.CropModal })),
);
export const RisoExportModal = lazy(() =>
  import("./components/RisoExportModal").then((module) => ({ default: module.RisoExportModal })),
);
export const AnimateModal = lazy(() =>
  import("./components/AnimateModal").then((module) => ({ default: module.AnimateModal })),
);
export const LoopExportModal = lazy(() =>
  import("../loop/export/LoopExportModal").then((module) => ({ default: module.LoopExportModal })),
);
export const ColorStudioModal = lazy(() =>
  import("./components/ColorStudioModal").then((module) => ({ default: module.ColorStudioModal })),
);
export const BatchProcessor = lazy(() =>
  import("./components/batch/BatchProcessor").then((module) => ({ default: module.BatchProcessor })),
);
export const MaskAreaModal = lazy(() =>
  import("../grading/mask-ui/area-modal/MaskAreaModal").then((module) => ({ default: module.MaskAreaModal })),
);
export const MetadataCleanerModal = lazy(() =>
  import("../metadata-cleaner/components/MetadataCleanerModal").then((module) => ({ default: module.MetadataCleanerModal })),
);
export const StyleBrowserModal = lazy(() =>
  import("../toolbar/style-browser/StyleBrowserModal").then((module) => ({ default: module.StyleBrowserModal })),
);
export const HeicToast = lazy(() =>
  import("../editor/upload/HeicToast").then((module) => ({ default: module.HeicToast })),
);
