// assets/js/components/index.js
/**
 * Component Registry
 * Import and register all components
 */

// Import all components
import { AppHeader } from './ui/app-header.js';
import { AppFooter } from './ui/app-footer.js';
import { AppModal } from './ui/app-modal.js';
import { AppToast } from './ui/app-toast.js';

/**
 * Register all components
 */
async function registerComponents() {
  // Components are already registered in their respective files
  // This function exists for explicit loading and potential future logic
  
  console.log('✅ Components registered:', [
    'app-header',
    'app-footer',
    'app-modal',
    'app-toast'
  ]);
}

export { 
  registerComponents,
  AppHeader,
  AppFooter,
  AppModal,
  AppToast
};