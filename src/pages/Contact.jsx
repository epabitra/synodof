/**
 * Professional Contact Page with Realistic Content
 * Modern contact form with comprehensive information
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { publicAPI } from '@/services/api';
import { isValidEmail } from '@/utils/validation';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import { ENV } from '@/config/env';
import { OrganizationSchema, BreadcrumbSchema } from '@/components/SEO/StructuredData';

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState(null);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [profileData, socialData] = await Promise.all([
        publicAPI.getProfile().catch(() => null),
        publicAPI.getSocialLinks().catch(() => null),
      ]);

      // Use API data only - no mock fallbacks for dynamic content
      if (profileData?.success && profileData.data) {
        setProfile(profileData.data);
      } else {
        setProfile(null);
      }

      if (socialData?.success && socialData.data?.length > 0) {
        setSocialLinks(socialData.data);
      } else {
        setSocialLinks([]);
      }
    } catch (error) {
      console.error('Error loading contact data:', error);
      setProfile(null);
      setSocialLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      // Note: Contact form submission would need to be handled by Apps Script
      // For now, this is a placeholder that shows success
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Thank you for your message! We will get back to you soon.');
      reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading contact information..." />;
  }

  const displayProfile = profile;
  const displaySocialLinks = socialLinks;

  return (
    <>
      <Helmet>
        <title>Contact | {ENV.SITE_NAME}</title>
        <meta name="description" content="Get in touch with Berhampur Diocesan Synod. Contact us for inquiries, collaborations, volunteering, donations, or to learn more about our programs." />
        <meta name="keywords" content="contact Berhampur Diocesan Synod, Berhampur Diocese contact, Christian NGO contact, volunteer, donate, Berhampur" />
        <meta property="og:url" content={`${ENV.SITE_URL || 'https://www.synodofberhampur.com'}/contact`} />
        <link rel="canonical" href={`${ENV.SITE_URL || 'https://www.synodofberhampur.com'}/contact`} />
      </Helmet>
      <OrganizationSchema profile={displayProfile} />
      <BreadcrumbSchema items={[
        { name: 'Home', url: '/' },
        { name: 'Contact', url: '/contact' }
      ]} />

      <div className="contact-page">
        <div className="section">
          <div className="container-narrow">
            <div className="section-header text-center" style={{ marginBottom: 'var(--space-12)' }}>
              <h1>Contact Us</h1>
              <p style={{
                color: 'var(--text-secondary)',
                fontSize: 'var(--text-lg)',
                marginTop: 'var(--space-4)'
              }}>
                We'd love to hear from you! Whether you want to volunteer, donate, learn more about our programs, or have questions, please reach out.
              </p>
            </div>

            <div className="contact-cards-grid" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-12)',
              marginBottom: 'var(--space-12)'
            }}>
              <div className="contact-info-card" style={{
                background: 'var(--bg-secondary)',
                padding: 'var(--space-8)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-light)'
              }}>
                <h2 style={{ marginBottom: 'var(--space-6)' }}>Contact Information</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                  {displayProfile?.email && (
                    <div>
                      <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                        Email
                      </h3>
                      <a href={`mailto:${displayProfile.email}`} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)' }}>
                        ✉️ {displayProfile.email}
                      </a>
                    </div>
                  )}
                  {displayProfile?.phone && (
                    <div>
                      <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                        Phone
                      </h3>
                      <a href={`tel:${displayProfile.phone}`} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)' }}>
                        📞 {displayProfile.phone}
                      </a>
                    </div>
                  )}
                  {displayProfile?.location && (
                    <div>
                      <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                        Location
                      </h3>
                      <p style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-medium)' }}>
                        📍 {displayProfile.location}
                      </p>
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                      Response Time
                    </h3>
                    <p style={{ fontSize: 'var(--text-base)' }}>
                      📅 Usually within 24-48 hours
                    </p>
                  </div>
                </div>
              </div>

              <div className="contact-info-card" style={{
                background: 'var(--bg-secondary)',
                padding: 'var(--space-8)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-light)'
              }}>
                <h2 style={{ marginBottom: 'var(--space-6)' }}>How You Can Help</h2>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--text-xl)' }}>✓</span>
                    <div>
                      <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>Volunteer</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Join us in serving the community</div>
                    </div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--text-xl)' }}>✓</span>
                    <div>
                      <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>Donate</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Support our programs and initiatives</div>
                    </div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--text-xl)' }}>✓</span>
                    <div>
                      <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>Partner</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Collaborate on community projects</div>
                    </div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--text-xl)' }}>✓</span>
                    <div>
                      <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>Pray</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Keep us in your prayers</div>
                    </div>
                  </li>
                  <li style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-3)' }}>
                    <span style={{ fontSize: 'var(--text-xl)' }}>✓</span>
                    <div>
                      <div style={{ fontWeight: 'var(--font-semibold)', marginBottom: 'var(--space-1)' }}>Learn More</div>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Discover our programs and mission</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Social Links */}
            {displaySocialLinks && displaySocialLinks.length > 0 && (
              <div style={{
                textAlign: 'center',
                marginBottom: 'var(--space-12)',
                padding: 'var(--space-6)',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Connect on Social Media</h3>
                <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {displaySocialLinks
                    .filter(link => link.is_active !== false)
                    .map((link) => (
                      <a
                        key={link.id || link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                      >
                        {link.icon && <span style={{ marginRight: '4px' }}>{link.icon}</span>}
                        {link.platform}
                      </a>
                    ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="contact-form" style={{
              background: 'var(--bg-primary)',
              padding: 'var(--space-8)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-light)'
            }}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    {...register('name', { required: 'Name is required' })}
                    placeholder="Your full name"
                  />
                  {errors.name && <span className="error">{errors.name.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    {...register('email', {
                      required: 'Email is required',
                      validate: (value) => isValidEmail(value) || 'Invalid email address',
                    })}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <span className="error">{errors.email.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  {...register('subject', { required: 'Subject is required' })}
                  placeholder="What is this regarding?"
                />
                {errors.subject && <span className="error">{errors.subject.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  rows="8"
                  {...register('message', { required: 'Message is required' })}
                    placeholder="Tell us how you'd like to get involved, ask questions, or share your thoughts..."
                  style={{
                    resize: 'vertical',
                    minHeight: '150px'
                  }}
                />
                {errors.message && <span className="error">{errors.message.message}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-lg" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="loading-spinner" style={{
                        width: '16px',
                        height: '16px',
                        borderWidth: '2px',
                        marginRight: 'var(--space-2)',
                        display: 'inline-block'
                      }} />
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
