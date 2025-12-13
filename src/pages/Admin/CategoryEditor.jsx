/**
 * Admin Category Editor
 * Create and edit categories
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { adminAPI } from '@/services/api';
import { ROUTES } from '@/config/constants';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import { Helmet } from 'react-helmet-async';

const AdminCategoryEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      color: '#3b82f6',
      icon: '',
      is_active: true,
      display_order: 999,
    },
  });

  const watchedName = watch('name');

  // Auto-generate slug from name
  useEffect(() => {
    if (watchedName && watchedName.trim() && !isEditing) {
      const slug = watchedName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setValue('slug', slug, { shouldValidate: false });
    }
  }, [watchedName, isEditing, setValue]);

  // Load category data if editing
  useEffect(() => {
    if (isEditing) {
      loadCategory();
    }
  }, [id]);

  const loadCategory = async () => {
    try {
      setLoading(true);
      const categoriesData = await adminAPI.getCategories();

      if (categoriesData.success && categoriesData.data) {
        const category = categoriesData.data.find(cat => String(cat.id) === String(id));
        
        if (category) {
          reset({
            name: category.name || '',
            slug: category.slug || '',
            description: category.description || '',
            color: category.color || '#3b82f6',
            icon: category.icon || '',
            is_active: category.is_active !== false,
            display_order: category.display_order !== undefined ? category.display_order : 999,
          });
        } else {
          toast.error('Category not found');
          navigate(ROUTES.ADMIN_CATEGORIES);
        }
      } else {
        toast.error('Failed to load category');
        navigate(ROUTES.ADMIN_CATEGORIES);
      }
    } catch (err) {
      console.error('Error loading category:', err);
      toast.error('Failed to load category');
      navigate(ROUTES.ADMIN_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);

      // Prepare category data
      const categoryData = {
        name: data.name.trim(),
        slug: data.slug.trim() || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: data.description?.trim() || '',
        color: data.color || '#3b82f6',
        icon: data.icon?.trim() || '',
        is_active: data.is_active !== false,
        display_order: parseFloat(data.display_order) || 999,
      };

      let result;
      if (isEditing) {
        result = await adminAPI.updateCategory(id, categoryData);
      } else {
        result = await adminAPI.createCategory(categoryData);
      }

      if (result.success) {
        toast.success(`Category ${isEditing ? 'updated' : 'created'} successfully`);
        navigate(ROUTES.ADMIN_CATEGORIES);
      } else {
        toast.error(result.message || 'Failed to save category');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading category..." />;
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Edit Category' : 'New Category'} | Admin</title>
      </Helmet>

      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>{isEditing ? 'Edit Category' : 'Create New Category'}</h1>
            <p className="page-subtitle">
              {isEditing ? 'Update category details' : 'Add a new content category'}
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.ADMIN_CATEGORIES)}
            className="btn btn-outline"
          >
            ← Back to Categories
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="admin-form">
          {/* Basic Information */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Basic Information</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="e.g., Community Service, Education, Outreach"
                />
                {errors.name && <span className="error">{errors.name.message}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="slug">Slug *</label>
                <input
                  type="text"
                  id="slug"
                  {...register('slug', { required: 'Slug is required' })}
                  placeholder="url-friendly-slug"
                />
                {errors.slug && <span className="error">{errors.slug.message}</span>}
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                  URL-friendly version (auto-generated from name, but you can edit it)
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows="3"
                  {...register('description')}
                  placeholder="Brief description of this category"
                />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Appearance</h2>
            </div>
            <div className="card-body">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="icon">Icon (Emoji)</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
                    <input
                      type="text"
                      id="icon"
                      {...register('icon')}
                      placeholder="Click an emoji below or type your own"
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
                        '🙏', '✝️', '❤️', '🤝', '📖', '🎓', '🏥', '🏠', 
                        '🌍', '💒', '👥', '🌟', '🕊️', '💝', '📚', '🌱',
                        '🔥', '💡', '⭐', '🏆', '🎯', '🚀', '💬', '📊'
                      ].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setValue('icon', emoji)}
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
                    Click an emoji above or type your own emoji/icon
                  </p>
                </div>

                <div className="form-group">
                  <label htmlFor="color">Color</label>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                    <input
                      type="color"
                      id="color"
                      {...register('color')}
                      style={{ width: '60px', height: '40px', cursor: 'pointer' }}
                    />
                    <input
                      type="text"
                      {...register('color')}
                      placeholder="#3b82f6"
                      style={{ flex: 1 }}
                    />
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                    Color for category badges and filters
                  </p>
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
                    Inactive categories won't appear in filters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(ROUTES.ADMIN_CATEGORIES)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminCategoryEditor;

