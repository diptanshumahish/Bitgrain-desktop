export type ShareAccess = "view" | "comment";

export interface ShareSettings {
  access: ShareAccess;
  allowDownload: boolean;
  expiresAt: string | null;
}

export interface ShareLink extends ShareSettings {
  id: string;
  token: string;
  projectId: string;
  createdAt: string;
}

export interface ShareLinkPayload {
  link: ShareLink | null;
}

type SharedProjectMode = "document" | "preview";

export interface SharedPreviewPage {
  id: string;
  name: string;
  width: number;
  height: number;
  image: string;
}

export interface SharedProject {
  projectId: string;
  name: string;
  mode: SharedProjectMode;
  data?: unknown;
  pages?: SharedPreviewPage[];
  access: ShareAccess;
  allowDownload: boolean;
  isOwner: boolean;
  ownerName: string;
  updatedAt: string;
}

export interface ProjectComment {
  id: string;
  threadId: string | null;
  pageId: string;
  x: number | null;
  y: number | null;
  body: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  resolvedAt: string | null;
  createdAt: string;
  editedAt: string | null;
  canDelete: boolean;
  canEdit: boolean;
  unread: boolean;
}

export interface CommentThread {
  root: ProjectComment;
  replies: ProjectComment[];
}

export interface PinDraft {
  pageId: string;
  x: number;
  y: number;
}

export interface CommentPatch {
  resolved?: boolean;
  body?: string;
  x?: number;
  y?: number;
}

export interface NewComment {
  threadId?: string;
  pageId?: string;
  x?: number;
  y?: number;
  body: string;
}

export type CommentSource =
  | { kind: "owner"; projectId: string }
  | { kind: "shared"; token: string };

export type CommentingMode = "off" | "sign-in" | "write";
