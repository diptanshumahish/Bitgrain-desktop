import { lazy, memo, Suspense, type ReactNode } from "react";
import { useSignalValue } from "../lib/signal";
import { documentTabsSignal, activeTabIdSignal } from "../store/document-tabs-store";
import { HomeSurface } from "./HomeSurface";

// Surfaces are memoized so a tab switch (which only flips visibility) never
// re-renders their heavy trees. Each reads its own state internally, so it still
// updates when its own data changes, just not when a sibling tab is activated.
const Darkroom = memo(
  lazy(() => import("../pages/Home").then((m) => ({ default: m.Home }))),
);
const Studio = memo(
  lazy(() => import("./surfaces/StudioSurface").then((m) => ({ default: m.StudioSurface }))),
);
const Video = memo(
  lazy(() => import("./surfaces/VideoSurface").then((m) => ({ default: m.VideoSurface }))),
);
const Home = memo(HomeSurface);

// Every open surface stays mounted. Only the active one is visible; the rest are
// kept in the layout (so canvases keep their real size) but hidden and inert.
// Switching tabs is a visibility flip, never a remount, so nothing reloads.
function Pane({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div
      className={`absolute inset-0 ${active ? "" : "invisible pointer-events-none"}`}
      aria-hidden={!active}
    >
      {children}
    </div>
  );
}

export function SurfaceRouter() {
  const tabs = useSignalValue(documentTabsSignal);
  const activeId = useSignalValue(activeTabIdSignal);
  const activeKind = tabs.find((tab) => tab.id === activeId)?.kind ?? "home";

  const hasDarkroom = tabs.some((tab) => tab.kind === "darkroom");
  const studioTabs = tabs.filter((tab) => tab.kind === "studio");
  const videoTabs = tabs.filter((tab) => tab.kind === "video");

  return (
    <Suspense fallback={null}>
      <Pane active={activeKind === "home"}>
        <Home />
      </Pane>

      {hasDarkroom && (
        <Pane active={activeKind === "darkroom"}>
          <Darkroom />
        </Pane>
      )}

      {studioTabs.map((tab) => (
        <Pane key={tab.id} active={tab.id === activeId}>
          <Studio instanceId={tab.instanceId} tabId={tab.id} initialTemplate={tab.initialTemplate} />
        </Pane>
      ))}

      {videoTabs.map((tab) => (
        <Pane key={tab.id} active={tab.id === activeId}>
          <Video active={tab.id === activeId} instanceId={tab.instanceId} tabId={tab.id} />
        </Pane>
      ))}
    </Suspense>
  );
}
