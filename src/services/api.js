/**
 * API Service
 * Centralized API client with security, error handling, and retry logic
 */

import axios from 'axios';
import { API_CONFIG, API_ACTIONS, ERROR_MESSAGES } from '@/config/constants';
import { tokenStorage, refreshTokenStorage } from '@/utils/storage';
import { ENV } from '@/config/env';

// Create axios instance
const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
  // Google Apps Script redirects POST requests (302) - we need to follow redirects
  maxRedirects: 5,
  // Accept any status code including redirects (Google Apps Script redirects POST to GET)
  validateStatus: function (status) {
    // Accept redirects (3xx), success codes (2xx), and client errors (4xx)
    return status >= 200 && status < 500;
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get();
    
    // For Google Apps Script, avoid Authorization header to prevent CORS preflight
    // GET requests: Token should be in query params (adminAPI methods handle this)
    // POST requests: Token should be in form data body (adminAPI methods handle this)
    // We don't add Authorization header as it triggers CORS preflight for GET requests
    // Note: adminAPI methods already add token to params/body, so we don't need to add it here
    
    // Only add default action for GET requests with params
    // POST requests should have action in the body, not params
    if (config.method === 'get' && config.params) {
      // Only set default action if not already specified
      if (!config.params.action) {
        config.params.action = API_ACTIONS.LIST_POSTS;
      }
    } else if (config.method === 'get' && !config.params) {
      // For GET requests without params, add default action
      config.params = { action: API_ACTIONS.LIST_POSTS };
    }
    // For POST requests, don't modify params - action should be in body
    
    // Debug logging
    if (ENV.ENABLE_DEBUG || ENV.IS_DEVELOPMENT) {
      console.log('API Request:', {
        url: config.url,
        method: config.method,
        params: config.params,
        data: config.data,
        baseURL: config.baseURL,
        hasToken: !!token,
      });
    }
    
    return config;
  },
  (error) => {
    if (ENV.ENABLE_DEBUG || ENV.IS_DEVELOPMENT) {
      console.error('API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Debug logging
    if (ENV.ENABLE_DEBUG || ENV.IS_DEVELOPMENT) {
      console.log('📥 API Response:', {
        url: response.config.url,
        finalUrl: response.request?.responseURL || response.config.url,
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        dataType: typeof response.data,
        isString: typeof response.data === 'string',
        isObject: typeof response.data === 'object',
      });
    }
    
    // Google Apps Script returns data directly, but sometimes as string
    // After redirect, the response might be parsed automatically by axios
    let responseData = response.data;
    
    // If data is already an object, return it directly (axios might have parsed it)
    if (typeof responseData === 'object' && responseData !== null) {
      // Check if it's already the JSON we want
      if (ENV.ENABLE_DEBUG || ENV.IS_DEVELOPMENT) {
        console.log('📥 Response is already an object:', responseData);
      }
      return responseData;
    }
    
    // If data is a string, try to parse it as JSON
    if (typeof responseData === 'string') {
      // Trim whitespace first
      responseData = responseData.trim();
      
      // If empty string, return empty object
      if (responseData === '') {
        console.warn('⚠️ Empty response received');
        return {};
      }
      
      try {
        const parsed = JSON.parse(responseData);
        if (ENV.ENABLE_DEBUG || ENV.IS_DEVELOPMENT) {
          console.log('📥 Parsed response data from string:', parsed);
        }
        return parsed;
      } catch (e) {
        // If parsing fails, it might be HTML (wrong URL) or plain text
        if (responseData.includes('<!doctype html>') || responseData.includes('<html>')) {
          console.error('❌ Received HTML instead of JSON. API URL might be incorrect.');
          throw new Error('API returned HTML instead of JSON. Please check VITE_API_BASE_URL in .env file.');
        }
        // Return as-is if it's not JSON
        if (ENV.ENABLE_DEBUG || ENV.IS_DEVELOPMENT) {
          console.warn('⚠️ Response is not JSON:', responseData.substring(0, 100));
        }
        // Try to return as error response
        return {
          success: false,
          error: {
            message: 'Invalid response format',
            raw: responseData.substring(0, 200),
          },
        };
      }
    }
    
    // Fallback: return the data as-is
    return responseData;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Debug logging
    if (ENV.ENABLE_DEBUG || ENV.IS_DEVELOPMENT) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message: error.message,
        code: error.code,
        response: error.response?.data,
        baseURL: error.config?.baseURL,
        hasRequest: !!error.request,
        hasResponse: !!error.response,
      });
    }
    
    // Check if API base URL is missing - but don't crash, just warn
    if (!ENV.API_BASE_URL || ENV.API_BASE_URL === '') {
      console.warn('API_BASE_URL is not set! API calls will fail. Using mock data as fallback.');
      console.warn('To fix: Create .env.production file with REACT_APP_API_BASE_URL');
      // Don't reject - let the calling code handle it with mock data
      return Promise.reject({
        message: 'API endpoint not configured. Using mock data.',
        code: 'API_NOT_CONFIGURED',
        useMockData: true,
      });
    }
    
    // Detect CORS errors early
    if (!error.response && error.request) {
      // No response but request was made - likely CORS or network issue
      if (error.code === 'ERR_NETWORK' || 
          error.message.includes('CORS') || 
          error.message.includes('Access-Control') ||
          error.message.includes('Cross-Origin')) {
        const corsError = {
          message: 'CORS Error: The server is blocking requests from this origin.\n\n' +
                   'Please verify:\n' +
                   '1. Google Apps Script Web App deployment: "Who has access" must be "Anyone"\n' +
                   '2. Script Properties: ALLOWED_ORIGINS should include your origin\n' +
                   '3. Redeploy the Web App after making changes\n' +
                   '4. Check browser console for detailed CORS error message',
          code: 'CORS_ERROR',
          isCorsError: true,
        };
        console.error('🚫 CORS ERROR:', corsError);
        return Promise.reject(corsError);
      }
    }

    // Handle 401 Unauthorized - Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = refreshTokenStorage.get();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Attempt to refresh token - use form data to avoid CORS
        const params = new URLSearchParams();
        params.append('action', API_ACTIONS.REFRESH_TOKEN);
        params.append('refreshToken', refreshToken);
        
        const response = await axios.post(ENV.API_BASE_URL, params.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        });

        // Response might be string or object after redirect
        let responseData = response.data;
        if (typeof responseData === 'string') {
          try {
            responseData = JSON.parse(responseData);
          } catch (e) {
            throw new Error('Invalid response format');
          }
        }

        const { token, refreshToken: newRefreshToken } = responseData.data || responseData;

        if (token) {
          tokenStorage.set(token);
          if (newRefreshToken) {
            refreshTokenStorage.set(newRefreshToken);
          }

          // Retry original request with new token
          // For GET requests, add token to params instead of headers
          if (originalRequest.method === 'get' || originalRequest.method === 'GET') {
            if (!originalRequest.params) {
              originalRequest.params = {};
            }
            originalRequest.params.token = token;
          } else {
            // For POST requests, token should be in form data body
            // The request will be retried with the token in the body
            if (!originalRequest.params) {
              originalRequest.params = {};
            }
            originalRequest.params.token = token;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - clear storage and redirect to login
        tokenStorage.remove();
        refreshTokenStorage.remove();
        
        if (window.location.pathname.startsWith('/journalist-portfolio/admin') || 
            window.location.pathname.startsWith('/admin')) {
          window.location.href = '/journalist-portfolio/admin/login';
        }
        
        return Promise.reject({
          message: ERROR_MESSAGES.UNAUTHORIZED,
          code: 'TOKEN_REFRESH_FAILED',
        });
      }
    }

    // Handle other errors
    const errorMessage = getErrorMessage(error);
    return Promise.reject({
      message: errorMessage,
      code: error.response?.status || 'UNKNOWN_ERROR',
      data: error.response?.data,
    });
  }
);

