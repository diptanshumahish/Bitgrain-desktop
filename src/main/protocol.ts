import { net, protocol } from "electron";
import { join, normalize } from "node:path";
import { pathToFileURL } from "node:url";

export const APP_SCHEME = "app";
export const APP_HOST = "bundle";
export const APP_ENTRY = `${APP_SCHEME}://${APP_HOST}/index.html`;

// Registered before app ready so the renderer origin behaves like a normal
// secure web origin. Loading the app over app:// (instead of file://) makes
// absolute asset paths such as /bitgrainlogo.png and /sample.jpg resolve against
// the renderer root, which file:// cannot do.
export function registerAppScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: APP_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        stream: true,
        codeCache: true,
      },
    },
  ]);
}

// Serves the bundled renderer. Instance documents are self-contained (assets and
// thumbnails are embedded as data URLs inside each `.bitgrain` file), so there is
// no per-project media to resolve over this scheme.
export function serveRendererOverAppScheme(): void {
  const rendererRoot = join(import.meta.dirname, "../renderer");

  protocol.handle(APP_SCHEME, async (request) => {
    const url = new URL(request.url);
    const rawPath = decodeURIComponent(url.pathname);

    const relativePath = rawPath === "/" || rawPath === "" ? "/index.html" : rawPath;
    const resolved = normalize(join(rendererRoot, relativePath));
    if (!resolved.startsWith(rendererRoot)) {
      return new Response("forbidden", { status: 403 });
    }

    return net.fetch(pathToFileURL(resolved).toString());
  });
}
