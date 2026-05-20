import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Phone, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface QuickCallbackFormProps {
  className?: string;
}

const SERVICE_OPTIONS = [
  { value: "vaktmester", label: "Vaktmestertjenester" },
  { value: "tomrer", label: "Tømrerarbeid" },
  { value: "blikk", label: "Blikkenslagerarbeid" },
  { value: "takrennerens", label: "Takrennerens" },
  { value: "annet", label: "Annet / vet ikke" },
];

// Kort lead-capture-skjema for hero (Mr. Handyman-mønster: "Let Us Call You").
// 4 felt — navn, telefon, e-post, tjeneste — sender til samme quotes-tabell
// som lange QuoteForm. For detaljerte forespørsler bruker brukerne /tilbud.
export const QuickCallbackForm = ({ className }: QuickCallbackFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceType, setServiceType] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Navn er påkrevd";
    if (!phone.trim()) newErrors.phone = "Telefon er påkrevd";
    else if (!/^\d{8}$/.test(phone.replace(/\s/g, ""))) {
      newErrors.phone = "8 sifre påkrevd";
    }
    if (!email.trim()) newErrors.email = "E-post er påkrevd";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Ugyldig e-post";
    }
    if (!serviceType) newErrors.serviceType = "Velg tjeneste";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const serviceLabel = SERVICE_OPTIONS.find((o) => o.value === serviceType)?.label || serviceType;
      const { error } = await supabase.from("quotes").insert({
        type: "private",
        name: name.trim(),
        email: email.trim(),
        phone: phone.replace(/\s/g, ""),
        address: "",
        company_name: null,
        org_number: null,
        description: `Rask forespørsel via forside — ${serviceLabel}`,
        status: "pending",
        user_id: null,
      });

      if (error) {
        console.error("Quick callback insert failed", error);
        toast({
          title: "Noe gikk galt",
          description: "Prøv igjen eller ring oss direkte.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Takk! Vi ringer deg snart.",
        description: "Vi tar kontakt innen 1-3 virkedager.",
      });
      navigate("/takk");
    } catch (err) {
      console.error("Quick callback unexpected error", err);
      toast({
        title: "Noe gikk galt",
        description: "Prøv igjen eller ring oss direkte.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "glass-card p-5 md:p-6 max-w-md mx-auto",
        "border border-border/60",
        className
      )}
    >
      <div className="mb-4 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-white font-heading drop-shadow">
          La oss ringe deg
        </h2>
        <p className="text-sm text-white/80 mt-1 drop-shadow">
          Få gratis tilbud innen 1-3 virkedager
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <Label htmlFor="qcf-name" className="sr-only">
            Navn
          </Label>
          <Input
            id="qcf-name"
            type="text"
            placeholder="Ditt navn"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!errors.name}
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-xs text-destructive mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="qcf-phone" className="sr-only">
            Telefon
          </Label>
          <Input
            id="qcf-phone"
            type="tel"
            placeholder="Telefon (8 sifre)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            aria-invalid={!!errors.phone}
            className={errors.phone ? "border-destructive" : ""}
          />
          {errors.phone && (
            <p className="text-xs text-destructive mt-1">{errors.phone}</p>
          )}
        </div>

        <div>
          <Label htmlFor="qcf-email" className="sr-only">
            E-post
          </Label>
          <Input
            id="qcf-email"
            type="email"
            placeholder="E-post"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && (
            <p className="text-xs text-destructive mt-1">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="qcf-service" className="sr-only">
            Hva trenger du hjelp med?
          </Label>
          <Select value={serviceType} onValueChange={setServiceType}>
            <SelectTrigger
              id="qcf-service"
              aria-invalid={!!errors.serviceType}
              className={errors.serviceType ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Hva trenger du hjelp med?" />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.serviceType && (
            <p className="text-xs text-destructive mt-1">{errors.serviceType}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        variant="cta"
        size="lg"
        disabled={isSubmitting}
        className="w-full mt-5 group/btn"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Sender...
          </>
        ) : (
          <>
            Be om gratis tilbud
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </>
        )}
      </Button>

      <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between gap-3 text-xs text-muted-foreground">
        <a
          href="tel:+4741250553"
          className="inline-flex items-center gap-1.5 hover:text-primary transition-colors font-medium"
        >
          <Phone className="h-3.5 w-3.5" />
          Ring oss
        </a>
        <Link to="/tilbud" className="hover:text-primary transition-colors">
          Detaljert tilbud →
        </Link>
      </div>
    </form>
  );
};
