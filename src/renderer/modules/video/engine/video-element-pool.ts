import { getMediaBlob } from "../utils/media-blob-store";

interface PoolEntry {
  element: HTMLVideoElement;
  url: string;
  ready: Promise<void>;
}

const pool = new Map<string, PoolEntry>();

function getHiddenVideoHost(): HTMLDivElement {
  const existing = document.getElementById("imgi-video-pool-host");
  if (existing) return existing as HTMLDivElement;
  const host = document.createElement("div");
  host.id = "imgi-video-pool-host";
  host.style.cssText =
    "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;";
  host.setAttribute("aria-hidden", "true");
  document.body.appendChild(host);
  return host;
}

async function loadVideoElement(blobId: string): Promise<PoolEntry> {
  const blob = await getMediaBlob(blobId);
  if (!blob) throw new Error(`media blob ${blobId} missing`);
  const url = URL.createObjectURL(blob);
  const element = document.createElement("video");
  element.src = url;
  element.muted = true;
  element.playsInline = true;
  element.preload = "auto";
  element.crossOrigin = "anonymous";
  element.style.cssText = "width:1px;height:1px;";
  getHiddenVideoHost().appendChild(element);

  const ready = new Promise<void>((resolve, reject) => {
    element.onloadeddata = () => resolve();
    element.onerror = () => reject(new Error("video load failed"));
  });

  return { element, url, ready };
}

// Which consumer an element belongs to. The background pre-renderer walks ahead
// of the playhead seeking to future times, so it must never share a decoder with
// live playback, or scrubbing one would yank the other's picture. One extra
// decoder per asset is a cheap trade on desktop for keeping the two independent.
export type VideoElementScope = "live" | "prerender";

// `slot` separates two simultaneous readers of the *same* asset. A cross
// dissolve between two clips cut from one source needs two different frames of
// that source on screen at once; with a single shared element each would seek
// the other away and both layers would show the same picture.
export async function acquireVideoElement(
  blobId: string,
  scope: VideoElementScope = "live",
  slot = 0,
): Promise<HTMLVideoElement> {
  const key = `${scope}:${slot}:${blobId}`;
  const existing = pool.get(key);
  if (existing) {
    await existing.ready;
    return existing.element;
  }
  const entry = await loadVideoElement(blobId);
  pool.set(key, entry);
  await entry.ready;
  return entry.element;
}

// Drops every element for a scope and revokes its object URLs. Used when the
// pre-renderer shuts down, so its decoders do not outlive the project.
export function releaseVideoElements(scope: VideoElementScope): void {
  const prefix = `${scope}:`;
  for (const [key, entry] of pool) {
    if (!key.startsWith(prefix)) continue;
    entry.element.pause();
    entry.element.removeAttribute("src");
    entry.element.load();
    entry.element.remove();
    URL.revokeObjectURL(entry.url);
    pool.delete(key);
  }
}

