// assets/js/core/event-bus.js
/**
 * Event Bus
 * Global pub/sub system for decoupled communication
 */

class EventBus {
  constructor(options = {}) {
    this.options = {
      debug: false,
      maxListeners: 10,
      ...options
    };

    this.events = new Map();
    // ❌ Removido: this.onceEvents = new Map(); (no se usa)
  }

  /**
   * Subscribe to an event
   */
  on(event, callback, context = null) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listeners = this.events.get(event);
    
    // Warn if too many listeners
    if (listeners.length >= this.options.maxListeners) {
      console.warn(`EventBus: Event "${event}" has ${listeners.length} listeners (max: ${this.options.maxListeners})`);
    }

    listeners.push({ callback, context });

    if (this.options.debug) {
      console.log(`[EventBus] Subscribed to "${event}"`);
    }

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to event only once
   */
  once(event, callback, context = null) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    const wrappedCallback = (...args) => {
      callback.apply(context, args);
      this.off(event, wrappedCallback);
    };

    return this.on(event, wrappedCallback, context);
  }

  /**
   * Unsubscribe from an event
   */
  off(event, callback = null) {
    if (!this.events.has(event)) {
      return;
    }

    if (callback === null) {
      // Remove all listeners for this event
      this.events.delete(event);
      if (this.options.debug) {
        console.log(`[EventBus] Removed all listeners for "${event}"`);
      }
      return;
    }

    // Remove specific callback
    const listeners = this.events.get(event);
    const index = listeners.findIndex(listener => listener.callback === callback);
    
    if (index !== -1) {
      listeners.splice(index, 1);
      if (this.options.debug) {
        console.log(`[EventBus] Unsubscribed from "${event}"`);
      }
    }

    // Remove event if no listeners left
    if (listeners.length === 0) {
      this.events.delete(event);
    }
  }

  /**
   * Emit an event
   */
  emit(event, data = null) {
    if (this.options.debug) {
      console.log(`[EventBus] Emit "${event}"`, data);
    }

    if (!this.events.has(event)) {
      return;
    }

    const listeners = this.events.get(event).slice(); // Clone to avoid issues if modified during emit

    listeners.forEach(({ callback, context }) => {
      try {
        callback.call(context, data);
      } catch (error) {
        console.error(`EventBus: Error in listener for "${event}":`, error);
      }
    });
  }

  /**
   * Get listener count for event
   */
  listenerCount(event) {
    return this.events.has(event) ? this.events.get(event).length : 0;
  }

  /**
   * Get all event names
   */
  eventNames() {
    return Array.from(this.events.keys());
  }

  /**
   * Remove all listeners
   */
  removeAllListeners() {
    this.events.clear();
    // ❌ Removido: this.onceEvents.clear(); (no existe)
    
    if (this.options.debug) {
      console.log('[EventBus] Removed all listeners');
    }
  }
}

export { EventBus };