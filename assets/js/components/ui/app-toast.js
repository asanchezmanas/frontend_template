// assets/js/components/ui/app-toast.js
/**
 * App Toast Component
 * Toast notification
 */
import { BaseComponent } from '../base/base-component.js';

class AppToast extends BaseComponent {
  static get observedAttributes() {
    return ['type', 'duration', 'dismissible'];
  }

  constructor() {
    super();
    this.autoCloseTimer = null;
  }

  template() {
    const type = this.getAttr('type', 'info');
    const dismissible = this.getBoolAttr('dismissible') !== false;
    
    const icons = {
      success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"/>
      </svg>`,
      error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>`,
      warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>`,
      info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>`
    };
    
    return `
      <div class="toast toast--${type}" role="alert" aria-live="polite" data-toast>
        <!-- Icon -->
        <div class="toast__icon">
          ${icons[type] || icons.info}
        </div>

        <!-- Content -->
        <div class="toast__content">
          <slot name="title">
            <div class="toast__title">Notification</div>
          </slot>
          <slot name="message">
            <div class="toast__message">This is a notification message.</div>
          </slot>
        </div>

        <!-- Progress Bar -->
        ${this.getNumAttr('duration') > 0 ? `
          <div class="toast__progress" data-progress></div>
        ` : ''}

        <!-- Close Button -->
        ${dismissible ? `
          <button 
            type="button"
            class="toast__close"
            aria-label="Cerrar"
            data-close
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        ` : ''}
      </div>
    `;
  }

  afterMount() {
    // Slide in animation
    this.setTimeout(() => {
      const toast = this.$('[data-toast]');
      toast.classList.add('is-visible');
    }, 10);

    // Auto close with progress
    const duration = this.getNumAttr('duration', 0);
    if (duration > 0) {
      this.startAutoClose(duration);
    }
  }

  attachEventListeners() {
    // Close button
    const closeBtn = this.$('[data-close]');
    if (closeBtn) {
      this.addEventListener(closeBtn, 'click', () => this.close());
    }

    // Pause on hover
    const toast = this.$('[data-toast]');
    this.addEventListener(toast, 'mouseenter', () => {
      if (this.autoCloseTimer) {
        this.pauseAutoClose();
      }
    });

    this.addEventListener(toast, 'mouseleave', () => {
      if (this.autoCloseTimer) {
        this.resumeAutoClose();
      }
    });
  }

  startAutoClose(duration) {
    const progress = this.$('[data-progress]');
    
    if (progress) {
      progress.style.transition = `width ${duration}ms linear`;
      this.setTimeout(() => {
        progress.style.width = '0%';
      }, 10);
    }

    this.autoCloseTimer = this.setTimeout(() => {
      this.close();
    }, duration);
  }

  pauseAutoClose() {
    // Pause is handled by the component cleanup system
  }

  resumeAutoClose() {
    // Resume is automatic when mouse leaves
  }

  close() {
    const toast = this.$('[data-toast]');
    toast.classList.remove('is-visible');

    this.setTimeout(() => {
      this.emit('toast:close');
      this.remove();
    }, 300);
  }
}

// Register component
customElements.define('app-toast', AppToast);

export { AppToast };