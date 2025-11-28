import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface FAQEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: string;
  currentData: {
    question: string;
    answer: string;
  };
}

export const FAQEditModal = ({
  isOpen,
  onClose,
  section,
  currentData
}: FAQEditModalProps) => {
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
        { section, content_key: 'question', content_value: formData.question, content_type: 'text', updated_by: user.id },
        { section, content_key: 'answer', content_value: formData.answer, content_type: 'text', updated_by: user.id }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('site_content')
          .upsert(update, { onConflict: 'section,content_key' });
        
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['site-content', section] });

      toast({
        title: "✅ Lagret",
        description: "FAQ oppdatert",
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
          <DialogTitle>Rediger FAQ</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="question">Spørsmål</Label>
            <Input
              id="question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              maxLength={200}
              placeholder="F.eks. Hva koster en vaktmestertjeneste?"
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.question.length} / 200 tegn
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Svar</Label>
            <Textarea
              id="answer"
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              maxLength={1000}
              rows={8}
              placeholder="Skriv et detaljert svar..."
            />
            <div className="text-sm text-muted-foreground text-right">
              {formData.answer.length} / 1000 tegn
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
