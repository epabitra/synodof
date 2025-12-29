/**
 * Admin Post Editor
 * Create and edit blog posts
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { adminAPI } from '@/services/api';
import { firebaseStorageService } from '@/services/firebaseStorage';
import { ROUTES, POST_STATUS, POST_TYPE, MEDIA_TYPE } from '@/config/constants';
import { validatePostData } from '@/utils/validation';
import { generateSlug } from '@/utils/slugGenerator';
import { getCurrentISO, isoToLocalDateTime, getCurrentLocalDateTime, localDateTimeToISO } from '@/utils/dateFormatter';
import { sanitizeInput, sanitizeHtml } from '@/utils/sanitize';
import { isValidYouTubeUrl, getYouTubeEmbedUrl } from '@/utils/youtube';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import { Helmet } from 'react-helmet-async';
import MediaCarousel from '@/components/ImageCarousel/MediaCarousel';
import RichTextEditor from '@/components/RichTextEditor';

const AdminPostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingType, setUploadingType] = useState(null); // 'cover' or 'media'
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [videoSource, setVideoSource] = useState('upload'); // 'upload' or 'youtube'
  const [categories, setCategories] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
    control,
  } = useForm({
    defaultValues: {
      title: '',
      subtitle: '',
      slug: '',
      excerpt: '',
      content: '',
      category: '',
      tags: '',
      status: POST_STATUS.PUBLISHED,
      type: POST_TYPE.PROGRAMS,
      media_type: MEDIA_TYPE.NONE,
      cover_image_url: '',
      media_urls: '',
      is_featured: false,
      published_at: getCurrentLocalDateTime(), // Set to current date/time in user's timezone
    },
  });

  const watchedTitle = watch('title');
  const watchedSlug = watch('slug');
  const watchedStatus = watch('status');
  const watchedMediaType = watch('media_type');

  // Clear media URLs when media type changes from one type to another
  const prevMediaTypeRef = useRef(watchedMediaType);
  useEffect(() => {
    // Only clear if media type actually changed from one valid type to another
    if (prevMediaTypeRef.current !== watchedMediaType && 
        prevMediaTypeRef.current !== MEDIA_TYPE.NONE && 
        watchedMediaType !== MEDIA_TYPE.NONE &&
        mediaUrls.length > 0) {
      // Clear media URLs when switching between image and video
      setMediaUrls([]);
      setValue('media_urls', '');
      setYoutubeLink('');
      toast.info('Media URLs cleared due to media type change');
    }
    prevMediaTypeRef.current = watchedMediaType;
  }, [watchedMediaType, mediaUrls.length, setValue]);

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && watchedTitle.trim()) {
      const slug = generateSlug(watchedTitle);
      // Only auto-update slug if it's empty or if we're creating a new post
      if ((!watchedSlug || watchedSlug.trim() === '') || !isEditing) {
        if (slug && slug.trim()) {
          setValue('slug', slug, { shouldValidate: false });
        }
      }
    }
  }, [watchedTitle, isEditing, setValue, watchedSlug]);

  // Handle title paste - extract first meaningful line
  const handleTitlePaste = (e) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText && pastedText.includes('\n')) {
      e.preventDefault();
      
      // Split by newlines and find the first meaningful line (not empty, not just emojis)
      const lines = pastedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      if (lines.length > 0) {
        let firstLine = lines[0];
        
        // Clean up the title - remove emojis, special formatting, but keep the actual text
        // Remove emojis (but keep the text after them)
        firstLine = firstLine
          .replace(/^[🧩💬✅❌🌱💡🔧📝🎯🚀⭐🌟💻📱🌐🏆🎉🔍✊🌍🏛️💻🎭]/g, '') // Remove leading emojis
          .replace(/hashtag#/gi, '#') // Normalize hashtag
          .trim();
        
        // Extract title from patterns like "🧩 𝐂𝐨𝐝𝐞 𝐭𝐨 𝐂𝐥𝐞𝐚𝐧 𝐂𝐨𝐝𝐞 — 𝐄𝐩𝐢𝐬𝐨𝐝𝐞 𝟐:"
        // Try to find the main title (usually before "—" or ":")
        const titleMatch = firstLine.match(/^([^—:]+?)(?:\s*[—:]\s*|$)/);
        if (titleMatch && titleMatch[1]) {
          firstLine = titleMatch[1].trim();
        }
        
        // Remove bold formatting markers if any
        firstLine = firstLine.replace(/\*\*/g, '').replace(/__/g, '');
        
        if (firstLine) {
          setValue('title', firstLine);
          
          // Set the rest as content
          if (lines.length > 1) {
            const content = lines.slice(1).join('\n\n').trim();
            if (content) {
              // Get existing content and append
              const existingContent = watch('content') || '';
              setValue('content', existingContent ? `${existingContent}\n\n${content}` : content);
            }
          }
          
          // Auto-generate slug (generateSlug handles Unicode normalization internally)
          const slug = generateSlug(firstLine);
          setValue('slug', slug);
          
          toast.success('Title and slug extracted from pasted content');
        }
      }
    }
  };

  // Regenerate slug from current title
  const handleRegenerateSlug = () => {
    if (watchedTitle) {
      const newSlug = generateSlug(watchedTitle);
      setValue('slug', newSlug);
      toast.success('Slug regenerated from title');
    } else {
      toast.error('Please enter a title first');
    }
  };

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load post data if editing
  useEffect(() => {
    if (isEditing) {
      loadPost();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const categoriesData = await adminAPI.getCategories().catch(() => null);
      if (categoriesData?.success && categoriesData.data?.length > 0) {
        setCategories(categoriesData.data);
      } else {
        // Use mock categories as fallback
        setCategories([
          { id: '1', name: 'Investigation', slug: 'investigation' },
          { id: '2', name: 'Human Rights', slug: 'human-rights' },
          { id: '3', name: 'Environment', slug: 'environment' },
          { id: '4', name: 'Politics', slug: 'politics' },
          { id: '5', name: 'Technology', slug: 'technology' },
          { id: '6', name: 'Culture', slug: 'culture' },
        ]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Use fallback categories
      setCategories([
        { id: '1', name: 'Investigation', slug: 'investigation' },
        { id: '2', name: 'Human Rights', slug: 'human-rights' },
        { id: '3', name: 'Environment', slug: 'environment' },
        { id: '4', name: 'Politics', slug: 'politics' },
        { id: '5', name: 'Technology', slug: 'technology' },
        { id: '6', name: 'Culture', slug: 'culture' },
      ]);
    }
  };

  const loadPost = async () => {
    try {
      setLoading(true);
      const postData = await adminAPI.getPost(id);

      if (postData.success && postData.data) {
        const post = postData.data;
        reset({
          title: post.title || '',
          subtitle: post.subtitle || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          category: post.category || '',
          tags: Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '',
          status: post.status || POST_STATUS.PUBLISHED,
          type: post.type || POST_TYPE.PROGRAMS,
          media_type: post.media_type || MEDIA_TYPE.NONE,
          cover_image_url: post.cover_image_url || '',
          media_urls: Array.isArray(post.media_urls) 
            ? JSON.stringify(post.media_urls) 
            : (post.media_urls ? post.media_urls : (post.media_url ? JSON.stringify([post.media_url]) : '')),
          is_featured: post.is_featured || false,
          published_at: post.published_at 
            ? isoToLocalDateTime(post.published_at) 
            : (post.created_at ? isoToLocalDateTime(post.created_at) : getCurrentLocalDateTime()),
        });
        // Set previews
        if (post.cover_image_url) {
          setCoverImagePreview(post.cover_image_url);
        }
        // Load media URLs
        let loadedMediaUrls = [];
        if (post.media_urls) {
          try {
            loadedMediaUrls = Array.isArray(post.media_urls) 
              ? post.media_urls 
              : (typeof post.media_urls === 'string' ? JSON.parse(post.media_urls) : []);
          } catch (e) {
            // Fallback: if media_url exists (old format), use it
            if (post.media_url) {
              loadedMediaUrls = [post.media_url];
            }
          }
        } else if (post.media_url) {
          // Backward compatibility: convert old media_url to array
          loadedMediaUrls = [post.media_url];
        }
        setMediaUrls(Array.isArray(loadedMediaUrls) ? loadedMediaUrls : []);
        
        // Check if any media URL is YouTube
        if (loadedMediaUrls.length > 0 && isValidYouTubeUrl(loadedMediaUrls[0])) {
          setVideoSource('youtube');
          setYoutubeLink(loadedMediaUrls[0]);
        } else {
          setVideoSource('upload');
        }
      } else {
        toast.error('Post not found');
        navigate(ROUTES.ADMIN_POSTS);
      }
    } catch (err) {
      console.error('Error loading post:', err);
      toast.error('Failed to load post');
      navigate(ROUTES.ADMIN_POSTS);
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload for rich text editor
  const handleEditorImageUpload = async (file) => {
    try {
      let url;
      
      // Check if Firebase is configured, otherwise fallback to API
      if (firebaseStorageService.isConfigured()) {
        // Use Firebase Storage
        url = await firebaseStorageService.uploadImage(file, {
          folder: 'images',
          onProgress: (progress) => {
            // Silent progress for editor images
          },
        });
      } else {
        // Fallback to API upload
        const result = await adminAPI.uploadMedia(file, (progress) => {
          // Silent progress for editor images
        });

        if (result.success && result.data) {
          url = result.data.url || result.data.public_url;
        } else {
          throw new Error('File upload failed');
        }
      }

      return url;
    } catch (err) {
      console.error('Editor image upload error:', err);
      toast.error(err.message || 'Failed to upload image');
      throw err;
    }
  };

  const handleFileUpload = async (file, type) => {
    try {
      setUploading(true);
      setUploadingType(type);
      setUploadProgress(0);

      // Check if Firebase is configured, otherwise fallback to API
      if (firebaseStorageService.isConfigured()) {
        // Use Firebase Storage
        const isVideo = file.type.startsWith('video/');
        const uploadFunction = isVideo 
          ? firebaseStorageService.uploadVideo 
          : firebaseStorageService.uploadImage;
        
        const folder = type === 'cover' ? 'cover-images' : (isVideo ? 'videos' : 'images');
        
        const url = await uploadFunction(file, {
          folder,
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
        });

        if (type === 'cover') {
          setValue('cover_image_url', url);
          setCoverImagePreview(url);
        } else if (type === 'media') {
          // Add to media URLs array
          setMediaUrls(prev => {
            const newMediaUrls = [...prev, url];
            setValue('media_urls', JSON.stringify(newMediaUrls));
            return newMediaUrls;
          });
        }
      } else {
        // Fallback to API upload
        const result = await adminAPI.uploadMedia(file, (progress) => {
          setUploadProgress(progress);
        });

        if (result.success && result.data) {
          const url = result.data.url || result.data.public_url;
          if (type === 'cover') {
            setValue('cover_image_url', url);
            setCoverImagePreview(url);
          } else if (type === 'media') {
            // Add to media URLs array
            setMediaUrls(prev => {
              const newMediaUrls = [...prev, url];
              setValue('media_urls', JSON.stringify(newMediaUrls));
              return newMediaUrls;
            });
          }
        } else {
          throw new Error('File upload failed');
        }
      }
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.message || 'File upload failed');
    } finally {
      setUploading(false);
      setUploadingType(null);
      setUploadProgress(0);
    }
  };

  const handleMultipleFileUpload = async (files, type) => {
    const MAX_FILES = 20;
    const currentCount = mediaUrls.length;
    const filesToUpload = Array.from(files);
    
    // Check total limit
    if (currentCount + filesToUpload.length > MAX_FILES) {
      const allowed = MAX_FILES - currentCount;
      if (allowed <= 0) {
        toast.error(`Maximum ${MAX_FILES} files allowed. Please remove some files first.`);
        return;
      }
      toast.warning(`Only ${allowed} more file(s) can be uploaded. ${filesToUpload.length - allowed} file(s) will be skipped.`);
      filesToUpload.splice(allowed);
    }

    if (filesToUpload.length === 0) {
      return;
    }

    try {
      setUploading(true);
      setUploadingType(type);
      
      const uploadedUrls = [];
      let uploadedCount = 0;

      // Upload files sequentially to avoid conflicts
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        setUploadProgress(Math.round(((i + 1) / filesToUpload.length) * 100));

        try {
          let url;
          
          // Check if Firebase is configured, otherwise fallback to API
          if (firebaseStorageService.isConfigured()) {
            const isVideo = file.type.startsWith('video/');
            const uploadFunction = isVideo 
              ? firebaseStorageService.uploadVideo 
              : firebaseStorageService.uploadImage;
            
            const folder = type === 'cover' ? 'cover-images' : (isVideo ? 'videos' : 'images');
            
            url = await uploadFunction(file, {
              folder,
              onProgress: (progress) => {
                // Calculate progress for current file within total progress
                const fileProgress = Math.round((i / filesToUpload.length) * 100 + (progress / filesToUpload.length));
                setUploadProgress(fileProgress);
              },
            });
          } else {
            // Fallback to API upload
            const result = await adminAPI.uploadMedia(file, (progress) => {
              const fileProgress = Math.round((i / filesToUpload.length) * 100 + (progress / filesToUpload.length));
              setUploadProgress(fileProgress);
            });

            if (result.success && result.data) {
              url = result.data.url || result.data.public_url;
            } else {
              throw new Error('File upload failed');
            }
          }

          if (url) {
            uploadedUrls.push(url);
            uploadedCount++;
          }
        } catch (err) {
          console.error(`Error uploading file ${i + 1}:`, err);
          toast.error(`Failed to upload ${file.name || 'file'}`);
        }
      }

      // Update state with all uploaded URLs at once
      if (uploadedUrls.length > 0) {
        setMediaUrls(prev => {
          const newMediaUrls = [...prev, ...uploadedUrls];
          setValue('media_urls', JSON.stringify(newMediaUrls));
          return newMediaUrls;
        });
        toast.success(`Successfully uploaded ${uploadedCount} file(s)`);
      }

      if (uploadedCount < filesToUpload.length) {
        toast.warning(`${uploadedCount} of ${filesToUpload.length} file(s) uploaded successfully`);
      }
    } catch (err) {
      console.error('Multiple file upload error:', err);
      toast.error('Some files failed to upload');
    } finally {
      setUploading(false);
      setUploadingType(null);
      setUploadProgress(0);
    }
  };

  const handleRemoveMediaUrl = (index) => {
    const newMediaUrls = mediaUrls.filter((_, i) => i !== index);
    setMediaUrls(newMediaUrls);
    setValue('media_urls', JSON.stringify(newMediaUrls));
  };

  const handleAddMediaUrl = (url) => {
    const MAX_FILES = 20;
    
    if (url && url.trim()) {
      if (mediaUrls.length >= MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed. Please remove some files first.`);
        return;
      }
      const newMediaUrls = [...mediaUrls, url.trim()];
      setMediaUrls(newMediaUrls);
      setValue('media_urls', JSON.stringify(newMediaUrls));
      setYoutubeLink('');
    }
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);

      // Preserve content field before sanitization (it contains HTML from RichTextEditor)
      const contentValue = data.content || '';
      
      // Sanitize input (but preserve content for later sanitization with DOMPurify)
      const sanitizedData = sanitizeInput(data);
      
      // Sanitize content separately using DOMPurify (preserves HTML but removes XSS)
      sanitizedData.content = sanitizeHtml(contentValue);

      // Handle tags - convert to array and limit to 10 items BEFORE validation
      let tagsArray = [];
      if (sanitizedData.tags) {
        if (Array.isArray(sanitizedData.tags)) {
          tagsArray = sanitizedData.tags.map((tag) => String(tag).trim()).filter(Boolean);
        } else if (typeof sanitizedData.tags === 'string') {
          tagsArray = sanitizedData.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
        }
        // Limit to max 10 tags
        tagsArray = tagsArray.slice(0, 10);
      }

      // Prepare post data for validation (with tags as array)
      const postDataForValidation = {
        ...sanitizedData,
        tags: tagsArray,
      };

      // Validate data (tags are now an array)
      const validation = validatePostData(postDataForValidation);
      if (!validation.isValid) {
        toast.error(validation.errors.join(', '));
        return;
      }

      // Handle media_urls - use the state directly as it's the source of truth
      // The form field might not always be in sync, so use the state
      let mediaUrlsArray = [];
      if (mediaUrls && mediaUrls.length > 0) {
        // Use state directly - it's already an array
        mediaUrlsArray = mediaUrls.filter(url => url && url.trim() !== '');
      } else if (sanitizedData.media_urls) {
        // Fallback to form data if state is empty
        try {
          if (typeof sanitizedData.media_urls === 'string' && sanitizedData.media_urls.trim() !== '') {
            const parsed = JSON.parse(sanitizedData.media_urls);
            mediaUrlsArray = Array.isArray(parsed) ? parsed : [parsed];
          } else if (Array.isArray(sanitizedData.media_urls)) {
            mediaUrlsArray = sanitizedData.media_urls;
          }
        } catch (e) {
          console.error('Error parsing media_urls from form:', e, sanitizedData.media_urls);
          mediaUrlsArray = [];
        }
      }

      // Prepare final post data
      const postData = {
        ...sanitizedData,
        tags: tagsArray,
        media_urls: mediaUrlsArray.length > 0 ? JSON.stringify(mediaUrlsArray) : '',
        published_at:
          sanitizedData.status === POST_STATUS.PUBLISHED && !sanitizedData.published_at
            ? getCurrentISO()
            : sanitizedData.published_at 
              ? localDateTimeToISO(sanitizedData.published_at) || getCurrentISO()
              : null,
        updated_at: getCurrentISO(),
      };

      let result;
      if (isEditing) {
        result = await adminAPI.updatePost(id, postData);
      } else {
        result = await adminAPI.createPost(postData);
      }

      if (result.success) {
        toast.success(`Post ${isEditing ? 'updated' : 'created'} successfully`);
        navigate(ROUTES.ADMIN_POSTS);
      } else {
        toast.error(result.message || 'Failed to save post');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error(err.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Loading post..." />;
  }

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Edit Post' : 'New Post'} | Admin</title>
      </Helmet>

      <div className="admin-page">
        <div className="admin-page-header">
          <div>
            <h1>{isEditing ? 'Edit Post' : 'Create New Post'}</h1>
            <p className="page-subtitle">
              {isEditing ? 'Update your blog post' : 'Write and publish a new article'}
            </p>
          </div>
          <button
            onClick={() => navigate(ROUTES.ADMIN_POSTS)}
            className="btn btn-outline"
          >
            ← Back to Posts
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
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                {...register('title', { required: 'Title is required' })}
                onPaste={handleTitlePaste}
                placeholder="Enter post title (paste will extract first line)"
              />
              {errors.title && <span className="error">{errors.title.message}</span>}
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                💡 Tip: When pasting content, the first line will be used as the title
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="subtitle">Subtitle</label>
              <input type="text" id="subtitle" {...register('subtitle')} />
            </div>

            <div className="form-group">
              <label htmlFor="slug">Slug *</label>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <input
                  type="text"
                  id="slug"
                  {...register('slug', { required: 'Slug is required' })}
                  placeholder="url-friendly-slug"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleRegenerateSlug}
                  className="btn btn-outline"
                  style={{ whiteSpace: 'nowrap' }}
                  title="Regenerate slug from title"
                >
                  🔄 Regenerate
                </button>
              </div>
              {errors.slug && <span className="error">{errors.slug.message}</span>}
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                URL-friendly version of your title (auto-generated, but you can edit it)
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="excerpt">Excerpt</label>
              <textarea
                id="excerpt"
                rows="3"
                {...register('excerpt')}
                placeholder="Short description of the post"
              />
            </div>
            </div>
          </div>

          {/* Content */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Content</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label htmlFor="content">Content *</label>
                <Controller
                  name="content"
                  control={control}
                  rules={{ required: 'Content is required' }}
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value || ''}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                      placeholder="Write your post content here. Use the toolbar to format text (bold, italic, headings, lists, etc.)"
                      error={errors.content?.message}
                    />
                  )}
                />
                {errors.content && <span className="error">{errors.content.message}</span>}
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                  💡 Use the toolbar above to format your text. You can make text <strong>bold</strong>, <em>italic</em>, add headings, lists, links, and more.
                </p>
              </div>
            </div>
          </div>

          {/* Media */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Media</h2>
            </div>
            <div className="card-body">

            {/* Cover Image */}
            <div className="form-group">
              <label htmlFor="cover_image_url">Cover Image</label>
              <div style={{ marginBottom: 'var(--space-2)' }}>
                <input 
                  type="url" 
                  id="cover_image_url" 
                  {...register('cover_image_url')} 
                  placeholder="Or enter image URL directly"
                  style={{ marginBottom: 'var(--space-2)' }}
                />
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 'var(--space-2)',
                  marginBottom: 'var(--space-2)'
                }}>
                  <label 
                    htmlFor="cover_image_upload" 
                    className="btn btn-secondary"
                    style={{ 
                      cursor: uploading && uploadingType === 'cover' ? 'not-allowed' : 'pointer',
                      opacity: uploading && uploadingType === 'cover' ? 0.6 : 1
                    }}
                  >
                    {uploading && uploadingType === 'cover' ? `Uploading... ${uploadProgress}%` : 'Upload Image'}
                  </label>
                  <input
                    type="file"
                    id="cover_image_upload"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) handleFileUpload(file, 'cover');
                    }}
                    disabled={uploading}
                    style={{ display: 'none' }}
                  />
                </div>
                {uploading && uploadingType === 'cover' && (
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    background: 'var(--bg-secondary)', 
                    borderRadius: '4px',
                    overflow: 'hidden',
                    marginTop: 'var(--space-2)'
                  }}>
                    <div style={{ 
                      width: `${uploadProgress}%`, 
                      height: '100%', 
                      background: 'var(--primary-600)',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                )}
              </div>
              {coverImagePreview && (
                <div style={{ 
                  marginTop: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid var(--border-light)'
                }}>
                  <img 
                    src={coverImagePreview} 
                    alt="Cover preview" 
                    style={{ 
                      width: '100%', 
                      maxHeight: '300px', 
                      objectFit: 'cover',
                      display: 'block'
                    }} 
                  />
                </div>
              )}
            </div>

            {/* Media Type and Media Upload */}
            <div className="form-group">
              <label htmlFor="media_type">Media Type</label>
              <select id="media_type" {...register('media_type')}>
                <option value={MEDIA_TYPE.NONE}>None</option>
                <option value={MEDIA_TYPE.IMAGE}>Image</option>
                <option value={MEDIA_TYPE.VIDEO}>Video</option>
              </select>
            </div>

            {watchedMediaType !== MEDIA_TYPE.NONE && (
              <div className="form-group">
                <label htmlFor="media_urls">
                  {watchedMediaType === MEDIA_TYPE.VIDEO ? 'Video' : 'Image'} Media (Multiple)
                </label>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                  Add multiple {watchedMediaType === MEDIA_TYPE.VIDEO ? 'videos' : 'images'} that will be displayed as a carousel
                </p>
                
                {/* Video Source Selection (only for videos) */}
                {watchedMediaType === MEDIA_TYPE.VIDEO && (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>
                      Video Source:
                    </label>
                    <div style={{ 
                      display: 'flex', 
                      gap: 'var(--space-4)',
                      flexWrap: 'nowrap',
                      alignItems: 'center'
                    }}>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 'var(--space-2)', 
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}>
                        <input
                          type="radio"
                          name="videoSource"
                          value="upload"
                          checked={videoSource === 'upload'}
                          onChange={(e) => {
                            setVideoSource(e.target.value);
                            setYoutubeLink('');
                          }}
                        />
                        <span>Upload Video File</span>
                      </label>
                      <label style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 'var(--space-2)', 
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        flexShrink: 0
                      }}>
                        <input
                          type="radio"
                          name="videoSource"
                          value="youtube"
                          checked={videoSource === 'youtube'}
                          onChange={(e) => {
                            setVideoSource(e.target.value);
                            setYoutubeLink('');
                          }}
                        />
                        <span>YouTube Link</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* YouTube Link Input (for videos only) */}
                {watchedMediaType === MEDIA_TYPE.VIDEO && videoSource === 'youtube' && (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <label htmlFor="youtube_link" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                      YouTube URL
                    </label>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <input
                        type="text"
                        id="youtube_link"
                        value={youtubeLink}
                        onChange={(e) => setYoutubeLink(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (youtubeLink && isValidYouTubeUrl(youtubeLink)) {
                              const embedUrl = getYouTubeEmbedUrl(youtubeLink);
                              handleAddMediaUrl(embedUrl);
                              toast.success('YouTube link added!');
                            } else {
                              toast.error('Invalid YouTube URL');
                            }
                          }
                        }}
                        placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                        style={{ flex: 1, padding: 'var(--space-3)' }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => {
                          if (youtubeLink && isValidYouTubeUrl(youtubeLink)) {
                            const embedUrl = getYouTubeEmbedUrl(youtubeLink);
                            handleAddMediaUrl(embedUrl);
                            setYoutubeLink('');
                            toast.success('YouTube link added!');
                          } else {
                            toast.error('Invalid YouTube URL');
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                      Paste a YouTube video URL and click Add or press Enter
                    </p>
                  </div>
                )}

                {/* URL Input (for images or videos when upload is selected) */}
                {(watchedMediaType === MEDIA_TYPE.IMAGE || (watchedMediaType === MEDIA_TYPE.VIDEO && videoSource === 'upload')) && (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <label htmlFor="media_url_input" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                      Paste {watchedMediaType === MEDIA_TYPE.VIDEO ? 'Video' : 'Image'} URL
                    </label>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <input
                        type="url"
                        id="media_url_input"
                        placeholder={`Enter ${watchedMediaType === MEDIA_TYPE.VIDEO ? 'video' : 'image'} URL`}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const url = e.target.value;
                            if (url && url.trim()) {
                              handleAddMediaUrl(url);
                              e.target.value = '';
                            }
                          }
                        }}
                        style={{ flex: 1, padding: 'var(--space-3)' }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          const url = input.value;
                          if (url && url.trim()) {
                            handleAddMediaUrl(url);
                            input.value = '';
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* File Upload (for images or videos when upload is selected) */}
                {(watchedMediaType === MEDIA_TYPE.IMAGE || (watchedMediaType === MEDIA_TYPE.VIDEO && videoSource === 'upload')) && (
                  <div style={{ marginBottom: 'var(--space-4)' }}>
                    <label 
                      htmlFor="media_upload" 
                      className="btn btn-secondary"
                      style={{ 
                        cursor: uploading && uploadingType === 'media' ? 'not-allowed' : 'pointer',
                        opacity: uploading && uploadingType === 'media' ? 0.6 : 1,
                        display: 'inline-block'
                      }}
                    >
                      {uploading && uploadingType === 'media' 
                        ? `Uploading... ${uploadProgress}%` 
                        : `Upload ${watchedMediaType === MEDIA_TYPE.VIDEO ? 'Video' : 'Image'}${mediaUrls.length > 0 ? 's' : ''} (Multiple)`}
                    </label>
                    <input
                      type="file"
                      id="media_upload"
                      accept={watchedMediaType === MEDIA_TYPE.VIDEO ? 'video/mp4,video/webm,video/quicktime' : 'image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,image/heif'}
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0) {
                          handleMultipleFileUpload(files, 'media');
                        }
                        e.target.value = '';
                      }}
                      disabled={uploading && uploadingType === 'media'}
                      style={{ display: 'none' }}
                    />
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                      Maximum 20 files allowed. Currently: {mediaUrls.length} / 20
                    </p>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                      Supported formats: JPEG, PNG, GIF, WebP, HEIC. HEIC images from Mac will be automatically converted to JPEG.
                    </p>
                    {uploading && uploadingType === 'media' && (
                      <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        background: 'var(--bg-secondary)', 
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginTop: 'var(--space-2)'
                      }}>
                        <div style={{ 
                          width: `${uploadProgress}%`, 
                          height: '100%', 
                          background: 'var(--primary-600)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    )}
                  </div>
                )}

                {/* Media URLs List */}
                {mediaUrls.length > 0 && (
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>
                      Added Media ({mediaUrls.length}):
                    </label>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                      gap: 'var(--space-3)',
                      marginBottom: 'var(--space-4)'
                    }}>
                      {mediaUrls.map((url, index) => {
                        const isVideo = watchedMediaType === MEDIA_TYPE.VIDEO;
                        const isYouTube = isValidYouTubeUrl(url) || url.includes('youtube.com/embed');
                        return (
                          <div key={index} style={{ 
                            position: 'relative',
                            borderRadius: 'var(--radius-md)',
                            overflow: 'hidden',
                            border: '1px solid var(--border-light)',
                            aspectRatio: isVideo && !isYouTube ? '16/9' : '1',
                            background: 'var(--bg-secondary)'
                          }}>
                            {isVideo ? (
                              isYouTube ? (
                                <iframe
                                  src={url}
                                  title={`Video ${index + 1}`}
                                  style={{
                                    width: '100%',
                                    height: '100%',
                                    border: 'none'
                                  }}
                                />
                              ) : (
                                <video 
                                  src={url} 
                                  style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    objectFit: 'cover',
                                    display: 'block'
                                  }} 
                                />
                              )
                            ) : (
                              <img 
                                src={url} 
                                alt={`Media ${index + 1}`}
                                onError={(e) => {
                                  console.error('Media image failed to load:', url);
                                  e.target.style.display = 'none';
                                  const errorDiv = document.createElement('div');
                                  errorDiv.style.cssText = 'padding: var(--space-4); text-align: center; color: var(--error); position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; flex-direction: column;';
                                  errorDiv.innerHTML = `
                                    <p style="font-weight: bold; margin-bottom: var(--space-2);">⚠️ Error loading image</p>
                                    <p style="font-size: var(--text-sm);">Unsupported format</p>
                                  `;
                                  e.target.parentElement.appendChild(errorDiv);
                                }}
                                style={{ 
                                  width: '100%', 
                                  height: '100%', 
                                  objectFit: 'cover',
                                  display: 'block'
                                }} 
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveMediaUrl(index)}
                              style={{
                                position: 'absolute',
                                top: 'var(--space-1)',
                                right: 'var(--space-1)',
                                background: 'rgba(0, 0, 0, 0.7)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '28px',
                                height: '28px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                lineHeight: 1
                              }}
                              title="Remove"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Carousel Preview */}
                {mediaUrls.length > 0 && (
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <label style={{ display: 'block', marginBottom: 'var(--space-2)', fontWeight: '500' }}>
                      Carousel Preview:
                    </label>
                    <MediaCarousel 
                      items={mediaUrls.map(url => ({
                        url,
                        type: watchedMediaType === MEDIA_TYPE.VIDEO ? 'video' : 'image',
                        isYouTube: watchedMediaType === MEDIA_TYPE.VIDEO && (isValidYouTubeUrl(url) || url.includes('youtube.com/embed'))
                      }))}
                    />
                  </div>
                )}

                <input
                  type="hidden"
                  {...register('media_urls')}
                />
              </div>
            )}
            </div>
          </div>

          {/* Metadata */}
          <div className="admin-card">
            <div className="card-header">
              <h2>Metadata</h2>
            </div>
            <div className="card-body">
              <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Category</label>
                <select 
                  id="category" 
                  {...register('category')}
                  style={{
                    width: '100%',
                    padding: 'var(--space-3) var(--space-4)',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-base)',
                    fontFamily: 'inherit',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">Select a category</option>
                  {categories
                    .filter(cat => cat.is_active !== false)
                    .map((category) => (
                      <option 
                        key={category.id || category.slug} 
                        value={category.name || category.slug}
                      >
                        {category.icon && <span>{category.icon} </span>}
                        {category.name}
                      </option>
                    ))}
                </select>
                <p style={{ 
                  fontSize: 'var(--text-sm)', 
                  color: 'var(--text-secondary)', 
                  marginTop: 'var(--space-2)' 
                }}>
                  Select a category to help readers filter your content
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags (comma-separated)</label>
                <input 
                  type="text" 
                  id="tags" 
                  {...register('tags')} 
                  placeholder="e.g., clean-code, refactoring, best-practices, java"
                />
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                  Separate multiple tags with commas
                </p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Post Type</label>
                <select id="type" {...register('type')}>
                  <option value={POST_TYPE.PROGRAMS}>Programs</option>
                  <option value={POST_TYPE.NEWS}>News</option>
                  <option value={POST_TYPE.BOTH}>Both</option>
                </select>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                  Programs posts appear on the Programs page, News posts appear on the News & Updates page. Both option will show the post on both pages.
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select id="status" {...register('status')}>
                  <option value={POST_STATUS.DRAFT}>Draft</option>
                  <option value={POST_STATUS.PUBLISHED}>Published</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="published_at">Published Date</label>
              <input
                type="datetime-local"
                id="published_at"
                {...register('published_at')}
                defaultValue={isEditing ? undefined : getCurrentLocalDateTime()}
              />
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                {isEditing ? 'Shows the original creation date' : 'Automatically set to current date/time'}
              </p>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  {...register('is_featured')} 
                  style={{ margin: 0, width: "auto", cursor: 'pointer' }}
                />
                <span>Featured Post</span>
              </label>
            </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(ROUTES.ADMIN_POSTS)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || uploading}
            >
              {saving ? 'Saving...' : isEditing ? 'Update Post' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminPostEditor;

