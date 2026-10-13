import { ASCII_SAMPLES_X, ASCII_SAMPLES_Y } from "../ascii";

export interface SampleSize {
  sampleWidth: number;
  sampleHeight: number;
}

export const asciiSampleSize = (cols: number, rows: number, isAscii: boolean): SampleSize => ({
  sampleWidth: isAscii ? cols * ASCII_SAMPLES_X : cols,
  sampleHeight: isAscii ? rows * ASCII_SAMPLES_Y : rows,
});
