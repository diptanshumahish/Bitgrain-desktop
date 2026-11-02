export const templateDetailPath = (category: string, templateId: string): string =>
  `/templates/${encodeURIComponent(category)}/${encodeURIComponent(templateId)}`;

export const templateStartPath = (templateId: string): string =>
  `/studio/edit?${new URLSearchParams({ template: templateId }).toString()}`;
