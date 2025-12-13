/**
 * Main Layout Component
 * Wraps public pages with header and footer
 */

import { Helmet } from 'react-helmet-async';
import Header from './Header';
import Footer from './Footer';
import { ENV } from '@/config/env';

const MainLayout = ({ children, title, description, keywords }) => {
  const pageTitle = title
    ? `${title} | ${ENV.SITE_NAME}`
    : ENV.SITE_NAME;

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        {description && <meta name="description" content={description} />}
        {keywords && <meta name="keywords" content={keywords} />}
        <meta property="og:title" content={pageTitle} />
        {description && <meta property="og:description" content={description} />}
        <meta property="og:type" content="website" />
        {ENV.SITE_URL && <meta property="og:url" content={ENV.SITE_URL} />}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      <div className="app-layout">
        <Header />
        <main className="main-content">{children}</main>
        <Footer />
      </div>
    </>
  );
};

export default MainLayout;

