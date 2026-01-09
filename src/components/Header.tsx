import { Button } from "@/components/ui/button";
import { Menu, Phone, Mail, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import handyhjelpLogo from '@/assets/handyhjelp-logo-new.png';
import handyhjelpLogoWhite from '@/assets/handyhjelp-logo-footer.png';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();

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
    <>
      <a href="#main-content" className="skip-to-content">
        Hopp til hovedinnhold
      </a>
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
              src={resolvedTheme === 'dark' ? handyhjelpLogoWhite : handyhjelpLogo} 
              alt="HandyHjelp - Levert med kvalitet" 
              className="h-14 md:h-16 w-auto object-contain"
            />
          </Link>

          {/* Mobile Profile Button - Right side, only visible on mobile */}
          <Link 
            to={user ? "/dashboard" : "/auth"} 
            className="md:hidden absolute right-4 flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground transition-colors touch-manipulation z-10"
            aria-label={user ? "Gå til profil" : "Logg inn"}
          >
            <User className="h-5 w-5" />
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
                  <Link to="/tilbud">
                    <Button className="bg-success hover:bg-success-hover text-success-foreground">
                      Få tilbud
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button - Left side */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden min-h-[44px] min-w-[44px] touch-manipulation"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Lukk meny" : "Åpne meny"}
              aria-expanded={isMenuOpen}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

          {/* Mobile Navigation Menu - Improved touch targets */}
          {isMenuOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-background border-t border-border shadow-lg z-50">
              <nav className="container mx-auto px-4 py-2" aria-label="Mobilmeny">
                <Link 
                  to="/" 
                  className={`block transition-colors py-3 min-h-[44px] flex items-center touch-manipulation ${isActive('/') ? 'text-primary font-medium' : 'text-foreground hover:text-primary active:text-primary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hjem
                </Link>
                <Link 
                  to="/tjenester" 
                  className={`block transition-colors py-3 min-h-[44px] flex items-center touch-manipulation ${isActive('/tjenester') ? 'text-primary font-medium' : 'text-foreground hover:text-primary active:text-primary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Tjenester
                </Link>
                <Link 
                  to="/prosjekter" 
                  className={`block transition-colors py-3 min-h-[44px] flex items-center touch-manipulation ${isActive('/prosjekter') ? 'text-primary font-medium' : 'text-foreground hover:text-primary active:text-primary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Prosjekter
                </Link>
                <Link
                  to="/raad" 
                  className={`block transition-colors py-3 min-h-[44px] flex items-center touch-manipulation ${isActive('/raad') ? 'text-primary font-medium' : 'text-foreground hover:text-primary active:text-primary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Råd
                </Link>
                <Link 
                  to="/om-oss" 
                  className={`block transition-colors py-3 min-h-[44px] flex items-center touch-manipulation ${isActive('/om-oss') ? 'text-primary font-medium' : 'text-foreground hover:text-primary active:text-primary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Om oss
                </Link>
                <Link 
                  to="/kontakt" 
                  className={`block transition-colors py-3 min-h-[44px] flex items-center touch-manipulation ${isActive('/kontakt') ? 'text-primary font-medium' : 'text-foreground hover:text-primary active:text-primary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Kontakt
                </Link>
                <Link 
                  to="/faq" 
                  className={`block transition-colors py-3 min-h-[44px] flex items-center touch-manipulation ${isActive('/faq') ? 'text-primary font-medium' : 'text-foreground hover:text-primary active:text-primary'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  FAQ
                </Link>
                
                {/* Mobile Contact Info - Improved touch targets */}
                <div className="pt-4 mt-2 border-t border-border space-y-1">
                  <a 
                    href="tel:+4741250553" 
                    className="flex items-center space-x-3 py-3 min-h-[44px] text-foreground hover:text-primary active:text-primary transition-colors touch-manipulation"
                  >
                    <Phone className="h-5 w-5" />
                    <span>+47 41250553</span>
                  </a>
                  <a 
                    href="mailto:Team@handyhjelp.no" 
                    className="flex items-center space-x-3 py-3 min-h-[44px] text-foreground hover:text-primary active:text-primary transition-colors touch-manipulation"
                  >
                    <Mail className="h-5 w-5" />
                    <span>Team@handyhjelp.no</span>
                  </a>
                </div>
                
                {/* Auth buttons - Improved touch targets */}
                <div className="pt-4 mt-2 border-t border-border space-y-3">
                  {user ? (
                    <>
                      <Link to="/dashboard" className="block w-full">
                        <Button 
                          variant="outline"
                          className="w-full min-h-[48px] gap-2 justify-start touch-manipulation"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          Profil
                        </Button>
                      </Link>
                      <Link to="/tilbud" className="block w-full">
                        <Button 
                          className="w-full min-h-[48px] bg-success hover:bg-success-hover active:bg-success-hover text-success-foreground touch-manipulation"
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
                          className="w-full min-h-[48px] gap-2 justify-start touch-manipulation"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User className="h-5 w-5" />
                          Logg inn
                        </Button>
                      </Link>
                      <Link to="/tilbud" className="block w-full">
                        <Button 
                          className="w-full min-h-[48px] bg-success hover:bg-success-hover active:bg-success-hover text-success-foreground touch-manipulation"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Få tilbud
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </>
  );
};