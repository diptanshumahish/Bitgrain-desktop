const NICE_STEPS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000];
const MIN_LABEL_SPACING_PX = 56;
const MINOR_DIVISIONS = 5;
const MIN_MINOR_SPACING_PX = 4;

interface RulerTick {
  value: number;
  screen: number;
  major: boolean;
}

interface RulerSpan {
  origin: number;
  zoom: number;
  length: number;
}

const majorStep = (zoom: number): number =>
  NICE_STEPS.find((step) => step * zoom >= MIN_LABEL_SPACING_PX) ?? NICE_STEPS[NICE_STEPS.length - 1];

const tickStep = (major: number, zoom: number): number => {
  const minor = major / MINOR_DIVISIONS;
  return minor * zoom >= MIN_MINOR_SPACING_PX ? minor : major;
};

export const rulerTicks = ({ origin, zoom, length }: RulerSpan): RulerTick[] => {
  const major = majorStep(zoom);
  const step = tickStep(major, zoom);
  const firstIndex = Math.floor(-origin / zoom / step);
  const lastIndex = Math.ceil((length - origin) / zoom / step);
  const perMajor = Math.round(major / step);
  const ticks: RulerTick[] = [];
  for (let index = firstIndex; index <= lastIndex; index += 1) {
    const value = index * step;
    ticks.push({ value, screen: origin + value * zoom, major: index % perMajor === 0 });
  }
  return ticks;
};
