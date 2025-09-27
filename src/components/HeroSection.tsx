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

            {/* Main Heading */}
            <h1 className="heading-hero mb-6 animate-fade-in-left">
              Vi fikser det du ikke rekker selv
            </h1>
            
            {/* Tagline */}
            <p className="text-hero-text-muted text-xl mb-4 animate-fade-in-left">
              Din lokale handyhjelp i Kristiansand
            </p>

            {/* Description */}
            <p className="text-hero-muted mb-8 animate-fade-in-left">
              Flytting, montering, rydding, tømrer oppdrag/snekker og småjobber – enkelt og trygt. 
              Rask hjelp, ærlige priser og godt humør.
            </p>

            <div className="space-y-4 mb-8">
              <p className="text-hero-text-muted text-lg">
                <span className="font-semibold">Fra 600 kr/time inkl. mva</span> · Førstegangs-kunde: -10%
              </p>
              <p className="text-hero-text-muted">
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

      {/* Wave Separator - More elegant transition */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-20"
        >
          {/* Multiple wave layers for depth */}
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            className="fill-background/20"
          />
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            className="fill-background/60"
          />
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            className="fill-background"
          />
        </svg>
      </div>
    </section>
  );
};