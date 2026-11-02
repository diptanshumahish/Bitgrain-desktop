const openProjects = new Set<string>();

export const markProjectOpen = (projectId: string): (() => void) => {
  openProjects.add(projectId);
  return () => {
    openProjects.delete(projectId);
  };
};

export const isProjectOpen = (projectId: string): boolean => openProjects.has(projectId);
