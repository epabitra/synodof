/**
 * Social Media Icons Utility
 * Provides emoji icons for social media platforms
 */

/**
 * Get social media icon emoji based on platform name or icon field
 * @param {string} platform - Platform name (e.g., "Instagram", "Facebook")
 * @param {string} icon - Icon field from database (can be emoji or text)
 * @returns {string} Emoji icon
 */
export const getSocialIcon = (platform, icon = null) => {
  // If icon is provided and it's an emoji (single character or emoji), use it
  if (icon && icon.trim().length <= 2 && /[\u{1F300}-\u{1F9FF}]/u.test(icon.trim())) {
    return icon.trim();
  }
  
  // If icon is provided and looks like an emoji, use it
  if (icon && /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(icon)) {
    return icon.trim();
  }
  
  // Map platform names to emojis (case-insensitive)
  const platformLower = (platform || '').toLowerCase();
  
  const iconMap = {
    // Social Media Platforms
    instagram: '📷',
    facebook: '📘',
    twitter: '🐦',
    linkedin: '💼',
    youtube: '📺',
    tiktok: '🎵',
    snapchat: '👻',
    pinterest: '📌',
    reddit: '🤖',
    whatsapp: '💬',
    telegram: '✈️',
    discord: '💬',
    github: '💻',
    behance: '🎨',
    dribbble: '🏀',
    medium: '✍️',
    tumblr: '📝',
    vimeo: '🎬',
    
    // Communication
    email: '✉️',
    phone: '📞',
    website: '🌐',
    blog: '📝',
    
    // Default
    default: '🔗',
  };
  
  // Check for partial matches (e.g., "Instagram" contains "instagram")
  for (const [key, emoji] of Object.entries(iconMap)) {
    if (platformLower.includes(key)) {
      return emoji;
    }
  }
  
  return iconMap.default;
};

/**
 * Get social media icon with fallback
 * Uses icon field first, then platform name
 */
export const getSocialIconFromLink = (link) => {
  if (!link) return '🔗';
  
  // Try icon field first
  if (link.icon) {
    const icon = getSocialIcon(link.platform, link.icon);
    if (icon !== '🔗' || link.icon.length <= 2) {
      return icon;
    }
  }
  
  // Fallback to platform name
  return getSocialIcon(link.platform);
};

/**
 * Common social media emojis for reference
 */
export const SOCIAL_ICONS = {
  INSTAGRAM: '📷',
  FACEBOOK: '📘',
  TWITTER: '🐦',
  LINKEDIN: '💼',
  YOUTUBE: '📺',
  TIKTOK: '🎵',
  EMAIL: '✉️',
  WEBSITE: '🌐',
};

