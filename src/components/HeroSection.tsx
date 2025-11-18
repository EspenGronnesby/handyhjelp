import { Button } from "@/components/ui/button";
import { QuoteForm } from "@/components/QuoteForm";
import heroImage from "@/assets/hero-caretaker.jpg";
import { Shield, Clock, Star } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="min-h-screen hero-gradient relative flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-hero-bg/80"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          {/* Left Content */}
          <div className="text-left">
            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-6 mb-8">
              <div className="flex items-center space-x-2 text-hero-text-muted">
                <Shield className="h-5 w-5" />
                <span className="text-sm font-medium">20+ års erfaring</span>
              </div>
              <div className="flex items-center space-x-2 text-hero-text-muted">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Sertifiserte fagfolk</span>
              </div>
              <div className="flex items-center space-x-2 text-hero-text-muted">
                <Star className="h-5 w-5" />
                <span className="text-sm font-medium">Fast kontaktperson</span>
              </div>
            </div>

            {/* Main Heading - Responsive */}
            <h1 className="heading-hero mb-4 md:mb-6 animate-fade-in-left font-heading">
              <span className="md:hidden">Profesjonell eiendomspleie i Kristiansand</span>
              <span className="hidden md:block">Profesjonell eiendomspleie i Kristiansand</span>
            </h1>
            
            {/* Tagline - Mobile only */}
            <p className="text-hero-text-muted text-lg mb-4 animate-fade-in-left md:hidden">
              Vaktmester • Tømrer • Blikk
            </p>

            {/* Tagline - Desktop */}
            <p className="text-hero-text-muted text-xl mb-4 animate-fade-in-left hidden md:block">
              Vaktmester • Tømrer • Blikk – Din lokale ekspert for trygg og effektiv vedlikehold
            </p>

            {/* Description - Desktop only */}
            <p className="text-hero-text-muted text-base mb-8 animate-fade-in-left hidden md:block">
              Vi tar oss av alt fra daglig eiendomspleie til profesjonelle tømrer- og blikkarbeider. 
              Få faste avtaler som gir deg ro i hverdagen.
            </p>

            <div className="space-y-2 md:space-y-4 mb-6 md:mb-8">
              <p className="text-hero-text-muted text-base md:text-lg">
                <span className="font-semibold">Fra 650 kr/time</span>
                <span className="hidden md:inline"> inkl. mva</span> · 
                <span className="hidden md:inline">Avtaler fra 1 dag til 5 år</span>
                <span className="md:hidden">Faste avtaler tilgjengelig</span>
              </p>
              <p className="text-hero-text-muted text-sm md:text-base hidden md:block">
                Vi dekker Kristiansand, Søgne og Vennesla
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-left">
              <Button 
                size="lg" 
                className="btn-hero text-lg px-8 py-4 bg-success hover:bg-success-hover"
                onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Bestill fast avtale
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-hero-text text-hero-text text-lg px-6 py-4 hover:bg-hero-text/10"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Se våre tjenester
              </Button>
            </div>
          </div>

          {/* Right Content - Quote Form */}
          <div className="animate-fade-in-right">
            <QuoteForm />
          </div>
        </div>
      </div>

    </section>
  );
};