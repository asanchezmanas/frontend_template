/**
 * Page Data Helper
 * 
 * Easy access to backend-injected configuration and data
 * Works with window.__CONFIG__, window.__PAGE__, and initial-data
 */

class PageData {
  constructor() {
    this.config = window.__CONFIG__ || {};
    this.page = window.__PAGE__ || {};
    this.initialData = this.loadInitialData();
  }

  /**
   * Load initial data from script tag
   */
  loadInitialData() {
    const script = document.getElementById('initial-data');
    if (script) {
      try {
        return JSON.parse(script.textContent);
      } catch (error) {
        console.error('Failed to parse initial data:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Get configuration value
   */
  getConfig(key, defaultValue = null) {
    return this.config[key] ?? defaultValue;
  }

  /**
   * Get page value
   */
  getPage(key, defaultValue = null) {
    return this.page[key] ?? defaultValue;
  }

  /**
   * Get initial data value
   */
  getData(key, defaultValue = null) {
    if (!this.initialData) return defaultValue;
    
    // Support dot notation: getData('user.name')
    if (key.includes('.')) {
      return this.getNestedValue(this.initialData, key) ?? defaultValue;
    }
    
    return this.initialData[key] ?? defaultValue;
  }

  /**
   * Get nested value using dot notation
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current?.[key];
    }, obj);
  }

  /**
   * Get current user
   */
  get user() {
    return this.page.user;
  }

  /**
   * Check if user is authenticated
   */
  get isAuthenticated() {
    return !!this.user;
  }

  /**
   * Get current path
   */
  get path() {
    return this.page.path || window.location.pathname;
  }

  /**
   * Get CSRF token
   */
  get csrfToken() {
    return this.page.csrfToken || '';
  }

  /**
   * Check if in debug mode
   */
  get isDebug() {
    return this.config.debug === true;
  }

  /**
   * Get API URL
   */
  get apiUrl() {
    return this.config.apiUrl || '';
  }

  /**
   * Get full API base URL (with path)
   */
  get apiBaseUrl() {
    return this.config.apiUrl + this.config.apiBasePath;
  }

  /**
   * Log all data (debug helper)
   */
  debug() {
    console.group('📄 Page Data');
    console.log('Config:', this.config);
    console.log('Page:', this.page);
    console.log('Initial Data:', this.initialData);
    console.log('User:', this.user);
    console.log('Authenticated:', this.isAuthenticated);
    console.groupEnd();
  }
}

// Create singleton instance
export const pageData = new PageData();

// Also expose globally for non-module scripts
window.pageData = pageData;

// Helper functions
export const getConfig = (key, defaultValue) => pageData.getConfig(key, defaultValue);
export const getPage = (key, defaultValue) => pageData.getPage(key, defaultValue);
export const getData = (key, defaultValue) => pageData.getData(key, defaultValue);

export default pageData;