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
                <span className="text-sm font-medium">Lokal & pålitelig</span>
              </div>
              <div className="flex items-center space-x-2 text-hero-text-muted">
                <Clock className="h-5 w-5" />
                <span className="text-sm font-medium">Rask respons</span>
              </div>
              <div className="flex items-center space-x-2 text-hero-text-muted">
                <Star className="h-5 w-5" />
                <span className="text-sm font-medium">Fornøydgaranti</span>
              </div>
            </div>

            {/* Main Heading - Responsive */}
            <h1 className="heading-hero mb-4 md:mb-6 animate-fade-in-left">
              <span className="md:hidden">Lokal handyhjelp i Kristiansand</span>
              <span className="hidden md:block">Vi fikser det du ikke rekker selv</span>
            </h1>
            
            {/* Tagline - Mobile only */}
            <p className="text-hero-text-muted text-lg mb-4 animate-fade-in-left md:hidden">
              Flytting • Montering • Tømrer • Småjobber
            </p>

            {/* Tagline - Desktop */}
            <p className="text-hero-text-muted text-xl mb-4 animate-fade-in-left hidden md:block">
              Din lokale handyhjelp i Kristiansand
            </p>

            {/* Description - Desktop only */}
            <p className="text-hero-muted mb-8 animate-fade-in-left hidden md:block">
              Flytting, montering, rydding, tømrer oppdrag/snekker og småjobber – enkelt og trygt. 
              Rask hjelp, ærlige priser og godt humør.
            </p>

            <div className="space-y-2 md:space-y-4 mb-6 md:mb-8">
              <p className="text-hero-text-muted text-base md:text-lg">
                <span className="font-semibold">Fra 600 kr/time</span>
                <span className="hidden md:inline"> inkl. mva</span> · 
                <span className="hidden md:inline">Førstegangs-kunde: </span>
                <span className="md:hidden">Ny kunde: </span>-10%
              </p>
              <p className="text-hero-text-muted text-sm md:text-base hidden md:block">
                Vi dekker Kristiansand, Lund, Søm, Vågsbygd, Randesund og Søgne
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-left">
              <Button 
                size="lg" 
                className="btn-hero text-lg px-8 py-4"
                onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Få gratis tilbud nå
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-black text-white border-black text-lg px-6 py-4 hover:bg-black hover:text-white"
                onClick={() => document.getElementById('process-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Slik fungerer det
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