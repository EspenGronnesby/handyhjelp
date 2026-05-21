import { Helmet } from 'react-helmet';
import { SEO_CONFIG, getPageSEO, getCanonicalUrl, getOgImageUrl } from '@/config/seo';

export interface PageSEOProps {
  /** Path til siden, f.eks. "/om-oss" eller "/tjenester/vaktmester" */
  path: string;
  /** Overstyr tittel fra konfigurasjon */
  title?: string;
  /** Overstyr beskrivelse fra konfigurasjon */
  description?: string;
  /** Overstyr OG-bilde fra konfigurasjon */
  image?: string;
  /** Sett til true for å forhindre indeksering */
  noindex?: boolean;
}

/**
 * Gjenbrukbar SEO-komponent som setter alle nødvendige meta-tags
 * inkludert canonical, Open Graph og Twitter Cards.
 */
export const PageSEO = ({
  path,
  title: customTitle,
  description: customDescription,
  image: customImage,
  noindex = false
}: PageSEOProps) => {
  const pageSEO = getPageSEO(path);

  const title = customTitle || pageSEO?.title || `${SEO_CONFIG.siteName}`;
  const description = customDescription || pageSEO?.description || '';
  const canonicalUrl = getCanonicalUrl(path);
  const ogImage = getOgImageUrl(customImage);
  const robots = noindex ? 'noindex, nofollow' : SEO_CONFIG.defaultRobots;

  const serviceSchema = path.startsWith('/tjenester/') ? {
    "@context": "https://schema.org",
    "@type": "Service",
    name: title,
    description,
    url: canonicalUrl,
    areaServed: { "@type": "City", name: "Kristiansand" },
    provider: {
      "@type": "LocalBusiness",
      name: SEO_CONFIG.siteName,
      url: SEO_CONFIG.domain,
      telephone: "+47 41250553",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Kristiansand",
        addressCountry: "NO"
      }
    }
  } : null;

  return (
    <Helmet>
      {/* Grunnleggende */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={SEO_CONFIG.locale} />
      <meta property="og:site_name" content={SEO_CONFIG.siteName} />

      {/* Twitter Card */}
      <meta name="twitter:card" content={SEO_CONFIG.twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {serviceSchema && (
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
      )}
    </Helmet>
  );
};

export default PageSEO;
