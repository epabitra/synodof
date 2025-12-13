/**
 * Professional Home Page with Realistic Content
 * Hero section, featured posts, stats, and professional sections
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { publicAPI } from '@/services/api';
import { formatDate } from '@/utils/dateFormatter';
import { ROUTES } from '@/config/constants';
import Loading from '@/components/Loading';
import { ENV } from '@/config/env';
import { ORGANIZATION_NAME, ORGANIZATION_TAGLINE } from '@/config/constants';
import { getSocialIconFromLink } from '@/utils/socialIcons';
import { OrganizationSchema, WebsiteSchema, LocalBusinessSchema } from '@/components/SEO/StructuredData';

const Home = () => {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [awards, setAwards] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [profileData, postsData, socialData, awardsData, publicationsData] = await Promise.all([
        publicAPI.getProfile().catch(() => null),
        publicAPI.listPosts({ limit: 6, featured: 'true', status: 'published' }).catch(() => null),
        publicAPI.getSocialLinks().catch(() => null),
        publicAPI.getAwards().catch(() => null),
        publicAPI.getPublications().catch(() => null),
      ]);

      // Use API data only - no mock fallbacks for dynamic content
      if (profileData?.success && profileData.data) {
        setProfile(profileData.data);
      } else {
        setProfile(null);
      }

      if (postsData?.success && postsData.data?.length > 0) {
        setPosts(postsData.data);
      } else {
        setPosts([]);
      }

      if (socialData?.success && socialData.data?.length > 0) {
        setSocialLinks(socialData.data);
      } else {
        setSocialLinks([]);
      }

      if (awardsData?.success && awardsData.data?.length > 0) {
        setAwards(awardsData.data);
      } else {
        setAwards([]);
      }

      if (publicationsData?.success && publicationsData.data?.length > 0) {
        setPublications(publicationsData.data);
      } else {
        setPublications([]);
      }
    } catch (err) {
      console.error('Error loading home data:', err);
      // Set to null/empty on error - no mock data fallbacks
      setProfile(null);
      setPosts([]);
      setSocialLinks([]);
      setAwards([]);
      setPublications([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading..." />;
  }

  const displayProfile = profile;
  const displayPosts = posts;
  const displaySocialLinks = socialLinks;

  return (
    <>
      <Helmet>
        <title>{ORGANIZATION_NAME} - {ENV.SITE_NAME}</title>
        <meta name="description" content={ORGANIZATION_TAGLINE || 'Walking with Christ on the Synodal Way. A Christian NGO serving the community through faith, hope, and love.'} />
        <meta name="keywords" content="Berhampur Diocesan Synod, Christian NGO, Berhampur Diocese, Christian organization, faith-based services, community programs, Berhampur, Odisha, India" />
        {displayProfile?.profile_image_url && <meta property="og:image" content={displayProfile.profile_image_url} />}
        <meta property="og:url" content={`${ENV.SITE_URL || 'https://www.synodofberhampur.com'}/`} />
        <link rel="canonical" href={`${ENV.SITE_URL || 'https://www.synodofberhampur.com'}/`} />
      </Helmet>
      <OrganizationSchema profile={displayProfile} />
      <WebsiteSchema />
      <LocalBusinessSchema profile={displayProfile} />

      <div className="home-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            {displayProfile.profile_image_url && (
              <div className="hero-image-wrapper">
                <img
                  src={displayProfile.profile_image_url}
                  alt={displayProfile.name || 'Profile'}
                  className="hero-image"
                />
              </div>
            )}
            <div className="hero-text">
              <h1>{ORGANIZATION_NAME}</h1>
              <p className="headline">{ORGANIZATION_TAGLINE}</p>
              <p className="bio">
                {displayProfile.short_bio || displayProfile.bio || 'A Christian NGO dedicated to serving the community through faith, hope, and love. We walk together in Christ, building a better world through our synodal journey.'}
              </p>
              
              {displaySocialLinks && displaySocialLinks.length > 0 && (
                <div className="hero-social-links">
                  {displaySocialLinks
                    .filter(link => link.is_active !== false)
                    .slice(0, 5)
                    .map((link) => (
                      <a
                        key={link.id || link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hero-social-link"
                        aria-label={link.platform}
                      >
                        <span style={{ marginRight: '6px' }}>{getSocialIconFromLink(link)}</span>
                        {link.platform}
                      </a>
                    ))}
                </div>
              )}

              <div className="hero-actions">
                <Link to={ROUTES.ABOUT} className="btn btn-primary btn-lg">
                  Learn About Us
                </Link>
                <Link 
                  to={ROUTES.BLOG} 
                  className="btn btn-outline btn-lg" 
                  style={{ 
                    color: 'white', 
                    borderColor: 'white',
                    background: 'transparent'
                  }}
                >
                  News & Updates
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-8)',
              textAlign: 'center'
            }}>
              {displayProfile?.total_stories !== undefined && displayProfile?.total_stories !== null && (
                <div className="stat-card">
                  <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 'var(--font-bold)', color: 'var(--primary-600)', marginBottom: 'var(--space-2)' }}>
                    {displayProfile.total_stories}+
                  </div>
                  <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>Projects/Programs</div>
                </div>
              )}
              {displayProfile?.countries_covered !== undefined && displayProfile?.countries_covered !== null && (
                <div className="stat-card">
                  <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 'var(--font-bold)', color: 'var(--primary-600)', marginBottom: 'var(--space-2)' }}>
                    {displayProfile.countries_covered}+
                  </div>
                  <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>Communities Served</div>
                </div>
              )}
              {displayProfile?.awards_count !== undefined && displayProfile?.awards_count !== null && (
                <div className="stat-card">
                  <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 'var(--font-bold)', color: 'var(--primary-600)', marginBottom: 'var(--space-2)' }}>
                    {displayProfile.awards_count}+
                  </div>
                  <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>Awards & Recognition</div>
                </div>
              )}
              {displayProfile?.years_experience !== undefined && displayProfile?.years_experience !== null && (
                <div className="stat-card">
                  <div style={{ fontSize: 'var(--text-5xl)', fontWeight: 'var(--font-bold)', color: 'var(--primary-600)', marginBottom: 'var(--space-2)' }}>
                    {displayProfile.years_experience}+
                  </div>
                  <div style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)' }}>Years of Service</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Posts Section */}
        {displayPosts && displayPosts.length > 0 ? (
          <section className="section">
            <div className="container">
              <div className="section-header text-center" style={{ marginBottom: 'var(--space-12)' }}>
                <h2>Latest News & Updates</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-4)', fontSize: 'var(--text-lg)' }}>
                  Stay informed about our programs, events, and community initiatives
                </p>
              </div>

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
                      <h3>
                        <Link to={`${ROUTES.BLOG}/${post.slug}`}>{post.title}</Link>
                      </h3>
                      {post.subtitle && (
                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)', fontStyle: 'italic' }}>
                          {post.subtitle}
                        </p>
                      )}
                      {post.excerpt && (
                        <p className="post-excerpt">{post.excerpt}</p>
                      )}
                      {post.read_time_minutes && (
                        <div className="post-meta mt-4" style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
                          <span className="read-time">{post.read_time_minutes} min read</span>
                          {post.view_count && (
                            <span style={{ marginLeft: 'var(--space-3)' }}>👁️ {post.view_count.toLocaleString()} views</span>
                          )}
                        </div>
                      )}
                      <Link to={`${ROUTES.BLOG}/${post.slug}`} className="read-more">
                        Read More →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="text-center" style={{ marginTop: 'var(--space-12)' }}>
                <Link to={ROUTES.BLOG} className="btn btn-primary btn-lg">
                  View All Posts
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <section className="section">
            <div className="container">
              <div className="text-center" style={{ padding: 'var(--space-12)' }}>
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                  No posts yet. Check back soon for new updates!
                </p>
                <Link to={ROUTES.BLOG} className="btn btn-primary">
                  View Blog
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Awards Section */}
        {awards && awards.length > 0 && (
          <section className="section" style={{ background: 'var(--bg-secondary)' }}>
            <div className="container">
              <div className="section-header text-center" style={{ marginBottom: 'var(--space-12)' }}>
                <h2>Awards & Recognition</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-4)' }}>
                  Recognized for excellence in community service
                </p>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-6)'
              }}>
                {awards.slice(0, 4).map((award, index) => (
                  <div key={award.id || index} className="card" style={{ 
                    textAlign: 'center', 
                    padding: 'var(--space-6)',
                    animation: `fadeIn 0.6s ease-out ${index * 0.15}s both`
                  }}>
                    <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>🏆</div>
                    <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
                      {award.award || award.award_name || 'Award'}
                    </div>
                    {award.organization && (
                      <div style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                        {award.organization}
                      </div>
                    )}
                    {award.year && (
                      <div style={{ color: 'var(--primary-600)', fontWeight: 'var(--font-semibold)' }}>
                        {award.year}
                      </div>
                    )}
                    {award.description && (
                      <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', marginTop: 'var(--space-2)' }}>
                        {award.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Publications Section */}
        {publications && publications.length > 0 && (
          <section className="section">
            <div className="container">
              <div className="section-header text-center" style={{ marginBottom: 'var(--space-12)' }}>
                <h2>Featured Publications & Partners</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-4)' }}>
                  Our work has been featured in leading publications and partner organizations
                </p>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-6)',
                alignItems: 'center'
              }}>
                {publications.map((pub, index) => (
                  <div key={pub.id || index} className="card" style={{ 
                    textAlign: 'center', 
                    padding: 'var(--space-6)',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-light)',
                    animation: `fadeIn 0.6s ease-out ${index * 0.1}s both`
                  }}>
                    {pub.logo && (
                      <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-3)' }}>
                        {pub.logo}
                      </div>
                    )}
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                      {pub.name || 'Publication'}
                    </div>
                    {pub.articles !== undefined && pub.articles !== null && (
                      <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                        {pub.articles} {pub.articles === 1 ? 'article' : 'articles'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Mission & Values Section */}
        <section className="section" style={{ background: 'var(--bg-secondary)' }}>
          <div className="container">
            <div className="section-header text-center" style={{ marginBottom: 'var(--space-12)' }}>
              <h2>Our Mission & Values</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-4)' }}>
                Guided by faith, driven by love, committed to service
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--space-6)'
            }}>
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>✝️</div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
                  Faith
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  Rooted in Christian values and teachings
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>❤️</div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
                  Love
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  Serving with compassion and care
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>🤝</div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
                  Community
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  Building stronger communities together
                </div>
              </div>
              <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-4)' }}>🌟</div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', marginBottom: 'var(--space-2)' }}>
                  Hope
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  Inspiring hope for a better tomorrow
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section className="section">
          <div className="container">
            <div className="section-header text-center" style={{ marginBottom: 'var(--space-12)' }}>
              <h2>Our Programs</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-4)' }}>
                Making a difference through various community initiatives
              </p>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-6)',
              alignItems: 'center'
            }}>
              <div className="card" style={{ 
                textAlign: 'center', 
                padding: 'var(--space-6)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-3)' }}>📚</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                  Education
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Empowering through knowledge
                </div>
              </div>
              <div className="card" style={{ 
                textAlign: 'center', 
                padding: 'var(--space-6)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-3)' }}>🏥</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                  Healthcare
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Caring for the community
                </div>
              </div>
              <div className="card" style={{ 
                textAlign: 'center', 
                padding: 'var(--space-6)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-3)' }}>👥</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                  Youth Programs
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Nurturing future leaders
                </div>
              </div>
              <div className="card" style={{ 
                textAlign: 'center', 
                padding: 'var(--space-6)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-light)'
              }}>
                <div style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-3)' }}>🙏</div>
                <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-2)' }}>
                  Spiritual Growth
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                  Deepening faith together
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="section" style={{ background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--accent-700) 100%)', color: 'white' }}>
          <div className="container text-center">
            <h2 style={{ color: 'white', marginBottom: 'var(--space-4)' }}>Join Us in Our Mission</h2>
            <p style={{ maxWidth: '600px', margin: '0 auto var(--space-8)', fontSize: 'var(--text-lg)', color: 'rgba(255,255,255,0.9)' }}>
              Together, we can make a difference. Whether you want to volunteer, donate, or learn more about our programs, we'd love to hear from you.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to={ROUTES.CONTACT} className="btn btn-primary btn-lg" style={{ background: 'white', color: 'var(--primary-600)' }}>
                Get In Touch
              </Link>
              <Link 
                to={ROUTES.PORTFOLIO} 
                className="btn btn-outline btn-lg" 
                style={{ 
                  color: 'white', 
                  borderColor: 'white',
                  background: 'transparent'
                }}
              >
                Our Programs
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
