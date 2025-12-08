import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface EditableServiceHeroProps {
  section: string;
  defaultIcon: string;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultButtonText: string;
  showBadge?: boolean;
  badgeText?: string;
}

export const EditableServiceHero = ({
  section,
  defaultIcon,
  defaultTitle,
  defaultSubtitle,
  defaultButtonText,
  showBadge = false,
  badgeText = 'Populær'
}: EditableServiceHeroProps) => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { content: icon } = useEditableContent(section, 'icon');
  const { content: title } = useEditableContent(section, 'title');
  const { content: subtitle } = useEditableContent(section, 'subtitle');
  const { content: buttonText } = useEditableContent(section, 'button_text');

  const displayData = {
    icon: icon || defaultIcon,
    title: title || defaultTitle,
    subtitle: subtitle || defaultSubtitle,
    buttonText: buttonText || defaultButtonText,
  };

  const [formData, setFormData] = useState(displayData);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates = [
        { content_key: 'icon', content_value: formData.icon },
        { content_key: 'title', content_value: formData.title },
        { content_key: 'subtitle', content_value: formData.subtitle },
        { content_key: 'button_text', content_value: formData.buttonText },
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert({
            section,
            content_key: update.content_key,
            content_value: update.content_value,
            content_type: 'text',
            updated_by: user.id
          }, {
            onConflict: 'section,content_key'
          });
        
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['site-content', section] });
      toast.success('Lagret!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Kunne ikke lagre endringene');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="h-[500px] flex items-center justify-center relative">
        {isAdmin && editMode && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-4 right-4 z-10 bg-background rounded-full p-2 shadow-lg border-2 border-primary hover:scale-110 transition-transform"
          >
            <Pencil className="h-5 w-5 text-primary" />
          </button>
        )}
        
        {showBadge && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
            <span className="bg-accent text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              {badgeText}
            </span>
          </div>
        )}
        
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="text-6xl mb-6">{displayData.icon}</div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-white drop-shadow-lg">
              {displayData.title}
            </h1>
            <p className="text-xl text-white/90 mb-8 drop-shadow-md">
              {displayData.subtitle}
            </p>
            <Button 
              variant="cta" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => window.location.href = '/tilbud'}
            >
              {displayData.buttonText}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rediger Hero-seksjon</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Ikon (emoji)</Label>
              <Input
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                maxLength={10}
              />
            </div>
            <div>
              <Label>Tittel</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                maxLength={100}
              />
            </div>
            <div>
              <Label>Undertittel</Label>
              <Input
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                maxLength={200}
              />
            </div>
            <div>
              <Label>Knapp-tekst</Label>
              <Input
                value={formData.buttonText}
                onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                maxLength={50}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
              Avbryt
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Lagrer...' : 'Lagre'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
