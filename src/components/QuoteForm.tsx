import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChevronRight, Home, Building2, User, Phone, Mail, AlertCircle, Building } from "lucide-react";
import { CompanySearch } from "./CompanySearch";
import { contactFormSchema, type ContactFormData, sanitizeInput } from "@/lib/validation";
import { formRateLimiter, detectSuspiciousActivity, logSecurityEvent } from "@/lib/security";
import { z } from "zod";

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
  orgNumber: string;
  companyName: string;
  selectedCompany: Company | null;
  description: string;
}

export const QuoteForm = () => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    type: null,
    name: "",
    email: "",
    phone: "",
    orgNumber: "",
    companyName: "",
    selectedCompany: null,
    description: ""
  });

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

        // Organization number and company validation for business customers
        if (formData.type === 'business') {
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
    if (!validateCurrentStep()) return;
    
    setIsSubmitting(true);

    try {
      // Rate limiting check
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

      // Security validation
      const validationData: ContactFormData = {
        type: formData.type!,
        name: sanitizeInput(formData.name),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        orgNumber: formData.selectedCompany?.orgNumber,
        description: sanitizeInput(formData.description)
      };

      // Check for suspicious activity
      if (detectSuspiciousActivity(validationData)) {
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

      // Final validation with zod schema
      const validatedData = contactFormSchema.parse(validationData);

      // Send email notification
      const emailResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-quote-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: formData.type,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          orgNumber: formData.selectedCompany?.orgNumber,
          companyName: formData.selectedCompany?.name,
          description: formData.description
        }),
      });

      const emailResult = await emailResponse.json();

      if (!emailResult.success) {
        throw new Error(emailResult.error || 'Email sending failed');
      }

      toast({
        title: "Takk for henvendelsen!",
        description: "Vi kontakter deg innen 2 timer i åpningstiden med et uforpliktende tilbud.",
        duration: 5000,
      });

      // Reset form
      setStep(1);
      setFormData({
        type: null,
        name: "",
        email: "",
        phone: "",
        orgNumber: "",
        companyName: "",
        selectedCompany: null,
        description: ""
      });
      setErrors({});

    } catch (error) {
      if (error instanceof z.ZodError) {
        const zodErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            zodErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(zodErrors);
      } else {
        console.error('Form submission error:', error);
        toast({
          title: "Feil ved sending",
          description: "Noe gikk galt. Prøv igjen senere.",
          variant: "destructive",
          duration: 5000,
        });
      }
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
        console.log('Step 2 validation:', { basicFieldsValid, companyValid, selectedCompany: formData.selectedCompany, type: formData.type });
        return basicFieldsValid && companyValid;
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
        <div className="text-sm text-muted-foreground">
          {step}/3: {step === 1 && "Kunde"}
          {step === 2 && "Kontaktinfo"}
          {step === 3 && "Beskrivelse"}
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4 animate-fade-in-up">
          <Label className="text-base font-medium">Privat eller bedrift?</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={formData.type === "private" ? "default" : "outline"}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleInputChange('type', 'private')}
            >
              <Home className="h-6 w-6" />
              <span>Privat</span>
            </Button>
            <Button
              variant={formData.type === "business" ? "default" : "outline"}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleInputChange('type', 'business')}
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
            {formData.type === 'business' && (
              <div className="space-y-4">
                <CompanySearch
                  onCompanySelect={(company) => {
                    console.log('Company selected:', company);
                    handleInputChange('selectedCompany', company);
                    if (company) {
                      handleInputChange('orgNumber', company.orgNumber);
                      handleInputChange('companyName', company.name);
                    } else {
                      handleInputChange('orgNumber', '');
                      handleInputChange('companyName', '');
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
          <Label className="text-base font-medium">Beskriv oppdraget</Label>
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
        {step > 1 && (
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

      {/* Privacy Note - Clean and minimal */}
      <p className="text-xs text-hero-text-muted/80 mt-6 text-center max-w-md mx-auto leading-relaxed">
        Vi svarer som regel innen 2 timer i åpningstiden. Dine opplysninger behandles trygt og deles aldri med tredjeparter.
      </p>
    </Card>
  );
};