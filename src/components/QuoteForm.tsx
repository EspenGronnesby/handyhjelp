import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Home, Building2, User, Phone, Mail, AlertCircle, Building, CheckCircle, Loader2, UserPlus } from "lucide-react";
import { CompanySearch } from "./CompanySearch";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useContactInfo } from "@/hooks/useContactInfo";
import { supabase } from "@/integrations/supabase/client";
import { LinearProgress } from "@/components/ui/form-progress";
import { useEditMode } from "@/contexts/EditModeContext";
import { useEditableContent } from "@/hooks/useEditableContent";
import { EditButton } from "@/components/ui/EditButton";
import { QuoteFormEditModal } from "@/components/QuoteFormEditModal";

interface Company {
  orgNumber: string;
  name: string;
  organizationForm: string;
  address: string;
  postalCode: string;
  city: string;
}

interface FormData {
  type: "private" | "business" | null;
  name: string;
  email: string;
  phone: string;
  address: string;
  orgNumber: string;
  companyName: string;
  selectedCompany: Company | null;
  description: string;
}

const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

export const QuoteForm = () => {
  const { toast } = useToast();
  const { phone: contactPhone } = useContactInfo();
  const { editMode, isAdmin } = useEditMode();
  const { content: heading } = useEditableContent('quote-form', 'heading');
  const { content: descriptionLabel } = useEditableContent('quote-form', 'description_label');
  const { content: descriptionIntro } = useEditableContent('quote-form', 'description_intro');
  const [isHeadingModalOpen, setIsHeadingModalOpen] = useState(false);
  const displayHeading = heading || 'Få gratis tilbud';
  const displayDescriptionLabel = descriptionLabel || 'Beskriv oppdraget';
  const displayDescriptionIntro = descriptionIntro || 'Vi har allerede dine kontaktopplysninger. Fortell oss hva du ønsker hjelp til.';
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);
  const [formData, setFormData] = useState<FormData>({
    type: null,
    name: "",
    email: "",
    phone: "",
    address: "",
    orgNumber: "",
    companyName: "",
    selectedCompany: null,
    description: ""
  });

  // Auto-fill profile data when available
  useEffect(() => {
    if (!profile) return;

    if (profile.customer_type === 'private' || profile.customer_type === 'business') {
      setFormData(prev => ({
        ...prev,
        type: profile.customer_type,
        name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.customer_type === 'private' ? (profile.address || '') : ''
      }));
      setStep(3);
      
      toast({
        title: "Informasjon hentet",
        description: "Dine kontaktopplysninger er automatisk fylt ut.",
      });
    }
  }, [profile]);

  const handleNext = () => {
    if (validateCurrentStep() && step < 3) {
      setStep(step + 1);
      setErrors({});
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const validateCurrentStep = (): boolean => {
    const currentErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.type) {
        currentErrors.type = "Velg kundetype";
      }
    } else if (step === 2) {
      if (!formData.name.trim()) {
        currentErrors.name = "Navn er påkrevd";
      }
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        currentErrors.email = "Ugyldig e-postadresse";
      }
      if (!formData.phone.trim()) {
        currentErrors.phone = "Telefonnummer er påkrevd";
      }
      if (formData.type === 'private' && !formData.address.trim()) {
        currentErrors.address = "Adresse er påkrevd";
      }
      if (formData.type === 'business' && !formData.selectedCompany) {
        currentErrors.company = "Vennligst velg din bedrift";
      }
      // Valider passord hvis bruker vil opprette konto
      if (!user && createAccount) {
        if (!password || password.length < 6) {
          currentErrors.password = "Passord må være minst 6 tegn";
        }
      }
    } else if (step === 3) {
      if (!formData.description.trim()) {
        currentErrors.description = "Beskrivelse er påkrevd";
      } else if (formData.description.length < 10) {
        currentErrors.description = "Beskrivelse må være minst 10 tegn";
      }
    }

    setErrors(currentErrors);
    return Object.keys(currentErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (step !== 3 || !validateCurrentStep()) return;
    
    setIsSubmitting(true);

    try {
      let newUserId = user?.id || null;
      
      // Opprett bruker hvis avkrysset og ikke innlogget
      if (createAccount && !user) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: {
              full_name: formData.name,
              phone: formData.phone,
              customer_type: formData.type,
              org_number: formData.selectedCompany?.orgNumber || null,
              company_name: formData.selectedCompany?.name || null
            }
          }
        });

        if (signUpError) {
          if (signUpError.message.includes('already registered') || signUpError.message.includes('already exists')) {
            toast({
              title: "E-post allerede registrert",
              description: "Logg inn for å knytte forespørselen til din konto, eller bruk en annen e-postadresse.",
              variant: "destructive"
            });
            setIsSubmitting(false);
            return;
          }
          console.error('SignUp error:', signUpError);
        } else if (signUpData?.user) {
          newUserId = signUpData.user.id;
          toast({
            title: "Konto opprettet!",
            description: "Du kan nå logge inn med din e-post og passord.",
          });
        }
      }

      // 1. Lagre til database FØRST
      const quoteData = {
        type: formData.type || 'private',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.type === 'private' ? formData.address : (formData.selectedCompany?.address || ''),
        company_name: formData.selectedCompany?.name || null,
        org_number: formData.selectedCompany?.orgNumber || null,
        description: formData.description,
        status: 'pending',
        user_id: newUserId,
      };

      
      
      // Merk: Vi bruker IKKE .select() etter insert fordi anonyme brukere
      // ikke har lesetilgang til quotes-tabellen (kun admin kan lese)
      const { error: dbError } = await supabase
        .from('quotes')
        .insert(quoteData);

      if (dbError) {
        console.error('Database save failed:', dbError);
        // Fortsett likevel - Web3Forms er backup
      } else {
        
        
        // Opprett notifikasjon for bruker (ny eller eksisterende)
        if (newUserId) {
          await supabase.from('notifications').insert({
            user_id: newUserId,
            type: 'quote_update',
            title: 'Forespørsel mottatt',
            message: 'Vi har mottatt din forespørsel og vil ta kontakt innen 1-3 virkedager.',
            read: false
          });
        }
      }

      // 2. Send til Web3Forms
      const web3FormData: Record<string, string> = {
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `Ny tilbudsforespørsel fra ${formData.name}`,
        from_name: "HandyHjelp Nettside",
        type: formData.type === 'private' ? 'Privat' : 'Bedrift',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || 'Ikke oppgitt',
        company_name: formData.selectedCompany?.name || 'Ikke oppgitt',
        org_number: formData.selectedCompany?.orgNumber || 'Ikke oppgitt',
        description: formData.description,
      };

      

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(web3FormData)
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Kunne ikke sende forespørsel');
      }

      // 3. Send bekreftelsesmail til kunden (non-blocking)
      try {
        
        const { error: emailError } = await supabase.functions.invoke('send-confirmation-email', {
          body: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            customerType: formData.type || 'private',
          },
        });

        if (emailError) {
          console.error('Confirmation email failed:', emailError);
        } else {
          
        }
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
      }
      // SUCCESS!
      toast({
        title: "Tilbud sendt!",
        description: "Vi tar kontakt med deg innen 1-3 virkedager.",
      });

      const accountParam = (createAccount && !user && newUserId) ? '&accountCreated=true' : '';
      navigate(`/takk?email=${encodeURIComponent(formData.email)}&type=${formData.type}${accountParam}`);

    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Feil ved sending",
        description: `Prøv igjen eller ring oss direkte på ${contactPhone}.`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = (): boolean => {
    if (step === 1) return formData.type !== null;
    if (step === 2) {
      const basicValid = !!(formData.name.trim() && formData.email.trim() && formData.phone.trim());
      const companyValid = formData.type === 'business' ? !!formData.selectedCompany : true;
      const addressValid = formData.type === 'private' ? !!formData.address.trim() : true;
      const passwordValid = (!user && createAccount) ? password.length >= 6 : true;
      return basicValid && companyValid && addressValid && passwordValid;
    }
    if (step === 3) return formData.description.trim().length >= 10;
    return false;
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleTypeSelect = (type: 'private' | 'business') => {
    handleInputChange('type', type);
    if (profile) {
      setFormData(prev => ({
        ...prev,
        type,
        name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: type === 'private' ? (profile.address || '') : ''
      }));
    }
  };

  return (
    <>
    <Card className="form-professional">
      {/* Progress indicator */}
      {!(user && profile?.customer_type) && (
        <LinearProgress 
          currentStep={step} 
          totalSteps={3} 
          className="mb-6"
        />
      )}
      
      <div className="flex items-center justify-between mb-6 relative">
        <h3 className="text-xl font-bold text-foreground">{displayHeading}</h3>
        {isAdmin && editMode && (
          <EditButton
            onClick={() => setIsHeadingModalOpen(true)}
            ariaLabel="Rediger skjema-overskrift"
            position="inline"
          />
        )}
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in-up">
          <Label className="text-base font-medium" required>Privat eller bedrift?</Label>
          
          {user && profile && (
            <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-md text-sm text-success-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Dine kontaktopplysninger vil bli fylt ut automatisk</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={formData.type === "private" ? "default" : "outline"}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleTypeSelect('private')}
            >
              <Home className="h-6 w-6" />
              <span>Privat</span>
            </Button>
            <Button
              variant={formData.type === "business" ? "default" : "outline"}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleTypeSelect('business')}
            >
              <Building2 className="h-6 w-6" />
              <span>Bedrift</span>
            </Button>
          </div>
          {errors.type && (
            <div className="flex items-center gap-1 mt-2 text-sm text-destructive">
              <AlertCircle className="h-3 w-3" />
              {errors.type}
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-fade-in-up">
          <Label className="text-base font-medium" required>Dine kontaktopplysninger</Label>
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Fullt navn"
                className={`pl-10 ${errors.name ? 'border-destructive' : ''}`}
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                maxLength={100}
              />
              {errors.name && (
                <div className="flex items-center gap-1 mt-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </div>
              )}
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="E-postadresse"
                className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                maxLength={255}
              />
              {errors.email && (
                <div className="flex items-center gap-1 mt-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </div>
              )}
            </div>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="8 siffer"
                className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  handleInputChange('phone', value);
                }}
                maxLength={8}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              {errors.phone && (
                <div className="flex items-center gap-1 mt-1 text-sm text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  {errors.phone}
                </div>
              )}
            </div>
            {formData.type === 'private' && (
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Adresse (gate/vei, postnummer, sted)"
                  className={`pl-10 ${errors.address ? 'border-destructive' : ''}`}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  maxLength={200}
                />
                {errors.address && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.address}
                  </div>
                )}
              </div>
            )}
            {formData.type === 'business' && (
              <div className="space-y-4">
                <CompanySearch
                  onCompanySelect={(company) => {
                    setFormData(prev => ({
                      ...prev,
                      selectedCompany: company,
                      orgNumber: company?.orgNumber || '',
                      companyName: company?.name || ''
                    }));
                    if (company && errors.company) {
                      setErrors(prev => ({ ...prev, company: '' }));
                    }
                  }}
                  selectedCompany={formData.selectedCompany}
                  disabled={isSubmitting}
                />
                {errors.company && (
                  <div className="flex items-center gap-1 text-sm text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    {errors.company}
                  </div>
                )}
              </div>
            )}
            
            {/* Avkrysningsboks for automatisk kontoopprettelse - kun for ikke-innloggede */}
            {!user && (
              <div className="pt-4 border-t space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="createAccount" 
                    checked={createAccount}
                    onCheckedChange={(checked) => {
                      setCreateAccount(checked === true);
                      if (!checked) {
                        setPassword('');
                        setErrors(prev => ({ ...prev, password: '' }));
                      }
                    }}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="createAccount" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Opprett en konto
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Følg med på din forespørsel og få tilgang til kundeportalen
                    </p>
                  </div>
                </div>
                
                {createAccount && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="password" className="text-sm">Velg et passord</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minst 6 tegn"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) {
                          setErrors(prev => ({ ...prev, password: '' }));
                        }
                      }}
                      className={errors.password ? 'border-destructive' : ''}
                      minLength={6}
                    />
                    {errors.password && (
                      <div className="flex items-center gap-1 text-sm text-destructive">
                        <AlertCircle className="h-3 w-3" />
                        {errors.password}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-in-up">
          {user && profile?.customer_type ? (
            <div>
              <Label className="text-base font-medium" required>{displayDescriptionLabel}</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                {displayDescriptionIntro}
              </p>
            </div>
          ) : (
            <Label className="text-base font-medium" required>{displayDescriptionLabel}</Label>
          )}
          <Textarea
            placeholder="Fortell oss om jobben som skal gjøres..."
            className={`min-h-32 ${errors.description ? 'border-destructive' : ''}`}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            maxLength={2000}
          />
          {errors.description && (
            <div className="flex items-center gap-1 mt-1 text-sm text-destructive">
              <AlertCircle className="h-3 w-3" />
              {errors.description}
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            {formData.description.length}/2000 tegn
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <span className="text-destructive">*</span> Obligatoriske felt
          </p>
        </div>
      )}

      <div className="flex justify-between pt-6 border-t mt-6">
        {step > 1 && !(user && profile?.customer_type) && (
          <Button 
            type="button"
            variant="outline" 
            onClick={handleBack}
          >
            Tilbake
          </Button>
        )}
        <div className="ml-auto">
          {step < 3 ? (
            <Button 
              type="button"
              onClick={handleNext} 
              disabled={!isStepValid()}
              className="bg-success hover:bg-success-hover text-success-foreground"
            >
              Neste <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <>
            {import.meta.env.VITE_HCAPTCHA_SITE_KEY && (
              <HCaptcha
                ref={captchaRef}
                sitekey={import.meta.env.VITE_HCAPTCHA_SITE_KEY}
                onVerify={(token) => setCaptchaToken(token)}
                onExpire={() => setCaptchaToken(null)}
              />
            )}
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting || (!captchaToken && !!import.meta.env.VITE_HCAPTCHA_SITE_KEY)}
              className="bg-success hover:bg-success-hover text-success-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sender...
                </>
              ) : (
                'Send forespørsel'
              )}
            </Button>
            </>
          )}
        </div>
      </div>
    </Card>
    <QuoteFormEditModal
      isOpen={isHeadingModalOpen}
      onClose={() => setIsHeadingModalOpen(false)}
      currentData={{
        heading: displayHeading,
        descriptionLabel: displayDescriptionLabel,
        descriptionIntro: displayDescriptionIntro,
      }}
    />
    </>
  );
};
