/**
 * Professional Program Detail Page
 * Enhanced reading experience with full content for program posts
 */

import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactMarkdown from 'react-markdown';
import ReactPlayer from 'react-player';
import { toast } from 'react-toastify';
import { publicAPI } from '@/services/api';
import { formatDate, formatDateTime } from '@/utils/dateFormatter';
import { sanitizeHtml } from '@/utils/sanitize';
import Loading from '@/components/Loading';
import MediaCarousel from '@/components/ImageCarousel/MediaCarousel';
import { ENV } from '@/config/env';
import { ROUTES as APP_ROUTES, MEDIA_TYPE } from '@/config/constants';
import { ArticleSchema, BreadcrumbSchema } from '@/components/SEO/StructuredData';

const ProgramDetail = () => {
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
        const loadedPost = postData.data;
        
        // If this is a news-only post (not 'both'), redirect to blog detail page
        if (loadedPost.type === 'news') {
          navigate(APP_ROUTES.BLOG_DETAIL.replace(':slug', slug), { replace: true });
          return;
        }
        
        // 'both' type posts can be viewed on program detail page, so continue
        setPost(loadedPost);

        // Load related posts (filter by program type)
        try {
          const relatedData = await publicAPI.listPosts({
            limit: 6,
            status: 'published',
            type: 'programs',
            exclude: loadedPost.id,
          }).catch(() => null);
          
          if (relatedData?.success && relatedData.data?.length > 0) {
            // Filter to only show programs or both type posts
            const filtered = relatedData.data.filter(p => 
              p.type === 'programs' || p.type === 'both'
            );
            setRelatedPosts(filtered.slice(0, 3));
          } else {
            setRelatedPosts([]);
          }
        } catch (err) {
          console.error('Error loading related posts:', err);
          setRelatedPosts([]);
        }
      } else {
        setError('Program not found');
      }
    } catch (err) {
      console.error('Error loading program:', err);
      setError(err.message || 'Failed to load program');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading program..." />;
  }

  if (error || !post) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Program Not Found</h2>
          <p>{error || 'The program you are looking for does not exist.'}</p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate(APP_ROUTES.PORTFOLIO)}>
            Back to Programs
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
        <meta name="keywords" content={tags.join(', ') || 'Berhampur Diocesan Synod, programs, initiatives, Christian NGO'} />
        {post.cover_image_url && <meta property="og:image" content={post.cover_image_url} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${ENV.SITE_URL || 'https://www.synodofberhampur.com'}/programs/${post.slug}`} />
        {post.published_at && (
          <meta property="article:published_time" content={post.published_at} />
        )}
        <link rel="canonical" href={`${ENV.SITE_URL || 'https://www.synodofberhampur.com'}/programs/${post.slug}`} />
      </Helmet>
      <ArticleSchema post={post} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: '/' },
        { name: 'Programs', url: '/programs' },
        { name: post.title, url: `/programs/${post.slug}` }
      ]} />

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

          {/* Media Carousel (Videos or Images) */}
          {(() => {
            try {
              let mediaUrls = [];
              const mediaType = post.media_type;
              
              // Check for media_urls (new format - array)
              // Google Apps Script should already parse it to array, but handle both cases
              if (post.media_urls) {
                if (Array.isArray(post.media_urls)) {
                  mediaUrls = post.media_urls.filter(url => url && String(url).trim() !== '');
                } else if (typeof post.media_urls === 'string' && post.media_urls.trim() !== '') {
                  try {
                    // Try to parse as JSON
                    const parsed = JSON.parse(post.media_urls);
                    if (Array.isArray(parsed)) {
                      mediaUrls = parsed.filter(url => url && String(url).trim() !== '');
                    } else if (parsed) {
                      // Single value, wrap in array
                      mediaUrls = [String(parsed)].filter(url => url && url.trim() !== '');
                    }
                  } catch (e) {
                    // If parsing fails, treat as single URL string
                    const urlStr = String(post.media_urls).trim();
                    if (urlStr) {
                      mediaUrls = [urlStr];
                    }
                  }
                } else if (post.media_urls !== null && post.media_urls !== undefined) {
                  // Handle other types (number, etc.)
                  const urlStr = String(post.media_urls).trim();
                  if (urlStr) {
                    mediaUrls = [urlStr];
                  }
                }
              }
              
              // Backward compatibility: if media_url exists (old format) and no media_urls, use it
              if (mediaUrls.length === 0 && post.media_url) {
                const urlStr = String(post.media_url).trim();
                if (urlStr) {
                  mediaUrls = [urlStr];
                }
              }
              
              // Only show carousel if we have media URLs and media type is set
              if (mediaUrls.length > 0 && mediaType && mediaType !== MEDIA_TYPE.NONE && mediaType !== 'none' && String(mediaType).trim() !== '') {
                const isVideo = mediaType === MEDIA_TYPE.VIDEO || String(mediaType).toLowerCase() === 'video';
                const items = mediaUrls
                  .map(url => {
                    const urlStr = String(url).trim();
                    if (!urlStr) return null;
                    return {
                      url: urlStr,
                      type: isVideo ? 'video' : 'image',
                      isYouTube: isVideo && (
                        urlStr.includes('youtube.com/embed') || 
                        urlStr.includes('youtu.be') || 
                        urlStr.includes('youtube.com/watch')
                      )
                    };
                  })
                  .filter(item => item !== null && item.url !== '');
                
                if (items.length > 0) {
                  return (
                    <MediaCarousel 
                      items={items}
                      alt={`${post.title} - Media`}
                    />
                  );
                }
              }
              return null;
            } catch (error) {
              console.error('Error rendering media carousel:', error, post);
              // Fallback: try to show single media_url if available
              if (post.media_url && post.media_type && post.media_type !== MEDIA_TYPE.NONE && post.media_type !== 'none') {
                const urlStr = String(post.media_url).trim();
                if (urlStr) {
                  const isVideo = post.media_type === MEDIA_TYPE.VIDEO || String(post.media_type).toLowerCase() === 'video';
                  return (
                    <MediaCarousel 
                      items={[{
                        url: urlStr,
                        type: isVideo ? 'video' : 'image',
                        isYouTube: isVideo && (
                          urlStr.includes('youtube.com/embed') || 
                          urlStr.includes('youtu.be') || 
                          urlStr.includes('youtube.com/watch')
                        )
                      }]}
                      alt={`${post.title} - Media`}
                    />
                  );
                }
              }
              return null;
            }
          })()}

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
          {(() => {
            // Prepare share data - use absolute URL for better compatibility
            const shareUrl = window.location.href;
            const shareTitle = post.title || '';
            const shareDescription = post.excerpt || post.subtitle || post.title || '';
            const shareText = `${shareTitle}${shareDescription ? ` - ${shareDescription}` : ''}`;
            
            // Build share URLs with proper parameters
            const shareLinks = {
              twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
              facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
              linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
              whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
              telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
              email: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareDescription}\n\nRead more: ${shareUrl}`)}`,
              reddit: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
              pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(shareText)}`,
            };

            // Copy to clipboard function
            const handleCopyLink = async () => {
              try {
                await navigator.clipboard.writeText(shareUrl);
                toast.success('Link copied to clipboard!');
              } catch (err) {
                console.error('Failed to copy:', err);
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = shareUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                toast.success('Link copied to clipboard!');
              }
            };

            return (
              <div style={{
                marginTop: 'var(--space-8)',
                padding: 'var(--space-6)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center'
              }}>
                <h3 style={{ marginBottom: 'var(--space-4)', fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}>Share This Program</h3>
                <p style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--text-secondary)', 
                  marginBottom: 'var(--space-6)',
                  maxWidth: '600px',
                  margin: '0 auto var(--space-6)'
                }}>
                  Help spread the word by sharing this program on your favorite platforms
                </p>
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a 
                    href={shareLinks.twitter}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ minWidth: '120px' }}
                    title="Share on Twitter"
                  >
                    🐦 Twitter
                  </a>
                  <a 
                    href={shareLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ minWidth: '120px' }}
                    title="Share on Facebook"
                  >
                    📘 Facebook
                  </a>
                  <a 
                    href={shareLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ minWidth: '120px' }}
                    title="Share on LinkedIn"
                  >
                    💼 LinkedIn
                  </a>
                  <a 
                    href={shareLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ minWidth: '120px' }}
                    title="Share on WhatsApp"
                  >
                    💬 WhatsApp
                  </a>
                  <a 
                    href={shareLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ minWidth: '120px' }}
                    title="Share on Telegram"
                  >
                    ✈️ Telegram
                  </a>
                  <a 
                    href={shareLinks.reddit}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ minWidth: '120px' }}
                    title="Share on Reddit"
                  >
                    🤖 Reddit
                  </a>
                  <a 
                    href={shareLinks.pinterest}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                    style={{ minWidth: '120px' }}
                    title="Share on Pinterest"
                  >
                    📌 Pinterest
                  </a>
                  <a 
                    href={shareLinks.email}
                    className="btn btn-outline"
                    style={{ minWidth: '120px' }}
                    title="Share via Email"
                  >
                    📧 Email
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="btn btn-outline"
                    style={{ minWidth: '120px' }}
                    title="Copy link to clipboard"
                  >
                    📋 Copy Link
                  </button>
                </div>
              </div>
            );
          })()}

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
            <Link to={APP_ROUTES.PORTFOLIO} className="btn btn-outline">
              ← Back to Programs
            </Link>
            <Link to={APP_ROUTES.CONTACT} className="btn btn-primary">
              Get In Touch
            </Link>
          </div>

          {/* Related Programs */}
          {relatedPosts.length > 0 && (
            <section className="related-posts" style={{ 
              marginTop: 'var(--space-16)',
              paddingTop: 'var(--space-12)',
              borderTop: '2px solid var(--border-light)'
            }}>
              <h2 style={{ marginBottom: 'var(--space-8)', textAlign: 'center' }}>
                Related Programs
              </h2>
              <div className="posts-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                {relatedPosts.map((relatedPost) => (
                  <article key={relatedPost.id} className="post-card">
                    {relatedPost.cover_image_url && (
                      <div className="post-image">
                        <Link to={APP_ROUTES.PROGRAM_DETAIL.replace(':slug', relatedPost.slug)}>
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
                        <Link to={APP_ROUTES.PROGRAM_DETAIL.replace(':slug', relatedPost.slug)}>
                          {relatedPost.title}
                        </Link>
                      </h3>
                      {relatedPost.excerpt && (
                        <p className="post-excerpt">{relatedPost.excerpt}</p>
                      )}
                      <Link to={APP_ROUTES.PROGRAM_DETAIL.replace(':slug', relatedPost.slug)} className="read-more">
                        Learn More →
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

export default ProgramDetail;

