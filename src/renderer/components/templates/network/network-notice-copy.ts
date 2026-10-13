import type { TemplatesNetworkState } from "../../../store/templates-network";

interface NoticeCopy {
  title: string;
  body: string;
}

export const NETWORK_NOTICE_COPY: Record<Exclude<TemplatesNetworkState, "ok">, NoticeCopy> = {
  slow: {
    title: "Templates are taking longer than usual on our side",
    body: "They are still on their way. Everything else in Bitgrain works as usual in the meantime.",
  },
  failed: {
    title: "Templates are taking longer than usual on our side",
    body: "This one is on us, not your connection. Give it another go in a moment.",
  },
};

export const RETRY_LABEL = "Try again";
