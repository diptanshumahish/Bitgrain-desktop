import { uploadTemplateAsset } from "@bitgrain/platform/templates/template-assets";
import { downscaleImageDataUrl } from "@bitgrain/core/image/downscale-image";
import { fitCutOutBytes } from "./fit-cut-out-bytes";
import { readBlobAsDataUrl } from "./read-blob-as-data-url";

const PNG_MIME = "image/png";
const CUT_OUT_SUFFIX = "cut-out.png";

const cutOutFileName = (layerName: string): string => (layerName ? `${layerName} ${CUT_OUT_SUFFIX}` : CUT_OUT_SUFFIX);

export const storeCutOut = async (blob: Blob, layerName: string): Promise<string> => {
  const dataUrl = await downscaleImageDataUrl(await readBlobAsDataUrl(await fitCutOutBytes(blob)), PNG_MIME);
  const uploaded = await uploadTemplateAsset(dataUrl, cutOutFileName(layerName)).catch((error: unknown) => {
    console.error("Could not upload the cut-out to the asset library", error);
    return null;
  });
  return uploaded ?? dataUrl;
};
