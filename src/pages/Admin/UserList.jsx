/**
 * Admin User List
 * Manage all users (view, add, delete) - Super Admin only
 */

import { useState, useEffect } from 'react';
import { adminAPI } from '@/services/api';
import { ROUTES } from '@/config/constants';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { isValidEmail } from '@/utils/validation';
import { sanitizeInput } from '@/utils/sanitize';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    checkSuperAdmin();
    loadUsers();
  }, []);

  const checkSuperAdmin = async () => {
    try {
      const result = await adminAPI.checkSuperAdmin();
      if (result.success && result.data?.isSuperAdmin) {
        setIsSuperAdmin(true);
      } else {
        // Not super admin - redirect to dashboard
        toast.error('Access denied. Only super admin can manage users.');
        setTimeout(() => {
          window.location.href = ROUTES.ADMIN_DASHBOARD;
        }, 2000);
      }
    } catch (err) {
      console.error('Error checking super admin:', err);
      toast.error('Failed to verify permissions');
      setTimeout(() => {
        window.location.href = ROUTES.ADMIN_DASHBOARD;
      }, 2000);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const usersData = await adminAPI.listUsers();

      if (usersData.success) {
        setUsers(usersData.data || []);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      // Validate password strength
      if (data.password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        return;
      }

      // Sanitize input
      const sanitizedData = sanitizeInput(data);

      const result = await adminAPI.createUser(sanitizedData);

      if (result.success) {
        toast.success('User created successfully');
        reset();
        setShowAddForm(false);
        loadUsers();
      } else {
        toast.error(result.message || 'Failed to create user');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      toast.error(err.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (!window.confirm(`Are you sure you want to delete user "${email}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const result = await adminAPI.deleteUser(id);
      if (result.success) {
        toast.success('User deleted successfully');
        loadUsers();
      } else {
        toast.error(result.message || 'Failed to delete user');
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err.message || 'Failed to delete user');
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading users..." />;
  }

  if (!isSuperAdmin) {
    return (
      <div className="admin-page">
        <div className="admin-alert admin-alert-error">
          <p>Access denied. Only super admin can manage users.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Manage Users | Admin</title>
      </Helmet>

      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Manage Users</h1>
            <p className="page-subtitle">Add and manage admin users</p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn btn-primary"
            >
              <span>➕</span> Add User
            </button>
          )}
        </div>

        {error && (
          <div className="admin-alert admin-alert-error">
            <p>{error}</p>
            <button onClick={loadUsers} className="btn btn-sm btn-outline">
              Retry
            </button>
          </div>
        )}

        {/* Add User Form */}
        {showAddForm && (
          <div className="admin-card" style={{ marginBottom: 'var(--space-8)' }}>
            <div className="card-header">
              <h2>Add New User</h2>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    {...register('email', {
                      required: 'Email is required',
                      validate: (value) => isValidEmail(value) || 'Invalid email address',
                    })}
                    placeholder="user@example.com"
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && (
                    <span className="error-message">{errors.email.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Password *</label>
                  <input
                    type="password"
                    id="password"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 8,
                        message: 'Password must be at least 8 characters',
                      },
                    })}
                    placeholder="Minimum 8 characters"
                    className={errors.password ? 'error' : ''}
                  />
                  {errors.password && (
                    <span className="error-message">{errors.password.message}</span>
                  )}
                  <small>Password must be at least 8 characters long</small>
                </div>

                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    placeholder="User's full name (optional)"
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      reset();
                    }}
                    className="btn btn-outline"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="admin-card">
          <div className="card-header">
            <h2>All Users</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
              {users.length} user{users.length !== 1 ? 's' : ''} total
            </p>
          </div>
          <div className="card-body">
            {users.length > 0 ? (
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id || user.email}>
                        <td data-label="Email">
                          <strong>{user.email}</strong>
                        </td>
                        <td data-label="Name">
                          {user.name || 'N/A'}
                        </td>
                        <td data-label="Type">
                          <span className={`status-badge ${user.is_super_admin ? 'status-published' : 'status-draft'}`}>
                            {user.is_super_admin ? 'Super Admin' : 'Admin'}
                          </span>
                        </td>
                        <td data-label="Created">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td data-label="Actions">
                          {!user.is_super_admin && (
                            <button
                              onClick={() => handleDelete(user.id || user.email, user.email)}
                              className="btn btn-sm btn-danger"
                            >
                              Delete
                            </button>
                          )}
                          {user.is_super_admin && (
                            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                              Cannot delete
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center" style={{ padding: 'var(--space-8)' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No users found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminUserList;

