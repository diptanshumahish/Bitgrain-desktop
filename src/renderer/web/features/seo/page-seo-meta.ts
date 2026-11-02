export interface PageSeoMeta {
  path: string;
  title: string;
  description: string;
  keywords?: string;
  noindex?: boolean;
  nofollow?: boolean;
  ogType?: string;
  ogImage?: string;
}
