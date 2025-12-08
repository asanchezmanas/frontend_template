/**
 * Configuration
 * Configuración global de la aplicación
 */

const config = {
  // API Configuration
  apiBaseUrl: window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api/v1'
    : '/api/v1', // En producción, usar ruta relativa
  
  // Authentication
  authTokenKey: 'rag_auth_token',
  authUserKey: 'rag_user',
  tokenRefreshMinutes: 55, // Refresh 5 min antes de expirar
  
  // Storage keys
  storageKeys: {
    token: 'rag_auth_token',
    user: 'rag_user',
    preferences: 'rag_preferences',
    recentGenerations: 'rag_recent_generations'
  },
  
  // Upload limits
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
    'text/plain',
    'text/markdown',
    'text/html'
  ],
  allowedExtensions: ['.pdf', '.docx', '.pptx', '.txt', '.md', '.html'],
  
  // Pagination
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],
  
  // Toasts/Notifications
  toastDuration: 5000, // 5 seconds
  toastPosition: 'top-right', // top-right, top-left, bottom-right, bottom-left
  
  // Debounce delays
  searchDebounce: 300, // ms
  autoSaveDebounce: 2000, // ms
  
  // Features flags (para activar/desactivar features)
  features: {
    darkMode: false, // Futuro
    multiLanguage: false, // Futuro
    analytics: true,
    betaFeatures: false
  },
  
  // App metadata
  appName: 'RAG Ecommerce',
  appVersion: '1.0.0',
  supportEmail: 'soporte@ragecommerce.com',
  
  // Tier limits (matching backend)
  tierLimits: {
    free: {
      documents: 25,
      generations: 100,
      users: 1
    },
    starter: {
      documents: 200,
      generations: 500,
      users: 3
    },
    pro: {
      documents: 1000,
      generations: 3000,
      users: 10
    },
    business: {
      documents: 10000,
      generations: 10000,
      users: 25
    },
    enterprise: {
      documents: 999999,
      generations: 999999,
      users: 999999
    }
  },
  
  // Pricing
  pricing: {
    free: { price: 0, currency: '€' },
    starter: { price: 19, currency: '€' },
    pro: { price: 49, currency: '€' },
    business: { price: 149, currency: '€' }
  },
  
  // Routes (para SPA navigation en área privada)
  routes: {
    public: {
      home: '/',
      pricing: '/pricing.html',
      features: '/features.html',
      login: '/login.html',
      signup: '/signup.html'
    },
    private: {
      dashboard: '/app/dashboard.html',
      generate: '/app/generate.html',
      documents: '/app/documents.html',
      history: '/app/history.html',
      settings: '/app/settings.html',
      usage: '/app/usage.html'
    }
  }
};

// Freeze config para evitar modificaciones accidentales
Object.freeze(config);
Object.freeze(config.features);
Object.freeze(config.tierLimits);
Object.freeze(config.pricing);
Object.freeze(config.routes);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}