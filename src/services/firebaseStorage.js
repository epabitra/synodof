/**
 * Firebase Storage Service
 * Handles uploading images and videos to Firebase Storage
 */

import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '@/config/firebase';
import { FILE_UPLOAD } from '@/config/constants';
import { toast } from 'react-toastify';

/**
 * Validates file before upload
 */
const validateFile = (file, type = 'image') => {
  const maxSize = type === 'video' ? FILE_UPLOAD.MAX_VIDEO_SIZE : FILE_UPLOAD.MAX_IMAGE_SIZE;
  const allowedTypes = type === 'video' ? FILE_UPLOAD.ALLOWED_VIDEO_TYPES : FILE_UPLOAD.ALLOWED_IMAGE_TYPES;

  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    throw new Error(`File size exceeds maximum allowed size of ${maxSizeMB}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }

  return true;
};

/**
 * Generates a unique file path for storage
 */
const generateFilePath = (file, folder = 'uploads') => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const fileExtension = file.name.split('.').pop();
  const fileName = `${timestamp}_${randomString}.${fileExtension}`;
  return `${folder}/${fileName}`;
};

/**
 * Uploads a file to Firebase Storage
 * @param {File} file - The file to upload
 * @param {Object} options - Upload options
 * @param {string} options.folder - Folder path in storage (default: 'uploads')
 * @param {string} options.type - File type: 'image' or 'video' (default: 'image')
 * @param {Function} options.onProgress - Progress callback (progress: 0-100)
 * @returns {Promise<string>} - The download URL of the uploaded file
 */
export const uploadFile = async (file, options = {}) => {
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. Please check your environment variables.');
  }

  if (!storage) {
    throw new Error('Firebase Storage is not initialized');
  }

  const { folder = 'uploads', type = 'image', onProgress } = options;

  try {
    // Validate file
    validateFile(file, type);

    // Generate file path
    const filePath = generateFilePath(file, folder);

    // Create storage reference
    const storageRef = ref(storage, filePath);

    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Return promise that resolves with download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error('Upload error:', error);
          toast.error('File upload failed: ' + error.message);
          reject(error);
        },
        async () => {
          try {
            // Upload completed, get download URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            toast.success('File uploaded successfully');
            resolve(downloadURL);
          } catch (error) {
            console.error('Error getting download URL:', error);
            toast.error('Failed to get file URL');
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload validation error:', error);
    toast.error(error.message || 'File upload failed');
    throw error;
  }
};

/**
 * Uploads an image to Firebase Storage
 * @param {File} file - The image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - The download URL of the uploaded image
 */
export const uploadImage = async (file, options = {}) => {
  return uploadFile(file, { ...options, type: 'image', folder: options.folder || 'images' });
};

/**
 * Uploads a video to Firebase Storage
 * @param {File} file - The video file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<string>} - The download URL of the uploaded video
 */
export const uploadVideo = async (file, options = {}) => {
  return uploadFile(file, { ...options, type: 'video', folder: options.folder || 'videos' });
};

/**
 * Deletes a file from Firebase Storage
 * @param {string} fileUrl - The download URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFile = async (fileUrl) => {
  if (!isFirebaseConfigured() || !storage) {
    throw new Error('Firebase Storage is not configured');
  }

  try {
    // Extract file path from URL
    // Firebase Storage URLs format: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media
    const url = new URL(fileUrl);
    const pathMatch = url.pathname.match(/\/o\/(.+)\?/);
    
    if (!pathMatch) {
      throw new Error('Invalid Firebase Storage URL');
    }

    // Decode the path (Firebase encodes special characters)
    const filePath = decodeURIComponent(pathMatch[1]);

    // Create storage reference and delete
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
    
    toast.success('File deleted successfully');
  } catch (error) {
    console.error('Delete error:', error);
    toast.error('Failed to delete file: ' + error.message);
    throw error;
  }
};

/**
 * Firebase Storage Service Object
 */
export const firebaseStorageService = {
  uploadFile,
  uploadImage,
  uploadVideo,
  deleteFile,
  isConfigured: isFirebaseConfigured,
};

export default firebaseStorageService;





