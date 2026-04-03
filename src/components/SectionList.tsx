import { SectionCard } from '@/components/SectionCard';
import type { Section, SourceKind } from '@/types';

interface SectionListProps {
  sections: Section[];
  onAddTopic: (sectionId: string) => void;
  onAddItem: (topicId: string) => void;
  onDeleteSection: (id: string) => Promise<void>;
  onDeleteTopic: (id: string) => Promise<void>;
  onToggle: (itemId: string, checked: boolean) => Promise<{ xpAwarded?: number }>;
  onDeleteItem: (id: string) => Promise<void>;
  addSource: (itemId: string, label: string, url: string, kind: SourceKind) => Promise<void>;
  deleteSource: (id: string) => Promise<void>;
  addQuestion: (itemId: string, text: string, position: number) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  recordAttempt: (questionId: string, userAnswer: string, isCorrect: boolean, responseTimeMs?: number) => Promise<void>;
}

export function SectionList(props: SectionListProps) {
  const { sections, ...rest } = props;
  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <SectionCard key={section.id} section={section} {...rest} />
      ))}
    </div>
  );
}
