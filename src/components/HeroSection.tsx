import { Button } from "@/components/ui/button";
import { QuoteForm } from "@/components/QuoteForm";
import heroImage from "@/assets/hero-building-maintenance.jpg";
import { Phone } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="min-h-screen relative flex items-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/80 to-secondary/60"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen py-20">
          {/* Left Content */}
          <div className="text-left">
            {/* Main Heading - Minimalist */}
            <h1 className="text-4xl md:text-7xl font-bold mb-6 md:mb-8 animate-fade-in-left font-heading text-white leading-tight">
              Vi tar vare på <br className="hidden md:block" />dine bygg
            </h1>
            
            {/* Short Tagline */}
            <p className="text-white/90 text-xl md:text-2xl mb-8 md:mb-12 animate-fade-in-left">
              Vaktmester • Tømrer • Blikk
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-left mb-12">
              <Button 
                size="lg" 
                variant="cta"
                className="text-lg px-8 py-6"
                onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Få tilbud
              </Button>
              <Button 
                variant="cta-outline" 
                size="lg" 
                className="text-lg px-6 py-6 bg-white/10 text-white border-white/30 hover:bg-white/20"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Se tjenester
              </Button>
            </div>

            {/* 24/7 Contact - Prominent */}
            <div className="bg-primary/90 backdrop-blur-sm rounded-lg p-6 inline-block animate-fade-in-left">
              <p className="text-white/80 text-sm mb-2">24/7 Service</p>
              <a 
                href="tel:+4741250553"
                className="text-white text-2xl md:text-3xl font-bold flex items-center gap-3 hover:text-white/90 transition-colors"
              >
                <Phone className="h-7 w-7" />
                <span>+47 41250553</span>
              </a>
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