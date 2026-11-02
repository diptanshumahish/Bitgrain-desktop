import { useEffect, useRef } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { activeTabIdSignal, documentTabsSignal, openTab, switchTab, type TabKind } from "../store/document-tabs-store";
import { Templates } from "../web/features/templates/Templates";
import { TemplateFormat } from "../web/features/templates/TemplateFormat";
import { TemplateDetailPage } from "../web/features/templates/detail/TemplateDetailPage";
import { HomeDashboard, HomeSidebar } from "./HomeDashboard";
import { DESKTOP_HUB_PATH } from "./home/desktop-paths";

// Web paths that open an editor. Ported web components (hub quick actions, the
// welcome flow, the templates nav) link to these; on desktop each opens a new tab
// of that surface instead of routing the window.
const SURFACE_PATHS: Record<string, Exclude<TabKind, "home">> = {
  "/editor": "darkroom",
  "/studio": "studio",
  "/video": "video",
};

const isHomePath = (pathname: string): boolean => pathname === "/" || pathname.startsWith("/templates");

const activateHomeTab = (): void => {
  const home = documentTabsSignal.value.find((tab) => tab.kind === "home");
  if (home) switchTab(home.id);
};

const homeIsActive = (): boolean =>
  documentTabsSignal.value.find((tab) => tab.id === activeTabIdSignal.value)?.kind === "home";

// The HashRouter location belongs to the home tab: "/" is the dashboard and
// "/templates[/:category]" the template browser. A surface path opens a tab (only
// when the home tab issued it, so the studio's own web "back to /studio" calls stay
// inert) and the location returns to the last home page. Any other path ("/hello",
// "/account", ...) falls back to the last home page too.
function useSurfacePathBridge(): void {
  const { pathname, key } = useLocation();
  const navigate = useNavigate();
  const lastHomePath = useRef("/");

  useEffect(() => {
    if (isHomePath(pathname)) {
      lastHomePath.current = pathname;
      return;
    }
    const kind = SURFACE_PATHS[pathname];
    navigate(lastHomePath.current, { replace: true });
    if (homeIsActive()) {
      if (kind) openTab(kind);
      return;
    }
    // An editor asked to leave (its "back to hub" or "back to projects"): show home.
    if (pathname === DESKTOP_HUB_PATH || kind) activateHomeTab();
    // Keyed on the location key so repeating the same link opens another tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export function HomeSurface() {
  useSurfacePathBridge();
  return (
    <div className="flex h-full w-full bg-[var(--s-bg-canvas)]">
      <HomeSidebar />
      <div className="relative min-w-0 flex-1">
        <div data-home-scroll className="relative h-full overflow-y-auto">
          <Routes>
            <Route path="/templates" element={<Templates />} />
            <Route path="/templates/:category" element={<TemplateFormat />} />
            <Route path="/templates/:category/:templateId" element={<TemplateDetailPage />} />
            <Route path="*" element={<HomeDashboard />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
