const WATERMARKED_EXPORT_COUNT_KEY = "bitgrain_watermarked_exports";
const REPEAT_PROMPT_EVERY = 3;

const readCount = (): number => {
  try {
    return Number(sessionStorage.getItem(WATERMARKED_EXPORT_COUNT_KEY)) || 0;
  } catch {
    return 0;
  }
};

const writeCount = (next: number): void => {
  try {
    sessionStorage.setItem(WATERMARKED_EXPORT_COUNT_KEY, String(next));
  } catch {
    /* storage unavailable, prompt still shows on first export */
  }
};

export const registerWatermarkedExport = (): number => {
  const next = readCount() + 1;
  writeCount(next);
  return next;
};

export const shouldPromptUpgrade = (exportCount: number): boolean => {
  if (exportCount === 1) return true;
  return exportCount % REPEAT_PROMPT_EVERY === 0;
};
