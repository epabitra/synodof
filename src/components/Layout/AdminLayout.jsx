/**
 * Admin Layout Component
 * Professional sidebar navigation layout for admin panel
 */

import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/config/constants';

const AdminLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px is typically the breakpoint for tablets
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.ADMIN_LOGIN);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const menuItems = [
    {
      path: ROUTES.ADMIN_DASHBOARD,
      label: 'Dashboard',
      icon: '📊',
    },
    {
      path: ROUTES.ADMIN_POSTS,
      label: 'Posts',
      icon: '📝',
    },
    {
      path: ROUTES.ADMIN_POST_NEW,
      label: 'New Post',
      icon: '➕',
    },
    {
      path: ROUTES.ADMIN_CATEGORIES,
      label: 'Categories',
      icon: '🏷️',
    },
    {
      path: ROUTES.ADMIN_AWARDS,
      label: 'Awards',
      icon: '🏆',
    },
    {
      path: ROUTES.ADMIN_PUBLICATIONS,
      label: 'Publications',
      icon: '📰',
    },
    {
      path: ROUTES.ADMIN_PROFILE,
      label: 'Edit Profile',
      icon: '👤',
    },
  ];

  return (
    <div className="admin-layout">
      {/* Mobile Menu Toggle */}
      <button
        className="admin-mobile-menu-toggle"
        onClick={() => {
          setMobileMenuOpen(!mobileMenuOpen);
          setSidebarOpen(!mobileMenuOpen);
        }}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="admin-mobile-overlay"
          onClick={() => {
            setMobileMenuOpen(false);
            setSidebarOpen(false);
          }}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'} ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">
            <span className="logo-icon">✍️</span>
            {(sidebarOpen || mobileMenuOpen) && <span className="logo-text">Admin Panel</span>}
          </h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => {
                    // Only close sidebar on mobile/tablet, not on desktop
                    if (isMobile) {
                      setMobileMenuOpen(false);
                      setSidebarOpen(false);
                    } else {
                      // On desktop, only close mobile menu if it's open, but keep sidebar open
                      setMobileMenuOpen(false);
                    }
                  }}
                >
                  <span className="nav-icon">{item.icon}</span>
                  {(sidebarOpen || mobileMenuOpen) && <span className="nav-label">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          {(sidebarOpen || mobileMenuOpen) && user && (
            <div className="user-info">
              <div className="user-avatar">
                {user.email?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="user-details">
                <p className="user-name">{user.name || 'Admin'}</p>
                <p className="user-email">{user.email}</p>
              </div>
            </div>
          )}
          <button 
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }} 
            className="logout-btn"
          >
            <span className="logout-icon">🚪</span>
            {(sidebarOpen || mobileMenuOpen) && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;



