import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Clock, MapPin, Facebook, Instagram, Linkedin, Pencil } from 'lucide-react';
import { useTheme } from 'next-themes';
import handyhjelpLogo from '@/assets/handyhjelp-logo-new.png';
import handyhjelpLogoFooter from '@/assets/handyhjelp-logo-footer.png';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { FooterEditModal } from './FooterEditModal';

export const Footer = () => {
  const { resolvedTheme } = useTheme();
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch editable content
  const { content: description } = useEditableContent('footer', 'description');
  const { content: address } = useEditableContent('footer', 'address');
  const { content: phone } = useEditableContent('footer', 'phone');
  const { content: email } = useEditableContent('footer', 'email');
  const { content: hours } = useEditableContent('footer', 'hours');
  const { content: facebookUrl } = useEditableContent('footer', 'facebook_url');
  const { content: instagramUrl } = useEditableContent('footer', 'instagram_url');
  const { content: linkedinUrl } = useEditableContent('footer', 'linkedin_url');
  const { content: copyright } = useEditableContent('footer', 'copyright');

  // Default values
  const footerData = {
    description: description || 'Din pålitelige partner for vaktmester-, tømrer- og blikkenslagertjenester. Med over 20 års erfaring leverer vi kvalitet og trygghet til kunder i Kristiansand og omegn.',
    address: address || 'Kristiansand, Norge',
    phone: phone || '+47 41250553',
    email: email || 'Team@handyhjelp.no',
    hours: hours || 'Man-Fre 09:00-17:00',
    facebookUrl: facebookUrl || '#',
    instagramUrl: instagramUrl || '#',
    linkedinUrl: linkedinUrl || '#',
    copyright: copyright || '© 2025 HandyHjelp. Alle rettigheter reservert.'
  };

  return (
    <>
      <footer className="bg-secondary text-secondary-foreground relative">
        {/* Edit button */}
        {isAdmin && editMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-4 right-4 z-10 bg-background rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
            title="Rediger footer"
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
        )}

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
            {/* Kolonne 1: HandyHjelp Info */}
            <div className="col-span-2 md:col-span-1">
              <img 
                alt="HandyHjelp - Levert med kvalitet" 
                className="h-16 md:h-20 w-auto object-contain mb-4" 
                src={resolvedTheme === 'dark' ? handyhjelpLogoFooter : handyhjelpLogo} 
              />
              <p className="text-sm mb-4 opacity-90">
                {footerData.description}
              </p>
              <div className="flex gap-2">
                <a 
                  href={footerData.facebookUrl}
                  target={footerData.facebookUrl !== '#' ? '_blank' : undefined}
                  rel={footerData.facebookUrl !== '#' ? 'noopener noreferrer' : undefined}
                  className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-secondary-foreground/10 hover:bg-primary hover:text-primary-foreground transition-colors active:scale-95" 
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href={footerData.instagramUrl}
                  target={footerData.instagramUrl !== '#' ? '_blank' : undefined}
                  rel={footerData.instagramUrl !== '#' ? 'noopener noreferrer' : undefined}
                  className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-secondary-foreground/10 hover:bg-primary hover:text-primary-foreground transition-colors active:scale-95" 
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href={footerData.linkedinUrl}
                  target={footerData.linkedinUrl !== '#' ? '_blank' : undefined}
                  rel={footerData.linkedinUrl !== '#' ? 'noopener noreferrer' : undefined}
                  className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-secondary-foreground/10 hover:bg-primary hover:text-primary-foreground transition-colors active:scale-95" 
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Kolonne 2: Tjenester */}
            <div>
              <h4 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">Tjenester</h4>
              <ul className="space-y-1">
                <li>
                  <Link to="/tjenester#vaktmester" className="block py-2 min-h-[44px] flex items-center text-sm hover:text-primary transition-colors active:text-primary/80">
                    Vaktmester
                  </Link>
                </li>
                <li>
                  <Link to="/tjenester#toemrer" className="block py-2 min-h-[44px] flex items-center text-sm hover:text-primary transition-colors active:text-primary/80">
                    Tømrer
                  </Link>
                </li>
                <li>
                  <Link to="/tjenester#blikk" className="block py-2 min-h-[44px] flex items-center text-sm hover:text-primary transition-colors active:text-primary/80">
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
              <h4 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">Selskap</h4>
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
              <h4 className="font-semibold mb-3 md:mb-4 text-base md:text-lg">Kontakt</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex items-start gap-2 py-1">
                  <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                  <span>{footerData.address}</span>
                </li>
                <li>
                  <a href={`tel:${footerData.phone.replace(/\s/g, '')}`} className="flex items-center gap-2 py-2 min-h-[44px] hover:text-primary transition-colors active:text-primary/80">
                    <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                    {footerData.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${footerData.email}`} className="flex items-center gap-2 py-2 min-h-[44px] hover:text-primary transition-colors active:text-primary/80">
                    <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                    {footerData.email}
                  </a>
                </li>
                <li className="flex items-start gap-2 py-1">
                  <Clock className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                  <span>{footerData.hours}</span>
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
              <p className="text-center md:text-left">{footerData.copyright}</p>
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
