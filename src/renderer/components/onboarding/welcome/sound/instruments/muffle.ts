const MUFFLE_HZ = 1600;
const MUFFLE_Q = 0.5;

export const createMuffle = (context: AudioContext, destination: AudioNode): AudioNode => {
  const muffle = context.createBiquadFilter();
  muffle.type = "lowpass";
  muffle.frequency.value = MUFFLE_HZ;
  muffle.Q.value = MUFFLE_Q;
  muffle.connect(destination);
  return muffle;
};
