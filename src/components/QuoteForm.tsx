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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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

export const QuoteForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    full_name: string;
    email: string;
    phone: string;
    address: string;
    customer_type: 'private' | 'business' | null;
  } | null>(null);
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

  // Fetch user profile data if logged in
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, email, phone, address, customer_type')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }

        if (data) {
          setUserProfile({
            ...data,
            customer_type: data.customer_type as 'private' | 'business' | null
          });
          
          // Auto-skip step 1 if customer_type exists
          if (data.customer_type && (data.customer_type === 'private' || data.customer_type === 'business')) {
            setFormData(prev => ({
              ...prev,
              type: data.customer_type as 'private' | 'business',
              name: data.full_name || '',
              email: data.email || '',
              phone: data.phone || '',
              address: data.customer_type === 'private' ? (data.address || '') : ''
            }));
            setStep(3);
            
            toast({
              title: "Informasjon hentet",
              description: "Dine kontaktopplysninger er automatisk fylt ut. Skriv kun beskrivelsen av jobben.",
            });
          }
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
      }
    };

    fetchProfile();
  }, [user]);

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

    try {
      if (step === 1) {
        if (!formData.type) {
          currentErrors.type = "Velg kunde type";
          setErrors(currentErrors);
          return false;
        }
      } else if (step === 2) {
        // Validate step 2 fields
        const step2Data = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
        };

        if (!step2Data.name.trim()) {
          currentErrors.name = "Navn er påkrevd";
        } else if (step2Data.name.length < 2) {
          currentErrors.name = "Navn må være minst 2 tegn";
        } else if (step2Data.name.length > 100) {
          currentErrors.name = "Navn kan ikke være mer enn 100 tegn";
        } else if (!/^[a-zA-ZæøåÆØÅ\s\-'\.]+$/.test(step2Data.name)) {
          currentErrors.name = "Navn kan kun inneholde bokstaver";
        }

        if (!step2Data.email.trim()) {
          currentErrors.email = "E-post er påkrevd";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step2Data.email)) {
          currentErrors.email = "Ugyldig e-postadresse";
        } else if (step2Data.email.length > 255) {
          currentErrors.email = "E-post kan ikke være mer enn 255 tegn";
        }

        if (!step2Data.phone.trim()) {
          currentErrors.phone = "Telefonnummer er påkrevd";
        } else if (!/^[\+]?[0-9\s\-\(\)]{8,15}$/.test(step2Data.phone.trim())) {
          currentErrors.phone = "Ugyldig telefonnummer";
        }

        // Address validation for private customers
        if (formData.type === 'private') {
          if (!formData.address.trim()) {
            currentErrors.address = "Adresse er påkrevd";
          } else if (formData.address.length < 5) {
            currentErrors.address = "Adresse må være minst 5 tegn";
          } else if (formData.address.length > 200) {
            currentErrors.address = "Adresse kan ikke være mer enn 200 tegn";
          }
        }

        // Organization number and company validation for business customers (only for non-logged-in users)
        if (formData.type === 'business' && !user) {
          if (!formData.selectedCompany) {
            currentErrors.company = "Vennligst finn og velg din bedrift fra Brønnøysundregistrene";
          }
        }

      } else if (step === 3) {
        if (!formData.description.trim()) {
          currentErrors.description = "Beskrivelse er påkrevd";
        } else if (formData.description.length < 10) {
          currentErrors.description = "Beskrivelse må være minst 10 tegn";
        } else if (formData.description.length > 2000) {
          currentErrors.description = "Beskrivelse kan ikke være mer enn 2000 tegn";
        }
      }

      setErrors(currentErrors);
      return Object.keys(currentErrors).length === 0;
    } catch (error) {
      console.error('Validation error:', error);
      setErrors({ general: "Validering feilet. Prøv igjen." });
      return false;
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (step !== 3) return;
    
    const isValid = validateCurrentStep();
    if (!isValid) return;
    
    setIsSubmitting(true);

    try {
      // Hardcoded access key (temporary solution - will be replaced)
      const accessKey = 'a538bdee-7710-48bb-897c-b113576fd3a8';
      
      if (!accessKey) {
        console.error('Web3Forms access key is missing!');
        toast({
          title: "Konfigurasjonsfeil",
          description: "Kan ikke sende forespørsel. Kontakt support på +47 41250553",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Send email via Web3Forms only (no database)
      const web3FormData = {
        access_key: accessKey,
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

      if (!response.ok) {
        throw new Error('Kunne ikke sende tilbudsforespørsel');
      }

      toast({
        title: "Tilbud sendt!",
        description: "Vi tar kontakt med deg innen 2 timer.",
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
    switch (step) {
      case 1:
        return formData.type !== null;
      case 2:
        const basicFieldsValid = !!(formData.name.trim() && formData.email.trim() && formData.phone.trim());
        const companyValid = formData.type === 'business' ? !!formData.selectedCompany : true;
        const addressValid = formData.type === 'private' ? !!(formData.address.trim() && formData.address.length >= 5) : true;
        return basicFieldsValid && companyValid && addressValid;
      case 3:
        return formData.description.trim().length >= 10;
      default:
        return false;
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <Card className="form-professional">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">Få gratis tilbud</h3>
        {!(user && step === 3 && userProfile?.customer_type) && (
          <div className="text-sm text-muted-foreground">
            Steg {step} av 3
          </div>
        )}
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in-up">
          <Label className="text-base font-medium">Privat eller bedrift?</Label>
          
          {user && userProfile && (
            <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-md text-sm text-success-foreground">
              <CheckCircle className="h-4 w-4 text-success" />
              <span>Dine kontaktopplysninger vil bli fylt ut automatisk</span>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={formData.type === "private" ? "default" : "outline"}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => {
                handleInputChange('type', 'private');
                // Auto-fill for logged-in users
                if (user && userProfile) {
                  setFormData(prev => ({
                    ...prev,
                    type: 'private',
                    name: userProfile.full_name || '',
                    email: userProfile.email || '',
                    phone: userProfile.phone || '',
                    address: userProfile.address || ''
                  }));
                  toast({
                    title: "Kontaktinfo fylt ut",
                    description: "Dine opplysninger er hentet fra profilen din",
                  });
                }
              }}
            >
              <Home className="h-6 w-6" />
              <span>Privat</span>
            </Button>
            <Button
              variant={formData.type === "business" ? "default" : "outline"}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => {
                handleInputChange('type', 'business');
                // Auto-fill for logged-in users (not address for business)
                if (user && userProfile) {
                  setFormData(prev => ({
                    ...prev,
                    type: 'business',
                    name: userProfile.full_name || '',
                    email: userProfile.email || '',
                    phone: userProfile.phone || ''
                  }));
                  toast({
                    title: "Kontaktinfo fylt ut",
                    description: "Dine opplysninger er hentet fra profilen din",
                  });
                }
              }}
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
                    const updates: Partial<FormData> = {
                      selectedCompany: company,
                      orgNumber: company?.orgNumber || '',
                      companyName: company?.name || ''
                    };
                    
                    setFormData(prev => ({ ...prev, ...updates }));
                    
                    // Clear company error when selecting a company
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
          {user && userProfile?.customer_type ? (
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
            placeholder="Fortell oss om jobben som skal gjøres, når det passer og eventuelle spesielle ønsker..."
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
            Jo mer detaljer, desto mer nøyaktig blir tilbudet. ({formData.description.length}/2000 tegn)
          </p>
        </div>
      )}

      <div className="flex justify-between pt-6 border-t">
        {step > 1 && !(user && userProfile?.customer_type) && (
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
              type="submit"
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

      {/* Error message for general errors */}
      {errors.general && (
        <div className="flex items-center gap-2 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">{errors.general}</span>
        </div>
      )}

    </Card>
  );
};