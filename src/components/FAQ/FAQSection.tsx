import { useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { FAQSchema, defaultFAQItems } from "@/components/SEO/FAQSchema";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { EditableFAQItem } from "@/components/EditableFAQItem";
import { Link } from "react-router-dom";
import { useContactInfo } from "@/hooks/useContactInfo";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { EditButton } from "@/components/ui/EditButton";
import { SectionEditModal } from "@/components/SectionEditModal";

export const FAQSection = () => {
  const { phone, phoneHref } = useContactInfo();
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { content: headingRaw } = useEditableContent('faq-bottom', 'heading');
  const { content: descRaw } = useEditableContent('faq-bottom', 'description');
  const { content: cta1Raw } = useEditableContent('faq-bottom', 'cta_quote');
  const heading = headingRaw || 'Har du flere spørsmål?';
  const desc = descRaw || 'Ring oss på telefon eller send inn forespørsel, så hjelper vi deg.';
  const cta1 = cta1Raw || 'Send forespørsel';

  return (
    <section className="py-16 bg-background" id="faq">
      <FAQSchema faqItems={defaultFAQItems} />

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {defaultFAQItems.map((item, index) => <EditableFAQItem key={index} section={`faq-item-${index + 1}`} defaultQuestion={item.question} defaultAnswer={item.answer} index={index} />)}
          </Accordion>

          <div className="text-center mt-12 p-8 bg-muted/30 rounded-xl subtle-hover relative">
            {isAdmin && editMode && (
              <EditButton
                onClick={() => setIsModalOpen(true)}
                ariaLabel="Rediger FAQ-bunnseksjon"
              />
            )}
            <h3 className="text-xl font-bold text-foreground mb-4">
              {heading}
            </h3>
            <p className="text-muted-foreground mb-6">
              {desc}
            </p>
            <Button size="lg" variant="outline" className="mr-4" onClick={() => window.location.href = phoneHref}>
              <Phone className="mr-2 h-4 w-4" />
              {phone}
            </Button>
            <Button size="lg" className="bg-success hover:bg-success-hover text-success-foreground" asChild>
              <Link to="/tilbud">{cta1}</Link>
            </Button>
          </div>
        </div>
      </div>

      <SectionEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Rediger FAQ-bunnseksjon"
        fields={[
          { section: 'faq-bottom', contentKey: 'heading', label: 'Overskrift', value: heading, maxLength: 60, placeholder: 'Har du flere spørsmål?' },
          { section: 'faq-bottom', contentKey: 'description', label: 'Beskrivelse', value: desc, multiline: true, maxLength: 200, placeholder: 'Ring oss på...' },
          { section: 'faq-bottom', contentKey: 'cta_quote', label: 'Knapp-tekst (Send forespørsel)', value: cta1, maxLength: 40, placeholder: 'Send forespørsel' },
        ]}
      />
    </section>
  );
};
