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
    answer: "Timepris fra 600 kr inkl. mva. Minstetid 1 time, deretter per påbegynt 30. min. Vi avklarer pris før oppstart. Førstegangs-kunde får -10% på første oppdrag."
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
    answer: "Ofte samme uke – noen ganger samme dag. Vi svarer som regel innen 2 timer i åpningstiden. Ta kontakt, så finner vi et tidspunkt som passer."
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