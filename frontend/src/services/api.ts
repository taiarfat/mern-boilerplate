import axios from 'axios';

const API_URL = import.meta.env.VITE_APP_SERVER_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding the auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If the error is due to an expired token, attempt to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call your refresh token endpoint
        const { data } = await axios.post(
          `${API_URL}/auth/refresh_token`,
          {},
          {
            withCredentials: true,
          }
        );

        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
          api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