/**
 * Gets user-friendly error message
 */
const getErrorMessage = (error) => {
  // Check for CORS errors specifically
  if (error.message && (
    error.message.includes('CORS') || 
    error.message.includes('Access-Control') ||
    error.message.includes('Cross-Origin')
  )) {
    return 'CORS Error: The server is blocking requests from this origin. Please check:\n' +
           '1. Google Apps Script Web App is deployed with "Who has access: Anyone"\n' +
           '2. ALLOWED_ORIGINS in Script Properties includes your URL\n' +
           '3. The Web App has been redeployed after updating CORS settings';
  }
  
  // Check if it's a network/CORS error (request made but no response)
  if (error.request && !error.response) {
    // Check error code for CORS-related issues
    if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CANCELED') {
      // This is likely a CORS error
      return 'CORS Error: Unable to connect to server. The request was blocked by CORS policy.\n\n' +
             'Please verify:\n' +
             '1. Google Apps Script Web App deployment: "Who has access" must be "Anyone"\n' +
             '2. Script Properties: ALLOWED_ORIGINS should include your origin\n' +
             '3. Redeploy the Web App after making changes\n' +
             '4. Check browser console for detailed CORS error message';
    }
    
    // Check if it's a timeout
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'Request timed out. Google Apps Script might be slow. Please try again.';
    }
    
    // Generic network error
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (data?.error?.message) {
      return data.error.message;
    }

    switch (status) {
      case 400:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
      case 502:
      case 503:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.GENERIC;
    }
  }

  return ERROR_MESSAGES.GENERIC;
};

