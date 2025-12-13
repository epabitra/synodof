/**
 * Admin Profile Editor
 * Edit profile information and manage social media links
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { adminAPI } from '@/services/api';
import { firebaseStorageService } from '@/services/firebaseStorage';
import { ROUTES, SUCCESS_MESSAGES } from '@/config/constants';
import { sanitizeInput } from '@/utils/sanitize';
import { validatePasswordStrength } from '@/utils/validation';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/context/AuthContext';

const ProfileEditor = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [profileImagePreview, setProfileImagePreview] = useState('');
  const [socialLinks, setSocialLinks] = useState([]);
  const [showAddSocialLink, setShowAddSocialLink] = useState(false);
  const [editingSocialLink, setEditingSocialLink] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: '',
      title: '',
      bio: '',
      short_bio: '',
      profile_image_url: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      awards: '',
      education: '',
      experience: '',
      specializations: '',
      languages: '',
      total_stories: '',
      countries_covered: '',
      awards_count: '',
      years_experience: '',
    },
  });

  const watchedProfileImage = watch('profile_image_url');

  // Load profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  // Update preview when profile image URL changes
  useEffect(() => {
    if (watchedProfileImage) {
      setProfileImagePreview(watchedProfileImage);
    }
  }, [watchedProfileImage]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      const [profileData, socialData] = await Promise.all([
        adminAPI.getProfile().catch(() => null),
        adminAPI.listSocialLinks().catch(() => null),
      ]);

      if (profileData?.success && profileData.data) {
        const profile = profileData.data;
        reset({
          name: profile.name || '',
          title: profile.title || '',
          bio: profile.bio || '',
          short_bio: profile.short_bio || '',
          profile_image_url: profile.profile_image_url || '',
          email: profile.email || '',
          phone: profile.phone || '',
          location: profile.location || '',
          website: profile.website || '',
          awards: profile.awards || '',
          education: profile.education || '',
          experience: profile.experience || '',
          specializations: profile.specializations || '',
          languages: profile.languages || '',
          total_stories: profile.total_stories || '',
          countries_covered: profile.countries_covered || '',
          awards_count: profile.awards_count || '',
          years_experience: profile.years_experience || '',
        });
        if (profile.profile_image_url) {
          setProfileImagePreview(profile.profile_image_url);
        }
      }

      if (socialData?.success && socialData.data) {
        setSocialLinks(socialData.data || []);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Check if Firebase is configured, otherwise fallback to API
      if (firebaseStorageService.isConfigured()) {
        const url = await firebaseStorageService.uploadImage(file, {
          folder: 'profile-images',
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
        });

        setValue('profile_image_url', url);
        setProfileImagePreview(url);
      } else {
        // Fallback to API upload
        const result = await adminAPI.uploadMedia(file, (progress) => {
          setUploadProgress(progress);
        });

        if (result.success && result.data) {
          const url = result.data.url || result.data.public_url;
          setValue('profile_image_url', url);
          setProfileImagePreview(url);
        } else {
          throw new Error('File upload failed');
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.message || 'File upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);

      // Sanitize input
      const sanitizedData = sanitizeInput(data);

      const result = await adminAPI.updateProfile(sanitizedData);

      if (result.success) {
        toast.success(SUCCESS_MESSAGES.PROFILE_UPDATED);
        // Reload data to get any server-side updates
        await loadProfileData();
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSocialLink = async (linkData) => {
    try {
      console.log('Adding social link with data:', linkData);
      const sanitizedData = sanitizeInput(linkData);
      
      // Set default values - ensure proper types
      const dataToSubmit = {
        platform: String(sanitizedData.platform || '').trim(),
        url: String(sanitizedData.url || '').trim(),
        icon: String(sanitizedData.icon || sanitizedData.platform || '').trim(),
        display_order: sanitizedData.display_order ? Number(sanitizedData.display_order) : (socialLinks.length + 1),
        is_active: sanitizedData.is_active !== false && sanitizedData.is_active !== 'false' && sanitizedData.is_active !== 0,
      };

      // Validate required fields
      if (!dataToSubmit.platform || !dataToSubmit.url) {
        toast.error('Platform and URL are required');
        return;
      }

      console.log('Submitting social link data:', dataToSubmit);
      const result = await adminAPI.createSocialLink(dataToSubmit);
      console.log('API response:', result);

      if (result.success) {
        toast.success(SUCCESS_MESSAGES.SOCIAL_LINK_CREATED);
        setShowAddSocialLink(false);
        // Reload to get the new link
        await loadProfileData();
      } else {
        const errorMsg = result.message || result.error?.message || 'Failed to add social link';
        console.error('API returned error:', errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Add social link error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response,
        data: err.response?.data,
      });
      toast.error(err.message || 'Failed to add social link. Check browser console for details.');
    }
  };

  const handleUpdateSocialLink = async (link, linkData) => {
    try {
      const sanitizedData = sanitizeInput(linkData);
      // Get ID - could be id, row, or platform as fallback
      const linkId = link.id || link.row || link.platform;
      
      // Prepare update data with proper types
      const dataToSubmit = {
        platform: String(sanitizedData.platform || link.platform || '').trim(),
        url: String(sanitizedData.url || link.url || '').trim(),
        icon: String(sanitizedData.icon || link.icon || '').trim(),
        display_order: sanitizedData.display_order ? Number(sanitizedData.display_order) : (link.display_order || 1),
        is_active: sanitizedData.is_active !== false && sanitizedData.is_active !== 'false',
      };

      const result = await adminAPI.updateSocialLink(linkId, dataToSubmit);

      if (result.success) {
        toast.success(SUCCESS_MESSAGES.SOCIAL_LINK_UPDATED);
        setEditingSocialLink(null);
        // Reload to get updated data
        await loadProfileData();
      } else {
        toast.error(result.message || result.error?.message || 'Failed to update social link');
      }
    } catch (err) {
      console.error('Update social link error:', err);
      toast.error(err.message || 'Failed to update social link');
    }
  };

  const handleDeleteSocialLink = async (id) => {
    if (!window.confirm('Are you sure you want to delete this social link?')) {
      return;
    }

    try {
      const result = await adminAPI.deleteSocialLink(id);

      if (result.success) {
        toast.success(SUCCESS_MESSAGES.SOCIAL_LINK_DELETED);
        await loadProfileData(); // Reload to get updated list
      } else {
        toast.error(result.message || 'Failed to delete social link');
      }
    } catch (err) {
      console.error('Delete social link error:', err);
      toast.error(err.message || 'Failed to delete social link');
    }
  };

  const handleChangePassword = async (data) => {
    try {
      setChangingPassword(true);

      // Validate current password is provided
      if (!data.currentPassword) {
        toast.error('Current password is required');
        return;
      }

      // Validate new password
      if (!data.newPassword) {
        toast.error('New password is required');
        return;
      }

      // Validate password strength
      const strengthCheck = validatePasswordStrength(data.newPassword);
      if (!strengthCheck.valid) {
        toast.error(strengthCheck.message);
        return;
      }

      // Validate password confirmation
      if (data.newPassword !== data.confirmPassword) {
        toast.error('New password and confirmation do not match');
        return;
      }

      // Call API
      const result = await adminAPI.changePassword(
        data.currentPassword,
        data.newPassword,
        data.confirmPassword
      );

      if (result.success || (result.data && result.data.success)) {
        toast.success(SUCCESS_MESSAGES.PASSWORD_CHANGED);
        
        // Clear form
        setChangingPassword(false);
        
        // If server requires re-authentication, logout and redirect
        if (result.data?.requiresReauth || result.data?.data?.requiresReauth) {
          setTimeout(async () => {
            await logout();
            navigate(ROUTES.ADMIN_LOGIN, { 
              state: { message: 'Password changed successfully. Please login again.' } 
            });
          }, 2000);
        }
      } else {
        const errorMsg = result.message || result.error?.message || 'Failed to change password';
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Change password error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to change password';
      toast.error(errorMsg);
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading profile..." />;
  }

  return (
    <>
      <Helmet>
        <title>Edit Profile | Admin</title>
      </Helmet>

      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Edit Profile</h1>
            <p className="page-subtitle">Manage organization profile, social links, and account settings</p>
          </div>
          <button
            onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
            className="btn btn-outline"
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button
            type="button"
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span>👤</span>
            <span>Profile Information</span>
          </button>
          <button
            type="button"
            className={`profile-tab ${activeTab === 'social' ? 'active' : ''}`}
            onClick={() => setActiveTab('social')}
          >
            <span>🔗</span>
            <span>Social Media Links</span>
          </button>
          <button
            type="button"
            className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            <span>🔒</span>
            <span>Change Password</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-tab-content">
          {/* Profile Information Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSubmit(onSubmit)} className="admin-form">
          {/* Profile Image */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Organization Logo/Image</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="profile_image_url">Profile Image URL</label>
                <input
                  type="url"
                  id="profile_image_url"
                  {...register('profile_image_url')}
                  placeholder="https://example.com/image.jpg"
                  className={errors.profile_image_url ? 'error' : ''}
                />
                {errors.profile_image_url && (
                  <span className="error-message">{errors.profile_image_url.message}</span>
                )}
              </div>

              {profileImagePreview && (
                <div className="form-group">
                  <label>Preview</label>
                  <div className="image-preview" style={{ position: 'relative' }}>
                    <img 
                      src={profileImagePreview} 
                      alt="Profile preview"
                      onError={(e) => {
                        console.error('Image failed to load:', profileImagePreview);
                        e.target.style.display = 'none';
                        const errorDiv = document.createElement('div');
                        errorDiv.innerHTML = `
                          <div style="padding: var(--space-4); text-align: center; color: var(--error);">
                            <p style="font-weight: bold; margin-bottom: var(--space-2);">⚠️ Error loading image</p>
                            <p style="font-size: var(--text-sm);">This image format may not be supported. Please use JPEG, PNG, GIF, or WebP format.</p>
                            <p style="font-size: var(--text-sm); margin-top: var(--space-2);">
                              If this is a HEIC file from Mac, please convert it to JPEG first.
                            </p>
                          </div>
                        `;
                        e.target.parentElement.appendChild(errorDiv);
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="profile_image_upload">Or Upload Image</label>
                <input
                  type="file"
                  id="profile_image_upload"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,image/heif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  disabled={uploading}
                />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                  Supported formats: JPEG, PNG, GIF, WebP, HEIC. HEIC images from Mac will be automatically converted to JPEG.
                </p>
                {uploading && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span>{uploadProgress}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Basic Information</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="name">Organization Name *</label>
                <input
                  type="text"
                  id="name"
                  {...register('name', { required: 'Name is required' })}
                  className={errors.name ? 'error' : ''}
                />
                {errors.name && (
                  <span className="error-message">{errors.name.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="title">Title/Tagline</label>
                <input
                  type="text"
                  id="title"
                  {...register('title')}
                  placeholder="e.g., Walking with Christ on the Synodal Way"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  placeholder="contact@organization.org"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone')}
                  placeholder="+91 (XXX) XXX-XXXX"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  {...register('location')}
                  placeholder="City, State, Country"
                />
              </div>

              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  {...register('website')}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>

          {/* Bio Information */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Bio Information</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="short_bio">Short Bio</label>
                <textarea
                  id="short_bio"
                  {...register('short_bio')}
                  rows="3"
                  placeholder="A brief one-line or short description of the organization"
                />
                <small>Brief description used in cards and previews</small>
              </div>

              <div className="form-group">
                <label htmlFor="bio">Our Mission <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>(Full Bio)</span></label>
                <textarea
                  id="bio"
                  {...register('bio')}
                  rows="8"
                  placeholder="Your organization's mission, purpose, and core values"
                />
                <small>This content will be displayed as "Our Mission" section on the About page</small>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Organization Information</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="education">History & Background <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>(Shows in "Quick Facts" sidebar)</span></label>
                <textarea
                  id="education"
                  {...register('education')}
                  rows="3"
                  placeholder="Brief history and background (2-3 sentences - appears in sidebar)"
                />
                <small>Keep this concise as it appears in the sidebar "Quick Facts" section. For detailed history, use the main content sections above.</small>
              </div>

              <div className="form-group">
                <label htmlFor="experience">Our Vision <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>(Vision & Activities)</span></label>
                <textarea
                  id="experience"
                  {...register('experience')}
                  rows="6"
                  placeholder="Organization's vision, mission, and key activities"
                />
                <small>This content will be displayed as "Our Vision" section on the About page</small>
              </div>

              <div className="form-group">
                <label htmlFor="awards">Awards & Recognition</label>
                <textarea
                  id="awards"
                  {...register('awards')}
                  rows="4"
                  placeholder="Awards, honors, and recognitions received by the organization"
                />
              </div>

              <div className="form-group">
                <label htmlFor="specializations">Our Values <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>(Focus Areas)</span></label>
                <textarea
                  id="specializations"
                  {...register('specializations')}
                  rows="4"
                  placeholder="Core values and focus areas of your organization"
                />
                <small>This content will be displayed as "Our Values" section on the About page. You can include values, principles, and focus areas.</small>
              </div>

              <div className="form-group">
                <label htmlFor="languages">Languages</label>
                <input
                  type="text"
                  id="languages"
                  {...register('languages')}
                  placeholder="e.g., English, Odia, Hindi"
                />
                <small>Comma-separated list of languages used by the organization</small>
              </div>
            </div>
          </div>

          {/* Organization Highlights / Stats */}
          {activeTab === 'profile' && (
            <div className="admin-card">
              <div className="card-header">
                <h2>Organization Highlights</h2>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                  These numbers will be displayed on your homepage and about page
                </p>
              </div>
              <div className="card-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="total_stories">Projects/Programs</label>
                    <input
                      type="number"
                      id="total_stories"
                      {...register('total_stories', { valueAsNumber: true, min: 0 })}
                      min="0"
                      placeholder="e.g., 58"
                    />
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                      Total number of projects or programs
                    </p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="countries_covered">Communities/Regions Served</label>
                    <input
                      type="number"
                      id="countries_covered"
                      {...register('countries_covered', { valueAsNumber: true, min: 0 })}
                      min="0"
                      placeholder="e.g., 42"
                    />
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                      Number of communities or regions served
                    </p>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="awards_count">Awards/Recognition Count</label>
                    <input
                      type="number"
                      id="awards_count"
                      {...register('awards_count', { valueAsNumber: true, min: 0 })}
                      min="0"
                      placeholder="e.g., 12"
                    />
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                      Total number of awards and recognitions
                    </p>
                  </div>

                  <div className="form-group">
                    <label htmlFor="years_experience">Years of Service</label>
                    <input
                      type="number"
                      id="years_experience"
                      {...register('years_experience', { valueAsNumber: true, min: 0 })}
                      min="0"
                      placeholder="e.g., 15"
                    />
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                      Years the organization has been serving
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

              {/* Form Actions */}
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}

          {/* Social Media Links Tab */}
          {activeTab === 'social' && (
            <div className="admin-card">
              <div className="card-header">
                <h2>Manage Social Media Links</h2>
              </div>
              <div className="card-body">
                {socialLinks.length > 0 && (
                  <div className="table-container" style={{ marginBottom: '2rem' }}>
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Platform</th>
                          <th>URL</th>
                          <th>Icon</th>
                          <th>Order</th>
                          <th>Active</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {socialLinks.map((link, index) => {
                          // Get ID - could be id, row, or use index as fallback
                          const linkId = link.id || link.row || (index + 1);
                          return (
                            <tr key={linkId}>
                              <td>{link.platform || 'N/A'}</td>
                              <td>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="table-link"
                                >
                                  {link.url || 'N/A'}
                                </a>
                              </td>
                              <td>{link.icon || 'N/A'}</td>
                              <td>{link.display_order || 'N/A'}</td>
                              <td>
                                <span
                                  className={`status-badge status-${link.is_active !== false && link.is_active !== 'false' ? 'published' : 'draft'}`}
                                >
                                  {link.is_active !== false && link.is_active !== 'false' ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingSocialLink(link);
                                      setShowAddSocialLink(false);
                                    }}
                                    className="btn btn-sm btn-outline"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSocialLink(linkId)}
                                    className="btn btn-sm btn-danger"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {socialLinks.length === 0 && !showAddSocialLink && !editingSocialLink && (
                  <p className="text-muted">No social links added yet. Click "Add Link" to get started.</p>
                )}

                {/* Add/Edit Social Link Form - Completely separate from profile form */}
                {(showAddSocialLink || editingSocialLink) && (
                  <div className="social-link-form" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                    <h3>{editingSocialLink ? 'Edit Social Link' : 'Add Social Link'}</h3>
                    <SocialLinkForm
                      link={editingSocialLink}
                      onSubmit={async (data) => {
                        if (editingSocialLink) {
                          await handleUpdateSocialLink(editingSocialLink, data);
                        } else {
                          await handleAddSocialLink(data);
                        }
                      }}
                      onCancel={() => {
                        setShowAddSocialLink(false);
                        setEditingSocialLink(null);
                      }}
                    />
                  </div>
                )}

                {!showAddSocialLink && !editingSocialLink && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddSocialLink(true);
                      setEditingSocialLink(null);
                    }}
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                  >
                    + Add Social Link
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="admin-card">
              <div className="card-header">
                <h2>Change Password</h2>
              </div>
              <div className="card-body">
                <PasswordChangeForm 
                  onSubmit={handleChangePassword}
                  isSubmitting={changingPassword}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Password Change Form Component
const PasswordChangeForm = ({ onSubmit, isSubmitting }) => {
  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm();
  const newPassword = watch('newPassword', '');

  const handleFormSubmit = async (data, e) => {
    e.preventDefault();
    e.stopPropagation();
    await onSubmit(data);
    reset(); // Clear form after successful submission
  };

  // Get password strength
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Weak', color: '#ef4444' };
    if (strength <= 4) return { strength, label: 'Medium', color: '#f59e0b' };
    return { strength, label: 'Strong', color: '#10b981' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="form-group">
        <label htmlFor="currentPassword">Current Password *</label>
        <input
          type="password"
          id="currentPassword"
          {...register('currentPassword', { required: 'Current password is required' })}
          placeholder="Enter your current password"
          className={errors.currentPassword ? 'error' : ''}
          disabled={isSubmitting}
        />
        {errors.currentPassword && (
          <span className="error-message" style={{ 
            display: 'block', 
            marginTop: 'var(--space-2)', 
            marginBottom: 0,
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-sm)'
          }}>
            {errors.currentPassword.message}
          </span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="newPassword">New Password *</label>
        <input
          type="password"
          id="newPassword"
          {...register('newPassword', { 
            required: 'New password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters'
            },
            validate: (value) => {
              const check = validatePasswordStrength(value);
              return check.valid || check.message;
            }
          })}
          placeholder="Enter your new password"
          className={errors.newPassword ? 'error' : ''}
          disabled={isSubmitting}
        />
        {errors.newPassword && (
          <span className="error-message" style={{ 
            display: 'block', 
            marginTop: 'var(--space-2)', 
            marginBottom: 0,
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-sm)'
          }}>
            {errors.newPassword.message}
          </span>
        )}
        {newPassword && (
          <div style={{ marginTop: 'var(--space-2)' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--space-2)',
              fontSize: 'var(--text-sm)'
            }}>
              <span>Strength:</span>
              <span style={{ color: passwordStrength.color, fontWeight: 'var(--font-semibold)' }}>
                {passwordStrength.label}
              </span>
              <div style={{ 
                flex: 1, 
                height: '4px', 
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}>
                <div style={{
                  width: `${(passwordStrength.strength / 6) * 100}%`,
                  height: '100%',
                  background: passwordStrength.color,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
            <small style={{ display: 'block', marginTop: 'var(--space-1)', color: 'var(--text-secondary)' }}>
              Password must be at least 8 characters with uppercase, lowercase, and number
            </small>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm New Password *</label>
        <input
          type="password"
          id="confirmPassword"
          {...register('confirmPassword', { 
            required: 'Please confirm your new password',
            validate: (value) => {
              const newPwd = watch('newPassword');
              return value === newPwd || 'Passwords do not match';
            }
          })}
          placeholder="Confirm your new password"
          className={errors.confirmPassword ? 'error' : ''}
          disabled={isSubmitting}
        />
        {errors.confirmPassword && (
          <span className="error-message" style={{ 
            display: 'block', 
            marginTop: 'var(--space-2)', 
            marginBottom: 0,
            padding: 'var(--space-2) var(--space-3)',
            fontSize: 'var(--text-sm)'
          }}>
            {errors.confirmPassword.message}
          </span>
        )}
      </div>

      <div className="form-actions" style={{ marginTop: '1rem' }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Changing Password...' : 'Change Password'}
        </button>
      </div>
    </form>
  );
};

// Social Link Form Component
const SocialLinkForm = ({ link, onSubmit, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      platform: link?.platform || '',
      url: link?.url || '',
      icon: link?.icon || link?.platform || '',
      display_order: link?.display_order || '',
      is_active: link?.is_active !== false && link?.is_active !== 'false',
    },
  });

  const handleFormSubmit = async (data, e) => {
    e.preventDefault();
    e.stopPropagation();
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div className="form-group">
        <label htmlFor="social_platform">Platform *</label>
        <input
          type="text"
          id="social_platform"
          {...register('platform', { required: 'Platform is required' })}
          placeholder="e.g., Twitter, LinkedIn, Facebook"
          className={errors.platform ? 'error' : ''}
        />
        {errors.platform && (
          <span className="error-message">{errors.platform.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="social_url">URL *</label>
        <input
          type="url"
          id="social_url"
          {...register('url', { required: 'URL is required' })}
          placeholder="https://..."
          className={errors.url ? 'error' : ''}
        />
        {errors.url && (
          <span className="error-message">{errors.url.message}</span>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="social_icon">Icon (Emoji)</label>
        <input
          type="text"
          id="social_icon"
          {...register('icon')}
          placeholder="Enter emoji (e.g., 📷 for Instagram, 📘 for Facebook)"
          maxLength="2"
        />
        <small>Enter an emoji icon (e.g., 📷 📘 🐦 💼). Leave empty to auto-detect from platform name.</small>
      </div>

      <div className="form-group">
        <label htmlFor="social_display_order">Display Order</label>
        <input
          type="number"
          id="social_display_order"
          {...register('display_order', { valueAsNumber: true })}
          placeholder="1"
          min="1"
        />
        <small>Order in which this link appears (lower numbers appear first)</small>
      </div>

      <div className="form-group">
        <label className="checkbox-label" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-2)', 
          cursor: 'pointer',
          whiteSpace: 'nowrap'
        }}>
          <input
            type="checkbox"
            {...register('is_active')}
            style={{ margin: 0, width: 'auto', cursor: 'pointer' }}
          />
          <span style={{ whiteSpace: 'nowrap' }}>Active (show this link on the website)</span>
        </label>
      </div>

      <div className="form-actions" style={{ marginTop: '1rem' }}>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {link ? 'Update Link' : 'Add Link'}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditor;

