import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQSchema, defaultFAQItems } from "@/components/SEO/FAQSchema";

export const FAQSection = () => {
  return (
    <section className="py-16 bg-background" id="faq">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="heading-section">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">
              Get answers to common questions about our professional property caretaker services.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {defaultFAQItems.map((item, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="card-professional px-6 py-2 border-0 shadow-sm"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <h3 className="font-semibold text-foreground text-lg">
                    {item.question}
                  </h3>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pt-0">
                  <p className="text-muted-foreground leading-relaxed">
                    {item.answer}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Still have questions about our caretaker services?
            </p>
            <a
              href="tel:+1-555-PROCARE"
              className="btn-hero inline-flex items-center gap-2"
            >
              Call Us Now: (555) PROCARE
            </a>
          </div>
        </div>
      </div>
      
      {/* FAQ Structured Data */}
      <FAQSchema faqItems={defaultFAQItems} />
    </section>
  );
};