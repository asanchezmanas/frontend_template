/**
 * Toast Component
 * Sistema de notificaciones toast
 */

const toast = {
  container: null,
  
  /**
   * Initialize toast container
   */
  init() {
    if (this.container) return;
    
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },
  
  /**
   * Show toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type (success, error, warning, info)
   * @param {number} duration - Duration in ms (default: 5000)
   */
  show(message, type = 'info', duration = config.toastDuration) {
    this.init();
    
    const id = utils.generateId();
    const toastEl = this.createToast(id, message, type);
    
    this.container.appendChild(toastEl);
    
    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }
    
    return id;
  },
  
  /**
   * Create toast element
   * @param {string} id - Toast ID
   * @param {string} message - Toast message
   * @param {string} type - Toast type
   * @returns {HTMLElement} Toast element
   */
  createToast(id, message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.id = `toast-${id}`;
    
    const icon = this.getIcon(type);
    
    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-message">${utils.escapeHtml(message)}</span>
      <button class="toast-close" onclick="toast.dismiss('${id}')">&times;</button>
    `;
    
    return toast;
  },
  
  /**
   * Get icon for toast type
   * @param {string} type - Toast type
   * @returns {string} Icon HTML
   */
  getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  },
  
  /**
   * Dismiss toast
   * @param {string} id - Toast ID
   */
  dismiss(id) {
    const toastEl = document.getElementById(`toast-${id}`);
    if (toastEl) {
      toastEl.style.animation = 'toastSlideOut 200ms ease-out';
      setTimeout(() => {
        toastEl.remove();
      }, 200);
    }
  },
  
  /**
   * Show success toast
   * @param {string} message - Toast message
   * @param {number} duration - Duration in ms
   */
  success(message, duration) {
    return this.show(message, 'success', duration);
  },
  
  /**
   * Show error toast
   * @param {string} message - Toast message
   * @param {number} duration - Duration in ms
   */
  error(message, duration) {
    return this.show(message, 'error', duration);
  },
  
  /**
   * Show warning toast
   * @param {string} message - Toast message
   * @param {number} duration - Duration in ms
   */
  warning(message, duration) {
    return this.show(message, 'warning', duration);
  },
  
  /**
   * Show info toast
   * @param {string} message - Toast message
   * @param {number} duration - Duration in ms
   */
  info(message, duration) {
    return this.show(message, 'info', duration);
  },
  
  /**
   * Clear all toasts
   */
  clearAll() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
};

// Add slide out animation to CSS
if (!document.getElementById('toast-animations')) {
  const style = document.createElement('style');
  style.id = 'toast-animations';
  style.textContent = `
    @keyframes toastSlideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }
  `;
  document.head.appendChild(style);
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = toast;
}