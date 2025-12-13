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
    '@type': 'Organization',
    name: profile?.name || 'Berhampur Diocesan Synod',
    alternateName: 'Synod of Berhampur',
    url: siteUrl,
    logo: profile?.profile_image_url || `${siteUrl}/logo.png`,
    description: profile?.short_bio || profile?.bio || 'A Christian NGO serving the community through faith, hope, and love.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Berhampur',
      addressRegion: 'Odisha',
      addressCountry: 'IN'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: profile?.phone || '+91-7735020144',
      contactType: 'General Inquiry',
      email: profile?.email || 'synodofberhampur@gmail.com'
    },
    sameAs: profile?.social_links?.map(link => link.url) || []
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
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.title,
    image: post.cover_image_url || `${siteUrl}/og-image.jpg`,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: {
      '@type': 'Organization',
      name: post.author_name || 'Berhampur Diocesan Synod'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Berhampur Diocesan Synod',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${post.slug}`
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

export const LocalBusinessSchema = ({ profile }) => {
  const siteUrl = ENV.SITE_URL || 'https://www.synodofberhampur.com';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: profile?.name || 'Berhampur Diocesan Synod',
    description: profile?.short_bio || profile?.bio || 'A Christian NGO serving the community through faith, hope, and love.',
    url: siteUrl,
    logo: profile?.profile_image_url || `${siteUrl}/logo.png`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Berhampur',
      addressRegion: 'Odisha',
      addressCountry: 'IN'
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: profile?.phone || '+91-7735020144',
      contactType: 'General Inquiry',
      email: profile?.email || 'synodofberhampur@gmail.com'
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

