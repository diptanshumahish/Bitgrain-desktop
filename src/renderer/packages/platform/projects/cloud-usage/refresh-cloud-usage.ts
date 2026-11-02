import { listProjects } from "../projects-api";
import { setCloudProjectCount } from "./cloud-usage-store";

export async function refreshCloudUsage(): Promise<void> {
  const summaries = await listProjects();
  setCloudProjectCount(summaries.length);
}
