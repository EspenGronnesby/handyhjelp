import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteContentRow {
  section: string;
  content_key: string;
  content_value: string | null;
}

/**
 * Fetches the entire site_content table in a single query and caches it.
 * Replaces dozens of individual queries (one per editable field) that were
 * happening on every page load.
 */
export const useSiteContent = () => {
  return useQuery({
    queryKey: ['site-content-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_content')
        .select('section, content_key, content_value');

      if (error) throw error;

      const map = new Map<string, string>();
      (data ?? []).forEach((row: SiteContentRow) => {
        map.set(`${row.section}::${row.content_key}`, row.content_value ?? '');
      });
      return map;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
};
