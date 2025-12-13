/**
 * Structured Data Component (JSON-LD)
 * Adds schema.org structured data for better SEO indexing
 */

import { Helmet } from 'react-helmet-async';
import { ENV } from '@/config/env';

export const OrganizationSchema = ({ profile }) => {
  const siteUrl = ENV.SITE_URL || 'https://www.synodofberhampur.com';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: profile?.name || 'Berhampur Diocesan Synod',
    alternateName: ['Synod of Berhampur', 'Berhampur Diocese', 'Berhampur Diocesan Synod NGO'],
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: profile?.profile_image_url || `${siteUrl}/favicon.svg`,
      width: 64,
      height: 64
    },
    description: profile?.short_bio || profile?.bio || 'A Christian NGO serving the community through faith, hope, and love. Walking with Christ on the Synodal Way.',
    foundingDate: '2020',
    legalName: 'Berhampur Diocesan Synod',
    slogan: 'Walking with Christ on the Synodal Way',
    nonprofitStatus: 'NonprofitType',
    taxID: 'NGO',
    address: {
      '@type': 'PostalAddress',
      streetAddress: profile?.address || 'Berhampur',
      addressLocality: 'Berhampur',
      addressRegion: 'Odisha',
      postalCode: '760001',
      addressCountry: {
        '@type': 'Country',
        name: 'India'
      }
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '19.3144',
      longitude: '84.7941'
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: profile?.phone || '+91-7735020144',
        contactType: 'General Inquiry',
        email: profile?.email || 'synodofberhampur@gmail.com',
        areaServed: 'IN',
        availableLanguage: ['English', 'Odia', 'Hindi']
      }
    ],
    areaServed: {
      '@type': 'City',
      name: 'Berhampur',
      containedIn: {
        '@type': 'State',
        name: 'Odisha'
      }
    },
    knowsAbout: [
      'Christian NGO',
      'Community Service',
      'Faith-based Services',
      'Social Welfare',
      'Charity',
      'Non-profit Organization',
      'Synodal Way',
      'Catholic Diocese'
    ],
    sameAs: profile?.social_links?.map(link => link.url) || [],
    memberOf: {
      '@type': 'Organization',
      name: 'Catholic Church',
      '@id': 'https://www.vatican.va'
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export const WebsiteSchema = () => {
  const siteUrl = ENV.SITE_URL || 'https://www.synodofberhampur.com';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Berhampur Diocesan Synod',
    url: siteUrl,
    description: 'Berhampur Diocesan Synod - Christian NGO website serving the community through faith, hope, and love.',
    publisher: {
      '@type': 'Organization',
      name: 'Berhampur Diocesan Synod'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/blog?search={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export const BreadcrumbSchema = ({ items }) => {
  const siteUrl = ENV.SITE_URL || 'https://www.synodofberhampur.com';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export const ArticleSchema = ({ post }) => {
  const siteUrl = ENV.SITE_URL || 'https://www.synodofberhampur.com';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.cover_image_url ? [post.cover_image_url] : [`${siteUrl}/favicon.svg`],
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      '@type': 'Organization',
      name: post.author_name || 'Berhampur Diocesan Synod',
      url: siteUrl
    },
    publisher: {
      '@type': 'Organization',
      name: 'Berhampur Diocesan Synod',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.svg`,
        width: 64,
        height: 64
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`
    },
    articleSection: post.category || 'News & Updates',
    keywords: post.tags ? (Array.isArray(post.tags) ? post.tags.join(', ') : post.tags) : 'Berhampur Diocesan Synod, Christian NGO, News',
    inLanguage: 'en-IN',
    isAccessibleForFree: true
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export const LocalBusinessSchema = ({ profile }) => {
  const siteUrl = ENV.SITE_URL || 'https://www.synodofberhampur.com';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: profile?.name || 'Berhampur Diocesan Synod',
    description: profile?.short_bio || profile?.bio || 'A Christian NGO serving the community through faith, hope, and love. Walking with Christ on the Synodal Way.',
    url: siteUrl,
    logo: {
      '@type': 'ImageObject',
      url: profile?.profile_image_url || `${siteUrl}/favicon.svg`
    },
    image: profile?.profile_image_url || `${siteUrl}/favicon.svg`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: profile?.address || 'Berhampur',
      addressLocality: 'Berhampur',
      addressRegion: 'Odisha',
      postalCode: '760001',
      addressCountry: {
        '@type': 'Country',
        name: 'India'
      }
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '19.3144',
      longitude: '84.7941'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: profile?.phone || '+91-7735020144',
      contactType: 'General Inquiry',
      email: profile?.email || 'synodofberhampur@gmail.com',
      areaServed: 'IN',
      availableLanguage: ['English', 'Odia', 'Hindi']
    },
    areaServed: {
      '@type': 'City',
      name: 'Berhampur',
      containedIn: {
        '@type': 'State',
        name: 'Odisha'
      }
    },
    priceRange: 'Free',
    paymentAccepted: 'Donation',
    currenciesAccepted: 'INR'
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

