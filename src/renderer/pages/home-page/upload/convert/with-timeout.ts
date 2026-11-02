export const withTimeout = async <T>(work: Promise<T>, timeoutMs: number, label: string): Promise<T> => {
  let timer = 0;
  const timeout = new Promise<never>((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(`${label} timed out after ${timeoutMs}ms`)), timeoutMs);
  });
  try {
    return await Promise.race([work, timeout]);
  } finally {
    window.clearTimeout(timer);
  }
};
