/**
 * Sentralisert SEO-konfigurasjon for HandyHjelp.no
 */

export const SEO_CONFIG = {
  domain: 'https://handyhjelp.no',
  siteName: 'HandyHjelp',
  locale: 'nb_NO',
  twitterCard: 'summary_large_image' as const,
  defaultImage: '/og-image.png',
  defaultRobots: 'index, follow',
};

export interface PageSEOData {
  path: string;
  title: string;
  description: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
}

/**
 * SEO-data for alle markedsforingssider
 */
export const PAGE_SEO_DATA: Record<string, PageSEOData> = {
  '/': {
    path: '/',
    title: 'HandyHjelp - Profesjonell Vaktmester, Tømrer & Blikk i Kristiansand',
    description: 'HandyHjelp tilbyr profesjonelle vaktmester-, tømrer- og blikkenslagertjenester i Kristiansand. Få gratis tilbud i dag!',
    priority: 1.0,
    changefreq: 'weekly',
  },
  '/tjenester/vaktmester': {
    path: '/tjenester/vaktmester',
    title: 'Vaktmestertjenester Kristiansand | Eiendomspleie & Vedlikehold - HandyHjelp',
    description: 'Profesjonell eiendomspleie for borettslag, sameier og næringseiendom. Vi sørger for at ditt bygg holder seg i topp stand gjennom året.',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/tjenester/tomrer': {
    path: '/tjenester/tomrer',
    title: 'Tømrertjenester Kristiansand | Terrasser, Dører, Vinduer - HandyHjelp',
    description: 'Kvalitetssnekring og konstruksjonsarbeid fra erfarne tømrere. Vi leverer solid håndverk som varer for privatpersoner, bedrifter og boligselskaper.',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/tjenester/blikk': {
    path: '/tjenester/blikk',
    title: 'Blikkenslagertjenester Kristiansand | Takrenner & Taktekking - HandyHjelp',
    description: 'Profesjonelle takteknings- og vannsikringsløsninger. Vi sikrer at taket ditt holder tett og at vannet ledes bort på riktig måte.',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/tjenester/takrennerens': {
    path: '/tjenester/takrennerens',
    title: 'Takrennerens Kristiansand | Fast pris 3390 kr - HandyHjelp',
    description: 'Profesjonell rensing og vedlikehold av takrenner. Fast pris for enebolig: 3 390 kr. Hold takrennene i topp stand og unngå vannskader.',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/om-oss': {
    path: '/om-oss',
    title: 'Om HandyHjelp | Din Pålitelige Håndverkspartner i Kristiansand',
    description: 'HandyHjelp har levert profesjonell eiendomspleie og håndverkstjenester i Kristiansand siden 2004. Møt teamet og les om vår erfaring.',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/kontakt': {
    path: '/kontakt',
    title: 'Kontakt HandyHjelp | Ring +47 41250553 | Kristiansand',
    description: 'Kontakt HandyHjelp for eiendomsvedlikehold. Ring oss eller send melding - vi svarer innen 1-3 virkedager.',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/faq': {
    path: '/faq',
    title: 'Ofte Stilte Spørsmål | HandyHjelp',
    description: 'Finn svar på vanlige spørsmål om våre håndverkstjenester, priser, responstid og serviceavtaler.',
    priority: 0.7,
    changefreq: 'monthly',
  },
  '/fast-avtale': {
    path: '/fast-avtale',
    title: 'Faste Avtaler | Bli Prioritert Kunde - HandyHjelp',
    description: 'Bestill fast serviceavtale for regelmessig vedlikehold av din eiendom. Vi kontakter deg innen 1-2 virkedager.',
    priority: 0.8,
    changefreq: 'monthly',
  },
  '/prosjekter': {
    path: '/prosjekter',
    title: 'Våre Prosjekter | Se Resultat av Vårt Arbeid - HandyHjelp',
    description: 'Se før- og etterbilder fra våre prosjekter. Kvalitetsarbeid innen vaktmester, tømrer og blikkenslagerarbeid.',
    priority: 0.6,
    changefreq: 'weekly',
  },
  '/raad': {
    path: '/raad',
    title: 'Håndverksråd & Tips | HandyHjelp Blogg',
    description: 'Gode råd og tips for eiendomsvedlikehold fra våre erfarne fagfolk.',
    priority: 0.6,
    changefreq: 'weekly',
  },
  '/personvern': {
    path: '/personvern',
    title: 'Personvernerklæring | HandyHjelp',
    description: 'Les om hvordan HandyHjelp behandler og beskytter dine personopplysninger i henhold til GDPR.',
    priority: 0.3,
    changefreq: 'yearly',
  },
  '/cookies': {
    path: '/cookies',
    title: 'Informasjonskapsler | HandyHjelp',
    description: 'Informasjon om hvordan HandyHjelp bruker cookies og lignende teknologier på våre nettsider.',
    priority: 0.3,
    changefreq: 'yearly',
  },
  '/vilkaar': {
    path: '/vilkaar',
    title: 'Vilkår og Betingelser | HandyHjelp',
    description: 'Les våre generelle vilkår og betingelser for bruk av HandyHjelps tjenester.',
    priority: 0.3,
    changefreq: 'yearly',
  },
};

/**
 * Hent SEO-data for en gitt path
 */
export function getPageSEO(path: string): PageSEOData | undefined {
  return PAGE_SEO_DATA[path];
}

/**
 * Bygg full URL for en path
 */
export function getCanonicalUrl(path: string): string {
  return `${SEO_CONFIG.domain}${path}`;
}

/**
 * Bygg full URL for OG-bilde
 */
export function getOgImageUrl(imagePath?: string): string {
  const image = imagePath || SEO_CONFIG.defaultImage;
  if (image.startsWith('http')) {
    return image;
  }
  return `${SEO_CONFIG.domain}${image}`;
}
