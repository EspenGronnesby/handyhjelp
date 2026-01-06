import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface FooterEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentData: {
    description: string;
    address: string;
    phone: string;
    email: string;
    hours: string;
    facebookUrl: string;
    instagramUrl: string;
    linkedinUrl: string;
    copyright: string;
  };
}

export const FooterEditModal = ({
  isOpen,
  onClose,
  currentData
}: FooterEditModalProps) => {
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
        { section: 'footer', content_key: 'description', content_value: formData.description, content_type: 'text', updated_by: user.id },
        { section: 'footer', content_key: 'address', content_value: formData.address, content_type: 'text', updated_by: user.id },
        { section: 'footer', content_key: 'phone', content_value: formData.phone, content_type: 'text', updated_by: user.id },
        { section: 'footer', content_key: 'email', content_value: formData.email, content_type: 'text', updated_by: user.id },
        { section: 'footer', content_key: 'hours', content_value: formData.hours, content_type: 'text', updated_by: user.id },
        { section: 'footer', content_key: 'facebook_url', content_value: formData.facebookUrl, content_type: 'text', updated_by: user.id },
        { section: 'footer', content_key: 'instagram_url', content_value: formData.instagramUrl, content_type: 'text', updated_by: user.id },
        { section: 'footer', content_key: 'linkedin_url', content_value: formData.linkedinUrl, content_type: 'text', updated_by: user.id },
        { section: 'footer', content_key: 'copyright', content_value: formData.copyright, content_type: 'text', updated_by: user.id }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert(update, { onConflict: 'section,content_key' });
        
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['site-content', 'footer'] });

      toast({
        title: "✅ Lagret",
        description: "Footer oppdatert",
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
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rediger footer</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Beskrivelse</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              maxLength={300}
              rows={3}
              placeholder="Kort beskrivelse av bedriften..."
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Kontaktinformasjon</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  maxLength={100}
                  placeholder="By/sted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  maxLength={20}
                  placeholder="+47 12345678"
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
                  placeholder="Man-Fre 09:00-17:00"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Sosiale medier (lenker)</h4>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="facebookUrl">Facebook</Label>
                <Input
                  id="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                  maxLength={200}
                  placeholder="https://facebook.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagramUrl">Instagram</Label>
                <Input
                  id="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                  maxLength={200}
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">LinkedIn</Label>
                <Input
                  id="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  maxLength={200}
                  placeholder="https://linkedin.com/company/..."
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="copyright">Copyright-tekst</Label>
              <Input
                id="copyright"
                value={formData.copyright}
                onChange={(e) => setFormData({ ...formData, copyright: e.target.value })}
                maxLength={150}
                placeholder="© 2025 Bedriftsnavn. Alle rettigheter reservert."
              />
            </div>
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
