// assets/js/content/content-manager.js
/**
 * Content Manager
 * Handles multilingual content and translations
 */

class ContentManager {
  constructor() {
    this.languages = {};
    this.currentLanguage = 'es';
    this.fallbackLanguage = 'es';
  }

  /**
   * Register language content
   */
  register(language, content) {
    this.languages[language] = content;
  }

  /**
   * Set current language
   */
  setLanguage(language) {
    if (!this.languages[language]) {
      console.warn(`Language "${language}" not registered`);
      return;
    }

    this.currentLanguage = language;
    localStorage.setItem('language', language);
    document.documentElement.setAttribute('lang', language);

    // Emit event
    if (window.app?.eventBus) {
      window.app.eventBus.emit('language:change', language);
    }
  }

  /**
   * Get current language
   */
  getLanguage() {
    return this.currentLanguage;
  }

  /**
   * Get translation by key path
   */
  t(keyPath, replacements = {}) {
    const keys = keyPath.split('.');
    let value = this.languages[this.currentLanguage];

    // Navigate through nested keys
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        // Try fallback language
        value = this.languages[this.fallbackLanguage];
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            console.warn(`Translation not found: ${keyPath}`);
            return keyPath;
          }
        }
        break;
      }
    }

    // Handle replacements
    if (typeof value === 'string' && Object.keys(replacements).length > 0) {
      return this.replace(value, replacements);
    }

    return value;
  }

  /**
   * Replace placeholders in string
   */
  replace(str, replacements) {
    return str.replace(/\{(\w+)\}/g, (match, key) => {
      return replacements[key] !== undefined ? replacements[key] : match;
    });
  }

  /**
   * Get all content for current language
   */
  getAll() {
    return this.languages[this.currentLanguage] || {};
  }

  /**
   * Check if language is available
   */
  hasLanguage(language) {
    return language in this.languages;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return Object.keys(this.languages);
  }
}

// Create singleton
const content = new ContentManager();

// Shorthand function
const t = (keyPath, replacements) => content.t(keyPath, replacements);

export { content, ContentManager, t };