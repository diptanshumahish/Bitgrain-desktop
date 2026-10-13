interface EyeDropperResult {
  sRGBHex: string;
}

interface EyeDropperInstance {
  open: () => Promise<EyeDropperResult>;
}

type EyeDropperConstructor = new () => EyeDropperInstance;

const getEyeDropper = (): EyeDropperConstructor | null =>
  (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper ?? null;

export const canPickScreenColor = (): boolean => typeof window !== "undefined" && getEyeDropper() !== null;

export const pickScreenColor = async (): Promise<string | null> => {
  const EyeDropper = getEyeDropper();
  if (!EyeDropper) return null;
  try {
    const result = await new EyeDropper().open();
    return result.sRGBHex;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return null;
    throw error;
  }
};
