import { useState } from 'react';
import { CheckCircle2, Tag } from 'lucide-react';
import { useEditMode } from '@/contexts/EditModeContext';
import { useEditableContent } from '@/hooks/useEditableContent';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { EditButton } from '@/components/ui/EditButton';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useFadeInUp } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface EditableServicePricingProps {
  section: string;
  hasFixedPrice?: boolean;
  defaultPrice?: string;
  defaultPriceIncludes?: string[];
  defaultDescription?: string;
}

export const EditableServicePricing = ({
  section,
  hasFixedPrice = false,
  defaultPrice = '',
  defaultPriceIncludes = [],
  defaultDescription = 'Kontakt oss for et skreddersydd tilbud',
}: EditableServicePricingProps) => {
  const { editMode, isAdmin } = useEditMode();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const { content: price } = useEditableContent(section, 'price');
  const { content: description } = useEditableContent(section, 'price_description');
  const { content: inc1 } = useEditableContent(section, 'price_includes_1');
  const { content: inc2 } = useEditableContent(section, 'price_includes_2');
  const { content: inc3 } = useEditableContent(section, 'price_includes_3');
  const { content: inc4 } = useEditableContent(section, 'price_includes_4');

  const displayData = {
    price: price || defaultPrice,
    description: description || defaultDescription,
    includes: [
      inc1 || defaultPriceIncludes[0] || '',
      inc2 || defaultPriceIncludes[1] || '',
      inc3 || defaultPriceIncludes[2] || '',
      inc4 || defaultPriceIncludes[3] || '',
    ].filter(item => item.trim() !== ''),
  };

  const [formData, setFormData] = useState(displayData);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const updates = [
        { content_key: 'price', content_value: formData.price },
        { content_key: 'price_description', content_value: formData.description },
        ...formData.includes.map((item, index) => ({
          content_key: `price_includes_${index + 1}`,
          content_value: item
        }))
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

  const isFixedPrice = hasFixedPrice && displayData.price;
  const { ref, style } = useFadeInUp({ threshold: 0.15 });

  return (
    <>
      <div ref={ref} style={style} className="relative">
        {isAdmin && editMode && (
          <EditButton onClick={() => setIsModalOpen(true)} ariaLabel="Rediger" />
        )}

        <SectionHeading
          icon={Tag}
          gradient={
            isFixedPrice
              ? "from-amber-500 via-orange-500 to-rose-600"
              : "from-cyan-500 via-blue-500 to-indigo-600"
          }
          title="Priser"
        />

        {isFixedPrice ? (
          <div className={cn(
            "glass-card max-w-xl mx-auto p-6 md:p-8 text-center !border-success !border-2"
          )}>
            <p className="text-xs md:text-sm text-muted-foreground mb-1 uppercase tracking-wide">
              Fast pris for enebolig
            </p>
            <p className="text-4xl md:text-5xl font-bold text-success mb-2">
              {displayData.price}
            </p>
            <p className="text-sm text-muted-foreground mb-5">Ingen skjulte kostnader</p>

            {displayData.includes.length > 0 && (
              <ul className="space-y-2 text-left max-w-sm mx-auto mb-6">
                {displayData.includes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
                    <span className="text-sm md:text-base text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            )}

            <Button asChild variant="cta" size="lg">
              <Link to="/tilbud">Få tilbud</Link>
            </Button>
          </div>
        ) : (
          <div className="max-w-2xl">
            <p className="text-base md:text-lg text-foreground mb-2">{displayData.description}</p>
            <p className="text-sm md:text-base text-muted-foreground mb-5">
              Priser varierer basert på størrelse, kompleksitet og materialvalg. Vi lager alltid et tilbud som er tilpasset dine behov og budsjett.
            </p>
            <Button asChild variant="cta" size="lg">
              <Link to="/tilbud">Få tilbud</Link>
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Rediger Priser</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {hasFixedPrice && (
              <>
                <div>
                  <Label>Pris (eks: "3 390 kr" eller "Fra 500 kr")</Label>
                  <Input
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    maxLength={50}
                  />
                </div>
                <div>
                  <Label>Hva inkluderer prisen? (maks 4 punkter)</Label>
                  {[0, 1, 2, 3].map((index) => (
                    <Input
                      key={index}
                      className="mt-2"
                      placeholder={`Punkt ${index + 1}`}
                      value={formData.includes[index] || ''}
                      onChange={(e) => {
                        const newIncludes = [...formData.includes];
                        newIncludes[index] = e.target.value;
                        setFormData({ ...formData, includes: newIncludes });
                      }}
                      maxLength={100}
                    />
                  ))}
                </div>
              </>
            )}
            <div>
              <Label>Beskrivelse</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                maxLength={300}
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
