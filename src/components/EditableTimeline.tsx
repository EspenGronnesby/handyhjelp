import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { TimelineEditModal } from './TimelineEditModal';

export const EditableTimeline = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { content: heading } = useEditableContent('about-timeline', 'heading');
  const { content: year1 } = useEditableContent('about-timeline', 'year_1');
  const { content: event1 } = useEditableContent('about-timeline', 'event_1');
  const { content: year2 } = useEditableContent('about-timeline', 'year_2');
  const { content: event2 } = useEditableContent('about-timeline', 'event_2');
  const { content: year3 } = useEditableContent('about-timeline', 'year_3');
  const { content: event3 } = useEditableContent('about-timeline', 'event_3');
  const { content: year4 } = useEditableContent('about-timeline', 'year_4');
  const { content: event4 } = useEditableContent('about-timeline', 'event_4');
  const { content: year5 } = useEditableContent('about-timeline', 'year_5');
  const { content: event5 } = useEditableContent('about-timeline', 'event_5');
  const { content: year6 } = useEditableContent('about-timeline', 'year_6');
  const { content: event6 } = useEditableContent('about-timeline', 'event_6');

  const timeline = [
    { year: year1 || '2004', event: event1 || 'HandyHjelp ble grunnlagt i Kristiansand' },
    { year: year2 || '2008', event: event2 || 'Utvidet til å tilby blikkenslagertjenester' },
    { year: year3 || '2012', event: event3 || 'Nådde milepælen med 100 fornøyde bedriftskunder' },
    { year: year4 || '2016', event: event4 || 'Fikk sertifisering som godkjent entreprenør' },
    { year: year5 || '2020', event: event5 || 'Lanserte faste vedlikeholdsavtaler for bedrifter' },
    { year: year6 || '2025', event: event6 || 'Over 200 faste kunder og 20+ års erfaring' },
  ];

  return (
    <>
      <div className="bg-muted rounded-2xl p-12 mb-20 relative">
        {isAdmin && editMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
        )}

        <h2 className="text-3xl font-bold text-center mb-12">{heading || 'Vår reise'}</h2>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-20 text-right">
                  <span className="text-2xl font-bold text-primary">{item.year}</span>
                </div>
                <div className="flex-shrink-0 mt-2">
                  <div className="w-4 h-4 rounded-full bg-primary"></div>
                </div>
                <div className="flex-1 pb-8 border-l-2 border-border pl-6 -ml-2">
                  <p className="text-lg">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TimelineEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        section="about-timeline"
        currentData={{ heading: heading || 'Vår reise', timeline }}
      />
    </>
  );
};
