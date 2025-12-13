/**
 * ScrollToTop Component
 * Scrolls to top of page on route change and handles base path redirects
 */

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Scroll to top instantly when route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });

  }, [pathname]);

  return null;
};

export default ScrollToTop;

