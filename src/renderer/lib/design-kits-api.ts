import { callApi } from "./api-client";
import type { DesignKit } from "../data/design-kit-types";

export async function fetchDesignKits(): Promise<DesignKit[] | null> {
  return callApi<DesignKit[]>("/api/design-kits");
}

export async function pushDesignKit(kit: DesignKit): Promise<void> {
  await callApi("/api/design-kits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(kit),
  });
}

export async function deleteDesignKitRemote(id: string): Promise<void> {
  await callApi(`/api/design-kits/${id}`, { method: "DELETE" });
}