/**
 * API Methods
 */

// Public API methods
export const publicAPI = {
  /**
   * Get list of published posts
   */
  listPosts: async (params = {}) => {
    return apiClient.get('', {
      params: {
        action: API_ACTIONS.LIST_POSTS,
        ...params,
      },
    });
  },

  /**
   * Get single post by slug
   */
  getPost: async (slug) => {
    return apiClient.get('', {
      params: {
        action: API_ACTIONS.GET_POST,
        slug,
      },
    });
  },

  /**
   * Get profile information
   */
  getProfile: async () => {
    return apiClient.get('', {
      params: {
        action: API_ACTIONS.GET_PROFILE,
      },
    });
  },

  /**
   * Get social links
   */
  getSocialLinks: async () => {
    return apiClient.get('', {
      params: {
        action: API_ACTIONS.GET_SOCIAL_LINKS,
      },
    });
  },

  /**
   * Get categories
   */
  getCategories: async () => {
    return apiClient.get('', {
      params: {
        action: API_ACTIONS.GET_CATEGORIES,
      },
    });
  },

  /**
   * Get tags
   */
  getTags: async () => {
    return apiClient.get('', {
      params: {
        action: API_ACTIONS.GET_TAGS,
      },
    });
  },

  /**
   * Get awards
   */
  getAwards: async () => {
    return apiClient.get('', {
      params: {
        action: API_ACTIONS.GET_AWARDS,
      },
    });
  },

  /**
   * Get publications
   */
  getPublications: async () => {
    return apiClient.get('', {
      params: {
        action: API_ACTIONS.GET_PUBLICATIONS,
      },
    });
  },

  /**
   * Search posts
   */
  searchPosts: async (query, params = {}) => {
    return apiClient.get('', {
      params: {
        action: API_ACTIONS.SEARCH_POSTS,
        query,
        ...params,
      },
    });
  },
};

