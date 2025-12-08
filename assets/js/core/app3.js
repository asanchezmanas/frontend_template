// src/js/core/app.js
/**
 * Main Application Class
 * Orchestrates all modules and components
 */
import { ModuleLoader } from './module-loader.js';
import { EventBus } from './event-bus.js';
import { StateManager } from './state-manager.js';
import { ErrorHandler } from './error-handler.js';
import { config } from './config.js';

class App {
  constructor(options = {}) {
    this.options = {
      debug: import.meta.env.DEV,
      ...options
    };

    // Core systems
    this.eventBus = new EventBus({ debug: this.options.debug });
    this.state = new StateManager({ debug: this.options.debug });
    this.errorHandler = new ErrorHandler({
      eventBus: this.eventBus,
      reportErrors: !this.options.debug
    });
    this.moduleLoader = new ModuleLoader({
      eventBus: this.eventBus
    });

    // Loaded modules
    this.modules = new Map();

    // Initialization promise
    this.ready = this.init();
  }

  async init() {
    try {
      this.log('🚀 Initializing app...');

      // Register Web Components
      await this.registerComponents();

      // Setup global event listeners
      this.setupGlobalListeners();

      // Auto-load modules based on page
      await this.autoLoadModules();

      // Page-specific initialization
      await this.initPage();

      this.log('✅ App initialized');
      this.eventBus.emit('app:ready');

      return this;
    } catch (error) {
      this.errorHandler.handleError(error, 'App initialization failed');
      throw error;
    }
  }

  async registerComponents() {
    const { registerComponents } = await import('@components/index.js');
    await registerComponents();
    this.log('📦 Components registered');
  }

  setupGlobalListeners() {
    // Handle navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[data-link]');
      if (link) {
        e.preventDefault();
        this.navigate(link.href);
      }
    });

    // Handle theme changes
    this.eventBus.on('theme:change', (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    });

    // Handle online/offline
    window.addEventListener('online', () => {
      this.eventBus.emit('network:online');
    });

    window.addEventListener('offline', () => {
      this.eventBus.emit('network:offline');
    });

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
      this.destroy();
    });
  }

  async autoLoadModules() {
    const page = document.body.dataset.page;
    const moduleConfig = config.pageModules[page] || [];

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
      const module = await this.moduleLoader.load(name);
      this.modules.set(name, module);
      this.log(`✅ Module loaded: ${name}`);
      return module;
    } catch (error) {
      this.errorHandler.handleError(error, `Failed to load module: ${name}`);
      throw error;
    }
  }

  async initPage() {
    const page = document.body.dataset.page;
    const pageInitializer = config.pageInitializers[page];

    if (pageInitializer) {
      try {
        await pageInitializer(this);
      } catch (error) {
        this.errorHandler.handleError(error, `Page initialization failed: ${page}`);
      }
    }
  }

  navigate(url) {
    window.history.pushState({}, '', url);
    this.eventBus.emit('route:change', { url });
  }

  destroy() {
    this.log('🧹 Cleaning up...');

    // Destroy all modules
    this.modules.forEach((module) => {
      if (module.destroy) {
        module.destroy();
      }
    });
    this.modules.clear();

    // Cleanup event bus
    this.eventBus.removeAllListeners();

    // Clear state
    this.state.clear();

    this.log('✅ Cleanup complete');
  }

  log(...args) {
    if (this.options.debug) {
      console.log('[App]', ...args);
    }
  }
}

export { App };