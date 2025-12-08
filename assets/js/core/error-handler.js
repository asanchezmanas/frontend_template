// assets/js/core/error-handler.js
/**
 * Global Error Handler
 * Catches and manages all application errors
 */

class ErrorHandler {
  constructor(options = {}) {
    this.options = {
      reportErrors: true,
      showUserMessages: true,
      logErrors: true,
      reportEndpoint: null,
      ...options
    };

    this.eventBus = options.eventBus;
    this.errorQueue = [];
    this.maxQueueSize = 50;
    this.errorCounts = new Map();
    
    // Setup global handlers
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error || event, 'Uncaught error', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'Unhandled promise rejection');
      event.preventDefault();
    });
  }

  /**
   * Main error handler
   */
  handleError(error, context = '', metadata = {}) {
    const errorInfo = this._createErrorInfo(error, context, metadata);

    // Log to console
    if (this.options.logErrors) {
      this._logError(errorInfo);
    }

    // Add to queue
    this._addToQueue(errorInfo);

    // Track error frequency
    this._trackError(errorInfo.type);

    // Show user message
    if (this.options.showUserMessages) {
      this._showUserMessage(errorInfo);
    }

    // Report to server
    if (this.options.reportErrors && this.options.reportEndpoint) {
      this._reportError(errorInfo);
    }

    // Emit event
    if (this.eventBus) {
      this.eventBus.emit('error:occurred', errorInfo);
    }

    return errorInfo;
  }

  /**
   * Handle network errors specifically
   */
  handleNetworkError(error, request = {}) {
    const errorInfo = this._createErrorInfo(error, 'Network error', {
      url: request.url,
      method: request.method,
      status: error.status,
      statusText: error.statusText
    });

    errorInfo.isNetworkError = true;
    
    return this.handleError(errorInfo, 'Network error');
  }

  /**
   * Create error info object
   */
  _createErrorInfo(error, context, metadata) {
    const now = new Date();

    return {
      id: this._generateErrorId(),
      type: this._getErrorType(error),
      message: this._getErrorMessage(error),
      context,
      metadata,
      stack: error?.stack || null,
      timestamp: now.toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    };
  }

  /**
   * Get error type
   */
  _getErrorType(error) {
    if (!error) return 'UnknownError';
    if (error.name) return error.name;
    if (typeof error === 'string') return 'StringError';
    return 'GenericError';
  }

  /**
   * Get error message
   */
  _getErrorMessage(error) {
    if (!error) return 'Unknown error occurred';
    if (typeof error === 'string') return error;
    if (error.message) return error.message;
    return String(error);
  }

  /**
   * Log error to console
   */
  _logError(errorInfo) {
    console.group(`❌ Error: ${errorInfo.type}`);
    console.error('Message:', errorInfo.message);
    console.error('Context:', errorInfo.context);
    if (errorInfo.metadata && Object.keys(errorInfo.metadata).length > 0) {
      console.error('Metadata:', errorInfo.metadata);
    }
    if (errorInfo.stack) {
      console.error('Stack:', errorInfo.stack);
    }
    console.groupEnd();
  }

  /**
   * Show user-friendly error message
   */
  _showUserMessage(errorInfo) {
    const isNetworkError = errorInfo.isNetworkError;
    const isCritical = this._isCriticalError(errorInfo);

    let message = 'Ha ocurrido un error';
    let type = 'error';

    if (isNetworkError) {
      message = 'Error de conexión. Por favor, verifica tu internet.';
      type = 'warning';
    } else if (isCritical) {
      message = 'Error crítico. La página se recargará.';
      type = 'error';
    } else {
      message = 'Ha ocurrido un error. Estamos trabajando en solucionarlo.';
      type = 'error';
    }

    // Try to show toast notification
    if (window.app?.modules.has('notifications')) {
      const notifications = window.app.modules.get('notifications');
      notifications.show({
        type,
        title: 'Error',
        message,
        duration: 5000
      });
    } else {
      // Fallback to alert
      alert(message);
    }

    // Reload if critical
    if (isCritical) {
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    }
  }

  /**
   * Report error to server
   */
  async _reportError(errorInfo) {
    if (!this.options.reportEndpoint) return;

    // Don't report too frequently
    if (this._shouldThrottle(errorInfo.type)) {
      return;
    }

    try {
      await fetch(this.options.reportEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: errorInfo,
          appVersion: window.APP_VERSION || 'unknown',
          environment: window.APP_ENV || 'production'
        })
      });
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
    }
  }

  /**
   * Add error to queue
   */
  _addToQueue(errorInfo) {
    this.errorQueue.push(errorInfo);

    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  /**
   * Track error frequency
   */
  _trackError(type) {
    const count = this.errorCounts.get(type) || 0;
    this.errorCounts.set(type, count + 1);

    // Warn if too many errors of same type
    if (count > 5) {
      console.warn(`⚠️  Error type "${type}" has occurred ${count} times`);
    }
  }

  /**
   * Check if error is critical
   */
  _isCriticalError(errorInfo) {
    const criticalTypes = [
      'ChunkLoadError',
      'SecurityError',
      'SyntaxError'
    ];

    return criticalTypes.includes(errorInfo.type);
  }

  /**
   * Throttle error reporting
   */
  _shouldThrottle(type) {
    const count = this.errorCounts.get(type) || 0;
    return count > 10; // Only report first 10 of each type
  }

  /**
   * Generate unique error ID
   */
  _generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error statistics
   */
  getStats() {
    return {
      totalErrors: this.errorQueue.length,
      errorsByType: Object.fromEntries(this.errorCounts),
      recentErrors: this.errorQueue.slice(-10)
    };
  }

  /**
   * Clear error queue
   */
  clearQueue() {
    this.errorQueue = [];
    this.errorCounts.clear();
  }
}

export { ErrorHandler };