// assets/js/core/app.js
/**
 * Main Application Class
 * Pure vanilla JS - no build required
 */
import { ModuleLoader } from './module-loader.js';
import { EventBus } from './event-bus.js';
import { StateManager } from './state-manager.js';
import { ErrorHandler } from './error-handler.js';
import { config } from './config.js';
import { api } from './api.js';
import { content } from '../content/content-manager.js';
import { es } from '../content/es.js';
import { en } from '../content/en.js';

class App {
  constructor(options = {}) {
    this.options = {
      debug: false,
      ...options
    };

    // API Client
    this.api = api;

    // Content/i18n
    this.content = content;
    this.t = (key, replacements) => content.t(key, replacements);

    // Core systems
    this.eventBus = new EventBus({ debug: this.options.debug });
    this.state = new StateManager({ debug: this.options.debug });
    this.errorHandler = new ErrorHandler({
      eventBus: this.eventBus,
      reportErrors: !this.options.debug
    });
    this.moduleLoader = new ModuleLoader({
      eventBus: this.eventBus,
      basePath: '../assets/js/modules'
    });

    // Loaded modules
    this.modules = new Map();
    
    // Performance tracking
    this.performanceMarks = {};

    // Initialization promise
    this.ready = this.init();
  }

  async init() {
    try {
      this.mark('app-init-start');
      this.log('🚀 Initializing app...');

      // Initialize content/i18n
      this.initContent();

      // Register Web Components
      await this.registerComponents();

      // Register Web Components
      await this.registerComponents();

      // Setup global event listeners
      this.setupGlobalListeners();

      // Initialize theme
      this.initTheme();

      // Auto-load modules based on page
      await this.autoLoadModules();

      // Page-specific initialization
      await this.initPage();

      this.mark('app-init-end');
      this.measure('app-init', 'app-init-start', 'app-init-end');

      this.log('✅ App initialized');
      this.eventBus.emit('app:ready');

      return this;
    } catch (error) {
      this.errorHandler.handleError(error, 'App initialization failed');
      throw error;
    }
  }

  initContent() {
    // Register languages
    this.content.register('es', es);
    this.content.register('en', en);

    // Detect or restore language
    const savedLanguage = localStorage.getItem('language');
    const browserLanguage = navigator.language.split('-')[0];
    
    const language = savedLanguage || 
                    (config.i18n.detectBrowserLanguage && this.content.hasLanguage(browserLanguage) 
                      ? browserLanguage 
                      : config.i18n.defaultLanguage);

    this.content.setLanguage(language);
    this.log(`🌐 Language set: ${language}`);
  }

  async registerComponents() {
    this.mark('components-start');
    
    // Dynamic import of component registry
    const { registerComponents } = await import('../components/index.js');
    await registerComponents();
    
    this.mark('components-end');
    this.measure('components-load', 'components-start', 'components-end');
    this.log('📦 Components registered');
  }

  setupGlobalListeners() {
    // SPA-style navigation (optional)
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-link]');
      if (link) {
        e.preventDefault();
        this.navigate(link.href);
      }
    });

    // Handle theme changes
    this.eventBus.on('theme:change', (theme) => {
      this.setTheme(theme);
    });

    // Handle online/offline
    window.addEventListener('online', () => {
      this.eventBus.emit('network:online');
      this.log('🌐 Network online');
    });

    window.addEventListener('offline', () => {
      this.eventBus.emit('network:offline');
      this.log('📵 Network offline');
    });

    // Handle visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.eventBus.emit('app:hidden');
      } else {
        this.eventBus.emit('app:visible');
      }
    });

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
      this.destroy();
    });

    // Global error handler
    window.addEventListener('error', (e) => {
      this.errorHandler.handleError(e.error, 'Global error');
    });

    window.addEventListener('unhandledrejection', (e) => {
      this.errorHandler.handleError(e.reason, 'Unhandled promise rejection');
    });
  }

  initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    this.setTheme(theme);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    this.state.set('theme', theme);
    this.log(`🎨 Theme set: ${theme}`);
  }

  async autoLoadModules() {
    const page = document.body.dataset.page || 'default';
    const moduleConfig = config.pageModules[page] || [];

    this.log(`📄 Page: ${page}, Modules: ${moduleConfig.join(', ')}`);

    for (const moduleName of moduleConfig) {
      await this.loadModule(moduleName);
    }
  }

  async loadModule(name) {
    if (this.modules.has(name)) {
      return this.modules.get(name);
    }

    try {
      this.log(`📥 Loading module: ${name}`);
      this.mark(`module-${name}-start`);
      
      const module = await this.moduleLoader.load(name);
      this.modules.set(name, module);
      
      this.mark(`module-${name}-end`);
      this.measure(`module-${name}`, `module-${name}-start`, `module-${name}-end`);
      
      this.log(`✅ Module loaded: ${name}`);
      this.eventBus.emit('module:loaded', { name, module });
      
      return module;
    } catch (error) {
      this.errorHandler.handleError(error, `Failed to load module: ${name}`);
      throw error;
    }
  }

  async initPage() {
    const page = document.body.dataset.page || 'default';
    const pageInitializer = config.pageInitializers[page];

    if (pageInitializer) {
      try {
        this.log(`🎯 Initializing page: ${page}`);
        await pageInitializer(this);
      } catch (error) {
        this.errorHandler.handleError(error, `Page initialization failed: ${page}`);
      }
    }
  }

  navigate(url) {
    window.history.pushState({}, '', url);
    this.eventBus.emit('route:change', { url });
    this.log(`🔗 Navigate to: ${url}`);
  }

  destroy() {
    this.log('🧹 Cleaning up...');

    // Destroy all modules
    this.modules.forEach((module, name) => {
      if (module && typeof module.destroy === 'function') {
        try {
          module.destroy();
          this.log(`  ✓ Destroyed module: ${name}`);
        } catch (error) {
          this.log(`  ✗ Error destroying module ${name}:`, error);
        }
      }
    });
    this.modules.clear();

    // Cleanup event bus
    this.eventBus.removeAllListeners();

    // Clear state
    this.state.clear();

    this.log('✅ Cleanup complete');
  }

  // Performance helpers
  mark(name) {
    if (this.options.debug && performance.mark) {
      performance.mark(name);
      this.performanceMarks[name] = performance.now();
    }
  }

  measure(name, startMark, endMark) {
    if (this.options.debug && performance.measure) {
      try {
        performance.measure(name, startMark, endMark);
        const measure = performance.getEntriesByName(name)[0];
        this.log(`⏱️  ${name}: ${measure.duration.toFixed(2)}ms`);
      } catch (error) {
        // Silently fail
      }
    }
  }

  log(...args) {
    if (this.options.debug) {
      console.log('[App]', ...args);
    }
  }
}

export { App };