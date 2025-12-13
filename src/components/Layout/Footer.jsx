/**
 * Professional Footer Component
 * Modern footer with branding, skills, links, and contact info
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '@/services/api';
import { ROUTES } from '@/config/constants';
import { getSocialIconFromLink } from '@/utils/socialIcons';

const Footer = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    loadFooterData();
    
    // Handle scroll to show/hide scroll-to-top button
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadFooterData = async () => {
    try {
      const [socialData, profileData, categoriesData] = await Promise.all([
        publicAPI.getSocialLinks().catch(() => null),
        publicAPI.getProfile().catch(() => null),
        publicAPI.getCategories().catch(() => null),
      ]);

      if (socialData?.success) {
        setSocialLinks(socialData.data || []);
      }
      if (profileData?.success) {
        setProfile(profileData.data);
      }
      if (categoriesData?.success) {
        setCategories(categoriesData.data || []);
      }
    } catch (error) {
      console.error('Error loading footer data:', error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const footerLinks = [
    { path: ROUTES.HOME, label: 'Home' },
    { path: ROUTES.PORTFOLIO, label: 'Programs' },
    { path: ROUTES.ABOUT, label: 'About Us' },
    { path: ROUTES.BLOG, label: 'News & Updates' },
    { path: ROUTES.CONTACT, label: 'Contact' },
  ];

  // Static fallback content
  const staticBio = 'I am a Journalist, Activist, Campaigner, Writer, and Documentary Filmmaker from Odisha, India, dedicated to Development Communication. My work blends development journalism with grassroots activism to highlight real issues and inspire change.';
  const staticMobile = '7735020144';
  const staticEmail = 'synodofberhampur@gmail.com';

  const displayName = profile?.name || 'Berhampur Diocesan Synod';
  const displayBio = profile?.short_bio || profile?.bio || staticBio;
  const displayEmail = profile?.email || staticEmail;
  const displayLocation = profile?.location || '';
  const displayPhone = profile?.phone || staticMobile;

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            {/* Column 1: Branding */}
            <div className="footer-section footer-brand">
              <h3 className="footer-brand-title">{displayName.toUpperCase()}</h3>
              <p className="footer-brand-description">{displayBio}</p>
              {socialLinks.length > 0 && (
                <div className="footer-social-icons">
                  {socialLinks
                    .filter(link => link.is_active !== false)
                    .slice(0, 4)
                    .map((link) => (
                      <a
                        key={link.id || link.platform}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="footer-social-icon"
                        aria-label={link.platform}
                      >
                        <span className="social-icon-emoji">{getSocialIconFromLink(link)}</span>
                      </a>
                    ))}
                </div>
              )}
            </div>

            {/* Column 2: Programs/Initiatives */}
            <div className="footer-section">
              <h3 className="footer-section-title">Our Programs</h3>
              <ul className="footer-list">
                {categories.length > 0 ? (
                  categories
                    .filter(cat => cat.is_active !== false)
                    .slice(0, 5)
                    .map((category) => (
                      <li key={category.id || category.slug}>
                        <Link to={`${ROUTES.BLOG}?category=${encodeURIComponent(category.name || category.slug)}`}>
                          <span className="footer-list-arrow">→</span>
                          {category.name}
                        </Link>
                      </li>
                    ))
                ) : (
                  <>
                    <li><span className="footer-list-arrow">→</span>Community Service</li>
                    <li><span className="footer-list-arrow">→</span>Education</li>
                    <li><span className="footer-list-arrow">→</span>Healthcare</li>
                    <li><span className="footer-list-arrow">→</span>Youth Programs</li>
                    <li><span className="footer-list-arrow">→</span>Spiritual Growth</li>
                  </>
                )}
              </ul>
            </div>

            {/* Column 3: Quick Links */}
            <div className="footer-section">
              <h3 className="footer-section-title">Quick Links</h3>
              <ul className="footer-list">
                {footerLinks.map((link) => (
                  <li key={link.path}>
                    <Link to={link.path}>
                      <span className="footer-list-arrow">→</span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Address/Contact */}
            <div className="footer-section">
              <h3 className="footer-section-title">Contact Us</h3>
              <div className="footer-contact">
                {displayLocation && (
                  <div className="footer-contact-item">
                    <span className="footer-contact-label">Location:</span>
                    <span className="footer-contact-value">{displayLocation}</span>
                  </div>
                )}
                {!displayLocation && (
                  <div className="footer-contact-item">
                    <span className="footer-contact-label">Address:</span>
                    <span className="footer-contact-value">Bishop's House, Berhampur<br />NH-16, Narendrapur, Ganjam-760007<br />Odisha, India</span>
                  </div>
                )}
                {/* Always show mobile and email (static or from profile) */}
                <div className="footer-contact-item">
                  <span className="footer-contact-icon">📞</span>
                  <a href={`tel:${displayPhone}`} className="footer-contact-value footer-contact-link">
                    {displayPhone}
                  </a>
                </div>
                <div className="footer-contact-item">
                  <span className="footer-contact-icon">✉️</span>
                  <a href={`mailto:${displayEmail}`} className="footer-contact-value footer-contact-link">
                    {displayEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>
              &copy; {currentYear} {displayName}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button 
        className={`scroll-to-top ${showScrollTop ? 'show' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
      >
        <span className="scroll-to-top-icon">↑</span>
      </button>
    </>
  );
};

export default Footer;
