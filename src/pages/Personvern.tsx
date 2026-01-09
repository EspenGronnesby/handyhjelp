import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { Helmet } from "react-helmet";

const Personvern = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Personvernerklæring | HandyHjelp</title>
        <meta name="description" content="Les om hvordan HandyHjelp behandler og beskytter dine personopplysninger i henhold til GDPR." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Personvernerklæring | HandyHjelp" />
        <meta property="og:description" content="Les om hvordan HandyHjelp behandler og beskytter dine personopplysninger i henhold til GDPR." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://handyhjelp.no/personvern" />
        <meta property="og:image" content="https://handyhjelp.no/og-image.jpg" />
        <meta property="og:locale" content="nb_NO" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Personvernerklæring | HandyHjelp" />
        <meta name="twitter:description" content="Les om hvordan HandyHjelp behandler og beskytter dine personopplysninger i henhold til GDPR." />
      </Helmet>
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      <main id="main-content" className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h1 className="text-4xl font-heading font-bold mb-8">Personvernerklæring</h1>
            
            <p className="text-muted-foreground mb-6">
              Sist oppdatert: Januar 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Hvem er behandlingsansvarlig?</h2>
              <p>
                HandyHjelp er behandlingsansvarlig for personopplysninger som samles inn via våre nettsider og tjenester.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Bedrift: HandyHjelp</li>
                <li>Adresse: Kristiansand, Norge</li>
                <li>E-post: team@handyhjelp.no</li>
                <li>Telefon: +47 412 50 553</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Hvilke personopplysninger samler vi inn?</h2>
              <p>Vi samler inn følgende typer personopplysninger:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Kontaktinformasjon:</strong> Navn, e-postadresse, telefonnummer og adresse</li>
                <li><strong>Bedriftsinformasjon:</strong> Organisasjonsnummer og firmanavn (for bedriftskunder)</li>
                <li><strong>Kommunikasjon:</strong> Meldinger og forespørsler du sender oss</li>
                <li><strong>Teknisk informasjon:</strong> IP-adresse, nettlesertype og besøksstatistikk (via cookies)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Hvorfor behandler vi personopplysninger?</h2>
              <p>Vi behandler personopplysninger for følgende formål:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Besvare henvendelser og gi tilbud på tjenester</li>
                <li>Administrere kundeforhold og serviceavtaler</li>
                <li>Sende relevant informasjon om våre tjenester (med samtykke)</li>
                <li>Forbedre våre nettsider og tjenester</li>
                <li>Oppfylle lovpålagte krav</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Rettslig grunnlag</h2>
              <p>Vår behandling av personopplysninger baserer seg på følgende rettslige grunnlag:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Samtykke:</strong> Når du sender inn et skjema eller kontakter oss</li>
                <li><strong>Avtale:</strong> For å oppfylle avtaler med våre kunder</li>
                <li><strong>Berettiget interesse:</strong> For å forbedre våre tjenester</li>
                <li><strong>Rettslig forpliktelse:</strong> For å oppfylle lovpålagte krav</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Hvem deler vi opplysninger med?</h2>
              <p>
                Vi deler ikke personopplysninger med tredjeparter, med unntak av:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Tekniske tjenesteleverandører (hosting, e-post) under strenge databehandleravtaler</li>
                <li>Offentlige myndigheter når vi er pålagt ved lov</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Lagringstid</h2>
              <p>
                Vi lagrer personopplysninger så lenge det er nødvendig for formålet de ble samlet inn for:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Tilbudsforespørsler: Slettes etter 2 år hvis ikke konvertert til kunde</li>
                <li>Kundedata: Lagres i avtaleperioden pluss 5 år (regnskapsplikt)</li>
                <li>Markedsføring: Til samtykke trekkes tilbake</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Dine rettigheter</h2>
              <p>Du har følgende rettigheter under GDPR:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Innsyn:</strong> Få vite hvilke opplysninger vi har om deg</li>
                <li><strong>Retting:</strong> Korrigere feilaktige opplysninger</li>
                <li><strong>Sletting:</strong> Be om sletting av dine opplysninger</li>
                <li><strong>Begrensning:</strong> Be om begrenset behandling</li>
                <li><strong>Dataportabilitet:</strong> Få utlevert dine data i et strukturert format</li>
                <li><strong>Innsigelse:</strong> Protestere mot behandling basert på berettiget interesse</li>
              </ul>
              <p className="mt-4">
                For å utøve dine rettigheter, kontakt oss på team@handyhjelp.no.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Sikkerhet</h2>
              <p>
                Vi tar sikkerheten til dine personopplysninger på alvor og har implementert passende tekniske og organisatoriske tiltak for å beskytte dem mot uautorisert tilgang, endring, avsløring eller sletting.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Klage til Datatilsynet</h2>
              <p>
                Hvis du mener vi ikke behandler personopplysninger i samsvar med regelverket, har du rett til å klage til Datatilsynet: <a href="https://www.datatilsynet.no" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.datatilsynet.no</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Endringer i personvernerklæringen</h2>
              <p>
                Vi forbeholder oss retten til å oppdatere denne personvernerklæringen. Vesentlige endringer vil bli kommunisert på vår nettside.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Personvern;
