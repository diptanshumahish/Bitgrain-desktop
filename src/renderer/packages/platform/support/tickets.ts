import { callApi } from "@bitgrain/api/api-client";

export interface TicketOption {
  id: string;
  label: string;
}

export const TICKET_TYPES: TicketOption[] = [
  { id: "bug", label: "Bug" },
  { id: "feature", label: "Feature request" },
  { id: "question", label: "Question" },
  { id: "improvement", label: "Improvement" },
  { id: "other", label: "Something else" },
];

export const TICKET_PRIORITIES: TicketOption[] = [
  { id: "low", label: "Low" },
  { id: "normal", label: "Normal" },
  { id: "high", label: "High" },
  { id: "urgent", label: "Urgent" },
];

export const TICKET_CATEGORIES: string[] = [
  "editor",
  "studio",
  "video",
  "export",
  "templates",
  "mockups",
  "account",
  "billing",
  "other",
];

export const ticketTypeLabel = (type: string): string =>
  TICKET_TYPES.find((option) => option.id === type)?.label ?? type;

export const ticketCategoryLabel = (category: string): string =>
  category.charAt(0).toUpperCase() + category.slice(1);

export const TICKET_STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In progress",
  planned: "Planned",
  resolved: "Resolved",
  closed: "Closed",
  wont_fix: "Won't fix",
};

export function bodyPlaceholderForType(type: string): string {
  if (type === "bug") {
    return "What happened, the steps to reproduce it, and what you expected instead.";
  }
  if (type === "feature") {
    return "Describe the feature and what you would use it for.";
  }
  return "Tell us as much as you can.";
}

interface CreateTicketPayload {
  type: string;
  title: string;
  body: string;
  priority?: string;
  category?: string;
  email?: string;
  name?: string;
  source_url?: string;
}

interface CreatedTicket {
  id: string;
  number: number;
  status: string;
  public_token: string;
}

export function submitTicket(payload: CreateTicketPayload): Promise<CreatedTicket | null> {
  return callApi<CreatedTicket>("/api/tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export interface TicketMessage {
  id: string;
  author_type: "user" | "admin" | "system";
  author_name: string | null;
  body: string;
  is_internal: boolean;
  created_at: string;
}

export interface UserTicket {
  id: string;
  number: number;
  type: string;
  title: string;
  body: string;
  status: string;
  priority: string;
  category: string | null;
  created_at: string;
  updated_at: string;
  messages?: TicketMessage[];
}

export function listMyTickets(): Promise<{ items: UserTicket[] } | null> {
  return callApi<{ items: UserTicket[] }>("/api/tickets");
}

export function getTicketByToken(token: string): Promise<UserTicket | null> {
  return callApi<UserTicket>(`/api/tickets/by-token/${encodeURIComponent(token)}`);
}

export function getMyTicket(id: string, token?: string): Promise<UserTicket | null> {
  const suffix = token ? `?token=${encodeURIComponent(token)}` : "";
  return callApi<UserTicket>(`/api/tickets/${id}${suffix}`);
}

export function replyToMyTicket(
  id: string,
  body: string,
  token?: string,
): Promise<{ ok: boolean } | null> {
  return callApi<{ ok: boolean }>(`/api/tickets/${id}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body, token }),
  });
}
