import { signal } from "../../../lib/signal";

export const isPlayingSignal = signal(false);
export const loopEnabledSignal = signal(false);

// Transport speed as a multiple of real time, negative for reverse. Driven by
// the J/K/L shuttle: repeated presses walk the ladder outward, the transport
// every desktop NLE has and the web build did not.
export const playbackRateSignal = signal(1);

export const SHUTTLE_LADDER = [1, 2, 4, 8] as const;

type ShuttleRate = (typeof SHUTTLE_LADDER)[number];

function nextRung(rate: number): number {
  const idx = SHUTTLE_LADDER.indexOf(Math.abs(rate) as ShuttleRate);
  if (idx < 0) return 1;
  return SHUTTLE_LADDER[Math.min(SHUTTLE_LADDER.length - 1, idx + 1)];
}

export function setPlaying(playing: boolean): void {
  isPlayingSignal.value = playing;
  if (!playing) playbackRateSignal.value = 1;
}

export function togglePlaying(): void {
  if (isPlayingSignal.value) {
    setPlaying(false);
    return;
  }
  playbackRateSignal.value = 1;
  isPlayingSignal.value = true;
}

export function toggleLoop(): void {
  loopEnabledSignal.value = !loopEnabledSignal.value;
}

// L: forward. Pressed again while already running forward, step up the ladder.
export function shuttleForward(): void {
  if (!isPlayingSignal.value || playbackRateSignal.value < 0) {
    playbackRateSignal.value = 1;
    isPlayingSignal.value = true;
    return;
  }
  playbackRateSignal.value = nextRung(playbackRateSignal.value);
}

// J: reverse, the same ladder walked the other way.
export function shuttleBackward(): void {
  if (!isPlayingSignal.value || playbackRateSignal.value > 0) {
    playbackRateSignal.value = -1;
    isPlayingSignal.value = true;
    return;
  }
  playbackRateSignal.value = -nextRung(playbackRateSignal.value);
}

// K: stop dead, and reset the ladder so the next J or L starts at 1x.
export function shuttleStop(): void {
  setPlaying(false);
}
