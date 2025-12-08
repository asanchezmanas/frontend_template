// assets/js/components/base/base-component.js
/**
 * Base Web Component Class
 * All custom components extend from this
 */

class BaseComponent extends HTMLElement {
  constructor() {
    super();
    
    this._isConnected = false;
    this._eventListeners = [];
    this._observers = [];
    this._timeouts = [];
    this._intervals = [];
    
    // Optional shadow DOM
    if (this.constructor.useShadowDOM) {
      this.attachShadow({ mode: 'open' });
    }
  }

  /**
   * Lifecycle: Component connected to DOM
   */
  connectedCallback() {
    if (this._isConnected) return;
    this._isConnected = true;

    try {
      this.beforeMount();
      this.render();
      this.afterMount();
      this.attachEventListeners();
    } catch (error) {
      console.error(`Error in ${this.constructor.name}.connectedCallback:`, error);
      this.handleError(error);
    }
  }

  /**
   * Lifecycle: Component disconnected from DOM
   */
  disconnectedCallback() {
    this._isConnected = false;
    
    try {
      this.beforeUnmount();
      this.cleanup();
    } catch (error) {
      console.error(`Error in ${this.constructor.name}.disconnectedCallback:`, error);
    }
  }

  /**
   * Lifecycle: Attribute changed
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    
    try {
      this.onAttributeChange(name, oldValue, newValue);
      
      // Re-render if needed
      if (this._isConnected && this.constructor.rerenderOnAttributeChange) {
        this.render();
      }
    } catch (error) {
      console.error(`Error in ${this.constructor.name}.attributeChangedCallback:`, error);
    }
  }

  /**
   * Hooks - Override in subclasses
   */
  beforeMount() {}
  afterMount() {}
  beforeUnmount() {}
  onAttributeChange(name, oldValue, newValue) {}
  handleError(error) {}

  /**
   * Render method - Override in subclasses
   */
  render() {
    const template = this.template();
    const root = this.shadowRoot || this;
    root.innerHTML = template;
  }

  /**
   * Template method - Override in subclasses
   */
  template() {
    return '';
  }

  /**
   * Attach event listeners - Override in subclasses
   */
  attachEventListeners() {}

  /**
   * Helper: Add event listener with automatic cleanup
   */
  addEventListener(target, event, handler, options) {
    const element = typeof target === 'string' 
      ? this.querySelector(target) 
      : target;

    if (!element) {
      console.warn(`Element not found: ${target}`);
      return;
    }

    element.addEventListener(event, handler, options);
    
    this._eventListeners.push({
      element,
      event,
      handler,
      options
    });
  }

  /**
   * Helper: Add global event listener
   */
  addGlobalListener(event, handler, options) {
    window.addEventListener(event, handler, options);
    
    this._eventListeners.push({
      element: window,
      event,
      handler,
      options
    });
  }

  /**
   * Helper: Query selector within component
   */
  $(selector) {
    const root = this.shadowRoot || this;
    return root.querySelector(selector);
  }

  /**
   * Helper: Query selector all within component
   */
  $$(selector) {
    const root = this.shadowRoot || this;
    return Array.from(root.querySelectorAll(selector));
  }

  /**
   * Helper: Set timeout with automatic cleanup
   */
  setTimeout(callback, delay) {
    const id = window.setTimeout(callback, delay);
    this._timeouts.push(id);
    return id;
  }

  /**
   * Helper: Set interval with automatic cleanup
   */
  setInterval(callback, delay) {
    const id = window.setInterval(callback, delay);
    this._intervals.push(id);
    return id;
  }

  /**
   * Helper: Create observer with automatic cleanup
   */
  observe(target, callback, options = {}) {
    const observer = new IntersectionObserver(callback, options);
    
    if (target) {
      observer.observe(target);
    }
    
    this._observers.push(observer);
    return observer;
  }

  /**
   * Helper: Emit custom event
   */
  emit(eventName, detail = null, options = {}) {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      composed: true,
      ...options
    });

    this.dispatchEvent(event);
  }

  /**
   * Helper: Get attribute with default value
   */
  getAttr(name, defaultValue = null) {
    return this.hasAttribute(name) 
      ? this.getAttribute(name) 
      : defaultValue;
  }

  /**
   * Helper: Get boolean attribute
   */
  getBoolAttr(name) {
    return this.hasAttribute(name);
  }

  /**
   * Helper: Get numeric attribute
   */
  getNumAttr(name, defaultValue = 0) {
    const value = this.getAttribute(name);
    return value !== null ? Number(value) : defaultValue;
  }

  /**
   * Cleanup all resources
   */
  cleanup() {
    // Remove event listeners
    this._eventListeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    this._eventListeners = [];

    // Clear timeouts
    this._timeouts.forEach(id => clearTimeout(id));
    this._timeouts = [];

    // Clear intervals
    this._intervals.forEach(id => clearInterval(id));
    this._intervals = [];

    // Disconnect observers
    this._observers.forEach(observer => observer.disconnect());
    this._observers = [];
  }

  /**
   * Static: Define observed attributes
   */
  static get observedAttributes() {
    return [];
  }

  /**
   * Static: Use shadow DOM?
   */
  static get useShadowDOM() {
    return false;
  }

  /**
   * Static: Re-render on attribute change?
   */
  static get rerenderOnAttributeChange() {
    return true;
  }
}

export { BaseComponent };