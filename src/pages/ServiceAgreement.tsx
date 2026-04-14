import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { ServiceAgreementForm } from "@/components/ServiceAgreementForm";
import { PageSEO } from "@/components/SEO/PageSEO";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { EditButton } from "@/components/ui/EditButton";
import { SectionEditModal } from "@/components/SectionEditModal";

const ServiceAgreement = () => {
  const { editMode, isAdmin } = useEditMode();
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const { content: titleRaw } = useEditableContent('agreement-page-hero', 'title');
  const { content: descRaw } = useEditableContent('agreement-page-hero', 'description');
  const title = titleRaw || 'Forespør fast avtale';
  const desc = descRaw || 'Få en skreddersydd serviceavtale tilpasset deres behov. Vi kontakter dere innen 1-2 virkedager.';

  return (
    <div className="min-h-screen">
      <PageSEO path="/fast-avtale" />
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />

      <main id="main-content" className="pt-32 pb-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-8 relative">
              {isAdmin && editMode && (
                <EditButton
                  onClick={() => setIsHeroModalOpen(true)}
                  ariaLabel="Rediger hero-tekst"
                />
              )}
              <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
                {title}
              </h1>
              <p className="text-lg text-muted-foreground">
                {desc}
              </p>
            </div>
            <ServiceAgreementForm />
          </div>
        </div>
      </main>

      <Footer />

      <SectionEditModal
        isOpen={isHeroModalOpen}
        onClose={() => setIsHeroModalOpen(false)}
        title="Rediger fast-avtale - Hero"
        fields={[
          { section: 'agreement-page-hero', contentKey: 'title', label: 'Hovedoverskrift', value: title, maxLength: 60, placeholder: 'Forespør fast avtale' },
          { section: 'agreement-page-hero', contentKey: 'description', label: 'Beskrivelse', value: desc, multiline: true, maxLength: 300, placeholder: 'Få en skreddersydd...' },
        ]}
      />
    </div>
  );
};

export default ServiceAgreement;
