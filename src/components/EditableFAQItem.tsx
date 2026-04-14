import { useState } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { FAQEditModal } from './FAQEditModal';
import { AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { EditButton } from './ui/EditButton';

interface EditableFAQItemProps {
  section: string;
  defaultQuestion: string;
  defaultAnswer: string;
  index: number;
}

export const EditableFAQItem = ({
  section,
  defaultQuestion,
  defaultAnswer,
  index
}: EditableFAQItemProps) => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { content: question } = useEditableContent(section, 'question');
  const { content: answer } = useEditableContent(section, 'answer');

  const displayQuestion = question || defaultQuestion;
  const displayAnswer = answer || defaultAnswer;

  return (
    <>
      <AccordionItem value={`item-${index}`} className="card-professional px-6 relative">
        {/* Edit icon */}
        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger" />
        )}

        <AccordionTrigger className="text-left py-6 hover:no-underline">
          <span className="font-semibold text-foreground pr-12">
            {displayQuestion}
          </span>
        </AccordionTrigger>
        <AccordionContent className="pb-6 text-muted-foreground leading-relaxed">
          {displayAnswer}
        </AccordionContent>
      </AccordionItem>

      <FAQEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section={section}
        currentData={{
          question: displayQuestion,
          answer: displayAnswer
        }}
      />
    </>
  );
};
