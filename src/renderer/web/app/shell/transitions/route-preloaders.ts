// Desktop (PORTED.md): the web build warms its lazy route chunks on hover. The
// desktop has no such routes (hub links open editor tabs), so this is a no-op and
// the web project-browser pages it would pull in are not bundled.
export const createPreloadHandler =
  (path: string) =>
  (): void => {
    void path;
  };
