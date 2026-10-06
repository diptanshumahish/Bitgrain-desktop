export type DesktopPlatform = "mac" | "windows" | "linux" | "web";

const resolvePlatform = (): DesktopPlatform => {
  const raw = window.bitgrain?.platform;
  if (raw === "darwin") return "mac";
  if (raw === "win32") return "windows";
  if (raw === "linux") return "linux";
  return "web";
};

export const desktopPlatform: DesktopPlatform = resolvePlatform();
export const isDesktop = desktopPlatform !== "web";
