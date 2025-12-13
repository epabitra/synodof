/**
 * Professional Blog Detail Page with Realistic Content
 * Enhanced reading experience with full content
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import ReactPlayer from 'react-player';
import { publicAPI } from '@/services/api';
import { formatDate, formatDateTime } from '@/utils/dateFormatter';
import { sanitizeHtml } from '@/utils/sanitize';
import Loading from '@/components/Loading';
import { ENV } from '@/config/env';
import { ROUTES as APP_ROUTES, MEDIA_TYPE } from '@/config/constants';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (slug) {
      // Scroll to top immediately when slug changes
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      loadPost();
    }
  }, [slug]);

  // Scroll to top after post loads to ensure we're at the top
  useEffect(() => {
    if (post && !loading) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }, 0);
    }
  }, [post, loading]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const postData = await publicAPI.getPost(slug).catch(() => null);

      if (postData?.success && postData.data) {
        setPost(postData.data);

        // Load related posts
        try {
          const relatedData = await publicAPI.listPosts({
            limit: 3,
            status: 'published',
            exclude: postData.data.id,
          }).catch(() => null);
          
          if (relatedData?.success && relatedData.data?.length > 0) {
            setRelatedPosts(relatedData.data.slice(0, 3));
          } else {
            setRelatedPosts([]);
          }
        } catch (err) {
          console.error('Error loading related posts:', err);
          setRelatedPosts([]);
        }
      } else {
        setError('Post not found');
      }
    } catch (err) {
      console.error('Error loading post:', err);
      setError(err.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading post..." />;
  }

  if (error || !post) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Post Not Found</h2>
          <p>{error || 'The post you are looking for does not exist.'}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate(APP_ROUTES.BLOG)}>
            Back to Blog
          </button>
          <button className="btn btn-outline" onClick={() => navigate(APP_ROUTES.HOME)}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const tags = typeof post.tags === 'string' 
    ? post.tags.split(',').map(t => t.trim()).filter(Boolean)
    : Array.isArray(post.tags) ? post.tags : [];

  return (
    <>
      <Helmet>
        <title>{post.seo_title || post.title} | {ENV.SITE_NAME}</title>
        <meta name="description" content={post.seo_description || post.excerpt || post.title} />
        {post.cover_image_url && <meta property="og:image" content={post.cover_image_url} />}
        <meta property="og:type" content="article" />
        {post.published_at && (
          <meta property="article:published_time" content={post.published_at} />
        )}
      </Helmet>

      <article className="blog-detail-page">
        <div className="container-narrow">
          {/* Header */}
          <header className="post-header">
            {post.category && (
              <span className="post-category" style={{ marginBottom: 'var(--space-4)' }}>
                {post.category}
              </span>
            )}
            <h1>{post.title}</h1>
            {post.subtitle && (
              <h2 className="post-subtitle">{post.subtitle}</h2>
            )}
            <div className="post-meta mt-4">
              <time dateTime={post.published_at}>
                {formatDateTime(post.published_at)}
              </time>
              {post.read_time_minutes && (
                <span className="read-time">• {post.read_time_minutes} min read</span>
              )}
              {post.author_name && (
                <span>• By {post.author_name}</span>
              )}
              {post.view_count && (
                <span>• 👁️ {post.view_count.toLocaleString()} views</span>
              )}
            </div>
          </header>

          {/* Media (Video or Image) - Show chosen media instead of cover image */}
          {post.media_type && 
           post.media_type !== MEDIA_TYPE.NONE && 
           post.media_type !== 'none' && 
           post.media_url && (
            <div className={`post-media ${post.media_type === MEDIA_TYPE.VIDEO || post.media_type === 'video' ? 'post-media-video' : 'post-media-image'}`}>
              {post.media_type === MEDIA_TYPE.VIDEO || post.media_type === 'video' ? (
                <div className="video-wrapper">
                  <ReactPlayer
                    url={post.media_url}
                    controls
                    width="100%"
                    height="100%"
                    config={{
                      youtube: {
                        playerVars: {
                          showinfo: 1,
                          rel: 0,
                          modestbranding: 1,
                        },
                      },
                    }}
                  />
                </div>
              ) : post.media_type === MEDIA_TYPE.IMAGE || post.media_type === 'image' ? (
                <img 
                  src={post.media_url} 
                  alt={post.title} 
                  loading="eager"
                />
              ) : null}
            </div>
          )}

          {/* Content */}
          <div className="post-content">
            {post.content ? (
              <div
                className="markdown-content"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(post.content),
                }}
              />
            ) : (
              <ReactMarkdown>{post.content || ''}</ReactMarkdown>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="post-tags" style={{ 
              marginTop: 'var(--space-8)',
              paddingTop: 'var(--space-8)',
              borderTop: '2px solid var(--border-light)'
            }}>
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>Tags:</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Share Section */}
          <div style={{
            marginTop: 'var(--space-8)',
            padding: 'var(--space-6)',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>Share This Story</h3>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="btn btn-outline">
                🐦 Twitter
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="btn btn-outline">
                📘 Facebook
              </a>
              <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="btn btn-outline">
                💼 LinkedIn
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ 
            marginTop: 'var(--space-12)',
            paddingTop: 'var(--space-8)',
            borderTop: '2px solid var(--border-light)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-4)'
          }}>
            <Link to={APP_ROUTES.BLOG} className="btn btn-outline">
              ← Back to Blog
            </Link>
            <Link to={APP_ROUTES.CONTACT} className="btn btn-primary">
              Get In Touch
            </Link>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="related-posts" style={{ 
              marginTop: 'var(--space-16)',
              paddingTop: 'var(--space-12)',
              borderTop: '2px solid var(--border-light)'
            }}>
              <h2 style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
                Related Stories
              </h2>
              <div className="posts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost.id} className="post-card">
                    {relatedPost.cover_image_url && (
                      <div className="post-image">
                        <Link to={`${APP_ROUTES.BLOG}/${relatedPost.slug}`}>
                          <img src={relatedPost.cover_image_url} alt={relatedPost.title} loading="lazy" />
                        </Link>
                      </div>
                    )}
                    <div className="post-content">
                      <div className="post-meta mt-4">
                        <time dateTime={relatedPost.published_at}>
                          {formatDate(relatedPost.published_at)}
                        </time>
                        {relatedPost.category && (
                          <span className="post-category">{relatedPost.category}</span>
                        )}
                      </div>
                      <h3>
                        <Link to={`${APP_ROUTES.BLOG}/${relatedPost.slug}`}>
                          {relatedPost.title}
                        </Link>
                      </h3>
                      {relatedPost.excerpt && (
                        <p className="post-excerpt">{relatedPost.excerpt}</p>
                      )}
                      <Link to={`${APP_ROUTES.BLOG}/${relatedPost.slug}`} className="read-more">
                        Read More →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </>
  );
};

export default BlogDetail;
