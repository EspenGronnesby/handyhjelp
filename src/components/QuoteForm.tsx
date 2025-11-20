import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Home, Building2, User, Phone, Mail, AlertCircle, Building, CheckCircle } from "lucide-react";
import { CompanySearch } from "./CompanySearch";
import { contactFormSchema, type ContactFormData, sanitizeInput } from "@/lib/validation";
import { formRateLimiter, detectSuspiciousActivity, logSecurityEvent } from "@/lib/security";
import { z } from "zod";
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

  const handleSubmit = async () => {
    console.log('[QuoteForm] 🔵 handleSubmit called');
    console.log('[QuoteForm] Current step:', step);
    console.log('[QuoteForm] Form data:', formData);
    
    const isValid = validateCurrentStep();
    console.log('[QuoteForm] Validation result:', isValid);
    
    if (!isValid) {
      console.log('[QuoteForm] ❌ Validation failed, stopping submission');
      return;
    }
    
    console.log('[QuoteForm] ✅ Validation passed, starting submission');
    setIsSubmitting(true);

    try {
      // Rate limiting check
      console.log('[QuoteForm] Checking rate limit...');
      const userIdentifier = formData.email || 'anonymous';
      if (!formRateLimiter.isAllowed(userIdentifier)) {
        const remainingTime = Math.ceil(formRateLimiter.getRemainingTime(userIdentifier) / 60000);
        toast({
          title: "For mange forsøk",
          description: `Vent ${remainingTime} minutter før du prøver igjen.`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      console.log('[QuoteForm] ✅ Rate limit passed');

      // Check daily quote limit for authenticated users (2 quotes per day)
      if (user) {
        console.log('[QuoteForm] Checking daily quote limit for user:', user.id);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count, error: countError } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('created_at', today.toISOString());

        if (countError) {
          console.error('[QuoteForm] Error checking quote limit:', countError);
        } else if (count !== null && count >= 2) {
          console.log('[QuoteForm] ❌ Daily limit reached:', count);
          toast({
            title: "Daglig grense nådd",
            description: "Du kan sende maks 2 tilbudsforespørsler per dag. Prøv igjen i morgen.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
        console.log('[QuoteForm] ✅ Daily limit check passed, count:', count);
      }

      console.log('[QuoteForm] Starting security validation...');
      // Security validation
      const validationData: ContactFormData = {
        type: formData.type!,
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        orgNumber: formData.selectedCompany?.orgNumber,
        description: sanitizeInput(formData.description),
        isAuthenticated: !!user,
      };

      console.log('[QuoteForm] Validation data prepared:', validationData);

      // Check for suspicious activity
      console.log('[QuoteForm] Checking for suspicious activity...');
      if (detectSuspiciousActivity(validationData)) {
        console.log('[QuoteForm] ❌ Suspicious activity detected');
        logSecurityEvent('suspicious_form_submission', { 
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
        toast({
          title: "Sikkerhetsfeil",
          description: "Forespørselen inneholder ugyldig innhold.",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
      console.log('[QuoteForm] ✅ No suspicious activity detected');

      // Final validation with zod schema
      console.log('[QuoteForm] Performing Zod schema validation...');
      const validatedData = contactFormSchema.parse(validationData);
      console.log('[QuoteForm] ✅ Zod validation passed');

      // Save quote to database - Allow NULL user_id for anonymous submissions
      // Users can later register with the same email to claim their quotes
      console.log('[QuoteForm] Preparing to save quote to database...');
      const quoteData = {
        user_id: user?.id || null, // NULL for anonymous users, will be linked when they register
        type: formData.type!,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || null,
        org_number: formData.selectedCompany?.orgNumber || null,
        company_name: formData.selectedCompany?.name || null,
        description: formData.description,
        status: 'pending'
      };

      console.log('[QuoteForm] Quote data to insert:', quoteData);
      
      const { data: quoteRecord, error: dbError } = await supabase
        .from('quotes')
        .insert(quoteData)
        .select()
        .single();

      if (dbError) {
        console.error('[QuoteForm] ❌ Database error:', dbError);
        throw new Error('Failed to save quote');
      }

      console.log('[QuoteForm] ✅ Quote saved to database, ID:', quoteRecord.id);

      // Send e-post via Web3Forms
      console.log('[QuoteForm] Sending email via Web3Forms for quote:', quoteRecord.id);
      const web3FormData = new FormData();
      web3FormData.append('access_key', 'e73de942-c444-45b1-ba7a-1556f5862bfd');
      web3FormData.append('subject', `Nytt tilbud fra ${formData.name} (${formData.type})`);
      web3FormData.append('from_name', 'HandyHjelp Tilbudsskjema');
      web3FormData.append('Navn', formData.name);
      web3FormData.append('E-post', formData.email);
      web3FormData.append('Telefon', formData.phone);
      if (formData.address) {
        web3FormData.append('Adresse', formData.address);
      }
      if (formData.selectedCompany?.name) {
        web3FormData.append('Bedrift', formData.selectedCompany.name);
      }
      if (formData.selectedCompany?.orgNumber) {
        web3FormData.append('Org.nummer', formData.selectedCompany.orgNumber);
      }
      web3FormData.append('Beskrivelse', formData.description);
      web3FormData.append('Type', formData.type || 'private');

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: web3FormData
        });
        const result = await response.json();
        console.log('✅ E-post sendt via Web3Forms:', result);
      } catch (error) {
        console.error('⚠️ E-post feilet, men tilbud er lagret:', error);
      }

      console.log('[QuoteForm] ✅ Quote saved successfully');

      // Navigate to thank you page UANSETT
      navigate(`/takk?email=${encodeURIComponent(formData.email)}&type=${formData.type}`);

    } catch (error) {
      // CRITICAL: Always log errors for debugging
      console.error('❌ Form submission error:', error);
      console.error('❌ Full error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        errorObject: error
      });
      
      if (error instanceof z.ZodError) {
        const zodErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            zodErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(zodErrors);
        console.error('[QuoteForm] Zod validation error:', zodErrors);
      } else {
        console.error('[QuoteForm] ❌ Form submission error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Noe gikk galt. Prøv igjen senere.';
        toast({
          title: "Feil ved sending",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        });
      }
    } finally {
      // CRITICAL: Always reset isSubmitting, no matter what happens
      console.log('[QuoteForm] Finally block: Resetting isSubmitting to false');
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
          <Button variant="outline" onClick={handleBack}>
            Tilbake
          </Button>
        )}
        <div className="ml-auto">
          {step < 3 ? (
            <Button 
              onClick={handleNext} 
              disabled={!isStepValid()}
              className="bg-success hover:bg-success-hover text-success-foreground"
            >
              Neste <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
              className="bg-success hover:bg-success-hover text-success-foreground"
            >
              {isSubmitting ? "Sender..." : "Send forespørsel"}
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