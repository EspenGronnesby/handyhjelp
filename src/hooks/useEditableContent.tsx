import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useEditableContent = (section: string, contentKey: string) => {
  const [content, setContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('content_value')
          .eq('section', section)
          .eq('content_key', contentKey)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setContent(data.content_value);
        }
      } catch (error) {
        console.log('No content found, using default');
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [section, contentKey]);

  const updateContent = async (newValue: string) => {
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

      setContent(newValue);
      
      toast({
        title: "✅ Lagret",
        description: "Endringen er lagret",
      });

      return true;
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "❌ Feil ved lagring",
        description: "Prøv igjen",
        variant: "destructive"
      });
      return false;
    }
  };

  return { content, updateContent, isLoading };
};
