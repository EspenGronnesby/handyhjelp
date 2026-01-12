import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface LogoSettings {
  mobileHeight: number;
  tabletHeight: number;
  desktopHeight: number;
  mobilePadding: number;
  tabletPadding: number;
  desktopPadding: number;
}

const defaultSettings: LogoSettings = {
  mobileHeight: 40,
  tabletHeight: 48,
  desktopHeight: 64,
  mobilePadding: 12,
  tabletPadding: 16,
  desktopPadding: 16,
};

export const useLogoSettings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: settings = defaultSettings, isLoading } = useQuery({
    queryKey: ['site-content', 'header', 'logo-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('content_value')
        .eq('section', 'header')
        .eq('content_key', 'logo-settings')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.content_value) {
        try {
          return JSON.parse(data.content_value) as LogoSettings;
        } catch {
          return defaultSettings;
        }
      }

      return defaultSettings;
    },
    staleTime: 1000 * 60 * 5,
  });

  const updateSettings = async (newSettings: LogoSettings) => {
    queryClient.setQueryData(
      ['site-content', 'header', 'logo-settings'],
      newSettings
    );

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('site_content')
        .upsert({
          section: 'header',
          content_key: 'logo-settings',
          content_value: JSON.stringify(newSettings),
          content_type: 'json',
          updated_by: user.id
        }, {
          onConflict: 'section,content_key'
        });

      if (error) throw error;

      queryClient.invalidateQueries({
        queryKey: ['site-content', 'header']
      });

      toast({
        title: "✅ Lagret",
        description: "Logo-innstillinger er oppdatert",
      });

      return true;
    } catch (error) {
      queryClient.invalidateQueries({
        queryKey: ['site-content', 'header', 'logo-settings']
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

  return { settings, updateSettings, isLoading, defaultSettings };
};
