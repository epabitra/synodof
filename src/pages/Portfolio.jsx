/**
 * Professional Portfolio Page with Realistic Content
 * Showcase of featured stories and highlights
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { publicAPI } from '@/services/api';
import { formatDate } from '@/utils/dateFormatter';
import { ROUTES } from '@/config/constants';
import Loading from '@/components/Loading';
import { ENV } from '@/config/env';
import { BreadcrumbSchema } from '@/components/SEO/StructuredData';

const Portfolio = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        status: 'published',
        type: 'programs', // Filter by programs type (will also include 'both' type posts)
        limit: 50,
        sort: 'published_at',
        order: 'desc', // Newest first
      };

      const [postsData, categoriesData] = await Promise.all([
        publicAPI.listPosts(params).catch(() => null),
        publicAPI.getCategories().catch(() => null),
      ]);

      // Filter posts by type: show only 'programs' or 'both' type posts
      if (postsData?.success && postsData.data?.length > 0) {
        let filteredPosts = postsData.data.filter(post => 
          post.type === 'programs' || post.type === 'both'
        );
        
        // Sort posts by published_at date (newest first) as fallback if API doesn't sort
        let sortedPosts = [...filteredPosts];
        sortedPosts.sort((a, b) => {
          const dateA = a.published_at || a.created_at || '';
          const dateB = b.published_at || b.created_at || '';
          return new Date(dateB) - new Date(dateA); // Descending order (newest first)
        });
        
        setPosts(sortedPosts);
      } else {
        setPosts([]);
      }

      if (categoriesData?.success && categoriesData.data?.length > 0) {
        setCategories(categoriesData.data);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error('Error loading portfolio:', err);
      setError(err.message || 'Failed to load portfolio');
      setPosts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = selectedCategory
    ? posts.filter(post => post.category?.toLowerCase() === selectedCategory.toLowerCase())
    : posts;

  const displayPosts = filteredPosts;
  const displayCategories = categories;

  if (loading) {
    return <Loading fullScreen message="Loading portfolio..." />;
  }

  return (
    <>
      <Helmet>
        <title>Programs | {ENV.SITE_NAME}</title>
        <meta name="description" content="Explore our community programs, initiatives, and projects from Berhampur Diocesan Synod. Education, healthcare, youth development, and spiritual formation programs." />
        <meta name="keywords" content="Berhampur Diocesan Synod programs, community programs, Christian NGO programs, education programs, healthcare services, youth development, Berhampur" />
        <meta property="og:url" content={`${ENV.SITE_URL || 'https://www.synodofberhampur.com'}/programs`} />
        <link rel="canonical" href={`${ENV.SITE_URL || 'https://www.synodofberhampur.com'}/programs`} />
      </Helmet>
      <BreadcrumbSchema items={[
        { name: 'Home', url: '/' },
        { name: 'Programs', url: '/programs' }
      ]} />

      <div className="portfolio-page">
        <div className="section">
          <div className="container">
            <div className="section-header text-center" style={{ marginBottom: 'var(--space-12)' }}>
              <h1>Our Programs</h1>
              <p style={{
                color: 'var(--text-secondary)',
                maxWidth: '700px',
                margin: 'var(--space-4) auto 0',
                fontSize: 'var(--text-lg)'
              }}>
                Explore our various programs and initiatives designed to serve the community through education, healthcare, youth development, and spiritual growth.
              </p>
            </div>

            {/* Category Filter */}
            {displayCategories.length > 0 && (
              <div className="category-filter" style={{ marginBottom: 'var(--space-12)' }}>
                <button
                  onClick={() => setSelectedCategory('')}
                  className={!selectedCategory ? 'active' : ''}
                >
                  All Programs
                </button>
                {displayCategories
                  .filter(cat => cat.is_active !== false)
                  .map((category) => (
                    <button
                      key={category.id || category.slug}
                      onClick={() => setSelectedCategory(category.name)}
                      className={selectedCategory === category.name ? 'active' : ''}
                    >
                      {category.icon && <span style={{ marginRight: '4px' }}>{category.icon}</span>}
                      {category.name}
                    </button>
                  ))}
              </div>
            )}

            {/* Portfolio Grid */}
            {error ? (
              <div className="error-container">
                <div className="error-message">
                  <p>{error}</p>
                </div>
                <button className="btn btn-primary" onClick={loadData}>
                  Try Again
                </button>
              </div>
            ) : displayPosts && displayPosts.length > 0 ? (
              <div className="posts-grid">
                {displayPosts.map((post) => (
                  <article key={post.id} className="post-card">
                    {post.cover_image_url && (
                      <div className="post-image">
                        <Link to={ROUTES.PROGRAM_DETAIL.replace(':slug', post.slug)}>
                          <img src={post.cover_image_url} alt={post.title} loading="lazy" />
                        </Link>
                      </div>
                    )}
                    <div className="post-content">
                      <div className="post-meta mt-4">
                        <time dateTime={post.published_at}>
                          {formatDate(post.published_at)}
                        </time>
                        {post.category && (
                          <span className="post-category">{post.category}</span>
                        )}
                      </div>
                      <h2>
                        <Link to={ROUTES.PROGRAM_DETAIL.replace(':slug', post.slug)}>{post.title}</Link>
                      </h2>
                      {post.subtitle && (
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)', fontStyle: 'italic' }}>
                          {post.subtitle}
                        </p>
                      )}
                      {post.excerpt && (
                        <p className="post-excerpt">{post.excerpt}</p>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
                        {post.read_time_minutes && (
                          <span className="read-time">{post.read_time_minutes} min read</span>
                        )}
                        {post.view_count && (
                          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                            👁️ {post.view_count.toLocaleString()} views
                          </span>
                        )}
                      </div>
                      <Link to={ROUTES.PROGRAM_DETAIL.replace(':slug', post.slug)} className="read-more">
                        Learn More →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center" style={{ padding: 'var(--space-12)' }}>
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
                  {selectedCategory 
                    ? `No programs found in ${selectedCategory}.`
                    : 'No programs available yet. Check back soon for updates!'
                  }
                </p>
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="btn btn-primary"
                    style={{ marginTop: 'var(--space-4)' }}
                  >
                    View All Programs
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Portfolio;
