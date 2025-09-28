import { Button } from "@/components/ui/button";
import { Menu, Phone, Mail } from "lucide-react";
import { useState } from "react";
import handyhjelpLogo from '@/assets/handyhjelp-logo.png';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4">
        {/* Top Contact Bar - Hidden on mobile */}
        <div className="hidden md:block bg-primary text-primary-foreground py-2">
          <div className="container mx-auto px-4 flex justify-end space-x-6 text-sm">
            <a 
              href="tel:+4740000000" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Phone className="h-4 w-4" />
              <span>+47 400 00 000</span>
            </a>
            <a 
              href="mailto:Handyhjelp@gmail.com" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Mail className="h-4 w-4" />
              <span>Handyhjelp@gmail.com</span>
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
              <h1 className="text-foreground font-bold text-xl leading-none">HandyHjelp</h1>
              <p className="text-muted-foreground text-xs leading-none">Din lokale handyhjelp</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#process-section" className="text-foreground hover:text-primary transition-colors">
                Slik fungerer det
              </a>
              <a href="#services" className="text-foreground hover:text-primary transition-colors">
                Tjenester
              </a>
              <a href="#faq" className="text-foreground hover:text-primary transition-colors">
                FAQ
              </a>
            </nav>

            {/* Get Quote Button */}
            <Button 
              className="hidden md:inline-flex bg-success hover:bg-success-hover text-success-foreground"
              onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Få tilbud
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

          {/* Mobile Navigation Menu */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-background border-t border-border shadow-lg z-50">
              <div className="container mx-auto px-4 py-4 space-y-4">
                <a 
                  href="#process-section" 
                  className="block text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Slik fungerer det
                </a>
                <a 
                  href="#services" 
                  className="block text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tjenester
                </a>
                <a 
                  href="#faq" 
                  className="block text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </a>
                
                {/* Mobile Contact Info */}
                <div className="pt-4 border-t border-border space-y-3">
                  <a 
                    href="tel:+4740000000" 
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>+47 400 00 000</span>
                  </a>
                  <a 
                    href="mailto:Handyhjelp@gmail.com" 
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Handyhjelp@gmail.com</span>
                  </a>
                </div>
                
                <Button 
                  className="w-full bg-success hover:bg-success-hover text-success-foreground mt-4"
                  onClick={() => {
                    setIsMenuOpen(false);
                    document.getElementById('quote-standalone')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  Få tilbud
                </Button>
              </div>
            </div>
          )}
      </div>
    </header>
  );
};