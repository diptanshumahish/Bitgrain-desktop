import { getAllWorks, removeWork } from "./works-persist";
import { getAllProjects as getAllVideoProjects, removeProject as removeVideoProject } from "../modules/video/utils/project-persist";
import * as ProjectsAPI from "../lib/projects-api";
import type { Work } from "../types/work";
import type { VideoProject } from "../modules/video/types";

export async function syncLocalProjectsToCloud() {
  const works = await getAllWorks();
  const videoProjects = await getAllVideoProjects();

  for (const work of works) {
    const ok = await syncWork(work);
    if (ok) {
      await removeWork(work.id);
    }
  }

  for (const project of videoProjects) {
    const ok = await syncVideoProject(project);
    if (ok) {
      await removeVideoProject(project.id);
    }
  }
}

async function syncWork(work: Work): Promise<boolean> {
  const { id, name, thumbnail, ...data } = work;
  const cloudProject = {
    id,
    kind: "image" as const,
    name,
    thumbnail: thumbnail || undefined,
    data,
  };

  const ok = await ProjectsAPI.updateProject(id, cloudProject);
  if (ok) return true;
  
  const created = await ProjectsAPI.createProject(cloudProject);
  return !!created;
}

async function syncVideoProject(project: VideoProject): Promise<boolean> {
  const { id, name, thumbnail, ...data } = project;
  const cloudProject = {
    id,
    kind: "video" as const,
    name,
    thumbnail: thumbnail || undefined,
    data,
  };

  const ok = await ProjectsAPI.updateProject(id, cloudProject);
  if (ok) return true;

  const created = await ProjectsAPI.createProject(cloudProject);
  return !!created;
}
