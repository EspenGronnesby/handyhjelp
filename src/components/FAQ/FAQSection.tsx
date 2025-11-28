import { Accordion } from "@/components/ui/accordion";
import { FAQSchema, defaultFAQItems } from "@/components/SEO/FAQSchema";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { EditableFAQItem } from "@/components/EditableFAQItem";

export const FAQSection = () => {
  return (
    <section className="py-16 bg-background" id="faq">
      <FAQSchema faqItems={defaultFAQItems} />
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="heading-section">Ofte stilte spørsmål</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Her er svarene på de vanligste spørsmålene om våre tjenester og priser.
          </p>
        </div>

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

          <div className="text-center mt-12 p-8 bg-muted/30 rounded-xl">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Har du flere spørsmål?
            </h3>
            <p className="text-muted-foreground mb-6">
              Ring oss på telefon eller send inn forespørsel, så hjelper vi deg.
            </p>
            <Button 
              size="lg" 
              variant="outline"
              className="mr-4"
              onClick={() => window.location.href = 'tel:41250553'}
            >
              <Phone className="mr-2 h-4 w-4" />
              41250553
            </Button>
            <Button 
              size="lg"
              className="bg-success hover:bg-success-hover text-success-foreground"
              onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Send forespørsel
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};