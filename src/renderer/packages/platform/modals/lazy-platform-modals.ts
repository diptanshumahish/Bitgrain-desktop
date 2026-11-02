import { lazy } from "react";

export const FreeAccessModal = lazy(() =>
  import("./components/FreeAccessModal").then((module) => ({ default: module.FreeAccessModal })),
);
export const UpgradePromptModal = lazy(() =>
  import("./upgrade-prompt/UpgradePromptModal").then((module) => ({ default: module.UpgradePromptModal })),
);
export const PostExportUpgrade = lazy(() =>
  import("./components/PostExportUpgrade").then((module) => ({ default: module.PostExportUpgrade })),
);
export const TicketModal = lazy(() =>
  import("./components/TicketModal").then((module) => ({ default: module.TicketModal })),
);
export const ChangelogModal = lazy(() =>
  import("./components/ChangelogModal").then((module) => ({ default: module.ChangelogModal })),
);
