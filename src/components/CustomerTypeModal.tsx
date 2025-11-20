import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Home, Building2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CompanySearch } from "./CompanySearch";

interface CustomerTypeModalProps {
  isOpen: boolean;
  userId: string;
  onComplete: () => void;
}

interface Company {
  orgNumber: string;
  name: string;
  organizationForm: string;
  address: string;
  postalCode: string;
  city: string;
}

export const CustomerTypeModal = ({ isOpen, userId, onComplete }: CustomerTypeModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<'private' | 'business' | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleTypeSelect = (type: 'private' | 'business') => {
    setSelectedType(type);
    if (type === 'business') {
      setStep(2);
    } else {
      // Private customers can continue directly
      handleSave(type, null, null);
    }
  };

  const handleSave = async (
    type: 'private' | 'business',
    company: Company | null,
    companyName: string | null
  ) => {
    setIsUpdating(true);
    try {
      const updateData: any = {
        customer_type: type,
      };

      if (type === 'business' && company) {
        updateData.org_number = company.orgNumber;
        updateData.company_name = company.name;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Profil oppdatert",
        description: `Du er nå registrert som ${type === 'private' ? 'privatkunde' : 'bedriftskunde'}`,
      });
      
      onComplete();
    } catch (error) {
      console.error('Error updating customer type:', error);
      toast({
        title: "Feil",
        description: "Kunne ikke oppdatere kundetype. Prøv igjen.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompanySave = () => {
    if (selectedCompany) {
      handleSave('business', selectedCompany, selectedCompany.name);
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Velkommen tilbake!' : 'Finn din bedrift'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? 'For å gi deg best mulig service, trenger vi å vite om du er privat- eller bedriftskunde.'
              : 'Søk etter din bedrift i Brønnøysundregistrene'
            }
          </DialogDescription>
        </DialogHeader>
        
        {step === 1 ? (
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button
              variant={selectedType === "private" ? "default" : "outline"}
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleTypeSelect('private')}
              disabled={isUpdating}
            >
              <Home className="h-8 w-8" />
              <span>Privat</span>
            </Button>
            <Button
              variant={selectedType === "business" ? "default" : "outline"}
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleTypeSelect('business')}
              disabled={isUpdating}
            >
              <Building2 className="h-8 w-8" />
              <span>Bedrift</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <CompanySearch
              onCompanySelect={setSelectedCompany}
              selectedCompany={selectedCompany}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                disabled={isUpdating}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Tilbake
              </Button>
              <Button 
                onClick={handleCompanySave} 
                disabled={!selectedCompany || isUpdating}
                className="flex-1"
              >
                {isUpdating ? "Lagrer..." : "Fortsett"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
