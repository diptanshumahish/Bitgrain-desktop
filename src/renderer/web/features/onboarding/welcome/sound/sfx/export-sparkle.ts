import { playArpNote } from "../instruments/synth-arp";
import { STEP_SECONDS } from "../arrangement";

const STAB_NOTES_HZ = [440, 523.25, 659.25, 880, 1046.5, 1318.51];
const NOTE_SPACING_S = STEP_SECONDS / 2;

export const playExportSparkle = (context: AudioContext, output: AudioNode, startAt: number): void => {
  STAB_NOTES_HZ.forEach((frequency, index) => playArpNote(context, output, frequency, startAt + index * NOTE_SPACING_S));
};
