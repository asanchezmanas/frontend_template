// assets/js/alpine/index.js
/**
 * Alpine.js Store Global
 * Solo para estados simples y temporales
 */

import Alpine from 'alpinejs';

// Estado global compartido
Alpine.store('app', {
  // Sidebar
  sidebarOpen: false,
  sidebarCollapsed: false,
  
  // Dark mode
  darkMode: false,
  
  // UI States
  loaded: false,
  
  init() {
    // Cargar dark mode de localStorage
    this.darkMode = JSON.parse(localStorage.getItem('darkMode') || 'false');
    
    // Detectar preferencia del sistema
    if (!localStorage.getItem('darkMode')) {
      this.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Aplicar dark mode
    this.applyDarkMode();
  },
  
  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    localStorage.setItem('darkMode', JSON.stringify(this.darkMode));
    this.applyDarkMode();
  },
  
  applyDarkMode() {
    if (this.darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
  },
  
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  },
  
  toggleSidebarCollapse() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
});

// Componente: Dropdown
Alpine.data('dropdown', () => ({
  open: false,
  
  toggle() {
    this.open = !this.open;
  },
  
  close() {
    this.open = false;
  }
}));

// Componente: Tabs
Alpine.data('tabs', (defaultTab = 0) => ({
  activeTab: defaultTab,
  
  setTab(index) {
    this.activeTab = index;
  }
}));

// Componente: Modal (simple)
Alpine.data('modal', (initialOpen = false) => ({
  open: initialOpen,
  
  show() {
    this.open = true;
    document.body.style.overflow = 'hidden';
  },
  
  hide() {
    this.open = false;
    document.body.style.overflow = '';
  },
  
  toggle() {
    this.open ? this.hide() : this.show();
  }
}));

// Inicializar Alpine
window.Alpine = Alpine;
Alpine.start();

console.log('✅ Alpine.js initialized');