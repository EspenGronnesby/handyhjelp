import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Home, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CustomerTypeModalProps {
  isOpen: boolean;
  userId: string;
  onComplete: () => void;
}

export const CustomerTypeModal = ({ isOpen, userId, onComplete }: CustomerTypeModalProps) => {
  const [selectedType, setSelectedType] = useState<'private' | 'business' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!selectedType) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ customer_type: selectedType })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: "Profil oppdatert",
        description: `Du er nå registrert som ${selectedType === 'private' ? 'privatkunde' : 'bedriftskunde'}`,
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

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Velkommen tilbake!</DialogTitle>
          <DialogDescription>
            For å gi deg best mulig service, trenger vi å vite om du er privat- eller bedriftskunde.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            variant={selectedType === "private" ? "default" : "outline"}
            className="h-24 flex flex-col items-center justify-center space-y-2"
            onClick={() => setSelectedType('private')}
          >
            <Home className="h-8 w-8" />
            <span>Privat</span>
          </Button>
          <Button
            variant={selectedType === "business" ? "default" : "outline"}
            className="h-24 flex flex-col items-center justify-center space-y-2"
            onClick={() => setSelectedType('business')}
          >
            <Building2 className="h-8 w-8" />
            <span>Bedrift</span>
          </Button>
        </div>
        
        <Button 
          onClick={handleSave} 
          disabled={!selectedType || isUpdating}
          className="w-full"
        >
          {isUpdating ? "Lagrer..." : "Fortsett"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
