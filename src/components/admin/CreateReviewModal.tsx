import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Loader2 } from "lucide-react";
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
  const [source, setSource] = useState<"website" | "google" | "manual">("google");
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
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Google-anmeldelse
                  </div>
                </SelectItem>
                <SelectItem value="website">Fra nettsiden</SelectItem>
                <SelectItem value="manual">Manuell</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {source === "google" && "Kopier en anmeldelse fra Google Maps"}
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
