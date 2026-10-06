import { useEffect } from "react";
import { trackEvent as trackPosthog } from "../../lib/analytics";
import { trackEvent } from "../../lib/tracker";
import { emitTutorial } from "../../lib/tutorial-event-bus";
import { isMobileNow } from "../../hooks/useIsMobile";
import { ensureAdminFontsLoaded } from "../../lib/admin-fonts";
import { dirtySignal, markClean } from "../../store/studio-save-status";
import { loadTemplates } from "../../store/templates-store";
import { fetchPlugins } from "../../studio-plugins/host/api";
import {
  pluginsSignal,
  pluginsLoadedSignal,
} from "../../studio-plugins/host/plugin-bus";
import { authBypassSignal } from "../../hooks/useAuth";
import type { TemplateDef } from "../../data/studioTypes";

const TUTORIAL_DELAY_MS = 800;
const TUTORIAL_KEY = "imgi_tutorial_studio_done";

interface UseStudioInitArgs {
  initial: TemplateDef;
}

export const useStudioInit = ({ initial }: UseStudioInitArgs): void => {
  useEffect(() => {
    trackPosthog("studio_opened", {
      template_id: initial.id,
      canvas_width: initial.width,
      canvas_height: initial.height,
    });
    trackEvent("studio", "opened", {
      details: { template_id: initial.id, width: initial.width, height: initial.height },
    });
  }, [initial.height, initial.id, initial.width]);

  useEffect(() => {
    void ensureAdminFontsLoaded();
  }, []);

  // Live templates + plugins from the backend. Skipped under the test harness so
  // checks don't reach out to prod.
  useEffect(() => {
    if (authBypassSignal.value) return;
    void loadTemplates();
    const controller = new AbortController();
    void fetchPlugins(controller.signal).then((list) => {
      pluginsSignal.value = list;
      pluginsLoadedSignal.value = true;
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    markClean();
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirtySignal.value) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (isMobileNow()) return;
    const done = localStorage.getItem(TUTORIAL_KEY);
    if (!done) {
      const timer = setTimeout(
        () => emitTutorial({ type: "start", tutorialId: "studio" }),
        TUTORIAL_DELAY_MS,
      );
      return () => clearTimeout(timer);
    }
  }, []);
};
