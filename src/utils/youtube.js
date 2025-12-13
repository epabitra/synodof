/**
 * YouTube URL Utilities
 * Functions to extract and convert YouTube URLs
 */

/**
 * Extracts YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID&feature=share
 */
export const extractYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  // Remove whitespace
  url = url.trim();
  
  // YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Direct video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Validates if a URL is a valid YouTube URL
 */
export const isValidYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  const videoId = extractYouTubeId(url);
  return videoId !== null && videoId.length === 11;
};

/**
 * Converts YouTube URL to embed URL
 */
export const getYouTubeEmbedUrl = (url) => {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  
  return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * Converts YouTube URL to watch URL (standard format)
 */
export const getYouTubeWatchUrl = (url) => {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  
  return `https://www.youtube.com/watch?v=${videoId}`;
};

