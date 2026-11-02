import { Activity, lazy, memo, Suspense, type ReactNode } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { documentTabsSignal, activeTabIdSignal } from "../store/document-tabs-store";
import { HomeSurface } from "./HomeSurface";

// Surfaces are memoized so a tab switch (which only flips visibility) never
// re-renders their heavy trees. Each reads its own state internally, so it still
// updates when its own data changes, just not when a sibling tab is activated.
const Darkroom = memo(
  lazy(() => import("./surfaces/DarkroomSurface").then((m) => ({ default: m.DarkroomSurface }))),
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
// The video tab gates its own lifecycle on `active` and uses this pane directly.
function Pane({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div
      className={`absolute inset-0 ${active ? "" : "invisible pointer-events-none"}`}
      aria-hidden={!active}
      data-active-surface={active || undefined}
    >
      {children}
    </div>
  );
}

// Darkroom and studio come from the web packages, which listen on the window
// (shortcuts, paste and drop intake) and on global event channels (studio
// commands, popovers, command palette). React's <Activity> keeps a hidden tab's
// state and DOM but tears down its effects, so only the visible editor reacts.
function EditorPane({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <Activity mode={active ? "visible" : "hidden"}>
      <div className="absolute inset-0" data-active-surface={active || undefined}>
        {children}
      </div>
    </Activity>
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
        <EditorPane active={activeKind === "darkroom"}>
          <Darkroom />
        </EditorPane>
      )}

      {studioTabs.map((tab) => (
        <EditorPane key={tab.id} active={tab.id === activeId}>
          <Studio instanceId={tab.instanceId} tabId={tab.id} initialTemplate={tab.initialTemplate} />
        </EditorPane>
      ))}

      {videoTabs.map((tab) => (
        <Pane key={tab.id} active={tab.id === activeId}>
          <Video active={tab.id === activeId} instanceId={tab.instanceId} tabId={tab.id} />
        </Pane>
      ))}
    </Suspense>
  );
}
