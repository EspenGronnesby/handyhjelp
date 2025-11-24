import React from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqItems: FAQItem[];
}

export const FAQSchema = ({ faqItems }: FAQSchemaProps): JSX.Element => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map((item) => ({
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export const defaultFAQItems: FAQItem[] = [
  {
    question: "Hva koster det?",
    answer: "Vi lager skreddersydde pristilbud basert på ditt prosjekt. Kontakt oss for et gratis og uforpliktende tilbud tilpasset dine behov."
  },
  {
    question: "Tar dere med avfall?",
    answer: "Ja, vi kan hente og kjøre bort avfall som del av rydding og bortkjøring-tjenesten. Eventuelle deponi-gebyr legges på etter kvittering."
  },
  {
    question: "Kan dere montere alt?",
    answer: "Vi monterer det meste av møbler, hvitevarer og utstyr. Jobber som krever autorisasjon (el/vann/gass) må utføres av fagperson."
  },
  {
    question: "Hvor raskt kan dere komme?",
    answer: "Ofte samme uke – noen ganger samme dag. Vi svarer som regel innen 1-3 virkedager i åpningstiden. Ta kontakt, så finner vi et tidspunkt som passer."
  },
  {
    question: "Hvilke områder dekker dere?",
    answer: "Vi dekker Kristiansand, Lund, Søm, Vågsbygd, Randesund og Søgne etter avtale. Kjøring i Kristiansand er inkludert."
  },
  {
    question: "Hva slags tjenester tilbyr dere?",
    answer: "Vi tilbyr flyttehjelp, montering av møbler og utstyr, rydding og bortkjøring, tømrerarbeider og småjobber som maling og reparasjoner."
  }
];