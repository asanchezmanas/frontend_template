// assets/js/core/state-manager.js
/**
 * State Manager
 * Reactive global state management
 */

class StateManager {
  constructor(options = {}) {
    this.options = {
      debug: false,
      persistent: [],
      ...options
    };

    this.state = new Map();
    this.subscribers = new Map();
    this.history = [];
    this.maxHistory = 50;

    // Load persistent state
    this._loadPersistent();
  }

  /**
   * Get state value
   */
  get(key, defaultValue = null) {
    return this.state.has(key) ? this.state.get(key) : defaultValue;
  }

  /**
   * Set state value
   */
  set(key, value) {
    const oldValue = this.state.get(key);
    
    // Don't update if value hasn't changed
    if (oldValue === value) {
      return;
    }

    this.state.set(key, value);

    // Add to history
    this._addToHistory({ key, oldValue, newValue: value });

    // Persist if needed
    if (this.options.persistent.includes(key)) {
      this._persist(key, value);
    }

    // Notify subscribers
    this._notify(key, value, oldValue);

    if (this.options.debug) {
      console.log(`[State] "${key}":`, value);
    }
  }

  /**
   * Subscribe to state changes
   */
  subscribe(key, callback) {
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }

    this.subscribers.get(key).push(callback);

    // Return unsubscribe function
    return () => this.unsubscribe(key, callback);
  }

  /**
   * Unsubscribe from state changes
   */
  unsubscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      return;
    }

    const callbacks = this.subscribers.get(key);
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }

    if (callbacks.length === 0) {
      this.subscribers.delete(key);
    }
  }

  /**
   * Check if key exists
   */
  has(key) {
    return this.state.has(key);
  }

  /**
   * Delete state key
   */
  delete(key) {
    const value = this.state.get(key);
    const deleted = this.state.delete(key);

    if (deleted) {
      this._notify(key, undefined, value);
      
      if (this.options.persistent.includes(key)) {
        localStorage.removeItem(`state:${key}`);
      }
    }

    return deleted;
  }

  /**
   * Clear all state
   */
  clear() {
    this.state.clear();
    this.subscribers.clear();
    this.history = [];

    // Clear persistent state
    this.options.persistent.forEach(key => {
      localStorage.removeItem(`state:${key}`);
    });
  }

  /**
   * Get entire state object
   */
  getAll() {
    return Object.fromEntries(this.state);
  }

  /**
   * Update multiple keys at once
   */
  update(updates) {
    Object.entries(updates).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  /**
   * Get state history
   */
  getHistory(limit = 10) {
    return this.history.slice(-limit);
  }

  /**
   * Notify subscribers
   */
  _notify(key, newValue, oldValue) {
    if (!this.subscribers.has(key)) {
      return;
    }

    this.subscribers.get(key).forEach(callback => {
      try {
        callback(newValue, oldValue);
      } catch (error) {
        console.error(`State: Error in subscriber for "${key}":`, error);
      }
    });
  }

  /**
   * Add to history
   */
  _addToHistory(change) {
    this.history.push({
      ...change,
      timestamp: Date.now()
    });

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
  }

  /**
   * Persist to localStorage
   */
  _persist(key, value) {
    try {
      localStorage.setItem(`state:${key}`, JSON.stringify(value));
    } catch (error) {
      console.error(`Failed to persist state "${key}":`, error);
    }
  }

  /**
   * Load persistent state
   */
  _loadPersistent() {
    this.options.persistent.forEach(key => {
      try {
        const stored = localStorage.getItem(`state:${key}`);
        if (stored !== null) {
          this.state.set(key, JSON.parse(stored));
        }
      } catch (error) {
        console.error(`Failed to load persistent state "${key}":`, error);
      }
    });
  }
}

export { StateManager };