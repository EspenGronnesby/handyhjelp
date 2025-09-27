import { Button } from "@/components/ui/button";
import { Menu, Phone, Mail } from "lucide-react";
import { useState } from "react";
import handyhjelpLogo from '@/assets/handyhjelp-logo.png';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-hero-bg/95 backdrop-blur-md border-b border-hero-bg-secondary/20 z-50">
      <div className="container mx-auto px-4">
        {/* Top Contact Bar */}
        <div className="hidden md:flex items-center justify-end py-2 border-b border-hero-bg-secondary/20">
          <div className="flex items-center space-x-6 text-sm text-hero-text-muted">
            <a href="tel:+1234567890" className="flex items-center space-x-2 hover:text-hero-text transition-colors">
              <Phone className="h-3 w-3" />
              <span>+1 (234) 567-8900</span>
            </a>
            <a href="mailto:info@caretakerservices.com" className="flex items-center space-x-2 hover:text-hero-text transition-colors">
              <Mail className="h-3 w-3" />
              <span>info@caretakerservices.com</span>
            </a>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img 
                src={handyhjelpLogo} 
                alt="HandyHjelp Logo" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-hero-text font-bold text-xl leading-none">HandyHjelp</h1>
              <p className="text-hero-text-muted text-xs leading-none">Property Services</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-hero-text-muted hover:text-hero-text transition-colors font-medium">
              Services
            </a>
            <a href="#process" className="text-hero-text-muted hover:text-hero-text transition-colors font-medium">
              How It Works
            </a>
            <a href="#about" className="text-hero-text-muted hover:text-hero-text transition-colors font-medium">
              About
            </a>
            <a href="#contact" className="text-hero-text-muted hover:text-hero-text transition-colors font-medium">
              Contact
            </a>
            <Button 
              className="bg-success hover:bg-success-hover text-success-foreground"
              onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get Quote
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-hero-text"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-hero-bg-secondary/20 animate-fade-in-up">
            <nav className="flex flex-col space-y-4">
              <a href="#services" className="text-hero-text-muted hover:text-hero-text transition-colors font-medium py-2">
                Services
              </a>
              <a href="#process" className="text-hero-text-muted hover:text-hero-text transition-colors font-medium py-2">
                How It Works
              </a>
              <a href="#about" className="text-hero-text-muted hover:text-hero-text transition-colors font-medium py-2">
                About
              </a>
              <a href="#contact" className="text-hero-text-muted hover:text-hero-text transition-colors font-medium py-2">
                Contact
              </a>
              <Button 
                className="bg-success hover:bg-success-hover text-success-foreground mt-4"
                onClick={() => {
                  setIsMenuOpen(false);
                  document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Get Free Quote
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};