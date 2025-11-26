import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useHeroImage = (page: string, defaultImage: string) => {
  const [heroImage, setHeroImage] = useState(defaultImage);
  const [loading, setLoading] = useState(true);

  const fetchHeroImage = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('image_url')
        .eq('page', page)
        .maybeSingle();

      if (error) throw error;

      if (data?.image_url) {
        setHeroImage(data.image_url);
      }
    } catch (error) {
      console.error('Error fetching hero image:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroImage();
  }, [page]);

  return { heroImage, loading, refetch: fetchHeroImage };
};
