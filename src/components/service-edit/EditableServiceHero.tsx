import { useState } from 'react';
import { Pencil, Wrench, Hammer, Droplets, CloudRain, LucideIcon } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

// Map of icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  wrench: Wrench,
  hammer: Hammer,
  droplets: Droplets,
  cloudrain: CloudRain,
};

interface EditableServiceHeroProps {
  section: string;
  iconName?: keyof typeof iconMap;
  defaultTitle: string;
  defaultSubtitle: string;
  defaultButtonText: string;
  showBadge?: boolean;
  badgeText?: string;
}

export const EditableServiceHero = ({
  section,
  iconName = 'wrench',
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

  const { content: title } = useEditableContent(section, 'title');
  const { content: subtitle } = useEditableContent(section, 'subtitle');
  const { content: buttonText } = useEditableContent(section, 'button_text');

  const IconComponent = iconMap[iconName] || Wrench;

  const displayData = {
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
            <div className="mb-6 flex justify-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <IconComponent className="h-12 w-12 md:h-16 md:w-16 text-white" strokeWidth={1.5} />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-heading font-bold mb-4 md:mb-6 text-white drop-shadow-lg">
              {displayData.title}
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8 drop-shadow-md max-w-2xl mx-auto">
              {displayData.subtitle}
            </p>
            <Button 
              variant="cta" 
              size="lg" 
              className="text-base md:text-lg px-6 md:px-8 py-5 md:py-6 min-h-[48px]"
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
