// assets/js/main.js
/**
 * Main entry point
 * No build required - runs directly in browser
 */

import { App } from './core/app.js';

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

async function initApp() {
  try {
    // Create global app instance
    window.app = new App({
      debug: true // Set to false in production
    });
    
    // Wait for app to be ready
    await window.app.ready;
    
    console.log('✅ App ready');
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    
    // Show error to user
    document.body.innerHTML = `
      <div style="padding: 2rem; text-align: center;">
        <h1>Error al cargar la aplicación</h1>
        <p>Por favor, recarga la página</p>
        <button onclick="location.reload()">Recargar</button>
      </div>
    `;
  }
}

// Export for debugging in console
export { initApp };