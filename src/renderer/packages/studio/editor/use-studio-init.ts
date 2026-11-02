import { useEffect } from "react";
import { trackEvent } from "@bitgrain/platform/tracker";
import { emitTutorial } from "@bitgrain/ui/tutorial/tutorial-events";
import { isMobileNow } from "@bitgrain/ui/hooks/use-is-mobile";
import { ensureAdminFontsLoaded } from "@bitgrain/studio-core/fonts/admin-fonts";
import { dirtySignal, markClean } from "../state/studio-save-status";
import type { TemplateDef } from "@bitgrain/studio-core/model/studio-types";

const TUTORIAL_DELAY_MS = 800;
const TUTORIAL_KEY = "imgi_tutorial_studio_v2_done";

const hasSeenStudioTour = (): boolean => {
  try {
    return localStorage.getItem(TUTORIAL_KEY) !== null;
  } catch {
    return true;
  }
};

const rememberStudioTourSeen = (): void => {
  try {
    localStorage.setItem(TUTORIAL_KEY, "true");
  } catch {
    trackEvent("studio", "tour_storage_unavailable");
  }
};

interface UseStudioInitArgs {
  initial: TemplateDef;
}

export const useStudioInit = ({ initial }: UseStudioInitArgs): void => {
  useEffect(() => {
    trackEvent("studio", "opened", {
      details: { template_id: initial.id, width: initial.width, height: initial.height },
    });
  }, [initial.height, initial.id, initial.width]);

  useEffect(() => {
    void ensureAdminFontsLoaded();
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
    if (isMobileNow() || hasSeenStudioTour()) return;
    const timer = setTimeout(() => {
      rememberStudioTourSeen();
      emitTutorial({ type: "start", tutorialId: "studio" });
    }, TUTORIAL_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
};
