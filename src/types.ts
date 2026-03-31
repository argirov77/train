export type SourceKind = 'youtube' | 'doc' | 'article' | 'link';

export interface Source {
  id: string;
  item_id: string;
  label: string;
  url: string;
  kind: SourceKind;
}

export interface Question {
  id: string;
  item_id: string;
  text: string;
  position: number;
}

export interface Item {
  id: string;
  topic_id: string;
  title: string;
  position: number;
  checked: boolean;
  checked_at: string | null;
  sources: Source[];
  questions: Question[];
}

export interface Topic {
  id: string;
  section_id: string;
  title: string;
  description?: string;
  position: number;
  items: Item[];
}

export interface Section {
  id: string;
  title: string;
  description?: string;
  position: number;
  topics: Topic[];
}

export interface ActivityLog {
  id: string;
  date: string;
  items_done: number;
}

export interface StreakInfo {
  current: number;
  longest: number;
  today: boolean;
}
