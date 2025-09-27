interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqItems: FAQItem[];
}

export const FAQSchema = ({ faqItems }: FAQSchemaProps) => {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map(item => ({
      "@type": "Question",
      "name": item.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.answer
      }
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schemaData)
      }}
    />
  );
};

// Default FAQ data for property caretaker services
export const defaultFAQItems: FAQItem[] = [
  {
    question: "What types of property caretaker services do you offer?",
    answer: "We offer comprehensive property caretaker services including regular maintenance, landscaping, cleaning, repairs, property inspections, security monitoring, and emergency response services for both residential and commercial properties."
  },
  {
    question: "Are your caretaker services licensed and insured?", 
    answer: "Yes, ProCare Property Services is fully licensed and insured. We carry comprehensive liability insurance and all our technicians are certified professionals with years of experience in property maintenance and care."
  },
  {
    question: "How do you provide 24/7 caretaker services?",
    answer: "Our 24/7 service includes emergency response for urgent issues, security monitoring, and a dedicated hotline for property emergencies. For routine maintenance, we work during regular business hours but are always available for true emergencies."
  },
  {
    question: "What areas do you serve for property caretaking?",
    answer: "We provide property caretaker services nationwide. Contact us with your location and we'll connect you with certified caretakers in your area who can provide immediate quotes and service."
  },
  {
    question: "How much do professional property caretaker services cost?",
    answer: "Our property caretaker service costs vary based on property size, services needed, and frequency of care. We offer free quotes and competitive pricing with packages starting from basic maintenance to comprehensive property management solutions."
  },
  {
    question: "How quickly can you start providing caretaker services?",
    answer: "We can typically begin property caretaker services within 24-48 hours of your request. For emergency situations, we offer same-day response. Contact us for a free quote and we'll discuss your timeline needs."
  }
];