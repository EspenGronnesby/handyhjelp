import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Clock, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import { useTheme } from 'next-themes';
import handyhjelpLogo from '@/assets/handyhjelp-logo-new.png';
import handyhjelpLogoFooter from '@/assets/handyhjelp-logo-footer.png';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { useContactInfo } from '@/hooks/useContactInfo';
import { FooterEditModal } from './FooterEditModal';
import { EditButton } from './ui/EditButton';

// TikTok icon component (not available in lucide-react)
const TikTok = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
);

// Helper function to check if a social URL is valid
const isValidSocialUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  return trimmed !== '' && trimmed !== '#';
};

export const Footer = () => {
  const { resolvedTheme } = useTheme();
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Shared contact info (single source of truth)
  const { phone, email, address, hours, phoneHref, emailHref } = useContactInfo();

  // Fetch editable content (footer-specific)
  const { content: description } = useEditableContent('footer', 'description');
  const { content: facebookUrl } = useEditableContent('footer', 'facebook_url');
  const { content: instagramUrl } = useEditableContent('footer', 'instagram_url');
  const { content: linkedinUrl } = useEditableContent('footer', 'linkedin_url');
  const { content: tiktokUrl } = useEditableContent('footer', 'tiktok_url');
  const { content: copyright } = useEditableContent('footer', 'copyright');
  const { content: googleReviewUrl } = useEditableContent('footer', 'google_review_url');

  // Default values - empty for social URLs means they won't show
  const footerData = {
    description: description || 'Din pålitelige partner for vaktmester-, tømrer- og blikkenslagertjenester. Med over 20 års erfaring leverer vi kvalitet og trygghet til kunder i Kristiansand og omegn.',
    address,
    phone,
    email,
    hours,
    facebookUrl: facebookUrl || '',
    instagramUrl: instagramUrl || '',
    linkedinUrl: linkedinUrl || '',
    tiktokUrl: tiktokUrl || '',
    copyright: copyright || '© 2025 HandyHjelp. Alle rettigheter reservert.',
    googleReviewUrl: googleReviewUrl || 'https://www.google.com/search?q=HandyHjelp&stick=H4sIAAAAAAAA_-NgU1I1qDAzs0iyTEpNSrI0TDZIM0qzMqhIskxONDEzSjI2T06zMDNLWcTK5ZGYl1LpkZWaUwAAlxRHNTYAAAA&hl=no&mat=CXN9U6uXy7S5ElcBTVDHnmCFoNnRZBpcne27wWNKhGmOqvkQJQsI1NBAqpIkoJf5CnhvLjb9bX-_4I5nT7RZNFDfMkLfVfY0zZ2_SbDj7d9CzfARLJ7GTNBzuv1GlCEKaq8&authuser=0&sei=U_Jraba5F92xwPAP8euBgAc'
  };

  return (
    <>
      <footer className="bg-secondary text-secondary-foreground relative">
        {/* Tynn gradient-stripe på toppen — visuell signatur */}
        <div
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 pointer-events-none"
          aria-hidden="true"
        />

        {/* Edit button */}
        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger footer" />
        )}

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            {/* Kolonne 1: HandyHjelp Info */}
            <div className="col-span-2 md:col-span-1">
              <img 
                alt="HandyHjelp - Levert med kvalitet" 
                className="h-16 md:h-20 w-auto object-contain mb-4" 
                src={resolvedTheme === 'dark' || resolvedTheme === 'blue' ? handyhjelpLogoFooter : handyhjelpLogo} 
              />
              <p className="text-sm mb-4 opacity-90">
                {footerData.description}
              </p>
              <div className="flex gap-2">
                {isValidSocialUrl(footerData.facebookUrl) && (
                  <a 
                    href={footerData.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-secondary-foreground/10 hover:bg-gradient-to-br hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-600 hover:text-white transition-all active:scale-95" 
                    aria-label="Facebook"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                {isValidSocialUrl(footerData.instagramUrl) && (
                  <a 
                    href={footerData.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-secondary-foreground/10 hover:bg-gradient-to-br hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-600 hover:text-white transition-all active:scale-95" 
                    aria-label="Instagram"
                  >
                    <Instagram className="h-5 w-5" />
                  </a>
                )}
                {isValidSocialUrl(footerData.linkedinUrl) && (
                  <a 
                    href={footerData.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-secondary-foreground/10 hover:bg-gradient-to-br hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-600 hover:text-white transition-all active:scale-95" 
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {isValidSocialUrl(footerData.tiktokUrl) && (
                  <a 
                    href={footerData.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-secondary-foreground/10 hover:bg-gradient-to-br hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-600 hover:text-white transition-all active:scale-95" 
                    aria-label="TikTok"
                  >
                    <TikTok className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Kolonne 2: Tjenester */}
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-base md:text-lg relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-1.5 after:w-8 after:h-0.5 after:bg-gradient-to-r after:from-cyan-500 after:to-blue-500 after:rounded-full">Tjenester</h4>
              <ul className="space-y-1">
              <li>
                  <Link to="/tjenester/vaktmester" className="block py-2 min-h-[44px] flex items-center text-sm hover:text-primary transition-colors active:text-primary/80">
                    Vaktmester
                  </Link>
                </li>
                <li>
                  <Link to="/tjenester/toemrer" className="block py-2 min-h-[44px] flex items-center text-sm hover:text-primary transition-colors active:text-primary/80">
                    Tømrer
                  </Link>
                </li>
                <li>
                  <Link to="/tjenester/blikk" className="block py-2 min-h-[44px] flex items-center text-sm hover:text-primary transition-colors active:text-primary/80">
                    Blikk
                  </Link>
                </li>
                <li>
                  <Link to="/fast-avtale" className="block py-2 min-h-[44px] flex items-center text-sm hover:text-primary transition-colors active:text-primary/80">
                    Faste avtaler
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kolonne 3: Selskap */}
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-base md:text-lg relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-1.5 after:w-8 after:h-0.5 after:bg-gradient-to-r after:from-emerald-500 after:to-teal-500 after:rounded-full">Selskap</h4>
              <ul className="space-y-1">
                <li>
                  <Link to="/om-oss" className="block py-2 min-h-[44px] flex items-center text-sm hover:text-primary transition-colors active:text-primary/80">
                    Om oss
                  </Link>
                </li>
                <li>
                  <Link to="/prosjekter" className="block py-2 min-h-[44px] flex items-center text-sm hover:text-primary transition-colors active:text-primary/80">
                    Prosjekter
                  </Link>
                </li>
                <li>
                  <Link to="/raad" className="block py-2 min-h-[44px] flex items-center text-sm hover:text-primary transition-colors active:text-primary/80">
                    Blogg
                  </Link>
                </li>
                <li>
                  <Link to="/kontakt" className="block py-2 min-h-[44px] flex items-center text-sm hover:text-primary transition-colors active:text-primary/80">
                    Kontakt
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="block py-2 min-h-[44px] flex items-center text-sm hover:text-primary transition-colors active:text-primary/80">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Kolonne 4: Kontakt */}
            <div className="col-span-2 md:col-span-1">
              <h4 className="font-semibold mb-3 md:mb-4 text-base md:text-lg relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-1.5 after:w-8 after:h-0.5 after:bg-gradient-to-r after:from-amber-500 after:to-orange-500 after:rounded-full">Kontakt</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2 py-1">
                  <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                  <span>{footerData.address}</span>
                </li>
                <li>
                  <a href={phoneHref} className="flex items-center gap-2 py-2 min-h-[44px] hover:text-primary transition-colors active:text-primary/80">
                    <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                    {phone}
                  </a>
                </li>
                <li>
                  <a href={emailHref} className="flex items-center gap-2 py-2 min-h-[44px] hover:text-primary transition-colors active:text-primary/80">
                    <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                    {email}
                  </a>
                </li>
                <li>
                  <a 
                    href={footerData.googleReviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 py-2 min-h-[44px] hover:text-primary transition-colors active:text-primary/80"
                    title="Se våre anmeldelser på Google"
                  >
                    <Clock className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>{footerData.hours}</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Kolonne 5: Logo */}
            
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-foreground/20">
          <div className="container mx-auto px-4 py-4 md:py-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-80">
              <div className="flex items-center gap-3 text-center md:text-left">
                <p>{footerData.copyright}</p>
                <span className="hidden md:inline text-secondary-foreground/40">|</span>
                <a 
                  href={footerData.googleReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors text-xs"
                  title="Se våre Google-anmeldelser"
                >
                  Google
                </a>
              </div>
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                <Link to="/personvern" className="py-2 min-h-[44px] flex items-center hover:text-primary transition-colors active:text-primary/80">
                  Personvern
                </Link>
                <Link to="/cookies" className="py-2 min-h-[44px] flex items-center hover:text-primary transition-colors active:text-primary/80">
                  Cookies
                </Link>
                <Link to="/vilkaar" className="py-2 min-h-[44px] flex items-center hover:text-primary transition-colors active:text-primary/80">
                  Vilkår
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <FooterEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentData={footerData}
      />
    </>
  );
};
