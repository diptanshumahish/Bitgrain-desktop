import { callApiWithOutcome } from "@bitgrain/api/api-client";
import type { ApiOutcome } from "@bitgrain/api/api-outcome";

interface StoredProjectImage {
  url: string;
}

export async function uploadProjectImage(dataUrl: string): Promise<ApiOutcome<StoredProjectImage>> {
  return await callApiWithOutcome<StoredProjectImage>("/api/projects/images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ dataUrl }),
  });
}
