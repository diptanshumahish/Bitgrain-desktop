const BYTES_PER_KB = 1024;
const BYTES_PER_MB = BYTES_PER_KB * BYTES_PER_KB;

const formatBytes = (bytes: number): string => {
  if (bytes < BYTES_PER_KB) return `${bytes} B`;
  if (bytes < BYTES_PER_MB) return `${Math.round(bytes / BYTES_PER_KB)} KB`;
  return `${(bytes / BYTES_PER_MB).toFixed(1)} MB`;
};

export const estimateLabel = (bytes: number | null, loading: boolean): string => {
  if (loading) return "Working it out";
  if (bytes === null) return "";
  return `About ${formatBytes(bytes)}`;
};
