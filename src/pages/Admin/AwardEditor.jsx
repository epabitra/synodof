/**
 * Admin Award Editor
 * Create and edit awards/recognition
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { adminAPI } from '@/services/api';
import { ROUTES } from '@/config/constants';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import { Helmet } from 'react-helmet-async';

const AdminAwardEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      award: '',
      organization: '',
      year: new Date().getFullYear(),
      description: '',
      is_active: true,
      display_order: 999,
    },
  });

  // Load award data if editing
  useEffect(() => {
    if (isEditing) {
      loadAward();
    }
  }, [id]);

  const loadAward = async () => {
    try {
      setLoading(true);
      const awardsData = await adminAPI.getAwards();

      if (awardsData.success && awardsData.data) {
        const award = awardsData.data.find(a => String(a.id) === String(id));
        
        if (award) {
          reset({
            award: award.award || award.award_name || '',
            organization: award.organization || '',
            year: award.year || new Date().getFullYear(),
            description: award.description || '',
            is_active: award.is_active !== false,
            display_order: award.display_order !== undefined ? award.display_order : 999,
          });
        } else {
          toast.error('Award not found');
          navigate(ROUTES.ADMIN_AWARDS);
        }
      } else {
        toast.error('Failed to load award');
        navigate(ROUTES.ADMIN_AWARDS);
      }
    } catch (err) {
      console.error('Error loading award:', err);
      toast.error('Failed to load award');
      navigate(ROUTES.ADMIN_AWARDS);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);

      // Prepare award data
      const awardData = {
        award: data.award.trim(),
        organization: data.organization?.trim() || '',
        year: parseInt(data.year) || new Date().getFullYear(),
        description: data.description?.trim() || '',
        is_active: data.is_active !== false,
        display_order: parseFloat(data.display_order) || 999,
      };

      let result;
      if (isEditing) {
        result = await adminAPI.updateAward(id, awardData);
      } else {
        result = await adminAPI.createAward(awardData);
      }

      if (result.success) {
        toast.success(`Award ${isEditing ? 'updated' : 'created'} successfully`);
        navigate(ROUTES.ADMIN_AWARDS);
      } else {
        toast.error(result.message || 'Failed to save award');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save award');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading award..." />;
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Edit Award' : 'New Award'} | Admin</title>
      </Helmet>

      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>{isEditing ? 'Edit Award' : 'Create New Award'}</h1>
            <p className="page-subtitle">
              {isEditing ? 'Update award details' : 'Add a new award or recognition'}
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.ADMIN_AWARDS)}
            className="btn btn-outline"
          >
            ← Back to Awards
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="admin-form">
          {/* Basic Information */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Award Information</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="award">Award Name *</label>
                <input
                  type="text"
                  id="award"
                  {...register('award', { required: 'Award name is required' })}
                  placeholder="e.g., Excellence in Community Service, Recognition for Outstanding Service"
                />
                {errors.award && <span className="error">{errors.award.message}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="organization">Organization</label>
                  <input
                    type="text"
                    id="organization"
                    {...register('organization')}
                    placeholder="e.g., Diocese of Berhampur, Catholic Bishops' Conference"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="year">Year *</label>
                  <input
                    type="number"
                    id="year"
                    {...register('year', { 
                      required: 'Year is required',
                      min: { value: 1900, message: 'Year must be 1900 or later' },
                      max: { value: new Date().getFullYear() + 1, message: 'Year cannot be in the future' }
                    })}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                  {errors.year && <span className="error">{errors.year.message}</span>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  rows="3"
                  {...register('description')}
                  placeholder="Optional description or additional details about this award or recognition"
                />
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
                    Inactive awards won't appear on the website
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(ROUTES.ADMIN_AWARDS)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : isEditing ? 'Update Award' : 'Create Award'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminAwardEditor;

