/**
 * Slug Generation Utilities
 */

/**
 * Normalizes Unicode characters to their ASCII equivalents
 * Handles mathematical bold, italic, and other Unicode variants
 */
const normalizeUnicode = (text) => {
  // Mathematical Bold (U+1D400-U+1D7FF)
  const boldMap = {
    '𝐀': 'A', '𝐁': 'B', '𝐂': 'C', '𝐃': 'D', '𝐄': 'E', '𝐅': 'F', '𝐆': 'G', '𝐇': 'H',
    '𝐈': 'I', '𝐉': 'J', '𝐊': 'K', '𝐋': 'L', '𝐌': 'M', '𝐍': 'N', '𝐎': 'O', '𝐏': 'P',
    '𝐐': 'Q', '𝐑': 'R', '𝐒': 'S', '𝐓': 'T', '𝐔': 'U', '𝐕': 'V', '𝐖': 'W', '𝐗': 'X',
    '𝐘': 'Y', '𝐙': 'Z', '𝐚': 'a', '𝐛': 'b', '𝐜': 'c', '𝐝': 'd', '𝐞': 'e', '𝐟': 'f',
    '𝐠': 'g', '𝐡': 'h', '𝐢': 'i', '𝐣': 'j', '𝐤': 'k', '𝐥': 'l', '𝐦': 'm', '𝐧': 'n',
    '𝐨': 'o', '𝐩': 'p', '𝐪': 'q', '𝐫': 'r', '𝐬': 's', '𝐭': 't', '𝐮': 'u', '𝐯': 'v',
    '𝐰': 'w', '𝐱': 'x', '𝐲': 'y', '𝐳': 'z', '𝟎': '0', '𝟏': '1', '𝟐': '2', '𝟑': '3',
    '𝟒': '4', '𝟓': '5', '𝟔': '6', '𝟕': '7', '𝟖': '8', '𝟗': '9'
  };
  
  // Mathematical Italic (U+1D434-U+1D467)
  const italicMap = {
    '𝐴': 'A', '𝐵': 'B', '𝐶': 'C', '𝐷': 'D', '𝐸': 'E', '𝐹': 'F', '𝐺': 'G', '𝐻': 'H',
    '𝐼': 'I', '𝐽': 'J', '𝐾': 'K', '𝐿': 'L', '𝑀': 'M', '𝑁': 'N', '𝑂': 'O', '𝑃': 'P',
    '𝑄': 'Q', '𝑅': 'R', '𝑆': 'S', '𝑇': 'T', '𝑈': 'U', '𝑉': 'V', '𝑊': 'W', '𝑋': 'X',
    '𝑌': 'Y', '𝑍': 'Z', '𝑎': 'a', '𝑏': 'b', '𝑐': 'c', '𝑑': 'd', '𝑒': 'e', '𝑓': 'f',
    '𝑔': 'g', 'ℎ': 'h', '𝑖': 'i', '𝑗': 'j', '𝑘': 'k', '𝑙': 'l', '𝑚': 'm', '𝑛': 'n',
    '𝑜': 'o', '𝑝': 'p', '𝑞': 'q', '𝑟': 'r', '𝑠': 's', '𝑡': 't', '𝑢': 'u', '𝑣': 'v',
    '𝑤': 'w', '𝑥': 'x', '𝑦': 'y', '𝑧': 'z'
  };
  
  let normalized = text;
  
  // Replace mathematical bold characters
  Object.keys(boldMap).forEach(bold => {
    normalized = normalized.replace(new RegExp(bold, 'g'), boldMap[bold]);
  });
  
  // Replace mathematical italic characters
  Object.keys(italicMap).forEach(italic => {
    normalized = normalized.replace(new RegExp(italic, 'g'), italicMap[italic]);
  });
  
  return normalized;
};

/**
 * Generates a URL-friendly slug from a string
 */
export const generateSlug = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  // First normalize Unicode bold/italic characters to regular ASCII
  let normalized = normalizeUnicode(text);
  
  return normalized
    .toLowerCase()
    .trim()
    // Remove emojis and special Unicode characters
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Emojis
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc symbols
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport
    .replace(/[\u{2600}-\u{26FF}]/gu, '') // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
    .replace(/[^\w\s-]/g, '') // Remove remaining special characters (but keep alphanumeric, spaces, hyphens)
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length to 100 characters
};

/**
 * Validates slug format
 */
export const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

/**
 * Generates unique slug by appending number if needed
 */
export const generateUniqueSlug = (text, existingSlugs = []) => {
  let baseSlug = generateSlug(text);
  let slug = baseSlug;
  let counter = 1;
  
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

