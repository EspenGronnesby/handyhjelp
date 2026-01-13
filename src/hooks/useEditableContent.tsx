import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEditableContent = (section: string, contentKey: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['site-content', section, contentKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('content_value')
        .eq('section', section)
        .eq('content_key', contentKey)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // Return both the value and whether the row exists in DB
      return {
        value: data?.content_value ?? '',
        hasBeenEdited: data !== null
      };
    },
    staleTime: 1000 * 60 * 5, // Cache i 5 minutter
  });

  const content = data?.value ?? '';
  const hasBeenEdited = data?.hasBeenEdited ?? false;

  const updateContent = async (newValue: string) => {
    // Optimistic update
    queryClient.setQueryData(
      ['site-content', section, contentKey],
      newValue
    );

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('site_content')
        .upsert({
          section,
          content_key: contentKey,
          content_value: newValue,
          content_type: 'text',
          updated_by: user.id
        }, {
          onConflict: 'section,content_key'
        });

      if (error) throw error;

      // Invalider queries for å sikre synkronisering
      queryClient.invalidateQueries({ 
        queryKey: ['site-content', section] 
      });
      
      toast({
        title: "✅ Lagret",
        description: "Endringen er lagret",
      });

      return true;
    } catch (error) {
      // Revert optimistic update ved feil
      queryClient.invalidateQueries({ 
        queryKey: ['site-content', section, contentKey] 
      });

      console.error('Update error:', error);
      toast({
        title: "❌ Feil ved lagring",
        description: "Prøv igjen",
        variant: "destructive"
      });
      return false;
    }
  };

  return { content, hasBeenEdited, updateContent, isLoading };
};
