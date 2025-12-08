// assets/js/utils/dom.js
/**
 * DOM Utilities
 * Helper functions for DOM manipulation
 */

export const dom = {
  /**
   * Query selector with optional parent
   */
  $(selector, parent = document) {
    return parent.querySelector(selector);
  },

  /**
   * Query selector all with optional parent
   */
  $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  },

  /**
   * Create element with attributes and children
   */
  create(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'dataset') {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else if (key.startsWith('on') && typeof value === 'function') {
        const event = key.substring(2).toLowerCase();
        element.addEventListener(event, value);
      } else {
        element.setAttribute(key, value);
      }
    });

    // Append children
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });

    return element;
  },

  /**
   * Remove element
   */
  remove(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
  },

  /**
   * Empty element
   */
  empty(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  },

  /**
   * Add class
   */
  addClass(element, ...classes) {
    element.classList.add(...classes);
  },

  /**
   * Remove class
   */
  removeClass(element, ...classes) {
    element.classList.remove(...classes);
  },

  /**
   * Toggle class
   */
  toggleClass(element, className) {
    element.classList.toggle(className);
  },

  /**
   * Has class
   */
  hasClass(element, className) {
    return element.classList.contains(className);
  },

  /**
   * Get/Set attribute
   */
  attr(element, name, value) {
    if (value === undefined) {
      return element.getAttribute(name);
    }
    element.setAttribute(name, value);
  },

  /**
   * Remove attribute
   */
  removeAttr(element, name) {
    element.removeAttribute(name);
  },

  /**
   * Get/Set data attribute
   */
  data(element, key, value) {
    if (value === undefined) {
      return element.dataset[key];
    }
    element.dataset[key] = value;
  },

  /**
   * Get/Set text content
   */
  text(element, text) {
    if (text === undefined) {
      return element.textContent;
    }
    element.textContent = text;
  },

  /**
   * Get/Set HTML content
   */
  html(element, html) {
    if (html === undefined) {
      return element.innerHTML;
    }
    element.innerHTML = html;
  },

  /**
   * Show element
   */
  show(element, display = 'block') {
    element.style.display = display;
  },

  /**
   * Hide element
   */
  hide(element) {
    element.style.display = 'none';
  },

  /**
   * Toggle visibility
   */
  toggle(element, display = 'block') {
    element.style.display = element.style.display === 'none' ? display : 'none';
  },

  /**
   * Get element offset
   */
  offset(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.pageYOffset,
      left: rect.left + window.pageXOffset,
      width: rect.width,
      height: rect.height
    };
  },

  /**
   * Scroll to element
   */
  scrollTo(element, options = {}) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      ...options
    });
  },

  /**
   * Check if element is in viewport
   */
  isInViewport(element, offset = 0) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= -offset &&
      rect.left >= -offset &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
    );
  },

  /**
   * Get computed style
   */
  getStyle(element, property) {
    return window.getComputedStyle(element)[property];
  },

  /**
   * Siblings
   */
  siblings(element) {
    return Array.from(element.parentNode.children).filter(child => child !== element);
  },

  /**
   * Next sibling
   */
  next(element) {
    return element.nextElementSibling;
  },

  /**
   * Previous sibling
   */
  prev(element) {
    return element.previousElementSibling;
  },

  /**
   * Closest ancestor matching selector
   */
  closest(element, selector) {
    return element.closest(selector);
  },

  /**
   * Parent
   */
  parent(element) {
    return element.parentElement;
  },

  /**
   * Children
   */
  children(element, selector) {
    if (!selector) return Array.from(element.children);
    return Array.from(element.children).filter(child => child.matches(selector));
  },

  /**
   * Delegate event
   */
  delegate(parent, selector, event, handler) {
    parent.addEventListener(event, (e) => {
      const target = e.target.closest(selector);
      if (target) {
        handler.call(target, e);
      }
    });
  },

  /**
   * Ready
   */
  ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  },

  /**
   * Parse HTML string
   */
  parseHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content.firstChild;
  },

  /**
   * Fade in
   */
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    element.style.transition = `opacity ${duration}ms`;

    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });

    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  },

  /**
   * Fade out
   */
  fadeOut(element, duration = 300) {
    element.style.transition = `opacity ${duration}ms`;
    element.style.opacity = '0';

    return new Promise(resolve => {
      setTimeout(() => {
        element.style.display = 'none';
        resolve();
      }, duration);
    });
  },

  /**
   * Slide down
   */
  slideDown(element, duration = 300) {
    element.style.removeProperty('display');
    let display = window.getComputedStyle(element).display;
    if (display === 'none') display = 'block';
    element.style.display = display;

    const height = element.offsetHeight;
    element.style.overflow = 'hidden';
    element.style.height = '0';
    element.style.transition = `height ${duration}ms`;

    requestAnimationFrame(() => {
      element.style.height = height + 'px';
    });

    return new Promise(resolve => {
      setTimeout(() => {
        element.style.removeProperty('height');
        element.style.removeProperty('overflow');
        element.style.removeProperty('transition');
        resolve();
      }, duration);
    });
  },

  /**
   * Slide up
   */
  slideUp(element, duration = 300) {
    element.style.height = element.offsetHeight + 'px';
    element.style.transition = `height ${duration}ms`;
    element.style.overflow = 'hidden';

    requestAnimationFrame(() => {
      element.style.height = '0';
    });

    return new Promise(resolve => {
      setTimeout(() => {
        element.style.display = 'none';
        element.style.removeProperty('height');
        element.style.removeProperty('overflow');
        element.style.removeProperty('transition');
        resolve();
      }, duration);
    });
  }
};