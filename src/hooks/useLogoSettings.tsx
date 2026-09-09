import { useEffect } from 'react';
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
  mobileHorizontalPadding: number;
  tabletHorizontalPadding: number;
  desktopHorizontalPadding: number;
  desktopMarginLeft: number;
}

/**
 * Brukes ved aller første besøk, før databasen har svart og før localStorage
 * har noe bufret. Verdiene er et øyeblikksbilde av det som faktisk lå i
 * `site_content` 2026-09-09, slik at første maling treffer riktig i praksis
 * og logoen ikke hopper i størrelse.
 *
 * Endrer du logostørrelsen i admin, vil førstegangsbesøkende se én liten
 * justering til de nye verdiene er bufret. Oppdater gjerne tallene her da.
 */
const defaultSettings: LogoSettings = {
  mobileHeight: 72,
  tabletHeight: 100,
  desktopHeight: 80,
  mobilePadding: 6,
  tabletPadding: 16,
  desktopPadding: 0,
  mobileHorizontalPadding: 6,
  tabletHorizontalPadding: 16,
  desktopHorizontalPadding: 0,
  desktopMarginLeft: 32,
};

const LAGRINGSNOKKEL = 'hh-logo-settings';

/**
 * Logostørrelsen kommer fra databasen. Uten buffer tegnes logoen først med
 * standardverdiene (64px desktop) og hopper så til DB-verdien (80px) når
 * spørringen lander — et synlig blink ved hver lasting.
 *
 * Vi husker siste kjente verdi lokalt og bruker den som initialData, slik at
 * første maling blir riktig. `initialDataUpdatedAt: 0` gjør at React Query
 * likevel henter friske verdier i bakgrunnen med én gang.
 */
const lesBufret = (): LogoSettings | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    const raa = window.localStorage.getItem(LAGRINGSNOKKEL);
    if (!raa) return undefined;
    const p = JSON.parse(raa);
    // Grov validering — en ødelagt verdi skal ikke velte headeren.
    return typeof p?.desktopHeight === 'number' && typeof p?.mobileHeight === 'number'
      ? (p as LogoSettings)
      : undefined;
  } catch {
    return undefined;
  }
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
    // Male riktig med én gang, men fortsatt hente ferske verdier i bakgrunnen.
    initialData: lesBufret,
    initialDataUpdatedAt: 0,
  });

  // Husk til neste lasting.
  useEffect(() => {
    try {
      window.localStorage.setItem(LAGRINGSNOKKEL, JSON.stringify(settings));
    } catch {
      /* private vinduer o.l. — buffer er en bonus, ikke et krav */
    }
  }, [settings]);

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
