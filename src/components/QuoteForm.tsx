import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Home, Building2, User, Phone, Mail, AlertCircle, Building, CheckCircle, Loader2 } from "lucide-react";
import { CompanySearch } from "./CompanySearch";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { supabase } from "@/integrations/supabase/client";

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

// Hardkodet Web3Forms access key - IKKE BRUK ENVIRONMENT VARIABLE
const WEB3FORMS_ACCESS_KEY = "e73de942-c444-45b1-ba7a-1556f5862bfd";

export const QuoteForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
        user_id: user?.id || null,
      };

      console.log('Saving quote to database:', quoteData);
      
      const { error: dbError } = await supabase
        .from('quotes')
        .insert(quoteData);

      if (dbError) {
        console.error('Database save failed:', dbError);
        // Fortsett likevel - Web3Forms er backup
      } else {
        console.log('Quote saved to database successfully');
      }

      // 2. Send til Web3Forms
      const web3FormData = {
        access_key: 'e73de942-c444-45b1-ba7a-1556f5862bfd',
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

      console.log('Sending to Web3Forms:', web3FormData);

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(web3FormData)
      });

      console.log('Response status:', response.status);
      const responseData = await response.json();
      console.log('Response data:', responseData);

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.message || 'Kunne ikke sende forespørsel');
      }

      // 3. Send bekreftelsesmail til kunden (non-blocking)
      try {
        console.log('Sending confirmation email to:', formData.email);
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
          console.log('Confirmation email sent successfully');
        }
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr);
      }
      // SUCCESS!
      toast({
        title: "Tilbud sendt!",
        description: "Vi tar kontakt med deg innen 1-3 virkedager.",
      });

      navigate(`/takk?email=${encodeURIComponent(formData.email)}&type=${formData.type}`);

    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Feil ved sending",
        description: "Prøv igjen eller ring oss direkte på +47 41250553.",
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
      return basicValid && companyValid && addressValid;
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
    <Card className="form-professional">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">Få gratis tilbud</h3>
        {!(user && step === 3 && profile?.customer_type) && (
          <div className="text-sm text-muted-foreground">
            Steg {step} av 3
          </div>
        )}
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in-up">
          <Label className="text-base font-medium">Privat eller bedrift?</Label>
          
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
          <Label className="text-base font-medium">Dine kontaktopplysninger</Label>
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
                placeholder="Telefonnummer"
                className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                maxLength={15}
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
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-fade-in-up">
          {user && profile?.customer_type ? (
            <div>
              <Label className="text-base font-medium">Beskriv oppdraget</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Vi har allerede dine kontaktopplysninger. Fortell oss hva du ønsker hjelp til.
              </p>
            </div>
          ) : (
            <Label className="text-base font-medium">Beskriv oppdraget</Label>
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
            <Button 
              type="button"
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
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
          )}
        </div>
      </div>
    </Card>
  );
};
