import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { PageSEO } from "@/components/SEO/PageSEO";

const Cookies = () => {
  return (
    <div className="min-h-screen">
      <PageSEO path="/cookies" />
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      <main id="main-content" className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h1 className="text-4xl font-heading font-bold mb-8">Cookie-policy</h1>
            
            <p className="text-muted-foreground mb-6">
              Sist oppdatert: Januar 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Hva er cookies?</h2>
              <p>
                Cookies er små tekstfiler som lagres på din enhet (datamaskin, nettbrett eller mobiltelefon) når du besøker en nettside. De brukes til å huske dine preferanser, forbedre brukeropplevelsen og samle statistikk om bruk av nettsiden.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Hvilke cookies bruker vi?</h2>
              
              <h3 className="text-xl font-semibold mb-3 mt-6">Nødvendige cookies</h3>
              <p>
                Disse er essensielle for at nettsiden skal fungere korrekt. De kan ikke deaktiveres.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sesjonscookies for innlogging og autentisering</li>
                <li>Preferansecookies for tema (lys/mørk modus)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Analysecookies</h3>
              <p>
                Vi bruker Google Analytics for å forstå hvordan besøkende bruker nettsiden vår. Dette hjelper oss å forbedre innhold og funksjonalitet.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>_ga:</strong> Skiller mellom brukere (utløper etter 2 år)</li>
                <li><strong>_gid:</strong> Skiller mellom brukere (utløper etter 24 timer)</li>
                <li><strong>_gat:</strong> Begrenser forespørsler (utløper etter 1 minutt)</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Funksjonelle cookies</h3>
              <p>
                Disse forbedrer funksjonaliteten og personaliseringen av nettsiden.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Huske skjemadata for tilbudsforespørsler</li>
                <li>Lagre preferanser for visning</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Tredjepartscookies</h2>
              <p>
                Vi bruker enkelte tredjeparts-tjenester som kan sette egne cookies:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Google Analytics:</strong> For trafikkmåling og analyse</li>
                <li><strong>Google Maps:</strong> For å vise kart over vår lokasjon</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Hvordan administrere cookies?</h2>
              <p>
                Du kan kontrollere og slette cookies gjennom nettleserens innstillinger:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Chrome:</strong> Innstillinger → Personvern og sikkerhet → Cookies</li>
                <li><strong>Firefox:</strong> Innstillinger → Personvern og sikkerhet → Cookies og nettstedsdata</li>
                <li><strong>Safari:</strong> Innstillinger → Personvern → Administrer nettstedsdata</li>
                <li><strong>Edge:</strong> Innstillinger → Cookies og nettstedstillatelser</li>
              </ul>
              <p className="mt-4">
                Merk at deaktivering av cookies kan påvirke funksjonaliteten på nettsiden.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Mer informasjon</h2>
              <p>
                For mer informasjon om cookies og hvordan vi behandler personopplysninger, se vår{" "}
                <a href="/personvern" className="text-primary hover:underline">personvernerklæring</a>.
              </p>
              <p className="mt-4">
                Har du spørsmål? Kontakt oss på <a href="mailto:team@handyhjelp.no" className="text-primary hover:underline">team@handyhjelp.no</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cookies;
