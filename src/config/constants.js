/**
 * Application Constants
 * Centralized configuration for the application
 */

export const API_CONFIG = {
  BASE_URL: import.meta.env.REACT_APP_API_BASE_URL || '',
  TIMEOUT: 60000, // 60 seconds (Google Apps Script can be slow)
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

export const STORAGE_KEYS = {
  AUTH_TOKEN: import.meta.env.REACT_APP_TOKEN_STORAGE_KEY || 'auth_token',
  REFRESH_TOKEN: import.meta.env.REACT_APP_REFRESH_TOKEN_KEY || 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
};

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  BLOG: '/blog',
  BLOG_DETAIL: '/blog/:slug',
  PORTFOLIO: '/portfolio',
  PROGRAM_DETAIL: '/programs/:slug',
  CONTACT: '/contact',
  DONATE: '/donate',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_POSTS: '/admin/posts',
  ADMIN_POST_NEW: '/admin/posts/new',
  ADMIN_POST_EDIT: '/admin/posts/:id/edit',
  ADMIN_MEDIA: '/admin/media',
  ADMIN_CATEGORIES: '/admin/categories',
  ADMIN_CATEGORY_NEW: '/admin/categories/new',
  ADMIN_CATEGORY_EDIT: '/admin/categories/:id/edit',
  ADMIN_AWARDS: '/admin/awards',
  ADMIN_AWARD_NEW: '/admin/awards/new',
  ADMIN_AWARD_EDIT: '/admin/awards/:id/edit',
  ADMIN_PUBLICATIONS: '/admin/publications',
  ADMIN_PUBLICATION_NEW: '/admin/publications/new',
  ADMIN_PUBLICATION_EDIT: '/admin/publications/:id/edit',
  ADMIN_PROFILE: '/admin/profile',
  ADMIN_DONATE: '/admin/donate',
  ADMIN_USERS: '/admin/users',
};

export const API_ACTIONS = {
  // Public actions
  LIST_POSTS: 'listPosts',
  GET_POST: 'getPost',
  GET_PROFILE: 'getProfile',
  GET_SOCIAL_LINKS: 'getSocialLinks',
  GET_CATEGORIES: 'getCategories',
  GET_AWARDS: 'getAwards',
  GET_PUBLICATIONS: 'getPublications',
  GET_TAGS: 'getTags',
  SEARCH_POSTS: 'searchPosts',
  GET_DONATE_INFO: 'getDonateInfo',
  
  // Admin actions
  LOGIN: 'login',
  LOGOUT: 'logout',
  REFRESH_TOKEN: 'refreshToken',
  CREATE_POST: 'createPost',
  UPDATE_POST: 'updatePost',
  DELETE_POST: 'deletePost',
  BULK_DELETE_POSTS: 'bulkDeletePosts',
  UPLOAD_MEDIA: 'uploadMedia',
  GET_MEDIA_FILES: 'getMediaFiles',
  DELETE_MEDIA: 'deleteMedia',
  UPDATE_PROFILE: 'updateProfile',
  LIST_SOCIAL_LINKS: 'listSocialLinks',
  CREATE_SOCIAL_LINK: 'createSocialLink',
  UPDATE_SOCIAL_LINK: 'updateSocialLink',
  DELETE_SOCIAL_LINK: 'deleteSocialLink',
  CHANGE_PASSWORD: 'changePassword',
  CREATE_CATEGORY: 'createCategory',
  UPDATE_CATEGORY: 'updateCategory',
  DELETE_CATEGORY: 'deleteCategory',
  CREATE_AWARD: 'createAward',
  UPDATE_AWARD: 'updateAward',
  DELETE_AWARD: 'deleteAward',
  CREATE_PUBLICATION: 'createPublication',
  UPDATE_PUBLICATION: 'updatePublication',
  DELETE_PUBLICATION: 'deletePublication',
  UPDATE_DONATE_INFO: 'updateDonateInfo',
  LIST_USERS: 'listUsers',
  CREATE_USER: 'createUser',
  DELETE_USER: 'deleteUser',
  CHECK_SUPER_ADMIN: 'checkSuperAdmin',
};

export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export const POST_TYPE = {
  PROGRAMS: 'programs',
  NEWS: 'news',
  BOTH: 'both',
};

export const MEDIA_TYPE = {
  NONE: 'none',
  IMAGE: 'image',
  VIDEO: 'video',
};

export const FILE_UPLOAD = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/quicktime'],
};

export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 12,
  TITLE_MIN_LENGTH: 3,
  TITLE_MAX_LENGTH: 200,
  SLUG_MAX_LENGTH: 200,
  EXCERPT_MAX_LENGTH: 500,
  TAG_MAX_LENGTH: 50,
  MAX_TAGS: 10,
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,
};

export const SECURITY = {
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh token 5 minutes before expiry
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_ATTEMPT_WINDOW: 15 * 60 * 1000, // 15 minutes
};

export const DATE_FORMATS = {
  DISPLAY: 'MMMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMMM dd, yyyy, h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  DATE_ONLY: 'yyyy-MM-dd',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  UPLOAD_ERROR: 'File upload failed. Please try again.',
  GENERIC: 'Something went wrong. Please try again.',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  POST_CREATED: 'Post created successfully',
  POST_UPDATED: 'Post updated successfully',
  POST_DELETED: 'Post deleted successfully',
  MEDIA_UPLOADED: 'Media uploaded successfully',
  MEDIA_DELETED: 'Media deleted successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  SOCIAL_LINK_CREATED: 'Social link added successfully',
  SOCIAL_LINK_UPDATED: 'Social link updated successfully',
  SOCIAL_LINK_DELETED: 'Social link deleted successfully',
  PASSWORD_CHANGED: 'Password changed successfully. Please login again.',
};

export const USER_NAME = "Synodof";
export const ORGANIZATION_NAME = "Berhampur Diocesan Synod";
export const ORGANIZATION_TAGLINE = "Walking with Christ on the Synodal Way";