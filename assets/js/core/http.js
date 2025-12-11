/**
 * HTTP Client
 * Wrapper around fetch API with automatic configuration, error handling, and auth
 * 
 * Uses environment configuration from config/env.js
 * Uses page data from page-data.js (CSRF token, user data, etc.)
 */

import config, { httpStatus, timeouts } from '../config/env.js';

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

/**
 * HTTP Client class
 */
class HTTPClient {
  constructor() {
    this.baseURL = config.API_BASE_URL;
    this.timeout = timeouts.API_REQUEST;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get auth token from storage
   */
  getAuthToken() {
    return localStorage.getItem('auth_token');
  }

  /**
   * Set auth token in storage
   */
  setAuthToken(token) {
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Get CSRF token from page data
   */
  getCsrfToken() {
    return window.pageData?.csrfToken || window.__PAGE__?.csrfToken || '';
  }

  /**
   * Build headers with auth if available
   */
  buildHeaders(customHeaders = {}) {
    const headers = { ...this.defaultHeaders, ...customHeaders };
    
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add CSRF token for non-GET requests
    const csrfToken = this.getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    return headers;
  }

  /**
   * Build full URL
   */
  buildURL(endpoint) {
    // If endpoint already includes base URL, return as is
    if (endpoint.startsWith('http')) {
      return endpoint;
    }
    
    // If using config.getUrl()
    if (endpoint.startsWith(this.baseURL)) {
      return endpoint;
    }
    
    // Build full URL
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Handle fetch with timeout
   */
  async fetchWithTimeout(url, options, timeout = this.timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new APIError('Request timeout', 408);
      }
      throw error;
    }
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    // Get response body
    let data = null;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle successful responses
    if (response.ok) {
      return data;
    }

    // Handle error responses
    const message = data?.detail || data?.message || `HTTP ${response.status} error`;
    
    // Handle unauthorized (redirect to login)
    if (response.status === httpStatus.UNAUTHORIZED) {
      this.handleUnauthorized();
    }
    
    throw new APIError(message, response.status, data);
  }

  /**
   * Handle unauthorized errors
   */
  handleUnauthorized() {
    // Clear auth token
    this.setAuthToken(null);
    
    // Emit event for app to handle
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    
    // Log if in debug mode
    if (config.DEBUG) {
      console.warn('⚠️ Unauthorized request - token may be expired');
    }
  }

  /**
   * Log request (only in debug mode)
   */
  logRequest(method, url, options = {}) {
    if (config.DEBUG) {
      console.group(`🌐 ${method} ${url}`);
      if (options.body) {
        console.log('Body:', JSON.parse(options.body));
      }
      if (options.params) {
        console.log('Params:', options.params);
      }
      console.groupEnd();
    }
  }

  /**
   * Generic request method
   */
  async request(method, endpoint, { 
    body = null, 
    headers = {}, 
    params = null,
    timeout = null,
  } = {}) {
    // Build URL with query params
    let url = this.buildURL(endpoint);
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      url += `?${queryString}`;
    }

    // Build request options
    const options = {
      method,
      headers: this.buildHeaders(headers),
    };

    // Add body for POST/PUT/PATCH
    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(body);
    }

    // Log request
    this.logRequest(method, url, { body, params });

    try {
      // Make request
      const response = await this.fetchWithTimeout(
        url, 
        options, 
        timeout || this.timeout
      );
      
      // Handle response
      return await this.handleResponse(response);
    } catch (error) {
      // Re-throw API errors
      if (error instanceof APIError) {
        throw error;
      }
      
      // Handle network errors
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new APIError('Network error - unable to reach server', 0);
      }
      
      // Handle other errors
      throw new APIError(error.message, 0);
    }
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request('GET', endpoint, options);
  }

  /**
   * POST request
   */
  async post(endpoint, body, options = {}) {
    return this.request('POST', endpoint, { ...options, body });
  }

  /**
   * PUT request
   */
  async put(endpoint, body, options = {}) {
    return this.request('PUT', endpoint, { ...options, body });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, body, options = {}) {
    return this.request('PATCH', endpoint, { ...options, body });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request('DELETE', endpoint, options);
  }

  /**
   * Upload file
   */
  async uploadFile(endpoint, file, fieldName = 'file', additionalData = {}) {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    // Add additional fields
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    const url = this.buildURL(endpoint);
    
    // Don't set Content-Type header - browser will set it with boundary
    const headers = {};
    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse(response);
  }
}

/**
 * Create singleton instance
 */
export const http = new HTTPClient();

/**
 * Convenience methods that use config.endpoints
 */
export const api = {
  // Auth
  auth: {
    login: (credentials) => http.post(config.endpoints.auth.login, credentials),
    logout: () => http.post(config.endpoints.auth.logout),
    register: (userData) => http.post(config.endpoints.auth.register, userData),
    refresh: () => http.post(config.endpoints.auth.refresh),
    me: () => http.get(config.endpoints.auth.me),
  },

  // Users
  users: {
    list: (params) => http.get(config.endpoints.users.list, { params }),
    get: (id) => http.get(config.endpoints.users.detail(id)),
    create: (data) => http.post(config.endpoints.users.create, data),
    update: (id, data) => http.put(config.endpoints.users.update(id), data),
    delete: (id) => http.delete(config.endpoints.users.delete(id)),
  },

  // Dashboard
  dashboard: {
    getMetrics: () => http.get(config.endpoints.dashboard.metrics),
    getCharts: (params) => http.get(config.endpoints.dashboard.charts, { params }),
    getRecent: () => http.get(config.endpoints.dashboard.recent),
  },

  // Add your API methods here
  // Example:
  products: {
    list: (params) => http.get(config.endpoints.products.list, { params }),
    get: (id) => http.get(config.endpoints.products.detail(id)),
    search: (query) => http.get(config.endpoints.products.search, { 
      params: { q: query } 
    }),
  },

  orders: {
    list: (params) => http.get(config.endpoints.orders.list, { params }),
    get: (id) => http.get(config.endpoints.orders.detail(id)),
    create: (data) => http.post(config.endpoints.orders.create, data),
  },
};

/**
 * Mock API for development/testing
 */
export const mockAPI = {
  async login(credentials) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      access_token: 'mock_token_12345',
      token_type: 'bearer',
      user: {
        id: 1,
        email: credentials.email,
        name: 'Test User'
      }
    };
  },
  
  async getMetrics() {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      customers: 3782,
      orders: 5359,
      revenue: 45289,
      growth: 23.5
    };
  },
  
  // Add more mock methods as needed
};

/**
 * Use mock API if enabled
 */
if (config.MOCK_API) {
  console.warn('⚠️ Using MOCK API - no real requests will be made');
}

export default http;