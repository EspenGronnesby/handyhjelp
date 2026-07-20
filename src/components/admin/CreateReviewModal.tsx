import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Loader2 } from "lucide-react";
import { GoogleIcon, FacebookIcon } from "@/components/icons/brand-icons";
import { CompanySearch } from "@/components/CompanySearch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Company {
  orgNumber: string;
  name: string;
  organizationForm: string;
  address: string;
  postalCode: string;
  city: string;
}

interface CreateReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReviewCreated: () => void;
}

const CreateReviewModal = ({ open, onOpenChange, onReviewCreated }: CreateReviewModalProps) => {
  const [loading, setLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [source, setSource] = useState<"website" | "google" | "facebook" | "manual">("google");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isVerifiedCustomer, setIsVerifiedCustomer] = useState(true);
  const [hoverRating, setHoverRating] = useState(0);

  const resetForm = () => {
    setCustomerName("");
    setCustomerEmail("");
    setRating(5);
    setComment("");
    setSource("google");
    setSelectedCompany(null);
    setIsVerifiedCustomer(true);
    setHoverRating(0);
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast({
        title: "Mangler kundenavn",
        description: "Vennligst fyll inn kundenavn",
        variant: "destructive",
      });
      return;
    }

    if (!comment.trim()) {
      toast({
        title: "Mangler kommentar",
        description: "Vennligst fyll inn anmeldelsestekst",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim() || null,
        rating,
        comment: comment.trim(),
        source,
        company_name: selectedCompany?.name || null,
        org_number: selectedCompany?.orgNumber || null,
        is_verified_customer: isVerifiedCustomer,
        status: "approved", // Admin-created reviews are auto-approved
        feedback_type: "manual",
      });

      if (error) throw error;

      toast({
        title: "Anmeldelse opprettet",
        description: "Anmeldelsen er nå synlig på nettsiden",
      });

      resetForm();
      onOpenChange(false);
      onReviewCreated();
    } catch (error) {
      console.error("Error creating review:", error);
      toast({
        title: "Feil ved opprettelse",
        description: "Kunne ikke opprette anmeldelsen",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Legg til ny anmeldelse</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Source selection */}
          <div className="space-y-2">
            <Label>Kilde</Label>
            <Select value={source} onValueChange={(v) => setSource(v as typeof source)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">
                  <div className="flex items-center gap-2">
                    <GoogleIcon className="h-4 w-4" />
                    Google-anmeldelse
                  </div>
                </SelectItem>
                <SelectItem value="facebook">
                  <div className="flex items-center gap-2">
                    <FacebookIcon className="h-4 w-4" />
                    Facebook-anmeldelse
                  </div>
                </SelectItem>
                <SelectItem value="website">Fra nettsiden</SelectItem>
                <SelectItem value="manual">Manuell</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {source === "google" && "Kopier en anmeldelse fra Google Maps"}
              {source === "facebook" && "Kopier en anmeldelse fra Facebook-siden"}
              {source === "website" && "Anmeldelse mottatt via nettsiden"}
              {source === "manual" && "Anmeldelse fra annen kilde"}
            </p>
          </div>

          {/* Customer name */}
          <div className="space-y-2">
            <Label htmlFor="customerName">Kundenavn *</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ola Nordmann"
            />
          </div>

          {/* Customer email (optional) */}
          <div className="space-y-2">
            <Label htmlFor="customerEmail">E-post (valgfritt)</Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="kunde@eksempel.no"
            />
            <p className="text-xs text-muted-foreground">
              For intern referanse - vises ikke på nettsiden
            </p>
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <Label>Vurdering *</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      "h-8 w-8 transition-colors",
                      star <= (hoverRating || rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-muted-foreground/30"
                    )}
                  />
                </button>
              ))}
              <span className="ml-2 self-center text-lg font-medium">{rating}/5</span>
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Anmeldelse *</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Skriv inn kundens anmeldelse..."
              rows={4}
            />
          </div>

          {/* Company search */}
          <div className="space-y-2">
            <Label>Bedrift (valgfritt)</Label>
            <CompanySearch
              onCompanySelect={setSelectedCompany}
              selectedCompany={selectedCompany}
            />
            <p className="text-xs text-muted-foreground">
              Søk opp bedriften for å vise verifisert bedriftsnavn
            </p>
          </div>

          {/* Verified customer checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="verifiedCustomer"
              checked={isVerifiedCustomer}
              onCheckedChange={(checked) => setIsVerifiedCustomer(checked === true)}
            />
            <Label htmlFor="verifiedCustomer" className="cursor-pointer">
              Verifisert kunde (vi har utført jobb for denne kunden)
            </Label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Lagrer...
              </>
            ) : (
              "Opprett anmeldelse"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Avbryt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReviewModal;