// Admin API methods (require authentication)
export const adminAPI = {
  /**
   * Login
   */
  login: async (email, password) => {
    try {
      // Check if API URL is configured
      if (!ENV.API_BASE_URL || ENV.API_BASE_URL === '') {
        const errorMsg = 'API_BASE_URL is not configured. Please set VITE_API_BASE_URL in your .env file.\n' +
          'Note: In Vite, environment variables must use VITE_ prefix (not REACT_APP_).';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      // Check if API URL is pointing to localhost (wrong!)
      if (ENV.API_BASE_URL.includes('localhost:3000') || ENV.API_BASE_URL.includes('127.0.0.1:3000')) {
        const errorMsg = 'API_BASE_URL is pointing to localhost:3000 (Vite dev server). This is incorrect!\n\n' +
          'Please set VITE_API_BASE_URL to your Google Apps Script Web App URL:\n' +
          'Example: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec\n\n' +
          'Current value: ' + ENV.API_BASE_URL + '\n\n' +
          'Note: In Vite, use VITE_ prefix, not REACT_APP_';
        console.error('❌', errorMsg);
        throw new Error('API_BASE_URL is incorrectly configured. Please set VITE_API_BASE_URL to your Google Apps Script URL.');
      }

      console.log('🔐 Attempting login:', {
        email,
        apiUrl: ENV.API_BASE_URL,
        payload: { action: API_ACTIONS.LOGIN, email, password: '***' }
      });

      // WORKAROUND: Use URLSearchParams to avoid CORS preflight issue
      // Google Apps Script Web Apps have known issues with POST + JSON Content-Type
      // URLSearchParams (application/x-www-form-urlencoded) doesn't trigger preflight
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.LOGIN);
      params.append('email', email);
      params.append('password', password);

      // Make sure we're not adding params to POST requests
      // Increase timeout for Google Apps Script which can be slow
      const response = await apiClient.post('', params.toString(), {
        // Explicitly don't add params to POST requests
        params: {},
        timeout: 60000, // 60 seconds for Google Apps Script
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // This doesn't trigger preflight
        },
        validateStatus: function (status) {
          // Accept any status code as valid (Google Apps Script might return 200 even on errors)
          return status >= 200 && status < 500;
        },
      });
      
      console.log('✅ Login response received:', response);
      console.log('Response status:', response?.status || 'no status');
      console.log('Response data type:', typeof response);
      console.log('Response data:', response);
      
      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      
      // Check if response is HTML (means wrong URL)
      if (error.response && typeof error.response.data === 'string' && error.response.data.includes('<!doctype html>')) {
        const errorMsg = 'Received HTML instead of JSON response. This means API_BASE_URL is pointing to the wrong URL.\n\n' +
          'Current API_BASE_URL: ' + ENV.API_BASE_URL + '\n\n' +
          'This should be your Google Apps Script Web App URL, not localhost!\n' +
          'Example: https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec\n\n' +
          'Please update VITE_API_BASE_URL in your .env file and restart the dev server.\n' +
          'Note: In Vite, use VITE_ prefix, not REACT_APP_';
        console.error('❌', errorMsg);
        throw new Error('API URL is incorrect - receiving HTML instead of JSON. Please set VITE_API_BASE_URL to your Google Apps Script URL.');
      }

      // Detailed error logging
      if (error.response) {
        // Server responded with error status
        console.error('Server Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        // Request was made but no response received - likely CORS or network issue
        console.error('❌ No Response Received:', {
          message: error.message,
          code: error.code,
          request: error.request,
          url: error.config?.url,
          method: error.config?.method,
        });
        
        // Check for CORS error
        if (error.code === 'ERR_NETWORK' || error.message.includes('CORS') || error.message.includes('Access-Control')) {
          console.error('🚫 CORS ERROR DETECTED!');
          console.error('This means the browser blocked the request due to CORS policy.');
          console.error('');
          console.error('🔧 FIX STEPS:');
          console.error('1. Go to Google Apps Script → Deploy → Manage deployments');
          console.error('2. Click Edit (pencil icon) on your Web App');
          console.error('3. Make sure "Who has access" is set to "Anyone" (NOT "Only myself")');
          console.error('4. Click "Deploy" to save');
          console.error('5. In Script Properties, set ALLOWED_ORIGINS to:');
          console.error('   http://localhost:3000,http://localhost:5173,https://epabitra3.github.io');
          console.error('6. Redeploy the Web App');
          console.error('7. Clear browser cache and try again');
        } else {
          console.error('This usually means:');
          console.error('1. Request timed out - Google Apps Script might be slow');
          console.error('2. CORS issue - check Google Apps Script CORS settings');
          console.error('3. Network connectivity issue');
          console.error('4. Google Apps Script not deployed or URL is wrong');
          console.error('5. Google Apps Script execution error - check execution log');
        }
        
        // Check if it's a timeout
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          console.error('⏱️ Request timed out. Google Apps Script might be taking too long to respond.');
          console.error('💡 Try:');
          console.error('   - Check Google Apps Script execution log for errors');
          console.error('   - Verify the script is deployed correctly');
          console.error('   - Check if Script Properties are set correctly');
        }
      } else {
        // Error setting up the request
        console.error('Request Setup Error:', error.message);
      }
      
      // Provide user-friendly error message
      let userMessage = 'Login failed. ';
      
      // Check for CORS error first
      if (error.code === 'ERR_NETWORK' || 
          error.message.includes('CORS') || 
          error.message.includes('Access-Control') ||
          (!error.response && error.request)) {
        userMessage = 'CORS Error: Unable to connect to server.\n\n';
        userMessage += 'The request was blocked by CORS policy. Please:\n';
        userMessage += '1. Go to Google Apps Script → Deploy → Manage deployments\n';
        userMessage += '2. Edit your Web App deployment\n';
        userMessage += '3. Set "Who has access" to "Anyone" (NOT "Only myself")\n';
        userMessage += '4. Redeploy the Web App\n';
        userMessage += '5. Check Script Properties: ALLOWED_ORIGINS should include your URL\n';
        userMessage += '6. Clear browser cache and try again';
      } else if (error.code === 'ECONNABORTED') {
        userMessage += 'Request timed out. Please check your internet connection and try again.';
      } else if (error.response?.status === 401) {
        userMessage += 'Invalid email or password.';
      } else if (error.response?.status >= 500) {
        userMessage += 'Server error. Please try again later.';
      } else {
        userMessage += error.message || 'Unknown error occurred.';
      }
      
      throw new Error(userMessage);
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      const token = tokenStorage.get();
      // Use form data to avoid CORS preflight
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.LOGOUT);
      params.append('token', token || '');
      
      await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenStorage.remove();
      refreshTokenStorage.remove();
    }
  },

  /**
   * List posts (admin version - can see all statuses)
   */
  listPosts: async (params = {}) => {
    try {
      const token = tokenStorage.get();
      return apiClient.get('', {
        params: {
          action: API_ACTIONS.LIST_POSTS,
          token,
          ...params,
        },
      });
    } catch (error) {
      console.error('List posts error:', error);
      throw error;
    }
  },

  /**
   * Get single post by ID (admin version)
   */
  getPost: async (id) => {
    try {
      const token = tokenStorage.get();
      // First try to get by ID, if not found try by slug
      const response = await apiClient.get('', {
        params: {
          action: API_ACTIONS.GET_POST,
          id,
          token,
        },
      });
      return response;
    } catch (error) {
      console.error('Get post error:', error);
      // If ID lookup fails, try slug lookup
      try {
        const token = tokenStorage.get();
        return apiClient.get('', {
          params: {
            action: API_ACTIONS.GET_POST,
            slug: id,
            token,
          },
        });
      } catch (slugError) {
        throw error;
      }
    }
  },

  /**
   * Create new post
   */
  createPost: async (postData) => {
    try {
      const token = tokenStorage.get();
      // Use form data to avoid CORS preflight
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.CREATE_POST);
      params.append('token', token || '');
      
      // Add all post data fields
      Object.keys(postData).forEach(key => {
        const value = postData[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(', '));
          } else {
            params.append(key, String(value));
          }
        }
      });
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  },

  /**
   * Update existing post
   */
  updatePost: async (id, postData) => {
    try {
      const token = tokenStorage.get();
      // Use form data to avoid CORS preflight
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.UPDATE_POST);
      params.append('id', id);
      params.append('token', token || '');
      
      // Add all post data fields
      Object.keys(postData).forEach(key => {
        const value = postData[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(', '));
          } else {
            params.append(key, String(value));
          }
        }
      });
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Update post error:', error);
      throw error;
    }
  },

  /**
   * Delete post
   */
  deletePost: async (id) => {
    try {
      const token = tokenStorage.get();
      // Use form data to avoid CORS preflight
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.DELETE_POST);
      params.append('id', id);
      params.append('token', token || '');
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Delete post error:', error);
      throw error;
    }
  },

  /**
   * Upload media file
   * WORKAROUND: Convert file to base64 and send as URL-encoded form data
   * This avoids CORS preflight issues with multipart/form-data
   */
  uploadMedia: async (file, onProgress) => {
    try {
      const token = tokenStorage.get();
      
      // Convert file to base64 to avoid CORS preflight with multipart/form-data
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async () => {
          try {
            // Get base64 string (remove data:type;base64, prefix)
            const base64String = reader.result.split(',')[1];
            const fileName = file.name;
            const fileType = file.type;
            
            // Simulate progress for base64 conversion
            if (onProgress) {
              onProgress(30); // Conversion complete
            }
            
            // Use URL-encoded form data (doesn't trigger preflight)
            // Note: URLSearchParams automatically URL-encodes values, which is good for base64
            const params = new URLSearchParams();
            params.append('action', API_ACTIONS.UPLOAD_MEDIA);
            params.append('token', token || '');
            // Base64 string will be automatically URL-encoded by URLSearchParams
            // This is safe - Google Apps Script will decode it automatically
            params.append('file', base64String);
            params.append('fileName', fileName);
            params.append('fileType', fileType);
            
            // Simulate progress
            if (onProgress) {
              onProgress(50);
            }
            
            const response = await apiClient.post('', params.toString(), {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              timeout: 120000, // 2 minutes for large files
            });
            
            if (onProgress) {
              onProgress(100);
            }
            
            resolve(response);
          } catch (error) {
            console.error('Upload media error:', error);
            reject(error);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        // Start reading file as base64
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Upload media error:', error);
      throw error;
    }
  },

  /**
   * Get categories (admin version)
   */
  getCategories: async () => {
    try {
      const token = tokenStorage.get();
      return apiClient.get('', {
        params: {
          action: API_ACTIONS.GET_CATEGORIES,
          token: token || '',
        },
      });
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  },

  /**
   * Create category
   */
  createCategory: async (categoryData) => {
    try {
      const token = tokenStorage.get();
      // Use form data to avoid CORS preflight
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.CREATE_CATEGORY);
      params.append('token', token || '');
      
      // Add all category data fields
      Object.keys(categoryData).forEach(key => {
        const value = categoryData[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(', '));
          } else {
            params.append(key, String(value));
          }
        }
      });
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  },

  /**
   * Update category
   */
  updateCategory: async (id, categoryData) => {
    try {
      const token = tokenStorage.get();
      // Use form data to avoid CORS preflight
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.UPDATE_CATEGORY);
      params.append('token', token || '');
      params.append('id', id);
      
      // Add all category data fields
      Object.keys(categoryData).forEach(key => {
        const value = categoryData[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(', '));
          } else {
            params.append(key, String(value));
          }
        }
      });
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  },

  /**
   * Delete category
   */
  deleteCategory: async (id) => {
    try {
      const token = tokenStorage.get();
      // Use form data to avoid CORS preflight
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.DELETE_CATEGORY);
      params.append('id', id);
      params.append('token', token || '');
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  },

  /**
   * Get awards (admin can see all, including inactive)
   */
  getAwards: async () => {
    try {
      const token = tokenStorage.get();
      return apiClient.get('', {
        params: {
          action: API_ACTIONS.GET_AWARDS,
          token: token || '',
        },
      });
    } catch (error) {
      console.error('Get awards error:', error);
      throw error;
    }
  },

  /**
   * Create award
   */
  createAward: async (awardData) => {
    try {
      const token = tokenStorage.get();
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.CREATE_AWARD);
      params.append('token', token || '');
      
      Object.keys(awardData).forEach(key => {
        const value = awardData[key];
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Create award error:', error);
      throw error;
    }
  },

  /**
   * Update award
   */
  updateAward: async (id, awardData) => {
    try {
      const token = tokenStorage.get();
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.UPDATE_AWARD);
      params.append('token', token || '');
      params.append('id', id);
      
      Object.keys(awardData).forEach(key => {
        const value = awardData[key];
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Update award error:', error);
      throw error;
    }
  },

  /**
   * Delete award
   */
  deleteAward: async (id) => {
    try {
      const token = tokenStorage.get();
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.DELETE_AWARD);
      params.append('id', id);
      params.append('token', token || '');
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Delete award error:', error);
      throw error;
    }
  },

  /**
   * Get publications (admin can see all, including inactive)
   */
  getPublications: async () => {
    try {
      const token = tokenStorage.get();
      return apiClient.get('', {
        params: {
          action: API_ACTIONS.GET_PUBLICATIONS,
          token: token || '',
        },
      });
    } catch (error) {
      console.error('Get publications error:', error);
      throw error;
    }
  },

  /**
   * Create publication
   */
  createPublication: async (publicationData) => {
    try {
      const token = tokenStorage.get();
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.CREATE_PUBLICATION);
      params.append('token', token || '');
      
      Object.keys(publicationData).forEach(key => {
        const value = publicationData[key];
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Create publication error:', error);
      throw error;
    }
  },

  /**
   * Update publication
   */
  updatePublication: async (id, publicationData) => {
    try {
      const token = tokenStorage.get();
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.UPDATE_PUBLICATION);
      params.append('token', token || '');
      params.append('id', id);
      
      Object.keys(publicationData).forEach(key => {
        const value = publicationData[key];
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Update publication error:', error);
      throw error;
    }
  },

  /**
   * Delete publication
   */
  deletePublication: async (id) => {
    try {
      const token = tokenStorage.get();
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.DELETE_PUBLICATION);
      params.append('id', id);
      params.append('token', token || '');
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Delete publication error:', error);
      throw error;
    }
  },

  /**
   * Update profile information
   */
  updateProfile: async (profileData) => {
    try {
      const token = tokenStorage.get();
      // Use form data to avoid CORS preflight
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.UPDATE_PROFILE);
      params.append('token', token || '');
      
      // Add all profile data fields
      Object.keys(profileData).forEach(key => {
        const value = profileData[key];
        if (value !== null && value !== undefined) {
          if (Array.isArray(value)) {
            params.append(key, value.join(', '));
          } else {
            params.append(key, String(value));
          }
        }
      });
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  /**
   * Get profile (admin version - can see all fields)
   */
  getProfile: async () => {
    try {
      const token = tokenStorage.get();
      return apiClient.get('', {
        params: {
          action: API_ACTIONS.GET_PROFILE,
          token: token || '',
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  /**
   * List social links (admin version)
   */
  listSocialLinks: async () => {
    try {
      const token = tokenStorage.get();
      return apiClient.get('', {
        params: {
          action: API_ACTIONS.LIST_SOCIAL_LINKS,
          token: token || '',
        },
      });
    } catch (error) {
      console.error('List social links error:', error);
      throw error;
    }
  },

  /**
   * Create social link
   */
  createSocialLink: async (linkData) => {
    try {
      const token = tokenStorage.get();
      // Use form data to avoid CORS preflight
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.CREATE_SOCIAL_LINK);
      params.append('token', token || '');
      
      // Add all link data fields
      Object.keys(linkData).forEach(key => {
        const value = linkData[key];
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Create social link error:', error);
      throw error;
    }
  },

  /**
   * Update social link
   */
  updateSocialLink: async (id, linkData) => {
    try {
      const token = tokenStorage.get();
      // Use form data to avoid CORS preflight
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.UPDATE_SOCIAL_LINK);
      params.append('id', id);
      params.append('token', token || '');
      
      // Add all link data fields
      Object.keys(linkData).forEach(key => {
        const value = linkData[key];
        if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Update social link error:', error);
      throw error;
    }
  },

  /**
   * Delete social link
   */
  deleteSocialLink: async (id) => {
    try {
      const token = tokenStorage.get();
      // Use form data to avoid CORS preflight
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.DELETE_SOCIAL_LINK);
      params.append('id', id);
      params.append('token', token || '');
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Delete social link error:', error);
      throw error;
    }
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    try {
      const token = tokenStorage.get();
      if (!token) {
        throw new Error('Authentication required');
      }

      // Use form data to avoid CORS preflight
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.CHANGE_PASSWORD);
      params.append('token', token);
      params.append('currentPassword', currentPassword);
      params.append('newPassword', newPassword);
      params.append('confirmPassword', confirmPassword);
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  /**
   * Get media files
   */
  getMediaFiles: async (params = {}) => {
    try {
      const token = tokenStorage.get();
      return apiClient.get('', {
        params: {
          action: API_ACTIONS.GET_MEDIA_FILES,
          token: token || '',
          ...params,
        },
      });
    } catch (error) {
      console.error('Get media files error:', error);
      throw error;
    }
  },

  /**
   * Delete media file
   */
  deleteMedia: async (fileId) => {
    try {
      const token = tokenStorage.get();
      // Use form data to avoid CORS preflight
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.DELETE_MEDIA);
      params.append('fileId', fileId);
      params.append('token', token || '');
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Delete media error:', error);
      throw error;
    }
  },

  /**
   * Refresh authentication token
   */
  refreshToken: async (refreshToken) => {
    try {
      // Use form data to avoid CORS preflight
      const params = new URLSearchParams();
      params.append('action', API_ACTIONS.REFRESH_TOKEN);
      params.append('refreshToken', refreshToken);
      
      const response = await apiClient.post('', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      return response;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },
};

export default apiClient;

