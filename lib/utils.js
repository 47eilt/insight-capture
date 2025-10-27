/**
 * Utility functions for the application
 */

/**
 * Safely parse a URL and return hostname or fallback
 * @param {string} urlString - The URL string to parse
 * @param {string} fallback - Fallback value if URL is invalid
 * @returns {string} The hostname or fallback
 */
export function safeGetHostname(urlString, fallback = 'Invalid URL') {
  try {
    if (!urlString || typeof urlString !== 'string') {
      return fallback;
    }
    const url = new URL(urlString);
    return url.hostname;
  } catch (error) {
    return fallback;
  }
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize text input by removing potential XSS vectors
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';

  // Remove HTML tags and trim whitespace
  return text
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Format date in German locale
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    return 'Invalid date';
  }
}

/**
 * Get count of items from the last N days
 * @param {Array} items - Array of items with created_at field
 * @param {number} days - Number of days to look back
 * @returns {number} Count of items
 */
export function getRecentItemsCount(items, days = 7) {
  if (!Array.isArray(items)) return 0;

  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return items.filter(item => {
    try {
      const itemDate = new Date(item.created_at);
      return itemDate > cutoffDate;
    } catch {
      return false;
    }
  }).length;
}

/**
 * Validate screenshot data URL
 * @param {string} dataUrl - Data URL to validate
 * @returns {boolean} True if valid data URL
 */
export function isValidDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return false;
  return dataUrl.startsWith('data:image/');
}

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 100) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
