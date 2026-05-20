import { Accordion } from "@/components/ui/accordion";
import { FAQSchema, defaultFAQItems } from "@/components/SEO/FAQSchema";
import { EditableFAQItem } from "@/components/EditableFAQItem";

export const FAQSection = () => {
  return (
    <section className="py-16 bg-background" id="faq">
      <FAQSchema faqItems={defaultFAQItems} />

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {defaultFAQItems.map((item, index) => (
              <EditableFAQItem
                key={index}
                section={`faq-item-${index + 1}`}
                defaultQuestion={item.question}
                defaultAnswer={item.answer}
                index={index}
              />
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
