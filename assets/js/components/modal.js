/**
 * Modal Component
 * Sistema de modales reutilizables
 */

const modal = {
  activeModal: null,
  
  /**
   * Show modal
   * @param {Object} options - Modal options
   * @param {string} options.title - Modal title
   * @param {string} options.body - Modal body HTML
   * @param {Array} options.buttons - Array of button configs
   * @param {boolean} options.closeOnOverlay - Close on overlay click (default: true)
   * @param {Function} options.onClose - Callback when modal closes
   */
  show(options) {
    // Close existing modal
    if (this.activeModal) {
      this.close();
    }
    
    const {
      title = '',
      body = '',
      buttons = [],
      closeOnOverlay = true,
      onClose = null
    } = options;
    
    const modalEl = this.create(title, body, buttons, closeOnOverlay, onClose);
    document.body.appendChild(modalEl);
    
    // Trigger show animation
    setTimeout(() => {
      modalEl.classList.add('show');
    }, 10);
    
    this.activeModal = modalEl;
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    return modalEl;
  },
  
  /**
   * Create modal element
   * @param {string} title - Modal title
   * @param {string} body - Modal body HTML
   * @param {Array} buttons - Button configs
   * @param {boolean} closeOnOverlay - Close on overlay click
   * @param {Function} onClose - On close callback
   * @returns {HTMLElement} Modal element
   */
  create(title, body, buttons, closeOnOverlay, onClose) {
    const modalEl = document.createElement('div');
    modalEl.className = 'modal';
    modalEl.id = `modal-${utils.generateId()}`;
    
    const buttonsHtml = buttons.map((btn, index) => {
      const btnClass = btn.primary ? 'btn-primary' : 'btn-secondary';
      return `
        <button 
          class="btn ${btnClass}" 
          data-action="${index}"
        >
          ${btn.text}
        </button>
      `;
    }).join('');
    
    modalEl.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${utils.escapeHtml(title)}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${body}
        </div>
        ${buttons.length > 0 ? `
          <div class="modal-footer">
            ${buttonsHtml}
          </div>
        ` : ''}
      </div>
    `;
    
    // Event listeners
    const overlay = modalEl.querySelector('.modal-overlay');
    const closeBtn = modalEl.querySelector('.modal-close');
    
    const handleClose = () => {
      this.close();
      if (onClose) onClose();
    };
    
    if (closeOnOverlay) {
      overlay.addEventListener('click', handleClose);
    }
    
    closeBtn.addEventListener('click', handleClose);
    
    // Button actions
    buttons.forEach((btn, index) => {
      const buttonEl = modalEl.querySelector(`[data-action="${index}"]`);
      buttonEl.addEventListener('click', async () => {
        if (btn.onClick) {
          const result = await btn.onClick();
          // If onClick returns false, don't close modal
          if (result !== false) {
            this.close();
          }
        } else {
          this.close();
        }
      });
    });
    
    // ESC key to close
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        handleClose();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
    
    return modalEl;
  },
  
  /**
   * Close active modal
   */
  close() {
    if (!this.activeModal) return;
    
    this.activeModal.classList.remove('show');
    
    setTimeout(() => {
      this.activeModal.remove();
      this.activeModal = null;
      
      // Restore body scroll
      document.body.style.overflow = '';
    }, 200);
  },
  
  /**
   * Show confirmation dialog
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @param {Function} onConfirm - Callback on confirm
   * @param {Object} options - Additional options
   */
  confirm(title, message, onConfirm, options = {}) {
    const {
      confirmText = 'Confirmar',
      cancelText = 'Cancelar',
      danger = false
    } = options;
    
    return this.show({
      title,
      body: `<p>${utils.escapeHtml(message)}</p>`,
      buttons: [
        {
          text: cancelText,
          primary: false,
          onClick: () => true // Just close
        },
        {
          text: confirmText,
          primary: !danger,
          onClick: async () => {
            if (onConfirm) {
              await onConfirm();
            }
            return true;
          }
        }
      ]
    });
  },
  
  /**
   * Show alert dialog
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @param {string} buttonText - Button text (default: 'OK')
   */
  alert(title, message, buttonText = 'OK') {
    return this.show({
      title,
      body: `<p>${utils.escapeHtml(message)}</p>`,
      buttons: [
        {
          text: buttonText,
          primary: true
        }
      ]
    });
  },
  
  /**
   * Show prompt dialog
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @param {Function} onSubmit - Callback with input value
   * @param {Object} options - Additional options
   */
  prompt(title, message, onSubmit, options = {}) {
    const {
      placeholder = '',
      defaultValue = '',
      required = false
    } = options;
    
    const inputId = `modal-input-${utils.generateId()}`;
    
    return this.show({
      title,
      body: `
        <p>${utils.escapeHtml(message)}</p>
        <div class="form-group">
          <input 
            type="text" 
            id="${inputId}"
            class="form-input" 
            placeholder="${placeholder}"
            value="${utils.escapeHtml(defaultValue)}"
            ${required ? 'required' : ''}
          />
        </div>
      `,
      buttons: [
        {
          text: 'Cancelar',
          primary: false
        },
        {
          text: 'Aceptar',
          primary: true,
          onClick: async () => {
            const input = document.getElementById(inputId);
            const value = input.value.trim();
            
            if (required && !value) {
              toast.error('Este campo es requerido');
              return false; // Don't close modal
            }
            
            if (onSubmit) {
              await onSubmit(value);
            }
            return true;
          }
        }
      ]
    });
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = modal;
}