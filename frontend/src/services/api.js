import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request interceptor: attach Bearer token if present
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore storage read errors
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: normalize envelope & errors
api.interceptors.response.use(
  (response) => {
    // When backend returns our standard envelope: { success: true, message, data, timestamp }
    return response.data;
  },
  (error) => {
    const responseData = error.response?.data;
    const status = error.response?.status || 500;
    const requestUrl = error.config?.url || '';

    // If 401 on an authenticated call, dispatch unauthorized event
    if (status === 401 && !requestUrl.includes('/auth/login') && !requestUrl.includes('/auth/register')) {
      if (typeof window !== 'undefined' && typeof window.CustomEvent === 'function') {
        window.dispatchEvent(new window.CustomEvent('auth:unauthorized'));
      }
    }

    let normalizedError = {
      status,
      code: 'NETWORK_ERROR',
      message: 'Network error or server unreachable',
      errors: [],
      path: null,
      raw: error
    };

    if (responseData) {
      if (responseData.error) {
        normalizedError = {
          status: responseData.status || status,
          code: responseData.error.code || 'UNKNOWN_ERROR',
          message: responseData.error.message || responseData.message || 'An error occurred',
          errors: responseData.error.errors || [],
          path: responseData.path || null,
          raw: error
        };
      } else if (responseData.message) {
        normalizedError = {
          status,
          code: responseData.code || 'ERROR',
          message: responseData.message,
          errors: responseData.errors || [],
          path: responseData.path || null,
          raw: error
        };
      }
    } else if (error.message) {
      normalizedError.message = error.message;
    }

    return Promise.reject(normalizedError);
  }
);

/**
 * Helper to unwrap payload data cleanly
 * @param {Promise<{data: T}>} apiPromise
 * @returns {Promise<T>}
 */
export async function unwrap(apiPromise) {
  const response = await apiPromise;
  return response?.data !== undefined ? response.data : response;
}

export default api;
