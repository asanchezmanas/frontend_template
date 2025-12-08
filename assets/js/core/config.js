// assets/js/core/config.js (VERSIÓN ACTUALIZADA)
/**
 * Application Configuration
 * Central config for all modules and features
 */

const config = {
  // App metadata
  app: {
    name: 'Frontend Template Pro',
    version: '1.0.0',
    description: 'Sistema modular sin frameworks'
  },

  // API configuration - FastAPI Backend
  api: {
    // Development
    baseUrl: import.meta.env?.DEV 
      ? 'http://localhost:8000/api/v1'
      : 'https://api.example.com/api/v1',
    
    timeout: 30000, // 30 seconds
    retries: 3,
    
    // Endpoints
    endpoints: {
      // Auth
      login: '/auth/login',
      register: '/auth/register',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      me: '/auth/me',
      
      // Users
      users: '/users',
      userById: (id) => `/users/${id}`,
      
      // Analytics
      analytics: '/analytics',
      analyticsEvents: '/analytics/events',
      analyticsPageView: '/analytics/pageview',
      
      // Performance
      performance: '/performance',
      
      // Content
      content: '/content',
      contentByLanguage: (lang) => `/content/${lang}`,
      
      // Files
      upload: '/files/upload',
      download: (id) => `/files/${id}/download`,
      
      // Custom endpoints
      dashboard: '/dashboard/stats',
      transactions: '/transactions'
    }
  },

  // Feature flags
  features: {
    analytics: true,
    performance: true,
    darkMode: true,
    lazyImages: true,
    i18n: true,
    serviceWorker: false,
    offlineMode: false
  },

  // Performance settings
  performance: {
    enabled: true,
    reportInterval: 30000, // 30 seconds
    trackLongTasks: true,
    trackResourceTiming: true,
    lazyLoadThreshold: '50px',
    debounceDelay: 300,
    throttleDelay: 150
  },

  // Module configuration per page
  pageModules: {
    'home': ['analytics', 'images', 'performance'],
    'dashboard': ['analytics', 'images', 'charts', 'datatable', 'performance'],
    'profile': ['analytics', 'images'],
    'default': ['analytics', 'images']
  },

  // Page initializers
  pageInitializers: {
    'home': async (app) => {
      console.log('🏠 Home page initialized');
      
      const analytics = await app.loadModule('analytics');
      analytics.trackPageView('home');
    },

    'dashboard': async (app) => {
      console.log('📊 Dashboard page initialized');
      
      // Load required modules
      const [analytics, performance] = await Promise.all([
        app.loadModule('analytics'),
        app.loadModule('performance')
      ]);

      analytics.trackPageView('dashboard');
      performance.mark('dashboard-start');

      // Load dashboard data from API
      try {
        const { api } = await import('./api.js');
        const stats = await api.get(config.api.endpoints.dashboard);
        console.log('Dashboard stats:', stats);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    }
  },

  // Analytics configuration
  analytics: {
    enabled: true,
    trackPageViews: true,
    trackClicks: true,
    trackScroll: true,
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    endpoint: '/analytics/events'
  },

  // i18n configuration
  i18n: {
    defaultLanguage: 'es',
    fallbackLanguage: 'es',
    availableLanguages: ['es', 'en'],
    detectBrowserLanguage: true
  },

  // Image settings
  images: {
    lazyLoad: true,
    placeholder: 'blur',
    formats: ['webp', 'jpg'],
    retries: 3,
    retryDelay: 1000
  },

  // DataTable defaults
  datatable: {
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100],
    sortable: true,
    filterable: true,
    exportable: true
  },

  // Chart defaults
  charts: {
    theme: 'auto', // 'light' | 'dark' | 'auto'
    responsive: true,
    animations: true,
    toolbar: true
  },

  // Toast notifications
  notifications: {
    position: 'top-right',
    duration: 5000,
    maxVisible: 5,
    pauseOnHover: true
  },

  // Modal defaults
  modals: {
    closeOnBackdrop: true,
    closeOnEscape: true,
    trapFocus: true,
    restoreFocus: true
  },

  // Development settings
  dev: {
    debug: false,
    showPerformance: false,
    mockDelay: 500
  }
};

// Environment-specific overrides
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  config.dev.debug = true;
  config.dev.showPerformance = true;
  config.api.baseUrl = 'http://localhost:8000/api/v1';
}

// Freeze config to prevent modifications
Object.freeze(config);

export { config };