import { Button } from "@/components/ui/button";
import { Menu, Phone, Mail, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import handyhjelpLogo from '@/assets/handyhjelp-logo-new.png';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Logget ut',
      description: 'Du er nå logget ut.'
    });
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50">
      <div className="container mx-auto px-4">
        {/* Top Contact Bar - Hidden on mobile */}
        <div className="hidden md:block bg-secondary text-secondary-foreground py-2">
          <div className="container mx-auto px-4 flex justify-end space-x-6 text-sm">
            <a 
              href="tel:+4741250553" 
              className="flex items-center space-x-2 hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>+47 41250553</span>
            </a>
            <a 
              href="mailto:Handyhjelp@gmail.com" 
              className="flex items-center space-x-2 hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>Handyhjelp@gmail.com</span>
            </a>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={handyhjelpLogo} 
              alt="HandyHjelp - Levert med kvalitet" 
              className="h-12 md:h-14 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center space-x-4">
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors text-sm">
                Hjem
              </Link>
              <Link to="/tjenester" className="text-foreground hover:text-primary transition-colors text-sm">
                Tjenester
              </Link>
              <Link to="/prosjekter" className="text-foreground hover:text-primary transition-colors text-sm">
                Prosjekter
              </Link>
              <Link to="/raad" className="text-foreground hover:text-primary transition-colors text-sm">
                Råd
              </Link>
              <Link to="/om-oss" className="text-foreground hover:text-primary transition-colors text-sm">
                Om oss
              </Link>
              <Link to="/kontakt" className="text-foreground hover:text-primary transition-colors text-sm">
                Kontakt
              </Link>
              <Link to="/faq" className="text-foreground hover:text-primary transition-colors text-sm">
                FAQ
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link to="/dashboard">
                    <Button variant="outline" className="gap-2">
                      <User className="h-4 w-4" />
                      Profil
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost"
                    className="gap-2"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Logg ut
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    Logg inn
                  </Button>
                </Link>
              )}
              <Button 
                className="bg-success hover:bg-success-hover text-success-foreground"
                onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Få tilbud
              </Button>
            </div>

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
                <Link 
                  to="/" 
                  className="block text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hjem
                </Link>
                <Link 
                  to="/tjenester" 
                  className="block text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tjenester
                </Link>
                <Link 
                  to="/prosjekter" 
                  className="block text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Prosjekter
                </Link>
                <Link 
                  to="/priser" 
                  className="block text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Priser
                </Link>
                <Link 
                  to="/raad" 
                  className="block text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Råd
                </Link>
                <Link 
                  to="/om-oss" 
                  className="block text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Om oss
                </Link>
                <Link 
                  to="/kontakt" 
                  className="block text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kontakt
                </Link>
                <Link 
                  to="/faq" 
                  className="block text-foreground hover:text-primary transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </Link>
                
                {/* Mobile Contact Info */}
                <div className="pt-4 border-t border-border space-y-3">
                  <a 
                    href="tel:+4741250553" 
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    <span>+47 41250553</span>
                  </a>
                  <a 
                    href="mailto:Handyhjelp@gmail.com" 
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Handyhjelp@gmail.com</span>
                  </a>
                </div>
                
                {user ? (
                  <>
                    <Link to="/dashboard" className="block w-full">
                      <Button 
                        variant="outline"
                        className="w-full gap-2 justify-start"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profil
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost"
                      className="w-full gap-2 justify-start"
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleSignOut();
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      Logg ut
                    </Button>
                  </>
                ) : (
                  <Link to="/auth" className="block w-full">
                    <Button 
                      variant="outline"
                      className="w-full gap-2 justify-start"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Logg inn
                    </Button>
                  </Link>
                )}
                
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