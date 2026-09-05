import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'post_login_redirect';

function readStashedPath(): string | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored && stored.startsWith('/') && !stored.startsWith('//')) {
      return stored;
    }
  } catch {}
  return null;
}

function clearStash() {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch {}
}

/**
 * Plukker opp en lagret etter-innlogging-destinasjon uansett hvilken side
 * brukeren lander på. Nødvendig fordi Google OAuth kan gjøre en full-side
 * redirect til roten, der /auth aldri monteres.
 */
export const PostLoginRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Dersom en innlogget bruker besøker /auth på nytt uten ?next=, må ikke en
    // gammel stash forårsake uventet navigering — rydd den bort.
    if (location.pathname === '/auth' && !location.search.includes('next=')) {
      clearStash();
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const maybeRedirect = (hasSession: boolean) => {
      if (!hasSession) return;
      const target = readStashedPath();
      if (target) {
        clearStash();
        navigate(target, { replace: true });
      }
    };

    // Umiddelbar sjekk (session kan allerede være hydrert)
    supabase.auth.getSession().then(({ data: { session } }) => {
      maybeRedirect(!!session);
    });

    // Lytt på innloggingshendelser (popup-flyt uten full reload)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          maybeRedirect(!!session);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
};
