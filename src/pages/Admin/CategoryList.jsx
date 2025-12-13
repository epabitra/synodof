/**
 * Admin Category List
 * Manage all categories (view, edit, delete)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '@/services/api';
import { ROUTES } from '@/config/constants';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import { Helmet } from 'react-helmet-async';

const AdminCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadCategories();
  }, [filter]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const categoriesData = await adminAPI.getCategories();

      if (categoriesData.success) {
        let filtered = categoriesData.data || [];
        
        // Filter by active status
        if (filter === 'active') {
          filtered = filtered.filter(cat => cat.is_active !== false);
        } else if (filter === 'inactive') {
          filtered = filtered.filter(cat => cat.is_active === false);
        }
        
        setCategories(filtered);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await adminAPI.deleteCategory(id);
      if (result.success) {
        toast.success('Category deleted successfully');
        loadCategories();
      } else {
        toast.error(result.message || 'Failed to delete category');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading categories..." />;
  }

  return (
    <>
      <Helmet>
        <title>Manage Categories | Admin</title>
      </Helmet>

      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Manage Categories</h1>
            <p className="page-subtitle">Create, edit, and manage your content categories</p>
          </div>
          <Link to={ROUTES.ADMIN_CATEGORY_NEW} className="btn btn-primary">
            <span>➕</span> New Category
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            onClick={() => setFilter('all')}
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          >
            All Categories
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`filter-tab ${filter === 'inactive' ? 'active' : ''}`}
          >
            Inactive
          </button>
        </div>

        {error ? (
          <div className="admin-alert admin-alert-error">
            <p>{error}</p>
            <button onClick={loadCategories} className="btn btn-sm btn-outline">
              Retry
            </button>
          </div>
        ) : categories.length > 0 ? (
          <div className="admin-card">
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Icon</th>
                    <th>Color</th>
                    <th>Order</th>
                    <th>Posts</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category.id}>
                      <td data-label="Name">
                        <Link
                          to={`${ROUTES.ADMIN_CATEGORIES}/${category.id}/edit`}
                          className="table-link"
                        >
                          {category.name}
                        </Link>
                      </td>
                      <td data-label="Slug">{category.slug || '-'}</td>
                      <td data-label="Icon">
                        {category.icon ? (
                          <span style={{ fontSize: '1.5em' }}>{category.icon}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td data-label="Color">
                        {category.color ? (
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              backgroundColor: category.color,
                              borderRadius: '4px',
                              border: '1px solid var(--border-light)',
                            }}
                            title={category.color}
                          />
                        ) : (
                          '-'
                        )}
                      </td>
                      <td data-label="Order">{category.display_order || '-'}</td>
                      <td data-label="Posts">{category.post_count || 0}</td>
                      <td data-label="Status">
                        <span className={`status-badge status-${category.is_active !== false ? 'published' : 'draft'}`}>
                          {category.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td data-label="Actions">
                        <div className="table-actions">
                          <Link
                            to={`${ROUTES.ADMIN_CATEGORIES}/${category.id}/edit`}
                            className="btn btn-sm btn-outline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(category.id, category.name)}
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
              <p>No categories found.</p>
              <Link to={ROUTES.ADMIN_CATEGORY_NEW} className="btn btn-primary">
                Create Your First Category
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminCategoryList;

