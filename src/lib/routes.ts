// Allowlist over gyldige rute-prefikser. AppRouter i App.tsx sjekker denne
// FØR react-router — en rute som mangler her gir 404 selv om <Route> finnes.
// REGEL: Legger du til en ny <Route> i App.tsx, MÅ prefikset også inn her.
// (Lærdom: /anmeldelse manglet i denne lista og hele anmeldelsesfunnelen ga 404.)
export const KNOWN_ROUTE_PREFIXES = [
  '/', '/tilbud', '/fast-avtale', '/takk-avtale', '/faq', '/prosjekter', '/om-oss',
  '/kontakt', '/tjenester', '/blog', '/raad', '/takk', '/personvern', '/cookies',
  '/vilkaar', '/tilbakemelding', '/anmeldelse', '/auth', '/dashboard', '/owner', '/worker',
  '/.lovable/oauth/consent'
];

export function isKnownPath(pathname: string): boolean {
  return KNOWN_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );
}
