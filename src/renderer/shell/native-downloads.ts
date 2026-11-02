// Every file the web packages write ends in an `<a download>` click on a blob or
// data URL (`@bitgrain/core/files/download-blob`, the engine exporter, studio's
// PNG/PDF/PPTX paths, jsPDF's `save`). Instead of patching each of those vendored
// files, the desktop intercepts the click once and hands the bytes to the native
// save dialog (`window.bitgrain.saveFile`). The packages stay byte-identical to
// web and no browser download ever starts. See PORTED.md, deviation 1.

const blobsByUrl = new Map<string, Blob>();

const rememberObjectUrls = (): void => {
  const create = URL.createObjectURL.bind(URL);
  const revoke = URL.revokeObjectURL.bind(URL);
  URL.createObjectURL = (object: Blob | MediaSource): string => {
    const url = create(object);
    if (object instanceof Blob) blobsByUrl.set(url, object);
    return url;
  };
  URL.revokeObjectURL = (url: string): void => {
    blobsByUrl.delete(url);
    revoke(url);
  };
};

const readBytes = async (href: string, blob: Blob | undefined): Promise<Uint8Array> => {
  if (blob) return new Uint8Array(await blob.arrayBuffer());
  const response = await fetch(href);
  return new Uint8Array(await response.arrayBuffer());
};

const isFileHref = (href: string): boolean => href.startsWith("blob:") || href.startsWith("data:");

const saveAnchor = (anchor: HTMLAnchorElement): boolean => {
  const bridge = window.bitgrain;
  const href = anchor.href;
  if (!bridge || !anchor.hasAttribute("download") || !isFileHref(href)) return false;
  const fileName = anchor.getAttribute("download") || "bitgrain-export";
  const pending = readBytes(href, blobsByUrl.get(href));
  void pending.then((bytes) => bridge.saveFile(fileName, bytes)).catch((error: unknown) => {
    console.error("[bitgrain] native save failed", error);
  });
  return true;
};

export const installNativeDownloads = (): void => {
  if (!window.bitgrain) return;
  rememberObjectUrls();

  const click = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function nativeAwareClick(this: HTMLAnchorElement): void {
    if (saveAnchor(this)) return;
    click.call(this);
  };

  document.addEventListener(
    "click",
    (event) => {
      const anchor = (event.target as Element | null)?.closest?.("a[download]");
      if (anchor instanceof HTMLAnchorElement && saveAnchor(anchor)) event.preventDefault();
    },
    true,
  );
};
