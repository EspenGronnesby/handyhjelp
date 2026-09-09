import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface HeroBuffer {
  image_url: string;
  opacity: number;
}

const nokkel = (page: string) => `hh-hero-${page}`;

/**
 * Hero-bildet ligger i databasen. Uten buffer skjedde dette ved hver lasting:
 *
 *   1. Det innebygde bildet males (154 kB lastes ned)
 *   2. Spørringen lander, `src` byttes til DB-bildet
 *   3. Heroen står TOM til det nye bildet er lastet (~400 ms)
 *   4. DB-bildet males — det innebygde er kastet bort
 *
 * Vi husker URL-en lokalt, slik at riktig bilde males med én gang og bare ETT
 * bilde lastes ned. Ved aller første besøk forhåndslastes det nye bildet i
 * minnet før `src` byttes, så hullet i steg 3 aldri oppstår.
 */
const lesBuffer = (page: string): HeroBuffer | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raa = window.localStorage.getItem(nokkel(page));
    if (!raa) return null;
    const p = JSON.parse(raa);
    return typeof p?.image_url === 'string' && p.image_url
      ? { image_url: p.image_url, opacity: typeof p.opacity === 'number' ? p.opacity : 0.85 }
      : null;
  } catch {
    return null;
  }
};

export const useHeroImage = (page: string, defaultImage: string) => {
  const bufret = lesBuffer(page);
  const [heroImage, setHeroImage] = useState<string>(bufret?.image_url ?? defaultImage);
  const [opacity, setOpacity] = useState(bufret?.opacity ?? 0.85);
  const [loading, setLoading] = useState(false);

  const fetchHeroImage = async () => {
    try {
      const { data, error } = await supabase
        .from('hero_images')
        .select('image_url, opacity')
        .eq('page', page)
        .maybeSingle();

      if (error) throw error;

      const nyOpacity =
        data?.opacity !== undefined && data?.opacity !== null ? data.opacity : 0.85;
      setOpacity(nyOpacity);

      if (data?.image_url) {
        try {
          window.localStorage.setItem(
            nokkel(page),
            JSON.stringify({ image_url: data.image_url, opacity: nyOpacity })
          );
        } catch {
          /* private vinduer o.l. — buffer er en bonus, ikke et krav */
        }

        // Bytt først når det nye bildet faktisk er dekodet, ellers står
        // heroen tom mens det lastes.
        setHeroImage((naavaerende) => {
          if (naavaerende === data.image_url) return naavaerende;
          const forhaandslast = new Image();
          forhaandslast.onload = () => setHeroImage(data.image_url);
          forhaandslast.onerror = () => {
            // Bufret/lagret URL svarer ikke — fall tilbake til det innebygde.
            try {
              window.localStorage.removeItem(nokkel(page));
            } catch { /* ignorer */ }
            setHeroImage(defaultImage);
          };
          forhaandslast.src = data.image_url;
          return naavaerende;
        });
      }
    } catch (error) {
      console.error('Error fetching hero image:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return { heroImage, opacity, loading, refetch: fetchHeroImage };
};
