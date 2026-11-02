const HANDOFF_PARAM = "figma";
const HANDOFF_ID = /^[a-f0-9]{64}$/;
const MAX_ITEMS = 12;

export const takeFigmaHandoffIds = (): string[] => {
  const url = new URL(window.location.href);
  const raw = url.searchParams.get(HANDOFF_PARAM);
  if (raw === null) return [];
  url.searchParams.delete(HANDOFF_PARAM);
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => HANDOFF_ID.test(id))
    .slice(0, MAX_ITEMS);
};
