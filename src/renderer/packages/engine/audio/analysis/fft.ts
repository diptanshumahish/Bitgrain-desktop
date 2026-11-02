const FULL_TURN = 2 * Math.PI;
const HANN_BASE = 0.5;

const swapPair = (values: Float32Array, first: number, second: number): void => {
  const held = values[first];
  values[first] = values[second];
  values[second] = held;
};

const bitReverseOrder = (real: Float32Array, imag: Float32Array): void => {
  const size = real.length;
  let reversed = 0;
  for (let index = 1; index < size; index++) {
    let bit = size >> 1;
    while (reversed & bit) {
      reversed ^= bit;
      bit >>= 1;
    }
    reversed ^= bit;
    if (index >= reversed) continue;
    swapPair(real, index, reversed);
    swapPair(imag, index, reversed);
  }
};

const butterflyBlock = (real: Float32Array, imag: Float32Array, start: number, length: number): void => {
  const half = length / 2;
  for (let offset = 0; offset < half; offset++) {
    const angle = (-FULL_TURN * offset) / length;
    const twiddleReal = Math.cos(angle);
    const twiddleImag = Math.sin(angle);
    const evenIndex = start + offset;
    const oddIndex = evenIndex + half;
    const oddReal = real[oddIndex] * twiddleReal - imag[oddIndex] * twiddleImag;
    const oddImag = real[oddIndex] * twiddleImag + imag[oddIndex] * twiddleReal;
    real[oddIndex] = real[evenIndex] - oddReal;
    imag[oddIndex] = imag[evenIndex] - oddImag;
    real[evenIndex] += oddReal;
    imag[evenIndex] += oddImag;
  }
};

const fftInPlace = (real: Float32Array, imag: Float32Array): void => {
  bitReverseOrder(real, imag);
  for (let length = 2; length <= real.length; length <<= 1) {
    for (let start = 0; start < real.length; start += length) butterflyBlock(real, imag, start, length);
  }
};

export const hannWindow = (size: number): Float32Array => {
  const window = new Float32Array(size);
  for (let index = 0; index < size; index++) {
    window[index] = HANN_BASE - HANN_BASE * Math.cos((FULL_TURN * index) / (size - 1));
  }
  return window;
};

export const magnitudeSpectrum = (samples: Float32Array, center: number, window: Float32Array): Float32Array => {
  const size = window.length;
  const real = new Float32Array(size);
  const imag = new Float32Array(size);
  const first = Math.round(center - size / 2);
  for (let index = 0; index < size; index++) real[index] = (samples[first + index] ?? 0) * window[index];
  fftInPlace(real, imag);
  const magnitudes = new Float32Array(size / 2);
  for (let bin = 0; bin < magnitudes.length; bin++) magnitudes[bin] = Math.hypot(real[bin], imag[bin]) / size;
  return magnitudes;
};
