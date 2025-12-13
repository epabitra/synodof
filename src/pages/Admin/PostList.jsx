/**
 * Admin Post List
 * Manage all posts (view, edit, delete)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '@/services/api';
import { ROUTES, POST_STATUS } from '@/config/constants';
import { formatDate } from '@/utils/dateFormatter';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import { Helmet } from 'react-helmet-async';

const AdminPostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filter !== 'all') {
        params.status = filter;
      }

      const postsData = await adminAPI.listPosts(params);

      if (postsData.success) {
        setPosts(postsData.data || []);
      }
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      const result = await adminAPI.deletePost(id);
      if (result.success) {
        toast.success('Post deleted successfully');
        loadPosts();
      } else {
        toast.error(result.message || 'Failed to delete post');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete post');
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading posts..." />;
  }

  return (
    <>
      <Helmet>
        <title>Manage Posts | Admin</title>
      </Helmet>

      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Manage Posts</h1>
            <p className="page-subtitle">Create, edit, and manage your blog posts</p>
          </div>
          <Link to={ROUTES.ADMIN_POST_NEW} className="btn btn-primary">
            <span>➕</span> New Post
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            onClick={() => setFilter('all')}
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          >
            All Posts
          </button>
          <button
            onClick={() => setFilter(POST_STATUS.PUBLISHED)}
            className={`filter-tab ${filter === POST_STATUS.PUBLISHED ? 'active' : ''}`}
          >
            Published
          </button>
          <button
            onClick={() => setFilter(POST_STATUS.DRAFT)}
            className={`filter-tab ${filter === POST_STATUS.DRAFT ? 'active' : ''}`}
          >
            Drafts
          </button>
        </div>

        {error ? (
          <div className="admin-alert admin-alert-error">
            <p>{error}</p>
            <button onClick={loadPosts} className="btn btn-sm btn-outline">
              Retry
            </button>
          </div>
        ) : posts.length > 0 ? (
          <div className="admin-card">
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
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
                      <td data-label="Category">{post.category || '-'}</td>
                      <td data-label="Date">{formatDate(post.published_at || post.created_at)}</td>
                      <td data-label="Actions">
                        <div className="table-actions">
                          <Link
                            to={`${ROUTES.ADMIN_POSTS}/${post.id}/edit`}
                            className="btn btn-sm btn-outline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id, post.title)}
                            className="btn btn-sm btn-danger"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="admin-card">
            <div className="empty-state">
              <p>No posts found.</p>
              <Link to={ROUTES.ADMIN_POST_NEW} className="btn btn-primary">
                Create Your First Post
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPostList;

