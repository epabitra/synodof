/**
 * Professional Blog List Page with Realistic Content
 * Modern blog listing with filters, search, and pagination
 */

import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { publicAPI } from '@/services/api';
import { formatDate } from '@/utils/dateFormatter';
import { ROUTES, PAGINATION } from '@/config/constants';
import Loading from '@/components/Loading';
import { ENV } from '@/config/env';

const BlogList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    limit: PAGINATION.DEFAULT_PAGE_SIZE,
  });

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    loadData();
  }, [currentPage, selectedCategory]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: pagination.limit,
        status: 'published',
        type: 'news', // Filter by news type (will also include 'both' type posts)
        sort: 'published_at',
        order: 'desc', // Newest first
      };

      if (selectedCategory) {
        // Use category name for filtering (the API will match it)
        params.category = selectedCategory;
      }

      const [postsData, categoriesData] = await Promise.all([
        publicAPI.listPosts(params).catch(() => null),
        publicAPI.getCategories().catch(() => null),
      ]);

      if (postsData?.success && postsData.data?.length > 0) {
        // Filter posts by type: show only 'news' or 'both' type posts
        let filteredPosts = postsData.data.filter(post => 
          post.type === 'news' || post.type === 'both'
        );
        
        // Sort posts by published_at date (newest first) as fallback if API doesn't sort
        let sortedPosts = [...filteredPosts];
        sortedPosts.sort((a, b) => {
          const dateA = a.published_at || a.created_at || '';
          const dateB = b.published_at || b.created_at || '';
          return new Date(dateB) - new Date(dateA); // Descending order (newest first)
        });
        
        setPosts(sortedPosts);
        setPagination({
          ...pagination,
          total: postsData.total || postsData.data.length,
          page: currentPage,
        });
      } else {
        // No posts found - set empty array
        setPosts([]);
        setPagination({
          ...pagination,
          total: 0,
          page: currentPage,
        });
      }

      if (categoriesData?.success && categoriesData.data?.length > 0) {
        setCategories(categoriesData.data);
      } else {
        // No categories - set empty array
        setCategories([]);
      }
    } catch (err) {
      console.error('Error loading blog posts:', err);
      setError(err.message || 'Failed to load posts');
      setPosts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    setSearchParams({ category: category || '', page: '1' });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ ...Object.fromEntries(searchParams), page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const displayPosts = posts;
  const displayCategories = categories;

  if (loading) {
    return <Loading fullScreen message="Loading posts..." />;
  }

  return (
    <>
      <Helmet>
        <title>Blog | {ENV.SITE_NAME}</title>
        <meta name="description" content="Latest news stories, articles, and investigative reports" />
      </Helmet>

      <div className="blog-list-page">
        <div className="section">
          <div className="container">
            <div className="section-header text-center" style={{ marginBottom: 'var(--space-12)' }}>
              <h1>Blog</h1>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: 'var(--space-4) auto 0', fontSize: 'var(--text-lg)' }}>
                Explore our latest stories, investigative reports, and feature articles covering politics, human rights, environment, and more.
              </p>
            </div>

            {/* Category Filter */}
            <div className="category-filter" style={{ marginBottom: 'var(--space-8)' }}>
              <button
                onClick={() => handleCategoryChange('')}
                className={!selectedCategory ? 'active' : ''}
              >
                All Posts
              </button>
              {displayCategories.length > 0 ? (
                displayCategories
                  .filter(cat => cat.is_active !== false)
                  .map((category) => {
                    const categoryValue = category.name || category.slug;
                    return (
                      <button
                        key={category.id || category.slug}
                        onClick={() => handleCategoryChange(categoryValue)}
                        className={selectedCategory.toLowerCase() === categoryValue.toLowerCase() ? 'active' : ''}
                      >
                        {category.icon && <span style={{ marginRight: '4px' }}>{category.icon}</span>}
                        {category.name}
                      </button>
                    );
                  })
              ) : (
                // Show default categories if none from API
                <>
                  <button
                    onClick={() => handleCategoryChange('Investigation')}
                    className={selectedCategory.toLowerCase() === 'investigation' ? 'active' : ''}
                  >
                    🔍 Investigation
                  </button>
                  <button
                    onClick={() => handleCategoryChange('Human Rights')}
                    className={selectedCategory.toLowerCase() === 'human rights' ? 'active' : ''}
                  >
                    ✊ Human Rights
                  </button>
                  <button
                    onClick={() => handleCategoryChange('Environment')}
                    className={selectedCategory.toLowerCase() === 'environment' ? 'active' : ''}
                  >
                    🌍 Environment
                  </button>
                  <button
                    onClick={() => handleCategoryChange('Politics')}
                    className={selectedCategory.toLowerCase() === 'politics' ? 'active' : ''}
                  >
                    🏛️ Politics
                  </button>
                  <button
                    onClick={() => handleCategoryChange('Technology')}
                    className={selectedCategory.toLowerCase() === 'technology' ? 'active' : ''}
                  >
                    💻 Technology
                  </button>
                  <button
                    onClick={() => handleCategoryChange('Culture')}
                    className={selectedCategory.toLowerCase() === 'culture' ? 'active' : ''}
                  >
                    🎭 Culture
                  </button>
                </>
              )}
            </div>

            {/* Posts Grid */}
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
              <>
                <div className="posts-grid">
                  {displayPosts.map((post) => (
                    <article key={post.id} className="post-card">
                      {post.cover_image_url && (
                        <div className="post-image">
                          <Link to={`${ROUTES.BLOG}/${post.slug}`}>
                            <img src={post.cover_image_url} alt={post.title} loading="lazy" />
                          </Link>
                        </div>
                      )}
                      <div className="post-content mt-4">
                        <div className="post-meta">
                          <time dateTime={post.published_at}>
                            {formatDate(post.published_at)}
                          </time>
                          {post.category && (
                            <span className="post-category">{post.category}</span>
                          )}
                        </div>
                        <h2>
                          <Link to={`${ROUTES.BLOG}/${post.slug}`}>{post.title}</Link>
                        </h2>
                        {post.subtitle && (
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)', fontStyle: 'italic' }}>
                            {post.subtitle}
                          </p>
                        )}
                        {post.excerpt && (
                          <p className="post-excerpt">{post.excerpt}</p>
                        )}
                        {post.tags && typeof post.tags === 'string' && post.tags.length > 0 && (
                          <div className="post-tags">
                            {post.tags.split(',').slice(0, 3).map((tag, index) => (
                              <span key={index} className="tag">
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
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
                        <Link to={`${ROUTES.BLOG}/${post.slug}`} className="read-more">
                          Read More →
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination" style={{ marginTop: 'var(--space-12)' }}>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn btn-outline"
                    >
                      ← Previous
                    </button>
                    
                    {/* Page Numbers */}
                    <div className="pagination-numbers">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(pageNum => {
                          // Show first page, last page, current page, and pages around current
                          return (
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                          );
                        })
                        .map((pageNum, index, array) => {
                          // Add ellipsis if there's a gap
                          const showEllipsisBefore = index > 0 && pageNum - array[index - 1] > 1;
                          return (
                            <span key={pageNum}>
                              {showEllipsisBefore && <span className="pagination-ellipsis">...</span>}
                              <button
                                onClick={() => handlePageChange(pageNum)}
                                className={`btn ${pageNum === currentPage ? 'btn-primary' : 'btn-outline'}`}
                                style={{ minWidth: '40px' }}
                              >
                                {pageNum}
                              </button>
                            </span>
                          );
                        })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="btn btn-outline"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center" style={{ padding: 'var(--space-12)' }}>
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>
                  No posts found{selectedCategory ? ` in this category` : ''}.
                </p>
                {selectedCategory && (
                  <button
                    onClick={() => handleCategoryChange('')}
                    className="btn btn-primary"
                    style={{ marginTop: 'var(--space-4)' }}
                  >
                    View All Posts
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

export default BlogList;
