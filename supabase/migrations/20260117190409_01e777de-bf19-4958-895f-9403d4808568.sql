-- Insert predefined email templates
INSERT INTO public.email_templates (name, subject, content, include_feedback_button)
VALUES 
  (
    'Tilbakemeldings-forespørsel',
    'Hvordan var opplevelsen din med HandyHjelp?',
    'Vi håper du er fornøyd med tjenestene våre!

Det har gått litt tid siden vi hørte fra deg, og vi vil gjerne høre hvordan opplevelsen din med HandyHjelp har vært.

Din tilbakemelding hjelper oss å forbedre tjenestene våre og sikre at vi alltid leverer kvalitetsarbeid.

Takk for at du tok deg tid til å dele dine tanker med oss!',
    true
  ),
  (
    'Oppfølging etter tilbud',
    'Takk for din interesse i HandyHjelp',
    'Takk for at du sendte oss en forespørsel!

Vi har mottatt din henvendelse og arbeider med å gjennomgå den. Du vil snart høre fra oss med mer informasjon.

Har du spørsmål i mellomtiden? Ikke nøl med å ta kontakt med oss.

Vi ser frem til å hjelpe deg!',
    false
  ),
  (
    'Påminnelse vedlikehold',
    'Tid for vedlikehold av eiendommen din?',
    'Hei!

Visste du at regelmessig vedlikehold av eiendommen din kan spare deg for store utgifter på sikt?

Vi tilbyr et bredt spekter av vaktmestertjenester som kan hjelpe deg å holde eiendommen din i topp stand:

• Takrennerens og vedlikehold
• Generelt bygningsvedlikehold
• Sesongbaserte tjenester

Ta kontakt med oss i dag for en uforpliktende prat om hvordan vi kan hjelpe deg!',
    false
  ),
  (
    'Generell informasjon',
    'Viktig informasjon fra HandyHjelp',
    'Vi ønsker å informere deg om noe viktig.

[Skriv din melding her]

Ta gjerne kontakt om du har spørsmål.',
    false
  ),
  (
    'Takk for oppdraget',
    'Tusen takk for at du valgte HandyHjelp!',
    'Vi vil gjerne takke deg for at du valgte oss for ditt siste oppdrag!

Det har vært en glede å jobbe for deg, og vi håper du er fornøyd med resultatet.

Skulle det oppstå noe, eller om du har flere prosjekter vi kan hjelpe deg med, er vi alltid tilgjengelige.

Vi ser frem til å høre fra deg igjen!',
    true
  )
ON CONFLICT DO NOTHING;