import { createEventChannel } from "@bitgrain/core/events/event-channel";

const TUTORIAL_KEY = "bg:tutorial";

type TutorialEvent =
  | { type: "start"; tutorialId: "home" | "studio" }
  | { type: "stop" };

const tutorialChannel = createEventChannel<TutorialEvent>(TUTORIAL_KEY);

export const emitTutorial = tutorialChannel.emit;
export const onTutorial = tutorialChannel.on;

