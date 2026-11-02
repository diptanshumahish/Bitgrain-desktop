export interface ShimmerShape {
  ratio: number;
  aspectClass: string;
}

const SHIMMER_SHAPES: ShimmerShape[] = [
  { ratio: 1.25, aspectClass: "aspect-[4/5]" },
  { ratio: 1, aspectClass: "aspect-square" },
  { ratio: 1.414, aspectClass: "aspect-[1/1.414]" },
  { ratio: 1.778, aspectClass: "aspect-[9/16]" },
  { ratio: 0.75, aspectClass: "aspect-[4/3]" },
  { ratio: 1.333, aspectClass: "aspect-[3/4]" },
];

export function shimmerShapeAt(slot: number): ShimmerShape {
  return SHIMMER_SHAPES[slot % SHIMMER_SHAPES.length];
}
