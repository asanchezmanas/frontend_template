// assets/js/components/ui/app-modal.js
/**
 * App Modal Component
 * Accessible modal dialog
 */
import { BaseComponent } from '../base/base-component.js';

class AppModal extends BaseComponent {
  static get observedAttributes() {
    return ['open', 'size', 'close-on-backdrop', 'close-on-escape'];
  }

  constructor() {
    super();
    this.isOpen = false;
    this.previousFocus = null;
    this.focusableElements = [];
  }

  template() {
    const size = this.getAttr('size', 'md');
    
    return `
      <div 
        class="modal" 
        role="dialog" 
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-hidden="true"
        data-modal
      >
        <!-- Backdrop -->
        <div class="modal__backdrop" data-backdrop></div>

        <!-- Dialog -->
        <div class="modal__dialog modal__dialog--${size}" data-dialog>
          <!-- Close Button -->
          <button 
            type="button"
            class="modal__close"
            aria-label="Cerrar"
            data-close
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <!-- Header -->
          <div class="modal__header">
            <slot name="header">
              <h2 id="modal-title" class="modal__title">Modal Title</h2>
            </slot>
          </div>

          <!-- Body -->
          <div class="modal__body">
            <slot name="body">
              <p>Modal content goes here.</p>
            </slot>
          </div>

          <!-- Footer -->
          <div class="modal__footer">
            <slot name="footer">
              <button type="button" class="btn btn--secondary" data-close>
                Cancelar
              </button>
              <button type="button" class="btn btn--primary" data-confirm>
                Confirmar
              </button>
            </slot>
          </div>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Close button
    this.$$('[data-close]').forEach(btn => {
      this.addEventListener(btn, 'click', () => this.close());
    });

    // Confirm button
    const confirmBtn = this.$('[data-confirm]');
    if (confirmBtn) {
      this.addEventListener(confirmBtn, 'click', () => {
        this.emit('modal:confirm');
        this.close();
      });
    }

    // Backdrop click
    if (this.getBoolAttr('close-on-backdrop') !== false) {
      const backdrop = this.$('[data-backdrop]');
      this.addEventListener(backdrop, 'click', () => this.close());
    }

    // Escape key
    if (this.getBoolAttr('close-on-escape') !== false) {
      this.addGlobalListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }

    // Trap focus
    this.addGlobalListener('keydown', (e) => {
      if (e.key === 'Tab' && this.isOpen) {
        this.handleTabKey(e);
      }
    });
  }

  onAttributeChange(name, oldValue, newValue) {
    if (name === 'open') {
      if (newValue !== null) {
        this.open();
      } else {
        this.close();
      }
    }
  }

  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.previousFocus = document.activeElement;

    const modal = this.$('[data-modal]');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    // Find focusable elements
    this.updateFocusableElements();

    // Focus first element
    this.setTimeout(() => {
      if (this.focusableElements.length > 0) {
        this.focusableElements[0].focus();
      }
    }, 100);

    this.emit('modal:open');
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;

    const modal = this.$('[data-modal]');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');

    // Restore body scroll
    document.body.style.overflow = '';

    // Restore focus
    if (this.previousFocus && this.previousFocus.focus) {
      this.previousFocus.focus();
    }

    this.emit('modal:close');
  }

  updateFocusableElements() {
    const dialog = this.$('[data-dialog]');
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];

    this.focusableElements = Array.from(
      dialog.querySelectorAll(focusableSelectors.join(','))
    );
  }

  handleTabKey(e) {
    if (this.focusableElements.length === 0) return;

    const firstElement = this.focusableElements[0];
    const lastElement = this.focusableElements[this.focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  // Public API
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}

// Register component
customElements.define('app-modal', AppModal);

export { AppModal };