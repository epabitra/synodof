/**
 * Content Sanitization Utilities
 * XSS prevention and content cleaning
 */

import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Also preserves line breaks and paragraphs
 */
export const sanitizeHtml = (dirty) => {
  if (!dirty || typeof dirty !== 'string') return '';
  
  // Check if content already contains HTML tags
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(dirty);
  
  let processed = dirty;
  
  if (!hasHtmlTags) {
    // Plain text: convert line breaks to HTML
    // Preserve code blocks (lines starting with spaces/tabs)
    // Double line breaks = new paragraph
    // Single line break = <br>
    
    // First, detect and preserve code blocks (4+ spaces or tabs at start)
    const codeBlockRegex = /^([ \t]{4,}.*(?:\n|$))+/gm;
    const codeBlocks = [];
    let codeBlockIndex = 0;
    
    processed = processed.replace(codeBlockRegex, (match) => {
      const placeholder = `__CODE_BLOCK_${codeBlockIndex}__`;
      codeBlocks[codeBlockIndex] = match;
      codeBlockIndex++;
      return placeholder;
    });
    
    // Now process regular text
    processed = processed
      // First, handle double line breaks (paragraphs)
      .split(/\n\n+/)
      .map(paragraph => {
        // Convert single line breaks within paragraph to <br>
        return paragraph.replace(/\n/g, '<br>');
      })
      .map(paragraph => {
        const trimmed = paragraph.trim();
        return trimmed ? `<p>${trimmed}</p>` : '';
      })
      .filter(p => p) // Remove empty paragraphs
      .join('');
    
    // Restore code blocks wrapped in <pre><code>
    codeBlocks.forEach((codeBlock, index) => {
      const escapedCode = codeBlock
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      processed = processed.replace(`__CODE_BLOCK_${index}__`, `<pre><code>${escapedCode}</code></pre>`);
    });
  } else {
    // Already has HTML, just sanitize it
    // But ensure line breaks in text nodes are preserved
    processed = processed.replace(/\n\n+/g, '</p><p>');
    processed = processed.replace(/\n/g, '<br>');
  }
  
  // Clean up empty paragraphs and br tags
  processed = processed.replace(/<p>\s*<\/p>/g, '');
  processed = processed.replace(/<p><br\s*\/?><\/p>/gi, '');
  
  return DOMPurify.sanitize(processed, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'code', 'pre', 'hr',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'span',
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'width', 'height', 'class',
      'target', 'rel', 'style',
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    KEEP_CONTENT: true,
    // Preserve whitespace in code blocks
    FORBID_TAGS: [],
    FORBID_ATTR: [],
  });
};

/**
 * Sanitizes user input (removes potentially dangerous content)
 */
export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized = {};
    for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
        sanitized[key] = sanitizeInput(input[key]);
      }
    }
    return sanitized;
  }
  return input;
};

/**
 * Sanitizes URL
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return '';
    }
    return urlObj.toString();
  } catch {
    return '';
  }
};

/**
 * Escapes HTML special characters
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

