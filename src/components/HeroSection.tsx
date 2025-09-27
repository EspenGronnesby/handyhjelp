import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Clock, Star } from "lucide-react";
import { QuoteForm } from "@/components/QuoteForm";
import heroImage from "@/assets/hero-caretaker.jpg";

export const HeroSection = () => {
  return (
    <section className="hero-gradient min-h-screen flex items-center relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Professional property caretaker services"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-hero-bg/70"></div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Main Content */}
          <div className="animate-fade-in-left">
            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-2 text-hero-text-muted">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Fully Licensed & Insured</span>
              </div>
              <div className="flex items-center space-x-2 text-hero-text-muted">
                <Clock className="h-4 w-4" />
                <span className="text-sm">24/7 Emergency Service</span>
              </div>
              <div className="flex items-center space-x-2 text-hero-text-muted">
                <Star className="h-4 w-4" />
                <span className="text-sm">5-Star Rated</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="heading-hero mb-6">
              Professional Property Caretaker Services
              <span className="block text-success">Get Your Free Quote Today</span>
            </h1>

            {/* Description */}
            <p className="text-hero-muted mb-8 max-w-lg">
              We make it easy for you to find the right property caretaker for your needs. 
              Fill out our simple form with your project details, and we'll connect you with 
              qualified caretakers who meet your requirements and budget.
            </p>

            <p className="text-hero-muted mb-8">
              Whether it's maintenance, repairs, landscaping, or ongoing property management, 
              you'll receive a free, no-obligation quote from professional caretakers in your area.
            </p>

            <p className="text-hero-muted mb-10 font-medium">
              Save time and stress by letting us find the best caretaker for your property.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-hero group"
              >
                Get Free Quote Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <Button 
                variant="outline" 
                size="lg"
                className="btn-outline-hero"
                onClick={() => document.getElementById('process-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                How It Works
              </Button>
            </div>
          </div>

          {/* Quote Form - Right side */}
          <div className="animate-fade-in-right lg:ml-8" id="quote-form">
            <div className="card-elevated p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Get a Free Quote from Professional Caretakers
                </h2>
                <p className="text-muted-foreground">
                  Submit a brief description of your project and we'll help you find the best caretaker for your specific needs.
                </p>
              </div>
              
              {/* Integrated Quote Form */}
              <QuoteForm />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave Separator */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg className="relative block w-full h-20" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M1200 120L0 16.48 0 0 1200 0 1200 120z" className="fill-background"></path>
        </svg>
      </div>
    </section>
  );
};