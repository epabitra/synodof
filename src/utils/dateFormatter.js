/**
 * Date Formatting Utilities
 */

import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { DATE_FORMATS } from '@/config/constants';

/**
 * Formats date for display
 */
export const formatDate = (date, formatStr = DATE_FORMATS.DISPLAY) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatStr);
  } catch {
    return '';
  }
};

/**
 * Formats date with time
 */
export const formatDateTime = (date) => {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME);
};

/**
 * Returns relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return formatDistanceToNow(dateObj, { addSuffix: true });
  } catch {
    return '';
  }
};

/**
 * Formats date for ISO string
 */
export const formatISO = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return dateObj.toISOString();
  } catch {
    return '';
  }
};

/**
 * Gets current date as ISO string
 */
export const getCurrentISO = () => {
  return new Date().toISOString();
};

/**
 * Converts ISO date string to local datetime-local format (YYYY-MM-DDTHH:mm)
 * For use with HTML datetime-local input
 */
export const isoToLocalDateTime = (isoString) => {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    if (!isValid(date)) return '';
    
    // Get local date components
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
};

/**
 * Gets current date in local datetime-local format
 */
export const getCurrentLocalDateTime = () => {
  return isoToLocalDateTime(new Date().toISOString());
};

/**
 * Converts local datetime-local string to ISO format
 * For saving to database
 */
export const localDateTimeToISO = (localDateTime) => {
  if (!localDateTime) return null;
  
  try {
    // datetime-local format: "YYYY-MM-DDTHH:mm"
    // Create date in local timezone, then convert to ISO
    const date = new Date(localDateTime);
    if (!isValid(date)) return null;
    
    return date.toISOString();
  } catch {
    return null;
  }
};

