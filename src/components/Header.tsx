import { Button } from "@/components/ui/button";
import { Menu, Phone, Mail, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import handyhjelpLogo from '@/assets/handyhjelp-logo-new.png';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const isActive = (path: string) => location.pathname === path;

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
        <div className="hidden md:block bg-secondary text-secondary-foreground py-1.5">
          <div className="container mx-auto px-4 flex justify-end space-x-6 text-sm">
            <a 
              href="tel:+4741250553" 
              className="flex items-center space-x-2 hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4" />
              <span>+47 41250553</span>
            </a>
            <a 
              href="mailto:Team@handyhjelp.no" 
              className="flex items-center space-x-2 hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4" />
              <span>Team@handyhjelp.no</span>
            </a>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center justify-between md:justify-between py-3 md:py-4">
          {/* Logo - Centered on mobile, left-aligned on desktop */}
          <Link to="/" className="flex items-center absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none z-20">
            <img 
              src={handyhjelpLogo} 
              alt="HandyHjelp - Levert med kvalitet" 
              className="h-14 md:h-16 w-auto object-contain"
            />
          </Link>

          <div className="flex items-center space-x-4 relative z-10">
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/" className={`transition-colors text-sm ${isActive('/') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}>
                Hjem
              </Link>
              <Link to="/tjenester" className={`transition-colors text-sm ${isActive('/tjenester') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}>
                Tjenester
              </Link>
              <Link to="/prosjekter" className={`transition-colors text-sm ${isActive('/prosjekter') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}>
                Prosjekter
              </Link>
              <Link to="/raad" className={`transition-colors text-sm ${isActive('/raad') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}>
                Råd
              </Link>
              <Link to="/om-oss" className={`transition-colors text-sm ${isActive('/om-oss') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}>
                Om oss
              </Link>
              <Link to="/kontakt" className={`transition-colors text-sm ${isActive('/kontakt') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}>
                Kontakt
              </Link>
              <Link to="/faq" className={`transition-colors text-sm ${isActive('/faq') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}>
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
                  <Link to="/tilbud">
                    <Button className="bg-success hover:bg-success-hover text-success-foreground">
                      Få tilbud
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="outline" className="gap-2">
                      <User className="h-4 w-4" />
                      Logg inn
                    </Button>
                  </Link>
                  <Button 
                    className="bg-success hover:bg-success-hover text-success-foreground"
                    onClick={() => document.getElementById('quote-standalone')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Få tilbud
                  </Button>
                </>
              )}
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
                  className={`block transition-colors py-2 ${isActive('/') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hjem
                </Link>
                <Link 
                  to="/tjenester" 
                  className={`block transition-colors py-2 ${isActive('/tjenester') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tjenester
                </Link>
                <Link 
                  to="/prosjekter" 
                  className={`block transition-colors py-2 ${isActive('/prosjekter') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Prosjekter
                </Link>
                <Link
                  to="/raad" 
                  className={`block transition-colors py-2 ${isActive('/raad') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Råd
                </Link>
                <Link 
                  to="/om-oss" 
                  className={`block transition-colors py-2 ${isActive('/om-oss') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Om oss
                </Link>
                <Link 
                  to="/kontakt" 
                  className={`block transition-colors py-2 ${isActive('/kontakt') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kontakt
                </Link>
                <Link 
                  to="/faq" 
                  className={`block transition-colors py-2 ${isActive('/faq') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'}`}
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
                    href="mailto:Team@handyhjelp.no" 
                    className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Team@handyhjelp.no</span>
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
                    <Link to="/tilbud" className="block w-full mt-2">
                      <Button 
                        className="w-full bg-success hover:bg-success-hover text-success-foreground"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Få tilbud
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
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
                    <Button 
                      className="w-full bg-success hover:bg-success-hover text-success-foreground mt-4"
                      onClick={() => {
                        setIsMenuOpen(false);
                        document.getElementById('quote-standalone')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >
                      Få tilbud
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
      </div>
    </header>
  );
};