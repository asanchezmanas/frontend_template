// assets/js/modules/images/image-manager.js
/**
 * Image Manager Class
 * Handles lazy loading, optimization, and progressive loading
 */

class ImageManager {
  constructor(options = {}) {
    this.options = {
      lazyLoad: true,
      rootMargin: '50px',
      threshold: 0.01,
      placeholder: 'blur',
      retries: 3,
      retryDelay: 1000,
      fadeIn: true,
      ...options
    };

    this.observer = null;
    this.images = new Map();
  }

  init() {
    if (!this.options.lazyLoad) return;

    // Create intersection observer
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold
      }
    );

    // Observe all lazy images
    this.observeImages();

    // Watch for dynamically added images
    this.watchDynamicImages();

    console.log('[ImageManager] Initialized');
  }

  observeImages() {
    const images = document.querySelectorAll('img[data-src], img[loading="lazy"]');
    
    images.forEach(img => {
      this.observer.observe(img);
    });

    console.log(`[ImageManager] Observing ${images.length} images`);
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        this.loadImage(img);
        this.observer.unobserve(img);
      }
    });
  }

  async loadImage(img, attempt = 1) {
    const src = img.dataset.src || img.getAttribute('src');
    const srcset = img.dataset.srcset;

    if (!src) return;

    // Check if already loaded
    if (this.images.has(img)) return;

    try {
      // Show placeholder
      if (this.options.placeholder === 'blur') {
        img.style.filter = 'blur(10px)';
      }

      // Create new image to preload
      const tempImg = new Image();
      
      // Set up promise for loading
      const loadPromise = new Promise((resolve, reject) => {
        tempImg.onload = resolve;
        tempImg.onerror = reject;
      });

      // Start loading
      if (srcset) {
        tempImg.srcset = srcset;
      }
      tempImg.src = src;

      // Wait for load
      await loadPromise;

      // Apply to actual image
      img.src = src;
      if (srcset) {
        img.srcset = srcset;
      }

      // Remove data attributes
      delete img.dataset.src;
      delete img.dataset.srcset;

      // Fade in
      if (this.options.fadeIn) {
        img.style.transition = 'opacity 0.3s, filter 0.3s';
        img.style.opacity = '0';
        
        // Force reflow
        img.offsetHeight;
        
        img.style.opacity = '1';
        img.style.filter = 'none';
      } else {
        img.style.filter = 'none';
      }

      // Mark as loaded
      this.images.set(img, { loaded: true, attempts: attempt });
      img.classList.add('is-loaded');

    } catch (error) {
      console.error(`Failed to load image (attempt ${attempt}):`, src, error);

      // Retry
      if (attempt < this.options.retries) {
        await this.delay(this.options.retryDelay);
        return this.loadImage(img, attempt + 1);
      }

      // Show error state
      this.handleImageError(img);
    }
  }

  handleImageError(img) {
    img.classList.add('is-error');
    img.style.filter = 'none';

    // Set fallback placeholder SVG
    const width = img.width || 300;
    const height = img.height || 200;
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" 
              font-family="sans-serif" font-size="14" fill="#9ca3af">
          Image failed to load
        </text>
      </svg>
    `;

    img.src = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  watchDynamicImages() {
    // Watch for new images added to DOM
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            // Check if node itself is an image
            if (node.tagName === 'IMG' && (node.dataset.src || node.loading === 'lazy')) {
              this.observer.observe(node);
            }
            
            // Check for images within node
            const images = node.querySelectorAll?.('img[data-src], img[loading="lazy"]');
            images?.forEach(img => this.observer.observe(img));
          }
        });
      });
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  loadAll() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => this.loadImage(img));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.images.clear();
  }
}

export { ImageManager };