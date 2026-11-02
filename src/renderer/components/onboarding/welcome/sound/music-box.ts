import { playArpNote } from "./instruments/synth-arp";
import { playPadChord } from "./instruments/synth-pad";
import { playSubBass } from "./instruments/sub-bass";
import { playHeartbeat } from "./instruments/heartbeat";
import {
  ARP_ENTRY_STEP,
  ARP_PATTERN,
  CHORDS,
  FILTER_OPEN_SECONDS,
  HEARTBEAT_ENTRY_STEP,
  HEARTBEAT_STEP,
  STEPS_PER_BAR,
  STEP_SECONDS,
} from "./arrangement";

const LOOKAHEAD_S = 0.4;
const TICK_MS = 50;
const START_DELAY_S = 0.3;
const MIN_LEAD_S = 0.02;
const ARP_FILTER_START_HZ = 450;
const ARP_FILTER_OPEN_HZ = 2000;
const SUB_OCTAVE = 2;

export interface MusicBox {
  stop: () => void;
  nextStepAt: () => number;
}

const createArpBus = (context: AudioContext, output: AudioNode): AudioNode => {
  const sweep = context.createBiquadFilter();
  sweep.type = "lowpass";
  sweep.frequency.setValueAtTime(ARP_FILTER_START_HZ, context.currentTime);
  sweep.frequency.exponentialRampToValueAtTime(ARP_FILTER_OPEN_HZ, context.currentTime + FILTER_OPEN_SECONDS);
  sweep.connect(output);
  return sweep;
};

const playStep = (context: AudioContext, output: AudioNode, arpBus: AudioNode, step: number, startAt: number): void => {
  const beat = step % STEPS_PER_BAR;
  const chord = CHORDS[Math.floor(step / STEPS_PER_BAR) % CHORDS.length];
  const barSeconds = STEP_SECONDS * STEPS_PER_BAR;
  if (beat === 0) {
    playPadChord(context, output, chord.pad, startAt, barSeconds);
    playSubBass(context, output, chord.bass * SUB_OCTAVE, startAt, barSeconds);
  }
  if (step >= ARP_ENTRY_STEP) playArpNote(context, arpBus, chord.arp[ARP_PATTERN[beat]], startAt);
  if (step >= HEARTBEAT_ENTRY_STEP && beat === HEARTBEAT_STEP) playHeartbeat(context, output, startAt);
};

const stepsBehind = (nextAt: number, now: number): number =>
  nextAt < now ? Math.ceil((now - nextAt) / STEP_SECONDS) : 0;

export const startMusicBox = (context: AudioContext, output: AudioNode): MusicBox => {
  const arpBus = createArpBus(context, output);
  let step = 0;
  let nextAt = context.currentTime + START_DELAY_S;
  const schedule = (): void => {
    const skipped = stepsBehind(nextAt, context.currentTime + MIN_LEAD_S);
    step += skipped;
    nextAt += skipped * STEP_SECONDS;
    while (nextAt < context.currentTime + LOOKAHEAD_S) {
      playStep(context, output, arpBus, step, nextAt);
      step += 1;
      nextAt += STEP_SECONDS;
    }
  };
  schedule();
  const timer = window.setInterval(schedule, TICK_MS);
  return {
    stop: () => window.clearInterval(timer),
    nextStepAt: () => {
      const now = context.currentTime + MIN_LEAD_S;
      return nextAt - Math.floor((nextAt - now) / STEP_SECONDS) * STEP_SECONDS;
    },
  };
};
