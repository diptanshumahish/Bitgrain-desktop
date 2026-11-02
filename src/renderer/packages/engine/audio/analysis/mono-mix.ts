export const mixToMono = (buffer: AudioBuffer): Float32Array => {
  const mono = new Float32Array(buffer.length);
  const channelCount = Math.max(1, buffer.numberOfChannels);
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let index = 0; index < data.length; index++) mono[index] += data[index] / channelCount;
  }
  return mono;
};
