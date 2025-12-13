/**
 * Admin Dashboard
 * Overview of posts, stats, and quick actions
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '@/services/api';
import { ROUTES } from '@/config/constants';
import { formatDate } from '@/utils/dateFormatter';
import Loading from '@/components/Loading';
import { Helmet } from 'react-helmet-async';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    recentPosts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load posts for stats
      const postsData = await adminAPI.listPosts({ limit: 10 });

      if (postsData.success) {
        const posts = postsData.data || [];
        const published = posts.filter((p) => p.status === 'published').length;
        const drafts = posts.filter((p) => p.status === 'draft').length;

        setStats({
          totalPosts: posts.length,
          publishedPosts: published,
          draftPosts: drafts,
          recentPosts: posts.slice(0, 5),
        });
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading dashboard..." />;
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard</title>
      </Helmet>

      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Dashboard</h1>
            <p className="page-subtitle">Overview of your content and statistics</p>
          </div>
          <Link to={ROUTES.ADMIN_POST_NEW} className="btn btn-primary">
            <span>➕</span> New Post
          </Link>
        </div>

        {error && (
          <div className="admin-alert admin-alert-error">
            <p>{error}</p>
            <button onClick={loadDashboardData} className="btn btn-sm btn-outline">
              Retry
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <h3 className="stat-label">Total Posts</h3>
              <p className="stat-value">{stats.totalPosts}</p>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3 className="stat-label">Published</h3>
              <p className="stat-value">{stats.publishedPosts}</p>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">📄</div>
            <div className="stat-content">
              <h3 className="stat-label">Drafts</h3>
              <p className="stat-value">{stats.draftPosts}</p>
            </div>
          </div>
        </div>

        {/* Recent Posts */}
        {stats.recentPosts.length > 0 && (
          <div className="admin-card">
            <div className="card-header">
              <h2>Recent Posts</h2>
              <Link to={ROUTES.ADMIN_POSTS} className="btn-link">
                View All →
              </Link>
            </div>
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPosts.map((post) => (
                    <tr key={post.id}>
                      <td data-label="Title">
                        <Link
                          to={`${ROUTES.ADMIN_POSTS}/${post.id}/edit`}
                          className="table-link"
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td data-label="Status">
                        <span className={`status-badge status-${post.status}`}>
                          {post.status}
                        </span>
                      </td>
                      <td data-label="Date">{formatDate(post.published_at || post.created_at)}</td>
                      <td data-label="Actions">
                        <Link
                          to={`${ROUTES.ADMIN_POSTS}/${post.id}/edit`}
                          className="btn btn-sm btn-outline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;

