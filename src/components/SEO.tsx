import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    type?: 'website' | 'article' | 'profile';
    author?: string;
    publishDate?: string;
}

const DEFAULT_IMAGE = '/og-image.jpg'; // Recommended dimensions: 1200x630px
const SITE_NAME = 'One Connexion';
const TWITTER_HANDLE = '@OneConnexion'; // Replace with actual handle if available
const BASE_URL = 'https://www.one-connexion.fr'; // Replace with actual domain

export default function SEO({
    title,
    description,
    keywords,
    image = DEFAULT_IMAGE,
    type = 'website',
    author,
    publishDate
}: SEOProps) {
    const location = useLocation();
    const canonicalUrl = `${BASE_URL}${location.pathname}`;
    const fullImageUrl = image.startsWith('http') ? image : `${BASE_URL}${image}`;

    const schemaOrgJSONLD = [
        {
            '@context': 'http://schema.org',
            '@type': 'LocalBusiness',
            name: SITE_NAME,
            image: fullImageUrl,
            description: description,
            telephone: '+33100000000', // Replace with actual phone
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Paris',
                addressRegion: 'Île-de-France',
                addressCountry: 'FR'
            },
            url: BASE_URL,
            sameAs: [
                'https://www.linkedin.com/company/one-connexion',
                // Add other social links here
            ]
        }
    ];

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={canonicalUrl} />
            <meta name="robots" content="index, follow" />

            {/* Open Graph (Facebook/LinkedIn) */}
            <meta property="og:site_name" content={SITE_NAME} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:type" content={type} />
            <meta property="og:image" content={fullImageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            {publishDate && <meta property="article:published_time" content={publishDate} />}
            {author && <meta property="article:author" content={author} />}

            {/* Twitter Cards */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content={TWITTER_HANDLE} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImageUrl} />

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(schemaOrgJSONLD)}
            </script>
        </Helmet>
    );
}
