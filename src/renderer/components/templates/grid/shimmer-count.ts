const INITIAL_SHIMMER_COUNT = 12;
const TAIL_SHIMMER_COUNT = 6;

interface ShimmerCountInput {
  templateCount: number;
  isPending: boolean;
  hasMore: boolean;
  failed: boolean;
}

export function shimmerCount({ templateCount, isPending, hasMore, failed }: ShimmerCountInput): number {
  if (failed) return 0;
  if (templateCount === 0) return isPending ? INITIAL_SHIMMER_COUNT : 0;
  return isPending || hasMore ? TAIL_SHIMMER_COUNT : 0;
}
