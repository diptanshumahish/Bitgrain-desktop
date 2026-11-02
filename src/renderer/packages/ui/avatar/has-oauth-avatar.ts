const OAUTH_AVATAR_HOSTS = ["googleusercontent.com", "githubusercontent.com"];

export const hasOAuthAvatar = (avatarUrl?: string | null): boolean =>
  !!avatarUrl && OAUTH_AVATAR_HOSTS.some((host) => avatarUrl.includes(host));
