const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  getToken() {
    return localStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const token = this.getToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        // If unauthorized, clear token
        if (response.status === 401) {
          localStorage.removeItem('authToken');
        }
        throw new Error(data.error || 'Request failed');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Menu endpoints
  menu = {
    list: () => this.request('/menu'),
    get: (id) => this.request(`/menu/${id}`),
    create: (data) => this.request('/menu', { method: 'POST', body: data }),
    update: (id, data) => this.request(`/menu/${id}`, { method: 'PUT', body: data }),
    delete: (id) => this.request(`/menu/${id}`, { method: 'DELETE' }),
  };

  // Order endpoints
  orders = {
    list: (limit = 50, sort = '-createdAt') => 
      this.request(`/orders?limit=${limit}&sort=${sort}`),
    get: (id) => this.request(`/orders/${id}`),
    create: (data) => this.request('/orders', { method: 'POST', body: data }),
    updateStatus: (id, status) => 
      this.request(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),
    delete: (id) => this.request(`/orders/${id}`, { method: 'DELETE' }),
    getDailyStats: () => this.request('/orders/stats/daily'),
  };

  // Discount endpoints
  discounts = {
    list: () => this.request('/discounts'),
    getActive: () => this.request('/discounts/active'),
    validate: (code, subtotal) => 
      this.request('/discounts/validate', { method: 'POST', body: { code, subtotal } }),
    create: (data) => this.request('/discounts', { method: 'POST', body: data }),
    update: (id, data) => this.request(`/discounts/${id}`, { method: 'PUT', body: data }),
    delete: (id) => this.request(`/discounts/${id}`, { method: 'DELETE' }),
    use: (id) => this.request(`/discounts/${id}/use`, { method: 'POST' }),
  };

  // Auth endpoints
  auth = {
    login: (credentials) => 
      this.request('/auth/login', { method: 'POST', body: credentials }),
    register: (userData) => 
      this.request('/auth/register', { method: 'POST', body: userData }),
    verify: () => this.request('/auth/verify'),
    me: () => this.request('/auth/me'),
    logout: () => this.request('/auth/logout', { method: 'POST' }),
  };
}

export const apiClient = new ApiClient();

