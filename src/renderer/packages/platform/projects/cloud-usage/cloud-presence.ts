const absentFromCloud = new Set<string>();

export const markAbsentFromCloud = (projectId: string): void => {
  absentFromCloud.add(projectId);
};

export const markPresentInCloud = (projectId: string): void => {
  absentFromCloud.delete(projectId);
};

export const isKnownAbsentFromCloud = (projectId: string): boolean => absentFromCloud.has(projectId);
