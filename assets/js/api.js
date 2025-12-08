/**
 * API Client
 * Cliente para hacer requests al backend
 */

const api = {
  /**
   * Make HTTP request
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
   * @param {string} endpoint - API endpoint (sin /api/v1)
   * @param {Object} data - Request body data
   * @param {Object} customHeaders - Custom headers
   * @returns {Promise} Response data
   */
  async request(method, endpoint, data = null, customHeaders = {}) {
    const url = `${config.apiBaseUrl}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...customHeaders
    };
    
    const options = {
      method,
      headers
    };
    
    if (data && method !== 'GET') {
      options.body = JSON.stringify(data);
    }
    
    try {
      const response = await fetch(url, options);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        this.handleUnauthorized();
        throw new Error('No autorizado. Por favor, inicia sesión de nuevo.');
      }
      
      // Parse response
      const responseData = await response.json();
      
      // Check if request was successful
      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || 'Request failed');
      }
      
      return responseData;
      
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  /**
   * GET request
   */
  get(endpoint) {
    return this.request('GET', endpoint);
  },
  
  /**
   * POST request
   */
  post(endpoint, data) {
    return this.request('POST', endpoint, data);
  },
  
  /**
   * PUT request
   */
  put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  },
  
  /**
   * DELETE request
   */
  delete(endpoint) {
    return this.request('DELETE', endpoint);
  },
  
  /**
   * Upload file (multipart/form-data)
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - Form data with file
   * @param {Function} onProgress - Progress callback
   * @returns {Promise} Response data
   */
  async upload(endpoint, formData, onProgress = null) {
    const url = `${config.apiBaseUrl}${endpoint}`;
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      // Progress handler
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            onProgress(percentComplete);
          }
        });
      }
      
      // Success handler
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            reject(new Error('Invalid JSON response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.detail || 'Upload failed'));
          } catch (e) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });
      
      // Error handler
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });
      
      // Abort handler
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });
      
      xhr.open('POST', url);
      
      // Add auth header
      const authHeader = this.getAuthHeader();
      if (authHeader.Authorization) {
        xhr.setRequestHeader('Authorization', authHeader.Authorization);
      }
      
      xhr.send(formData);
    });
  },
  
  /**
   * Get authorization header
   * @returns {Object} Auth header or empty object
   */
  getAuthHeader() {
    const token = storage.get(config.storageKeys.token);
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
  
  /**
   * Handle unauthorized access
   */
  handleUnauthorized() {
    // Clear auth data
    storage.remove(config.storageKeys.token);
    storage.remove(config.storageKeys.user);
    
    // Redirect to login if not already there
    if (!window.location.pathname.includes('login.html')) {
      window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.pathname);
    }
  }
};

/**
 * Specific API endpoints
 * Wrappers para endpoints específicos del backend
 */
const apiEndpoints = {
  // ==================== AUTH ====================
  auth: {
    login: (email, password) => 
      api.post('/auth/login', { email, password }),
    
    signup: (email, password, name) => 
      api.post('/auth/signup', { email, password, name }),
    
    logout: () => 
      api.post('/auth/logout'),
    
    me: () => 
      api.get('/auth/me'),
    
    refreshToken: () => 
      api.post('/auth/refresh')
  },
  
  // ==================== DOCUMENTS ====================
  documents: {
    upload: (file, docType, preserveSections = true, onProgress) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('doc_type', docType);
      formData.append('preserve_sections', preserveSections);
      return api.upload('/documents/upload', formData, onProgress);
    },
    
    list: (page = 1, pageSize = 20, docType = null) => {
      let endpoint = `/documents/list?page=${page}&page_size=${pageSize}`;
      if (docType) endpoint += `&doc_type=${docType}`;
      return api.get(endpoint);
    },
    
    get: (id) => 
      api.get(`/documents/${id}`),
    
    delete: (id) => 
      api.delete(`/documents/${id}`),
    
    download: (id) => 
      api.get(`/documents/${id}/download`),
    
    stats: () => 
      api.get('/documents/stats/summary')
  },
  
  // ==================== GENERATION ====================
  generation: {
    generate: (promptName, variables, useRag = false, options = {}) => 
      api.post('/generation/generate', {
        prompt_name: promptName,
        variables,
        use_rag: useRag,
        ...options
      }),
    
    prompts: () => 
      api.get('/generation/prompts'),
    
    search: (query, topK = 5, docType = null, threshold = 0.7) => 
      api.post('/generation/search', {
        query,
        top_k: topK,
        doc_type: docType,
        similarity_threshold: threshold
      })
  },
  
  // ==================== USER/SETTINGS ====================
  settings: {
    getProfile: () => 
      api.get('/settings/profile'),
    
    updateProfile: (data) => 
      api.put('/settings/profile', data),
    
    getAPIKeys: () => 
      api.get('/settings/api-keys'),
    
    saveAPIKeys: (keys, validate = true) => 
      api.post('/settings/api-keys', { ...keys, validate }),
    
    deleteAPIKeys: () => 
      api.delete('/settings/api-keys')
  },
  
  // ==================== USAGE/BILLING ====================
  usage: {
    get: () => 
      api.get('/usage'),
    
    getSubscription: () => 
      api.get('/billing/subscription'),
    
    createCheckout: (tier) => 
      api.post('/billing/checkout', { tier })
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { api, apiEndpoints };
}