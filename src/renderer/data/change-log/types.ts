export type ChangeLogType =
  | 'feature'
  | 'fix'
  | 'improvement'
  | 'announcement'
  | 'refactor'
  | 'chore'
  | 'docs'
  | 'perf'
  | 'style'
  | 'merge';

export interface ChangeLogEntry {
  version: string;
  date: string;
  commit: string;
  title: string;
  description: string;
  items?: string[];
  type: ChangeLogType;
}
