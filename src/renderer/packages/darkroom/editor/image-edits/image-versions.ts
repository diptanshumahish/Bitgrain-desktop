import { imageSignal, imageMetaSignal, isSampleSignal, objectUrlRef } from "../../state/image-store";
import { connectHistoryImage } from "../../state/history-store";
import type { ImageMeta } from "../../state/image-meta";
import { persistWorkingImage } from "./persist-working-image";

interface ImageVersion {
  meta: ImageMeta | null;
  isSample: boolean;
}

const versions = new Map<string, ImageVersion>();

export const rememberImageVersion = (url: string, version: ImageVersion): void => {
  versions.set(url, version);
};

const persistRestoredVersion = async (url: string, version: ImageVersion): Promise<void> => {
  const response = await fetch(url);
  await persistWorkingImage(await response.blob(), version.meta, version.isSample);
};

const restoreImageVersion = (url: string): void => {
  const version = versions.get(url);
  if (!version) return;
  objectUrlRef.current = url.startsWith("blob:") ? url : null;
  imageMetaSignal.value = version.meta;
  isSampleSignal.value = version.isSample;
  imageSignal.value = url;
  persistRestoredVersion(url, version).catch((error: unknown) => console.error("Could not keep the restored photo", error));
};

const forgetImageVersions = (): void => {
  versions.forEach((_version, url) => {
    if (url.startsWith("blob:") && url !== imageSignal.value) URL.revokeObjectURL(url);
  });
  versions.clear();
};

imageSignal.subscribe(() => {
  const current = imageSignal.value;
  if (current !== null && versions.size > 0 && !versions.has(current)) forgetImageVersions();
});

connectHistoryImage({ canRestore: (url) => versions.has(url), restore: restoreImageVersion });
