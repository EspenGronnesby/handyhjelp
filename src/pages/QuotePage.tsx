import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { QuoteForm } from "@/components/QuoteForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { EditButton } from "@/components/ui/EditButton";
import { SectionEditModal } from "@/components/SectionEditModal";

const QuotePage = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const { content: heroTitleRaw } = useEditableContent('quote-page-hero', 'title');
  const { content: heroDescRaw } = useEditableContent('quote-page-hero', 'description');
  const { content: heroLinkRaw } = useEditableContent('quote-page-hero', 'link_text');
  const { content: promoTitleRaw } = useEditableContent('quote-page-promo', 'title');
  const { content: promoDescRaw } = useEditableContent('quote-page-promo', 'description');
  const { content: promoButtonRaw } = useEditableContent('quote-page-promo', 'button_text');

  const heroTitle = heroTitleRaw || 'Få gratis tilbud';
  const heroDesc = heroDescRaw || 'Send inn din forespørsel og få kontakt med lokale fagfolk. Vi svarer innen 1-3 virkedager.';
  const heroLink = heroLinkRaw || 'Trenger du regelmessig hjelp?';
  const promoTitle = promoTitleRaw || 'Trenger du regelmessig hjelp?';
  const promoDesc = promoDescRaw || 'Spar tid og penger med en fast serviceavtale tilpasset dine behov.';
  const promoButton = promoButtonRaw || 'Forespør fast avtale';

  const scrollToAgreement = () => {
    document.getElementById('fast-avtale-section')?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Få gratis tilbud | HandyHjelp</title>
        <meta name="description" content="Få gratis og uforpliktende tilbud på håndverkstjenester. Vi svarer innen 1-3 virkedager." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Få gratis tilbud | HandyHjelp" />
        <meta property="og:description" content="Få gratis og uforpliktende tilbud på håndverkstjenester. Vi svarer innen 1-3 virkedager." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://handyhjelp.no/tilbud" />
        <meta property="og:image" content="https://handyhjelp.no/og-image.jpg" />
        <meta property="og:locale" content="nb_NO" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Få gratis tilbud | HandyHjelp" />
        <meta name="twitter:description" content="Få gratis og uforpliktende tilbud på håndverkstjenester. Vi svarer innen 1-3 virkedager." />
      </Helmet>
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />

      <main id="main-content" className="pt-32 pb-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8 relative">
              {isAdmin && editMode && (
                <EditButton
                  onClick={() => setIsHeroModalOpen(true)}
                  ariaLabel="Rediger hero-tekst"
                />
              )}
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                {heroTitle}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {heroDesc}
              </p>
              <button
                onClick={scrollToAgreement}
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                aria-label="Hopp til fast avtale-seksjonen"
              >
                <span>{heroLink}</span>
                <ChevronDown className="h-4 w-4 animate-bounce" />
              </button>
            </div>
            <QuoteForm />

            {/* Fast avtale promo section */}
            <div id="fast-avtale-section" className="glass-card mt-12 p-6 text-center scroll-mt-32 relative !bg-gradient-to-br !from-primary/5 !to-transparent">
              {isAdmin && editMode && (
                <EditButton
                  onClick={() => setIsPromoModalOpen(true)}
                  ariaLabel="Rediger fast-avtale-promo"
                />
              )}
              <div>
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <CalendarCheck className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-heading font-semibold mb-2">
                  {promoTitle}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {promoDesc}
                </p>
                <Button asChild variant="outline" className="group">
                  <Link to="/fast-avtale">
                    {promoButton}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <SectionEditModal
        isOpen={isHeroModalOpen}
        onClose={() => setIsHeroModalOpen(false)}
        title="Rediger tilbudssiden - Hero"
        fields={[
          { section: 'quote-page-hero', contentKey: 'title', label: 'Hovedoverskrift', value: heroTitle, maxLength: 60, placeholder: 'Få gratis tilbud' },
          { section: 'quote-page-hero', contentKey: 'description', label: 'Beskrivelse', value: heroDesc, multiline: true, maxLength: 300, placeholder: 'Send inn din forespørsel...' },
          { section: 'quote-page-hero', contentKey: 'link_text', label: 'Link-tekst (til fast avtale)', value: heroLink, maxLength: 60, placeholder: 'Trenger du regelmessig hjelp?' },
        ]}
      />

      <SectionEditModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        title="Rediger fast-avtale-promo"
        fields={[
          { section: 'quote-page-promo', contentKey: 'title', label: 'Overskrift', value: promoTitle, maxLength: 60, placeholder: 'Trenger du regelmessig hjelp?' },
          { section: 'quote-page-promo', contentKey: 'description', label: 'Beskrivelse', value: promoDesc, multiline: true, maxLength: 200, placeholder: 'Spar tid og penger...' },
          { section: 'quote-page-promo', contentKey: 'button_text', label: 'Knapp-tekst', value: promoButton, maxLength: 40, placeholder: 'Forespør fast avtale' },
        ]}
      />
    </div>
  );
};

export default QuotePage;
