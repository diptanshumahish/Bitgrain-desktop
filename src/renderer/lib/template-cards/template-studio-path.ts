export const TEMPLATE_QUERY_PARAM = "template";

export function templateStudioPath(templateId: string): string {
  const workId = crypto.randomUUID();
  const query = new URLSearchParams({ [TEMPLATE_QUERY_PARAM]: templateId });
  return `/studio/edit/${workId}?${query.toString()}`;
}

export function readTemplateParam(search: string): string | null {
  const value = new URLSearchParams(search).get(TEMPLATE_QUERY_PARAM)?.trim();
  return value ? value : null;
}
