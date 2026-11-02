export type TrackSurface = "editor" | "studio" | "video" | "checkout" | "account" | "admin" | "marketing";

const SURFACE_PREFIXES: ReadonlyArray<[string, TrackSurface]> = [
  ["/editor", "editor"],
  ["/studio", "studio"],
  ["/video", "video"],
  ["/checkout", "checkout"],
  ["/account", "account"],
  ["/admin", "admin"],
];

export function resolveSurface(pathname: string): TrackSurface {
  const match = SURFACE_PREFIXES.find(([prefix]) => pathname.startsWith(prefix));
  return match ? match[1] : "marketing";
}
