import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BreadcrumbNavigation } from "@/components/SEO/BreadcrumbNavigation";
import { GoogleAnalytics } from "@/components/SEO/GoogleAnalytics";
import { useEffect } from "react";
import { HeroImageEditor } from "@/components/admin/HeroImageEditor";
import { useHeroImage } from "@/hooks/useHeroImage";
import servicesBackground from "@/assets/hero-services-background.png";
import { EditableCTABox } from "@/components/EditableCTABox";
import { EditableBottomCTA } from "@/components/EditableBottomCTA";
import { EditableHero } from "@/components/EditableHero";
import EditableServiceCardGrid from "@/components/service-edit/EditableServiceCardGrid";
import EditableWhyChooseSection from "@/components/service-edit/EditableWhyChooseSection";
import EditablePricingDetails from "@/components/service-edit/EditablePricingDetails";
import EditableComparisonSection from "@/components/service-edit/EditableComparisonSection";
import { Helmet } from "react-helmet";

const Services = () => {
  const { heroImage, opacity, refetch: refetchHero } = useHeroImage('services', servicesBackground);

  // Handle smooth scroll to anchor on load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Våre tjenester | HandyHjelp</title>
        <meta name="description" content="Se våre tjenester: vaktmester, tømrer, blikkenslager og takrennerens. Kvalitetsarbeid til konkurransedyktige priser." />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Våre tjenester | HandyHjelp" />
        <meta property="og:description" content="Se våre tjenester: vaktmester, tømrer, blikkenslager og takrennerens. Kvalitetsarbeid til konkurransedyktige priser." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://handyhjelp.no/tjenester" />
        <meta property="og:image" content="https://handyhjelp.no/og-image.jpg" />
        <meta property="og:locale" content="nb_NO" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Våre tjenester | HandyHjelp" />
        <meta name="twitter:description" content="Se våre tjenester: vaktmester, tømrer, blikkenslager og takrennerens. Kvalitetsarbeid til konkurransedyktige priser." />
      </Helmet>
      <GoogleAnalytics />
      <Header />
      <BreadcrumbNavigation />
      
      {/* Hero Section - Enhanced with gradient overlay */}
      <div 
        className="relative min-h-[600px] flex items-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Enhanced gradient overlay for better readability */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-background via-background to-background backdrop-blur-[3px]"
          style={{ opacity }}
        ></div>
        
        <HeroImageEditor page="services" currentImageUrl={heroImage} onImageUpdate={refetchHero} />
        
        {/* Content over background */}
        <main id="main-content" className="relative z-10 w-full py-20">
          <div className="container mx-auto px-4">
            <EditableHero
              section="hero-tjenester"
              defaultHeading="Våre tjenester"
              defaultSubtext="Fra vaktmester til tømrer – vi har ekspertisen du trenger. Profesjonelle håndverkstjenester til konkurransedyktige priser"
              className="max-w-4xl mx-auto mb-12"
            />

            {/* Editable CTA Box */}
            <EditableCTABox />
          </div>
        </main>
      </div>

      <EditableServiceCardGrid />

      <EditableWhyChooseSection />

      <EditablePricingDetails />

      <EditableComparisonSection />

      {/* Editable Bottom CTA Section */}
      <EditableBottomCTA />

      <Footer />
    </div>
  );
};

export default Services;
