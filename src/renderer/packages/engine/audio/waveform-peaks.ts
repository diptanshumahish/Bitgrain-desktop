const peakInBlock = (channel: Float32Array, start: number, end: number): number => {
  let peak = 0;
  for (let index = start; index < end; index++) {
    const magnitude = Math.abs(channel[index]);
    if (magnitude > peak) peak = magnitude;
  }
  return peak;
};

export const downsamplePeaks = (channel: Float32Array, totalPeaks: number): number[] => {
  const blockSize = Math.max(1, Math.floor(channel.length / totalPeaks));
  const peaks: number[] = new Array(totalPeaks);
  for (let peakIndex = 0; peakIndex < totalPeaks; peakIndex++) {
    const start = peakIndex * blockSize;
    peaks[peakIndex] = peakInBlock(channel, start, Math.min(start + blockSize, channel.length));
  }
  return peaks;
};
