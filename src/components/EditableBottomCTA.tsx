import { useState } from 'react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { useContactInfo } from '@/hooks/useContactInfo';
import { BottomCTAEditModal } from './BottomCTAEditModal';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { EditButton } from './ui/EditButton';
import { ArrowRight, Phone, Star } from 'lucide-react';
import { useFadeInUp } from '@/hooks/useScrollAnimation';

export const EditableBottomCTA = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { phone, phoneHref } = useContactInfo();
  const { content: heading } = useEditableContent('bottom-cta', 'heading');
  const { content: description } = useEditableContent('bottom-cta', 'description');
  const { content: button1 } = useEditableContent('bottom-cta', 'button_1');
  const { content: button2 } = useEditableContent('bottom-cta', 'button_2');

  const defaultData = {
    heading: heading || 'Klar til å komme i gang?',
    description: description || 'Få et uforpliktende tilbud på dine håndverksbehov i dag',
    button1: button1 || 'Få tilbud',
    button2: button2 || `Ring oss: ${phone}`
  };

  const { ref, style } = useFadeInUp({ threshold: 0.15 });

  return (
    <>
      <section className="relative py-10 md:py-20 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        {/* Dot-pattern overlay som matcher gradient-headere ellers på siden */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* Subtil gradient-glød fra venstre kant */}
        <div className="absolute -left-32 top-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/30 via-primary/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger" />
        )}

        <div ref={ref} style={style} className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            {/* Mini trust-strip øverst — Mr. Handyman-mønster */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-4 py-1.5 mb-6">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-xs md:text-sm text-white/90 font-medium">
                Anbefalt av hundrevis av fornøyde kunder
              </span>
            </div>

            {/* Heading — ren uten ikon, ber trust-strip over fremfor visuell vekt */}
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-4">
              {defaultData.heading}
            </h2>

            <p className="text-base md:text-lg mb-8 text-white/85 max-w-2xl mx-auto">
              {defaultData.description}
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
              <Link to="/tilbud" className="w-full sm:w-auto">
                <Button
                  variant="cta"
                  size="lg"
                  className="w-full sm:w-auto text-base md:text-lg px-8 py-6 font-semibold group/btn shadow-lg"
                >
                  {defaultData.button1}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </Link>
              <a href={phoneHref} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base md:text-lg px-8 py-6 bg-white/10 text-white border-white/30 hover:bg-white/20 hover:border-white/50 backdrop-blur-sm"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  {defaultData.button2}
                </Button>
              </a>
            </div>

            {/* Sekundær CTA */}
            <div className="pt-4 border-t border-white/15">
              <Link
                to="/fast-avtale"
                className="inline-flex items-center gap-2 text-sm md:text-base text-white/80 hover:text-white transition-colors group/sec"
              >
                <span>Fast oppdrag? Spar 10% med fast avtale</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover/sec:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <BottomCTAEditModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} section="bottom-cta" currentData={defaultData} />
    </>
  );
};
