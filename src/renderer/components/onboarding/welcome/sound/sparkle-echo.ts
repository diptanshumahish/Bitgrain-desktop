import { STEP_SECONDS } from "./arrangement";

const DOTTED_EIGHTH_STEPS = 3;
const ECHO_FEEDBACK = 0.38;
const ECHO_TONE_HZ = 1400;
const ECHO_SEND = 0.4;

export const createSparkleEcho = (context: AudioContext, destination: AudioNode): AudioNode => {
  const input = context.createGain();
  const send = context.createGain();
  const delay = context.createDelay();
  const feedback = context.createGain();
  const tone = context.createBiquadFilter();
  send.gain.value = ECHO_SEND;
  delay.delayTime.value = STEP_SECONDS * DOTTED_EIGHTH_STEPS;
  feedback.gain.value = ECHO_FEEDBACK;
  tone.type = "lowpass";
  tone.frequency.value = ECHO_TONE_HZ;
  input.connect(destination);
  input.connect(send).connect(delay).connect(tone).connect(feedback).connect(delay);
  tone.connect(destination);
  return input;
};
