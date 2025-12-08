import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { serviceAgreementSchema, type ServiceAgreementFormData } from "@/lib/validations/serviceAgreementSchema";
import { useMultiStepForm } from "@/hooks/useMultiStepForm";
import { useFormSubmit } from "@/hooks/useFormSubmit";
import { useWeb3Forms } from "@/hooks/useWeb3Forms";
import { FormProgress } from "@/components/ui/form-progress";

const serviceOptions = [
  { id: "maintenance", label: "Generelt vedlikehold og småreperasjoner" },
  { id: "cleaning", label: "Utvendig renhold (søppel, fellesarealer)" },
  { id: "winter", label: "Snømåking og strøing (vinter)" },
  { id: "summer", label: "Gressklipping og hagearbeid (sommer)" },
  { id: "inspection", label: "Tilsyn og inspeksjoner" },
  { id: "other", label: "Annet" },
];

const TOTAL_STEPS = 7;

export const ServiceAgreementForm = () => {
  const navigate = useNavigate();
  const { submitToWeb3Forms, sendAgreementConfirmation } = useWeb3Forms();

  const form = useForm<ServiceAgreementFormData>({
    resolver: zodResolver(serviceAgreementSchema),
    defaultValues: {
      customerType: "borettslag",
      services: [],
      fixedContactPerson: false,
    },
  });

  const { step, next, back, progress, isFirstStep, isLastStep } = useMultiStepForm({
    totalSteps: TOTAL_STEPS,
  });

  const { submit, isSubmitting } = useFormSubmit({
    successMessage: "Forespørsel sendt!",
    successDescription: "Vi tar kontakt med deg snart.",
  });

  const selectedServices = form.watch("services");
  const customerType = form.watch("customerType");

  const onSubmit = async (data: ServiceAgreementFormData) => {
    await submit(async () => {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();

      // Save to database
      const { error: dbError } = await supabase.from("service_agreements").insert([
        {
          customer_type: data.customerType,
          address: data.address,
          services: data.services,
          other_services: data.otherServices,
          frequency: data.frequency,
          fixed_contact_person: data.fixedContactPerson,
          contract_duration: data.contractDuration,
          start_date: data.startDate ? data.startDate.toISOString().split('T')[0] : null,
          current_situation: data.currentSituation,
          contact_person: data.contactPerson,
          contact_role: data.contactRole,
          email: data.email,
          phone: data.phone,
          additional_info: data.additionalInfo,
          user_id: user?.id || null,
        }
      ] as any);

      if (dbError) throw dbError;

      // Send to Web3Forms
      await submitToWeb3Forms({
        subject: `Ny avtaleforespørsel fra ${data.contactPerson} - ${data.customerType}`,
        from_name: data.contactPerson,
        ...data,
        services: data.services.join(", "),
        startDate: data.startDate ? format(data.startDate, "dd.MM.yyyy") : "Ikke angitt",
      });

      // Send confirmation email (non-blocking)
      sendAgreementConfirmation({
        contactPerson: data.contactPerson,
        email: data.email,
      });

      navigate("/takk-avtale");
    });
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <FormField
            control={form.control}
            name="customerType"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-xl font-heading font-semibold">Hvem er dere?</FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-3">
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="borettslag" id="borettslag" />
                      <Label htmlFor="borettslag" className="cursor-pointer flex-1 font-medium">
                        Borettslag / Sameie
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="bedrift" id="bedrift" />
                      <Label htmlFor="bedrift" className="cursor-pointer flex-1 font-medium">
                        Bedrift
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="annet" id="annet" />
                      <Label htmlFor="annet" className="cursor-pointer flex-1 font-medium">
                        Annet
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold">Lokasjon</h2>
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse (gateadresse, postnummer og sted) *</FormLabel>
                  <FormControl>
                    <Input placeholder="F.eks. Storgata 1, 4612 Kristiansand" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold">Hvilke tjenester trenger dere?</h2>
            
            <FormField
              control={form.control}
              name="services"
              render={() => (
                <FormItem>
                  <div className="space-y-3">
                    {serviceOptions.map((service) => (
                      <FormField
                        key={service.id}
                        control={form.control}
                        name="services"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 border border-border rounded-lg p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(service.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, service.id])
                                    : field.onChange(field.value?.filter((value) => value !== service.id));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-medium cursor-pointer flex-1">
                              {service.label}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedServices?.includes("other") && (
              <FormField
                control={form.control}
                name="otherServices"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beskriv andre tjenester</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Beskriv hvilke andre tjenester dere trenger" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold">Frekvens og avtale</h2>

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hvor ofte trenger dere tilsyn? *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg frekvens" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daglig</SelectItem>
                      <SelectItem value="weekly">Ukentlig</SelectItem>
                      <SelectItem value="monthly">Månedlig</SelectItem>
                      <SelectItem value="on_demand">Ved behov</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fixedContactPerson"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>Ønsker dere fast kontaktperson?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value ? "yes" : "no"}
                      onValueChange={(val) => field.onChange(val === "yes")}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yes" id="contact-yes" />
                        <Label htmlFor="contact-yes">Ja</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="no" id="contact-no" />
                        <Label htmlFor="contact-no">Nei</Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ønsket avtalevarighet *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg varighet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1_month">1 måned</SelectItem>
                      <SelectItem value="6_months">6 måneder</SelectItem>
                      <SelectItem value="1_year">1 år</SelectItem>
                      <SelectItem value="other">Annet</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ønsket oppstartsdato</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "PPP", { locale: nb }) : "Velg dato"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 5:
        return (
          <FormField
            control={form.control}
            name="currentSituation"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel className="text-xl font-heading font-semibold">
                  Har dere serviceavtale i dag?
                </FormLabel>
                <FormControl>
                  <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-3">
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="switch" id="switch" />
                      <Label htmlFor="switch" className="cursor-pointer flex-1 font-medium">
                        Ja, men ønsker å bytte leverandør
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="extra" id="extra" />
                      <Label htmlFor="extra" className="cursor-pointer flex-1 font-medium">
                        Ja, men trenger ekstra hjelp
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer">
                      <RadioGroupItem value="new" id="new" />
                      <Label htmlFor="new" className="cursor-pointer flex-1 font-medium">
                        Nei, dette er nytt for oss
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold">Kontaktinformasjon</h2>

            <FormField
              control={form.control}
              name="contactPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kontaktperson *</FormLabel>
                  <FormControl>
                    <Input placeholder="Fullt navn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Din rolle *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Velg rolle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="styreleder">Styreleder</SelectItem>
                      <SelectItem value="daglig_leder">Daglig leder</SelectItem>
                      <SelectItem value="driftsleder">Driftsleder</SelectItem>
                      <SelectItem value="eier">Eier</SelectItem>
                      <SelectItem value="other">Annet</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-post *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="din@epost.no" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon *</FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="8 siffer" 
                      maxLength={8}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-heading font-semibold">Tilleggsinformasjon</h2>

            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Er det noe annet vi bør vite?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Spesielle ønsker, utfordringer eller andre detaljer som kan være nyttige for oss å vite"
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Enhanced progress indicator */}
      <FormProgress 
        currentStep={step} 
        totalSteps={TOTAL_STEPS}
        labels={[
          "Type",
          "Eiendom", 
          "Tjenester",
          "Frekvens",
          "Situasjon",
          "Kontakt",
          "Tillegg"
        ]}
        className="mb-8"
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {renderStep()}

          <div className="flex justify-between pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={back}
              disabled={isFirstStep || isSubmitting}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Tilbake
            </Button>

            {isLastStep ? (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sender...
                  </>
                ) : (
                  "Send forespørsel"
                )}
              </Button>
            ) : (
              <Button type="button" onClick={next}>
                Neste
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};
