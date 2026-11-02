export interface WaveformView {
  peaks: readonly number[];
  duration: number;
  startSeconds: number;
  seconds: number;
}

const BAR_GAP = 1;
const BAR_WIDTH = 2;
const MIN_BAR_HEIGHT = 1;
const WINDOW_FILL_ALPHA = 0.14;
const FALLBACK_ACCENT = "#e5484d";
const FALLBACK_MUTED = "#9a9a9a";

const cssColor = (canvas: HTMLCanvasElement, name: string, fallback: string): string =>
  getComputedStyle(canvas).getPropertyValue(name).trim() || fallback;

const windowSpan = (view: WaveformView, width: number): { left: number; right: number } => {
  const left = (view.startSeconds / view.duration) * width;
  return { left, right: left + (Math.min(view.seconds, view.duration) / view.duration) * width };
};

const paintBars = (context: CanvasRenderingContext2D, view: WaveformView, colors: { accent: string; muted: string }): void => {
  const { width, height } = context.canvas;
  const span = windowSpan(view, width);
  const ratio = window.devicePixelRatio || 1;
  const step = (BAR_WIDTH + BAR_GAP) * ratio;
  for (let x = 0; x < width; x += step) {
    const peak = view.peaks[Math.floor((x / width) * view.peaks.length)] ?? 0;
    const barHeight = Math.max(MIN_BAR_HEIGHT * ratio, peak * height);
    context.fillStyle = x >= span.left && x <= span.right ? colors.accent : colors.muted;
    context.fillRect(x, (height - barHeight) / 2, BAR_WIDTH * ratio, barHeight);
  }
};

export const paintWaveform = (canvas: HTMLCanvasElement, view: WaveformView): void => {
  const context = canvas.getContext("2d");
  if (!context || view.duration <= 0) return;
  const colors = { accent: cssColor(canvas, "--s-accent", FALLBACK_ACCENT), muted: cssColor(canvas, "--s-text-subtle", FALLBACK_MUTED) };
  const span = windowSpan(view, canvas.width);
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.globalAlpha = WINDOW_FILL_ALPHA;
  context.fillStyle = colors.accent;
  context.fillRect(span.left, 0, span.right - span.left, canvas.height);
  context.globalAlpha = 1;
  paintBars(context, view, colors);
  context.strokeStyle = colors.accent;
  context.lineWidth = window.devicePixelRatio || 1;
  context.strokeRect(span.left, 0, span.right - span.left, canvas.height);
};
