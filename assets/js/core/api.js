// assets/js/core/api.js
/**
 * API Client
 * Handles all backend communication
 */

import { config } from './config.js';

class APIClient {
  constructor(options = {}) {
    this.options = {
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      retries: config.api.retries,
      headers: {
        'Content-Type': 'application/json'
      },
      ...options
    };

    this.token = null;
    this.refreshToken = null;
  }

  /**
   * Set authentication token
   */
  setToken(token, refreshToken = null) {
    this.token = token;
    this.refreshToken = refreshToken;
    
    if (token) {
      localStorage.setItem('auth_token', token);
    }
    
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  /**
   * Get stored token
   */
  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  /**
   * Clear authentication
   */
  clearAuth() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Build full URL
   */
  buildURL(endpoint) {
    const base = this.options.baseURL.replace(/\/$/, '');
    const path = endpoint.replace(/^\//, '');
    return `${base}/${path}`;
  }

  /**
   * Build headers
   */
  buildHeaders(customHeaders = {}) {
    const headers = { ...this.options.headers, ...customHeaders };
    
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Main request method
   */
  async request(endpoint, options = {}) {
    const url = this.buildURL(endpoint);
    const headers = this.buildHeaders(options.headers);

    const requestOptions = {
      method: options.method || 'GET',
      headers,
      ...options
    };

    // Add body if present
    if (options.body && typeof options.body === 'object') {
      requestOptions.body = JSON.stringify(options.body);
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);
    requestOptions.signal = controller.signal;

    try {
      const response = await fetch(url, requestOptions);
      clearTimeout(timeoutId);

      // Handle 401 - try to refresh token
      if (response.status === 401 && this.refreshToken) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry original request
          return this.request(endpoint, options);
        } else {
          this.clearAuth();
          throw new APIError('Authentication failed', 401);
        }
      }

      // Parse response
      const data = await this.parseResponse(response);

      // Check for errors
      if (!response.ok) {
        throw new APIError(
          data.message || data.detail || 'Request failed',
          response.status,
          data
        );
      }

      return data;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new APIError('Request timeout', 408);
      }

      if (error instanceof APIError) {
        throw error;
      }

      throw new APIError(error.message, 0);
    }
  }

  /**
   * Parse response based on content type
   */
  async parseResponse(response) {
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return response.json();
    }

    if (contentType?.includes('text/')) {
      return response.text();
    }

    return response.blob();
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    try {
      const response = await fetch(this.buildURL('/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: this.refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.access_token, data.refresh_token);
        return true;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Retry logic
   */
  async requestWithRetry(endpoint, options = {}, attempt = 1) {
    try {
      return await this.request(endpoint, options);
    } catch (error) {
      if (attempt < this.options.retries && this.shouldRetry(error)) {
        await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        return this.requestWithRetry(endpoint, options, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * Check if error should trigger retry
   */
  shouldRetry(error) {
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    return retryableStatuses.includes(error.status);
  }

  /**
   * Delay helper
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========== HTTP Methods ==========

  async get(endpoint, params = {}, options = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
      ...options
    });
  }

  async post(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body,
      ...options
    });
  }

  async put(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body,
      ...options
    });
  }

  async patch(endpoint, body = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body,
      ...options
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    });
  }

  /**
   * Upload file
   */
  async upload(endpoint, file, fieldName = 'file', additionalData = {}) {
    const formData = new FormData();
    formData.append(fieldName, file);

    // Add additional fields
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  }

  /**
   * Download file
   */
  async download(endpoint, filename = null) {
    const response = await fetch(this.buildURL(endpoint), {
      headers: this.buildHeaders()
    });

    if (!response.ok) {
      throw new APIError('Download failed', response.status);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || this.getFilenameFromResponse(response);
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getFilenameFromResponse(response) {
    const disposition = response.headers.get('content-disposition');
    if (disposition) {
      const match = disposition.match(/filename="?(.+)"?/);
      if (match) return match[1];
    }
    return 'download';
  }
}

/**
 * API Error Class
 */
class APIError extends Error {
  constructor(message, status = 0, data = null) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Create singleton instance
const api = new APIClient();

export { api, APIClient, APIError };