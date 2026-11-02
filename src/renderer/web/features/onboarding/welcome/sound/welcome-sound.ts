import { loadBackgroundTrack, startBackgroundTrack, type BackgroundTrack } from "./background-track";
import { playPaperSwoosh } from "./sfx/paper-swoosh";
import { playPencilScribble } from "./sfx/pencil-scribble";
import type { InkGesture } from "./sfx/pencil-gesture";
import { playKeyTap } from "./sfx/key-tap";
import { playManualClick } from "./sfx/manual-click";
import { playMouseClick } from "./sfx/mouse-click";
import { playExportSparkle } from "./sfx/export-sparkle";
import { createSparkleEcho } from "./sparkle-echo";
import { createSpaceReverb } from "./instruments/space-reverb";
import { createMuffle } from "./instruments/muffle";

const MASTER_LEVEL = 0.9;
const FADE_IN_S = 2.5;
const FADE_OUT_S = 0.6;
const MUTE_SMOOTHING_S = 0.15;
const CLOSE_AFTER_MS = 900;
const GESTURE_EVENTS = ["pointerdown", "keydown"] as const;

interface WelcomeAudio {
  context: AudioContext;
  master: GainNode;
  stage: AudioNode;
  track: BackgroundTrack | null;
}

let activeAudio: WelcomeAudio | null = null;

const resumeOnGesture = (context: AudioContext): void => {
  if (context.state !== "suspended") return;
  const resume = (): void => {
    void context.resume();
    GESTURE_EVENTS.forEach((name) => window.removeEventListener(name, resume));
  };
  GESTURE_EVENTS.forEach((name) => window.addEventListener(name, resume));
};

const playTrackWhenLoaded = async (audio: WelcomeAudio): Promise<void> => {
  try {
    const buffer = await loadBackgroundTrack(audio.context);
    if (activeAudio === audio) audio.track = startBackgroundTrack(audio.context, audio.master, buffer);
  } catch (error: unknown) {
    console.error("welcome track failed:", error);
  }
};

export const startWelcomeSound = (muted: boolean): void => {
  if (activeAudio || typeof AudioContext === "undefined") return;
  const context = new AudioContext();
  const master = context.createGain();
  master.gain.setValueAtTime(0, context.currentTime);
  master.gain.linearRampToValueAtTime(muted ? 0 : MASTER_LEVEL, context.currentTime + FADE_IN_S);
  master.connect(context.destination);
  const stage = createSparkleEcho(context, createSpaceReverb(context, createMuffle(context, master)));
  activeAudio = { context, master, stage, track: null };
  void playTrackWhenLoaded(activeAudio);
  resumeOnGesture(context);
};

export const setWelcomeSoundMuted = (muted: boolean): void => {
  if (!activeAudio) return;
  const { context, master } = activeAudio;
  master.gain.cancelScheduledValues(context.currentTime);
  master.gain.setTargetAtTime(muted ? 0 : MASTER_LEVEL, context.currentTime, MUTE_SMOOTHING_S);
};

export const swooshWelcomeScene = (): void => {
  if (!activeAudio) return;
  playPaperSwoosh(activeAudio.context, activeAudio.master, activeAudio.context.currentTime);
};

export const scribbleWelcomeInk = (gesture: InkGesture): void => {
  if (!activeAudio) return;
  const { context, master } = activeAudio;
  playPencilScribble(context, master, context.currentTime, gesture);
};

export const tapWelcomeKey = (): void => {
  if (!activeAudio) return;
  playKeyTap(activeAudio.context, activeAudio.master);
};

export const sparkleWelcomeExport = (): void => {
  if (!activeAudio) return;
  playExportSparkle(activeAudio.context, activeAudio.stage, activeAudio.context.currentTime);
};

export const popWelcomeClick = (): void => {
  if (!activeAudio) return;
  playManualClick(activeAudio.context, activeAudio.master);
};

export const clickWelcomeCursor = (): void => {
  if (!activeAudio) return;
  playMouseClick(activeAudio.context, activeAudio.master);
};

export const stopWelcomeSound = (): void => {
  if (!activeAudio) return;
  const { context, master, track } = activeAudio;
  activeAudio = null;
  master.gain.cancelScheduledValues(context.currentTime);
  track?.stop();
  master.gain.setTargetAtTime(0, context.currentTime, FADE_OUT_S / 3);
  window.setTimeout(() => {
    void context.close();
  }, CLOSE_AFTER_MS);
};
