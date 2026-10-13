import { HashRouter as Router } from "react-router-dom";
import { Shell } from "./shell/Shell";
import { AuthGate } from "./shell/AuthGate";
import { SurfaceRouter } from "./shell/SurfaceRouter";
import { ExportProgressPortal } from "./components/portal/ExportProgressPortal";
import { ModalPortal } from "./components/portal/ModalPortal";
import { MoshToastPortal } from "./components/portal/mosh-toast/MoshToastPortal";
import { StatusToastPortal } from "./components/portal/status-toast/StatusToastPortal";
import { UndoToastPortal } from "./components/portal/undo-toast/UndoToastPortal";
import { TemplatePreviewPortal } from "./components/portal/template-preview/TemplatePreviewPortal";
import { WelcomePortal } from "./components/onboarding/welcome/WelcomePortal";
import { useAppActions } from "./shell/use-app-actions";

// TutorialPortal is intentionally omitted: its onboarding tooltips render into
// document.body and would leak from mounted-but-hidden surfaces onto the active
// one. The web's first-run welcome (WelcomePortal) is mounted: it is a single
// full-window overlay started from the home dashboard, not per-surface tooltips.
//
// ModalPortal IS mounted: it hosts the feature modals (crop, selective effect,
// mask area, colour studio, riso export, resize, confirm, prompt) that darkroom and studio
// emit. It renders into document.body but shows one modal at a time keyed to the
// active surface's emitted event, so there is no cross-surface leakage.
export default function App() {
  useAppActions();
  return (
    <Router>
      <AuthGate>
        <Shell>
          <ExportProgressPortal />
          <ModalPortal />
          <MoshToastPortal />
          <StatusToastPortal />
          <UndoToastPortal />
          <TemplatePreviewPortal />
          <WelcomePortal />
          <SurfaceRouter />
        </Shell>
      </AuthGate>
    </Router>
  );
}
