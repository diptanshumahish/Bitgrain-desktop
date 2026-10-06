import type { AudioEq } from "../types";

export const EQ_GAIN_RANGE = 12;

const EQ_LOW_FREQ = 200;
const EQ_MID_FREQ = 1000;
const EQ_MID_Q = 0.9;
const EQ_HIGH_FREQ = 4000;

export function isEqActive(eq: AudioEq | undefined): eq is AudioEq {
  return !!eq && (eq.low !== 0 || eq.mid !== 0 || eq.high !== 0);
}

export interface EqChain {
  input: AudioNode;
  output: AudioNode;
}

export function buildEqChain(ctx: BaseAudioContext, eq: AudioEq | undefined): EqChain | null {
  if (!isEqActive(eq)) return null;

  const low = ctx.createBiquadFilter();
  low.type = "lowshelf";
  low.frequency.value = EQ_LOW_FREQ;
  low.gain.value = eq.low;

  const mid = ctx.createBiquadFilter();
  mid.type = "peaking";
  mid.frequency.value = EQ_MID_FREQ;
  mid.Q.value = EQ_MID_Q;
  mid.gain.value = eq.mid;

  const high = ctx.createBiquadFilter();
  high.type = "highshelf";
  high.frequency.value = EQ_HIGH_FREQ;
  high.gain.value = eq.high;

  low.connect(mid);
  mid.connect(high);
  return { input: low, output: high };
}
