import { Helmet } from 'react-helmet-async'

const SITE_NAME = 'LoopedAI'
const BASE_URL  = 'https://loopedai.io'
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`

/**
 * Drop-in SEO head manager. Sets title, meta description, Open Graph,
 * Twitter Card, canonical URL, and optional JSON-LD structured data.
 * Uses react-helmet-async so each page controls its own <head> slice.
 */
export default function SEO({
  title,
  description,
  path = '/',
  image = DEFAULT_IMAGE,
  imageAlt,
  type = 'website',
  noindex = false,
  jsonLd = null,
}) {
  const fullTitle    = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — AI Immigration Assistant & Visa Intelligence`
  const canonical    = `${BASE_URL}${path}`
  const resolvedAlt  = imageAlt || fullTitle

  return (
    <Helmet>
      {/* Core */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type"        content={type} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:image"       content={image} />
      <meta property="og:image:alt"   content={resolvedAlt} />
      <meta property="og:site_name"   content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={image} />
      <meta name="twitter:image:alt"   content={resolvedAlt} />

      {/* Optional page-level JSON-LD */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  )
}
