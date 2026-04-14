import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useContactInfo } from "@/hooks/useContactInfo";

const Vilkaar = () => {
  const { phone, email, phoneHref, emailHref } = useContactInfo();
  return (
    <div className="min-h-screen">
      <PageSEO path="/vilkaar" />
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      <main id="main-content" className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg dark:prose-invert">
            <h1 className="text-4xl font-heading font-bold mb-8">Vilkår og betingelser</h1>
            
            <p className="text-muted-foreground mb-6">
              Sist oppdatert: Januar 2025
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">1. Generelt</h2>
              <p>
                Disse vilkårene gjelder for alle tjenester levert av HandyHjelp. Ved å benytte våre tjenester aksepterer du disse vilkårene i sin helhet.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">2. Tjenestebeskrivelse</h2>
              <p>
                HandyHjelp tilbyr vaktmester-, tømrer- og blikkenslagertjenester til private og bedriftskunder i Kristiansand og omegn. Tjenestene utføres av kvalifiserte fagpersoner.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">3. Tilbud og priser</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Alle tilbud er uforpliktende og gyldig i 30 dager fra utsendelse</li>
                <li>Priser oppgis eksklusiv mva. med mindre annet er spesifisert</li>
                <li>Ved endringer i arbeidets omfang vil prisen justeres tilsvarende</li>
                <li>Reisekostnader kan tilkomme for oppdrag utenfor Kristiansand kommune</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">4. Bestilling og avtale</h2>
              <p>
                En bindende avtale inngås når:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Kunden aksepterer et tilbud skriftlig (e-post eller SMS)</li>
                <li>Arbeidet påbegynnes etter muntlig avtale</li>
                <li>Serviceavtale signeres av begge parter</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">5. Utførelse av arbeid</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Arbeidet utføres fagmessig korrekt i henhold til gjeldende standarder</li>
                <li>Vi benytter kvalitetsmaterialer fra anerkjente leverandører</li>
                <li>Arbeidssted etterlates ryddig og rent</li>
                <li>Kunden skal gi tilgang til arbeidssted som avtalt</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">6. Betaling</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Betalingsfrist er 14 dager fra fakturadato</li>
                <li>Ved forsinket betaling påløper forsinkelsesrente iht. forsinkelsesrenteloven</li>
                <li>Vi aksepterer betaling via faktura, Vipps og bankkort</li>
                <li>For større prosjekter kan delbetalinger avtales</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">7. Avbestilling</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Avbestilling senere enn 24 timer før avtalt tid kan medføre gebyr</li>
                <li>Ved forbrukerkjøp gjelder 14 dagers angrerett fra avtaleinngåelse</li>
                <li>Angreretten gjelder ikke for allerede påbegynt arbeid</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">8. Reklamasjon og garanti</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Reklamasjon må fremsettes innen rimelig tid etter at mangel ble oppdaget</li>
                <li>Vi gir 2 års garanti på utført arbeid (med mindre annet er avtalt)</li>
                <li>Garantien dekker ikke normal slitasje eller feil bruk</li>
                <li>Ved berettiget reklamasjon utbedrer vi mangelen kostnadsfritt</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">9. Ansvarsbegrensning</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vårt ansvar er begrenset til oppdragets verdi</li>
                <li>Vi er ikke ansvarlig for indirekte tap eller følgeskader</li>
                <li>Kunden er ansvarlig for å oppgi korrekt informasjon om eiendommen</li>
                <li>Skjulte skader eller forhold som ikke var mulig å forutse dekkes ikke</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">10. Forsikring</h2>
              <p>
                HandyHjelp har ansvarsforsikring som dekker skader vi måtte forårsake under arbeidet. Forsikringsbevis fremlegges på forespørsel.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">11. Force majeure</h2>
              <p>
                Vi er ikke ansvarlig for forsinkelser eller manglende oppfyllelse som skyldes forhold utenfor vår kontroll, som naturkatastrofer, pandemi, streik eller lignende.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">12. Tvister</h2>
              <p>
                Eventuelle tvister søkes løst gjennom dialog. Dersom enighet ikke oppnås, kan saken bringes inn for Forbrukerrådet (for forbrukere) eller alminnelige domstoler. Kristiansand tingrett er verneting.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">13. Kontakt</h2>
              <p>
                For spørsmål om disse vilkårene, kontakt oss:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>E-post: <a href={emailHref} className="text-primary hover:underline">{email}</a></li>
                <li>Telefon: <a href={phoneHref} className="text-primary hover:underline">{phone}</a></li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Vilkaar;
