const ID_SEPARATOR = "/";
const ID_RADIX = 36;
const RANDOM_SLICE_START = 2;
const RANDOM_SLICE_END = 8;

const randomSuffix = (): string => Math.random().toString(ID_RADIX).slice(RANDOM_SLICE_START, RANDOM_SLICE_END);

const timeStamp = (): string => Date.now().toString(ID_RADIX);

export const instanceChildId = (instanceId: string, sourceId: string): string =>
  `${instanceId}${ID_SEPARATOR}${sourceId}`;

export const instanceSourceKey = (instanceId: string, childId: string): string | null => {
  const prefix = `${instanceId}${ID_SEPARATOR}`;
  return childId.startsWith(prefix) ? childId.slice(prefix.length) : null;
};

export const makeComponentId = (): string => `component-${timeStamp()}-${randomSuffix()}`;

export const makeComponentSetId = (): string => `component-set-${timeStamp()}-${randomSuffix()}`;

export const makeInstanceId = (): string => `instance-${timeStamp()}-${randomSuffix()}`;

export const makeLayerCopyId = (sourceId: string): string =>
  `${sourceId.split(ID_SEPARATOR).pop() ?? "layer"}-${randomSuffix()}`;
