/**
 * Admin Donate Editor
 * Edit donation account information and QR code
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { adminAPI } from '@/services/api';
import { firebaseStorageService } from '@/services/firebaseStorage';
import { ROUTES, SUCCESS_MESSAGES } from '@/config/constants';
import { sanitizeInput } from '@/utils/sanitize';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import { Helmet } from 'react-helmet-async';

const DonateEditor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [qrCodePreview, setQrCodePreview] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    defaultValues: {
      bank_name: '',
      account_name: '',
      account_number: '',
      ifsc_code: '',
      branch: '',
      upi_id: '',
      upi_name: '',
      qr_code_url: '',
      additional_info: '',
    },
  });

  const watchedQrCodeUrl = watch('qr_code_url');

  // Load donate data
  useEffect(() => {
    loadDonateData();
  }, []);

  // Update QR code preview when URL changes
  useEffect(() => {
    if (watchedQrCodeUrl) {
      setQrCodePreview(watchedQrCodeUrl);
    }
  }, [watchedQrCodeUrl]);

  const loadDonateData = async () => {
    try {
      setLoading(true);

      const donateData = await adminAPI.getDonateInfo().catch(() => null);

      if (donateData?.success && donateData.data) {
        const data = donateData.data;
        reset({
          bank_name: data.bank_name || '',
          account_name: data.account_name || '',
          account_number: data.account_number || '',
          ifsc_code: data.ifsc_code || '',
          branch: data.branch || '',
          upi_id: data.upi_id || '',
          upi_name: data.upi_name || '',
          qr_code_url: data.qr_code_url || '',
          additional_info: data.additional_info || '',
        });
        if (data.qr_code_url) {
          setQrCodePreview(data.qr_code_url);
        }
      }
    } catch (err) {
      console.error('Error loading donate data:', err);
      toast.error('Failed to load donate information');
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
          folder: 'donate-qr-codes',
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
        });

        setValue('qr_code_url', url);
        setQrCodePreview(url);
      } else {
        // Fallback to API upload
        const result = await adminAPI.uploadMedia(file, (progress) => {
          setUploadProgress(progress);
        });

        if (result.success && result.data) {
          const url = result.data.url || result.data.public_url;
          setValue('qr_code_url', url);
          setQrCodePreview(url);
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

      const result = await adminAPI.updateDonateInfo(sanitizedData);

      if (result.success) {
        toast.success('Donate information updated successfully');
        // Reload data to get any server-side updates
        await loadDonateData();
      } else {
        toast.error(result.message || 'Failed to update donate information');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to update donate information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading donate information..." />;
  }

  return (
    <>
      <Helmet>
        <title>Edit Donate Information | Admin</title>
      </Helmet>

      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>Edit Donate Information</h1>
            <p className="page-subtitle">Manage bank account details and payment QR code</p>
          </div>
          <button
            onClick={() => navigate(ROUTES.ADMIN_DASHBOARD)}
            className="btn btn-outline"
          >
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="admin-form">
          {/* Bank Account Information */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Bank Account Details</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="bank_name">Bank Name *</label>
                <input
                  type="text"
                  id="bank_name"
                  {...register('bank_name', { required: 'Bank name is required' })}
                  placeholder="e.g., State Bank of India"
                  className={errors.bank_name ? 'error' : ''}
                />
                {errors.bank_name && (
                  <span className="error-message">{errors.bank_name.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="account_name">Account Name *</label>
                <input
                  type="text"
                  id="account_name"
                  {...register('account_name', { required: 'Account name is required' })}
                  placeholder="e.g., Berhampur Diocesan Synod"
                  className={errors.account_name ? 'error' : ''}
                />
                {errors.account_name && (
                  <span className="error-message">{errors.account_name.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="account_number">Account Number *</label>
                <input
                  type="text"
                  id="account_number"
                  {...register('account_number', { required: 'Account number is required' })}
                  placeholder="e.g., 1234567890123456"
                  className={errors.account_number ? 'error' : ''}
                />
                {errors.account_number && (
                  <span className="error-message">{errors.account_number.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="ifsc_code">IFSC Code *</label>
                <input
                  type="text"
                  id="ifsc_code"
                  {...register('ifsc_code', { required: 'IFSC code is required' })}
                  placeholder="e.g., SBIN0001234"
                  className={errors.ifsc_code ? 'error' : ''}
                />
                {errors.ifsc_code && (
                  <span className="error-message">{errors.ifsc_code.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="branch">Branch</label>
                <input
                  type="text"
                  id="branch"
                  {...register('branch')}
                  placeholder="e.g., Berhampur Main Branch"
                />
              </div>
            </div>
          </div>

          {/* UPI Information */}
          <div className="admin-card">
            <div className="card-header">
              <h2>UPI Payment Information</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="upi_id">UPI ID *</label>
                <input
                  type="text"
                  id="upi_id"
                  {...register('upi_id', { required: 'UPI ID is required' })}
                  placeholder="e.g., donate@synodofberhampur"
                  className={errors.upi_id ? 'error' : ''}
                />
                {errors.upi_id && (
                  <span className="error-message">{errors.upi_id.message}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="upi_name">UPI Name</label>
                <input
                  type="text"
                  id="upi_name"
                  {...register('upi_name')}
                  placeholder="e.g., Berhampur Diocesan Synod"
                />
              </div>
            </div>
          </div>

          {/* QR Code */}
          <div className="admin-card">
            <div className="card-header">
              <h2>QR Code for Payment</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="qr_code_url">QR Code Image URL</label>
                <input
                  type="url"
                  id="qr_code_url"
                  {...register('qr_code_url')}
                  placeholder="https://example.com/qr-code.png"
                  className={errors.qr_code_url ? 'error' : ''}
                />
                {errors.qr_code_url && (
                  <span className="error-message">{errors.qr_code_url.message}</span>
                )}
                <small>
                  You can upload a QR code image or provide a URL. The QR code should contain your UPI payment information.
                </small>
              </div>

              {qrCodePreview && (
                <div className="form-group">
                  <label>QR Code Preview</label>
                  <div className="image-preview" style={{ position: 'relative' }}>
                    <img 
                      src={qrCodePreview} 
                      alt="QR Code preview"
                      style={{
                        maxWidth: '300px',
                        maxHeight: '300px',
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-2)',
                        background: 'white'
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', qrCodePreview);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="qr_code_upload">Or Upload QR Code Image</label>
                <input
                  type="file"
                  id="qr_code_upload"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  disabled={uploading}
                />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                  Supported formats: JPEG, PNG, GIF, WebP. Recommended size: 300x300px or larger.
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

          {/* Additional Information */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Additional Information</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="additional_info">Important Notes/Information</label>
                <textarea
                  id="additional_info"
                  {...register('additional_info')}
                  rows="6"
                  placeholder="Add any important information about donations, tax deductions, receipts, etc."
                />
                <small>
                  This information will be displayed on the donate page below the account details.
                </small>
              </div>
            </div>
          </div>

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
              {saving ? 'Saving...' : 'Save Donate Information'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default DonateEditor;


