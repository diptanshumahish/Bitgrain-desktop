import { HashRouter as Router } from "react-router-dom";
import { Shell } from "./shell/Shell";
import { AuthGate } from "./shell/AuthGate";
import { SurfaceRouter } from "./shell/SurfaceRouter";
import { ExportProgressPortal } from "./components/portal/ExportProgressPortal";
import { ModalPortal } from "./components/portal/ModalPortal";
import { useAppActions } from "./shell/use-app-actions";

// TutorialPortal is intentionally omitted: its onboarding tooltips render into
// document.body and would leak from mounted-but-hidden surfaces onto the active
// one. Onboarding is not part of the desktop experience.
//
// ModalPortal IS mounted: it hosts the feature modals (crop, selective effect,
// colour studio, riso export, resize, confirm, prompt) that darkroom and studio
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
          <SurfaceRouter />
        </Shell>
      </AuthGate>
    </Router>
  );
}
