import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useHeroImage = (page: string, defaultImage: string) => {
  // Start with the bundled default image immediately so the hero paints on
  // first render (preloaded by index.html). Override later only if the
  // database has a custom image for this page.
  const [heroImage, setHeroImage] = useState<string>(defaultImage);
  const [opacity, setOpacity] = useState(0.85);
  const [loading, setLoading] = useState(false);

  const fetchHeroImage = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('image_url, opacity')
        .eq('page', page)
        .maybeSingle();

      if (error) throw error;

      if (data?.image_url) setHeroImage(data.image_url);
      if (data?.opacity !== undefined && data?.opacity !== null) setOpacity(data.opacity);
    } catch (error) {
      console.error('Error fetching hero image:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroImage();
  }, [page]);

  return { heroImage, opacity, loading, refetch: fetchHeroImage };
};
