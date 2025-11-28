import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ContactInfoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: {
    address: string;
    phone: string;
    email: string;
    hours: string;
    responseTime: string;
  };
}

export const ContactInfoEditModal = ({
  isOpen,
  onClose,
  currentData
}: ContactInfoEditModalProps) => {
  const [formData, setFormData] = useState(currentData);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setFormData(currentData);
    }
  }, [isOpen, currentData]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const updates = [
        { section: 'kontakt-info', content_key: 'address', content_value: formData.address, content_type: 'text', updated_by: user.id },
        { section: 'kontakt-info', content_key: 'phone', content_value: formData.phone, content_type: 'text', updated_by: user.id },
        { section: 'kontakt-info', content_key: 'email', content_value: formData.email, content_type: 'text', updated_by: user.id },
        { section: 'kontakt-info', content_key: 'hours', content_value: formData.hours, content_type: 'text', updated_by: user.id },
        { section: 'kontakt-info', content_key: 'response_time', content_value: formData.responseTime, content_type: 'text', updated_by: user.id }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert(update, { onConflict: 'section,content_key' });
        
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['site-content', 'kontakt-info'] });

      toast({
        title: "✅ Lagret",
        description: "Kontaktinformasjon oppdatert",
      });

      onClose();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "❌ Feil ved lagring",
        description: "Prøv igjen",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rediger kontaktinformasjon</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hours">Åpningstider</Label>
            <Input
              id="hours"
              value={formData.hours}
              onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
              maxLength={100}
              placeholder="F.eks. Mandag - Fredag: 09:00 - 17:00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="responseTime">Responstid</Label>
            <Input
              id="responseTime"
              value={formData.responseTime}
              onChange={(e) => setFormData({ ...formData, responseTime: e.target.value })}
              maxLength={100}
              placeholder="F.eks. Responstid: 1-3 virkedager"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
          >
            Avbryt
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Lagrer...
              </>
            ) : (
              <>💾 Lagre</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
