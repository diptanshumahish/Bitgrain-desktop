export const STEP_SECONDS = 0.15;
export const STEPS_PER_BAR = 16;
export const ARP_ENTRY_STEP = 16;
export const HEARTBEAT_ENTRY_STEP = 64;
export const FILTER_OPEN_SECONDS = 14;

export interface Chord {
  bass: number;
  pad: number[];
  arp: number[];
}

export const CHORDS: Chord[] = [
  { bass: 55, pad: [220, 261.63, 329.63], arp: [220, 261.63, 329.63, 440, 523.25] },
  { bass: 43.65, pad: [174.61, 220, 329.63], arp: [174.61, 220, 261.63, 329.63, 440] },
  { bass: 36.71, pad: [146.83, 174.61, 220], arp: [146.83, 174.61, 220, 293.66, 349.23] },
  { bass: 41.2, pad: [164.81, 207.65, 246.94], arp: [164.81, 207.65, 246.94, 329.63, 415.3] },
];

export const ARP_PATTERN = [0, 1, 2, 3, 4, 3, 2, 1, 0, 2, 3, 4, 3, 2, 3, 1];
export const HEARTBEAT_STEP = 0;
