/**
 * Input Validation Utilities
 * Security-first validation functions
 */

import { VALIDATION } from '@/config/constants';

/**
 * Validates email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates password strength
 */
export const isValidPassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) return false;
  
  // Check for at least one uppercase, one lowercase, one number, one special char
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return hasUpper && hasLower && hasNumber && hasSpecial;
};

/**
 * Validates password strength with detailed feedback
 */
export const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  return { valid: true, message: 'Password is valid' };
};

/**
 * Validates URL format
 */
export const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Validates slug format (alphanumeric, hyphens, underscores)
 */
export const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= VALIDATION.SLUG_MAX_LENGTH;
};

/**
 * Validates title
 */
export const isValidTitle = (title) => {
  if (!title || typeof title !== 'string') return false;
  const trimmed = title.trim();
  return (
    trimmed.length >= VALIDATION.TITLE_MIN_LENGTH &&
    trimmed.length <= VALIDATION.TITLE_MAX_LENGTH
  );
};

/**
 * Validates excerpt
 */
export const isValidExcerpt = (excerpt) => {
  if (!excerpt || typeof excerpt !== 'string') return true; // Optional
  return excerpt.trim().length <= VALIDATION.EXCERPT_MAX_LENGTH;
};

/**
 * Validates tags array
 */
export const isValidTags = (tags) => {
  if (!Array.isArray(tags)) return false;
  if (tags.length > VALIDATION.MAX_TAGS) return false;
  
  return tags.every((tag) => {
    if (typeof tag !== 'string') return false;
    const trimmed = tag.trim();
    return trimmed.length > 0 && trimmed.length <= VALIDATION.TAG_MAX_LENGTH;
  });
};

/**
 * Sanitizes string input (removes dangerous characters)
 */
export const sanitizeString = (input) => {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validates file type
 */
export const isValidFileType = (file, allowedTypes) => {
  if (!file || !file.type) return false;
  return allowedTypes.includes(file.type);
};

/**
 * Validates file size
 */
export const isValidFileSize = (file, maxSize) => {
  if (!file || !file.size) return false;
  return file.size <= maxSize;
};

/**
 * Validates date string
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validates post data
 */
export const validatePostData = (data) => {
  const errors = [];

  if (!isValidTitle(data.title)) {
    errors.push('Title must be between 3 and 200 characters');
  }

  if (data.slug && !isValidSlug(data.slug)) {
    errors.push('Invalid slug format');
  }

  if (!isValidExcerpt(data.excerpt)) {
    errors.push('Excerpt must be less than 500 characters');
  }

  if (data.cover_image_url && !isValidUrl(data.cover_image_url)) {
    errors.push('Invalid cover image URL');
  }

  if (data.media_url && !isValidUrl(data.media_url)) {
    errors.push('Invalid media URL');
  }

  if (data.tags && !isValidTags(data.tags)) {
    errors.push(`Tags must be an array with max ${VALIDATION.MAX_TAGS} items`);
  }

  if (data.published_at && !isValidDate(data.published_at)) {
    errors.push('Invalid published date');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

