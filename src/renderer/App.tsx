import { Suspense } from "react";
import { HashRouter as Router } from "react-router-dom";
import { DialogHost } from "@bitgrain/ui/dialogs/DialogHost";
import { DarkroomModalHost } from "@bitgrain/darkroom/modals/DarkroomModalHost";
import { StudioModalHost } from "@bitgrain/studio/modals/studio-dialog/host/StudioModalHost";
import { StatusToastPortal } from "@bitgrain/ui/overlays/status-toast/StatusToastPortal";
import { UndoToastPortal } from "@bitgrain/ui/overlays/undo-toast/UndoToastPortal";
import { RemovalProgressPortal } from "@bitgrain/darkroom/background-removal/components/removal-progress-portal";
import { ElementLibraryPortal } from "@bitgrain/studio/features/elements/library/components/element-library-portal";
import { MoshToastPortal } from "./web/app/shell/mosh-toast/MoshToastPortal";
import { ExportProgressPortal } from "./web/app/shell/portals/ExportProgressPortal";
import { TemplatePreviewPortal } from "./web/features/templates/preview-portal/TemplatePreviewPortal";
import { WelcomePortal } from "./web/features/onboarding/welcome/WelcomePortal";
import { AnnouncementPortal } from "./web/features/announcements/components/announcement-portal";
import { Shell } from "./shell/Shell";
import { AuthGate } from "./shell/AuthGate";
import { SurfaceRouter } from "./shell/SurfaceRouter";
import { DesktopPlatformModalHost } from "./shell/overlays/DesktopPlatformModalHost";
import { useAppActions } from "./shell/use-app-actions";

// The web App mounts one overlay host per package (README "Overlays"); the
// desktop mounts the same hosts once, above every tab. Web's PlatformModalHost is
// replaced by DesktopPlatformModalHost (no checkout or sign-in modals). The
// onboarding TutorialPortal stays out: its tooltips render into document.body
// and would leak from hidden surfaces onto the active one. Per-editor portals
// (popovers, context menus, command palette) are mounted by the editors.
export default function App() {
  useAppActions();
  return (
    <Router>
      <AuthGate>
        <Shell>
          <DialogHost />
          <DesktopPlatformModalHost />
          <DarkroomModalHost />
          <StudioModalHost />
          <MoshToastPortal />
          <StatusToastPortal />
          <UndoToastPortal />
          <ExportProgressPortal />
          <Suspense fallback={null}>
            <RemovalProgressPortal />
            <TemplatePreviewPortal />
            <ElementLibraryPortal />
            <WelcomePortal />
            <AnnouncementPortal />
          </Suspense>
          <SurfaceRouter />
        </Shell>
      </AuthGate>
    </Router>
  );
}
