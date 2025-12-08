// assets/js/modules/images/index.js
/**
 * Images Module
 * Lazy loading and image optimization
 */

import { ImageManager } from './image-manager.js';

let instance = null;

export async function init() {
  if (instance) return instance;
  
  instance = new ImageManager({
    lazyLoad: true,
    placeholder: 'blur',
    retries: 3
  });

  instance.init();
  return instance;
}

export { ImageManager };