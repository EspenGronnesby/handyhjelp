import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSiteContent } from '@/hooks/useSiteContent';

/**
 * Reads a single editable text from the shared site_content cache (one query
 * for the whole site instead of one per field). Falls back to '' until the
 * cache loads.
 */
export const useEditableContent = (section: string, contentKey: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: contentMap, isLoading } = useSiteContent();

  const key = `${section}::${contentKey}`;
  const content = contentMap?.get(key) ?? '';
  const hasBeenEdited = contentMap?.has(key) ?? false;

  const updateContent = async (newValue: string) => {
    // Optimistic update on the shared map
    queryClient.setQueryData<Map<string, string>>(['site-content-all'], (prev) => {
      const next = new Map(prev ?? []);
      next.set(key, newValue);
      return next;
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('site_content')
        .upsert({
          section,
          content_key: contentKey,
          content_value: newValue,
          content_type: 'text',
          updated_by: user.id,
        }, { onConflict: 'section,content_key' });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['site-content-all'] });
      toast({ title: '✅ Lagret', description: 'Endringen er lagret' });
      return true;
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ['site-content-all'] });
      console.error('Update error:', error);
      toast({
        title: '❌ Feil ved lagring',
        description: 'Prøv igjen',
        variant: 'destructive',
      });
      return false;
    }
  };

  return { content, hasBeenEdited, updateContent, isLoading };
};
