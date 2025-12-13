/**
 * Admin Publication Editor
 * Create and edit publications/partners
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { adminAPI } from '@/services/api';
import { ROUTES } from '@/config/constants';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import { Helmet } from 'react-helmet-async';

const AdminPublicationEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      logo: '',
      articles: 0,
      url: '',
      is_active: true,
      display_order: 999,
    },
  });

  // Load publication data if editing
  useEffect(() => {
    if (isEditing) {
      loadPublication();
    }
  }, [id]);

  const loadPublication = async () => {
    try {
      setLoading(true);
      const publicationsData = await adminAPI.getPublications();

      if (publicationsData.success && publicationsData.data) {
        const publication = publicationsData.data.find(p => String(p.id) === String(id));
        
        if (publication) {
          reset({
            name: publication.name || '',
            logo: publication.logo || '',
            articles: publication.articles || 0,
            url: publication.url || '',
            is_active: publication.is_active !== false,
            display_order: publication.display_order !== undefined ? publication.display_order : 999,
          });
        } else {
          toast.error('Publication not found');
          navigate(ROUTES.ADMIN_PUBLICATIONS);
        }
      } else {
        toast.error('Failed to load publication');
        navigate(ROUTES.ADMIN_PUBLICATIONS);
      }
    } catch (err) {
      console.error('Error loading publication:', err);
      toast.error('Failed to load publication');
      navigate(ROUTES.ADMIN_PUBLICATIONS);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);

      // Prepare publication data
      const publicationData = {
        name: data.name.trim(),
        logo: data.logo?.trim() || '',
        articles: parseInt(data.articles) || 0,
        url: data.url?.trim() || '',
        is_active: data.is_active !== false,
        display_order: parseFloat(data.display_order) || 999,
      };

      let result;
      if (isEditing) {
        result = await adminAPI.updatePublication(id, publicationData);
      } else {
        result = await adminAPI.createPublication(publicationData);
      }

      if (result.success) {
        toast.success(`Publication ${isEditing ? 'updated' : 'created'} successfully`);
        navigate(ROUTES.ADMIN_PUBLICATIONS);
      } else {
        toast.error(result.message || 'Failed to save publication');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save publication');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading publication..." />;
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Edit Publication' : 'New Publication'} | Admin</title>
      </Helmet>

      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>{isEditing ? 'Edit Publication' : 'Create New Publication'}</h1>
            <p className="page-subtitle">
              {isEditing ? 'Update publication details' : 'Add a new publication or partner organization'}
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.ADMIN_PUBLICATIONS)}
            className="btn btn-outline"
          >
            ← Back to Publications
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="admin-form">
          {/* Basic Information */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Publication Information</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="name">Publication/Partner Name *</label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Publication name is required' })}
                  placeholder="e.g., Catholic News Agency, Vatican News"
                />
                {errors.name && <span className="error">{errors.name.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="logo">Logo (Emoji or Image URL)</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    id="logo"
                    {...register('logo')}
                    placeholder="Click an emoji below or enter emoji/image URL"
                    style={{ flex: 1, minWidth: '200px' }}
                  />
                  <div style={{ 
                    display: 'flex', 
                    gap: 'var(--space-2)', 
                    flexWrap: 'wrap',
                    padding: 'var(--space-2)',
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    maxWidth: '100%'
                  }}>
                    {[
                      '📰', '📖', '📺', '📡', '💒', '✝️', '🙏', '📚',
                      '🌍', '🤝', '💝', '🌟', '⭐', '🏆', '🎯', '💡'
                    ].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setValue('logo', emoji)}
                        style={{
                          fontSize: '1.5em',
                          padding: 'var(--space-2)',
                          background: 'white',
                          border: '2px solid var(--border-light)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          minWidth: '40px',
                          height: '40px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = 'var(--primary-600)';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = 'var(--border-light)';
                          e.target.style.transform = 'scale(1)';
                        }}
                        title={`Click to use ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                  Click an emoji above or enter your own emoji/image URL
                </p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="articles">Number of Articles/Projects</label>
                  <input
                    type="number"
                    id="articles"
                    {...register('articles', { valueAsNumber: true, min: 0 })}
                    min="0"
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="url">URL (Optional)</label>
                  <input
                    type="url"
                    id="url"
                    {...register('url')}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Settings</h2>
            </div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="display_order">Display Order</label>
                  <input
                    type="number"
                    id="display_order"
                    {...register('display_order', { valueAsNumber: true })}
                    min="0"
                    placeholder="999"
                  />
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                    Lower numbers appear first (default: 999)
                  </p>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      {...register('is_active')}
                      style={{ margin: 0, width: "auto", cursor: 'pointer' }}
                    />
                    <span>Active</span>
                  </label>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                    Inactive publications won't appear on the website
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(ROUTES.ADMIN_PUBLICATIONS)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : isEditing ? 'Update Publication' : 'Create Publication'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminPublicationEditor;

