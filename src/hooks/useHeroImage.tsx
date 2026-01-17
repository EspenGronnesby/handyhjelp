import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useHeroImage = (page: string, defaultImage: string) => {
  // Start med null - ikke vis noe før vi vet svaret fra databasen
  const [heroImage, setHeroImage] = useState<string | null>(null);
  const [opacity, setOpacity] = useState(0.85);
  const [loading, setLoading] = useState(true);

  const fetchHeroImage = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('image_url, opacity')
        .eq('page', page)
        .maybeSingle();

      if (error) throw error;

      // Bruk databasebildet eller fall tilbake til default
      setHeroImage(data?.image_url || defaultImage);
      setOpacity(data?.opacity ?? 0.85);
    } catch (error) {
      console.error('Error fetching hero image:', error);
      setHeroImage(defaultImage); // Fallback ved feil
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroImage();
  }, [page]);

  return { heroImage, opacity, loading, refetch: fetchHeroImage };
};
