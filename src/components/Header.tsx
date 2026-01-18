import { Button } from "@/components/ui/button";
import { Menu, Phone, Mail, User, LogOut, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useEditMode } from "@/contexts/EditModeContext";
import { useLogoSettings } from "@/hooks/useLogoSettings";
import { LogoSettingsModal } from "@/components/LogoSettingsModal";
import { ThemeToggleButton } from "@/components/ThemeToggle";
import { useHeaderVisibility } from "@/hooks/useHeaderVisibility";
import handyhjelpLogo from '@/assets/handyhjelp-logo-new.png';
import handyhjelpLogoWhite from '@/assets/handyhjelp-logo-footer.png';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { resolvedTheme } = useTheme();
  const { editMode, isAdmin } = useEditMode();
  const { settings: logoSettings, updateSettings: updateLogoSettings } = useLogoSettings();
  const { isVisible, isAtTop } = useHeaderVisibility();

  // Force header visible when menu is open
  const headerVisible = isMenuOpen || isVisible;

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
      <header className={`fixed top-0 left-0 w-full bg-background/95 backdrop-blur-md border-b border-border z-50 transition-transform duration-300 ease-out ${headerVisible ? 'translate-y-0' : '-translate-y-full'} ${!isAtTop && headerVisible ? 'shadow-md' : ''}`}>
        <div className="container mx-auto px-4">
        {/* Top Contact Bar - Hidden on mobile/tablet */}
        <div className="hidden lg:block bg-secondary text-secondary-foreground py-1.5">
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
        <div className="flex items-center justify-between py-3 lg:py-4 relative">
          {/* Mobile/Tablet Menu Button - Left side */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden min-h-[44px] min-w-[44px] touch-manipulation z-10"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Lukk meny" : "Åpne meny"}
            aria-expanded={isMenuOpen}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Logo - Absolutely centered on mobile/tablet, left-aligned on desktop */}
          <div 
            className="logo-container absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:left-auto flex items-center group"
          >
            <Link
              to="/" 
              className="flex items-center"
            >
              <img 
                src={resolvedTheme === 'dark' ? handyhjelpLogoWhite : handyhjelpLogo} 
                alt="HandyHjelp - Levert med kvalitet" 
                className="w-auto object-contain transition-all duration-200"
                id="header-logo"
              />
              <style>{`
                #header-logo {
                  height: ${logoSettings.mobileHeight}px;
                  padding: ${logoSettings.mobilePadding}px ${logoSettings.mobileHorizontalPadding ?? 0}px;
                }
                @media (min-width: 640px) {
                  #header-logo {
                    height: ${logoSettings.tabletHeight}px;
                    padding: ${logoSettings.tabletPadding}px ${logoSettings.tabletHorizontalPadding ?? 0}px;
                  }
                }
                @media (min-width: 1024px) {
                  #header-logo {
                    height: ${logoSettings.desktopHeight}px;
                    padding: ${logoSettings.desktopPadding}px ${logoSettings.desktopHorizontalPadding ?? 0}px;
                  }
                }
                @media (min-width: 1024px) {
                  .logo-container {
                    margin-left: ${logoSettings.desktopMarginLeft ?? 0}px;
                  }
                }
              `}</style>
            </Link>
            
            {/* Edit button for logo */}
            {isAdmin && editMode && (
              <button
                onClick={() => setIsLogoModalOpen(true)}
                className="absolute -top-1 -right-1 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-30"
                aria-label="Rediger logo-innstillinger"
              >
                <Settings className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Mobile/Tablet Right side - Theme toggle and Profile */}
          <div className="lg:hidden flex items-center gap-1 z-10">
            <ThemeToggleButton />
            <Link 
              to={user ? "/dashboard" : "/auth"} 
              className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground transition-colors touch-manipulation"
              aria-label={user ? "Gå til profil" : "Logg inn"}
            >
              <User className="h-5 w-5" />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Navigation Links */}
            <nav className="flex items-center space-x-6">
              <Link to="/" className={`relative transition-colors text-sm py-1 ${isActive('/') ? 'text-primary font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' : 'text-foreground hover:text-primary'}`}>
                Hjem
              </Link>
              <Link to="/tjenester" className={`relative transition-colors text-sm py-1 ${isActive('/tjenester') ? 'text-primary font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' : 'text-foreground hover:text-primary'}`}>
                Tjenester
              </Link>
              <Link to="/prosjekter" className={`relative transition-colors text-sm py-1 ${isActive('/prosjekter') ? 'text-primary font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' : 'text-foreground hover:text-primary'}`}>
                Prosjekter
              </Link>
              <Link to="/raad" className={`relative transition-colors text-sm py-1 ${isActive('/raad') ? 'text-primary font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' : 'text-foreground hover:text-primary'}`}>
                Råd
              </Link>
              <Link to="/om-oss" className={`relative transition-colors text-sm py-1 ${isActive('/om-oss') ? 'text-primary font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' : 'text-foreground hover:text-primary'}`}>
                Om oss
              </Link>
              <Link to="/kontakt" className={`relative transition-colors text-sm py-1 ${isActive('/kontakt') ? 'text-primary font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' : 'text-foreground hover:text-primary'}`}>
                Kontakt
              </Link>
              <Link to="/faq" className={`relative transition-colors text-sm py-1 ${isActive('/faq') ? 'text-primary font-medium after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary' : 'text-foreground hover:text-primary'}`}>
                FAQ
              </Link>
            </nav>

            {/* Theme Toggle and Auth Buttons */}
            <div className="flex items-center gap-2">
              <ThemeToggleButton />
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
          </div>
        </div>

          {/* Mobile/Tablet Navigation Menu */}
          {isMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-t border-border shadow-lg z-50 animate-fade-in" style={{ animationDuration: '0.2s' }}>
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
      
      {/* Logo Settings Modal */}
      <LogoSettingsModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        settings={logoSettings}
        onSave={updateLogoSettings}
      />
    </>
  );
};