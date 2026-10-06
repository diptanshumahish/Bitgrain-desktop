import { loadBTG, type BTGProject } from "../utils/btg-export";

export function useBTGImport() {
  const importBTG = async (file: File): Promise<BTGProject | null> => {
    try {
      const project = await loadBTG(file);
      return project;
    } catch (error) {
      console.error("Failed to import BTG file:", error);
      return null;
    }
  };

  const handleBTGFileInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoad: (project: BTGProject) => void,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importBTG(file).then((project) => {
      if (project) {
        onLoad(project);
      }
    });
  };

  return { importBTG, handleBTGFileInput };
}
