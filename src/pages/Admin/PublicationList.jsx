/**
 * Admin Publication List
 * Manage all publications (view, edit, delete)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '@/services/api';
import { ROUTES } from '@/config/constants';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import { Helmet } from 'react-helmet-async';

const AdminPublicationList = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadPublications();
  }, [filter]);

  const loadPublications = async () => {
    try {
      setLoading(true);
      setError(null);

      const publicationsData = await adminAPI.getPublications();

      if (publicationsData.success) {
        let filtered = publicationsData.data || [];
        
        // Filter by active status
        if (filter === 'active') {
          filtered = filtered.filter(pub => pub.is_active !== false);
        } else if (filter === 'inactive') {
          filtered = filtered.filter(pub => pub.is_active === false);
        }
        
        setPublications(filtered);
      }
    } catch (err) {
      console.error('Error loading publications:', err);
      setError(err.message || 'Failed to load publications');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await adminAPI.deletePublication(id);
      if (result.success) {
        toast.success('Publication deleted successfully');
        loadPublications();
      } else {
        toast.error(result.message || 'Failed to delete publication');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete publication');
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading publications..." />;
  }

  return (
    <>
      <Helmet>
        <title>Manage Publications | Admin</title>
      </Helmet>

      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Manage Publications</h1>
            <p className="page-subtitle">Create, edit, and manage your featured publications and partners</p>
          </div>
          <Link to={ROUTES.ADMIN_PUBLICATION_NEW} className="btn btn-primary">
            <span>➕</span> New Publication
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            onClick={() => setFilter('all')}
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          >
            All Publications
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
            <button onClick={loadPublications} className="btn btn-sm btn-outline">
              Retry
            </button>
          </div>
        ) : publications.length > 0 ? (
          <div className="admin-card">
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Logo</th>
                    <th>Articles</th>
                    <th>URL</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {publications.map((publication) => (
                    <tr key={publication.id}>
                      <td data-label="Name">
                        <Link
                          to={ROUTES.ADMIN_PUBLICATION_EDIT.replace(':id', publication.id)}
                          className="table-link"
                        >
                          {publication.name || 'Untitled Publication'}
                        </Link>
                      </td>
                      <td data-label="Logo">
                        {publication.logo ? (
                          <span style={{ fontSize: '1.5em' }}>{publication.logo}</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td data-label="Articles">{publication.articles || 0}</td>
                      <td data-label="URL">
                        {publication.url ? (
                          <a href={publication.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-600)' }}>
                            Link
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td data-label="Order">{publication.display_order || '-'}</td>
                      <td data-label="Status">
                        <span className={`status-badge status-${publication.is_active !== false ? 'published' : 'draft'}`}>
                          {publication.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td data-label="Actions">
                        <div className="table-actions">
                          <Link
                            to={ROUTES.ADMIN_PUBLICATION_EDIT.replace(':id', publication.id)}
                            className="btn btn-sm btn-outline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(publication.id, publication.name || 'Publication')}
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
              <p>No publications found.</p>
              <Link to={ROUTES.ADMIN_PUBLICATION_NEW} className="btn btn-primary">
                Create Your First Publication
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminPublicationList;

