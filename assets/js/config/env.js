/**
 * Environment Configuration
 * Centralized configuration for API endpoints, Supabase, and environment variables
 * 
 * Priority order:
 * 1. Backend-injected config (window.__CONFIG__) - HIGHEST PRIORITY
 * 2. Environment-specific config (based on hostname)
 * 3. Default fallbacks
 */

/**
 * Get backend-injected configuration if available
 */
const getBackendConfig = () => {
  if (typeof window !== 'undefined' && window.__CONFIG__) {
    return {
      API_URL: window.__CONFIG__.apiUrl,
      API_BASE_PATH: window.__CONFIG__.apiBasePath,
      SUPABASE_URL: window.__CONFIG__.supabaseUrl,
      SUPABASE_ANON_KEY: window.__CONFIG__.supabaseAnonKey,
      DEBUG: window.__CONFIG__.debug,
      ENABLE_LOGGING: window.__CONFIG__.enableLogging,
      MOCK_API: window.__CONFIG__.mockApi,
    };
  }
  return null;
};

/**
 * Environment Detection
 */
const getEnvironment = () => {
  // Check if backend provided environment
  if (typeof window !== 'undefined' && window.__ENV__) {
    return window.__ENV__;
  }
  
  // Detect based on hostname
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'development';
  } else if (hostname.includes('staging') || hostname.includes('dev')) {
    return 'staging';
  } else {
    return 'production';
  }
};

/**
 * Environment-specific configurations
 */
const environments = {
  development: {
    // FastAPI backend running locally
    API_URL: 'http://localhost:8000',
    API_BASE_PATH: '/api/v1',
    
    // Supabase (usually same across all envs, but can differ)
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here',
    
    // Feature flags
    DEBUG: true,
    ENABLE_LOGGING: true,
    MOCK_API: false, // Set to true to use mock data instead of real API
  },
  
  staging: {
    // FastAPI on Render staging
    API_URL: 'https://your-app-staging.onrender.com',
    API_BASE_PATH: '/api/v1',
    
    // Supabase
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here',
    
    // Feature flags
    DEBUG: true,
    ENABLE_LOGGING: true,
    MOCK_API: false,
  },
  
  production: {
    // FastAPI on Render production
    API_URL: 'https://your-app.onrender.com',
    API_BASE_PATH: '/api/v1',
    
    // Supabase
    SUPABASE_URL: 'https://your-project.supabase.co',
    SUPABASE_ANON_KEY: 'your-anon-key-here',
    
    // Feature flags
    DEBUG: false,
    ENABLE_LOGGING: false,
    MOCK_API: false,
  }
};

/**
 * Current environment
 */
const ENV = getEnvironment();

/**
 * Backend-injected config (if available)
 */
const backendConfig = getBackendConfig();

/**
 * Current configuration (backend config takes priority)
 */
const currentConfig = backendConfig || environments[ENV];

/**
 * Configuration object with computed properties
 */
export const config = {
  // Environment info
  ENV,
  IS_DEV: ENV === 'development',
  IS_STAGING: ENV === 'staging',
  IS_PROD: ENV === 'production',
  
  // API Configuration
  API_URL: currentConfig.API_URL,
  API_BASE_PATH: currentConfig.API_BASE_PATH,
  
  // Computed: Full API base URL
  get API_BASE_URL() {
    return `${this.API_URL}${this.API_BASE_PATH}`;
  },
  
  // Supabase Configuration
  SUPABASE_URL: currentConfig.SUPABASE_URL,
  SUPABASE_ANON_KEY: currentConfig.SUPABASE_ANON_KEY,
  
  // Feature Flags
  DEBUG: currentConfig.DEBUG,
  ENABLE_LOGGING: currentConfig.ENABLE_LOGGING,
  MOCK_API: currentConfig.MOCK_API,
  
  // API Endpoints
  endpoints: {
    // Authentication
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      register: '/auth/register',
      refresh: '/auth/refresh',
      me: '/auth/me',
    },
    
    // Users
    users: {
      list: '/users',
      detail: (id) => `/users/${id}`,
      create: '/users',
      update: (id) => `/users/${id}`,
      delete: (id) => `/users/${id}`,
    },
    
    // Dashboard/Analytics
    dashboard: {
      metrics: '/dashboard/metrics',
      charts: '/dashboard/charts',
      recent: '/dashboard/recent',
    },
    
    // Add your specific endpoints here
    // Example:
    products: {
      list: '/products',
      detail: (id) => `/products/${id}`,
      search: '/products/search',
    },
    
    orders: {
      list: '/orders',
      detail: (id) => `/orders/${id}`,
      create: '/orders',
    },
  },
  
  /**
   * Get full URL for an endpoint
   * @param {string} endpoint - The endpoint path
   * @returns {string} Full URL
   */
  getUrl(endpoint) {
    return `${this.API_BASE_URL}${endpoint}`;
  },
  
  /**
   * Log configuration info (only in debug mode)
   */
  logInfo() {
    if (this.DEBUG) {
      console.group('🔧 Application Configuration');
      console.log('Environment:', this.ENV);
      console.log('API URL:', this.API_URL);
      console.log('API Base:', this.API_BASE_URL);
      console.log('Supabase URL:', this.SUPABASE_URL);
      console.log('Debug Mode:', this.DEBUG);
      console.log('Mock API:', this.MOCK_API);
      console.groupEnd();
    }
  }
};

/**
 * Timeout configurations (in milliseconds)
 */
export const timeouts = {
  API_REQUEST: 30000,      // 30 seconds for API requests
  API_REQUEST_SHORT: 10000, // 10 seconds for quick requests
  DEBOUNCE: 300,           // 300ms for search debounce
  TOAST: 3000,             // 3 seconds for toast notifications
};

/**
 * Pagination defaults
 */
export const pagination = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
};

/**
 * Local storage keys
 */
export const storageKeys = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_STATE: 'sidebar_collapsed',
};

/**
 * HTTP Status codes for reference
 */
export const httpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

/**
 * Initialize configuration
 * Call this when the app starts
 */
export function initConfig() {
  config.logInfo();
  
  // Validate required config
  if (!config.API_URL) {
    console.error('❌ API_URL is not configured!');
  }
  
  if (!config.SUPABASE_URL && !config.MOCK_API) {
    console.warn('⚠️ SUPABASE_URL is not configured');
  }
  
  return config;
}

// Log configuration on import (only in debug mode)
if (config.DEBUG) {
  config.logInfo();
}

// Make config globally accessible for debugging
if (config.DEBUG) {
  window.__APP_CONFIG__ = config;
}

export default config;