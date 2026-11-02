import { resolveApiBase } from "@bitgrain/api/api-client";

const SVG_MIME = "image/svg+xml";

export const fetchFigmaSvg = async (id: string): Promise<string> => {
  const response = await fetch(`${resolveApiBase()}/api/thumbnails/${id}`);
  if (!response.ok) throw new Error(`The layers sent from Figma could not be fetched (${response.status})`);
  if (!(response.headers.get("Content-Type") ?? "").includes(SVG_MIME)) throw new Error("That Figma handoff is not an SVG");
  return response.text();
};
