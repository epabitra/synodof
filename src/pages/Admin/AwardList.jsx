/**
 * Admin Award List
 * Manage all awards (view, edit, delete)
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '@/services/api';
import { ROUTES } from '@/config/constants';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import { Helmet } from 'react-helmet-async';

const AdminAwardList = () => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAwards();
  }, [filter]);

  const loadAwards = async () => {
    try {
      setLoading(true);
      setError(null);

      const awardsData = await adminAPI.getAwards();

      if (awardsData.success) {
        let filtered = awardsData.data || [];
        
        // Filter by active status
        if (filter === 'active') {
          filtered = filtered.filter(award => award.is_active !== false);
        } else if (filter === 'inactive') {
          filtered = filtered.filter(award => award.is_active === false);
        }
        
        setAwards(filtered);
      }
    } catch (err) {
      console.error('Error loading awards:', err);
      setError(err.message || 'Failed to load awards');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await adminAPI.deleteAward(id);
      if (result.success) {
        toast.success('Award deleted successfully');
        loadAwards();
      } else {
        toast.error(result.message || 'Failed to delete award');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete award');
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading awards..." />;
  }

  return (
    <>
      <Helmet>
        <title>Manage Awards | Admin</title>
      </Helmet>

      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Manage Awards</h1>
            <p className="page-subtitle">Create, edit, and manage your awards & recognition</p>
          </div>
          <Link to={ROUTES.ADMIN_AWARD_NEW} className="btn btn-primary">
            <span>➕</span> New Award
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            onClick={() => setFilter('all')}
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          >
            All Awards
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
            <button onClick={loadAwards} className="btn btn-sm btn-outline">
              Retry
            </button>
          </div>
        ) : awards.length > 0 ? (
          <div className="admin-card">
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Award</th>
                    <th>Organization</th>
                    <th>Year</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {awards.map((award) => (
                    <tr key={award.id}>
                      <td data-label="Award">
                        <Link
                          to={ROUTES.ADMIN_AWARD_EDIT.replace(':id', award.id)}
                          className="table-link"
                        >
                          {award.award || award.award_name || 'Untitled Award'}
                        </Link>
                      </td>
                      <td data-label="Organization">{award.organization || '-'}</td>
                      <td data-label="Year">{award.year || '-'}</td>
                      <td data-label="Order">{award.display_order || '-'}</td>
                      <td data-label="Status">
                        <span className={`status-badge status-${award.is_active !== false ? 'published' : 'draft'}`}>
                          {award.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td data-label="Actions">
                        <div className="table-actions">
                          <Link
                            to={ROUTES.ADMIN_AWARD_EDIT.replace(':id', award.id)}
                            className="btn btn-sm btn-outline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(award.id, award.award || award.award_name || 'Award')}
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
              <p>No awards found.</p>
              <Link to={ROUTES.ADMIN_AWARD_NEW} className="btn btn-primary">
                Create Your First Award
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminAwardList;

