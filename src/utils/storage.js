/**
 * Secure Storage Utilities
 * Handles localStorage and sessionStorage with error handling
 */

import { STORAGE_KEYS } from '@/config/constants';

/**
 * Safely gets item from storage
 */
const getStorageItem = (key, storage = localStorage) => {
  try {
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from storage (${key}):`, error);
    return null;
  }
};

/**
 * Safely sets item in storage
 */
const setStorageItem = (key, value, storage = localStorage) => {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to storage (${key}):`, error);
    return false;
  }
};

/**
 * Safely removes item from storage
 */
const removeStorageItem = (key, storage = localStorage) => {
  try {
    storage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from storage (${key}):`, error);
    return false;
  }
};

/**
 * Token storage
 */
export const tokenStorage = {
  get: () => getStorageItem(STORAGE_KEYS.AUTH_TOKEN),
  set: (token) => setStorageItem(STORAGE_KEYS.AUTH_TOKEN, token),
  remove: () => removeStorageItem(STORAGE_KEYS.AUTH_TOKEN),
};

/**
 * Refresh token storage
 */
export const refreshTokenStorage = {
  get: () => getStorageItem(STORAGE_KEYS.REFRESH_TOKEN),
  set: (token) => setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, token),
  remove: () => removeStorageItem(STORAGE_KEYS.REFRESH_TOKEN),
};

/**
 * User data storage
 */
export const userStorage = {
  get: () => getStorageItem(STORAGE_KEYS.USER_DATA),
  set: (user) => setStorageItem(STORAGE_KEYS.USER_DATA, user),
  remove: () => removeStorageItem(STORAGE_KEYS.USER_DATA),
};

/**
 * Clears all auth-related storage
 */
export const clearAuthStorage = () => {
  tokenStorage.remove();
  refreshTokenStorage.remove();
  userStorage.remove();
};

/**
 * Session storage utilities (for temporary data)
 */
export const sessionStorage = {
  get: (key) => getStorageItem(key, window.sessionStorage),
  set: (key, value) => setStorageItem(key, value, window.sessionStorage),
  remove: (key) => removeStorageItem(key, window.sessionStorage),
  clear: () => {
    try {
      window.sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing session storage:', error);
    }
  },
};

