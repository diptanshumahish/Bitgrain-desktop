import { emitTutorial } from "@bitgrain/ui/tutorial/tutorial-events";
import { homeTourDoneSignal, markHomeTourDone } from "../../state/onboarding-store";

const HOME_TOUR_KEY = "imgi_tutorial_home_done";

export const dismissHomeTour = (): void => {
  if (homeTourDoneSignal.value) return;
  try {
    localStorage.setItem(HOME_TOUR_KEY, "true");
  } catch (error) {
    console.warn("Could not remember the finished tour", error);
  }
  markHomeTourDone();
  emitTutorial({ type: "stop" });
};
