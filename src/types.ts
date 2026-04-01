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
  options?: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  explanation?: string;
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
  isLocked?: boolean;
  lockReason?: string;
}

export interface Topic {
  id: string;
  section_id: string;
  title: string;
  description?: string;
  position: number;
  items: Item[];
  isLocked?: boolean;
  lockReason?: string;
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
  user_id: string;
  date: string;
  items_done: number;
}

export interface UserProgress {
  item_id: string;
  is_completed: boolean;
  completed_at: string | null;
}

export interface StreakInfo {
  current: number;
  longest: number;
  today: boolean;
}
