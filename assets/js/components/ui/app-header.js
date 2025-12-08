// assets/js/components/ui/app-header.js
/**
 * App Header Component
 * Main navigation header
 */
import { BaseComponent } from '../base/base-component.js';

class AppHeader extends BaseComponent {
  static get observedAttributes() {
    return ['fixed', 'transparent'];
  }

  constructor() {
    super();
    this.isMenuOpen = false;
  }

  template() {
    const isFixed = this.getBoolAttr('fixed');
    const isTransparent = this.getBoolAttr('transparent');
    
    return `
      <header class="header ${isFixed ? 'header--fixed' : ''} ${isTransparent ? 'header--transparent' : ''}">
        <div class="header__container">
          <!-- Logo -->
          <a href="/" class="header__logo" aria-label="Inicio">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
              <rect width="32" height="32" rx="6"/>
            </svg>
            <span>Template Pro</span>
          </a>

          <!-- Desktop Navigation -->
          <nav class="header__nav" aria-label="Navegación principal">
            <ul class="header__menu">
              <li><a href="/" class="header__link">Inicio</a></li>
              <li><a href="/dashboard.html" class="header__link">Dashboard</a></li>
              <li><a href="/about.html" class="header__link">Acerca</a></li>
              <li><a href="/contact.html" class="header__link">Contacto</a></li>
            </ul>
          </nav>

          <!-- Actions -->
          <div class="header__actions">
            <!-- Theme Toggle -->
            <button 
              type="button"
              class="header__action header__theme-toggle"
              aria-label="Cambiar tema"
              data-theme-toggle
            >
              <svg class="icon icon--sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              <svg class="icon icon--moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </button>

            <!-- Mobile Menu Toggle -->
            <button 
              type="button"
              class="header__action header__menu-toggle"
              aria-label="Abrir menú"
              aria-expanded="false"
              aria-controls="mobile-menu"
              data-menu-toggle
            >
              <svg class="icon icon--menu" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              <svg class="icon icon--close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Menu -->
        <div 
          id="mobile-menu" 
          class="header__mobile-menu"
          aria-hidden="true"
          data-mobile-menu
        >
          <nav aria-label="Navegación móvil">
            <ul class="header__mobile-list">
              <li><a href="/" class="header__mobile-link">Inicio</a></li>
              <li><a href="/dashboard.html" class="header__mobile-link">Dashboard</a></li>
              <li><a href="/about.html" class="header__mobile-link">Acerca</a></li>
              <li><a href="/contact.html" class="header__mobile-link">Contacto</a></li>
            </ul>
          </nav>
        </div>
      </header>
    `;
  }

  attachEventListeners() {
    // Theme toggle
    const themeToggle = this.$('[data-theme-toggle]');
    this.addEventListener(themeToggle, 'click', () => this.toggleTheme());

    // Mobile menu toggle
    const menuToggle = this.$('[data-menu-toggle]');
    this.addEventListener(menuToggle, 'click', () => this.toggleMobileMenu());

    // Close menu on link click
    this.$$('.header__mobile-link').forEach(link => {
      this.addEventListener(link, 'click', () => this.closeMobileMenu());
    });

    // Close menu on escape
    this.addGlobalListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isMenuOpen) {
        this.closeMobileMenu();
      }
    });

    // Highlight active link
    this.highlightActiveLink();

    // Handle scroll for transparency
    if (this.getBoolAttr('transparent')) {
      this.handleScrollTransparency();
    }
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    if (window.app?.eventBus) {
      window.app.eventBus.emit('theme:change', newTheme);
    } else {
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
    }
  }

  toggleMobileMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    
    const menuToggle = this.$('[data-menu-toggle]');
    const mobileMenu = this.$('[data-mobile-menu]');
    
    menuToggle.setAttribute('aria-expanded', this.isMenuOpen);
    menuToggle.setAttribute('aria-label', this.isMenuOpen ? 'Cerrar menú' : 'Abrir menú');
    mobileMenu.setAttribute('aria-hidden', !this.isMenuOpen);
    
    if (this.isMenuOpen) {
      mobileMenu.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    } else {
      mobileMenu.classList.remove('is-open');
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu() {
    if (this.isMenuOpen) {
      this.toggleMobileMenu();
    }
  }

  highlightActiveLink() {
    const currentPath = window.location.pathname;
    
    this.$$('.header__link, .header__mobile-link').forEach(link => {
      const linkPath = new URL(link.href).pathname;
      
      if (linkPath === currentPath) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  handleScrollTransparency() {
    let lastScroll = 0;
    
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      
      if (currentScroll > 50) {
        this.classList.add('is-scrolled');
      } else {
        this.classList.remove('is-scrolled');
      }
      
      lastScroll = currentScroll;
    };

    this.addGlobalListener('scroll', handleScroll, { passive: true });
  }
}

// Register component
customElements.define('app-header', AppHeader);

export { AppHeader };