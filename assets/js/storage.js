/**
 * Storage Helper
 * Wrapper para localStorage con type safety y error handling
 */

const storage = {
  /**
   * Get item from localStorage
   * @param {string} key - Storage key
   * @returns {*} Parsed value or null
   */
  get(key) {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return null;
      
      // Try to parse JSON
      try {
        return JSON.parse(item);
      } catch {
        // Return as string if not JSON
        return item;
      }
    } catch (error) {
      console.error(`Error getting "${key}" from storage:`, error);
      return null;
    }
  },
  
  /**
   * Set item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store (will be JSON.stringify'd)
   */
  set(key, value) {
    try {
      const item = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, item);
    } catch (error) {
      console.error(`Error setting "${key}" in storage:`, error);
    }
  },
  
  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing "${key}" from storage:`, error);
    }
  },
  
  /**
   * Clear all items from localStorage
   */
  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
  
  /**
   * Check if key exists in localStorage
   * @param {string} key - Storage key
   * @returns {boolean} True if key exists
   */
  has(key) {
    return localStorage.getItem(key) !== null;
  },
  
  /**
   * Get all keys in localStorage
   * @returns {Array<string>} Array of keys
   */
  keys() {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Error getting storage keys:', error);
      return [];
    }
  },
  
  /**
   * Get storage size in bytes (approximate)
   * @returns {number} Size in bytes
   */
  size() {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = storage;
}