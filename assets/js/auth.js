/**
 * Authentication
 * Sistema de autenticación y gestión de usuarios
 */

const auth = {
  /**
   * Check if user is authenticated
   * @returns {boolean} Is authenticated
   */
  isAuthenticated() {
    return storage.has(config.storageKeys.token);
  },
  
  /**
   * Get current user
   * @returns {Object|null} User object or null
   */
  getCurrentUser() {
    return storage.get(config.storageKeys.user);
  },
  
  /**
   * Get auth token
   * @returns {string|null} Token or null
   */
  getToken() {
    return storage.get(config.storageKeys.token);
  },
  
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User object
   */
  async login(email, password) {
    try {
      const response = await apiEndpoints.auth.login(email, password);
      
      // Store token and user
      storage.set(config.storageKeys.token, response.access_token);
      storage.set(config.storageKeys.user, response.user);
      
      return response.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  /**
   * Register new user
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User name
   * @returns {Promise<Object>} User object
   */
  async signup(email, password, name) {
    try {
      const response = await apiEndpoints.auth.signup(email, password, name);
      
      // Store token and user
      storage.set(config.storageKeys.token, response.access_token);
      storage.set(config.storageKeys.user, response.user);
      
      return response.user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
  
  /**
   * Logout user
   */
  async logout() {
    try {
      // Call logout endpoint (optional, for server-side cleanup)
      await apiEndpoints.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear local storage
      storage.remove(config.storageKeys.token);
      storage.remove(config.storageKeys.user);
      
      // Redirect to login
      window.location.href = '/login.html';
    }
  },
  
  /**
   * Refresh user data from server
   * @returns {Promise<Object>} Updated user object
   */
  async refreshUser() {
    try {
      const user = await apiEndpoints.auth.me();
      storage.set(config.storageKeys.user, user);
      return user;
    } catch (error) {
      console.error('Refresh user error:', error);
      throw error;
    }
  },
  
  /**
   * Require authentication (redirect to login if not authenticated)
   * @param {string} redirectUrl - URL to redirect to after login
   */
  requireAuth(redirectUrl = null) {
    if (!this.isAuthenticated()) {
      const redirect = redirectUrl || window.location.pathname;
      window.location.href = `/login.html?redirect=${encodeURIComponent(redirect)}`;
      return false;
    }
    return true;
  },
  
  /**
   * Get redirect URL from query params
   * @returns {string} Redirect URL or default
   */
  getRedirectUrl() {
    const redirect = utils.getQueryParam('redirect');
    return redirect || config.routes.private.dashboard;
  },
  
  /**
   * Check if user has specific tier
   * @param {string} tier - Tier name (free, starter, pro, business, enterprise)
   * @returns {boolean} Has tier or higher
   */
  hasTier(tier) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const tiers = ['free', 'starter', 'pro', 'business', 'enterprise'];
    const userTierIndex = tiers.indexOf(user.tier || 'free');
    const requiredTierIndex = tiers.indexOf(tier);
    
    return userTierIndex >= requiredTierIndex;
  },
  
  /**
   * Check if user can perform action based on tier limits
   * @param {string} resource - Resource type (documents, generations, users)
   * @param {number} current - Current usage
   * @returns {boolean} Can perform action
   */
  checkLimit(resource, current) {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const tier = user.tier || 'free';
    const limits = config.tierLimits[tier];
    
    if (!limits || !limits[resource]) return true; // No limit defined
    
    return current < limits[resource];
  },
  
  /**
   * Get user's tier limits
   * @returns {Object} Tier limits
   */
  getTierLimits() {
    const user = this.getCurrentUser();
    const tier = user?.tier || 'free';
    return config.tierLimits[tier];
  },
  
  /**
   * Initialize authentication
   * Should be called on page load for protected pages
   */
  init() {
    // Check if token exists
    if (!this.isAuthenticated()) {
      return false;
    }
    
    // Optional: Check if token is expired and refresh
    // TODO: Implement token expiration check
    
    return true;
  }
};

// Auto-initialize on protected pages
document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on a protected page (in /app/ directory)
  if (window.location.pathname.includes('/app/')) {
    if (!auth.requireAuth()) {
      // User will be redirected, stop execution
      return;
    }
  }
  
  // If on login/signup page and already authenticated, redirect to dashboard
  if (window.location.pathname.includes('/login.html') || 
      window.location.pathname.includes('/signup.html')) {
    if (auth.isAuthenticated()) {
      window.location.href = config.routes.private.dashboard;
    }
  }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = auth;
}