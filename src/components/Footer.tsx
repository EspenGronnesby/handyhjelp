import { Link } from 'react-router-dom';
import { Phone, Mail, Clock, MapPin, Facebook, Instagram, Linkedin } from 'lucide-react';
import handyhjelpLogo from '@/assets/handyhjelp-logo-new.png';
import handyhjelpLogoFooter from '@/assets/handyhjelp-logo-footer.png';

export const Footer = () => {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Kolonne 1: HandyHjelp Info */}
          <div>
            <img 
              src={handyhjelpLogo} 
              alt="HandyHjelp - Levert med kvalitet" 
              className="h-20 w-auto object-contain mb-4"
            />
            <p className="text-sm mb-4 opacity-90">
              Din pålitelige partner for vaktmester-, tømrer- og blikkenslagertjenester. 
              Med over 20 års erfaring leverer vi kvalitet og trygghet til kunder i Kristiansand og omegn.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Kolonne 2: Tjenester */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Tjenester</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/tjenester#vaktmester" className="hover:text-primary transition-colors">
                  Vaktmester
                </Link>
              </li>
              <li>
                <Link to="/tjenester#toemrer" className="hover:text-primary transition-colors">
                  Tømrer
                </Link>
              </li>
              <li>
                <Link to="/tjenester#blikk" className="hover:text-primary transition-colors">
                  Blikk
                </Link>
              </li>
              <li>
                <Link to="/#quote-form" className="hover:text-primary transition-colors">
                  Faste avtaler
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolonne 3: Selskap */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Selskap</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/om-oss" className="hover:text-primary transition-colors">
                  Om oss
                </Link>
              </li>
              <li>
                <Link to="/prosjekter" className="hover:text-primary transition-colors">
                  Prosjekter
                </Link>
              </li>
              <li>
                <Link to="/priser" className="hover:text-primary transition-colors">
                  Priser
                </Link>
              </li>
              <li>
                <Link to="/raad" className="hover:text-primary transition-colors">
                  Blogg
                </Link>
              </li>
              <li>
                <Link to="/kontakt" className="hover:text-primary transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolonne 4: Kontakt */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Kontakt</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>Kristiansand, Norge</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <a href="tel:+4741250553" className="hover:text-primary transition-colors">
                  +47 41250553
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <a href="mailto:handyhjelp@gmail.com" className="hover:text-primary transition-colors">
                  handyhjelp@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-1 flex-shrink-0" />
                <span>Man-Fre 07:00-17:00</span>
              </li>
            </ul>
          </div>

          {/* Kolonne 5: Logo */}
          <div className="col-span-2 lg:col-span-1 flex items-center justify-center lg:justify-end">
            <img 
              src={handyhjelpLogoFooter} 
              alt="HandyHjelp Logo" 
              className="h-32 w-auto object-contain opacity-90"
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-secondary-foreground/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-80">
            <p>© 2025 HandyHjelp. Alle rettigheter reservert.</p>
            <div className="flex gap-6">
              <Link to="/personvern" className="hover:text-primary transition-colors">
                Personvern
              </Link>
              <Link to="/cookies" className="hover:text-primary transition-colors">
                Cookies
              </Link>
              <Link to="/vilkaar" className="hover:text-primary transition-colors">
                Vilkår
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
