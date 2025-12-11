/**
 * Map Manager Module
 * Handles initialization of jsVectorMap for demographics and location visualization
 * Based on TailAdmin's map-01.js
 */

/**
 * Map Manager Class
 */
class MapManager {
  constructor() {
    this.maps = new Map();
    this.isDarkMode = document.documentElement.classList.contains('dark');
    this.setupDarkModeObserver();
  }

  /**
   * Watch for dark mode changes
   */
  setupDarkModeObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const newDarkMode = document.documentElement.classList.contains('dark');
          if (newDarkMode !== this.isDarkMode) {
            this.isDarkMode = newDarkMode;
            this.updateAllMaps();
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  /**
   * Update all maps when theme changes
   */
  updateAllMaps() {
    // jsVectorMap doesn't have a direct update method for theme
    // We need to recreate the maps with new colors
    this.maps.forEach((mapData, selector) => {
      const element = document.querySelector(selector);
      if (element) {
        element.innerHTML = ''; // Clear existing map
        this.initMap(selector, mapData.config);
      }
    });
  }

  /**
   * Get theme-specific colors
   */
  getThemeColors() {
    return {
      regionFill: this.isDarkMode ? '#4B5563' : '#D9D9D9',
      regionHover: '#465fff',
      markerFill: '#465fff',
      backgroundColor: this.isDarkMode ? 'rgba(255, 255, 255, 0.03)' : '#F9FAFB'
    };
  }

  /**
   * Initialize a map with TailAdmin default configuration
   * Based on map-01.js from TailAdmin
   */
  initMap(selector, config = {}) {
    const element = document.querySelector(selector);
    
    if (!element) {
      console.warn(`Map element not found: ${selector}`);
      return null;
    }

    // Load jsVectorMap if not already loaded
    if (!window.jsVectorMap) {
      console.error('jsVectorMap library not loaded. Import it first.');
      return null;
    }

    const colors = this.getThemeColors();

    // Default configuration based on TailAdmin map-01.js
    const defaultConfig = {
      map: 'world',
      zoomButtons: false,
      regionStyle: {
        initial: {
          fontFamily: 'Outfit, sans-serif',
          fill: colors.regionFill,
        },
        hover: {
          fillOpacity: 1,
          fill: colors.regionHover,
        },
      },
      markers: [
        {
          name: 'United States',
          coords: [37.0902, -95.7129],
        },
        {
          name: 'United Kingdom',
          coords: [55.3781, -3.436],
        },
      ],
      markerStyle: {
        initial: {
          strokeWidth: 1,
          fill: colors.markerFill,
          fillOpacity: 1,
          r: 4,
        },
        hover: {
          fill: colors.markerFill,
          fillOpacity: 1,
        },
        selected: {},
        selectedHover: {},
      },
      onRegionTooltipShow: function(tooltip, code) {
        // Custom tooltip logic can be added here
      }
    };

    // Merge custom config with defaults
    const finalConfig = this.deepMerge(defaultConfig, config);
    finalConfig.selector = selector;

    try {
      // Create map instance
      const map = new window.jsVectorMap(finalConfig);
      
      // Store reference
      this.maps.set(selector, {
        instance: map,
        config: config
      });
      
      return map;
    } catch (error) {
      console.error('Error initializing map:', error);
      return null;
    }
  }

  /**
   * Create TailAdmin Map One (Demographics map)
   * Exact configuration from map-01.js
   */
  createTailAdminMapOne(selector, customConfig = {}) {
    const colors = this.getThemeColors();
    
    const config = {
      map: 'world',
      zoomButtons: false,
      regionStyle: {
        initial: {
          fontFamily: 'Outfit, sans-serif',
          fill: colors.regionFill,
        },
        hover: {
          fillOpacity: 1,
          fill: colors.regionHover,
        },
      },
      markers: [
        {
          name: 'Egypt',
          coords: [26.8206, 30.8025],
        },
        {
          name: 'United Kingdom',
          coords: [55.3781, -3.436],
        },
        {
          name: 'United States',
          coords: [37.0902, -95.7129],
        },
      ],
      markerStyle: {
        initial: {
          strokeWidth: 1,
          fill: colors.markerFill,
          fillOpacity: 1,
          r: 4,
        },
        hover: {
          fill: colors.markerFill,
          fillOpacity: 1,
        },
        selected: {},
        selectedHover: {},
      },
      onRegionTooltipShow: function(tooltip, code) {
        if (code === 'EG') {
          tooltip.selector.innerHTML = tooltip.text() + ' <b>(Hello Russia)</b>';
        }
      },
      ...customConfig
    };

    return this.initMap(selector, config);
  }

  /**
   * Update map markers
   */
  updateMarkers(selector, markers) {
    const mapData = this.maps.get(selector);
    if (mapData && mapData.instance) {
      // jsVectorMap doesn't have direct marker update
      // Need to recreate with new markers
      const newConfig = {
        ...mapData.config,
        markers: markers
      };
      
      const element = document.querySelector(selector);
      if (element) {
        element.innerHTML = '';
        this.initMap(selector, newConfig);
      }
    }
  }

  /**
   * Destroy a map
   */
  destroyMap(selector) {
    const mapData = this.maps.get(selector);
    if (mapData && mapData.instance) {
      const element = document.querySelector(selector);
      if (element) {
        element.innerHTML = '';
      }
      this.maps.delete(selector);
    }
  }

  /**
   * Destroy all maps
   */
  destroyAll() {
    this.maps.forEach((mapData, selector) => {
      this.destroyMap(selector);
    });
    this.maps.clear();
  }

  /**
   * Deep merge utility for configuration objects
   */
  deepMerge(target, source) {
    const output = { ...target };
    
    if (this.isObject(target) && this.isObject(source)) {
      Object.keys(source).forEach(key => {
        if (this.isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = this.deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  }

  /**
   * Check if value is an object
   */
  isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }
}

// Export singleton instance
export const mapManager = new MapManager();