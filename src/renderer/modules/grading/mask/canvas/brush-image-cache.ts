const MAX_CACHED_BRUSHES = 4;

const loaded = new Map<string, HTMLImageElement>();
const inFlight = new Map<string, Promise<HTMLImageElement>>();

const remember = (url: string, image: HTMLImageElement): void => {
  loaded.set(url, image);
  if (loaded.size <= MAX_CACHED_BRUSHES) return;
  const oldest = loaded.keys().next().value;
  if (oldest !== undefined) loaded.delete(oldest);
};

const decode = async (url: string): Promise<HTMLImageElement> => {
  const image = new Image();
  image.src = url;
  await image.decode();
  remember(url, image);
  return image;
};

export const loadBrushImage = (url: string): Promise<HTMLImageElement> => {
  const ready = loaded.get(url);
  if (ready) return Promise.resolve(ready);
  const pending = inFlight.get(url);
  if (pending) return pending;
  const request = decode(url).finally(() => inFlight.delete(url));
  inFlight.set(url, request);
  return request;
};
